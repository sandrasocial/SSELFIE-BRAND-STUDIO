import React, { useState, useEffect, useRef } from 'react';
import { useMayaChat } from '../hooks/useMayaChat';

// Real LuxuryConceptCard component that renders Maya's concept cards
function LuxuryConceptCard({ concept }: { concept: any }) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    console.log("Generating photos for concept:", concept);

    try {
      // Call the Maya image generation API
      const response = await fetch('/api/maya-generate-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: concept.fluxPrompt || concept.title || 'Professional photo shoot',
          customPrompt: concept.fluxPrompt
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Image generation started:', result);
        // TODO: Show success message or redirect to generation tracking
        alert('Photos are being generated! Check your gallery in a few minutes.');
      } else {
        console.error('❌ Generation failed:', result);
        alert('Failed to start generation: ' + (result.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('❌ Generation error:', error);
      alert('Failed to start generation. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div style={{ 
      border: '1px solid #e0e0e0', 
      padding: '20px', 
      margin: '16px 0', 
      background: '#f9f9f9',
      borderRadius: '8px'
    }}>
      <h4 style={{ 
        margin: '0 0 12px 0', 
        fontFamily: "'Times New Roman', serif", 
        fontWeight: 400, 
        letterSpacing: '0.1em',
        fontSize: '16px'
      }}>
        {concept.title || 'Creative Concept'}
      </h4>
      <p style={{ 
        margin: '0 0 16px 0', 
        fontSize: '14px', 
        color: '#666',
        lineHeight: 1.5
      }}>
        {concept.description || concept.creativeLookDescription || 'A unique creative concept for your photoshoot.'}
      </p>
      {concept.fluxPrompt && (
        <p style={{ 
          margin: '0 0 16px 0', 
          fontSize: '12px', 
          color: '#888',
          fontStyle: 'italic',
          background: '#f0f0f0',
          padding: '8px',
          borderRadius: '4px'
        }}>
          Prompt: {concept.fluxPrompt}
        </p>
      )}
      <button 
        onClick={handleGenerate} 
        disabled={isGenerating}
        style={{ 
          background: isGenerating ? '#ccc' : '#000', 
          color: '#fff', 
          padding: '12px 20px', 
          border: 'none', 
          cursor: isGenerating ? 'not-allowed' : 'pointer', 
          textTransform: 'uppercase', 
          letterSpacing: '0.3em', 
          fontSize: '11px',
          borderRadius: '4px'
        }}
      >
        {isGenerating ? 'Generating...' : 'Generate Photos'}
      </button>
    </div>
  );
}

export function LuxuryChatInterface() {
  const { messages, isTyping, error, sendMessage } = useMayaChat();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isTyping) {
      sendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', border: '1px solid #e0e0e0', background: '#fff', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 250px)' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {messages.length === 0 && !isTyping && (
          <div style={{ textAlign: 'center', color: '#666', padding: '40px 20px' }}>
            <h3 style={{ fontFamily: "'Times New Roman', serif", fontWeight: 200, letterSpacing: '0.2em', marginBottom: '16px' }}>MAYA AI STYLIST</h3>
            <p style={{ fontSize: '14px', lineHeight: 1.6 }}>
              Tell me about your style vision, occasion, or inspiration. I'll help you create the perfect photoshoot concept.
            </p>
          </div>
        )}
        
        {messages.map((msg, index) => (
          <div key={index} style={{ marginBottom: '16px', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
            <div style={{ 
              display: 'inline-block', 
              padding: '10px 15px', 
              borderRadius: '12px', 
              background: msg.role === 'user' ? '#000' : '#f5f5f5', 
              color: msg.role === 'user' ? '#fff' : '#000',
              maxWidth: '80%'
            }}>
              <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.5 }}>
                {msg.content}
              </p>
            </div>
            
            {/* Render concept cards if they exist */}
            {msg.role === 'maya' && msg.conceptCards && msg.conceptCards.length > 0 && (
              <div style={{ marginTop: '12px', textAlign: 'left' }}>
                {msg.conceptCards.map((concept, conceptIndex) => (
                  <LuxuryConceptCard key={conceptIndex} concept={concept} />
                ))}
              </div>
            )}
          </div>
        ))}
        
        {isTyping && (
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
          disabled={isTyping} 
        />
        <button 
          type="submit" 
          style={{ 
            padding: '12px 24px', 
            border: 'none', 
            borderRadius: '24px', 
            background: isTyping ? '#ccc' : '#000', 
            color: '#fff', 
            cursor: isTyping ? 'not-allowed' : 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '0.3em',
            fontSize: '11px',
            fontWeight: 500
          }} 
          disabled={isTyping || !inputValue.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
}
