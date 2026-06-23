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

    fieldsets = (
        ('Basic Information', {
            'fields': ('product_id', 'name', 'price', 'currency', 'description', 'best_for')
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
