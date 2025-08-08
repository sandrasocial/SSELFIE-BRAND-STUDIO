import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Code, 
  Edit3, 
  Eye, 
  Settings, 
  Zap,
  FileText,
  Palette
} from 'lucide-react';
import { CodeIntelligence } from './CodeIntelligence';
import { EnhancedSyntaxHighlighter } from './SyntaxHighlighter';
import { CodeFormatter } from './CodeFormatter';

interface CodeEditorProps {
  initialCode?: string;
  initialLanguage?: string;
  onCodeChange?: (code: string) => void;
  onLanguageChange?: (language: string) => void;
  readOnly?: boolean;
  showFormatting?: boolean;
  showPreview?: boolean;
}

export function CodeEditor({
  initialCode = '',
  initialLanguage = 'typescript',
  onCodeChange,
  onLanguageChange,
  readOnly = false,
  showFormatting = true,
  showPreview = true
}: CodeEditorProps) {
  const [code, setCode] = useState(initialCode);
  const [language, setLanguage] = useState(initialLanguage);
  const [activeTab, setActiveTab] = useState('edit');

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    onCodeChange?.(newCode);
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    onLanguageChange?.(newLanguage);
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <Code className="w-5 h-5 mr-2" />
            Code Editor
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-xs">
              {language}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {code.split('\n').length} lines
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="edit" className="flex items-center space-x-1">
              <Edit3 className="w-3 h-3" />
              <span>Edit</span>
            </TabsTrigger>
            {showPreview && (
              <TabsTrigger value="preview" className="flex items-center space-x-1">
                <Eye className="w-3 h-3" />
                <span>Preview</span>
              </TabsTrigger>
            )}
            {showFormatting && (
              <TabsTrigger value="format" className="flex items-center space-x-1">
                <Palette className="w-3 h-3" />
                <span>Format</span>
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="edit" className="mt-4">
            <CodeIntelligence
              content={code}
              language={language}
              onChange={handleCodeChange}
              onLanguageChange={handleLanguageChange}
              showLineNumbers={true}
              enableAutoComplete={true}
              enableErrorDetection={true}
              readOnly={readOnly}
            />
          </TabsContent>

          {showPreview && (
            <TabsContent value="preview" className="mt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Code Preview</h3>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="text-xs">
                      Syntax Highlighted
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Settings className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                
                <EnhancedSyntaxHighlighter
                  code={code}
                  language={language}
                  fileName={`code.${language === 'typescript' ? 'ts' : language === 'javascript' ? 'js' : language}`}
                  showLineNumbers={true}
                  collapsible={true}
                  collapsed={false}
                  showCopyButton={true}
                  showDownloadButton={true}
                />
              </div>
            </TabsContent>
          )}

          {showFormatting && (
            <TabsContent value="format" className="mt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Code Formatting</h3>
                  <Badge variant="secondary" className="text-xs">
                    {language} Rules
                  </Badge>
                </div>
                
                <CodeFormatter
                  code={code}
                  language={language}
                  onChange={handleCodeChange}
                  formatOnType={false}
                />

                {/* Format Preview */}
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-gray-600">Preview</h4>
                  <div className="max-h-48 overflow-y-auto border rounded">
                    <EnhancedSyntaxHighlighter
                      code={code}
                      language={language}
                      showLineNumbers={true}
                      collapsible={false}
                      showCopyButton={false}
                      showDownloadButton={false}
                      maxHeight="200px"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}