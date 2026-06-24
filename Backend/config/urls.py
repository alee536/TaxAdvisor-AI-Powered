from django.urls import path, include

from products.admin import admin_site

urlpatterns = [
    path('admin/', admin_site.urls),
    path('api/', include('products.urls')),
]
