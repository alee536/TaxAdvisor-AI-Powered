import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/products', label: 'Products' },
  { to: '/compare', label: 'Compare' },
  { to: '/recommend', label: 'Recommend' },
  { to: '/assistant', label: 'AI Assistant' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <nav style={{ backgroundColor: '#0f172a', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '4rem' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <span style={{
            backgroundColor: '#1e40af',
            color: '#fff',
            width: '2rem',
            height: '2rem',
            borderRadius: '0.375rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '0.9rem',
          }}>T</span>
          <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.01em' }}>
            TaxAdvisor
          </span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }} className="desktop-nav">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              style={{
                color: location.pathname === link.to ? '#93c5fd' : '#cbd5e1',
                textDecoration: 'none',
                padding: '0.375rem 0.875rem',
                borderRadius: '0.375rem',
                fontSize: '0.9rem',
                fontWeight: location.pathname === link.to ? 600 : 400,
                backgroundColor: location.pathname === link.to ? 'rgba(255,255,255,0.08)' : 'transparent',
                transition: 'all 0.15s',
              }}
            >
              {link.label}
            </Link>
          ))}
          <Link to="/admin/products" style={{
            marginLeft: '0.5rem',
            color: '#94a3b8',
            textDecoration: 'none',
            padding: '0.375rem 0.75rem',
            borderRadius: '0.375rem',
            fontSize: '0.8rem',
            border: '1px solid #334155',
            transition: 'all 0.15s',
          }}>
            Admin
          </Link>
        </div>

        <button
          onClick={() => setOpen(!open)}
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            color: '#cbd5e1',
            cursor: 'pointer',
            padding: '0.5rem',
          }}
          className="mobile-menu-btn"
          aria-label="Toggle menu"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div style={{ backgroundColor: '#1e293b', borderTop: '1px solid #334155', padding: '1rem' }}>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              style={{
                display: 'block',
                color: location.pathname === link.to ? '#93c5fd' : '#cbd5e1',
                textDecoration: 'none',
                padding: '0.625rem 1rem',
                borderRadius: '0.375rem',
                fontWeight: location.pathname === link.to ? 600 : 400,
                backgroundColor: location.pathname === link.to ? 'rgba(255,255,255,0.06)' : 'transparent',
                marginBottom: '0.25rem',
              }}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/admin/products"
            onClick={() => setOpen(false)}
            style={{ display: 'block', color: '#94a3b8', textDecoration: 'none', padding: '0.625rem 1rem', fontSize: '0.875rem' }}
          >
            Admin
          </Link>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}
