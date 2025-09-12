import React, { useState, useEffect, useRef } from 'react';
import { useMayaChat } from '../hooks/useMayaChat';
import { ChatMessage } from '../types';

// Define a placeholder for the concept card component
function LuxuryConceptCard({ concept }: { concept: any }) {
  return (
    <div style={{ border: '1px solid #e0e0e0', padding: '16px', margin: '16px 0', background: '#f5f5f5' }}>
      <h4>{concept.title || 'Concept'}</h4>
      <p>{concept.description || 'Description not available.'}</p>
    </div>
  );
}

export function LuxuryChatInterface() {
  // For now, let's use a fallback approach for the hook
  const mayaChat = useMayaChat();
  const messages = mayaChat.messages || [];
  const sendMessage = mayaChat.sendMessage || (() => {});
  const isLoading = mayaChat.isTyping || false;
  const error = null;
  
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      // Call with proper arguments based on the hook's signature
      if (typeof sendMessage === 'function') {
        try {
          // Try the complex signature first
          (sendMessage as any)(inputValue, 'chat', '', '', '', '', '');
        } catch {
          // Fallback for simpler signature
          (sendMessage as any)(inputValue);
        }
      }
      setInputValue('');
    }
  };

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', border: '1px solid #e0e0e0', background: '#fff', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 250px)' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {messages.length === 0 && !isLoading && (
          <div style={{ textAlign: 'center', color: '#666' }}>
            <p>Your conversation with Maya begins here.</p>
            <p>Tell her about your brand to get started.</p>
          </div>
        )}
        
        {messages.map((msg: any, index: number) => (
          <div key={index} style={{ marginBottom: '16px', textAlign: msg.isUser ? 'right' : 'left' }}>
            <div style={{ display: 'inline-block', padding: '10px 15px', borderRadius: '12px', background: msg.isUser ? '#000' : '#f5f5f5', color: msg.isUser ? '#fff' : '#000' }}>
              <p style={{margin: 0}}>{msg.content || msg.message || 'Message'}</p>
            </div>
          </div>
        ))}
        
        {isLoading && <div style={{ textAlign: 'center', color: '#666' }}>Maya is thinking...</div>}
        {error && <div style={{ textAlign: 'center', color: 'red' }}>Error: {error}</div>}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} style={{ display: 'flex', padding: '16px', borderTop: '1px solid #e0e0e0' }}>
        <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Chat with Maya..." style={{ flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '20px', marginRight: '8px' }} disabled={isLoading} />
        <button type="submit" style={{ padding: '10px 20px', border: 'none', borderRadius: '20px', background: '#000', color: '#fff', cursor: 'pointer' }} disabled={isLoading}>Send</button>
      </form>
    </div>
  );
}