from django.db import models


class Product(models.Model):
    product_id = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=200)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, default='CAD')
    description = models.TextField()
    best_for = models.TextField()

    supports_salary_income = models.BooleanField(default=False)
    supports_student_income = models.BooleanField(default=False)
    supports_medical_expenses = models.BooleanField(default=False)
    supports_donations = models.BooleanField(default=False)
    supports_employment_expenses = models.BooleanField(default=False)
    supports_investment_income = models.BooleanField(default=False)
    supports_capital_gains = models.BooleanField(default=False)
    supports_foreign_income = models.BooleanField(default=False)
    supports_rental_income = models.BooleanField(default=False)
    supports_freelance_income = models.BooleanField(default=False)
    supports_gig_work_income = models.BooleanField(default=False)
    supports_business_expenses = models.BooleanField(default=False)
    supports_home_office_expenses = models.BooleanField(default=False)
    supports_vehicle_expenses = models.BooleanField(default=False)
    supports_expert_help = models.BooleanField(default=False)
    supports_full_service = models.BooleanField(default=False)
    supports_corporate_filing = models.BooleanField(default=False)
    supports_nil_corporate_return = models.BooleanField(default=False)

    class Meta:
        ordering = ['price']
        verbose_name = 'Product'
        verbose_name_plural = 'Products'

    def __str__(self):
        return f"{self.name} ({self.currency} ${self.price})"
