import React, { useState } from 'react';
import { MemberNavigation } from '@/components/member-navigation';
import { Link } from 'wouter';

const essentialPhotos = [
  {
    type: "Close-up Front",
    description: "Looking straight at camera",
    tips: "Natural expression, good lighting on face"
  },
  {
    type: "Close-up Left",
    description: "Turn head slightly left",
    tips: "Same lighting, show your good side"
  },
  {
    type: "Close-up Right",
    description: "Turn head slightly right",
    tips: "Keep shoulders straight"
  },
  {
    type: "Waist-up Standing",
    description: "Standing, arms relaxed",
    tips: "Natural posture, simple background"
  },
  {
    type: "Waist-up Sitting",
    description: "Sitting at table or desk",
    tips: "Lean slightly forward, engaged look"
  },
  {
    type: "Waist-up Gesture",
    description: "Using hands while talking",
    tips: "Natural movement, not posed"
  },
  {
    type: "Full Body Standing",
    description: "Full length, facing camera",
    tips: "Confident stance, full outfit visible"
  },
  {
    type: "Full Body Movement",
    description: "Walking or in motion",
    tips: "Natural stride, candid feel"
  },
  {
    type: "Profile Left",
    description: "Complete side view",
    tips: "Chin parallel to ground"
  },
  {
    type: "Profile Right",
    description: "Other side view",
    tips: "Shows your face structure"
  }
];

const advancedOptions = [
  {
    category: "Style Variations",
    items: [
      "Professional attire for business imagery",
      "Casual wear for lifestyle content",
      "Evening wear for luxury visuals",
      "Activewear for wellness content"
    ]
  },
  {
    category: "Expression Range",
    items: [
      "Laughing (genuine joy)",
      "Serious/focused (CEO energy)",
      "Thoughtful (contemplative)",
      "Speaking (mid-conversation)"
    ]
  },
  {
    category: "Environmental Context",
    items: [
      "Home office setup",
      "Outdoor natural settings",
      "Urban/city backgrounds",
      "Luxury locations"
    ]
  },
  {
    category: "Signature Elements",
    items: [
      "Your signature accessories",
      "Brand colors in wardrobe",
      "Props related to your work",
      "Specific hairstyles you rotate"
    ]
  }
];

