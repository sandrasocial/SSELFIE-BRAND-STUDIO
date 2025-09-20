import React from 'react';
import { 
  EditorialButton, 
  EditorialCard, 
  EditorialInput, 
  EditorialTextarea, 
  EditorialHeading, 
  EditorialText 
} from './index';
import { useEditorialAnimations } from '../../hooks/useEditorialAnimations';

// Example showcase component demonstrating the editorial luxury system
export function EditorialShowcase() {
  const { fadeInRef, hoverScaleRef, touchFeedbackRef } = useEditorialAnimations();

  return (
    <div className="min-h-screen bg-gradient-to-br from-editorial-black via-neutral-950 to-neutral-900 p-8">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Header Section */}
        <div ref={fadeInRef} className="text-center space-y-6">
          <EditorialHeading level={1} className="text-neutral-200">
            EDITORIAL LUXURY SYSTEM
          </EditorialHeading>
          <EditorialText className="text-neutral-400 max-w-2xl mx-auto">
            A sophisticated design system that transforms your mobile app into a premium experience 
            rivaling high-end smart home interfaces and luxury social platforms.
          </EditorialText>
        </div>

        {/* Button Showcase */}
        <EditorialCard variant="glass" className="space-y-6">
          <EditorialHeading level={2} className="text-neutral-200">
            BUTTON SYSTEM
          </EditorialHeading>
          
          <div className="flex flex-wrap gap-4">
            <EditorialButton variant="primary" size="lg">
              PRIMARY ACTION
            </EditorialButton>
            
            <EditorialButton variant="secondary" size="lg">
              SECONDARY ACTION
            </EditorialButton>
            
            <EditorialButton variant="ghost" size="lg">
              GHOST BUTTON
            </EditorialButton>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <EditorialButton variant="primary" size="md">
              MEDIUM SIZE
            </EditorialButton>
            
            <EditorialButton variant="secondary" size="sm">
              SMALL SIZE
            </EditorialButton>
          </div>
        </EditorialCard>

        {/* Form Elements */}
        <EditorialCard variant="elevated" className="space-y-6">
          <EditorialHeading level={2} className="text-neutral-200">
            FORM ELEMENTS
          </EditorialHeading>
          
          <div className="grid gap-6">
            <div>
              <EditorialText variant="caption" className="mb-2 text-neutral-400">
                EMAIL ADDRESS
              </EditorialText>
              <EditorialInput 
                type="email" 
                placeholder="Enter your email address"
              />
            </div>
            
            <div>
              <EditorialText variant="caption" className="mb-2 text-neutral-400">
                MESSAGE
              </EditorialText>
              <EditorialTextarea 
                placeholder="Write your message here..."
                rows={4}
              />
            </div>
          </div>
        </EditorialCard>

        {/* Typography System */}
        <EditorialCard variant="default" className="space-y-8">
          <EditorialHeading level={2} className="text-neutral-200">
            TYPOGRAPHY HIERARCHY
          </EditorialHeading>
          
          <div className="space-y-6">
            <div>
              <EditorialHeading level={1}>
                DISPLAY HEADLINE
              </EditorialHeading>
              <EditorialText variant="caption" className="text-neutral-500 mt-2">
                H1 - Display XL, 300 weight, extra-wide tracking
              </EditorialText>
            </div>
            
            <div>
              <EditorialHeading level={2}>
                PRIMARY HEADING
              </EditorialHeading>
              <EditorialText variant="caption" className="text-neutral-500 mt-2">
                H2 - Display LG, 300 weight, wide tracking
              </EditorialText>
            </div>
            
            <div>
              <EditorialHeading level={3}>
                SECTION HEADING
              </EditorialHeading>
              <EditorialText variant="caption" className="text-neutral-500 mt-2">
                H3 - Heading 1, 300 weight, subtle tracking
              </EditorialText>
            </div>
            
            <div>
              <EditorialText>
                This is body text with elegant line height and sophisticated neutral colors. 
                The editorial system emphasizes readability while maintaining the luxury aesthetic 
                through careful typography choices and premium spacing.
              </EditorialText>
              <EditorialText variant="caption" className="text-neutral-500 mt-2">
                Body text - 1rem, 300 weight, 1.6 line height
              </EditorialText>
            </div>
            
            <div>
              <EditorialText variant="caption">
                CAPTION TEXT WITH REFINED TRACKING FOR EDITORIAL SOPHISTICATION
              </EditorialText>
            </div>
          </div>
        </EditorialCard>

        {/* Interactive Elements */}
        <EditorialCard variant="glass" className="space-y-6">
          <EditorialHeading level={2} className="text-neutral-200">
            INTERACTIVE ELEMENTS
          </EditorialHeading>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div 
              ref={hoverScaleRef}
              className="editorial-card cursor-pointer"
            >
              <EditorialText variant="caption" className="text-neutral-400 mb-2">
                HOVER ANIMATION
              </EditorialText>
              <EditorialText className="text-neutral-300">
                Subtle scale animation on hover with sophisticated easing curves.
              </EditorialText>
            </div>
            
            <div 
              ref={touchFeedbackRef}
              className="editorial-card cursor-pointer"
            >
              <EditorialText variant="caption" className="text-neutral-400 mb-2">
                TOUCH FEEDBACK
              </EditorialText>
              <EditorialText className="text-neutral-300">
                Premium touch interactions optimized for mobile devices.
              </EditorialText>
            </div>
            
            <div className="editorial-card">
              <EditorialText variant="caption" className="text-neutral-400 mb-2">
                GLASS MORPHISM
              </EditorialText>
              <EditorialText className="text-neutral-300">
                Sophisticated backdrop blur with editorial transparency.
              </EditorialText>
            </div>
          </div>
        </EditorialCard>

        {/* Color Palette */}
        <EditorialCard variant="elevated" className="space-y-6">
          <EditorialHeading level={2} className="text-neutral-200">
            EDITORIAL COLOR SYSTEM
          </EditorialHeading>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { name: 'Black', color: 'bg-black', text: '#000000' },
              { name: 'Surface', color: 'bg-neutral-950', text: '#0A0A0A' },
              { name: 'Elevated', color: 'bg-neutral-900', text: '#171717' },
              { name: 'Primary Text', color: 'bg-neutral-200', text: '#E5E5E5' },
              { name: 'Secondary', color: 'bg-neutral-500', text: '#737373' }
            ].map((item) => (
              <div key={item.name} className="space-y-2">
                <div className={`${item.color} h-16 rounded-xl border border-neutral-700/30`} />
                <EditorialText variant="caption" className="text-neutral-400">
                  {item.name}
                </EditorialText>
                <EditorialText variant="small" className="text-neutral-600 font-mono">
                  {item.text}
                </EditorialText>
              </div>
            ))}
          </div>
        </EditorialCard>

      </div>
    </div>
  );
}