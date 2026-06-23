import { useState, useEffect } from 'react';
import { getAdminProducts, type Product } from '../api/api';

const FEATURE_KEYS: { key: keyof Product; label: string }[] = [
  { key: 'supports_salary_income', label: 'Salary income' },
  { key: 'supports_student_income', label: 'Student income' },
  { key: 'supports_medical_expenses', label: 'Medical expenses' },
  { key: 'supports_donations', label: 'Donations' },
  { key: 'supports_employment_expenses', label: 'Employment expenses' },
  { key: 'supports_investment_income', label: 'Investment income' },
  { key: 'supports_capital_gains', label: 'Capital gains' },
  { key: 'supports_foreign_income', label: 'Foreign income' },
  { key: 'supports_rental_income', label: 'Rental income' },
  { key: 'supports_freelance_income', label: 'Freelance income' },
  { key: 'supports_gig_work_income', label: 'Gig-work income' },
  { key: 'supports_business_expenses', label: 'Business expenses' },
  { key: 'supports_home_office_expenses', label: 'Home-office expenses' },
  { key: 'supports_vehicle_expenses', label: 'Vehicle expenses' },
  { key: 'supports_expert_help', label: 'Expert help' },
  { key: 'supports_full_service', label: 'Full service' },
  { key: 'supports_corporate_filing', label: 'Corporate filing' },
  { key: 'supports_nil_corporate_return', label: 'Nil corporate return' },
];

function FeatureBadge({ supported, label }: { supported: boolean; label: string }) {
  return (
    <span className={`badge ${supported ? 'badge-success' : 'badge-danger'}`}>
      {supported ? '✓' : '✗'} {label}
    </span>
  );
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    getAdminProducts()
      .then(setProducts)
      .catch(() => setError('Failed to load products. Please ensure the backend server is running.'))
      .finally(() => setLoading(false));
  }, []);

  function exportJson() {
    const blob = new Blob([JSON.stringify(products, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products-config.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="page-hero" style={{ padding: '3.5rem 0 3rem' }}>
        <div className="container">
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>Product Configuration</h1>
          <p style={{ color: '#bfdbfe', fontSize: '1.05rem' }}>Read-only view of all product settings pulled from the Django API</p>
        </div>
      </div>

      <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <div className="loading-spinner" style={{ width: '2.5rem', height: '2.5rem', margin: '0 auto 1rem' }} />
            <p style={{ color: '#64748b' }}>Loading product configuration...</p>
          </div>
        )}

        {error && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.75rem', padding: '1.5rem', textAlign: 'center' }}>
            <p style={{ color: '#b91c1c', fontWeight: 600 }}>Unable to load configuration</p>
            <p style={{ color: '#dc2626', fontSize: '0.875rem' }}>{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>
                  {products.length} products configured. For full CRUD management, use{' '}
                  <a href="/api/admin/" target="_blank" rel="noopener noreferrer" style={{ color: '#1e40af', fontWeight: 500 }}>
                    Django Admin
                  </a>.
                </p>
              </div>
              <button onClick={exportJson} className="btn-outline" style={{ fontSize: '0.85rem' }}>
                Export JSON
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {products.map((p) => (
                <div key={p.id} className="card" style={{ padding: '1.25rem 1.5rem' }}>
                  <div
                    onClick={() => setExpanded(expanded === p.id ? null : p.id)}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', gap: '1rem' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.25rem' }}>
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'monospace', backgroundColor: '#f1f5f9', padding: '0.1rem 0.4rem', borderRadius: '0.25rem' }}>
                            {p.product_id}
                          </span>
                          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{p.name}</h3>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>{p.best_for}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                      <span style={{ fontWeight: 800, color: '#1e40af', fontSize: '1.1rem' }}>
                        {parseFloat(p.price) === 0 ? 'Free' : `${p.currency} $${parseFloat(p.price)}`}
                      </span>
                      <span style={{ color: '#94a3b8', fontSize: '1.1rem', transform: expanded === p.id ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>▶</span>
                    </div>
                  </div>

                  {expanded === p.id && (
                    <div className="fade-in" style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid #f1f5f9' }}>
                      <p style={{ color: '#374151', fontSize: '0.875rem', marginBottom: '1rem', lineHeight: 1.6 }}>{p.description}</p>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                        <div>
                          <p style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.625rem' }}>
                            Supported Features
                          </p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                            {FEATURE_KEYS.filter(({ key }) => p[key] === true).map(({ label }) => (
                              <FeatureBadge key={label} supported={true} label={label} />
                            ))}
                            {FEATURE_KEYS.filter(({ key }) => p[key] === true).length === 0 && (
                              <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>None</span>
                            )}
                          </div>
                        </div>
                        <div>
                          <p style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.625rem' }}>
                            Not Supported
                          </p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                            {FEATURE_KEYS.filter(({ key }) => p[key] === false).map(({ label }) => (
                              <FeatureBadge key={label} supported={false} label={label} />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
