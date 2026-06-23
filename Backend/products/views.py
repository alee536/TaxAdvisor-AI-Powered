from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .models import Product
from .serializers import ProductSerializer
from .recommendation_engine import get_recommendation
from .assistant_engine import get_assistant_response


FILING_TYPES = {'personal', 'freelancer_self_employed', 'incorporated_company'}
INCOME_SOURCES = {
    'salary_income', 'student_income', 'investment_income', 'capital_gains',
    'rental_income', 'freelance_income', 'gig_work_income', 'business_revenue',
    'foreign_income',
}
DEDUCTIONS = {
    'medical_expenses', 'donations', 'employment_expenses', 'home_office_expenses',
    'vehicle_expenses', 'business_expenses', 'no_deductions',
}
HELP_PREFERENCES = {
    'file_myself', 'expert_help_while_filing', 'expert_file_for_me',
}


@api_view(['GET'])
def product_list(request):
    products = Product.objects.all()
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def recommend(request):
    data = request.data
    errors = {}

    filing_type = data.get('filing_type')
    if filing_type not in FILING_TYPES:
        errors['filing_type'] = 'Choose a valid filing type.'

    income_sources = data.get('income_sources')
    if not isinstance(income_sources, list) or not income_sources:
        errors['income_sources'] = 'Select at least one income source.'
    elif invalid_income := set(income_sources) - INCOME_SOURCES:
        errors['income_sources'] = f'Unsupported income source(s): {", ".join(sorted(invalid_income))}.'

    deductions = data.get('deductions', [])
    if not isinstance(deductions, list):
        errors['deductions'] = 'Deductions must be a list.'
    elif invalid_deductions := set(deductions) - DEDUCTIONS:
        errors['deductions'] = f'Unsupported deduction(s): {", ".join(sorted(invalid_deductions))}.'
    elif 'no_deductions' in deductions and len(deductions) > 1:
        errors['deductions'] = 'No special deductions cannot be combined with other deductions.'

    help_preference = data.get('help_preference')
    if help_preference not in HELP_PREFERENCES:
        errors['help_preference'] = 'Choose a valid help preference.'

    company_revenue = data.get('company_revenue')
    if filing_type == 'incorporated_company' and company_revenue not in {'yes', 'no'}:
        errors['company_revenue'] = 'Choose whether the incorporated company had revenue.'
    elif filing_type != 'incorporated_company' and company_revenue not in {None, ''}:
        errors['company_revenue'] = 'Company revenue applies only to incorporated companies.'

    if errors:
        return Response({'errors': errors}, status=status.HTTP_400_BAD_REQUEST)

    result = get_recommendation(data)
    return Response(result, status=status.HTTP_200_OK)


@api_view(['POST'])
def assistant(request):
    question = request.data.get('question', '').strip()
    if not question:
        return Response(
            {'error': 'Question is required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    conversation_context = request.data.get('conversationContext')
    if conversation_context not in {None, '', 'awaiting_product_topic'}:
        return Response(
            {'error': 'Unsupported conversation context.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    result = get_assistant_response(question, conversation_context or None)
    return Response(result, status=status.HTTP_200_OK)
