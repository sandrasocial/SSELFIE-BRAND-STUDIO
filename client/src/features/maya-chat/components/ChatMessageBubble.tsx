import React from 'react';
import { useBrandStudio } from '../../../contexts/BrandStudioContext.js';
import ConceptCard from './ConceptCard';
import type { ConceptCard as ConceptCardType } from '../../../../../shared/types/concept-card.js';

interface ChatMessageLike {
  id?: string;
  type?: 'user' | 'maya' | 'assistant' | 'system';
  role?: 'user' | 'maya' | 'assistant' | 'system';
  content: string;
  timestamp?: string | number;
  conceptCards?: ConceptCardType[];
}

interface ChatMessageBubbleProps {
  message: ChatMessageLike;
}

const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({ message }) => {
  const {
    isGenerating,
    isPolling,
    getPollingStatus,
    selectConceptCard,
    generateImage,
    selectedConceptCardId,
    conceptCardsById,
  } = useBrandStudio();

  const role = message.type || message.role || 'maya';

  return (
    <div className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[90%] ${role === 'user' ? 'order-2' : 'order-1'}`}>
        <div className={`p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[1.75rem] ${
          role === 'user'
            ? 'bg-stone-950 text-white shadow-xl shadow-stone-900/30'
            : 'bg-white/50 backdrop-blur-2xl border border-white/70 shadow-xl shadow-stone-900/10 text-stone-950'
        }`}>
          <div className="space-y-3">
            <p className="text-sm sm:text-base leading-relaxed font-medium whitespace-pre-wrap">{message.content}</p>
            {message.timestamp && (
              <div className="text-xs font-light text-stone-500 opacity-60">
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
          </div>
        </div>

        {role === 'maya' && message.conceptCards && message.conceptCards.length > 0 && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-1 h-1 rounded-full bg-stone-600"></div>
              <span className="text-xs tracking-[0.15em] uppercase font-light text-stone-600">Photo Ideas</span>
            </div>
            {message.conceptCards.map((card, cardIndex) => {
              if (!card || !card.id || !card.title || !card.description) {
                return (
                  <div key={card?.id || `incomplete-${cardIndex}`} className="bg-stone-50/60 border border-stone-200/60 rounded-2xl p-5">
                    <div className="flex items-center gap-3">
                      <span className="text-stone-600">⚠️</span>
                      <div>
                        <h4 className="text-sm font-medium text-stone-800">Incomplete Concept Card</h4>
                        <p className="text-xs text-stone-600 mt-1">Missing required information.</p>
                      </div>
                    </div>
                  </div>
                );
              }

              const latest = (conceptCardsById && card?.id) ? conceptCardsById[card.id] || card : card;
              const cardGenerating = isGenerating && selectedConceptCardId === card.id;
              const cardPolling = isPolling(card.id);
              const pollingStatus = getPollingStatus(card.id);

              return (
                <ConceptCard
                  key={card.id}
                  card={latest}
                  isSelected={selectedConceptCardId === card.id}
                  isGenerating={cardGenerating}
                  isPolling={cardPolling}
                  pollingStatus={pollingStatus}
                  onGenerate={(id) => {
                    if (!isGenerating && !cardPolling && id) {
                      selectConceptCard(id);
                      generateImage(id);
                    }
                  }}
                  onView={(url) => {
                    if (url) window.open(url, '_blank');
                  }}
                  onHeart={async (url) => {
                    try {
                      if (!url) return;
                      const response = await fetch('/api/maya/heart-image', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ imageUrl: url, category: 'maya_generated' }),
                      });
                      if (!response.ok) {
                        console.error('Failed to save image to gallery');
                      }
                    } catch (e) {
                      console.error('Heart image error', e);
                    }
                  }}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessageBubble;

