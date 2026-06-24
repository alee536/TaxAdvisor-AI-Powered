from django.contrib.auth import get_user_model
from django.test import SimpleTestCase
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from .recommendation_engine import get_recommendation


class RecommendationEngineTests(SimpleTestCase):
    def recommend(self, **overrides):
        answers = {
            'filing_type': 'personal',
            'income_sources': ['salary_income'],
            'deductions': ['no_deductions'],
            'help_preference': 'file_myself',
            'company_revenue': '',
        }
        answers.update(overrides)
        return get_recommendation(answers)

    def test_simple_salary_return_recommends_free(self):
        self.assertEqual(self.recommend()['recommendedProductId'], 'free')

    def test_donations_recommend_deluxe(self):
        result = self.recommend(deductions=['donations'])
        self.assertEqual(result['recommendedProductId'], 'deluxe')

    def test_investment_income_recommends_premier(self):
        result = self.recommend(income_sources=['investment_income'])
        self.assertEqual(result['recommendedProductId'], 'premier')

    def test_self_employment_overrides_investment_income(self):
        result = self.recommend(
            filing_type='freelancer_self_employed',
            income_sources=['investment_income', 'freelance_income'],
        )
        self.assertEqual(result['recommendedProductId'], 'self-employed')

    def test_expert_full_service_overrides_personal_tax_rules(self):
        result = self.recommend(
            income_sources=['investment_income'],
            help_preference='expert_file_for_me',
        )
        self.assertEqual(result['recommendedProductId'], 'expert-full-service')

    def test_corporate_no_revenue_overrides_expert_help(self):
        result = self.recommend(
            filing_type='incorporated_company',
            income_sources=['business_revenue'],
            help_preference='expert_file_for_me',
            company_revenue='no',
        )
        self.assertEqual(result['recommendedProductId'], 'nil-corporate-return')

    def test_corporate_revenue_recommends_business_corporate(self):
        result = self.recommend(
            filing_type='incorporated_company',
            income_sources=['business_revenue'],
            company_revenue='yes',
        )
        self.assertEqual(result['recommendedProductId'], 'business-corporate')


class RecommendationApiValidationTests(APITestCase):
    endpoint = '/api/recommend/'

    def valid_payload(self):
        return {
            'filing_type': 'personal',
            'income_sources': ['salary_income'],
            'deductions': ['no_deductions'],
            'help_preference': 'file_myself',
            'company_revenue': '',
        }

    def test_recommendation_endpoint_returns_structured_result(self):
        response = self.client.post(self.endpoint, self.valid_payload(), format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['recommendedProductId'], 'free')
        self.assertIn('disclaimer', response.data)

    def test_rejects_empty_income_sources(self):
        payload = self.valid_payload()
        payload['income_sources'] = []

        response = self.client.post(self.endpoint, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('income_sources', response.data['errors'])

    def test_rejects_invalid_filing_type(self):
        payload = self.valid_payload()
        payload['filing_type'] = 'unknown'

        response = self.client.post(self.endpoint, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('filing_type', response.data['errors'])

    def test_requires_company_revenue_for_incorporated_company(self):
        payload = self.valid_payload()
        payload.update({
            'filing_type': 'incorporated_company',
            'income_sources': ['business_revenue'],
            'company_revenue': '',
        })

        response = self.client.post(self.endpoint, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('company_revenue', response.data['errors'])

    def test_rejects_conflicting_deductions(self):
        payload = self.valid_payload()
        payload['deductions'] = ['no_deductions', 'donations']

        response = self.client.post(self.endpoint, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('deductions', response.data['errors'])


class AssistantApiSafetyTests(APITestCase):
    endpoint = '/api/assistant/'

    def test_refund_guarantee_request_is_refused_safely(self):
        response = self.client.post(
            self.endpoint,
            {'question': 'Can you guarantee I will get a refund?'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNone(response.data['recommendedProduct'])
        self.assertIn('guarantee', response.data['answer'].lower())
        self.assertEqual(response.data['source'], 'rule-based')

    def test_assistant_requires_a_question(self):
        response = self.client.post(self.endpoint, {'question': '   '}, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_assistant_rejects_unknown_conversation_context(self):
        response = self.client.post(
            self.endpoint,
            {'question': 'yes', 'conversationContext': 'untrusted-context'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_assistant_works_with_an_authenticated_admin_session(self):
        user = get_user_model().objects.create_user('admin-session', password='test-password')
        csrf_enforced_client = APIClient(enforce_csrf_checks=True)
        csrf_enforced_client.force_login(user)

        response = csrf_enforced_client.post(
            self.endpoint,
            {'question': 'Can you guarantee I will get a refund?'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('guarantee', response.data['answer'].lower())
