from django.contrib import admin
from django.urls import path, include

admin.site.site_header = 'TaxAdvisor Admin'
admin.site.site_title = 'TaxAdvisor'
admin.site.index_title = 'Product Management'

urlpatterns = [
    path('api/admin/', admin.site.urls),
    path('api/', include('products.urls')),
]
