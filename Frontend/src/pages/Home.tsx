import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, type Product } from '../api/api';
import ProductCard from '../components/ProductCard';

const HOW_IT_WORKS = [
  {
    step: '1',
    title: 'Answer a few questions',
    desc: 'Tell us about your filing type, income sources, deductions, and how much help you want.',
  },
  {
    step: '2',
    title: 'Get your recommendation',
    desc: 'Our rule-based engine matches your situation to the most suitable tax software product.',
  },
  {
    step: '3',
    title: 'File with confidence',
    desc: 'Start with the recommended product or explore all options to find your perfect fit.',
  },
];

const FAQS = [
  {
    q: 'Is TaxAdvisor free to use?',
    a: 'Yes. The recommendation tool is completely free. The tax software products themselves have their own pricing — starting at $0 for the Free tier.',
  },
  {
    q: 'What if my situation changes after I get a recommendation?',
    a: 'You can restart the wizard at any time and get a new recommendation based on your updated situation.',
  },
  {
    q: 'Can I use the AI assistant instead of the wizard?',
    a: 'Yes. The AI assistant can answer product-related questions in natural language. For the most accurate recommendation, we suggest using the step-by-step wizard.',
  },
  {
    q: 'Does TaxAdvisor provide tax advice?',
    a: 'No. TaxAdvisor provides product selection guidance only. For tax, legal, or financial advice, please consult a qualified tax professional.',
  },
  {
    q: 'Which products support corporate filing?',
    a: 'Business Corporate and Nil Corporate Return are designed for incorporated companies. All other products cover personal tax situations.',
  },
];

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    getProducts()
      .then((data) => setProducts(data.slice(0, 3)))
      .catch(() => {});
  }, []);

  return (
    <div>
      <section className="page-hero">
        <div className="container">
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <span style={{
              display: 'inline-block',
              backgroundColor: 'rgba(255,255,255,0.15)',
              color: '#bfdbfe',
              fontSize: '0.8rem',
              fontWeight: 600,
              padding: '0.3rem 0.875rem',
              borderRadius: '9999px',
              marginBottom: '1.25rem',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}>
              AI-Powered Recommendation
            </span>
            <h1 style={{ fontSize: '3rem', fontWeight: 900, color: '#fff', marginBottom: '1.25rem', lineHeight: 1.15 }}>
              Find the right tax software for your situation
            </h1>
            <p style={{ fontSize: '1.2rem', color: '#bfdbfe', marginBottom: '2.5rem', lineHeight: 1.6 }}>
              Answer a few simple questions and our intelligent recommendation engine will match you to the exact product you need — no guesswork required.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/recommend" className="btn-primary" style={{ fontSize: '1rem', padding: '0.75rem 2rem', backgroundColor: '#fff', color: '#1e40af' }}>
                Find My Product
              </Link>
              <Link to="/compare" className="btn-secondary" style={{ fontSize: '1rem', padding: '0.75rem 2rem', borderColor: 'rgba(255,255,255,0.4)', color: '#fff', backgroundColor: 'transparent' }}>
                Compare Products
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '5rem 0', backgroundColor: '#f8fafc' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 className="section-title">How it works</h2>
            <p className="section-subtitle">Three simple steps to find your ideal tax product</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem' }}>
            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} style={{ textAlign: 'center' }}>
                <div style={{
                  width: '3.5rem',
                  height: '3.5rem',
                  borderRadius: '50%',
                  backgroundColor: '#1e40af',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  margin: '0 auto 1.25rem',
                }}>{item.step}</div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{item.title}</h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {products.length > 0 && (
        <section style={{ padding: '5rem 0', backgroundColor: '#fff' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h2 className="section-title">Our Products</h2>
              <p className="section-subtitle">Flexible options to fit every tax situation</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
              {products.map((p, i) => <ProductCard key={p.id} product={p} featured={i === 1} />)}
            </div>
            <div style={{ textAlign: 'center' }}>
              <Link to="/products" className="btn-secondary">View All 8 Products</Link>
            </div>
          </div>
        </section>
      )}

      <section style={{ padding: '5rem 0', backgroundColor: '#f8fafc' }}>
        <div className="container" style={{ maxWidth: '720px' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 className="section-title">Frequently Asked Questions</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {FAQS.map((faq, i) => (
              <div key={i} style={{
                backgroundColor: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '0.75rem',
                overflow: 'hidden',
              }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '1.125rem 1.5rem',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1rem',
                  }}
                >
                  <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9375rem' }}>{faq.q}</span>
                  <span style={{
                    color: '#1e40af',
                    fontSize: '1.25rem',
                    fontWeight: 300,
                    flexShrink: 0,
                    transform: openFaq === i ? 'rotate(45deg)' : 'none',
                    transition: 'transform 0.2s',
                  }}>+</span>
                </button>
                {openFaq === i && (
                  <div style={{ padding: '0 1.5rem 1.125rem', borderTop: '1px solid #f1f5f9' }}>
                    <p style={{ color: '#475569', fontSize: '0.9rem', margin: '0.75rem 0 0', lineHeight: 1.6 }}>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
        padding: '4rem 0',
        textAlign: 'center',
        color: '#fff',
      }}>
        <div className="container">
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.75rem', color: '#fff' }}>
            Ready to find your product?
          </h2>
          <p style={{ color: '#bfdbfe', marginBottom: '2rem', fontSize: '1.1rem' }}>
            Takes about 2 minutes. No sign-up required.
          </p>
          <Link to="/recommend" className="btn-primary" style={{ backgroundColor: '#fff', color: '#1e40af', fontSize: '1rem', padding: '0.75rem 2.5rem' }}>
            Start the Wizard
          </Link>
        </div>
      </section>
    </div>
  );
}
