import { Link } from 'react-router-dom';
import type { RecommendResponse } from '../api/api';

interface Props {
  result: RecommendResponse;
  onRestart: () => void;
}

const CONFIDENCE_COLORS: Record<string, string> = {
  high: '#16a34a',
  medium: '#d97706',
  low: '#dc2626',
};

export default function ResultCard({ result, onRestart }: Props) {
  return (
    <div className="fade-in">
      <div style={{
        backgroundColor: '#fff',
        border: '2px solid #1e40af',
        borderRadius: '1rem',
        overflow: 'hidden',
        boxShadow: '0 4px 16px rgba(30, 64, 175, 0.12)',
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
          padding: '2rem',
          color: '#fff',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#93c5fd', marginBottom: '0.5rem' }}>
            Recommended Product
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 0.5rem', color: '#fff' }}>
            {result.recommendedProductName}
          </h2>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff' }}>
            {result.price === 0 ? 'Free' : `${result.currency} $${result.price}`}
          </div>
          <div style={{ marginTop: '0.75rem' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              backgroundColor: 'rgba(255,255,255,0.15)',
              padding: '0.25rem 0.875rem',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}>
              <span style={{
                width: '0.5rem',
                height: '0.5rem',
                borderRadius: '50%',
                backgroundColor: CONFIDENCE_COLORS[result.confidence] || '#fff',
                display: 'inline-block',
              }} />
              {result.confidence.charAt(0).toUpperCase() + result.confidence.slice(1)} Confidence
            </span>
          </div>
        </div>

        <div style={{ padding: '2rem' }}>
          {result.warnings.length > 0 && (
            <div style={{
              backgroundColor: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: '0.5rem',
              padding: '1rem',
              marginBottom: '1.5rem',
            }}>
              <p style={{ fontWeight: 600, color: '#92400e', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Note</p>
              {result.warnings.map((w, i) => (
                <p key={i} style={{ color: '#78350f', fontSize: '0.875rem', margin: '0.25rem 0' }}>• {w}</p>
              ))}
            </div>
          )}

          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', color: '#0f172a' }}>Why this product?</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {result.reasons.map((r, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.625rem', alignItems: 'flex-start' }}>
                  <span style={{ color: '#1e40af', fontWeight: 700, marginTop: '0.1rem' }}>✓</span>
                  <span style={{ fontSize: '0.9rem', color: '#374151', lineHeight: '1.5' }}>{r}</span>
                </div>
              ))}
            </div>
          </div>

          {result.matchedInputs.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', color: '#0f172a' }}>Based on your inputs</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {result.matchedInputs.map((input, i) => (
                  <span key={i} className="badge badge-blue">{input}</span>
                ))}
              </div>
            </div>
          )}

          {result.optionalUpgrade && (
            <div style={{
              backgroundColor: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: '0.75rem',
              padding: '1rem 1.25rem',
              marginBottom: '1.5rem',
            }}>
              <p style={{ fontWeight: 600, color: '#0369a1', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                Optional Upgrade: {result.optionalUpgrade.productName}
              </p>
              <p style={{ color: '#0c4a6e', fontSize: '0.875rem', margin: 0 }}>
                {result.optionalUpgrade.reason}
              </p>
            </div>
          )}

          <div style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '0.5rem',
            padding: '0.875rem 1rem',
            marginBottom: '1.5rem',
          }}>
            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0, lineHeight: '1.5' }}>
              <strong>Disclaimer:</strong> {result.disclaimer}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button onClick={onRestart} className="btn-primary" style={{ flex: 1, minWidth: '160px' }}>
              Start Over
            </button>
            <Link to="/products" className="btn-secondary" style={{ flex: 1, minWidth: '160px', textAlign: 'center' }}>
              View All Products
            </Link>
            <Link to="/compare" className="btn-outline" style={{ flex: 1, minWidth: '160px', textAlign: 'center' }}>
              Compare Products
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
