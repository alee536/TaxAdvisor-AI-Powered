import { useState, useRef, useEffect } from 'react';
import { postAssistant, type AssistantResponse } from '../api/api';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  response?: AssistantResponse;
  error?: boolean;
}

const SAMPLE_QUESTIONS = [
  'I have salary income and donations. Which product should I use?',
  'I am a freelancer with home-office expenses. Can I use Free?',
  'I own an incorporated company with no revenue. What should I choose?',
  'I have investment income and rental income. Which product fits me?',
  'What is the difference between Premier and Self-Employed?',
  'I want someone else to file for me. What should I select?',
  'Can you guarantee I will get a refund?',
];

const isSingleAcknowledgement = (message: string) =>
  /^(?:ok|oky|okay)$/.test(message.trim().toLowerCase().replace(/[.!?]+$/, ''));

async function requestAssistantWithRetry(question: string, conversationContext?: 'awaiting_product_topic') {
  try {
    return await postAssistant({ question, conversationContext });
  } catch {
    // Django briefly restarts while backend files change in development.
    await new Promise((resolve) => window.setTimeout(resolve, 400));
    return postAssistant({ question, conversationContext });
  }
}

export default function AssistantChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [awaitingProductTopic, setAwaitingProductTopic] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  let nextId = useRef(1);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage(question: string) {
    if (!question.trim() || loading) return;

    const isAcknowledgement = isSingleAcknowledgement(question);
    const conversationContext = awaitingProductTopic ? 'awaiting_product_topic' : undefined;
    const userMsg: Message = { id: nextId.current++, role: 'user', content: question };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await requestAssistantWithRetry(question, conversationContext);
      const assistantMsg: Message = {
        id: nextId.current++,
        role: 'assistant',
        content: response.answer,
        response,
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setAwaitingProductTopic(isAcknowledgement);
    } catch (error) {
      console.error('Assistant request failed:', error);
      const detail = error instanceof Error ? error.message : 'Unexpected browser request error.';
      const errorMsg: Message = {
        id: nextId.current++,
        role: 'assistant',
        content: `Assistant request failed: ${detail} Please try again.`,
        error: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {messages.length === 0 && (
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
          <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1rem', fontWeight: 500 }}>
            Try one of these questions:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {SAMPLE_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                style={{
                  textAlign: 'left',
                  padding: '0.5rem 0.875rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#f8fafc',
                  color: '#374151',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#eff6ff'; e.currentTarget.style.borderColor = '#bfdbfe'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {messages.map((msg) => (
          <div key={msg.id} className="fade-in" style={{
            display: 'flex',
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
          }}>
            {msg.role === 'assistant' && (
              <div style={{
                width: '2rem',
                height: '2rem',
                borderRadius: '50%',
                backgroundColor: '#1e40af',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.8rem',
                marginRight: '0.75rem',
                flexShrink: 0,
                marginTop: '0.25rem',
              }}>AI</div>
            )}
            <div style={{ maxWidth: '75%' }}>
              <div style={{
                padding: '0.875rem 1.125rem',
                borderRadius: msg.role === 'user' ? '1rem 1rem 0.25rem 1rem' : '1rem 1rem 1rem 0.25rem',
                backgroundColor: msg.role === 'user' ? '#1e40af' : msg.error ? '#fef2f2' : '#ffffff',
                color: msg.role === 'user' ? '#fff' : msg.error ? '#b91c1c' : '#0f172a',
                border: msg.role === 'assistant' ? `1px solid ${msg.error ? '#fecaca' : '#e2e8f0'}` : 'none',
                fontSize: '0.9rem',
                lineHeight: '1.6',
                boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
              }}>
                {msg.content}
              </div>

              {msg.role === 'assistant' && msg.response && msg.response.recommendedProduct && (
                <div style={{
                  marginTop: '0.5rem',
                  padding: '0.75rem 1rem',
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '0.5rem',
                  fontSize: '0.85rem',
                }}>
                  <p style={{ fontWeight: 600, color: '#15803d', marginBottom: '0.25rem' }}>
                    Recommended Product
                  </p>
                  <p style={{ color: '#166534', margin: 0 }}>{msg.response.recommendedProduct}</p>
                </div>
              )}

              {msg.role === 'assistant' && msg.response && msg.response.disclaimer && (
                <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.5rem', lineHeight: '1.4', paddingLeft: '0.25rem' }}>
                  {msg.response.disclaimer}
                </p>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '2rem',
              height: '2rem',
              borderRadius: '50%',
              backgroundColor: '#1e40af',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.8rem',
              flexShrink: 0,
            }}>AI</div>
            <div style={{ padding: '0.875rem 1.125rem', backgroundColor: '#f1f5f9', borderRadius: '1rem 1rem 1rem 0.25rem', display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
              {[0, 1, 2].map((i) => (
                <span key={i} style={{
                  width: '0.4rem',
                  height: '0.4rem',
                  borderRadius: '50%',
                  backgroundColor: '#94a3b8',
                  animation: `bounce 1s ${i * 0.15}s infinite`,
                  display: 'inline-block',
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>

      <form onSubmit={handleSubmit} style={{
        padding: '1rem 1.5rem',
        borderTop: '1px solid #e2e8f0',
        display: 'flex',
        gap: '0.75rem',
        backgroundColor: '#fff',
      }}>
        <input
          type="text"
          className="input-field"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about tax products..."
          disabled={loading}
          style={{ flex: 1 }}
        />
        <button type="submit" className="btn-primary" disabled={loading || !input.trim()}>
          {loading ? <span className="loading-spinner" style={{ width: '1rem', height: '1rem' }} /> : 'Send'}
        </button>
      </form>
    </div>
  );
}
