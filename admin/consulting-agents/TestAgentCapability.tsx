import React from 'react';
import { Button } from '@/components/ui/button';

const TestAgentCapability: React.FC = () => {
  return (
    <div className="flex items-center justify-center p-4">
      <Button 
        className="bg-black hover:bg-gray-800 text-white font-medium"
        onClick={() => alert('Agent Test Complete')}
      >
        Agent Test Complete
      </Button>
    </div>
  );
};

export default TestAgentCapability;