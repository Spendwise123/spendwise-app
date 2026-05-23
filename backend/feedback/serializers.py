from rest_framework import serializers
from .models import Feedback
from transactions.serializers import TransactionSerializer

class FeedbackSerializer(serializers.ModelSerializer):
    transaction_details = TransactionSerializer(source='transaction', read_only=True)

    class Meta:
        model = Feedback
        fields = ['id', 'user', 'transaction', 'transaction_details',
                  'suggested_category', 'confirmed_category', 'is_confirmed', 'created_at']
        read_only_fields = ('user', 'created_at', 'transaction_details')

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
