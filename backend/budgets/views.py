from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum
from .models import Budget
from .serializers import BudgetSerializer
from transactions.models import Transaction

class BudgetViewSet(viewsets.ModelViewSet):
    serializer_class = BudgetSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Budget.objects.filter(user=self.request.user)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        user = request.user
        budgets = Budget.objects.filter(user=user)
        
        total_limit = budgets.aggregate(total=Sum('limit'))['total'] or 0
        
        # Calculate total spent across all budgeted categories for the current month
        from django.utils import timezone
        now = timezone.now()
        spent = Transaction.objects.filter(
            user=user, 
            type='expense',
            date__month=now.month,
            date__year=now.year
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        return Response({
            'totalSpent': spent,
            'totalLimit': total_limit
        })
