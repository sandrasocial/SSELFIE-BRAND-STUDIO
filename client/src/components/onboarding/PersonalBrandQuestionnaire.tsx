import { FC } from 'react';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
// Label component removed
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
  'Get more qualified leads',
  'Charge premium prices',
  'Build client trust faster',
  'Stand out from competition',
  'Attract better clients',
  'Launch new services',
  'Scale existing business',
  'Become known in my industry'
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

export const PersonalBrandQuestionnaire: FC<PersonalBrandQuestionnaireProps> = ({
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
        <h2 className="editorial-headline mb-2">Your Business Profile</h2>
        <p className="system-text text-soft-gray mb-8">
          Quick questions to understand your business and create content that actually works for your goals.
        </p>
      </div>

      <div className="space-y-10">
        {/* Personal Story */}
        <div className="space-y-4">
          <Label className="eyebrow-text">What do you do?</Label>
          <Textarea
            value={assessment.personalStory}
            onChange={(e) => onChange({ personalStory: e.target.value })}
            placeholder="Describe your business, service, or profession. What problem do you solve?"
            className="min-h-[120px] text-base"
          />
          <p className="system-text text-soft-gray text-sm">
            Clear description helps create relevant content for your audience
          </p>
        </div>

        {/* Target Audience */}
        <div className="space-y-4">
          <Label className="eyebrow-text">Who are your ideal clients?</Label>
          <Textarea
            value={assessment.targetAudience}
            onChange={(e) => onChange({ targetAudience: e.target.value })}
            placeholder="Describe who needs what you offer. Be specific - age, industry, goals, challenges..."
            className="min-h-[100px] text-base"
          />
          <p className="system-text text-soft-gray text-sm">
            Specific audience details create more targeted, effective content
          </p>
        </div>

        {/* Personal Goals */}
        <div className="space-y-4">
          <Label className="eyebrow-text">What business results do you want? (Select all that apply)</Label>
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
          <Label className="eyebrow-text">What services do you offer? (Select your main areas)</Label>
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
          <Label className="eyebrow-text">How do you work with clients?</Label>
          <Input
            value={assessment.personality}
            onChange={(e) => onChange({ personality: e.target.value })}
            placeholder="e.g., Straight-talking and results-focused, supportive and hands-on, strategic and analytical..."
            className="text-base"
          />
          <p className="system-text text-soft-gray text-sm">
            Your working style helps create content that attracts the right clients
          </p>
        </div>

        {/* Unique Value */}
        <div className="space-y-4">
          <Label className="eyebrow-text">What makes you the obvious choice?</Label>
          <Textarea
            value={assessment.uniqueValue}
            onChange={(e) => onChange({ uniqueValue: e.target.value })}
            placeholder="What specific results do you deliver? What do clients get from you vs your competition?"
            className="min-h-[100px] text-base"
          />
          <p className="system-text text-soft-gray text-sm">
            Focus on concrete outcomes and results you deliver consistently
          </p>
        </div>

        {/* Dream Clients */}
        <div className="space-y-4">
          <Label className="eyebrow-text">What type of projects do you want?</Label>
          <Textarea
            value={assessment.dreamClients}
            onChange={(e) => onChange({ dreamClients: e.target.value })}
            placeholder="Describe your ideal projects, client budgets, industries, or collaboration types..."
            className="min-h-[100px] text-base"
          />
          <p className="system-text text-soft-gray text-sm">
            Specific project details help create content that attracts profitable work
          </p>
        </div>
      </div>
    </div>
  );
};