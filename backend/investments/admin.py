from django.contrib import admin
from .models import Investment

@admin.register(Investment)
class InvestmentAdmin(admin.ModelAdmin):
    list_display = ('asset_name', 'asset_type', 'user', 'quantity', 'current_price', 'total_value', 'status')
    list_filter = ('asset_type', 'status')
    search_fields = ('asset_name', 'user__email')
