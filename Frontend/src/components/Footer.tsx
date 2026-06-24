import { Link } from 'react-router-dom';
import darkBackgroundLogo from '../../assets/logo for dark bg.png';

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#061a35', color: '#94a3b8', paddingTop: '3rem', paddingBottom: '2rem', marginTop: 'auto' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <img
                src={darkBackgroundLogo}
                alt="TaxAdvisor"
                style={{ width: '3rem', height: '2.5rem', objectFit: 'contain' }}
              />
              <span style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '1rem' }}>TaxAdvisor</span>
            </div>
            <p style={{ fontSize: '0.875rem', lineHeight: '1.6', color: '#64748b', maxWidth: '240px' }}>
              AI-powered tax software recommendation system to help Canadians find the right product.
            </p>
          </div>

          <div>
            <h3 style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '0.875rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Product</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[['/', 'Home'], ['/products', 'All Products'], ['/compare', 'Compare'], ['/recommend', 'Get Recommendation']].map(([to, label]) => (
                <Link key={to} to={to} style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.875rem', transition: 'color 0.15s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#93c5fd')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}>
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '0.875rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Support</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[['/assistant', 'AI Assistant']].map(([to, label]) => (
                <Link key={to} to={to} style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.875rem', transition: 'color 0.15s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#93c5fd')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}>
                  {label}
                </Link>
              ))}
              <a href="/admin/" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.875rem', transition: 'color 0.15s' }}>
                Django Admin
              </a>
            </div>
          </div>

          <div>
            <h3 style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '0.875rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Disclaimer</h3>
            <p style={{ fontSize: '0.8rem', color: '#475569', lineHeight: '1.6' }}>
              TaxAdvisor provides product selection guidance only. This is not tax, legal, or financial advice. Always consult a qualified tax professional.
            </p>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #1e293b', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <p style={{ fontSize: '0.8rem', color: '#334155' }}>
            &copy; {new Date().getFullYear()} TaxAdvisor. Built as an IT Officer interview project.
          </p>
          <p style={{ fontSize: '0.8rem', color: '#334155' }}>
            Powered by Django REST API + React + Vite
          </p>
        </div>
      </div>
    </footer>
  );
}
