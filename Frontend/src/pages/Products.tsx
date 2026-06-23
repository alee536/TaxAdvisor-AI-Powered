import { useState, useEffect } from 'react';
import { getProducts, type Product } from '../api/api';
import ProductCard from '../components/ProductCard';

type SortKey = 'price_asc' | 'price_desc' | 'name';

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('price_asc');

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(() => setError('Failed to load products. Please ensure the backend server is running.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = products
    .filter((p) => {
      const q = search.toLowerCase();
      return (
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.best_for.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sort === 'price_asc') return parseFloat(a.price) - parseFloat(b.price);
      if (sort === 'price_desc') return parseFloat(b.price) - parseFloat(a.price);
      return a.name.localeCompare(b.name);
    });

  return (
    <div>
      <div className="page-hero" style={{ padding: '3.5rem 0 3rem' }}>
        <div className="container">
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>Tax Software Products</h1>
          <p style={{ color: '#bfdbfe', fontSize: '1.05rem' }}>
            {products.length > 0 ? `${products.length} products available` : 'All products in one place'}
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="search"
            className="input-field"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: '320px' }}
          />
          <select
            className="input-field"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            style={{ maxWidth: '200px' }}
          >
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name">Name: A-Z</option>
          </select>
          {search && (
            <span style={{ color: '#64748b', fontSize: '0.875rem' }}>
              {filtered.length} result{filtered.length !== 1 ? 's' : ''} for "{search}"
            </span>
          )}
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <div className="loading-spinner" style={{ width: '2.5rem', height: '2.5rem', margin: '0 auto 1rem' }} />
            <p style={{ color: '#64748b' }}>Loading products...</p>
          </div>
        )}

        {error && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.75rem', padding: '1.5rem', textAlign: 'center' }}>
            <p style={{ color: '#b91c1c', fontWeight: 600, marginBottom: '0.25rem' }}>Unable to load products</p>
            <p style={{ color: '#dc2626', fontSize: '0.875rem' }}>{error}</p>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: '#64748b', fontSize: '1.1rem' }}>No products match your search.</p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
