import { FormEvent, useState, useEffect } from 'react';
import { useAuth } from '../hooks/use-auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../hooks/use-toast';
import { apiRequest } from '../lib/queryClient';
import { MemberNavigation } from '../components/member-navigation';
import { SandraImages } from '../lib/sandra-images';

export default function Profile() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  // Fetch user profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ['/api/profile'],
    enabled: isAuthenticated,
    retry: false
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (updates: any) => {
      return await apiRequest('/api/profile', 'PUT', updates);
    },
    onSuccess: () => {
      toast({
        title: "Profile Saved",
        description: "Your information helps create better photos that match your goals.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast({
        title: "Save Failed", 
        description: error.message || "Please try saving your profile again.",

      });
    }
  });

  const [formData, setFormData] = useState({
    name: (profile as any)?.name || '',
    transformationStory: (profile as any)?.transformationStory || '',
    currentSituation: (profile as any)?.currentSituation || '',
    futureVision: (profile as any)?.futureVision || '',
    businessGoals: (profile as any)?.businessGoals || '',
    businessType: (profile as any)?.businessType || '',
    stylePreferences: (profile as any)?.stylePreferences || '',
    photoGoals: (profile as any)?.photoGoals || ''
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: (profile as any).name || '',
        transformationStory: (profile as any).transformationStory || '',
        currentSituation: (profile as any).currentSituation || '',
        futureVision: (profile as any).futureVision || '',
        businessGoals: (profile as any).businessGoals || '',
        businessType: (profile as any).businessType || '',
        stylePreferences: (profile as any).stylePreferences || '',
        photoGoals: (profile as any).photoGoals || ''
      });
    }
  }, [profile]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSuggestionClick = (field: string, suggestion: string) => {
    const currentValue = formData[field as keyof typeof formData];
    const newValue = currentValue ? `${currentValue} ${suggestion}` : suggestion;
    handleInputChange(field, newValue);
  };

  // Suggestion options for each field
  const suggestions = {
    transformationStory: [
      "Started from scratch with $500",
      "Quit corporate to solve a real problem", 
      "Two years of failures before first success",
      "From side hustle to full-time business",
      "Industry experience led to consulting"
    ],
    currentSituation: [
      "Profitable but need more leads",
      "Good reputation, inconsistent income",
      "Booked solid, ready to scale",
      "Strong skills, weak marketing",
      "6 months in, learning fast"
    ],
    futureVision: [
      "Booked 6 months ahead consistently",
      "Industry go-to for [specific problem]", 
      "Premium prices, ideal clients only",
      "Team handling operations while I focus on strategy",
      "Multiple revenue streams from expertise"
    ],
    businessGoals: [
      "Double my current rates",
      "Hit $10k months consistently",
      "Launch high-value group program",
      "Get featured in industry publications",
      "Build waitlist for my services"
    ],
    businessType: [
      "Business Coach",
      "Creative Director",
      "E-commerce Store", 
      "Service Provider",
      "Content Creator",
      "Consultant"
    ],
    stylePreferences: [
      "Clean and professional",
      "Bold and confident",
      "Approachable but premium",
      "Modern and minimal",
      "Classic with edge"
    ],
    photoGoals: [
      "LinkedIn and website headers",
      "Sales pages and marketing",
      "Speaking engagement materials",
      "Media kit and press photos",
      "Social proof content"
    ]
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white">
        <MemberNavigation />
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h1 className="text-3xl font-light mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
            Let's Get Started
          </h1>
          <p className="text-[#666666] mb-8">
            Sign in to create your profile so we can generate photos that actually look like you.
          </p>
          <a
            href="/api/login"
            className="text-xs uppercase tracking-wider text-[#0a0a0a] border-b border-[#0a0a0a] pb-1"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
      <div className="min-h-screen bg-white">
        <MemberNavigation />
        
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center bg-black text-white overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            <img 
              src="https://sselfie-training-zips.s3.eu-north-1.amazonaws.com/generated-images/42585527/maya_pq4snm35a5rm80crzxhafek9c4_0_1756631312368.png"
              alt="Your Story"
              className="w-full h-full object-cover object-center-top"
            />
          </div>
          
          <div className="relative z-10 text-center max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end min-h-screen pb-16 sm:pb-20">
            <div style={{
              fontSize: 'clamp(9px, 2vw, 11px)',
              letterSpacing: 'clamp(0.3em, 0.8vw, 0.4em)',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.7)',
              marginBottom: 'clamp(16px, 3vw, 24px)'
            }}>
              Let's Get Personal
            </div>
            
            <h1 style={{
              fontSize: 'clamp(3rem, 8vw, 8rem)',
              lineHeight: 0.9,
              fontWeight: 200,
              color: 'white',
              marginBottom: 'clamp(16px, 3vw, 24px)',
              fontFamily: 'Times New Roman, serif',
              letterSpacing: 'clamp(0.02em, 0.5vw, 0.05em)',
              textTransform: 'uppercase'
            }}>
              YOUR STORY
            </h1>
            
            <div style={{
              fontSize: 'clamp(9px, 2vw, 11px)',
              letterSpacing: 'clamp(0.3em, 0.8vw, 0.4em)',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.7)',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Your story helps create photos that match your goals
            </div>
          </div>
        </section>

        <main className="max-w-4xl mx-auto px-8 py-16">
          <div className="border border-[#0a0a0a] bg-white">
            {/* Header */}
            <div className="px-12 py-8 border-b border-[#0a0a0a]">
              <div className="text-center">
                <h2 className="text-2xl font-light text-[#0a0a0a] mb-3" style={{ fontFamily: 'Times New Roman, serif' }}>
                  Your Profile Setup
                </h2>
                <p className="text-sm text-[#666666] max-w-2xl mx-auto leading-relaxed">
                  Help me understand your story and goals so I can create photos that actually represent you. 
                  The more specific you are, the better your photos will be.
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="border border-[#0a0a0a] bg-white text-[#0a0a0a] px-8 py-3 text-xs uppercase tracking-[0.1em] hover:bg-[#0a0a0a] hover:text-white transition-colors"
                  >
                    {isEditing ? 'Save Profile' : 'Complete Your Profile'}
                  </button>
                </div>
              </div>
            </div>

            {/* Maya's Questions */}
            <div className="px-12 py-8">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-[#0a0a0a] border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-sm text-[#666666]">Loading your profile...</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-12">
                  
                  {/* Question 0: Your Name */}
                  <div className="border-b border-[#f5f5f5] pb-8">
                    <div className="mb-6">
                      <h3 className="text-lg font-light text-[#0a0a0a] mb-2" style={{ fontFamily: 'Times New Roman, serif' }}>
                        What should I call you?
                      </h3>
                      <p className="text-sm text-[#666666]">
                        Your name helps personalize your photo generation experience
                      </p>
                    </div>
                    
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="What should I call you?"
                        className="w-full border border-[#e5e5e5] px-4 py-3 text-sm focus:border-[#0a0a0a] focus:outline-none"
                      />
                    ) : (
                      <div className="text-sm text-[#666666] py-3 italic">
                        {formData.name || "I'd love to know what to call you..."}
                      </div>
                    )}
                  </div>
                  
                  {/* Question 1: Your Journey */}
                  <div className="border-b border-[#f5f5f5] pb-8">
                    <div className="mb-6">
                      <h3 className="text-lg font-light text-[#0a0a0a] mb-2" style={{ fontFamily: 'Times New Roman, serif' }}>
                        What's your business story?
                      </h3>
                      <p className="text-sm text-[#666666]">
                        What's your transformation story? Where did you start, and what led you to where you are now?
                      </p>
                    </div>
                    
                    {isEditing && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {suggestions.transformationStory.map((suggestion, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleSuggestionClick('transformationStory', suggestion)}
                            className="px-3 py-1 text-xs border border-[#e5e5e5] hover:border-[#0a0a0a] hover:bg-[#0a0a0a] hover:text-white transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {isEditing ? (
                      <textarea
                        value={formData.transformationStory}
                        onChange={(e) => handleInputChange('transformationStory', e.target.value)}
                        rows={4}
                        placeholder="I'd love to hear your story..."
                        className="w-full border border-[#e5e5e5] px-4 py-3 text-sm focus:border-[#0a0a0a] focus:outline-none resize-none"
                      />
                    ) : (
                      <div className="text-sm text-[#666666] py-3 italic">
                        {formData.transformationStory || "Tell me how you got started in business..."}
                      </div>
                    )}
                  </div>

                  {/* Question 2: Current Situation */}
                  <div className="border-b border-[#f5f5f5] pb-8">
                    <div className="mb-6">
                      <h3 className="text-lg font-light text-[#0a0a0a] mb-2" style={{ fontFamily: 'Times New Roman, serif' }}>
                        Where are you right now?
                      </h3>
                      <p className="text-sm text-[#666666]">
                        What's happening in your life and business today? What stage are you at?
                      </p>
                    </div>
                    
                    {isEditing && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {suggestions.currentSituation.map((suggestion, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleSuggestionClick('currentSituation', suggestion)}
                            className="px-3 py-1 text-xs border border-[#e5e5e5] hover:border-[#0a0a0a] hover:bg-[#0a0a0a] hover:text-white transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {isEditing ? (
                      <textarea
                        value={formData.currentSituation}
                        onChange={(e) => handleInputChange('currentSituation', e.target.value)}
                        rows={3}
                        placeholder="Tell me what's happening in your world right now..."
                        className="w-full border border-[#e5e5e5] px-4 py-3 text-sm focus:border-[#0a0a0a] focus:outline-none resize-none"
                      />
                    ) : (
                      <div className="text-sm text-[#666666] py-3 italic">
                        {formData.currentSituation || "I want to understand where you are in your journey right now..."}
                      </div>
                    )}
                  </div>

                  {/* Question 3: Future Vision */}
                  <div className="border-b border-[#f5f5f5] pb-8">
                    <div className="mb-6">
                      <h3 className="text-lg font-light text-[#0a0a0a] mb-2" style={{ fontFamily: 'Times New Roman, serif' }}>
                        What's your dream vision?
                      </h3>
                      <p className="text-sm text-[#666666]">
                        Close your eyes and imagine your future self living her best life. What does that look like?
                      </p>
                    </div>
                    
                    {isEditing && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {suggestions.futureVision.map((suggestion, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleSuggestionClick('futureVision', suggestion)}
                            className="px-3 py-1 text-xs border border-[#e5e5e5] hover:border-[#0a0a0a] hover:bg-[#0a0a0a] hover:text-white transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {isEditing ? (
                      <textarea
                        value={formData.futureVision}
                        onChange={(e) => handleInputChange('futureVision', e.target.value)}
                        rows={3}
                        placeholder="Paint me a picture of your dream life..."
                        className="w-full border border-[#e5e5e5] px-4 py-3 text-sm focus:border-[#0a0a0a] focus:outline-none resize-none"
                      />
                    ) : (
                      <div className="text-sm text-[#666666] py-3 italic">
                        {formData.futureVision || "I can't wait to help you step into your future self..."}
                      </div>
                    )}
                  </div>

                  {/* Question 4: Business Goals */}
                  <div className="border-b border-[#f5f5f5] pb-8">
                    <div className="mb-6">
                      <h3 className="text-lg font-light text-[#0a0a0a] mb-2" style={{ fontFamily: 'Times New Roman, serif' }}>
                        What are your big goals?
                      </h3>
                      <p className="text-sm text-[#666666]">
                        What do you want to achieve? What would make you feel like you've truly made it?
                      </p>
                    </div>
                    
                    {isEditing && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {suggestions.businessGoals.map((suggestion, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleSuggestionClick('businessGoals', suggestion)}
                            className="px-3 py-1 text-xs border border-[#e5e5e5] hover:border-[#0a0a0a] hover:bg-[#0a0a0a] hover:text-white transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {isEditing ? (
                      <textarea
                        value={formData.businessGoals}
                        onChange={(e) => handleInputChange('businessGoals', e.target.value)}
                        rows={3}
                        placeholder="Dream big with me - what do you want to achieve?"
                        className="w-full border border-[#e5e5e5] px-4 py-3 text-sm focus:border-[#0a0a0a] focus:outline-none resize-none"
                      />
                    ) : (
                      <div className="text-sm text-[#666666] py-3 italic">
                        {formData.businessGoals || "What business results do you want to achieve?"}
                      </div>
                    )}
                  </div>

                  {/* Question 5: Business Type */}
                  <div className="border-b border-[#f5f5f5] pb-8">
                    <div className="mb-6">
                      <h3 className="text-lg font-light text-[#0a0a0a] mb-2" style={{ fontFamily: 'Times New Roman, serif' }}>
                        What's your business or industry?
                      </h3>
                      <p className="text-sm text-[#666666]">
                        Tell me about your business or what you're building. What industry are you in?
                      </p>
                    </div>
                    
                    {isEditing && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {suggestions.businessType.map((suggestion, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleSuggestionClick('businessType', suggestion)}
                            className="px-3 py-1 text-xs border border-[#e5e5e5] hover:border-[#0a0a0a] hover:bg-[#0a0a0a] hover:text-white transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.businessType}
                        onChange={(e) => handleInputChange('businessType', e.target.value)}
                        placeholder="What's your business or industry?"
                        className="w-full border border-[#e5e5e5] px-4 py-3 text-sm focus:border-[#0a0a0a] focus:outline-none"
                      />
                    ) : (
                      <div className="text-sm text-[#666666] py-3 italic">
                        {formData.businessType || "I'd love to know what you do..."}
                      </div>
                    )}
                  </div>

                  {/* Question 6: Style Preferences */}
                  <div className="border-b border-[#f5f5f5] pb-8">
                    <div className="mb-6">
                      <h3 className="text-lg font-light text-[#0a0a0a] mb-2" style={{ fontFamily: 'Times New Roman, serif' }}>
                        Describe your style vibe
                      </h3>
                      <p className="text-sm text-[#666666]">
                        How do you like to show up? What aesthetic makes you feel most like yourself?
                      </p>
                    </div>
                    
                    {isEditing && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {suggestions.stylePreferences.map((suggestion, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleSuggestionClick('stylePreferences', suggestion)}
                            className="px-3 py-1 text-xs border border-[#e5e5e5] hover:border-[#0a0a0a] hover:bg-[#0a0a0a] hover:text-white transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {isEditing ? (
                      <textarea
                        value={formData.stylePreferences}
                        onChange={(e) => handleInputChange('stylePreferences', e.target.value)}
                        rows={3}
                        placeholder="Tell me about your style personality..."
                        className="w-full border border-[#e5e5e5] px-4 py-3 text-sm focus:border-[#0a0a0a] focus:outline-none resize-none"
                      />
                    ) : (
                      <div className="text-sm text-[#666666] py-3 italic">
                        {formData.stylePreferences || "I want to understand your personal style so I can capture it perfectly..."}
                      </div>
                    )}
                  </div>

                  {/* Question 7: Photo Goals */}
                  <div className="pb-8">
                    <div className="mb-6">
                      <h3 className="text-lg font-light text-[#0a0a0a] mb-2" style={{ fontFamily: 'Times New Roman, serif' }}>
                        How will you use these photos?
                      </h3>
                      <p className="text-sm text-[#666666]">
                        What's your vision for these photos? Where will you share them and how will they help your goals?
                      </p>
                    </div>
                    
                    {isEditing && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {suggestions.photoGoals.map((suggestion, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleSuggestionClick('photoGoals', suggestion)}
                            className="px-3 py-1 text-xs border border-[#e5e5e5] hover:border-[#0a0a0a] hover:bg-[#0a0a0a] hover:text-white transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {isEditing ? (
                      <textarea
                        value={formData.photoGoals}
                        onChange={(e) => handleInputChange('photoGoals', e.target.value)}
                        rows={3}
                        placeholder="How will you use these photos?"
                        className="w-full border border-[#e5e5e5] px-4 py-3 text-sm focus:border-[#0a0a0a] focus:outline-none resize-none"
                      />
                    ) : (
                      <div className="text-sm text-[#666666] py-3 italic">
                        {formData.photoGoals || "I want to create photos that serve your biggest dreams..."}
                      </div>
                    )}
                  </div>

                  {/* Save Button */}
                  {isEditing && (
                    <div className="border-t border-[#e5e5e5] pt-8 text-center">
                      <button
                        type="submit"
                        disabled={updateProfileMutation.isPending}
                        className="bg-[#0a0a0a] text-white px-12 py-4 text-xs uppercase tracking-[0.1em] hover:bg-[#333] transition-colors disabled:opacity-50"
                      >
                        {updateProfileMutation.isPending ? 'Saving Profile...' : 'Save Profile'}
                      </button>
                      <p className="text-xs text-[#666666] mt-3">
                        Maya will remember everything and style you based on your unique story
                      </p>
                    </div>
                  )}
                </form>
              )}
            </div>
          </div>
        </main>
      </div>
  );
}