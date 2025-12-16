from django.contrib import admin
from django import forms
from django.utils.html import format_html
import base64

from .models import FamousPortfolios


class FamousPortfoliosAdminForm(forms.ModelForm):
    """Custom form to allow image upload for FamousPortfolios."""
    image_upload = forms.ImageField(
        required=False,
        label="Upload Image",
        help_text="Upload a PNG/JPG image (will be converted to Base64)"
    )
    
    class Meta:
        model = FamousPortfolios
        fields = '__all__'
    
    def save(self, commit=True):
        instance = super().save(commit=False)
        
        # Handle image upload
        image_file = self.cleaned_data.get('image_upload')
        if image_file:
            # Read and encode to base64
            image_data = image_file.read()
            base64_encoded = base64.b64encode(image_data).decode('utf-8')
            instance.portfolio_img = base64_encoded
        
        if commit:
            instance.save()
            self.save_m2m()  # Save ManyToMany relationships
        return instance


@admin.register(FamousPortfolios)
class FamousPortfoliosAdmin(admin.ModelAdmin):
    form = FamousPortfoliosAdminForm
    list_display = ('portfolio_name', 'stock_count', 'has_image', 'image_preview_small')
    search_fields = ('portfolio_name', 'portfolio_description')
    filter_horizontal = ('stocks',)
    readonly_fields = ('image_preview',)
    
    fieldsets = (
        ('Basic Info', {
            'fields': ('portfolio_name', 'portfolio_description')
        }),
        ('Stocks', {
            'fields': ('stocks',),
            'description': 'Select stocks in this portfolio.'
        }),
        ('Image', {
            'fields': ('image_upload', 'image_preview', 'portfolio_img'),
            'classes': ('collapse',),
            'description': 'Upload an image or paste Base64 encoded data directly.'
        }),
    )
    
    def stock_count(self, obj):
        """Display the number of stocks in the portfolio."""
        return obj.stocks.count()
    stock_count.short_description = "Stocks"
    
    def has_image(self, obj):
        """Display whether the portfolio has an image."""
        return bool(obj.portfolio_img)
    has_image.boolean = True
    has_image.short_description = "Has Image"
    
    def image_preview(self, obj):
        """Display image preview in the edit form."""
        if obj.portfolio_img:
            return format_html(
                '<img src="data:image/png;base64,{}" style="max-width: 128px; max-height: 128px;" />',
                obj.portfolio_img
            )
        return "No image"
    image_preview.short_description = "Current Image"
    
    def image_preview_small(self, obj):
        """Display small image preview in the list view."""
        if obj.portfolio_img:
            return format_html(
                '<img src="data:image/png;base64,{}" style="max-width: 32px; max-height: 32px;" />',
                obj.portfolio_img
            )
        return "-"
    image_preview_small.short_description = "Icon"
