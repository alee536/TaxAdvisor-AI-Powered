from django.urls import path
from . import views

urlpatterns = [
    path('products/', views.product_list, name='product-list'),
    path('recommend/', views.recommend, name='recommend'),
    path('assistant/', views.assistant, name='assistant'),
    path('config/products/', views.admin_products, name='admin-products'),
]
