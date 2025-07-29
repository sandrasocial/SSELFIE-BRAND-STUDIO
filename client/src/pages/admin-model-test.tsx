/**
 * ADMIN MODEL TEST INTERFACE
 * Test Sandra's trained LoRA model: sandrasocial/42585527-selfie-lora-1753201482760:80c29fa2
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export default function AdminModelTest() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [testPrompt, setTestPrompt] = useState('professional headshot, business attire, confident expression');
  const [generationResults, setGenerationResults] = useState<any[]>([]);

  // Get user model status
  const { data: userModel, isLoading: modelLoading } = useQuery({
    queryKey: ['/api/user-model'],
  });

  // Test generation mutation
  const testGeneration = useMutation({
    mutationFn: async (prompt: string) => {
      const response = await apiRequest('/api/maya/generate', 'POST', {
        prompt: prompt,
        style: 'professional'
      });
      return response;
    },
    onSuccess: (data) => {
      toast({
        title: "Generation Started",
        description: `Test generation initiated with your trained model`
      });
      setGenerationResults(prev => [data, ...prev]);
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to start generation",
        variant: "destructive"
      });
    }
  });

  const handleTestGeneration = () => {
    if (!testPrompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a test prompt",
        variant: "destructive"
      });
      return;
    }
    testGeneration.mutate(testPrompt);
  };

  if (modelLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">Loading model configuration...</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8" style={{ fontFamily: 'Times New Roman, serif' }}>
        Admin Model Test
      </h1>

      {/* Model Status Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Your Trained LoRA Model Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Model ID:</label>
              <p className="font-mono text-sm bg-gray-100 p-2 rounded">
                {userModel?.replicateModelId || 'Not configured'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Version ID:</label>
              <p className="font-mono text-sm bg-gray-100 p-2 rounded">
                {userModel?.replicateVersionId || 'Not configured'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Training Status:</label>
              <p className={`font-semibold ${userModel?.trainingStatus === 'completed' ? 'text-green-600' : 'text-orange-600'}`}>
                {userModel?.trainingStatus || 'Unknown'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Trigger Word:</label>
              <p className="font-mono text-sm bg-gray-100 p-2 rounded">
                {userModel?.triggerWord || 'user42585527'}
              </p>
            </div>
          </div>
          
          {userModel?.trainingStatus === 'completed' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-medium">
                ✅ Your trained LoRA model is ready for generation!
              </p>
              <p className="text-green-700 text-sm mt-1">
                Full model path: {userModel.replicateModelId}:{userModel.replicateVersionId}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generation Test Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Test Generation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Test Prompt:</label>
            <Textarea
              value={testPrompt}
              onChange={(e) => setTestPrompt(e.target.value)}
              placeholder="Enter a prompt to test your trained model..."
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">
              Your trigger word "{userModel?.triggerWord}" will be automatically added
            </p>
          </div>
          
          <Button 
            onClick={handleTestGeneration}
            disabled={testGeneration.isPending || userModel?.trainingStatus !== 'completed'}
            className="w-full"
          >
            {testGeneration.isPending ? 'Testing Generation...' : 'Test Your Trained Model'}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {generationResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Generation Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {generationResults.map((result, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Test #{generationResults.length - index}</span>
                    <span className="text-xs text-gray-500">
                      {new Date().toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded font-mono text-sm">
                    Status: {result.status || 'Processing'}
                    {result.predictionId && (
                      <div>Prediction ID: {result.predictionId}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}