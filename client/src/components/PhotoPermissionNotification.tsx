import React, { useState } from 'react';
import { AlertTriangle, Camera, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PhotoPermissionNotificationProps {
  onPermissionGranted: () => void;
  onManualSelection: () => void;
}

export function PhotoPermissionNotification({ 
  onPermissionGranted, 
  onManualSelection 
}: PhotoPermissionNotificationProps) {
  const [showInstructions, setShowInstructions] = useState(false);

  return (
    <Card className="w-full max-w-2xl mx-auto border-orange-200 bg-orange-50">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-6 w-6 text-orange-600" />
          <CardTitle className="text-lg text-orange-800">
            Photo Access Required
          </CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-orange-700">
          To train your personal AI model, we need access to your photos. 
          This ensures only YOUR photos are used - never anyone else's.
        </p>
        
        <div className="bg-white border border-orange-200 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-orange-600" />
            <span className="font-medium text-orange-800">
              Why we need photo access:
            </span>
          </div>
          <ul className="text-sm text-orange-700 space-y-1 ml-7">
            <li>• Upload at least 10 of your selfies</li>
            <li>• Create your individual AI model</li>
            <li>• Guarantee only your photos are used in training</li>
            <li>• Prevent cross-contamination with other users</li>
          </ul>
        </div>
        
        {showInstructions && (
          <div className="bg-white border border-orange-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-orange-600" />
              <span className="font-medium text-orange-800">
                How to allow photo access:
              </span>
            </div>
            
            <div className="text-sm text-orange-700 space-y-2">
              <div>
                <strong>iPhone/iPad:</strong>
                <ol className="list-decimal list-inside ml-4 mt-1 space-y-1">
                  <li>Go to Settings → Privacy & Security → Photos</li>
                  <li>Find your browser (Safari/Chrome)</li>
                  <li>Select "Selected Photos" or "All Photos"</li>
                  <li>Return here and try again</li>
                </ol>
              </div>
              
              <div>
                <strong>Android:</strong>
                <ol className="list-decimal list-inside ml-4 mt-1 space-y-1">
                  <li>Go to Settings → Apps → [Your Browser]</li>
                  <li>Tap "Permissions" → "Storage" or "Media"</li>
                  <li>Allow access to photos</li>
                  <li>Return here and try again</li>
                </ol>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={onPermissionGranted}
            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
          >
            Grant Photo Access
          </Button>
          
          <Button 
            onClick={onManualSelection}
            variant="outline"
            className="flex-1 border-orange-300 text-orange-700 hover:bg-orange-100"
          >
            Select Photos Manually
          </Button>
        </div>
        
        <Button 
          onClick={() => setShowInstructions(!showInstructions)}
          variant="link"
          className="w-full text-orange-600 hover:text-orange-800"
        >
          {showInstructions ? 'Hide' : 'Show'} permission instructions
        </Button>
      </CardContent>
    </Card>
  );
}