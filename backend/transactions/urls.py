from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import TransactionViewSet
from . import views

router = SimpleRouter()
router.register(r'', TransactionViewSet, basename='transaction')

urlpatterns = [

    path('testv/', views.services_list, name='services_list'), 
    path('', include(router.urls)),
]

