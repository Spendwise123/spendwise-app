from django.db import models
from django.conf import settings

class Investment(models.Model):
    ASSET_TYPES = [
        ('stocks', 'Stocks'),
        ('crypto', 'Crypto'),
        ('bonds', 'Bonds'),
        ('mutual-funds', 'Mutual Funds'),
        ('real-estate', 'Real Estate'),
    ]
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('sold', 'Sold'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    asset_name = models.CharField(max_length=255)
    asset_type = models.CharField(max_length=50, choices=ASSET_TYPES)
    quantity = models.DecimalField(max_digits=15, decimal_places=4)
    purchase_price = models.DecimalField(max_digits=15, decimal_places=2)
    current_price = models.DecimalField(max_digits=15, decimal_places=2)
    purchase_date = models.DateField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def total_value(self):
        return self.quantity * self.current_price

    @property
    def total_cost(self):
        return self.quantity * self.purchase_price

    @property
    def profit_loss(self):
        return (self.current_price - self.purchase_price) * self.quantity

    def __str__(self):
        return f"{self.asset_name} ({self.asset_type})"
