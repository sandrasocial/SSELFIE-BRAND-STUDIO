import React from 'react';
import { TestButton } from './TestButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Code, 
  Zap,
  CheckCircle2 
} from 'lucide-react';

export function TestButtonDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Demo Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              SSELFIE Studio
            </h1>
            <Sparkles className="h-8 w-8 text-secondary" />
          </div>
          <h2 className="text-2xl font-semibold text-muted-foreground">
            Admin Test Suite Demo
          </h2>
          <div className="flex items-center justify-center gap-2">
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              <Code className="mr-1 h-3 w-3" />
              Development
            </Badge>
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Ready
            </Badge>
          </div>
        </div>

        {/* Demo Description */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Test Suite Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h3 className="font-semibold text-primary">🚀 Comprehensive Testing</h3>
                <p className="text-sm text-muted-foreground">
                  Tests all critical admin system components including database, auth, APIs, and more.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-primary">⚡ Real-time Results</h3>
                <p className="text-sm text-muted-foreground">
                  Live progress tracking with detailed status updates and performance metrics.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-primary">🎯 Luxury UX</h3>
                <p className="text-sm text-muted-foreground">
                  Beautiful interface with smooth animations and premium visual feedback.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Button Component */}
        <TestButton />

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Built with precision for SSELFIE Studio by Zara 🚀</p>
        </div>
      </div>
    </div>
  );
}