from django.contrib import admin
from .models import Savings

@admin.register(Savings)
class SavingsAdmin(admin.ModelAdmin):
    list_display = ('goal_name', 'user', 'target_amount', 'current_amount', 'progress', 'status')
    list_filter = ('status',)
    search_fields = ('goal_name', 'user__email')
