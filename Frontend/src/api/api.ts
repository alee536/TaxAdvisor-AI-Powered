import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Product {
  id: number;
  product_id: string;
  name: string;
  price: string;
  currency: string;
  description: string;
  best_for: string;
  supports_salary_income: boolean;
  supports_student_income: boolean;
  supports_medical_expenses: boolean;
  supports_donations: boolean;
  supports_employment_expenses: boolean;
  supports_investment_income: boolean;
  supports_capital_gains: boolean;
  supports_foreign_income: boolean;
  supports_rental_income: boolean;
  supports_freelance_income: boolean;
  supports_gig_work_income: boolean;
  supports_business_expenses: boolean;
  supports_home_office_expenses: boolean;
  supports_vehicle_expenses: boolean;
  supports_expert_help: boolean;
  supports_full_service: boolean;
  supports_corporate_filing: boolean;
  supports_nil_corporate_return: boolean;
}

export interface RecommendRequest {
  filing_type: string;
  income_sources: string[];
  deductions: string[];
  help_preference: string;
  company_revenue?: string;
}

export interface RecommendResponse {
  recommendedProductId: string;
  recommendedProductName: string;
  price: number;
  currency: string;
  confidence: string;
  reasons: string[];
  matchedInputs: string[];
  optionalUpgrade: {
    productId: string;
    productName: string;
    reason: string;
  } | null;
  warnings: string[];
  disclaimer: string;
}

export interface AssistantRequest {
  question: string;
}

export interface AssistantResponse {
  answer: string;
  recommendedProduct: string | null;
  confidence: string;
  reasons: string[];
  disclaimer: string;
}

export const getProducts = (): Promise<Product[]> =>
  apiClient.get<Product[]>('/products/').then((r) => r.data);

export const postRecommend = (data: RecommendRequest): Promise<RecommendResponse> =>
  apiClient.post<RecommendResponse>('/recommend/', data).then((r) => r.data);

export const postAssistant = (data: AssistantRequest): Promise<AssistantResponse> =>
  apiClient.post<AssistantResponse>('/assistant/', data).then((r) => r.data);
