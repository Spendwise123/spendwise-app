from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def health_check(request):
    return JsonResponse({
        "status": "online",
        "message": "SpendWise API is live and well!",
        "database": "connected"
    })

urlpatterns = [
    path('api/health/', health_check, name='health_check'),
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/expenses/', include('transactions.urls')),
    path('api/budgets/', include('budgets.urls')),
    path('api/feedback/', include('feedback.urls')),
    path('api/investments/', include('investments.urls')),
    path('api/loans/', include('loans.urls')),
    path('api/savings/', include('savings.urls')),
]
