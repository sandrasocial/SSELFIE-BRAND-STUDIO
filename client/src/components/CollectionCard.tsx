// client/src/components/collections/CollectionCard.tsx - Updated to handle new collection
import React from 'react';
import { findingMyselfAgainCollection } from '../../data/collections/finding-myself-again';

export default function CollectionCard({ collection }: { collection: any }) {
  const isNewCollection = collection.id === 'finding-myself-again';
  
  return (
    <div className={`
      relative overflow-hidden rounded-lg shadow-lg cursor-pointer
      transition-all duration-300 hover:shadow-2xl hover:scale-105
      ${isNewCollection ? 'ring-2 ring-gold-400' : ''}
    `}>
      {isNewCollection && (
        <div className="absolute top-3 right-3 bg-gold-400 text-black px-2 py-1 rounded-full text-xs font-medium z-10">
          NEW
        </div>
      )}
      
      <div className="aspect-[4/5] bg-gradient-to-br from-warm-cream to-soft-gray relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center p-6">
            <h3 className="font-serif text-2xl text-charcoal mb-3">
              {collection.name}
            </h3>
            <p className="text-sm text-charcoal/80 leading-relaxed">
              {collection.description}
            </p>
            <div className="mt-4 text-xs text-charcoal/60">
              {collection.prompts?.length || 10} prompts
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}