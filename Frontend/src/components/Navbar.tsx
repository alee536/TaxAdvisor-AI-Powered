import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import darkBackgroundLogo from '../../assets/logo for dark bg.png';

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
  const adminUrl = import.meta.env.VITE_API_BASE_URL
    ? `${import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/, '')}/admin/`
    : '/admin/';

  return (
    <nav className="site-navbar">
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '4rem' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'none' }}>
          <img
            src={darkBackgroundLogo}
            alt="TaxAdvisor"
            style={{ width: '3.25rem', height: '2.75rem', objectFit: 'contain' }}
          />
          <span style={{ color: 'var(--navbar-brand-text)', fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.01em' }}>
            TaxAdvisor
          </span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }} className="desktop-nav">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              style={{
                color: location.pathname === link.to ? 'var(--navbar-link-active)' : 'var(--navbar-link-text)',
                textDecoration: 'none',
                padding: '0.375rem 0.875rem',
                borderRadius: '0.375rem',
                fontSize: '0.9rem',
                fontWeight: location.pathname === link.to ? 600 : 400,
                backgroundColor: location.pathname === link.to ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                transition: 'all 0.15s',
              }}
            >
              {link.label}
            </Link>
          ))}
          <a href={adminUrl} style={{
            marginLeft: '0.5rem',
            color: 'var(--navbar-admin-text)',
            textDecoration: 'none',
            padding: '0.375rem 0.75rem',
            borderRadius: '0.375rem',
            fontSize: '0.8rem',
            border: '1px solid var(--navbar-admin-border)',
            transition: 'all 0.15s',
          }}>
            Admin
          </a>
        </div>

        <button
          onClick={() => setOpen(!open)}
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            color: 'var(--navbar-link-text)',
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
        <div className="site-mobile-menu" style={{ padding: '1rem' }}>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              style={{
                display: 'block',
                color: location.pathname === link.to ? 'var(--navbar-link-active)' : 'var(--navbar-link-text)',
                textDecoration: 'none',
                padding: '0.625rem 1rem',
                borderRadius: '0.375rem',
                fontWeight: location.pathname === link.to ? 600 : 400,
                backgroundColor: location.pathname === link.to ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                marginBottom: '0.25rem',
              }}
            >
              {link.label}
            </Link>
          ))}
          <a
            href={adminUrl}
            onClick={() => setOpen(false)}
            style={{ display: 'block', color: 'var(--navbar-admin-text)', textDecoration: 'none', padding: '0.625rem 1rem', fontSize: '0.875rem' }}
          >
            Admin
          </a>
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
