from rest_framework import serializers
from .models import Investment

class InvestmentSerializer(serializers.ModelSerializer):
    total_value = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)
    total_cost = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)
    profit_loss = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)

    class Meta:
        model = Investment
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'updated_at')

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
