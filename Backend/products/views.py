from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.db import models as django_models

from .models import Product
from .serializers import ProductSerializer
from .recommendation_engine import get_recommendation
from .assistant_engine import get_assistant_response


@api_view(['GET'])
def product_list(request):
    products = Product.objects.all()
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def recommend(request):
    data = request.data
    required_fields = ['filing_type', 'income_sources', 'help_preference']
    for field in required_fields:
        if field not in data:
            return Response(
                {'error': f'Missing required field: {field}'},
                status=status.HTTP_400_BAD_REQUEST
            )

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

    result = get_assistant_response(question)
    return Response(result, status=status.HTTP_200_OK)


@api_view(['GET'])
def admin_products(request):
    products = Product.objects.all()
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)
