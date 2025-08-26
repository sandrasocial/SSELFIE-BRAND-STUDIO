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

  // Soft-intent (chips) local selection
  const [intent, setIntent] = useState<Intent>({
    framing: 'close',
    style: 'future_ceo',
    vibe: 'quiet_luxury',
  });

  // ===== Auth & initial =====
  useEffect(() => {
    if (!authLoading && !isAuthenticated) setLocation('/');
  }, [isAuthenticated, authLoading, setLocation]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const chatIdFromUrl = urlParams.get('chat');
      if (chatIdFromUrl) {
        const parsed = parseInt(chatIdFromUrl);
        if (!isNaN(parsed)) {
          setCurrentChatId(parsed);
          loadChatHistory(parsed);
        }
      }
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // ===== Chat history links =====
  const ChatHistoryLinks = ({ onChatSelect }: { onChatSelect: (chatId: number) => void }) => {
    const { data: chats, isLoading } = useQuery<MayaChat[]>({
      queryKey: ['/api/maya-chats'],
      enabled: !!user,
      staleTime: 30000,
    });

    if (isLoading) {
      return <div className="session-item"><div className="session-title">Loading sessions...</div></div>;
    }
    if (!chats || chats.length === 0) {
      return <div className="session-item"><div className="session-preview">No previous sessions</div></div>;
    }

    return (
      <>
        {chats.slice(0, 8).map((chat) => (
          <div key={chat.id} className="session-item" onClick={() => onChatSelect(chat.id)}>
            <div className="session-title">{chat.chatTitle}</div>
            <div className="session-preview">{chat.chatSummary || 'Personal brand styling session'}</div>
          </div>
        ))}
        {chats.length > 8 && <div className="more-sessions">{chats.length - 8} more sessions</div>}
      </>
    );
  };

  async function loadChatHistory(chatId: number) {
    try {
      const response = await apiRequest(`/api/maya-chats/${chatId}/messages`);
      if (response && Array.isArray(response)) {
        setMessages(response);
        setCurrentChatId(chatId);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      toast({ title: 'Error', description: 'Failed to load chat history' });
    }
  }

  function startNewSession() {
    setMessages([]);
    setCurrentChatId(null);
    window.history.replaceState({}, '', '/maya');
  }

  // ===== Basic user text → Maya chat (kept minimal) =====
  async function sendMessage() {
    if (!input.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      // Use the working endpoint (updated to match server implementation)
      const response = await apiRequest('/api/member-maya-chat', 'POST', {
        message: userMessage.content,
        chatId: currentChatId,
        chatHistory: messages.map((m) => ({ role: m.role, content: m.content })),
      });

      if (response.chatId && !currentChatId) {
        setCurrentChatId(response.chatId);
        window.history.replaceState({}, '', `/maya?chat=${response.chatId}`);
      }

      const mayaMessage: ChatMessage = {
        role: 'maya',
        content: response.message,
        timestamp: new Date().toISOString(),
        // do not auto-generate, we'll offer "Create with Maya" when using compose flow
      };
      setMessages((prev) => [...prev, mayaMessage]);
      queryClient.invalidateQueries({ queryKey: ['/api/maya-chats'] });
    } catch (err) {
      console.error('Error sending message:', err);
      toast({ title: 'Error', description: 'Failed to send message. Please try again.' });
    } finally {
      setIsTyping(false);
    }
  }

  // ===== Compose flow (luxury soft-intent → Maya crafts variants) =====
  async function composeWithMaya(chosen?: Partial<Intent>) {
    const finalIntent: Intent = { ...intent, ...(chosen || {}) };
    setIntent(finalIntent);

    // Show "typing" while composing
    setIsTyping(true);

    try {
      const response = await apiRequest('/api/maya/compose', 'POST', {
        intent: finalIntent,
        chatHistory: messages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
      });

      const mayaMsg: ChatMessage = {
        role: 'maya',
        content: response.message || "Let's create something beautiful.",
        timestamp: new Date().toISOString(),
        canGenerate: true,
        variants: response.variants || [],
        nextVariantIndex: 0,
      };

      setMessages((prev) => [...prev, mayaMsg]);
      // Optional: record it in chat list
      queryClient.invalidateQueries({ queryKey: ['/api/maya-chats'] });
    } catch (err: any) {
      console.error('Compose error:', err);
      toast({
        title: 'Maya is busy',
        description: err?.message || 'Could not compose looks. Please try again.',
      });
    } finally {
      setIsTyping(false);
    }
  }

  // ===== Generate (uses the next variant, then advances) =====
  async function generateFromMessage(idx: number) {
    const msg = messages[idx];
    if (!msg?.variants || msg.nextVariantIndex === undefined) return;
    if (isGenerating) return;

    const useIndex = msg.nextVariantIndex;
    const prompt = msg.variants[useIndex] || msg.variants[0];

    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      const response = await apiRequest('/api/maya-generate-images', 'POST', {
        prompt,                      // server enforces realism + params
        chatId: currentChatId,
      });

      if (!response.predictionId) throw new Error('Failed to start generation');

      await pollPrediction(response.predictionId, async (result) => {
        // On completion, attach images to this message
        setMessages((prev) => {
          const copy = [...prev];
          const target = copy[idx];
          if (!target) return copy;

          target.imagePreview = result.imageUrls || [];
          target.canGenerate = (target.nextVariantIndex ?? 0) < (target.variants?.length ?? 0) - 1;
          target.nextVariantIndex = Math.min((target.nextVariantIndex ?? 0) + 1, (target.variants?.length ?? 1) - 1);
          return copy;
        });

        setIsGenerating(false);
        setGenerationProgress(100);
      });
    } catch (error) {
      console.error('Generation error:', error);
      toast({ title: 'Generation Error', description: 'Failed to generate images. Please try again.' });
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  }

  async function pollPrediction(predictionId: string, onComplete: (result: any) => Promise<void>) {
    let keepPolling = true;

    const loop = async () => {
      if (!keepPolling) return;

      try {
        const statusResponse = await fetch(`/api/check-generation/${predictionId}`, { 
          credentials: 'include' 
        }).then(res => res.json());

        if (statusResponse.status === 'completed' && statusResponse.imageUrls) {
          keepPolling = false;
          await onComplete(statusResponse);
          return;
        } else if (statusResponse.status === 'failed') {
          keepPolling = false;
          throw new Error(statusResponse.error || 'Generation failed');
        } else {
          setGenerationProgress((p) => Math.min(90, p + 8));
          setTimeout(loop, 1500);
        }
      } catch (e) {
        keepPolling = false;
        throw e;
      }
    };

    setTimeout(loop, 1200);
  }

  // ===== Save to gallery (heart) =====
  async function saveToGallery(imageUrl: string) {
    if (savingImages.has(imageUrl) || savedImages.has(imageUrl)) return;
    setSavingImages((prev) => new Set(prev).add(imageUrl));

    try {
      await apiRequest('/api/save-image', 'POST', {
        imageUrl,
        source: 'maya-chat',
      });
      setSavedImages((prev) => new Set(prev).add(imageUrl));
      toast({ title: 'Saved!', description: 'Image added to your gallery' });
    } catch (error) {
      console.error('Save error:', error);
      toast({ title: 'Error', description: 'Failed to save image' });
    } finally {
      setSavingImages((prev) => {
        const next = new Set(prev);
        next.delete(imageUrl);
        return next;
      });
    }
  }

  // ===== UI helpers =====
  function handleKeyPress(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function formatTimestamp(ts: string) {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function scrollToChat() {
    const chatContainer = document.querySelector('.main-container');
    chatContainer?.scrollIntoView({ behavior: 'smooth' });
  }

  // ===== Visual placeholders (gray) for previews before images arrive =====
  const GrayTile = ({ ratio = '4 / 5' }: { ratio?: string }) => (
    <div
      style={{
        width: '100%',
        aspectRatio: ratio,
        background: '#f5f5f5',
        border: '1px solid #e5e5e5',
      }}
    />
  );

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <>
      <MemberNavigation transparent={true} />

      {/* Page styles – matches your Editorial Styleguide */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        * { margin:0; padding:0; box-sizing:border-box; }
        :root {
          --black:#0a0a0a; --white:#fff; --editorial-gray:#f5f5f5;
          --mid-gray:#fafafa; --soft-gray:#666; --accent-line:#e5e5e5;
        }
        body {
          font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
          font-weight:300; color:var(--black); background:var(--white);
          line-height:1.6; letter-spacing:-0.01em;
        }
        .hero { height:100vh; background:var(--black); color:var(--white);
          position:relative; overflow:hidden; display:flex; align-items:center; justify-content:center; }
        .hero-bg { position:absolute; inset:0; opacity:.4; }
        .hero-bg img { width:100%; height:100%; object-fit:cover; object-position:center 20%; }
        .hero-content { position:relative; z-index:2; text-align:center; max-width:800px; padding:0 40px; }
        .hero h1 { font-size:clamp(2.5rem,5vw,4.5rem); font-weight:200; margin-bottom:1.5rem;
          letter-spacing:-0.02em; line-height:1.1; }
        .hero p { font-size:clamp(1rem,2vw,1.4rem); margin-bottom:2.5rem; opacity:.9;
          font-weight:300; max-width:600px; margin-left:auto; margin-right:auto; }
        .action-row { display:flex; gap:1.5rem; justify-content:center; align-items:center;
          flex-wrap:wrap; margin-top:2rem; }
        .primary-btn { background:var(--white); color:var(--black); padding:16px 32px;
          border:none; font-weight:400; letter-spacing:-0.01em; cursor:pointer;
          transition:all .3s ease; font-size:15px; }
        .primary-btn:hover { transform:translateY(-2px); box-shadow:0 8px 25px rgba(0,0,0,.15); }
        .secondary-btn { background:transparent; color:var(--white); padding:16px 32px;
          border:1px solid rgba(255,255,255,.3); font-weight:400; letter-spacing:-0.01em;
          cursor:pointer; transition:all .3s ease; font-size:15px; }
        .secondary-btn:hover { background:rgba(255,255,255,.1); border-color:rgba(255,255,255,.6); }

        .main-container { min-height:100vh; background:var(--white); display:flex; }
        .sidebar { width:280px; background:var(--mid-gray); border-right:1px solid var(--accent-line);
          padding:2rem 1.5rem; overflow-y:auto; flex-shrink:0; }
        .sidebar h3 { font-size:.9rem; text-transform:uppercase; letter-spacing:.1em;
          color:var(--soft-gray); margin-bottom:1.5rem; font-weight:500; }
        .new-session { background:var(--black); color:var(--white); border:none;
          padding:12px 20px; width:100%; margin-bottom:2rem; cursor:pointer;
          font-weight:400; letter-spacing:-0.01em; transition:all .2s ease; font-size:14px; }
        .new-session:hover { background:#333; }
        .session-item { padding:12px 0; border-bottom:1px solid var(--accent-line);
          cursor:pointer; transition:opacity .2s ease; }
        .session-item:hover { opacity:.7; }
        .session-title { font-weight:400; font-size:14px; margin-bottom:4px; line-height:1.3; }
        .session-preview { font-size:13px; color:var(--soft-gray); line-height:1.4; }
        .more-sessions { font-size:13px; color:var(--soft-gray); padding:12px 0;
          text-align:center; font-style:italic; }

        .chat-area { flex:1; display:flex; flex-direction:column; }
        .chat-messages { flex:1; padding:3rem 2rem 2rem; overflow-y:auto;
          max-width:800px; margin:0 auto; width:100%; }
        .message { margin-bottom:2rem; }
        .message.user { text-align:right; }
        .message-content { display:inline-block; max-width:70%; }
        .message.user .message-content { background:var(--editorial-gray);
          padding:12px 16px; border-radius:16px 16px 4px 16px; }
        .message.maya .message-content { }
        .message-text { line-height:1.6; font-size:15px; margin-bottom:8px; }
        .message-time { font-size:12px; color:var(--soft-gray); margin-top:8px; }
        .message.user .message-time { text-align:right; }

        .image-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr));
          gap:12px; margin:1rem 0; }
        .image-item { position:relative; aspect-ratio:4/5; overflow:hidden;
          border-radius:4px; border:1px solid var(--accent-line); }
        .image-item img { width:100%; height:100%; object-fit:cover; transition:transform .3s ease; }
        .image-item:hover img { transform:scale(1.05); }
        .image-actions { position:absolute; top:8px; right:8px; display:flex; gap:6px; }
        .heart-btn { width:32px; height:32px; border:none; border-radius:50%;
          background:rgba(255,255,255,.9); cursor:pointer; display:flex;
          align-items:center; justify-content:center; transition:all .2s ease; }
        .heart-btn:hover { background:var(--white); transform:scale(1.1); }
        .heart-btn.saved { background:#ff4757; color:var(--white); }

        .create-btn { background:var(--black); color:var(--white); border:none;
          padding:12px 20px; margin:1rem 0; cursor:pointer; font-weight:400;
          letter-spacing:-0.01em; transition:all .2s ease; font-size:14px; border-radius:4px; }
        .create-btn:hover { background:#333; }
        .create-btn:disabled { background:var(--soft-gray); cursor:not-allowed; }

        .intent-chips { display:flex; gap:8px; margin:1rem 0; flex-wrap:wrap; }
        .chip { padding:6px 12px; border:1px solid var(--accent-line); border-radius:20px;
          background:var(--white); cursor:pointer; font-size:13px; transition:all .2s ease; }
        .chip:hover, .chip.active { background:var(--black); color:var(--white); }

        .input-area { padding:2rem; border-top:1px solid var(--accent-line);
          max-width:800px; margin:0 auto; width:100%; }
        .input-wrapper { position:relative; }
        .input-field { width:100%; padding:16px 50px 16px 16px; border:1px solid var(--accent-line);
          border-radius:8px; font-size:15px; resize:none; font-family:inherit;
          background:var(--white); line-height:1.4; }
        .input-field:focus { outline:none; border-color:var(--black); }
        .send-btn { position:absolute; right:12px; top:50%; transform:translateY(-50%);
          background:none; border:none; cursor:pointer; padding:4px; }
        .send-btn:disabled { opacity:.4; cursor:not-allowed; }

        .typing { display:flex; align-items:center; gap:8px; margin:1rem 0;
          font-size:14px; color:var(--soft-gray); }
        .typing-dots { display:flex; gap:4px; }
        .typing-dot { width:6px; height:6px; border-radius:50%; background:var(--soft-gray);
          animation:typing 1.4s infinite ease-in-out; }
        .typing-dot:nth-child(1) { animation-delay:0s; }
        .typing-dot:nth-child(2) { animation-delay:.2s; }
        .typing-dot:nth-child(3) { animation-delay:.4s; }
        @keyframes typing { 0%,80%,100%{opacity:.3;transform:scale(.8);} 40%{opacity:1;transform:scale(1);} }

        .progress-bar { height:3px; background:var(--accent-line); border-radius:2px;
          overflow:hidden; margin:1rem 0; }
        .progress-fill { height:100%; background:var(--black);
          transition:width .3s ease; border-radius:2px; }

        .modal { position:fixed; inset:0; background:rgba(0,0,0,.8); display:flex;
          align-items:center; justify-content:center; z-index:1000; }
        .modal-content { background:var(--white); padding:2rem; border-radius:8px;
          max-width:90vw; max-height:90vh; overflow:auto; position:relative; }
        .modal-close { position:absolute; top:1rem; right:1rem; background:none;
          border:none; font-size:24px; cursor:pointer; padding:4px; }

        @media (max-width:768px) {
          .main-container { flex-direction:column; }
          .sidebar { width:100%; height:auto; max-height:200px; order:2; }
          .chat-messages { padding:1.5rem 1rem; }
          .input-area { padding:1rem; }
          .action-row { gap:1rem; }
          .primary-btn, .secondary-btn { padding:14px 24px; font-size:14px; }
        }
        `,
        }}
      />

      <div className="main-container">
        {/* Sidebar */}
        <div className="sidebar">
          <button className="new-session" onClick={startNewSession}>
            ✨ New Session
          </button>
          <h3>Recent Sessions</h3>
          <ChatHistoryLinks onChatSelect={loadChatHistory} />
        </div>

        {/* Chat area */}
        <div className="chat-area">
          {messages.length === 0 ? (
            <div className="hero">
              <div className="hero-bg">
                <img
                  src="https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?auto=format&fit=crop&w=1000&q=80"
                  alt="Maya AI Background"
                />
              </div>
              <div className="hero-content">
                <h1>Your AI Celebrity Stylist</h1>
                <p>
                  Ready to create stunning personal brand photos that capture your authentic power?
                  Let's craft the perfect look together.
                </p>
                <div className="action-row">
                  <button
                    className="primary-btn"
                    onClick={() => composeWithMaya({ style: 'future_ceo', framing: 'close' })}
                  >
                    Create CEO Look
                  </button>
                  <button
                    className="secondary-btn"
                    onClick={() => composeWithMaya({ style: 'off_duty', framing: 'half' })}
                  >
                    Casual Elevated
                  </button>
                </div>

                {/* Soft intent chips */}
                <div style={{ marginTop: '3rem' }}>
                  <div className="intent-chips">
                    <div className="chip active" onClick={() => setIntent(prev => ({ ...prev, framing: 'close' }))}>
                      Portrait
                    </div>
                    <div className="chip" onClick={() => setIntent(prev => ({ ...prev, framing: 'half' }))}>
                      Half Body
                    </div>
                    <div className="chip" onClick={() => setIntent(prev => ({ ...prev, framing: 'full' }))}>
                      Full Scene
                    </div>
                  </div>
                  <div className="intent-chips">
                    <div className="chip active" onClick={() => setIntent(prev => ({ ...prev, vibe: 'quiet_luxury' }))}>
                      Quiet Luxury
                    </div>
                    <div className="chip" onClick={() => setIntent(prev => ({ ...prev, vibe: 'cinematic' }))}>
                      Cinematic
                    </div>
                    <div className="chip" onClick={() => setIntent(prev => ({ ...prev, vibe: 'natural_light' }))}>
                      Natural Light
                    </div>
                  </div>
                </div>

                <button
                  className="secondary-btn"
                  onClick={scrollToChat}
                  style={{ marginTop: '2rem' }}
                >
                  Or chat with Maya
                </button>
              </div>
            </div>
          ) : (
            <div className="chat-messages">
              {messages.map((message, idx) => (
                <div key={idx} className={`message ${message.role}`}>
                  <div className="message-content">
                    <div className="message-text">{message.content}</div>
                    
                    {/* Image previews */}
                    {message.imagePreview && message.imagePreview.length > 0 && (
                      <div className="image-grid">
                        {message.imagePreview.map((url, imgIdx) => (
                          <div key={imgIdx} className="image-item" onClick={() => setSelectedImage(url)}>
                            <img src={url} alt={`Generated ${imgIdx + 1}`} />
                            <div className="image-actions">
                              <button
                                className={`heart-btn ${savedImages.has(url) ? 'saved' : ''}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  saveToGallery(url);
                                }}
                                disabled={savingImages.has(url)}
                              >
                                ♡
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Generate button for Maya messages with variants */}
                    {message.role === 'maya' && message.canGenerate && message.variants && (
                      <>
                        <button
                          className="create-btn"
                          onClick={() => generateFromMessage(idx)}
                          disabled={isGenerating}
                        >
                          {isGenerating ? 'Creating...' : 'Create with Maya'}
                        </button>
                        {isGenerating && (
                          <div className="progress-bar">
                            <div
                              className="progress-fill"
                              style={{ width: `${generationProgress}%` }}
                            />
                          </div>
                        )}
                      </>
                    )}
                    
                    <div className="message-time">{formatTimestamp(message.timestamp)}</div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="typing">
                  <span>Maya is thinking</span>
                  <div className="typing-dots">
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Input area */}
          <div className="input-area">
            {messages.length > 0 && (
              <div className="intent-chips">
                <button
                  className="chip"
                  onClick={() => composeWithMaya({ style: 'future_ceo', framing: 'close' })}
                >
                  CEO Portrait
                </button>
                <button
                  className="chip"
                  onClick={() => composeWithMaya({ style: 'off_duty', framing: 'half' })}
                >
                  Casual Chic
                </button>
                <button
                  className="chip"
                  onClick={() => composeWithMaya({ style: 'date_night', framing: 'full' })}
                >
                  Date Night
                </button>
              </div>
            )}
            
            <div className="input-wrapper">
              <textarea
                className="input-field"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Tell Maya about your vision..."
                rows={1}
                disabled={isTyping}
              />
              <button
                className="send-btn"
                onClick={sendMessage}
                disabled={!input.trim() || isTyping}
              >
                →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Image modal */}
      {selectedImage && (
        <div className="modal" onClick={() => setSelectedImage(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedImage(null)}>
              ×
            </button>
            <img
              src={selectedImage}
              alt="Full size preview"
              style={{ width: '100%', height: 'auto', borderRadius: '4px' }}
            />
          </div>
        </div>
      )}
    </>
  );
}