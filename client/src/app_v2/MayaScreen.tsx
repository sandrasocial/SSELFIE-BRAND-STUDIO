export function MayaScreen() {
  const ConceptCard = ({ concept }: { concept: any }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [isGenerated, setIsGenerated] = useState(false);
    const handleGenerate = async () => {
      setIsGenerating(true);
      setTimeout(() => {
        setIsGenerating(false);
        setIsGenerated(true);
      }, 3500);
    };
    return (
      <div className="bg-stone-200/40 border border-stone-300/50 rounded-lg sm:rounded-2xl p-4 sm:p-6 transition-all duration-300 hover:bg-stone-200/60 hover:border-stone-400/60">
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between">
            <div className="px-3 py-1 bg-stone-500/10 rounded-full border border-stone-400/20">
              <span className="text-xs tracking-[0.1em] uppercase font-light text-stone-600">{concept.category}</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-stone-500"></div>
          </div>
          <div className="space-y-3 sm:space-y-4">
            <h4 className="text-sm sm:text-base font-serif font-thin tracking-[0.1em] text-stone-900 uppercase leading-tight">{concept.title}</h4>
            <p className="text-xs sm:text-sm font-light leading-relaxed text-stone-600">{concept.description}</p>
          </div>
        </div>
        {!isGenerating && !isGenerated && (
          <div className="mt-4 sm:mt-6">
            <button 
              onClick={handleGenerate}
              className="w-full bg-stone-950 text-stone-50 px-4 py-3 sm:px-6 sm:py-4 rounded-lg sm:rounded-xl font-light tracking-[0.2em] uppercase text-xs sm:text-sm transition-all duration-300 hover:bg-stone-800 hover:transform hover:translate-y-[-1px] min-h-[44px] sm:min-h-auto"
            >
              Create This Photo
            </button>
          </div>
        )}
        {isGenerating && (
          <div className="mt-4 sm:mt-6 flex flex-col items-center justify-center py-6 sm:py-8 space-y-4 sm:space-y-6">
            <div className="relative">
              <div className="w-8 h-8 sm:w-10 sm:h-10 border border-stone-600/20 rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-8 h-8 sm:w-10 sm:h-10 border border-stone-800 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div className="text-center space-y-2 sm:space-y-3">
              <span className="text-sm sm:text-base tracking-[0.2em] uppercase font-light text-stone-600">Creating</span>
              <div className="w-32 h-0.5 sm:w-48 sm:h-1 bg-stone-300 rounded-full overflow-hidden">
                <div className="w-full h-full bg-stone-800 animate-pulse"></div>
              </div>
            </div>
          </div>
        )}
        {isGenerated && (
          <div className="mt-4 sm:mt-6 space-y-4 sm:space-y-6">
            <div className="p-3 sm:p-4 bg-stone-300/40 border border-stone-400/50 rounded-lg sm:rounded-xl">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-stone-50/20 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-stone-800 rounded-full"></div>
                </div>
                <div className="space-y-1 sm:space-y-2 flex-1 min-w-0">
                  <h4 className="text-sm sm:text-base font-light text-stone-900">Photo Ready</h4>
                  <p className="text-xs font-light truncate text-stone-600">This turned out beautifully</p>
                </div>
              </div>
            </div>
            <div className="aspect-video bg-stone-300/40 rounded-lg sm:rounded-xl border border-stone-400/50 flex items-center justify-center hover:bg-stone-300/60 transition-all duration-300 cursor-pointer group relative overflow-hidden">
              <Camera size={24} className="text-stone-500 group-hover:text-stone-700 transition-colors sm:w-8 sm:h-8" strokeWidth={1} />
              <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/20 transition-all duration-300"></div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <button className="px-4 py-3 sm:px-6 sm:py-4 bg-stone-950 text-stone-50 rounded-lg sm:rounded-xl font-light tracking-[0.1em] uppercase text-xs sm:text-sm transition-all duration-300 hover:bg-stone-800 min-h-[44px] sm:min-h-auto">
                Save Photo
              </button>
              <button className="px-4 py-3 sm:px-6 sm:py-4 bg-stone-200/40 text-stone-900 border border-stone-300/50 rounded-lg sm:rounded-xl font-light tracking-[0.1em] uppercase text-xs sm:text-sm transition-all duration-300 hover:bg-stone-200/60 hover:border-stone-400/60 min-h-[44px] sm:min-h-auto">
                Share
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  type MayaMessage = {
    role: 'maya';
    content: string;
    timestamp: string;
    concepts?: Array<{
      title: string;
      description: string;
      category: string;
    }>;
  };
  type UserMessage = {
    role: 'user';
    content: string;
    timestamp: string;
  };
  type Message = MayaMessage | UserMessage;

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'maya',
      content: 'I help people get amazing photos that actually look like them.\n\nI create 5 different shots every time - some close-ups, some full body, and some lifestyle scenes that work together like a perfect feed. What kind of photos are you dreaming of?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const handleSendMessage = () => {
    if (inputValue.trim() && !isTyping) {
      const userMessage: UserMessage = {
        role: 'user',
        content: inputValue.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, userMessage]);
      setInputValue('');
      setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          const mayaMessage: MayaMessage = {
            role: 'maya',
            content: 'I can see your vision. You have great instincts.\n\nHere\'s what I\'m thinking - 5 photos that will make you look incredible:',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            concepts: [
              {
                title: 'The LinkedIn Winner',
                description: 'Sharp focus on your face with perfect lighting. This is your main profile photo.',
                category: 'Close-Up'
              },
              {
                title: 'The Approachable Expert', 
                description: 'Waist up, slight smile, clean background. Shows personality while staying professional.',
                category: 'Half Body'
              },
              {
                title: 'Working in Your Element',
                description: 'You doing what you do best - maybe at your desk or in a meeting. Shows authenticity.',
                category: 'Lifestyle'
              },
              {
                title: 'The Human Side',
                description: 'More relaxed version - maybe with coffee. Shows you\'re real and approachable.',
                category: 'Casual'
              },
              {
                title: 'Beautiful Details',
                description: 'Workspace flat lay - laptop, notebook, coffee. Tells your story without showing your face.',
                category: 'Flat Lay'
              }
            ]
          };
          setMessages(prev => [...prev, mayaMessage]);
        }, 2800);
      }, 800);
    }
  };
  return (
    <div className="h-full flex flex-col space-y-3 sm:space-y-4 pb-2 sm:pb-6">
      <div className="flex items-center justify-between pt-2 sm:pt-4 pb-2 sm:pb-0">
        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-stone-300/60 overflow-hidden flex-shrink-0">
            <img 
              src="https://i.postimg.cc/fTtCnzZv/out-1-22.png" 
              alt="Maya" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg sm:text-2xl font-serif font-thin tracking-[0.3em] text-stone-900 uppercase">Maya</h3>
            <p className="text-xs tracking-[0.2em] uppercase font-light text-stone-500">Your Photo Stylist</p>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-4 flex-shrink-0">
          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-stone-800 rounded-full"></div>
          <span className="text-xs font-light text-stone-600 opacity-80">Online</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto space-y-3 sm:space-y-4 pr-1 sm:pr-2 pb-2" style={{ maxHeight: 'calc(100vh - 280px)' }}>
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[90%] sm:max-w-[85%] ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
              <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border ${
                msg.role === 'user' 
                  ? 'bg-stone-300/40 border-stone-400/40' 
                  : 'bg-stone-200/30 border-stone-300/40'
              }`}>
                <div className="space-y-2 sm:space-y-3">
                  <p className="text-sm sm:text-base text-stone-900 leading-relaxed font-light">{msg.content}</p>
                  <div className="text-xs font-light text-stone-500 opacity-60">
                    {msg.timestamp}
                  </div>
                </div>
              </div>
              {msg.role === 'maya' && msg.concepts && (
                <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-3">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-1 h-1 rounded-full bg-stone-600"></div>
                    <span className="text-xs tracking-[0.2em] uppercase font-light text-stone-600 opacity-80">Photo Ideas</span>
                  </div>
                  {msg.concepts.map((concept, conceptIndex) => (
                    <ConceptCard key={conceptIndex} concept={concept} />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-stone-200/30 border border-stone-300/40 p-3 sm:p-4 rounded-xl sm:rounded-2xl max-w-[90%] sm:max-w-[85%]">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full animate-bounce bg-stone-600"></div>
                  <div className="w-2 h-2 rounded-full animate-bounce bg-stone-600" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-2 h-2 rounded-full animate-bounce bg-stone-600" style={{animationDelay: '0.4s'}}></div>
                </div>
                <span className="text-sm sm:text-base font-light text-stone-600 opacity-80">Maya is creating your photos...</span>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="border-t border-stone-300/20 pt-3 sm:pt-4 mt-auto flex-shrink-0">
        <div className="flex gap-2 sm:gap-3">
          <div className="flex-1 relative">
            <input 
              type="text" 
              value={inputValue} 
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Tell Maya what kind of photos you want..." 
              className="w-full px-3 py-3 sm:px-4 sm:py-4 bg-stone-200/40 border border-stone-300/60 rounded-xl sm:rounded-2xl text-stone-900 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-600/40 focus:border-stone-600/60 pr-10 sm:pr-12 font-light text-sm sm:text-base min-h-[44px] sm:min-h-[48px]"
              disabled={isTyping}
            />
            <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2">
              <Camera size={16} className="text-stone-500 sm:w-[18px] sm:h-[18px]" strokeWidth={1.2} />
            </div>
          </div>
          <button 
            onClick={handleSendMessage}
            className="group relative px-3 py-3 sm:px-4 sm:py-4 bg-stone-950 text-stone-50 rounded-xl sm:rounded-2xl font-light transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden shadow-md min-h-[44px] min-w-[44px] sm:min-h-[48px] sm:min-w-[48px] flex items-center justify-center"
            disabled={isTyping || !inputValue.trim()}
          >
            <div className="absolute inset-0 bg-stone-800 transform scale-0 group-hover:scale-100 transition-transform duration-500 origin-center"></div>
            <Send size={16} strokeWidth={1.2} className="relative z-10 group-hover:text-stone-50 transition-colors duration-500 sm:w-[18px] sm:h-[18px]" />
          </button>
        </div>
      </div>
    </div>
  );
};