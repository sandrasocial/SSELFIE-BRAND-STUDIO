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
  canGenerate?: boolean;        // shows the “Create with Maya” button
  variants?: string[];          // up to 3 generation prompts returned from /api/maya/compose
  nextVariantIndex?: number;    // which variant to use next when user clicks again
  generatedPrompt?: string;     // the prompt Maya generated for "New Look" functionality
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
  const [seed, setSeed] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // === Studio Selections (NEW) ===
  type Framing = 'close-up' | 'half-body' | 'full-scene';
  type Category =
    | 'Future CEO'
    | 'Off-Duty Model'
    | 'Social Queen'
    | 'Date Night'
    | 'Everyday Icon'
    | 'Power Player';

  const [framing, setFraming] = useState<Framing | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [moods, setMoods] = useState<string[]>([]); // max 2

  const toggleMood = (m: string) =>
    setMoods(prev =>
      prev.includes(m)
        ? prev.filter(x => x !== m)
        : prev.length < 2
          ? [...prev, m]
          : prev
    );

  // Legacy state for backward compatibility
  const [scene, setScene] = useState<'close-up'|'half-body'|'full-scene'|null>(null);

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

  // Reset studio controls
  const resetControls = () => {
    setFraming(null);
    setCategory(null);
    setMoods([]);
    setScene(null); // Legacy
  };

  // Removed duplicate toggleMood function

  // Compose action using studio controls
  const composeWithMaya = async () => {
    if (!framing || !category) {
      toast({
        title: 'Choose a framing & category',
        description: 'Pick Close-Up / Half Body / Full Scene and one category, then tap Compose.'
      });
      return;
    }

    const pickedMoods = moods.slice(0, 2);

    // Structured brief that Maya MUST honor
    const structuredBrief =
      `[MAYA_COMPOSE_BRIEF]
framing: ${framing}
category: ${category}
moods: ${pickedMoods.join(', ') || 'none'}
constraints: always include "raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film"
return_format: First a short pep-talk in Sandra's voice. Then on a new line: PROMPT: <exact prompt ready for the generator>.
[/MAYA_COMPOSE_BRIEF]`;

    setIsTyping(true);
    try {
      const response = await apiRequest('/api/maya-chat', 'POST', {
        message: structuredBrief,
        chatId: currentChatId,
        chatHistory: messages.map(({ role, content }) => ({ role, content }))
      });

      const mayaMessage: ChatMessage = {
        role: 'maya',
        content: response.message,
        timestamp: new Date().toISOString(),
        canGenerate: response.canGenerate,
        generatedPrompt: response.generatedPrompt
      };

      setMessages(prev => [...prev, mayaMessage]);

      if (response.chatId && !currentChatId) {
        setCurrentChatId(response.chatId);
        window.history.replaceState({}, '', `/maya?chat=${response.chatId}`);
        queryClient.invalidateQueries({ queryKey: ['/api/maya-chats'] });
      }
    } catch (err) {
      console.error('Compose error:', err);
      toast({ title: 'Maya is busy', description: String(err) });
    } finally {
      setIsTyping(false);
    }
  };

  // New Look function - same brief, new seed
  const newLook = async (basePrompt: string) => {
    setSeed(String(Math.floor(Math.random() * 1_000_000_000)));
    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      const response = await apiRequest('/api/maya-generate-images', 'POST', {
        prompt: basePrompt,
        chatId: currentChatId,
      });

      if (!response.predictionId) throw new Error('Failed to start generation');

      await pollPrediction(response.predictionId, async (result) => {
        // Find the message with this prompt and update its images
        setMessages((prev) => {
          const copy = [...prev];
          const target = copy.find(msg => msg.generatedPrompt === basePrompt);
          if (!target) return copy;

          target.imagePreview = result.imageUrls || [];
          return copy;
        });

        setIsGenerating(false);
        setGenerationProgress(100);
      });
    } catch (error) {
      console.error('Generation error:', error);
      toast({ title: 'Generation Error', description: 'Failed to generate new look. Please try again.' });
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

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
      // NOTE: use the working endpoint. If your server uses /api/member-maya-chat, change here.
      const response = await apiRequest('/api/maya-chat', 'POST', {
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
        // do not auto-generate, we’ll offer “Create with Maya” when using compose flow
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
        const statusResponse = await apiRequest(`/api/check-generation/${predictionId}`, 'GET');

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
        .hero-eyebrow { font-size:11px; letter-spacing:.4em; text-transform:uppercase; color:rgba(255,255,255,.7); margin-bottom:30px; font-weight:300; }
        .hero-title { font-family:'Times New Roman',serif; font-size:clamp(3rem,8vw,6rem); line-height:.9; font-weight:200; letter-spacing:.1em; text-transform:uppercase; margin-bottom:20px; color:var(--white); }
        .hero-subtitle { font-family:'Times New Roman',serif; font-size:clamp(1rem,3vw,2rem); font-style:italic; letter-spacing:.05em; opacity:.9; margin-bottom:40px; }
        .hero-cta { display:inline-block; padding:16px 32px; font-size:11px; font-weight:400; letter-spacing:.3em; text-transform:uppercase; text-decoration:none; border:1px solid var(--white); color:var(--white); background:transparent; transition:all 300ms ease; cursor:pointer; }
        .hero-cta:hover { background:var(--white); color:var(--black); }

        .main-container { display:flex; min-height:100vh; max-width:1400px; margin:0 auto; }
        .sidebar { width:300px; background:var(--editorial-gray); border-right:1px solid var(--accent-line); padding:40px 0; overflow-y:auto; }
        .sidebar-section { padding:0 30px; margin-bottom:40px; }
        .sidebar-title { font-size:11px; font-weight:400; letter-spacing:.3em; text-transform:uppercase; color:var(--soft-gray); margin-bottom:20px; }
        .new-session-btn { width:100%; padding:16px 0; background:var(--black); color:var(--white); border:none; font-size:11px; font-weight:400; letter-spacing:.3em; text-transform:uppercase; cursor:pointer; transition:all 300ms ease; margin-bottom:30px; }
        .new-session-btn:hover { background:var(--soft-gray); }
        .session-item { padding:12px 0; border-bottom:1px solid var(--accent-line); cursor:pointer; transition:all 200ms ease; }
        .session-item:hover { background:rgba(10,10,10,0.05); }
        .session-title { font-size:14px; font-weight:400; margin-bottom:4px; line-height:1.4; }
        .session-preview { font-size:12px; color:var(--soft-gray); line-height:1.3; }
        .more-sessions { color:var(--soft-gray); font-size:12px; text-align:center; padding:20px 0; }

        .chat-area { flex:1; display:flex; flex-direction:column; background:var(--white); }
        .chat-header { padding:30px 40px; border-bottom:1px solid var(--accent-line); background:var(--white); }
        .chat-title { font-family:'Times New Roman',serif; font-size:24px; font-weight:200; margin-bottom:8px; text-transform:uppercase; letter-spacing:.06em; }
        .chat-subtitle { font-size:14px; color:var(--soft-gray); }

        .intent-bar { margin-top:18px; display:flex; gap:12px; flex-wrap:wrap; }
        .chip { padding:10px 14px; font-size:11px; letter-spacing:.3em; text-transform:uppercase;
          border:1px solid var(--accent-line); background:#fff; cursor:pointer; transition:all .25s ease; }
        .chip.active, .chip:hover { border-color:var(--black); }

        .messages-container { flex:1; overflow-y:auto; padding:40px; }
        .welcome-state { text-align:center; max-width:620px; margin:60px auto; }
        .maya-avatar { width:80px; height:80px; border-radius:50%; margin:0 auto 30px; overflow:hidden; border:2px solid var(--accent-line); }
        .maya-avatar img { width:100%; height:100%; object-fit:cover; }
        .welcome-eyebrow { font-size:11px; font-weight:400; letter-spacing:.4em; text-transform:uppercase; color:var(--soft-gray); margin-bottom:20px; }
        .welcome-title { font-family:'Times New Roman',serif; font-size:clamp(2rem,4vw,3rem); font-weight:200; letter-spacing:-.01em; line-height:1; text-transform:uppercase; margin-bottom:16px; }
        .welcome-description { font-size:16px; line-height:1.6; margin-bottom:28px; color:var(--soft-gray); }
        .style-quickselect { display:grid; grid-template-columns:repeat(3,1fr); gap:15px; margin-top:28px; }
        .style-option { aspect-ratio:1; background:var(--editorial-gray); border:1px solid var(--accent-line); cursor:pointer; transition:all .3s ease; position:relative; overflow:hidden; }
        .style-option:hover { transform:scale(1.03); border-color:var(--black); }
        .style-preview { width:100%; height:100%; display:flex; align-items:center; justify-content:center; font-size:10px; letter-spacing:.2em; text-transform:uppercase; color:var(--soft-gray); }
        .style-label { position:absolute; bottom:0; left:0; right:0; background:linear-gradient(transparent, rgba(10,10,10,.75)); color:#fff; padding:14px 10px 10px; font-size:10px; letter-spacing:.2em; text-transform:uppercase; text-align:center; transform:translateY(100%); transition:transform .3s ease; }
        .style-option:hover .style-label { transform:translateY(0); }

        .message { margin-bottom:30px; max-width:700px; }
        .message.maya { margin-right:auto; }
        .message.user { margin-left:auto; text-align:right; }
        .message-header { display:flex; align-items:center; margin-bottom:12px; gap:12px; }
        .message.user .message-header { justify-content:flex-end; }
        .message-avatar { width:32px; height:32px; border-radius:50%; background:var(--editorial-gray); display:flex; align-items:center; justify-content:center; font-size:10px; color:var(--soft-gray); overflow:hidden; }
        .message-avatar img { width:100%; height:100%; object-fit:cover; }
        .message.user .message-avatar { background:var(--black); color:var(--white); }
        .message-sender { font-size:11px; font-weight:400; letter-spacing:.3em; text-transform:uppercase; color:var(--soft-gray); }
        .message-time { font-size:10px; color:var(--soft-gray); opacity:.6; }
        .message-content { background:var(--editorial-gray); padding:24px; position:relative; }
        .message.user .message-content { background:var(--black); color:var(--white); }
        .message-text { font-size:15px; line-height:1.6; }

        .look-actions { margin-top:16px; display:flex; gap:10px; flex-wrap:wrap; }
        .look-btn { padding:12px 20px; font-size:11px; letter-spacing:.3em; text-transform:uppercase; border:none; color:#fff; background:var(--black); cursor:pointer; transition:all .25s; }
        .look-btn.secondary { background:#777; }
        .look-btn:disabled { background:#bbb; cursor:not-allowed; }

        /* Studio Controls */
        .studio-controls { margin-top:20px; }
        .scene-cards { display:flex; gap:16px; margin-bottom:20px; }
        .scene-card { flex:1; min-width:120px; cursor:pointer; transition:all .3s ease; border:1px solid var(--accent-line); padding:12px; background:var(--white); }
        .scene-card:hover { border-color:var(--black); transform:scale(1.02); }
        .scene-card.selected { border-color:var(--black); background:var(--editorial-gray); }
        .scene-image { margin-bottom:8px; }
        .scene-label { font-size:11px; letter-spacing:.3em; text-transform:uppercase; text-align:center; color:var(--soft-gray); }
        .scene-card.selected .scene-label { color:var(--black); }

        .controls-reveal { margin-top:24px; animation:fadeIn 0.3s ease; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        
        .category-section, .mood-section { margin-bottom:20px; }
        .section-label { font-size:11px; font-weight:400; letter-spacing:.3em; text-transform:uppercase; color:var(--soft-gray); margin-bottom:12px; }
        .chip-row { display:flex; gap:8px; flex-wrap:wrap; }
        .chip { padding:8px 12px; font-size:11px; letter-spacing:.2em; text-transform:uppercase; border:1px solid var(--accent-line); background:var(--white); cursor:pointer; transition:all .25s ease; }
        .chip:hover { border-color:var(--black); }
        .chip.selected { background:var(--black); color:var(--white); border-color:var(--black); }

        .controls-actions { display:flex; align-items:center; justify-content:space-between; margin-top:20px; padding-top:20px; border-top:1px solid var(--accent-line); }
        .selection-summary { font-size:12px; color:var(--soft-gray); flex:1; }
        .action-buttons { display:flex; gap:12px; align-items:center; }
        .compose-btn { padding:10px 20px; font-size:11px; letter-spacing:.3em; text-transform:uppercase; background:var(--black); color:var(--white); border:none; cursor:pointer; transition:all .25s; }
        .compose-btn:disabled { background:#ccc; cursor:not-allowed; }
        .compose-btn:hover:not(:disabled) { background:var(--soft-gray); }
        .reset-link { font-size:11px; color:var(--soft-gray); text-decoration:underline; cursor:pointer; transition:color .25s; }
        .reset-link:hover { color:var(--black); }

        .image-grid { margin-top:16px; display:grid; grid-template-columns:repeat(2,1fr); gap:16px; }
        .image-item { position:relative; cursor:pointer; }
        .image-item img { width:100%; height:192px; object-fit:cover; transition:transform .2s ease; }
        .image-item:hover img { transform:scale(1.03); }
        .save-btn { position:absolute; top:8px; right:8px; width:32px; height:32px; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,.9); border:1px solid #e5e5e5; border-radius:50%; transition:all .2s; backdrop-filter:blur(8px); opacity:0; }
        .image-item:hover .save-btn { opacity:1; }
        .save-btn:hover { background:#fff; border-color:#ccc; }

        .typing-indicator { display:flex; align-items:center; gap:12px; margin-bottom:30px; }
        .typing-dots { display:flex; gap:4px; }
        .typing-dot { width:6px; height:6px; border-radius:50%; background:var(--soft-gray); animation:typing 1.4s infinite; }
        .typing-dot:nth-child(2){ animation-delay:.2s; } .typing-dot:nth-child(3){ animation-delay:.4s; }
        @keyframes typing { 0%,60%,100%{opacity:.3;} 30%{opacity:1;} }
        .typing-text { font-size:12px; color:var(--soft-gray); }

        .input-area { padding:30px 40px; border-top:1px solid var(--accent-line); background:#fff; }
        .input-container { display:flex; gap:15px; align-items:flex-end; }
        .input-field { flex:1; border:1px solid var(--accent-line); background:#fff; padding:16px 20px; font-size:14px; line-height:1.4; font-family:inherit; resize:none; min-height:24px; max-height:120px; }
        .input-field:focus { outline:none; border-color:var(--black); }
        .input-field::placeholder { color:var(--soft-gray); text-transform:uppercase; font-size:11px; letter-spacing:.3em; }
        .send-btn { padding:16px 24px; background:var(--black); color:#fff; border:none; font-size:11px; font-weight:400; letter-spacing:.3em; text-transform:uppercase; cursor:pointer; transition:all .3s; }
        .send-btn:hover { background:var(--soft-gray); }
        .send-btn:disabled { background:var(--accent-line); cursor:not-allowed; }

        @media (max-width:768px) {
          .main-container { flex-direction:column; height:auto; }
          .sidebar { width:100%; height:auto; order:2; }
          .chat-area { order:1; min-height:70vh; }
          .messages-container,.input-area,.chat-header { padding:20px; }
          .style-quickselect { grid-template-columns:repeat(2,1fr); }
        }
      `,
        }}
      />

      {/* Hero (unchanged) */}
      <section className="hero">
        <div className="hero-bg">
          <img
            src="https://i.postimg.cc/mkqSzq3M/out-1-20.png"
            alt="Maya - Your Personal Brand Stylist"
          />
        </div>
        <div className="hero-content">
          <div className="hero-eyebrow">Professional photos, no photographer needed</div>
          <h1 className="hero-title">Maya</h1>
          <p className="hero-subtitle">Your Personal Brand Stylist</p>
          <button className="hero-cta" onClick={scrollToChat}>
            Start Creating
          </button>
        </div>
      </section>

      <div className="main-container">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-section">
            <button className="new-session-btn" onClick={startNewSession}>
              New Session
            </button>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-title">Previous Sessions</div>
            <ChatHistoryLinks
              onChatSelect={(chatId) => {
                loadChatHistory(chatId);
                window.history.replaceState({}, '', `/maya?chat=${chatId}`);
              }}
            />
          </div>
        </aside>

        {/* Chat Area */}
        <main className="chat-area">
          {/* Header with INTENT CHIPS (simple, luxe) */}
          <div className="chat-header">
            <h1 className="chat-title">Maya Studio</h1>
            <p className="chat-subtitle">Create photos that build your brand</p>

            {/* Studio Controls */}
            <div className="studio-controls">
              {/* Scene Cards */}
              <div className="scene-cards">
                {(['close-up', 'half-body', 'full-scene'] as const).map((sceneType) => (
                  <div
                    key={sceneType}
                    className={`scene-card ${framing === sceneType ? 'selected' : ''}`}
                    onClick={() => setFraming(sceneType)}
                    aria-pressed={framing === sceneType}
                    style={framing === sceneType ? { outline: '1px solid #0a0a0a' } : {}}
                  >
                    <div className="scene-image">
                      {/* Gray placeholder - replace with actual images later */}
                      <div style={{ 
                        width: '100%', 
                        height: '80px', 
                        background: '#f5f5f5', 
                        border: '1px solid #e5e5e5',
                        borderRadius: '4px'
                      }} />
                    </div>
                    <div className="scene-label">
                      {sceneType === 'close-up' ? 'Close-Up' : 
                       sceneType === 'half-body' ? 'Half Body' : 'Full Scene'}
                    </div>
                  </div>
                ))}
              </div>

              {/* Progressive Reveal: Category and Mood chips */}
              {framing && (
                <div className="controls-reveal">
                  {/* Category chips */}
                  <div className="category-section">
                    <div className="section-label">Category</div>
                    <div className="chip-row">
                      {(['Future CEO', 'Off-Duty Model', 'Social Queen', 'Date Night', 'Everyday Icon', 'Power Player'] as Category[]).map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          className={`chip ${category === cat ? 'selected' : ''}`}
                          onClick={() => setCategory(cat)}
                          aria-pressed={category === cat}
                          style={category === cat ? { background: '#0a0a0a', color: '#fff' } : {}}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Mood chips */}
                  <div className="mood-section">
                    <div className="section-label">Mood (max 2)</div>
                    <div className="chip-row">
                      {['Quiet Luxury', 'Cinematic', 'Natural Light', 'Studio Clean'].map((mood) => (
                        <button
                          key={mood}
                          type="button"
                          className={`chip ${moods.includes(mood) ? 'selected' : ''}`}
                          onClick={() => toggleMood(mood)}
                          aria-pressed={moods.includes(mood)}
                          style={moods.includes(mood) ? { background: '#0a0a0a', color: '#fff' } : {}}
                        >
                          {mood}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Selection Summary and Actions */}
                  <div className="controls-actions">
                    <div className="selection-summary">
                      {[
                        framing ? framing.replace('-', ' ') : '',
                        category || '',
                        moods.length ? moods.join(', ') : ''
                      ].filter(Boolean).join(' • ')}
                    </div>
                    <div className="action-buttons">
                      <button className="compose-btn" onClick={composeWithMaya} disabled={!framing || isTyping}>
                        Compose with Maya
                      </button>
                      <button className="reset-link" onClick={resetControls}>
                        Reset
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="messages-container">
            {messages.length === 0 ? (
              <div className="welcome-state">
                <div className="maya-avatar">
                  <img
                    src="https://i.postimg.cc/mkqSzq3M/out-1-20.png"
                    alt="Maya - Your Personal Brand Stylist"
                  />
                </div>
                <div className="welcome-eyebrow">Personal Brand Photos</div>
                <h2 className="welcome-title">Ready to look incredible in every photo?</h2>
                <p className="welcome-description">
                  I’m Maya. Tap a few moods above and I’ll style you like a pro—outfit, light,
                  camera, movement—then I’ll create it for you in one click.
                </p>

                {/* Quick “style” tiles (gray placeholders only) */}
                <div className="style-quickselect">
                  {([
                    { label: 'Future CEO', style: 'future_ceo' as Style },
                    { label: 'Off-Duty Model', style: 'off_duty' as Style },
                    { label: 'Social Queen', style: 'social_queen' as Style },
                    { label: 'Date Night', style: 'date_night' as Style },
                    { label: 'Everyday Icon', style: 'everyday_icon' as Style },
                    { label: 'Power Player', style: 'power_player' as Style },
                  ]).map(({ label, style }) => (
                    <div
                      key={label}
                      className="style-option"
                      onClick={() => setCategory(label as Category)}
                      title={label}
                    >
                      <div className="style-preview">{label}</div>
                      <div className="style-label">Choose Style</div>
                    </div>
                  ))}
                </div>
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

                        {/* Removed duplicate gray placeholders - keep only Studio preview */}

                        {/* Images */}
                        {message.imagePreview && message.imagePreview.length > 0 && (
                          <div className="image-grid">
                            {message.imagePreview.map((imageUrl, imgIndex) => (
                              <div key={imgIndex} className="image-item">
                                <img
                                  src={imageUrl}
                                  alt={`Generated ${imgIndex + 1}`}
                                  onClick={() => setSelectedImage(imageUrl)}
                                />
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    saveToGallery(imageUrl);
                                  }}
                                  disabled={savingImages.has(imageUrl)}
                                  className="save-btn"
                                  title={
                                    savedImages.has(imageUrl)
                                      ? 'Saved to gallery'
                                      : 'Save to gallery'
                                  }
                                >
                                  {savingImages.has(imageUrl) ? (
                                    <div
                                      style={{
                                        width: 14,
                                        height: 14,
                                        border: '2px solid #999',
                                        borderTopColor: 'transparent',
                                        borderRadius: '50%',
                                        animation: 'spin 1s linear infinite',
                                      }}
                                    />
                                  ) : savedImages.has(imageUrl) ? (
                                    <span style={{ color: '#ef4444', fontSize: 14 }}>♥</span>
                                  ) : (
                                    <span style={{ color: '#999', fontSize: 14 }}>♡</span>
                                  )}
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* New Look button */}
                        {message.imagePreview && message.generatedPrompt && (
                          <div style={{ marginTop: 12 }}>
                            <button
                              onClick={() => newLook(message.generatedPrompt!)}
                              className="send-btn"
                              disabled={isGenerating}
                              style={{ padding: '10px 18px' }}
                            >
                              {isGenerating ? 'Working…' : 'New Look'}
                            </button>
                          </div>
                        )}

                        {/* Actions */}
                        {isMaya && message.canGenerate && message.variants && (
                          <div className="look-actions">
                            <button
                              className="look-btn"
                              onClick={() => generateFromMessage(index)}
                              disabled={isGenerating}
                            >
                              {isGenerating
                                ? `Creating... ${generationProgress}%`
                                : 'Create with Maya'}
                            </button>

                            {/* Removed old New Look button - using new implementation above */}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="typing-indicator">
                    <div className="message-avatar">
                      <img
                        src="https://i.postimg.cc/mkqSzq3M/out-1-20.png"
                        alt="Maya"
                      />
                    </div>
                    <div className="typing-dots">
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                    </div>
                    <div className="typing-text">Maya is styling your look...</div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input (kept, but simple) */}
          <div className="input-area">
            <div className="input-container">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                className="input-field"
                placeholder="Tell Maya what kind of photos you want to create..."
                rows={1}
                disabled={isTyping}
                style={{ minHeight: '24px', maxHeight: '120px', height: 'auto' }}
                onInput={(e) => {
                  const t = e.target as HTMLTextAreaElement;
                  t.style.height = 'auto';
                  t.style.height = Math.min(t.scrollHeight, 120) + 'px';
                }}
              />
              <button onClick={sendMessage} disabled={!input.trim() || isTyping} className="send-btn">
                Send
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-5xl max-h-full">
            <img
              src={selectedImage}
              alt="Full size view"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  saveToGallery(selectedImage);
                }}
                disabled={savingImages.has(selectedImage)}
                className="w-10 h-10 flex items-center justify-center bg-white/90 hover:bg-white border border-gray-200 hover:border-gray-300 rounded-full transition-all shadow-lg"
                title={savedImages.has(selectedImage) ? 'Saved to gallery' : 'Save to gallery'}
              >
                {savingImages.has(selectedImage) ? (
                  <div className="w-4 h-4 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                ) : savedImages.has(selectedImage) ? (
                  <span className="text-red-500 text-lg">♥</span>
                ) : (
                  <span className="text-gray-400 hover:text-red-500 text-lg transition-colors">♡</span>
                )}
              </button>

              <button
                onClick={() => setSelectedImage(null)}
                className="w-10 h-10 flex items-center justify-center bg-white/90 hover:bg-white text-gray-700 hover:text-black rounded-full transition-all shadow-lg"
                title="Close"
              >
                <span className="text-xl leading-none">×</span>
              </button>
            </div>

            <div className="absolute bottom-4 left-4 bg-black/60 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
              <div className="text-sm font-medium">Maya Personal Brand Photo</div>
              <div className="text-xs text-white/80">Save to use for your content and brand</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
