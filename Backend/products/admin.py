from django.http import JsonResponse
from django.contrib import admin

from .models import Product


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['product_id', 'name', 'price', 'currency', 'best_for']
    list_filter = [
        'supports_expert_help', 'supports_full_service',
        'supports_corporate_filing', 'supports_nil_corporate_return',
    ]
    search_fields = ['name', 'product_id', 'description', 'best_for']
    ordering = ['price']
    readonly_fields = ['supported_features', 'unsupported_features']
    actions = ['export_product_configuration']

    fieldsets = (
        ('Basic Information', {
            'fields': ('product_id', 'name', 'price', 'currency', 'description', 'best_for')
        }),
        ('Feature Summary', {
            'fields': ('supported_features', 'unsupported_features')
        }),
        ('Personal Income', {
            'fields': (
                'supports_salary_income', 'supports_student_income',
                'supports_investment_income', 'supports_capital_gains',
                'supports_foreign_income', 'supports_rental_income',
                'supports_freelance_income', 'supports_gig_work_income',
            )
        }),
        ('Deductions & Expenses', {
            'fields': (
                'supports_medical_expenses', 'supports_donations',
                'supports_employment_expenses', 'supports_business_expenses',
                'supports_home_office_expenses', 'supports_vehicle_expenses',
            )
        }),
        ('Expert Services', {
            'fields': ('supports_expert_help', 'supports_full_service')
        }),
        ('Corporate Filing', {
            'fields': ('supports_corporate_filing', 'supports_nil_corporate_return')
        }),
    )

    @admin.display(description='Supported features')
    def supported_features(self, obj):
        return self._feature_summary(obj, supported=True)

    @admin.display(description='Unsupported features')
    def unsupported_features(self, obj):
        return self._feature_summary(obj, supported=False)

    @staticmethod
    def _feature_summary(obj, supported):
        feature_fields = [
            field for field in Product._meta.fields if field.name.startswith('supports_')
        ]
        labels = [
            field.verbose_name.removeprefix('supports ').capitalize()
            for field in feature_fields
            if getattr(obj, field.name) is supported
        ]
        return ', '.join(labels) or 'None'

    @admin.action(description='Export selected product configuration as JSON')
    def export_product_configuration(self, request, queryset):
        fields = [field.name for field in Product._meta.fields]
        response = JsonResponse(list(queryset.values(*fields)), safe=False, json_dumps_params={'indent': 2})
        response['Content-Disposition'] = 'attachment; filename="taxadvisor-product-config.json"'
        return response
