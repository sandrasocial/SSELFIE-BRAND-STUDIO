import { KeyboardEvent, useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/use-auth';
import { useLocation } from 'wouter';
import { useToast } from '../hooks/use-toast';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { apiRequest } from '../lib/queryClient';
import { SandraImages } from '../lib/sandra-images';
import { MayaLayout } from '../components/maya/MayaLayout';
import { StyleChat } from '../components/maya/StyleChat';
import { PhotoGeneration } from '../components/maya/PhotoGeneration';

// ... [Keep all existing interfaces and type definitions]

export default function MayaPage() {
  // ... [Keep all existing state and hooks]

  return (
    <MayaLayout>
      <div className="h-full flex flex-col">
        <div className="flex-1 flex">
          {/* Chat Section */}
          <div className="flex-1 flex flex-col">
            <StyleChat
              messages={messages}
              input={input}
              setInput={setInput}
              handleSend={handleSend}
              handleKeyDown={handleKeyDown}
              isLoading={isTyping || isGenerating}
            />
          </div>

          {/* Photo Generation Section */}
          <div className="w-1/2 border-l border-gray-700">
            <PhotoGeneration
              generatedImages={generatedImages}
              isGenerating={isGenerating}
              generationProgress={generationProgress}
              onSaveImage={handleSaveImage}
              savingImages={savingImages}
              savedImages={savedImages}
            />
          </div>
        </div>
      </div>
    </MayaLayout>
  );
}