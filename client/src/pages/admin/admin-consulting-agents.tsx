import React from 'react';
import { Button } from '@/components/ui/button';

export default function AdminConsultingAgents() {
  const handleTestClick = () => {
    alert('Test button clicked! 🎉');
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Consulting Agents Admin</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <Button 
          onClick={handleTestClick}
          variant="default"
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          Test Button
        </Button>
      </div>
    </div>
  );
}