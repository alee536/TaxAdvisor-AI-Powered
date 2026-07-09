import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { postAssistant, type AssistantResponse } from '../api/api';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  response?: AssistantResponse;
  error?: boolean;
  streaming?: boolean;
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
  const intervalRef = useRef<number | null>(null);
  const nextId = useRef(1);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => () => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
    }
  }, []);

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
      setLoading(false);

      const assistantId = nextId.current++;
      setMessages((prev) => [...prev, { id: assistantId, role: 'assistant', content: '', streaming: true }]);

      const words = response.answer.trim().split(/\s+/).filter(Boolean);
      if (words.length === 0) {
        setMessages((prev) => prev.map((msg) => (
          msg.id === assistantId
            ? { ...msg, content: response.answer, response, streaming: false }
            : msg
        )));
        setAwaitingProductTopic(isAcknowledgement);
        return;
      }

      let index = 0;
      intervalRef.current = window.setInterval(() => {
        index += 1;
        const visibleText = words.slice(0, index).join(' ');

        setMessages((prev) => prev.map((msg) => (
          msg.id === assistantId
            ? {
                ...msg,
                content: visibleText,
                response: index >= words.length ? response : undefined,
                streaming: index < words.length,
              }
            : msg
        )));

        if (index >= words.length && intervalRef.current !== null) {
          window.clearInterval(intervalRef.current);
          intervalRef.current = null;
          setAwaitingProductTopic(isAcknowledgement);
        }
      }, reduceMotion ? 1 : 35);
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
          <p style={{ fontSize: '0.875rem', color: 'var(--color-body-text)', marginBottom: '1rem', fontWeight: 500 }}>
            Try one of these questions:
          </p>
          <div className="relative">
            <div className="scrollbar-hide flex gap-3 overflow-x-auto scroll-smooth py-3">
              {SAMPLE_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="min-w-[240px] flex-shrink-0 whitespace-normal rounded-full border border-emerald-200 bg-white px-4 py-2 text-left text-sm text-slate-700 transition-colors hover:border-emerald-500 hover:bg-emerald-50"
                >
                  {q}
                </button>
              ))}
            </div>
            <div className="pointer-events-none absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-white to-transparent" />
          </div>
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)' }}>
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.25 }}
            style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}
          >
            <div style={{ maxWidth: '82%', display: 'flex', alignItems: 'flex-end', gap: '0.75rem', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
              {msg.role === 'assistant' && (
                <div style={{
                  width: '2rem',
                  height: '2rem',
                  borderRadius: '50%',
                  backgroundColor: '#0f172a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  flexShrink: 0,
                  marginBottom: '0.15rem',
                }}>
                  AI
                </div>
              )}
              <div style={{ maxWidth: '100%' }}>
                <div style={{
                  padding: '0.95rem 1.1rem',
                  borderRadius: msg.role === 'user' ? '1rem 1rem 0.35rem 1rem' : '1rem 1rem 1rem 0.35rem',
                  backgroundColor: msg.role === 'user' ? 'var(--color-accent)' : msg.error ? '#fef2f2' : '#F1F5F9',
                  color: msg.role === 'user' ? '#fff' : msg.error ? '#b91c1c' : '#0f172a',
                  border: msg.role === 'assistant' ? `1px solid ${msg.error ? '#fecaca' : '#e2e8f0'}` : 'none',
                  fontSize: '0.94rem',
                  lineHeight: '1.65',
                  boxShadow: '0 1px 2px rgba(15,23,42,0.06)',
                  whiteSpace: 'pre-wrap',
                }}>
                  {msg.content}
                </div>

                {msg.role === 'assistant' && msg.response?.recommendedProduct && (
                  <div style={{
                    marginTop: '0.5rem',
                    padding: '0.75rem 1rem',
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '0.75rem',
                    fontSize: '0.85rem',
                  }}>
                    <p style={{ fontWeight: 600, color: 'var(--color-accent)', marginBottom: '0.25rem' }}>
                      Recommended Product
                    </p>
                    <p style={{ color: '#166534', margin: 0 }}>{msg.response.recommendedProduct}</p>
                  </div>
                )}

                {msg.role === 'assistant' && msg.response?.disclaimer && (
                  <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.5rem', lineHeight: '1.4', paddingLeft: '0.25rem' }}>
                    {msg.response.disclaimer}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        ))}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.75rem' }}>
            <div style={{
              width: '2rem',
              height: '2rem',
              borderRadius: '50%',
              backgroundColor: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.75rem',
              flexShrink: 0,
            }}>
              AI
            </div>
            <div style={{ padding: '0.95rem 1.1rem', backgroundColor: '#F1F5F9', borderRadius: '1rem 1rem 1rem 0.35rem', display: 'flex', gap: '0.35rem', alignItems: 'center', border: '1px solid #e2e8f0' }}>
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  style={{ width: '0.45rem', height: '0.45rem', borderRadius: '50%', backgroundColor: '#94a3b8', display: 'inline-block' }}
                  animate={reduceMotion ? { y: 0 } : { y: [0, -4, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

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
