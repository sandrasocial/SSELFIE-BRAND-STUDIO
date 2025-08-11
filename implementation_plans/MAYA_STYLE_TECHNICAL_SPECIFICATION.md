# 🛠️ MAYA STYLE INTERFACE - TECHNICAL SPECIFICATION
## Detailed Implementation Guide - August 10, 2025

---

## 📂 NEW COMPONENT ARCHITECTURE

### Core Components Structure:
```
client/src/pages/maya.tsx (SIMPLIFIED ENTRY POINT)
├── components/maya/
│   ├── MayaChatInterface.tsx        (Core chat functionality)
│   ├── MayaImageGeneration.tsx      (Generation flow & progress)
│   ├── MayaImageGallery.tsx         (Preview & gallery saving)
│   ├── MayaStatusIndicator.tsx      (Progress communication)
│   ├── MayaPersonality.tsx          (Avatar & character elements)
│   └── MayaContentSystem.tsx        (Dynamic content delivery)
├── hooks/maya/
│   ├── useMayaState.tsx             (Centralized state management)
│   ├── useMayaGeneration.tsx        (Image generation logic)
│   ├── useMayaRealtime.tsx          (WebSocket connections)
│   └── useMayaContent.tsx           (Content & personality)
└── types/maya/
    ├── MayaTypes.ts                 (TypeScript interfaces)
    ├── MayaState.ts                 (State machine definitions)
    └── MayaContent.ts               (Content type definitions)
```

---

## 🔄 STATE MANAGEMENT REDESIGN

### Current Issues:
- 13+ useState hooks creating complexity
- Race conditions between polling and updates
- Memory leaks from improper cleanup
- Difficult debugging and testing

### New State Machine:
```typescript
// types/maya/MayaState.ts
export type MayaState = {
  phase: 'LOADING' | 'CHAT' | 'GENERATING' | 'VIEWING' | 'SAVING' | 'ERROR';
  chat: {
    messages: ChatMessage[];
    currentChatId: number | null;
    isTyping: boolean;
    input: string;
  };
  generation: {
    status: 'IDLE' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    progress: number;
    trackerId: number | null;
    imageUrls: string[];
  };
  gallery: {
    savedImages: Set<string>;
    savingImages: Set<string>;
    selectedImage: string | null;
  };
  user: {
    isAuthenticated: boolean;
    profile: UserProfile | null;
  };
};

export type MayaAction = 
  | { type: 'SEND_MESSAGE'; payload: string }
  | { type: 'START_GENERATION'; payload: { prompt: string } }
  | { type: 'UPDATE_PROGRESS'; payload: number }
  | { type: 'GENERATION_COMPLETE'; payload: string[] }
  | { type: 'SAVE_TO_GALLERY'; payload: string }
  | { type: 'SET_ERROR'; payload: string };
```

### State Machine Implementation:
```typescript
// hooks/maya/useMayaState.tsx
import { useReducer, useContext, createContext } from 'react';

const MayaStateContext = createContext<{
  state: MayaState;
  dispatch: React.Dispatch<MayaAction>;
} | null>(null);

export function MayaStateProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(mayaStateReducer, initialMayaState);
  
  return (
    <MayaStateContext.Provider value={{ state, dispatch }}>
      {children}
    </MayaStateContext.Provider>
  );
}

export function useMayaState() {
  const context = useContext(MayaStateContext);
  if (!context) {
    throw new Error('useMayaState must be used within MayaStateProvider');
  }
  return context;
}
```

---

## 🚀 REAL-TIME COMMUNICATION UPGRADE

