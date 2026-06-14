'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Ahoj! 👋 Jsem AI asistent pro katalog nástrojů. Zeptej se mě na cokoliv – pomohu ti vybrat správný nástroj, poradím s licencemi nebo bezpečností.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const pathname = usePathname();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const history = messages
        .filter(m => m.role !== 'system')
        .map(m => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, history }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.error || 'Omlouvám se, něco se pokazilo. Zkuste to znovu.',
        }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Nepodařilo se spojit se serverem. Zkuste to prosím později.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Simple markdown-like formatting
  const formatMessage = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br />')
      .replace(/^- (.*)/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
  };

  if (pathname === '/login') return null;

  return (
    <>
      {isOpen && (
        <div className="chatbot-window" id="chatbot-window">
          <div className="chatbot-header">
            <div className="chatbot-header-dot" />
            <div>
              <div className="chatbot-header-title">AI Asistent</div>
              <div className="chatbot-header-subtitle">Odpovídám na základě aktuálního katalogu</div>
            </div>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`chat-message ${msg.role}`}
                dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
              />
            ))}
            {loading && (
              <div className="chat-typing">
                <span /><span /><span />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-input-area">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Napište dotaz..."
              className="chatbot-input"
              disabled={loading}
              id="chatbot-input"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="chatbot-send"
              id="chatbot-send"
            >
              ↑
            </button>
          </div>
        </div>
      )}

      <button
        className={`chatbot-toggle ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        id="chatbot-toggle"
        aria-label="Otevřít chat"
      >
        {isOpen ? '✕' : '💬'}
      </button>
    </>
  );
}
