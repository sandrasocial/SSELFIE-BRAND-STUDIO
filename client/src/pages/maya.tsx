import { KeyboardEvent, useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/use-auth';
import { useLocation } from 'wouter';
import { useToast } from '../hooks/use-toast';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import { MemberNavigation } from '../components/member-navigation';

type Role = 'user' | 'maya';

interface ChatMessage {
  id?: number;
  role: Role;
  content: string;              // human-readable message (Maya reply or user text)
  timestamp: string;
  imagePreview?: string[];      // generated images (if any)
  canGenerate?: boolean;        // shows the "Create with Maya" button
  variants?: string[];          // up to 3 generation prompts returned from /api/maya/compose
  nextVariantIndex?: number;    // which variant to use next when user clicks again
}

interface MayaChat {
  id: number;
  userId: string;
  chatTitle: string;
  chatSummary?: string;
  createdAt: string;
  updatedAt: string;
}

type Framing = 'close' | 'half' | 'full';
type Style =
  | 'future_ceo'
  | 'off_duty'
  | 'social_queen'
  | 'date_night'
  | 'everyday_icon'
  | 'power_player';
type Vibe = 'quiet_luxury' | 'cinematic' | 'natural_light' | 'studio_clean';

type Intent = {
  framing: Framing;
  style: Style;
  vibe?: Vibe;
};

export default function Maya() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Core chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);

  // Generation / UI
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [savingImages, setSavingImages] = useState(new Set<string>());
  const [savedImages, setSavedImages] = useState(new Set<string>());
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Editorial flow state
  const [selectedFraming, setSelectedFraming] = useState<Framing | null>(null);
  const [intent, setIntent] = useState<Intent>({
    framing: 'close',
    style: 'future_ceo',
    vibe: 'quiet_luxury',
  });

  // ===== Auth & initial =====
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setLocation('/');
      return;
    }
  }, [isAuthenticated, authLoading, setLocation]);

  // ===== Auto-scroll =====
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffMinutes < 1440) {
      return `${Math.floor(diffMinutes / 60)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // ===== Maya Compose =====
  const composeWithMaya = async (intentOverrides: Partial<Intent> = {}) => {
    const finalIntent = { ...intent, ...intentOverrides };
    setIsTyping(true);
    
    try {
      const response = await apiRequest('/api/maya/compose', 'POST', {
        intent: finalIntent,
        chatHistory: messages.slice(-6)
      });
      
      const mayaMessage: ChatMessage = {
        role: 'maya',
        content: response.message || "I've created some stunning looks for you!",
        timestamp: new Date().toISOString(),
        variants: response.variants || [],
        canGenerate: true,
        nextVariantIndex: 0
      };
      
      setMessages(prev => [...prev, mayaMessage]);
      
      // Reset to show conversation interface
      setSelectedFraming(null);
      
    } catch (error: any) {
      toast({
        title: "Maya Connection Error",
        description: error?.message || "Failed to connect to Maya. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsTyping(false);
    }
  };

  // ===== Generate Images =====
  const generateImages = async (message: ChatMessage, variantIndex = 0) => {
    if (!message.variants?.[variantIndex]) return;
    
    setIsGenerating(true);
    setGenerationProgress(0);
    
    try {
      const prompt = message.variants[variantIndex];
      
      const response = await apiRequest('/api/maya-generate-images', 'POST', {
        prompt,
        chatId: currentChatId,
        messageId: message.id,
        framing: intent.framing
      });
      
      if (response.predictionId) {
        pollForCompletion(response.predictionId, message);
      }
      
    } catch (error: any) {
      toast({
        title: "Generation Error",
        description: error?.message || "Failed to generate images",
        variant: "destructive"
      });
      setIsGenerating(false);
    }
  };

  // ===== Poll for completion =====
  const pollForCompletion = async (predictionId: string, message: ChatMessage) => {
    const maxAttempts = 60;
    let attempts = 0;
    
    const poll = async () => {
      attempts++;
      setGenerationProgress((attempts / maxAttempts) * 100);
      
      try {
        const response = await apiRequest(`/api/check-generation/${predictionId}`, 'GET');
        
        if (response.status === 'completed' && response.imageUrls) {
          // Update the message with images
          setMessages(prev => prev.map(msg => 
            msg === message ? {
              ...msg,
              imagePreview: response.imageUrls,
              nextVariantIndex: ((message.nextVariantIndex || 0) + 1) % (message.variants?.length || 1)
            } : msg
          ));
          
          setIsGenerating(false);
          setGenerationProgress(0);
          
          toast({
            title: "Maya Created Your Photos!",
            description: `Generated ${response.imageUrls.length} professional brand photos`,
          });
          
        } else if (response.status === 'failed') {
          throw new Error(response.error || 'Generation failed');
        } else if (attempts < maxAttempts) {
          setTimeout(poll, 2000);
        } else {
          throw new Error('Generation timeout');
        }
        
      } catch (error: any) {
        setIsGenerating(false);
        setGenerationProgress(0);
        toast({
          title: "Generation Failed", 
          description: error.message,
          variant: "destructive"
        });
      }
    };
    
    poll();
  };

  // ===== Save Image =====
  const saveImageToGallery = async (imageUrl: string) => {
    setSavingImages(prev => new Set([...prev, imageUrl]));
    
    try {
      await apiRequest('/api/save-to-gallery', 'POST', { imageUrl });
      setSavedImages(prev => new Set([...prev, imageUrl]));
      
      toast({
        title: "Saved to Gallery",
        description: "Image saved to your personal gallery",
      });
      
    } catch (error: any) {
      toast({
        title: "Save Failed",
        description: error?.message || "Failed to save image",
        variant: "destructive"
      });
    } finally {
      setSavingImages(prev => {
        const updated = new Set(prev);
        updated.delete(imageUrl);
        return updated;
      });
    }
  };

  // Gray tile component
  const GrayTile = ({ ratio }: { ratio: string }) => (
    <div 
      className="gray-tile" 
      style={{ 
        aspectRatio: ratio,
        background: '#f5f5f5',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#999',
        fontSize: '12px'
      }}
    >
      Generating...
    </div>
  );

  if (authLoading) {
    return <div className="loading-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="maya-page">
      <MemberNavigation />
      
      <div className="maya-container">
        <div className="maya-interface">
          {/* Messages */}
          <div className="messages-container">
            {messages.length === 0 ? (
              <div className="editorial-welcome">
                <div className="maya-hero">
                  <div className="maya-avatar-editorial">
                    <img
                      src="https://i.postimg.cc/mkqSzq3M/out-1-20.png"
                      alt="Maya - Your Personal Brand Stylist"
                    />
                  </div>
                  <div className="hero-eyebrow">Personal Brand Photography</div>
                  <h1 className="hero-title-main">Ready to look</h1>
                  <h2 className="hero-title-sub">Incredible?</h2>
                  <p className="hero-description">
                    I'm Maya, your personal brand stylist. Select your framing, and I'll create sophisticated looks that tell your success story.
                  </p>
                </div>

                {!selectedFraming ? (
                  <div className="framing-cards">
                    <div className="framing-grid">
                      {[
                        {
                          framing: 'close' as Framing,
                          title: 'Close-Up',
                          subtitle: 'Portrait Focus',
                          description: 'Intimate headshots that capture confidence and authority',
                          image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=500&fit=crop&crop=face',
                          aspect: '4/5'
                        },
                        {
                          framing: 'half' as Framing,
                          title: 'Half Body',
                          subtitle: 'Fashion Forward',
                          description: 'Show your style and presence with sophisticated styling',
                          image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=500&fit=crop&crop=entropy',
                          aspect: '3/4'
                        },
                        {
                          framing: 'full' as Framing,
                          title: 'Full Scene',
                          subtitle: 'Editorial Story',
                          description: 'Complete environmental storytelling for your brand',
                          image: 'https://images.unsplash.com/photo-1594736797933-d0bc62d1ba99?w=400&h=500&fit=crop&crop=entropy',
                          aspect: '4/5'
                        }
                      ].map((card) => (
                        <div
                          key={card.framing}
                          className="framing-card"
                          onClick={() => {
                            setSelectedFraming(card.framing);
                            setIntent({ ...intent, framing: card.framing });
                          }}
                        >
                          <div className="card-image-container">
                            <img src={card.image} alt={card.title} />
                            <div className="card-overlay">
                              <div className="card-content">
                                <div className="card-eyebrow">{card.subtitle}</div>
                                <h3 className="card-title">{card.title}</h3>
                                <p className="card-description">{card.description}</p>
                                <div className="card-cta">Select Framing</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="style-selection">
                    <div className="selection-header">
                      <button 
                        className="back-button"
                        onClick={() => setSelectedFraming(null)}
                      >
                        ← Back to Framing
                      </button>
                      <div className="selected-framing">
                        <span className="selected-eyebrow">Selected</span>
                        <h3 className="selected-title">
                          {selectedFraming === 'close' && 'Close-Up Portrait'}
                          {selectedFraming === 'half' && 'Half Body Fashion'}
                          {selectedFraming === 'full' && 'Full Scene Editorial'}
                        </h3>
                      </div>
                    </div>

                    <div className="luxury-categories">
                      <div className="category-section">
                        <h4 className="category-title">Style Persona</h4>
                        <div className="category-grid">
                          {([
                            { key: 'future_ceo', label: 'Future CEO', desc: 'Executive presence and authority' },
                            { key: 'off_duty', label: 'Off-Duty Model', desc: 'Effortless luxury and grace' },
                            { key: 'social_queen', label: 'Social Queen', desc: 'Magnetic social confidence' },
                            { key: 'date_night', label: 'Date Night', desc: 'Sophisticated evening allure' },
                            { key: 'everyday_icon', label: 'Everyday Icon', desc: 'Elevated casual elegance' },
                            { key: 'power_player', label: 'Power Player', desc: 'Industry leadership energy' },
                          ] as { key: Style; label: string; desc: string }[]).map((style) => (
                            <div
                              key={style.key}
                              className={`luxury-option ${intent.style === style.key ? 'selected' : ''}`}
                              onClick={() => setIntent({ ...intent, style: style.key })}
                            >
                              <h5 className="option-title">{style.label}</h5>
                              <p className="option-description">{style.desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="category-section">
                        <h4 className="category-title">Mood & Atmosphere</h4>
                        <div className="category-grid">
                          {([
                            { key: 'quiet_luxury', label: 'Quiet Luxury', desc: 'Understated sophistication' },
                            { key: 'cinematic', label: 'Cinematic', desc: 'Dramatic editorial lighting' },
                            { key: 'natural_light', label: 'Natural Light', desc: 'Authentic golden hour glow' },
                            { key: 'studio_clean', label: 'Studio Clean', desc: 'Minimal professional aesthetic' },
                          ] as { key: Vibe; label: string; desc: string }[]).map((vibe) => (
                            <div
                              key={vibe.key}
                              className={`luxury-option ${intent.vibe === vibe.key ? 'selected' : ''}`}
                              onClick={() => setIntent({ ...intent, vibe: vibe.key })}
                            >
                              <h5 className="option-title">{vibe.label}</h5>
                              <p className="option-description">{vibe.desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="compose-section">
                        <button
                          className="luxury-compose-button"
                          onClick={() => composeWithMaya()}
                          disabled={isTyping}
                        >
                          <span className="button-text">Create with Maya</span>
                          <span className="button-subtitle">Generate your professional brand photos</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                {messages.map((message, index) => {
                  const isMaya = message.role === 'maya';
                  return (
                    <div key={index} className={`message ${message.role}`}>
                      <div className="message-header">
                        {isMaya && (
                          <>
                            <div className="message-avatar">
                              <img
                                src="https://i.postimg.cc/mkqSzq3M/out-1-20.png"
                                alt="Maya"
                              />
                            </div>
                            <div className="message-sender">Maya</div>
                          </>
                        )}
                        <div className="message-time">{formatTimestamp(message.timestamp)}</div>
                        {!isMaya && (
                          <>
                            <div className="message-sender">{user?.firstName || 'You'}</div>
                            <div className="message-avatar">{user?.firstName?.[0] || 'U'}</div>
                          </>
                        )}
                      </div>

                      <div className="message-content">
                        <div className="message-text">
                          {message.content.split('\n').map((line, i) => (
                            <span key={i}>
                              {line}
                              {i < message.content.split('\n').length - 1 && <br />}
                            </span>
                          ))}
                        </div>

                        {/* If Maya has variants but no images yet, show subtle gray placeholders */}
                        {isMaya && message.variants && !message.imagePreview && (
                          <div className="image-grid" style={{ marginTop: 12 }}>
                            <GrayTile ratio={intent.framing === 'full' ? '4 / 5' : '3 / 4'} />
                            <GrayTile ratio={intent.framing === 'full' ? '4 / 5' : '3 / 4'} />
                            <GrayTile ratio={intent.framing === 'full' ? '4 / 5' : '3 / 4'} />
                          </div>
                        )}

                        {/* Show real images if available */}
                        {message.imagePreview && message.imagePreview.length > 0 && (
                          <div className="image-grid" style={{ marginTop: 12 }}>
                            {message.imagePreview.map((url, idx) => (
                              <div key={idx} className="image-item">
                                <img 
                                  src={url} 
                                  alt={`Generated ${idx + 1}`}
                                  onClick={() => setSelectedImage(url)}
                                  style={{ cursor: 'pointer' }}
                                />
                                <button
                                  className="save-button"
                                  onClick={() => saveImageToGallery(url)}
                                  disabled={savingImages.has(url) || savedImages.has(url)}
                                >
                                  {savedImages.has(url) ? 'Saved' : savingImages.has(url) ? 'Saving...' : 'Save'}
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Generate button for Maya messages */}
                        {isMaya && message.canGenerate && (
                          <button
                            className="generate-button"
                            onClick={() => generateImages(message, message.nextVariantIndex || 0)}
                            disabled={isGenerating}
                            style={{ marginTop: 12 }}
                          >
                            {isGenerating ? `Generating... ${Math.round(generationProgress)}%` : 'Create with Maya'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image preview modal */}
      {selectedImage && (
        <div className="image-modal" onClick={() => setSelectedImage(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <img src={selectedImage} alt="Full size preview" />
            <button className="modal-close" onClick={() => setSelectedImage(null)}>×</button>
          </div>
        </div>
      )}

      <style>{`
        /* Editorial Welcome Styles */
        .editorial-welcome {
          max-width: 1200px;
          margin: 0 auto;
          padding: 60px 20px;
        }

        .maya-hero {
          text-align: center;
          margin-bottom: 80px;
        }

        .maya-avatar-editorial {
          width: 120px;
          height: 120px;
          margin: 0 auto 40px;
          border-radius: 50%;
          overflow: hidden;
          border: 2px solid #f5f5f5;
        }

        .maya-avatar-editorial img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .hero-eyebrow {
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.4em;
          text-transform: uppercase;
          color: #666;
          margin-bottom: 24px;
        }

        .hero-title-main {
          font-family: 'Times New Roman', serif;
          font-size: clamp(3rem, 8vw, 6rem);
          font-weight: 200;
          letter-spacing: -0.01em;
          line-height: 1;
          text-transform: uppercase;
          margin-bottom: 20px;
        }

        .hero-title-sub {
          font-family: 'Times New Roman', serif;
          font-size: clamp(2rem, 6vw, 4rem);
          font-weight: 200;
          letter-spacing: -0.01em;
          line-height: 1;
          text-transform: uppercase;
          opacity: 0.7;
          margin-bottom: 40px;
        }

        .hero-description {
          font-size: 16px;
          line-height: 1.6;
          font-weight: 300;
          max-width: 600px;
          margin: 0 auto;
          color: #666;
        }

        /* Framing Cards */
        .framing-cards {
          margin-top: 60px;
        }

        .framing-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 30px;
          max-width: 1000px;
          margin: 0 auto;
        }

        .framing-card {
          position: relative;
          background: #fff;
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.5s ease;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }

        .framing-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 30px rgba(0,0,0,0.15);
        }

        .card-image-container {
          position: relative;
          aspect-ratio: 4/5;
          overflow: hidden;
        }

        .card-image-container img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .framing-card:hover .card-image-container img {
          transform: scale(1.05);
        }

        .card-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, transparent 40%, rgba(10, 10, 10, 0.9) 100%);
          opacity: 0;
          transition: opacity 0.5s ease;
          display: flex;
          align-items: flex-end;
          padding: 30px;
        }

        .framing-card:hover .card-overlay {
          opacity: 1;
        }

        .card-content {
          color: white;
        }

        .card-eyebrow {
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          opacity: 0.8;
          margin-bottom: 8px;
        }

        .card-title {
          font-family: 'Times New Roman', serif;
          font-size: 28px;
          font-weight: 300;
          margin-bottom: 12px;
          line-height: 1.2;
        }

        .card-description {
          font-size: 14px;
          line-height: 1.4;
          opacity: 0.9;
          margin-bottom: 20px;
        }

        .card-cta {
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          padding: 12px 24px;
          border: 1px solid white;
          display: inline-block;
          transition: all 0.3s ease;
        }

        .card-cta:hover {
          background: white;
          color: #0a0a0a;
        }

        /* Style Selection */
        .style-selection {
          max-width: 800px;
          margin: 0 auto;
        }

        .selection-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 60px;
          padding-bottom: 20px;
          border-bottom: 1px solid #e5e5e5;
        }

        .back-button {
          font-size: 14px;
          color: #666;
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px 0;
          transition: color 0.3s ease;
        }

        .back-button:hover {
          color: #0a0a0a;
        }

        .selected-eyebrow {
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.4em;
          text-transform: uppercase;
          color: #666;
          display: block;
        }

        .selected-title {
          font-family: 'Times New Roman', serif;
          font-size: 24px;
          font-weight: 300;
          margin-top: 4px;
        }

        /* Luxury Categories */
        .luxury-categories {
          space-y: 50px;
        }

        .category-section {
          margin-bottom: 50px;
        }

        .category-title {
          font-family: 'Times New Roman', serif;
          font-size: 20px;
          font-weight: 300;
          margin-bottom: 30px;
          text-align: center;
        }

        .category-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
        }

        .luxury-option {
          padding: 24px;
          border: 1px solid #e5e5e5;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: center;
        }

        .luxury-option:hover {
          border-color: #0a0a0a;
          background: #fafafa;
        }

        .luxury-option.selected {
          background: #0a0a0a;
          color: white;
          border-color: #0a0a0a;
        }

        .option-title {
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 8px;
        }

        .option-description {
          font-size: 12px;
          opacity: 0.7;
          line-height: 1.4;
        }

        /* Compose Section */
        .compose-section {
          text-align: center;
          margin-top: 60px;
        }

        .luxury-compose-button {
          background: #0a0a0a;
          color: white;
          border: none;
          padding: 20px 40px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          min-width: 240px;
        }

        .luxury-compose-button:hover:not(:disabled) {
          background: #333;
          transform: translateY(-2px);
        }

        .luxury-compose-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .button-text {
          font-size: 14px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 4px;
        }

        .button-subtitle {
          font-size: 11px;
          opacity: 0.8;
        }

        /* Message styles */
        .message {
          margin-bottom: 24px;
          max-width: 800px;
          margin-left: auto;
          margin-right: auto;
        }

        .message.maya {
          margin-left: 0;
        }

        .message.user {
          margin-right: 0;
        }

        .message-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }

        .message-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          overflow: hidden;
          background: #f5f5f5;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .message-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .message-sender {
          font-size: 14px;
          font-weight: 500;
        }

        .message-time {
          font-size: 12px;
          color: #666;
          margin-left: auto;
        }

        .message-content {
          padding-left: 44px;
        }

        .message.user .message-content {
          padding-left: 0;
          padding-right: 44px;
        }

        .message-text {
          font-size: 14px;
          line-height: 1.6;
        }

        .image-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
          margin-top: 16px;
        }

        .image-item {
          position: relative;
        }

        .image-item img {
          width: 100%;
          border-radius: 8px;
        }

        .save-button {
          position: absolute;
          top: 8px;
          right: 8px;
          background: rgba(0,0,0,0.7);
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
        }

        .generate-button {
          background: #0a0a0a;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: background 0.3s ease;
        }

        .generate-button:hover:not(:disabled) {
          background: #333;
        }

        .generate-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .framing-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          
          .selection-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }
          
          .category-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}