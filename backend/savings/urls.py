from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import SavingsViewSet

router = SimpleRouter()
router.register(r'', SavingsViewSet, basename='savings')

urlpatterns = [
    path('', include(router.urls)),
]