### Replace Polling with WebSocket:
```typescript
// hooks/maya/useMayaRealtime.tsx
export function useMayaRealtime() {
  const { state, dispatch } = useMayaState();
  const wsRef = useRef<WebSocket | null>(null);
  
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws/maya`;
    
    wsRef.current = new WebSocket(wsUrl);
    
    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'GENERATION_PROGRESS':
          dispatch({ type: 'UPDATE_PROGRESS', payload: data.progress });
          break;
        case 'GENERATION_COMPLETE':
          dispatch({ type: 'GENERATION_COMPLETE', payload: data.imageUrls });
          break;
        case 'MAYA_MESSAGE':
          dispatch({ type: 'RECEIVE_MESSAGE', payload: data.message });
          break;
      }
    };
    
    return () => {
      wsRef.current?.close();
    };
  }, [dispatch]);
  
  const sendMessage = (content: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'USER_MESSAGE',
        content,
        chatId: state.chat.currentChatId
      }));
    }
  };
  
  return { sendMessage };
}
```

---

## 🎨 LUXURY DESIGN SYSTEM COMPONENTS

### Maya Avatar Component:
```typescript
// components/maya/MayaPersonality.tsx
export function MayaAvatar({ mood = 'confident' }: { mood?: 'confident' | 'excited' | 'thinking' }) {
  return (
    <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-amber-400 shadow-lg">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-100 to-amber-200">
        {/* Maya's sophisticated avatar with mood-based expressions */}
        <div className={cn(
          "absolute inset-2 rounded-full transition-all duration-500",
          mood === 'confident' && "bg-gradient-to-br from-amber-500 to-amber-600",
          mood === 'excited' && "bg-gradient-to-br from-amber-400 to-amber-500 animate-pulse",
          mood === 'thinking' && "bg-gradient-to-br from-amber-600 to-amber-700"
        )}>
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-black rounded-full opacity-80" />
          <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-black rounded-full opacity-80" />
        </div>
      </div>
    </div>
  );
}
```

### Luxury Progress Indicator:
```typescript
// components/maya/MayaStatusIndicator.tsx
export function LuxuryProgressIndicator({ progress }: { progress: number }) {
  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-1000 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mt-4 text-center">
        <div className="font-serif text-sm text-gray-600 tracking-wide">
          Maya is crafting your editorial vision...
        </div>
        <div className="font-light text-xs text-gray-500 mt-1">
          {progress < 30 && "Analyzing your style profile"}
          {progress >= 30 && progress < 60 && "Selecting the perfect aesthetic"}
          {progress >= 60 && progress < 90 && "Creating your signature look"}
          {progress >= 90 && "Perfecting every detail"}
        </div>
      </div>
    </div>
  );
}
```

---

## 💬 CONTENT SYSTEM ARCHITECTURE

### Dynamic Content Delivery:
```typescript
// hooks/maya/useMayaContent.tsx
export function useMayaContent() {
  const { user } = useAuth();
  
  const getPersonalizedGreeting = () => {
    const timeOfDay = new Date().getHours();
    const isReturning = user?.lastVisit && 
      Date.now() - new Date(user.lastVisit).getTime() < 7 * 24 * 60 * 60 * 1000;
    
    if (timeOfDay < 12) {
      return isReturning 
        ? `Good morning, ${user?.firstName}! Ready to continue your style evolution?`
        : `Good morning, ${user?.firstName}! I'm Maya, your personal celebrity stylist.`;
    } else if (timeOfDay < 17) {
      return isReturning
        ? `Perfect timing, ${user?.firstName}! Let's create something extraordinary.`
        : `Hello beautiful! I'm Maya, and I'll be your exclusive style curator.`;
    } else {
      return isReturning
        ? `Evening, ${user?.firstName}! Ready for your next iconic look?`
        : `Good evening, ${user?.firstName}! I'm Maya, your after-hours style confidante.`;
    }
  };
  
  const getStyleEducationTip = () => {
    const tips = [
      "Did you know? Coco Chanel always said 'luxury must be comfortable, otherwise it's not luxury.'",
      "Insider secret: The most photographed looks have one standout element and everything else whispers.",
      "Red carpet rule: Confidence is your best accessory - wear it with everything.",
      "Editorial truth: Great style is about expressing your authentic self, elevated.",
      "Celebrity wisdom: The most memorable looks tell a story about who you are."
    ];
    return tips[Math.floor(Math.random() * tips.length)];
  };
  
  return {
    getPersonalizedGreeting,
    getStyleEducationTip
  };
}
```

---

## 🔧 PERFORMANCE OPTIMIZATIONS

### Memory Management:
```typescript
// hooks/maya/useMayaGeneration.tsx
export function useMayaGeneration() {
  const { state, dispatch } = useMayaState();
  const { sendMessage } = useMayaRealtime();
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const startGeneration = useCallback(async (prompt: string) => {
    // Cancel any existing generation
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();
    
    try {
      dispatch({ type: 'START_GENERATION', payload: { prompt } });
      
      const response = await fetch('/api/maya/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
        signal: abortControllerRef.current.signal,
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (data.trackerId) {
        // WebSocket will handle progress updates
        return data.trackerId;
      }
      
    } catch (error) {
      if (error.name !== 'AbortError') {
        dispatch({ type: 'SET_ERROR', payload: error.message });
      }
    }
  }, [dispatch]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);
  
  return { startGeneration };
}
```

---

## 📱 MOBILE-FIRST RESPONSIVE DESIGN

### Mobile-Optimized Layout:
```typescript
// components/maya/MayaMobileLayout.tsx
export function MayaMobileLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  if (isMobile) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="flex-1 overflow-y-auto px-4 pb-20">
          {children}
        </div>
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
          <MayaInputArea />
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {children}
      </div>
    </div>
  );
}
```

---

## 🧪 TESTING STRATEGY

### Component Testing:
```typescript
// __tests__/maya/MayaChatInterface.test.tsx
describe('MayaChatInterface', () => {
  it('sends messages correctly', async () => {
    render(
      <MayaStateProvider>
        <MayaChatInterface />
      </MayaStateProvider>
    );
    
    const input = screen.getByPlaceholderText(/tell maya about your vision/i);
    const sendButton = screen.getByRole('button', { name: /send/i });
    
    fireEvent.change(input, { target: { value: 'I want a sophisticated look' } });
    fireEvent.click(sendButton);
    
    await waitFor(() => {
      expect(screen.getByText(/i want a sophisticated look/i)).toBeInTheDocument();
    });
  });
  
  it('handles generation flow correctly', async () => {
    // Test complete generation flow
  });
});
```

---

## 🚀 DEPLOYMENT CHECKLIST

### Pre-Deployment:
- [ ] All components pass TypeScript checks
- [ ] Unit tests achieve 90% coverage
- [ ] Performance tests show <2s load times
- [ ] Mobile tests pass on iOS and Android
- [ ] WebSocket connections stable under load

### Launch Sequence:
1. Deploy backend WebSocket infrastructure
2. Deploy new component architecture
3. Enable feature flag for new interface
4. Monitor real-time performance metrics
5. Gradual rollout to user segments

---

## 📊 MONITORING & ANALYTICS

### Key Performance Indicators:
- Component load times
- WebSocket connection stability
- User engagement duration
- Generation completion rates
- Mobile vs desktop usage patterns

### Error Tracking:
- Real-time error reporting via Sentry
- Performance monitoring with Core Web Vitals
- User satisfaction tracking via in-app feedback

---

**IMPLEMENTATION READY**: ✅ Technical specification complete
**ESTIMATED TIMELINE**: 4 weeks from start to full deployment
**TEAM COORDINATION**: Elena managing Victoria, Aria, Rachel, Quinn execution