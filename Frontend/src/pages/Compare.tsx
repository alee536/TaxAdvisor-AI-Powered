import { useState, useEffect } from 'react';
import { getProducts, type Product } from '../api/api';
import ComparisonTable from '../components/ComparisonTable';

export default function Compare() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getProducts()
      .then((data) => {
        setAllProducts(data);
        const defaultIds = new Set(data.slice(0, 4).map((p) => p.id));
        setSelected(defaultIds);
      })
      .catch(() => setError('Failed to load products. Please ensure the backend server is running.'))
      .finally(() => setLoading(false));
  }, []);

  function toggleProduct(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  const compareProducts = allProducts.filter((p) => selected.has(p.id));

  return (
    <div>
      <div className="page-hero" style={{ padding: '3.5rem 0 3rem' }}>
        <div className="container">
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>Compare Products</h1>
          <p style={{ color: '#bfdbfe', fontSize: '1.05rem' }}>Side-by-side feature comparison across all products</p>
        </div>
      </div>

      <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <div className="loading-spinner" style={{ width: '2.5rem', height: '2.5rem', margin: '0 auto 1rem' }} />
            <p style={{ color: '#64748b' }}>Loading comparison data...</p>
          </div>
        )}

        {error && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.75rem', padding: '1.5rem', textAlign: 'center' }}>
            <p style={{ color: '#b91c1c', fontWeight: 600 }}>Unable to load products</p>
            <p style={{ color: '#dc2626', fontSize: '0.875rem' }}>{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontWeight: 600, color: '#374151', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                Select products to compare:
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {allProducts.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => toggleProduct(p.id)}
                    style={{
                      padding: '0.4rem 0.875rem',
                      borderRadius: '9999px',
                      border: `2px solid ${selected.has(p.id) ? '#1e40af' : '#e2e8f0'}`,
                      backgroundColor: selected.has(p.id) ? '#eff6ff' : '#fff',
                      color: selected.has(p.id) ? '#1e40af' : '#64748b',
                      fontWeight: selected.has(p.id) ? 600 : 400,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {compareProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                Select at least one product to compare.
              </div>
            ) : (
              <ComparisonTable products={compareProducts} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
