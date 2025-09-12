import React, { useState, useEffect, useRef } from 'react';
import { useMayaChat } from '../hooks/useMayaChat';
import { StyleSelector } from './StyleSelector';
import { BrandStyleCollection } from '../data/brand-style-collections';

/**
 * LuxuryConceptCard Component
 * Renders a single concept card, handles image generation, polling, and previewing results.
 */
function LuxuryConceptCard({ concept }: { concept: any }) {
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setImageUrls([]);

    try {
      // Step 1: Start the generation and get a prediction ID
      const startResponse = await fetch('/api/maya/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: concept.fluxPrompt }),
      });

      if (!startResponse.ok) {
        throw new Error('Failed to start image generation.');
      }

      const { predictionId } = await startResponse.json();

      // Step 2: Poll for the result
      const pollInterval = setInterval(async () => {
        try {
          const checkResponse = await fetch(`/api/maya/check-generation/${predictionId}`);
          if (!checkResponse.ok) {
            // Stop polling on server error
            throw new Error('Server error while checking status.');
          }
          const result = await checkResponse.json();

          if (result.status === 'completed') {
            clearInterval(pollInterval);
            setIsLoading(false);
            setImageUrls(result.imageUrls);
          } else if (result.status === 'failed') {
            clearInterval(pollInterval);
            setIsLoading(false);
            setError('Image generation failed. Please try again.');
          }
          // If status is 'processing', the interval continues
        } catch (pollError) {
          clearInterval(pollInterval);
          setIsLoading(false);
          setError('An error occurred while polling for results.');
        }
      }, 4000); // Poll every 4 seconds

    } catch (err) {
      setIsLoading(false);
      setError((err as Error).message);
    }
  };

  return (
    <div style={{ border: '1px solid #e0e0e0', padding: '16px', margin: '16px 0', background: '#f5f5f5' }}>
      <p style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '0.3em', fontSize: '11px', color: '#666' }}>{concept.category}</p>
      <h4 style={{ margin: '8px 0', fontFamily: "'Times New Roman', serif", fontWeight: 200, letterSpacing: '0.2em' }}>{concept.title}</h4>
      <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#666' }}>{concept.description}</p>
      
      {!isLoading && imageUrls.length === 0 && (
        <button onClick={handleGenerate} style={{ background: '#000', color: '#fff', padding: '12px 16px', border: 'none', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.3em', fontSize: '11px' }}>
          Generate Photos
        </button>
      )}

      {isLoading && <p>Generating images, please wait...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {imageUrls.length > 0 && (
        <div>
          <h5 style={{ marginTop: '20px', textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: '12px' }}>Generated Images:</h5>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginTop: '8px' }}>
            {imageUrls.map((url, index) => (
              <img key={index} src={url} alt={`Generated ${index + 1}`} style={{ width: '100%', height: 'auto', objectFit: 'cover' }} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * LuxuryChatInterface Component
 * The main chat window that manages the conversation flow with Maya.
 */
export function LuxuryChatInterface() {
  const { messages, sendMessage, isTyping } = useMayaChat();
  const [inputValue, setInputValue] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<BrandStyleCollection | null>(null);
  const [showStyleSelector, setShowStyleSelector] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleStyleSelect = (style: BrandStyleCollection) => {
    setSelectedStyle(style);
    setShowStyleSelector(false);
    const styleMessage = `I've chosen the "${style.name}" style. Please create concepts that match this aesthetic.`;
    sendMessage(styleMessage);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isTyping) {
      sendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', border: '1px solid #e0e0e0', background: '#fff', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 250px)' }}>
      {/* Add Choose Style button at the top */}
      <div style={{ padding: '16px', borderBottom: '1px solid #eee', background: '#faf9f7', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          type="button"
          style={{
            background: '#fff',
            color: '#000',
            border: '1px solid #ccc',
            borderRadius: '20px',
            padding: '8px 20px',
            fontSize: '13px',
            fontWeight: 500,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            boxShadow: '0 1px 4px rgba(0,0,0,0.03)'
          }}
          onClick={() => setShowStyleSelector(true)}
        >
          {selectedStyle ? `Style: ${selectedStyle.name}` : 'Choose Style'}
        </button>
        {selectedStyle && (
          <span style={{ color: '#888', fontSize: 13 }}>
            {selectedStyle.aesthetic}
          </span>
        )}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {messages.map((msg, index) => (
          <div key={index} style={{ marginBottom: '16px', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
            <div style={{ display: 'inline-block', padding: '10px 15px', borderRadius: '12px', background: msg.role === 'user' ? '#000' : '#f5f5f5', color: msg.role === 'user' ? '#fff' : '#000', maxWidth: '80%' }}>
              <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.5 }}>
                {msg.content}
              </p>
            </div>
            {msg.role === 'maya' && msg.conceptCards && (
              <div style={{ marginTop: '12px', textAlign: 'left' }}>
                {msg.conceptCards.map((concept: any, conceptIndex: number) => (
                  <LuxuryConceptCard key={conceptIndex} concept={concept} />
                ))}
              </div>
            )}
          </div>
        ))}

        {showStyleSelector && (
          <StyleSelector 
            onStyleSelect={handleStyleSelect} 
            selectedStyleId={selectedStyle?.id}
          />
        )}
        
        {isTyping && <div style={{ textAlign: 'center', color: '#666' }}>Maya is thinking...</div>}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} style={{ display: 'flex', padding: '16px', borderTop: '1px solid #e0e0e0' }}>
        <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Chat with Maya..." style={{ flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '20px', marginRight: '8px' }} disabled={isTyping} />
        <button type="submit" style={{ padding: '10px 20px', border: 'none', borderRadius: '20px', background: '#000', color: '#fff', cursor: 'pointer' }} disabled={isTyping}>
          Send
        </button>
      </form>
    </div>
  );
}