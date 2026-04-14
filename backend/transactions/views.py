from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Count
from django.utils import timezone
from .models import Transaction
from .serializers import TransactionSerializer
import datetime

class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user).order_by('-date')

    @action(detail=False, methods=['get'])
    def summary(self, request):
        user = request.user
        transactions = Transaction.objects.filter(user=user)
        
        # Total Spending
        total_spending = transactions.filter(type='expense').aggregate(Sum('amount'))['amount__sum'] or 0
        
        # Category Breakdown
        category_breakdown = transactions.filter(type='expense').values('category').annotate(
            amount=Sum('amount'),
            count=Count('id')
        ).order_by('-amount')
        
        # Trajectory (last 30 days)
        today = timezone.now().date()
        start_date = today - datetime.timedelta(days=29)
        daily_spending = transactions.filter(
            type='expense', 
            date__gte=start_date
        ).values('date').annotate(amount=Sum('amount')).order_by('date')
        
        trajectory = []
        cumulative = 0
        spending_map = {item['date']: item['amount'] for item in daily_spending}
        
        for i in range(30):
            curr_date = start_date + datetime.timedelta(days=i)
            amount = float(spending_map.get(curr_date, 0))
            cumulative += amount
            trajectory.append({
                'day': i + 1,
                'date': curr_date.isoformat(),
                'actual': cumulative
            })

        return Response({
            'total_spending': total_spending,
            'category_breakdown': category_breakdown,
            'trajectory': trajectory,
            'count': transactions.count()
        })
