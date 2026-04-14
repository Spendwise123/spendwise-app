from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum
from .models import Investment
from .serializers import InvestmentSerializer

class InvestmentViewSet(viewsets.ModelViewSet):
    serializer_class = InvestmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Investment.objects.filter(user=self.request.user).order_by('-created_at')

    @action(detail=False, methods=['get'])
    def summary(self, request):
        user = request.user
        investments = Investment.objects.filter(user=user, status='active')
        
        # totalValue = quantity * currentPrice
        # We need to aggregate this. Since it's a field multiplication, we use ExpressionWrapper or just loop if small.
        # But for Postgres/SQLite, we can use Sum(F('quantity') * F('current_price'))
        from django.db.models import F
        total_value = investments.aggregate(total=Sum(F('quantity') * F('current_price')))['total'] or 0
        total_cost = investments.aggregate(total=Sum(F('quantity') * F('purchase_price')))['total'] or 0
        
        return Response({
            'totalValue': total_value,
            'totalProfitLoss': total_value - total_cost,
            'count': investments.count()
        })
