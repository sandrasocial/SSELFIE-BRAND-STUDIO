import React, { useState, useEffect, useRef } from 'react';
import { useMayaChat } from '../hooks/useMayaChat';
import { ChatMessage } from '../types';

// Placeholder for the real LuxuryConceptCard component
function LuxuryConceptCard({ concept }: { concept: any }) {
  const handleGenerate = () => {
    // TODO: Wire this to the image generation API endpoint
    console.log("Generating photos for concept:", concept.title);
  };

  return (
    <div style={{ border: '1px solid #e0e0e0', padding: '16px', margin: '16px 0', background: '#f5f5f5' }}>
      <p style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '0.3em', fontSize: '11px', color: '#666' }}>{concept.category || 'Concept'}</p>
      <h4 style={{ margin: '8px 0', fontFamily: "'Times New Roman', serif", fontWeight: 200, letterSpacing: '0.2em' }}>{concept.title || 'Untitled Concept'}</h4>
      <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#666' }}>{concept.description || 'No description.'}</p>
      <button onClick={handleGenerate} style={{ background: '#000', color: '#fff', padding: '12px 16px', border: 'none', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.3em', fontSize: '11px' }}>
        Generate Photos
      </button>
    </div>
  );
}

export function LuxuryChatInterface() {
  // Handle different hook signatures gracefully
  const mayaChat = useMayaChat();
  const messages = mayaChat?.messages || [];
  const sendMessage = mayaChat?.sendMessage || (() => {});
  const isLoading = mayaChat?.isTyping || false;
  const error = null; // For now, since error property might not exist
  
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      // Try to use the hook's sendMessage function with proper signature
      if (typeof sendMessage === 'function') {
        try {
          // Use the complex signature that the hook expects
          (sendMessage as any)(inputValue, 'chat', '', '', '', '', '');
        } catch (error) {
          console.warn('Error calling sendMessage:', error);
        }
      }
      setInputValue('');
    }
  };

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', border: '1px solid #e0e0e0', background: '#fff', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 250px)' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {messages.length === 0 && !isLoading && (
          <div style={{ textAlign: 'center', color: '#666', padding: '40px 20px' }}>
            <h3 style={{ fontFamily: "'Times New Roman', serif", fontWeight: 200, letterSpacing: '0.2em', marginBottom: '16px' }}>MAYA AI STYLIST</h3>
            <p style={{ fontSize: '14px', lineHeight: 1.6 }}>
              Tell me about your style vision, occasion, or inspiration. I'll help you create the perfect photoshoot concept.
            </p>
          </div>
        )}
        
        {messages.map((msg: any, index: number) => (
          <div key={index} style={{ marginBottom: '16px', textAlign: msg.isUser ? 'right' : 'left' }}>
            <div style={{ 
              display: 'inline-block', 
              padding: '10px 15px', 
              borderRadius: '12px', 
              background: msg.isUser ? '#000' : '#f5f5f5', 
              color: msg.isUser ? '#fff' : '#000',
              maxWidth: '80%'
            }}>
              {msg.type === 'concept' ? (
                <LuxuryConceptCard concept={msg.content} />
              ) : (
                <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.5 }}>
                  {msg.content || msg.message || 'Message'}
                </p>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div style={{ textAlign: 'center', color: '#666', fontStyle: 'italic', padding: '20px' }}>
            Maya is thinking...
          </div>
        )}
        
        {error && (
          <div style={{ textAlign: 'center', color: 'red', padding: '20px', fontSize: '14px' }}>
            Error: {error}
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSendMessage} style={{ display: 'flex', padding: '16px', borderTop: '1px solid #e0e0e0' }}>
        <input 
          type="text" 
          value={inputValue} 
          onChange={(e) => setInputValue(e.target.value)} 
          placeholder="Chat with Maya..." 
          style={{ 
            flex: 1, 
            padding: '12px 16px', 
            border: '1px solid #ccc', 
            borderRadius: '24px', 
            marginRight: '12px',
            fontSize: '14px',
            outline: 'none',
            fontFamily: 'inherit'
          }} 
          disabled={isLoading} 
        />
        <button 
          type="submit" 
          style={{ 
            padding: '12px 24px', 
            border: 'none', 
            borderRadius: '24px', 
            background: isLoading ? '#ccc' : '#000', 
            color: '#fff', 
            cursor: isLoading ? 'not-allowed' : 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '0.3em',
            fontSize: '11px',
            fontWeight: 500
          }} 
          disabled={isLoading || !inputValue.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
}
