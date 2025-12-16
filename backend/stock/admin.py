from django.contrib import admin
from django.shortcuts import render, redirect
from django.urls import path
from django.contrib import messages
from django import forms
from django.utils.html import format_html
import csv
import io
import base64
import zipfile

from .models import Stock, WatchList


class ZipImportForm(forms.Form):
    """Form for uploading ZIP file with stock data and images."""
    zip_file = forms.FileField(
        label="ZIP File",
        help_text="Upload a ZIP file containing stocks.csv and image files (e.g., AAPL.png)"
    )


class StockAdminForm(forms.ModelForm):
    """Custom form to allow image upload for Stock."""
    image_upload = forms.ImageField(
        required=False,
        label="Upload Image",
        help_text="Upload a PNG/JPG image (will be converted to Base64)"
    )
    
    class Meta:
        model = Stock
        fields = '__all__'
    
    def save(self, commit=True):
        instance = super().save(commit=False)
        
        # Handle image upload
        image_file = self.cleaned_data.get('image_upload')
        if image_file:
            # Read and encode to base64
            image_data = image_file.read()
            base64_encoded = base64.b64encode(image_data).decode('utf-8')
            instance.stock_img = base64_encoded
        
        if commit:
            instance.save()
        return instance


@admin.register(Stock)
class StockAdmin(admin.ModelAdmin):
    form = StockAdminForm
    list_display = ('stock_symbol', 'stock_name', 'has_image', 'image_preview_small')
    list_filter = ('stock_symbol',)
    search_fields = ('stock_name', 'stock_symbol')
    ordering = ('stock_symbol',)
    readonly_fields = ('image_preview',)
    
    fieldsets = (
        ('Basic Info', {
            'fields': ('stock_symbol', 'stock_name')
        }),
        ('Image', {
            'fields': ('image_upload', 'image_preview', 'stock_img'),
            'classes': ('collapse',),
            'description': 'Upload an image or paste Base64 encoded data directly.'
        }),
    )
    
    def image_preview(self, obj):
        """Display image preview in the edit form."""
        if obj.stock_img:
            return format_html(
                '<img src="data:image/png;base64,{}" style="max-width: 128px; max-height: 128px;" />',
                obj.stock_img
            )
        return "No image"
    image_preview.short_description = "Current Image"
    
    def image_preview_small(self, obj):
        """Display small image preview in the list view."""
        if obj.stock_img:
            return format_html(
                '<img src="data:image/png;base64,{}" style="max-width: 32px; max-height: 32px;" />',
                obj.stock_img
            )
        return "-"
    image_preview_small.short_description = "Icon"
    
    change_list_template = "admin/stock/stock_changelist.html"
    
    def has_image(self, obj):
        """Display whether the stock has an image."""
        return bool(obj.stock_img)
    has_image.boolean = True
    has_image.short_description = "Has Image"
    
    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('import-zip/', self.admin_site.admin_view(self.import_zip), name='stock_stock_import_zip'),
        ]
        return custom_urls + urls
    
    def import_zip(self, request):
        """Handle ZIP import for bulk stock creation with images."""
        if request.method == "POST":
            form = ZipImportForm(request.POST, request.FILES)
            if form.is_valid():
                zip_file = request.FILES["zip_file"]
                
                # Check file extension
                if not zip_file.name.endswith('.zip'):
                    messages.error(request, "Please upload a ZIP file")
                    return redirect("..")
                
                try:
                    created_count = 0
                    updated_count = 0
                    image_count = 0
                    error_rows = []
                    
                    with zipfile.ZipFile(zip_file, 'r') as zf:
                        # Find CSV file
                        csv_filename = None
                        for name in zf.namelist():
                            if name.endswith('.csv') and not name.startswith('__MACOSX'):
                                csv_filename = name
                                break
                        
                        if not csv_filename:
                            messages.error(request, "No CSV file found in ZIP")
                            return redirect("..")
                        
                        # Build image mapping (symbol -> image data)
                        images = {}
                        for name in zf.namelist():
                            if name.startswith('__MACOSX'):
                                continue
                            lower_name = name.lower()
                            if lower_name.endswith(('.png', '.jpg', '.jpeg', '.gif', '.webp')):
                                # Extract symbol from filename
                                basename = name.split('/')[-1]  # Handle nested folders
                                symbol = basename.rsplit('.', 1)[0].upper()
                                images[symbol] = zf.read(name)
                        
                        # Read CSV
                        csv_content = zf.read(csv_filename).decode('utf-8')
                        reader = csv.reader(io.StringIO(csv_content))
                        
                        for row_num, row in enumerate(reader, start=1):
                            # Skip empty rows
                            if not row or all(cell.strip() == '' for cell in row):
                                continue
                            
                            # Skip header row if present
                            if row_num == 1 and row[0].lower() in ['symbol', 'stock_symbol']:
                                continue
                            
                            try:
                                if len(row) >= 2:
                                    stock_symbol = row[0].strip().upper()
                                    stock_name = row[1].strip()
                                elif len(row) == 1:
                                    stock_symbol = row[0].strip().upper()
                                    stock_name = stock_symbol
                                else:
                                    error_rows.append(f"Row {row_num}: Invalid format")
                                    continue
                                
                                if not stock_symbol:
                                    error_rows.append(f"Row {row_num}: Stock symbol cannot be empty")
                                    continue
                                
                                # Prepare defaults
                                defaults = {'stock_name': stock_name}
                                
                                # Add image if available
                                if stock_symbol in images:
                                    base64_img = base64.b64encode(images[stock_symbol]).decode('utf-8')
                                    defaults['stock_img'] = base64_img
                                    image_count += 1
                                
                                # Create or update stock
                                stock, created = Stock.objects.update_or_create(
                                    stock_symbol=stock_symbol,
                                    defaults=defaults
                                )
                                
                                if created:
                                    created_count += 1
                                else:
                                    updated_count += 1
                                    
                            except Exception as e:
                                error_rows.append(f"Row {row_num}: {str(e)}")
                    
                    # Show result messages
                    if created_count > 0:
                        messages.success(request, f"Successfully created {created_count} stock(s)")
                    if updated_count > 0:
                        messages.info(request, f"Updated {updated_count} existing stock(s)")
                    if image_count > 0:
                        messages.success(request, f"Imported {image_count} image(s)")
                    if error_rows:
                        messages.warning(request, f"{len(error_rows)} error(s): {'; '.join(error_rows[:5])}")
                    
                except zipfile.BadZipFile:
                    messages.error(request, "Invalid ZIP file")
                except Exception as e:
                    messages.error(request, f"Error processing file: {str(e)}")
                
                return redirect("..")
        else:
            form = ZipImportForm()
        
        context = {
            'form': form,
            'title': 'Import Stocks with Images',
            'opts': self.model._meta,
        }
        return render(request, "admin/stock/zip_import.html", context)


@admin.register(WatchList)
class WatchListAdmin(admin.ModelAdmin):
    list_display = ('user', 'stock_count')
    search_fields = ('user__username', 'user__email')
    filter_horizontal = ('stocks',)
    
    def stock_count(self, obj):
        return obj.stocks.count()
    stock_count.short_description = "Stocks"
