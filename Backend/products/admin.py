from django.contrib import admin
from django.contrib.admin import AdminSite
from django.contrib.auth.admin import GroupAdmin, UserAdmin
from django.contrib.auth.models import Group, User
from django.http import JsonResponse
from django.utils.html import format_html, format_html_join

from .models import Product


class TaxAdvisorAdminSite(AdminSite):
    site_header = 'TaxAdvisor Administration'
    site_title = 'TaxAdvisor Admin'
    index_title = 'Product Management Dashboard'
    index_template = 'products/admin/index.html'

    def index(self, request, extra_context=None):
        products = Product.objects.order_by('price')
        extra_context = extra_context or {}
        extra_context.update({
            'dashboard_stats': [
                {'label': 'Configured products', 'value': products.count(), 'detail': 'All recommendation plans'},
                {
                    'label': 'Expert options',
                    'value': products.filter(supports_expert_help=True).count(),
                    'detail': 'Guided or full-service plans',
                },
                {
                    'label': 'Corporate options',
                    'value': products.filter(supports_corporate_filing=True).count(),
                    'detail': 'Company filing support',
                },
                {
                    'label': 'Starting price',
                    'value': 'CAD $0',
                    'detail': 'Free personal return plan',
                },
            ],
            'product_chart_labels': [product.name for product in products],
            'product_chart_prices': [float(product.price) for product in products],
        })
        return super().index(request, extra_context=extra_context)


# Keep Django's conventional "admin" URL namespace so existing admin templates,
# login redirects, and built-in actions continue to work at /admin/.
admin_site = TaxAdvisorAdminSite(name='admin')
admin_site.register(User, UserAdmin)
admin_site.register(Group, GroupAdmin)


@admin.register(Product, site=admin_site)
class ProductAdmin(admin.ModelAdmin):
    list_display = [
        'product_id_badge', 'name', 'price_badge', 'currency', 'plan_type', 'key_capabilities',
    ]
    list_filter = [
        'supports_expert_help', 'supports_full_service',
        'supports_corporate_filing', 'supports_nil_corporate_return',
    ]
    search_fields = ['name', 'product_id', 'description', 'best_for']
    ordering = ['price']
    readonly_fields = ['supported_features', 'unsupported_features']
    actions = ['export_product_configuration']
    list_per_page = 20

    fieldsets = (
        ('Plan overview', {
            'fields': ('product_id', 'name', 'price', 'currency', 'description', 'best_for'),
            'description': 'Core plan information displayed throughout TaxAdvisor.',
        }),
        ('Feature summary', {
            'fields': ('supported_features', 'unsupported_features'),
            'description': 'Automatically derived from the support flags below.',
        }),
        ('Personal income', {
            'classes': ('collapse',),
            'fields': (
                'supports_salary_income', 'supports_student_income',
                'supports_investment_income', 'supports_capital_gains',
                'supports_foreign_income', 'supports_rental_income',
                'supports_freelance_income', 'supports_gig_work_income',
            ),
        }),
        ('Deductions and expenses', {
            'classes': ('collapse',),
            'fields': (
                'supports_medical_expenses', 'supports_donations',
                'supports_employment_expenses', 'supports_business_expenses',
                'supports_home_office_expenses', 'supports_vehicle_expenses',
            ),
        }),
        ('Expert services', {
            'classes': ('collapse',),
            'fields': ('supports_expert_help', 'supports_full_service'),
        }),
        ('Corporate filing', {
            'classes': ('collapse',),
            'fields': ('supports_corporate_filing', 'supports_nil_corporate_return'),
        }),
    )

    @admin.display(description='Product ID', ordering='product_id')
    def product_id_badge(self, obj):
        return format_html('<span class="ta-id-badge">{}</span>', obj.product_id)

    @admin.display(description='Price', ordering='price')
    def price_badge(self, obj):
        price = f'${obj.price:.2f}'
        return format_html('<span class="ta-price-badge">{}</span>', price)

    @admin.display(description='Plan type')
    def plan_type(self, obj):
        if obj.supports_corporate_filing:
            label, class_name = 'Corporate', 'corporate'
        elif obj.supports_full_service:
            label, class_name = 'Full service', 'service'
        elif obj.supports_expert_help:
            label, class_name = 'Expert help', 'expert'
        elif obj.supports_freelance_income:
            label, class_name = 'Self-employed', 'self-employed'
        else:
            label, class_name = 'Personal', 'personal'
        return format_html('<span class="ta-plan-pill ta-plan-{}">{}</span>', class_name, label)

    @admin.display(description='Key capabilities')
    def key_capabilities(self, obj):
        capabilities = [
            ('Salary', obj.supports_salary_income),
            ('Donations', obj.supports_donations),
            ('Investments', obj.supports_investment_income),
            ('Rental', obj.supports_rental_income),
            ('Freelance', obj.supports_freelance_income),
            ('Expert', obj.supports_expert_help),
            ('Corporate', obj.supports_corporate_filing),
        ]
        enabled = [label for label, is_enabled in capabilities if is_enabled]
        return format_html_join('', '<span class="ta-feature-pill">{}</span>', ((label,) for label in enabled))

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
        response = JsonResponse(
            list(queryset.values(*fields)),
            safe=False,
            json_dumps_params={'indent': 2},
        )
        response['Content-Disposition'] = 'attachment; filename="taxadvisor-product-config.json"'
        return response

    class Media:
        css = {'all': ('admin/css/taxadvisor_admin.css',)}
