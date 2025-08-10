// Maya STYLE Interface - Image Generation Component
// August 10, 2025 - Redesign Implementation

import React, { useEffect, useCallback } from 'react';
import { useMayaState, useMayaActions } from '@/hooks/maya/useMayaState';
import { useMayaContent } from '@/hooks/maya/useMayaContent';
import { MayaAvatar, LuxuryProgressIndicator } from './MayaPersonality';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { cn } from '@/lib/utils';

interface MayaImageGenerationProps {
  className?: string;
}

export function MayaImageGeneration({ className }: MayaImageGenerationProps) {
  const { state } = useMayaState();
  const actions = useMayaActions();
  const content = useMayaContent();
  const { toast } = useToast();

  // Start generation when component mounts and we're in GENERATING phase
  useEffect(() => {
    if (state.phase === 'GENERATING' && !state.generation.trackerId) {
      startGeneration();
    }
  }, [state.phase]);

  // Poll for completion when we have a tracker ID
  useEffect(() => {
    if (state.generation.trackerId && state.generation.status === 'PROCESSING') {
      const pollInterval = setInterval(() => {
        pollGenerationStatus(state.generation.trackerId!);
      }, 3000);

      return () => clearInterval(pollInterval);
    }
  }, [state.generation.trackerId, state.generation.status]);

  const startGeneration = async () => {
    try {
      // Get the last user message as the prompt
      const lastUserMessage = state.chat.messages
        .filter(msg => msg.role === 'user')
        .pop();

      if (!lastUserMessage) {
        throw new Error('No prompt found');
      }

      const response = await apiRequest('POST', '/api/maya/generate', {
        prompt: lastUserMessage.content,
        chatId: state.chat.currentChatId,
      });

      const data = await response.json();

      if (response.ok && data.trackerId) {
        actions.startGeneration(lastUserMessage.content, data.trackerId);
        
        toast({
          title: "Maya is creating your photoshoot",
          description: "Watch your editorial photos generate in real-time!",
        });

      } else {
        throw new Error(data.error || 'Failed to start generation');
      }

    } catch (error) {
      console.error('Generation start error:', error);
      actions.generationFailed(error.message);
      
      // Add Maya's error recovery message
      const errorMessage = {
        role: 'maya' as const,
        content: content.getErrorRecoveryMessage('generation_failed'),
        timestamp: new Date().toISOString(),
      };
      actions.receiveMessage(errorMessage);
    }
  };

  const pollGenerationStatus = async (trackerId: number) => {
    try {
      const response = await fetch(`/api/generation-tracker/${trackerId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to poll status: ${response.status}`);
      }

      const tracker = await response.json();

      // Update progress
      const progress = Math.min(90, (Date.now() - new Date(tracker.createdAt).getTime()) / 2000);
      actions.updateProgress(progress);

      if (tracker.status === 'completed' && tracker.imageUrls?.length > 0) {
        // Generation complete!
        actions.generationComplete(tracker.imageUrls);
        
        // Add success message to chat
        const successMessage = {
          role: 'maya' as const,
          content: content.getSuccessMessage(tracker.imageUrls.length),
          timestamp: new Date().toISOString(),
          imagePreview: tracker.imageUrls,
        };
        actions.receiveMessage(successMessage);

        toast({
          title: "Photoshoot Complete!",
          description: `${tracker.imageUrls.length} stunning photos are ready to view!`,
        });

      } else if (tracker.status === 'failed') {
        actions.generationFailed('Generation failed');
        
        const errorMessage = {
          role: 'maya' as const,
          content: content.getErrorRecoveryMessage('generation_failed'),
          timestamp: new Date().toISOString(),
        };
        actions.receiveMessage(errorMessage);
      }

    } catch (error) {
      console.error('Polling error:', error);
      // Continue polling unless it's a critical error
    }
  };

  if (state.phase !== 'GENERATING') {
    return null;
  }

  return (
    <div className={cn("p-6 text-center", className)}>
      
      {/* Maya Avatar with Creating Mood */}
      <div className="flex justify-center mb-6">
        <MayaAvatar mood="creating" size="lg" />
      </div>

      {/* Progress Indicator */}
      <div className="mb-6">
        <LuxuryProgressIndicator 
          progress={state.generation.progress}
          isActive={true}
        />
      </div>

      {/* Dynamic Generation Message */}
      <div className="max-w-md mx-auto mb-6">
        <p className="text-sm text-gray-600 font-light leading-relaxed italic">
          "{content.getGenerationMessage(state.generation.progress)}"
        </p>
      </div>

      {/* Generation Stats */}
      <div className="text-xs text-gray-400 space-y-1">
        <div>Tracker ID: #{state.generation.trackerId}</div>
        <div>Status: {state.generation.status}</div>
        <div>Progress: {Math.round(state.generation.progress)}%</div>
      </div>

    </div>
  );
}