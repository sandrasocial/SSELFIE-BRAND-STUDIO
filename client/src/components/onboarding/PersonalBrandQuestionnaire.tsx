import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';

export interface PersonalBrandAssessment {
  personalStory: string;
  targetAudience: string;
  personalGoals: string[];
  expertise: string[];
  personality: string;
  uniqueValue: string;
  dreamClients: string;
}

interface PersonalBrandQuestionnaireProps {
  assessment: PersonalBrandAssessment;
  onChange: (updates: Partial<PersonalBrandAssessment>) => void;
}

const GOAL_OPTIONS = [
  'Build my personal brand online',
  'Attract my dream clients',
  'Share my expertise and knowledge',
  'Create a professional presence',
  'Showcase my personality and style',
  'Network with like-minded people',
  'Launch my own business or service',
  'Become a thought leader in my field'
];

const EXPERTISE_OPTIONS = [
  'Photography & Visual Arts',
  'Fashion & Style',
  'Beauty & Wellness',
  'Lifestyle & Travel',
  'Business & Entrepreneurship',
  'Creative Services & Design',
  'Coaching & Consulting',
  'Content Creation',
  'Health & Fitness',
  'Food & Cooking',
  'Writing & Storytelling',
  'Technology & Innovation'
];

export const PersonalBrandQuestionnaire: React.FC<PersonalBrandQuestionnaireProps> = ({
  assessment,
  onChange
}) => {
  const handleGoalToggle = (goal: string) => {
    const currentGoals = assessment.personalGoals || [];
    const updatedGoals = currentGoals.includes(goal)
      ? currentGoals.filter(g => g !== goal)
      : [...currentGoals, goal];
    onChange({ personalGoals: updatedGoals });
  };

  const handleExpertiseToggle = (expertise: string) => {
    const currentExpertise = assessment.expertise || [];
    const updatedExpertise = currentExpertise.includes(expertise)
      ? currentExpertise.filter(e => e !== expertise)
      : [...currentExpertise, expertise];
    onChange({ expertise: updatedExpertise });
  };

  return (
    <div className="space-y-12 p-6 bg-pure-white">
      <div>
        <h2 className="editorial-headline mb-2">Tell Us About You</h2>
        <p className="system-text text-soft-gray mb-8">
          Help us understand your personality, goals, and what makes you unique so we can create a website that truly represents you.
        </p>
      </div>

      <div className="space-y-10">
        {/* Personal Story */}
        <div className="space-y-4">
          <Label className="eyebrow-text">What's your story?</Label>
          <Textarea
            value={assessment.personalStory}
            onChange={(e) => onChange({ personalStory: e.target.value })}
            placeholder="Tell us about your journey, what you're passionate about, and what led you to where you are today..."
            className="min-h-[120px] text-base"
          />
          <p className="system-text text-soft-gray text-sm">
            This will help us craft your "About" section with authenticity
          </p>
        </div>

        {/* Target Audience */}
        <div className="space-y-4">
          <Label className="eyebrow-text">Who do you want to connect with?</Label>
          <Textarea
            value={assessment.targetAudience}
            onChange={(e) => onChange({ targetAudience: e.target.value })}
            placeholder="Describe the people you want to attract - your ideal audience, followers, or potential clients..."
            className="min-h-[100px] text-base"
          />
          <p className="system-text text-soft-gray text-sm">
            Think about demographics, interests, and values that align with yours
          </p>
        </div>

        {/* Personal Goals */}
        <div className="space-y-4">
          <Label className="eyebrow-text">What are your goals? (Select all that apply)</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {GOAL_OPTIONS.map((goal) => (
              <Card
                key={goal}
                className={`p-4 cursor-pointer transition-all duration-300 ${
                  assessment.personalGoals?.includes(goal)
                    ? 'border-luxury-black bg-accent-bg'
                    : 'border-accent-line hover:border-soft-gray'
                }`}
                onClick={() => handleGoalToggle(goal)}
              >
                <p className="system-text">{goal}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Areas of Expertise */}
        <div className="space-y-4">
          <Label className="eyebrow-text">What are you known for? (Select your areas of expertise)</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {EXPERTISE_OPTIONS.map((expertise) => (
              <Card
                key={expertise}
                className={`p-4 cursor-pointer transition-all duration-300 ${
                  assessment.expertise?.includes(expertise)
                    ? 'border-luxury-black bg-accent-bg'
                    : 'border-accent-line hover:border-soft-gray'
                }`}
                onClick={() => handleExpertiseToggle(expertise)}
              >
                <p className="system-text">{expertise}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Personality */}
        <div className="space-y-4">
          <Label className="eyebrow-text">How would your friends describe your personality?</Label>
          <Input
            value={assessment.personality}
            onChange={(e) => onChange({ personality: e.target.value })}
            placeholder="e.g., Creative and inspiring, down-to-earth and approachable, bold and confident..."
            className="text-base"
          />
          <p className="system-text text-soft-gray text-sm">
            This helps us match your website's tone to your authentic voice
          </p>
        </div>

        {/* Unique Value */}
        <div className="space-y-4">
          <Label className="eyebrow-text">What makes you different?</Label>
          <Textarea
            value={assessment.uniqueValue}
            onChange={(e) => onChange({ uniqueValue: e.target.value })}
            placeholder="What unique perspective, experience, or approach do you bring? What do people come to you for?"
            className="min-h-[100px] text-base"
          />
          <p className="system-text text-soft-gray text-sm">
            Think about your unique strengths, experiences, or the special way you do things
          </p>
        </div>

        {/* Dream Clients */}
        <div className="space-y-4">
          <Label className="eyebrow-text">Who are your dream people to work with?</Label>
          <Textarea
            value={assessment.dreamClients}
            onChange={(e) => onChange({ dreamClients: e.target.value })}
            placeholder="Describe the types of people, brands, or collaborations you'd love to attract..."
            className="min-h-[100px] text-base"
          />
          <p className="system-text text-soft-gray text-sm">
            This will help us optimize your website to attract the right opportunities
          </p>
        </div>
      </div>
    </div>
  );
};