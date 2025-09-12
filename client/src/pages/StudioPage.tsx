import React, { useRef, useState } from 'react';
import LuxuryConceptCard from '../components/brand-studio/LuxuryConceptCard';
import GeneratedImagePreview from '../components/GeneratedImagePreview';
import { WelcomeHeader } from '../components/WelcomeHeader';

interface FeedMessage {
  id: string;
  type: 'user' | 'maya' | 'component';
  text?: string;
  component?: React.ReactNode;
}

const initialConcept = {
  id: 'concept-1',
  title: 'Professional Headshot',
  description: 'A clean, modern headshot for your business profile.',
};

const StudioPage: React.FC = () => {
  const [feed, setFeed] = useState<FeedMessage[]>([]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);

  // Simulate API call
  const handleGenerate = async () => {
    setIsGenerating(true);
    setShowPreview(true);
    setGeneratedImages([]);
    // Simulate loading
    setTimeout(() => {
      setGeneratedImages([
        'https://placehold.co/200x200?text=Photo+1',
        'https://placehold.co/200x200?text=Photo+2',
        'https://placehold.co/200x200?text=Photo+3',
        'https://placehold.co/200x200?text=Photo+4',
      ]);
      setIsGenerating(false);
    }, 1800);
  };

  // Add concept card to feed on mount
  React.useEffect(() => {
    setFeed([
      {
        id: initialConcept.id,
        type: 'component',
        component: (
          <LuxuryConceptCard
            title={initialConcept.title}
            description={initialConcept.description}
            isGenerating={isGenerating}
            onGenerate={handleGenerate}
          />
        ),
      },
    ]);
    // eslint-disable-next-line
  }, []);

  // Add image preview to feed when generation completes
  React.useEffect(() => {
    if (showPreview) {
      const previewId = 'preview-' + Date.now();
      setFeed((prev) => [
        ...prev,
        {
          id: previewId,
          type: 'component',
          component: (
            <GeneratedImagePreview
              imageUrls={generatedImages}
              isLoading={isGenerating}
              onSave={() => alert('Saved to gallery!')}
            />
          ),
        },
      ]);
      setShowPreview(false);
    }
    // eslint-disable-next-line
  }, [showPreview, generatedImages, isGenerating]);

  // Handle user message send
  const handleSend = () => {
    if (!input.trim()) return;
    setFeed((prev) => [
      ...prev,
      {
        id: 'user-' + Date.now(),
        type: 'user',
        text: input.trim(),
      },
    ]);
    setInput('');
    // Optionally, trigger Maya response here
  };

  return (
    <div className="studio-page min-h-screen flex flex-col bg-neutral-50">
      <WelcomeHeader />
      <div ref={feedRef} className="flex-1 overflow-y-auto px-4 py-8 space-y-6">
        {feed.map((msg) =>
          msg.component ? (
            <React.Fragment key={msg.id}>{msg.component}</React.Fragment>
          ) : (
            <div
              key={msg.id}
              className={`text-sm px-4 py-2 rounded max-w-lg ${
                msg.type === 'user' ? 'bg-black text-white ml-auto' : 'bg-gray-100 text-gray-900'
              }`}
            >
              {msg.text}
            </div>
          )
        )}
      </div>
      <form
        className="flex items-center gap-2 border-t border-gray-200 bg-white px-4 py-3"
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
      >
        <input
          className="flex-1 px-3 py-2 rounded border border-gray-200 bg-neutral-50 text-sm focus:outline-none"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isGenerating}
        />
        <button
          type="submit"
          className="text-xs text-gray-700 underline hover:text-black disabled:opacity-50"
          disabled={!input.trim() || isGenerating}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default StudioPage;
