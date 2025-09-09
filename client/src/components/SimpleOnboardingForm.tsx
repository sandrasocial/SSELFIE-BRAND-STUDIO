import React, { useState } from 'react';
import { useToast } from '../hooks/use-toast';

interface OnboardingQuestion {
  id: string;
  question: string;
  type: 'select' | 'text';
  options?: Array<{ value: string; label: string; description?: string; icon?: string }>;
  required: boolean;
  mayaNote?: string;
}

interface SimpleOnboardingFormProps {
  questions: OnboardingQuestion[];
  welcomeMessage: string;
  onComplete: (answers: Record<string, string>) => void;
  isLoading?: boolean;
}

export const SimpleOnboardingForm: React.FC<SimpleOnboardingFormProps> = ({
  questions,
  welcomeMessage,
  onComplete,
  isLoading = false
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const canProceed = currentQuestion?.required ? !!answers[currentQuestion.id] : true;

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (!canProceed) {
      toast({
        title: "Please answer this question",
        description: "This information helps me create perfect photos for you!",
        variant: "destructive"
      });
      return;
    }

    if (isLastQuestion) {
      // Complete onboarding
      onComplete(answers);
    } else {
      // Move to next question
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // Show welcome screen first
  if (currentQuestionIndex === -1) {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-6 text-sm font-light tracking-wider">
            MAYA
          </div>
          <h1 className="text-3xl font-light tracking-wide mb-6 font-serif">Welcome to SSELFIE Studio</h1>
          <div className="text-gray-600 leading-relaxed whitespace-pre-line text-base">
            {welcomeMessage}
          </div>
        </div>
        <button
          onClick={() => setCurrentQuestionIndex(0)}
          className="w-full bg-black text-white py-4 px-8 font-light tracking-wide hover:bg-gray-800 transition-all duration-300 border-0 text-base"
        >
          Let's Get Started
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs uppercase tracking-widest text-gray-500 font-medium">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          <span className="text-xs uppercase tracking-widest text-gray-500 font-medium">
            {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 h-1">
          <div 
            className="bg-black h-1 transition-all duration-500 ease-out"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Maya Avatar & Question */}
      <div className="mb-8">
        <div className="flex items-start gap-6 mb-6">
          <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center text-xs font-light tracking-wider flex-shrink-0">
            M
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-light leading-relaxed text-black mb-4">
              {currentQuestion?.question}
            </h2>
            {currentQuestion?.mayaNote && (
              <p className="text-sm text-gray-600 leading-relaxed">
                {currentQuestion.mayaNote}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Answer Options */}
      <div className="mb-8">
        {currentQuestion?.type === 'select' && currentQuestion.options ? (
          <div className="space-y-3">
            {currentQuestion.options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleAnswer(currentQuestion.id, option.value)}
                className={`w-full text-left p-6 border transition-all duration-300 ${
                  answers[currentQuestion.id] === option.value
                    ? 'border-black bg-gray-50'
                    : 'border-gray-200 bg-white hover:border-black hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-4">
                  {option.icon && (
                    <span className="text-lg flex-shrink-0">{option.icon}</span>
                  )}
                  <div className="flex-1">
                    <div className="font-medium text-black mb-1">
                      {option.label}
                    </div>
                    {option.description && (
                      <div className="text-sm text-gray-600">
                        {option.description}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : currentQuestion?.type === 'text' ? (
          <input
            type="text"
            value={answers[currentQuestion.id] || ''}
            onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
            placeholder="Type your answer here..."
            className="w-full p-6 border border-gray-200 bg-gray-50 text-black placeholder-gray-500 focus:outline-none focus:border-black focus:bg-white transition-all duration-300 text-base font-light"
            autoFocus
          />
        ) : null}
      </div>

      {/* Navigation */}
      <div className="flex gap-4">
        {currentQuestionIndex > 0 && (
          <button
            onClick={handlePrevious}
            className="px-8 py-4 border border-gray-300 text-gray-700 hover:border-black hover:text-black transition-all duration-300 font-light tracking-wide"
          >
            Previous
          </button>
        )}
        <button
          onClick={handleNext}
          disabled={!canProceed || isLoading}
          className={`flex-1 py-4 px-8 font-light tracking-wide transition-all duration-300 text-base ${
            canProceed && !isLoading
              ? 'bg-black text-white hover:bg-gray-800'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Setting up your experience...
            </div>
          ) : isLastQuestion ? (
            'Complete Setup'
          ) : (
            'Continue'
          )}
        </button>
      </div>
    </div>
  );
};

// Initialize with welcome screen
SimpleOnboardingForm.defaultProps = {
  isLoading: false
};