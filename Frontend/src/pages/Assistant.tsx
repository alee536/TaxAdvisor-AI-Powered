import AssistantChat from '../components/AssistantChat';

export default function Assistant() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 64px)' }}>
      <div className="page-hero" style={{ padding: '3.5rem 0 3rem' }}>
        <div className="container">
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>AI Assistant</h1>
          <p style={{ color: '#bfdbfe', fontSize: '1.05rem' }}>
            Ask questions about tax products in natural language
          </p>
          <div style={{ marginTop: '1rem' }}>
            <span style={{
              display: 'inline-block',
              backgroundColor: 'rgba(255,255,255,0.15)',
              color: '#fde68a',
              fontSize: '0.78rem',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              fontWeight: 500,
            }}>
              Rule-grounded guidance with optional Gemini wording
            </span>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '2.5rem 1.5rem', flex: 1 }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '0.75rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            overflow: 'hidden',
            minHeight: '560px',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div style={{
              padding: '1rem 1.5rem',
              borderBottom: '1px solid #f1f5f9',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}>
              <div style={{
                width: '0.625rem',
                height: '0.625rem',
                borderRadius: '50%',
                backgroundColor: '#16a34a',
              }} />
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>TaxAdvisor Assistant</span>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Product guidance only — not tax advice</span>
            </div>
            <AssistantChat />
          </div>

          <div style={{
            marginTop: '1.5rem',
            backgroundColor: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: '0.625rem',
            padding: '1rem 1.25rem',
          }}>
            <p style={{ fontSize: '0.8rem', color: '#78350f', margin: 0, lineHeight: 1.5 }}>
              <strong>Disclaimer:</strong> The AI assistant provides general product selection guidance only. It is not a substitute for professional tax, legal, financial, or accounting advice. Please consult a qualified tax professional for personalized guidance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
