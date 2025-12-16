# Generated migration for EmailVerificationCode updates

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('webauthn', '0001_initial'),
    ]

    operations = [
        # Add is_used field to EmailVerificationCode
        migrations.AddField(
            model_name='emailverificationcode',
            name='is_used',
            field=models.BooleanField(
                default=False,
                help_text='Whether this code has been used for registration',
                verbose_name='Is Used',
            ),
        ),
        # Update EmailVerificationCode field attributes
        migrations.AlterField(
            model_name='emailverificationcode',
            name='email',
            field=models.EmailField(
                help_text='The email address to verify',
                max_length=254,
                verbose_name='Email Address',
            ),
        ),
        migrations.AlterField(
            model_name='emailverificationcode',
            name='code',
            field=models.CharField(
                help_text='6-digit verification code',
                max_length=6,
                verbose_name='Verification Code',
            ),
        ),
        migrations.AlterField(
            model_name='emailverificationcode',
            name='created_at',
            field=models.DateTimeField(
                auto_now_add=True,
                verbose_name='Created At',
            ),
        ),
        # Update model options
        migrations.AlterModelOptions(
            name='emailverificationcode',
            options={
                'ordering': ['-created_at'],
                'verbose_name': 'Email Verification Code',
                'verbose_name_plural': 'Email Verification Codes',
            },
        ),
        # Create UserProfile model
        migrations.CreateModel(
            name='UserProfile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('user_profile_img', models.TextField(
                    blank=True,
                    help_text="Base64 encoded PNG of the user's 128*128 avatar. No data-URI prefix.",
                    null=True,
                    verbose_name='avatar (Base64)',
                )),
                ('user', models.OneToOneField(
                    on_delete=django.db.models.deletion.CASCADE,
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={
                'verbose_name': 'User Profile',
                'verbose_name_plural': 'User Profiles',
            },
        ),
    ]
