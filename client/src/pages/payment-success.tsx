import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

export default function PaymentSuccess() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Clear any stored plan data since payment is complete
    localStorage.removeItem('selectedPlan');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/5 border-gold/20 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            Payment Successful!
          </CardTitle>
          <CardDescription className="text-gray-300">
            Welcome to SSELFIE Studio
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center text-gray-300">
            <p className="mb-4">
              Your subscription has been activated successfully. You now have access to:
            </p>
            
            <ul className="text-left space-y-2 mb-6">
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                <span>AI model training with your photos</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                <span>30 professional AI photos per month</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                <span>Maya AI photographer</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                <span>Personal branding tools</span>
              </li>
            </ul>
          </div>
          
          <div className="flex flex-col gap-3">
            <Button 
              onClick={() => setLocation('/workspace')}
              className="w-full bg-gold hover:bg-gold/90 text-black font-semibold"
            >
              Start Creating
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => setLocation('/')}
              className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}