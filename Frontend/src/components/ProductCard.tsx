import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import type { Product } from '../api/api';

interface Props {
  product: Product;
  featured?: boolean;
}

const FEATURE_LABELS: [keyof Product, string][] = [
  ['supports_salary_income', 'Salary income'],
  ['supports_investment_income', 'Investment income'],
  ['supports_rental_income', 'Rental income'],
  ['supports_freelance_income', 'Freelance income'],
  ['supports_medical_expenses', 'Medical expenses'],
  ['supports_donations', 'Donations'],
  ['supports_business_expenses', 'Business expenses'],
  ['supports_expert_help', 'Expert help'],
  ['supports_full_service', 'Full service'],
  ['supports_corporate_filing', 'Corporate filing'],
];

export default function ProductCard({ product, featured = false }: Props) {
  const price = parseFloat(product.price);
  const supportedFeatures = FEATURE_LABELS.filter(([key]) => product[key] === true);
  const showFeatures = supportedFeatures.slice(0, 4);
  const reduceMotion = useReducedMotion();
  const isPopular = featured || product.name.toLowerCase().includes('deluxe');

  return (
    <motion.div
      className={`fade-in relative flex h-full flex-col rounded-2xl border-2 bg-white p-6 pt-8 shadow-sm ${
        isPopular ? 'border-emerald-500' : 'border-slate-200'
      }`}
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: reduceMotion ? 0 : 0.35 }}
      style={{
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
      }}
      whileHover={reduceMotion ? undefined : { y: -4 }}
    >
      {isPopular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-emerald-500 px-4 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-md">
          Most Popular
        </span>
      )}

      <div style={{ marginBottom: '1rem' }}>
        <div className="flex items-start justify-between" style={{ marginBottom: '0.5rem' }}>
          <h3 className="font-heading text-xl font-bold text-slate-900" style={{ margin: 0 }}>{product.name}</h3>
          <div className="text-right">
            <span className="text-2xl font-bold text-emerald-600">
              {price === 0 ? 'Free' : `$${price}`}
            </span>
            {price > 0 && product.currency && (
              <div className="text-xs text-slate-500">{product.currency}</div>
            )}
          </div>
        </div>

        <p style={{ fontSize: '0.875rem', color: 'var(--color-body-text)', marginBottom: '0.75rem', lineHeight: '1.5' }}>
          {product.description}
        </p>

        <div style={{
          backgroundColor: '#f8fafc',
          border: '1px solid var(--color-card-border)',
          borderRadius: '0.5rem',
          padding: '0.625rem 0.875rem',
          marginBottom: '1rem',
        }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-body-text)', margin: 0, fontWeight: 500 }}>
            <span style={{ color: 'var(--color-accent)', marginRight: '0.25rem' }}>Best for:</span>
            {product.best_for}
          </p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {showFeatures.map(([, label]) => (
            <span key={label} className="badge badge-success">{label}</span>
          ))}
          {supportedFeatures.length > 4 && (
            <span className="badge" style={{ backgroundColor: '#f1f5f9', color: '#64748b' }}>
              +{supportedFeatures.length - 4} more
            </span>
          )}
        </div>
      </div>

      <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem' }}>
        <Link
          to="/recommend"
          className="btn-primary"
          style={{ flex: 1, textAlign: 'center' }}
        >
          Get Recommendation
        </Link>
        <Link
          to="/compare"
          className="btn-outline"
          style={{ padding: '0.625rem 0.875rem' }}
        >
          Compare
        </Link>
      </div>
    </motion.div>
  );
}
