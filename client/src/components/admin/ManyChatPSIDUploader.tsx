import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ManyChatPSIDUploaderProps {
  onPSIDListReady: (psids: string[]) => void;
}

export function ManyChatPSIDUploader({ onPSIDListReady }: ManyChatPSIDUploaderProps) {
  const [psidList, setPsidList] = useState<string[]>([]);
  const [uploadMethod, setUploadMethod] = useState<'file' | 'paste'>('file');
  const [textInput, setTextInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const text = await file.text();
      const psids = parsePSIDText(text);
      setPsidList(psids);
      
      toast({
        title: "File processed successfully",
        description: `Found ${psids.length} subscriber IDs`,
      });
    } catch (error) {
      toast({
        title: "Error processing file",
        description: "Please check your file format and try again",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTextInput = () => {
    setIsProcessing(true);
    try {
      const psids = parsePSIDText(textInput);
      setPsidList(psids);
      
      toast({
        title: "Text processed successfully",
        description: `Found ${psids.length} subscriber IDs`,
      });
    } catch (error) {
      toast({
        title: "Error processing text",
        description: "Please check your PSID format and try again",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const parsePSIDText = (text: string): string[] => {
    // Parse various formats: CSV, line-separated, or space-separated
    const cleaned = text
      .replace(/[^\w\s,\n-]/g, '') // Remove special chars except word chars, spaces, commas, newlines, hyphens
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    let psids: string[] = [];
    
    // Try comma-separated first
    if (cleaned.includes(',')) {
      psids = cleaned.split(',').map(p => p.trim()).filter(p => p.length > 0);
    }
    // Try newline-separated
    else if (cleaned.includes('\n')) {
      psids = cleaned.split('\n').map(p => p.trim()).filter(p => p.length > 0);
    }
    // Try space-separated
    else {
      psids = cleaned.split(' ').map(p => p.trim()).filter(p => p.length > 0);
    }

    // Filter out invalid PSIDs (should be numeric or alphanumeric)
    const validPsids = psids.filter(psid => /^[a-zA-Z0-9-]+$/.test(psid) && psid.length >= 5);
    
    if (validPsids.length === 0) {
      throw new Error('No valid PSIDs found');
    }

    return validPsids;
  };

  const handleProceedWithImport = () => {
    if (psidList.length === 0) return;
    onPSIDListReady(psidList);
  };

  return (
    <div className="space-y-6">
      {/* Step 1: Export Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Step 1: Export PSIDs from ManyChat
          </CardTitle>
          <CardDescription>
            ManyChat requires manual export before import
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Export Instructions:</strong>
              <ol className="mt-2 ml-4 list-decimal space-y-1">
                <li>Log into your ManyChat dashboard</li>
                <li>Navigate to <strong>Audience</strong> page</li>
                <li>Make sure no search filters are active</li>
                <li>Click <strong>Bulk Actions</strong> button</li>
                <li>Select <strong>Export PSIDs</strong> option</li>
                <li>Download the generated file</li>
              </ol>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Step 2: Upload PSIDs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Step 2: Upload Subscriber IDs
          </CardTitle>
          <CardDescription>
            Upload your exported PSID file or paste the IDs directly
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload Method Selection */}
          <div className="flex gap-2">
            <Button
              variant={uploadMethod === 'file' ? 'default' : 'outline'}
              onClick={() => setUploadMethod('file')}
              size="sm"
            >
              Upload File
            </Button>
            <Button
              variant={uploadMethod === 'paste' ? 'default' : 'outline'}
              onClick={() => setUploadMethod('paste')}
              size="sm"
            >
              Paste Text
            </Button>
          </div>

          {uploadMethod === 'file' ? (
            <div>
              <Input
                type="file"
                accept=".txt,.csv,.json"
                onChange={handleFileUpload}
                ref={fileInputRef}
                disabled={isProcessing}
              />
              <p className="text-sm text-muted-foreground mt-2">
                Supports .txt, .csv, or .json files with PSIDs
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <Textarea
                placeholder="Paste your PSIDs here (comma-separated, line-separated, or space-separated)&#10;&#10;Example:&#10;1234567890&#10;0987654321&#10;&#10;Or: 1234567890, 0987654321, 1122334455"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                rows={8}
                disabled={isProcessing}
              />
              <Button 
                onClick={handleTextInput} 
                disabled={!textInput.trim() || isProcessing}
                size="sm"
              >
                Process PSIDs
              </Button>
            </div>
          )}

          {/* Results Display */}
          {psidList.length > 0 && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Ready for Import:</strong> Found {psidList.length} valid subscriber IDs
                <div className="mt-2">
                  <p className="text-sm">Sample PSIDs: {psidList.slice(0, 3).join(', ')}
                    {psidList.length > 3 && ` ... and ${psidList.length - 3} more`}
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Step 3: Proceed with Import */}
      {psidList.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 3: Import Subscribers</CardTitle>
            <CardDescription>
              Start the import process with {psidList.length} subscriber IDs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleProceedWithImport} className="w-full">
              Import {psidList.length} ManyChat Subscribers
            </Button>
            <p className="text-sm text-muted-foreground mt-2 text-center">
              This will make individual API calls for each subscriber (rate limited to 2 per second)
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}