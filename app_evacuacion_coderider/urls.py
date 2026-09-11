from django.urls import path
from . import views

urlpatterns = [
    path('', views.evacuacion, name='evacuacion'), # O la vista que tengas para tu inicio
]