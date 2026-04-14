from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum
from .models import Savings
from .serializers import SavingsSerializer

class SavingsViewSet(viewsets.ModelViewSet):
    serializer_class = SavingsSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Savings.objects.filter(user=self.request.user).order_by('-created_at')

    @action(detail=False, methods=['get'])
    def summary(self, request):
        user = request.user
        savings = Savings.objects.filter(user=user, status='active')
        
        total_saved = savings.aggregate(total=Sum('current_amount'))['total'] or 0
        
        return Response({
            'totalSaved': total_saved,
            'activeGoals': savings.count()
        })
