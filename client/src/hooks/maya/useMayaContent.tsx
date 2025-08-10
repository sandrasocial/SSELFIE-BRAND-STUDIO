// Maya STYLE Interface - Content & Personality System
// August 10, 2025 - Redesign Implementation

import { useAuth } from '@/hooks/use-auth';
import { useMayaState } from './useMayaState';

export function useMayaContent() {
  const { user } = useAuth();
  const { state } = useMayaState();
  
  const getPersonalizedGreeting = () => {
    const timeOfDay = new Date().getHours();
    const firstName = user?.firstName || 'gorgeous';
    const isReturning = state.chat.chatHistory.length > 0;
    
    if (timeOfDay < 12) {
      return isReturning 
        ? `Good morning, ${firstName}! Ready to continue your style evolution?`
        : `Good morning, ${firstName}! I'm Maya, your personal celebrity stylist. Let's create something absolutely divine together.`;
    } else if (timeOfDay < 17) {
      return isReturning
        ? `Perfect timing, ${firstName}! Let's create something extraordinary.`
        : `Hello beautiful! I'm Maya, your exclusive style curator. I've styled A-listers for red carpets and magazine covers - now it's your turn to shine.`;
    } else {
      return isReturning
        ? `Evening, ${firstName}! Ready for your next iconic look?`
        : `Good evening, ${firstName}! I'm Maya, your after-hours style confidante. The best looks are born when the world is quiet and creativity flows.`;
    }
  };
  
  const getStyleEducationTip = () => {
    const tips = [
      "Did you know? Coco Chanel always said 'luxury must be comfortable, otherwise it's not luxury.' Every look I create follows this golden rule.",
      "Insider secret: The most photographed looks have one standout element and everything else whispers. It's about creating that perfect focal point.",
      "Red carpet wisdom: Confidence is your best accessory - wear it with everything. I've seen unknown faces become icons simply through presence.",
      "Editorial truth: Great style is about expressing your authentic self, elevated. We're not changing you - we're revealing your most powerful version.",
      "Celebrity insight: The most memorable looks tell a story about who you are. Every detail should feel intentional and personal.",
      "Photographer's secret: The best shots happen when you forget about the camera and remember your power. That's what we're capturing here.",
      "Fashion week reality: Trends come and go, but personal style is eternal. We're creating your signature aesthetic that transcends seasons."
    ];
    return tips[Math.floor(Math.random() * tips.length)];
  };
  
  const getGenerationMessage = (progress: number) => {
    if (progress < 20) {
      return "I'm analyzing your unique features and energy... Every face tells a story, and yours is extraordinary.";
    } else if (progress < 40) {
      return "Now selecting the perfect lighting and angles that will make you absolutely luminous...";
    } else if (progress < 60) {
      return "Crafting the mood and aesthetic that captures your essence... This is where the magic happens.";
    } else if (progress < 80) {
      return "Adding those finishing touches that transform good into breathtaking...";
    } else if (progress < 95) {
      return "Almost there! Perfecting every detail until it's red-carpet ready...";
    } else {
      return "Revealing your stunning transformation... Get ready to see yourself in a whole new light!";
    }
  };
  
  const getSuccessMessage = (imageCount: number) => {
    const messages = [
      `Absolutely divine! I've created ${imageCount} stunning looks that capture your unique radiance.`,
      `Perfection! These ${imageCount} images showcase exactly why you're meant to be in the spotlight.`,
      `Breathtaking! I've captured ${imageCount} different facets of your incredible energy.`,
      `Magazine-worthy! These ${imageCount} shots could easily grace the cover of Vogue.`,
      `Pure artistry! Each of these ${imageCount} images tells the story of your undeniable presence.`
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };
  
  const getConversationStarters = () => {
    return [
      "What's the mood you want to embody today? Powerful CEO? Ethereal goddess? Editorial rebel?",
      "Tell me about a moment when you felt absolutely unstoppable. That's the energy we're capturing.",
      "If your style could speak, what would it say about you?",
      "What's your power color? The one that makes you feel like you can conquer the world?",
      "Describe your dream photoshoot location. Sometimes inspiration comes from unexpected places.",
      "Who's your style icon? Not to copy, but to understand what draws you to certain aesthetics.",
      "What's one compliment you'd love to receive about these photos?"
    ];
  };
  
  const getErrorRecoveryMessage = (errorType: string) => {
    switch (errorType) {
      case 'generation_failed':
        return "Don't worry, darling! Sometimes the most beautiful art takes a few attempts. Let's try a different approach - tell me more about the vision you have in mind.";
      case 'network_error':
        return "It seems we have a small technical hiccup, but nothing can stop great style! Let's try again in just a moment.";
      case 'auth_error':
        return "Let's make sure you're properly signed in so I can access your style profile and create something truly personalized for you.";
      default:
        return "Every great stylist encounters little challenges, but we always find a way to create magic. Let's keep going!";
    }
  };
  
  const getSaveToGalleryMessage = () => {
    const messages = [
      "Excellent choice! This image deserves a permanent place in your portfolio.",
      "Perfect! This shot is definitely gallery-worthy - you look absolutely stunning.",
      "Smart selection! This image captures everything we were aiming for.",
      "Love this choice! This photo shows your most radiant self."
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };
  
  return {
    getPersonalizedGreeting,
    getStyleEducationTip,
    getGenerationMessage,
    getSuccessMessage,
    getConversationStarters,
    getErrorRecoveryMessage,
    getSaveToGalleryMessage,
  };
}