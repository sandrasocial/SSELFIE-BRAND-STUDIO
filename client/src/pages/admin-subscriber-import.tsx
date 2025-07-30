import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Download, Users, Mail, MessageSquare } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { ManyChatPSIDUploader } from '@/components/admin/ManyChatPSIDUploader';

interface ImportResult {
  success: boolean;
  results: {
    flodesk: {
      imported: number;
      success: boolean;
      error: string | null;
    };
    manychat: {
      imported: number;
      success: boolean;
      error: string | null;
    };
    total: number;
  };
}

export default function AdminSubscriberImport() {
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showManyChatUploader, setShowManyChatUploader] = useState(false);
  const { toast } = useToast();

  const handleFlodeskImport = async () => {
    setImporting(true);
    try {
      const response = await apiRequest('/api/subscribers/flodesk/import', 'POST', {});
      toast({
        title: "Flodesk Import Successful",
        description: `Imported ${response.imported} subscribers from Flodesk`,
      });
    } catch (error) {
      toast({
        title: "Flodesk Import Failed",
        description: error instanceof Error ? error.message : "Failed to import from Flodesk",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  const handleManyChatPSIDList = async (psids: string[]) => {
    setImporting(true);
    try {
      const response = await apiRequest('/api/subscribers/manychat/import-psids', 'POST', { psids });
      toast({
        title: "ManyChat Import Successful",
        description: `Imported ${response.imported} subscribers from ${psids.length} PSIDs`,
      });
      setShowManyChatUploader(false);
    } catch (error) {
      toast({
        title: "ManyChat Import Failed", 
        description: error instanceof Error ? error.message : "Failed to import ManyChat subscribers",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  const handleManyChatAPIImport = async () => {
    setImporting(true);
    try {
      const response = await apiRequest('/api/subscribers/manychat/import', 'POST', {});
      toast({
        title: "ManyChat API Import Successful",
        description: `Imported ${response.imported} subscribers directly from ManyChat API`,
      });
    } catch (error) {
      toast({
        title: "ManyChat API Import Failed",
        description: error instanceof Error ? error.message : "Failed to import from ManyChat API. Please check your API token.",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  const handleCompleteImport = async () => {
    setImporting(true);
    try {
      const response = await apiRequest('/api/subscribers/import-all', 'POST', {}) as ImportResult;
      setImportResult(response);
      
      if (response.success) {
        toast({
          title: "Complete Import Successful",
          description: `Imported ${response.results.total} total subscribers`,
        });
      } else {
        toast({
          title: "Import Completed with Issues",
          description: "Some imports failed - check results below",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to complete import",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-black text-white py-16">
        <div className="max-w-4xl mx-auto px-8">
          <h1 className="text-4xl font-serif text-center mb-4">
            Subscriber Import Center
          </h1>
          <p className="text-lg text-center text-gray-300">
            Import email subscribers from Flodesk and ManyChat into SSELFIE Studio
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-16">
        {/* Import Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Flodesk Import
              </CardTitle>
              <CardDescription>
                Import all email subscribers from your Flodesk account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleFlodeskImport} 
                disabled={importing}
                className="w-full"
                variant="outline"
              >
                {importing ? "Importing..." : "Import from Flodesk"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                ManyChat Import
              </CardTitle>
              <CardDescription>
                Import all messenger subscribers from ManyChat
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Two Options:</strong> Manual contact export OR direct ManyChat API import (requires API token)
                </AlertDescription>
              </Alert>
              <div className="space-y-2">
                <Button 
                  onClick={() => setShowManyChatUploader(true)} 
                  disabled={importing}
                  className="w-full"
                  variant="outline"
                >
                  {importing ? 'Processing...' : 'Manual Upload Method'}
                </Button>
                <Button 
                  onClick={handleManyChatAPIImport} 
                  disabled={importing}
                  className="w-full"
                  variant="default"
                >
                  {importing ? 'Importing...' : 'Direct API Import (Recommended)'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Complete Import
              </CardTitle>
              <CardDescription>
                Import from both platforms simultaneously
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleCompleteImport} 
                disabled={importing}
                className="w-full bg-black text-white hover:bg-gray-800"
              >
                {importing ? "Importing..." : "Import All Subscribers"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* API Key Status */}
        <Alert className="mb-8">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            API keys for Flodesk and ManyChat should be configured in your environment variables. 
            Contact support if you need help setting up the integration.
          </AlertDescription>
        </Alert>

        {/* ManyChat PSID Uploader */}
        {showManyChatUploader && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>ManyChat Import Process</CardTitle>
            </CardHeader>
            <CardContent>
              <ManyChatPSIDUploader onPSIDListReady={handleManyChatPSIDList} />
              <div className="mt-4 text-center">
                <Button 
                  variant="outline" 
                  onClick={() => setShowManyChatUploader(false)}
                >
                  Cancel Import Process
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Import Results */}
        {importResult && (
          <Card>
            <CardHeader>
              <CardTitle>Import Results</CardTitle>
              <CardDescription>
                Summary of the most recent complete import operation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Flodesk</h4>
                    <Badge variant={importResult.results.flodesk.success ? "default" : "destructive"}>
                      {importResult.results.flodesk.success ? "Success" : "Failed"}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Imported: {importResult.results.flodesk.imported} subscribers
                  </p>
                  {importResult.results.flodesk.error && (
                    <p className="text-sm text-red-600 mt-1">
                      Error: {importResult.results.flodesk.error}
                    </p>
                  )}
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">ManyChat</h4>
                    <Badge variant={importResult.results.manychat.success ? "default" : "destructive"}>
                      {importResult.results.manychat.success ? "Success" : "Failed"}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Imported: {importResult.results.manychat.imported} subscribers
                  </p>
                  {importResult.results.manychat.error && (
                    <p className="text-sm text-red-600 mt-1">
                      Error: {importResult.results.manychat.error}
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium mb-2">Total Results</h4>
                <p className="text-lg">
                  <strong>{importResult.results.total}</strong> total subscribers imported
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Import Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Before Importing:</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                <li>Ensure your Flodesk API key is configured in environment variables</li>
                <li>Ensure your ManyChat API key is configured in environment variables</li>
                <li>Import operations may take several minutes for large subscriber lists</li>
                <li>Duplicate subscribers will be automatically merged</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">After Importing:</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                <li>Review imported subscribers in the admin dashboard</li>
                <li>Set up email automation campaigns for new subscribers</li>
                <li>Segment subscribers based on their original platform</li>
                <li>Monitor engagement rates and adjust campaigns accordingly</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}