import { Link } from 'react-router-dom';
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

  return (
    <div className="card fade-in" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      border: featured ? '2px solid #1e40af' : '1px solid #e2e8f0',
      position: 'relative',
    }}>
      {featured && (
        <div style={{
          position: 'absolute',
          top: '-0.75rem',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#1e40af',
          color: '#fff',
          fontSize: '0.7rem',
          fontWeight: 700,
          padding: '0.2rem 0.75rem',
          borderRadius: '9999px',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}>
          Popular
        </div>
      )}

      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>{product.name}</h3>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e40af' }}>
              {price === 0 ? 'Free' : `$${price}`}
            </div>
            {price > 0 && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{product.currency}</div>}
          </div>
        </div>

        <p style={{ fontSize: '0.875rem', color: '#475569', marginBottom: '0.75rem', lineHeight: '1.5' }}>
          {product.description}
        </p>

        <div style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '0.5rem',
          padding: '0.625rem 0.875rem',
          marginBottom: '1rem',
        }}>
          <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, fontWeight: 500 }}>
            <span style={{ color: '#1e40af', marginRight: '0.25rem' }}>Best for:</span>
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
    </div>
  );
}