export default function SelfieGuide() {
  const [activeTab, setActiveTab] = useState<'essential' | 'advanced'>('essential');

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <MemberNavigation />
      
      <div className="max-w-4xl mx-auto px-6 py-20">
        {/* Back Link */}
        <Link href="/onboarding" className="inline-block mb-10 bg-white border border-[#e5e5e5] px-6 py-3 text-[#0a0a0a] text-[11px] tracking-[0.3em] uppercase no-underline hover:bg-[#0a0a0a] hover:text-white transition-colors">
          ← Back to Onboarding
        </Link>

        {/* Header */}
        <div className="mb-16 text-center">
          <div className="text-[11px] tracking-[0.4em] text-[#666] uppercase mb-7 font-medium">
            SSELFIE AI Training Guide
          </div>
          <h1 className="text-4xl md:text-5xl font-light mb-8 tracking-[-0.01em] text-[#0a0a0a] leading-tight" style={{ fontFamily: 'Times New Roman, serif' }}>
            10 Photos to Launch Your Business Empire
          </h1>
          <p className="text-lg text-[#666] max-w-2xl mx-auto mb-11 leading-relaxed font-inter">
            After your AI trains on these photos, Victoria will build your complete business website, Maya will create your brand imagery, and you'll be ready to launch in 20 minutes with a professional business presence.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-16">
          <div className="inline-flex border border-[#e5e5e5] bg-white">
            <button
              onClick={() => setActiveTab('essential')}
              className={`px-8 py-4 text-[11px] tracking-[0.3em] uppercase transition-colors ${
                activeTab === 'essential' 
                  ? 'bg-[#0a0a0a] text-white' 
                  : 'text-[#0a0a0a] hover:bg-[#f5f5f5]'
              }`}
            >
              Essential 10
            </button>
            <button
              onClick={() => setActiveTab('advanced')}
              className={`px-8 py-4 text-[11px] tracking-[0.3em] uppercase transition-colors border-l border-[#e5e5e5] ${
                activeTab === 'advanced' 
                  ? 'bg-[#0a0a0a] text-white' 
                  : 'text-[#0a0a0a] hover:bg-[#f5f5f5]'
              }`}
            >
              Level Up (Optional)
            </button>
          </div>
        </div>

        {activeTab === 'essential' ? (
          <>
            {/* Quick Start */}
            <div className="bg-white border border-[#e5e5e5] p-10 mb-16">
              <h2 className="text-2xl font-light mb-6 text-[#0a0a0a]" style={{ fontFamily: 'Times New Roman, serif' }}>
                Your Business Transformation Kit
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-[12px] tracking-[0.2em] uppercase mb-4 font-medium">Launch Your Business With</h3>
                  <ul className="space-y-2 text-[#666]">
                    <li>• Your phone camera</li>
                    <li>• A window with natural light</li>
                    <li>• 15 minutes</li>
                    <li>• Your vision for success</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-[12px] tracking-[0.2em] uppercase mb-4 font-medium">Success Rules</h3>
                  <ul className="space-y-2 text-[#666]">
                    <li>• No filters or heavy editing</li>
                    <li>• Face clearly visible in all shots</li>
                    <li>• Mix of expressions (CEO energy)</li>
                    <li>• Recent photos only</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* The Essential 10 Grid */}
            <div className="mb-16">
              <h2 className="text-3xl font-light mb-8 text-center text-[#0a0a0a]" style={{ fontFamily: 'Times New Roman, serif' }}>
                The Essential 10 Photos
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {essentialPhotos.map((photo, index) => (
                  <div key={index} className="bg-white border border-[#e5e5e5] p-8">
                    <div className="flex items-start gap-6">
                      <div className="text-6xl font-light text-[#f5f5f5]" style={{ fontFamily: 'Times New Roman, serif' }}>
                        {(index + 1).toString().padStart(2, '0')}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-light mb-2 text-[#0a0a0a]" style={{ fontFamily: 'Times New Roman, serif' }}>
                          {photo.type}
                        </h3>
                        <p className="text-[#666] mb-2">{photo.description}</p>
                        <p className="text-sm text-[#999] italic">{photo.tips}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual Reference */}
            <div className="bg-[#0a0a0a] text-white p-16 mb-16">
              <h2 className="text-3xl font-light mb-8 text-center" style={{ fontFamily: 'Times New Roman, serif' }}>
                Perfect Lighting Reference
              </h2>
              <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
                <div className="text-center">
                  <div className="bg-white/10 aspect-square mb-4 flex items-center justify-center text-6xl">
                    ✓
                  </div>
                  <h3 className="text-sm uppercase tracking-wider mb-2">Best: Window Light</h3>
                  <p className="text-sm opacity-70">Soft, even, flattering</p>
                </div>
                <div className="text-center">
                  <div className="bg-white/10 aspect-square mb-4 flex items-center justify-center text-6xl">
                    ~
                  </div>
                  <h3 className="text-sm uppercase tracking-wider mb-2">Good: Cloudy Day</h3>
                  <p className="text-sm opacity-70">Diffused, no harsh shadows</p>
                </div>
                <div className="text-center">
                  <div className="bg-white/10 aspect-square mb-4 flex items-center justify-center text-6xl">
                    ✗
                  </div>
                  <h3 className="text-sm uppercase tracking-wider mb-2">Avoid: Direct Sun</h3>
                  <p className="text-sm opacity-70">Harsh shadows, squinting</p>
                </div>
              </div>
            </div>

            {/* Common Mistakes */}
            <div className="mb-16">
              <h2 className="text-3xl font-light mb-8 text-center text-[#0a0a0a]" style={{ fontFamily: 'Times New Roman, serif' }}>
                Avoid These Common Mistakes
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-[#f5f5f5] border border-[#e5e5e5] p-8">
                  <h3 className="text-lg font-medium mb-4 text-[#0a0a0a]">Technical Issues</h3>
                  <ul className="space-y-2 text-[#666]">
                    <li>✗ Blurry or out of focus</li>
                    <li>✗ Too dark to see features</li>
                    <li>✗ Heavy filters that change your face</li>
                    <li>✗ Cropped forehead or chin</li>
                  </ul>
                </div>
                <div className="bg-[#f5f5f5] border border-[#e5e5e5] p-8">
                  <h3 className="text-lg font-medium mb-4 text-[#0a0a0a]">Content Issues</h3>
                  <ul className="space-y-2 text-[#666]">
                    <li>✗ Same expression in every photo</li>
                    <li>✗ Sunglasses or face coverings</li>
                    <li>✗ Other people in frame</li>
                    <li>✗ Duplicates of same photo</li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Advanced Section */}
            <div className="mb-16">
              <div className="bg-white border-2 border-[#0a0a0a] p-10 mb-8">
                <h2 className="text-2xl font-light mb-4 text-[#0a0a0a]" style={{ fontFamily: 'Times New Roman, serif' }}>
                  When to Use Advanced Options
                </h2>
                <p className="text-[#666] leading-relaxed">
                  The Essential 10 gives your AI everything it needs. Add these extras ONLY if you want your AI to generate 
                  specific styles, settings, or versions of you. Each additional category adds 3-5 photos to your set.
                </p>
              </div>

              {advancedOptions.map((option, index) => (
                <div key={index} className="bg-white border border-[#e5e5e5] p-8 mb-6">
                  <h3 className="text-xl font-light mb-4 text-[#0a0a0a]" style={{ fontFamily: 'Times New Roman, serif' }}>
                    {option.category}
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {option.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-start">
                        <span className="text-[#666] mr-3">→</span>
                        <span className="text-[#666]">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="bg-[#f5f5f5] p-10 mt-12">
                <h3 className="text-xl font-light mb-4 text-[#0a0a0a] text-center" style={{ fontFamily: 'Times New Roman, serif' }}>
                  Pro Tip from Sandra
                </h3>
                <p className="text-[#666] text-center max-w-2xl mx-auto italic">
                  "I only added business outfits because my AI needed to show me at conferences. 
                  If you're always in black (like me), skip the wardrobe changes. Your AI learns YOU, not your closet."
                </p>
              </div>
            </div>
          </>
        )}

        {/* Final CTA */}
        <div className="text-center py-16 border-t border-[#e5e5e5]">
          <h2 className="text-3xl font-light mb-6 text-[#0a0a0a]" style={{ fontFamily: 'Times New Roman, serif' }}>
            Ready to Create Your AI Model?
          </h2>
          <p className="text-[#666] mb-8 max-w-xl mx-auto">
            Upload your photos and start training your personal AI. In 24-48 hours, 
            you'll have a custom model that creates professional images of you.
          </p>
          <Link 
            href="/model-training"
            className="bg-[#0a0a0a] text-white px-12 py-4 text-[11px] tracking-[0.3em] uppercase hover:bg-[#333] transition-colors inline-block no-underline"
          >
            Start Model Training
          </Link>
        </div>

        {/* Quick Checklist */}
        <div className="bg-white border-2 border-[#0a0a0a] p-8 max-w-2xl mx-auto mt-16">
          <h3 className="text-[12px] tracking-[0.3em] uppercase mb-6 text-center font-medium">Final Checklist</h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <p className="font-medium mb-2">✓ 10 photos minimum</p>
              <p className="font-medium mb-2">✓ Good natural lighting</p>
              <p className="font-medium mb-2">✓ Mix of angles & distances</p>
            </div>
            <div>
              <p className="font-medium mb-2">✓ Different expressions</p>
              <p className="font-medium mb-2">✓ No heavy filters</p>
              <p className="font-medium mb-2">✓ Recent photos only</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}