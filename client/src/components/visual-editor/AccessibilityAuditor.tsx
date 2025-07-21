import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Accessibility,
  Eye,
  EyeOff,
  Contrast,
  Type,
  Mouse,
  Keyboard,
  Volume2,
  Heart,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Settings,
  Download,
  FileText,
  BarChart3,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AccessibilityIssue {
  id: string;
  type: 'error' | 'warning' | 'notice';
  severity: 'critical' | 'serious' | 'moderate' | 'minor';
  principle: 'perceivable' | 'operable' | 'understandable' | 'robust';
  description: string;
  element: string;
  selector: string;
  guidelines: string[];
  suggestions: string[];
  impact: string;
  helpUrl: string;
}

interface AccessibilityScore {
  overall: number;
  perceivable: number;
  operable: number;
  understandable: number;
  robust: number;
  violations: number;
  passes: number;
  incomplete: number;
}

interface AccessibilityAuditorProps {
  onRunAudit: (url?: string) => void;
  onFixIssue: (issueId: string) => void;
  onExportReport: (format: 'html' | 'json' | 'csv') => void;
  onConfigureSettings: () => void;
}

export const AccessibilityAuditor: React.FC<AccessibilityAuditorProps> = ({
  onRunAudit,
  onFixIssue,
  onExportReport,
  onConfigureSettings
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isAuditing, setIsAuditing] = useState(false);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedPrinciple, setSelectedPrinciple] = useState<string>('all');
  const { toast } = useToast();

  // Mock data for demonstration
  const [score] = useState<AccessibilityScore>({
    overall: 78,
    perceivable: 85,
    operable: 72,
    understandable: 80,
    robust: 75,
    violations: 12,
    passes: 156,
    incomplete: 3
  });

  const [issues] = useState<AccessibilityIssue[]>([
    {
      id: 'issue-1',
      type: 'error',
      severity: 'critical',
      principle: 'perceivable',
      description: 'Images must have alternate text',
      element: '<img src="hero.jpg">',
      selector: '.hero-section img',
      guidelines: ['WCAG 2.1 AA', '1.1.1 Non-text Content'],
      suggestions: ['Add descriptive alt text to the image', 'Use empty alt="" for decorative images'],
      impact: 'Screen readers cannot describe the image content to users',
      helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/image-alt'
    },
    {
      id: 'issue-2',
      type: 'warning',
      severity: 'serious',
      principle: 'operable',
      description: 'Elements must have sufficient color contrast',
      element: '<button class="btn-primary">Submit</button>',
      selector: '.btn-primary',
      guidelines: ['WCAG 2.1 AA', '1.4.3 Contrast (Minimum)'],
      suggestions: ['Increase contrast ratio to at least 4.5:1', 'Use darker text or lighter background'],
      impact: 'Users with low vision may not be able to read the text',
      helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/color-contrast'
    },
    {
      id: 'issue-3',
      type: 'warning',
      severity: 'moderate',
      principle: 'operable',
      description: 'Links must have discernible text',
      element: '<a href="/learn-more">Click here</a>',
      selector: '.cta-section a',
      guidelines: ['WCAG 2.1 AA', '2.4.4 Link Purpose (In Context)'],
      suggestions: ['Use descriptive link text', 'Replace "click here" with meaningful text'],
      impact: 'Screen reader users cannot understand the link purpose',
      helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/link-name'
    },
    {
      id: 'issue-4',
      type: 'notice',
      severity: 'minor',
      principle: 'understandable',
      description: 'Form elements should have labels',
      element: '<input type="email" placeholder="Email">',
      selector: '.newsletter-form input',
      guidelines: ['WCAG 2.1 AA', '3.3.2 Labels or Instructions'],
      suggestions: ['Add a label element', 'Use aria-label attribute'],
      impact: 'Users may not understand what to enter in the field',
      helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/label'
    }
  ]);

  const handleRunAudit = () => {
    setIsAuditing(true);
    onRunAudit();
    
    // Simulate audit completion
    setTimeout(() => {
      setIsAuditing(false);
      toast({
        title: 'Accessibility Audit Complete',
        description: `Found ${issues.length} issues to review`,
      });
    }, 2000);
  };

  const getIssueIcon = (type: string, severity: string) => {
    if (type === 'error' || severity === 'critical') {
      return <XCircle className="w-4 h-4 text-red-500" />;
    } else if (type === 'warning' || severity === 'serious') {
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    } else {
      return <CheckCircle className="w-4 h-4 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'serious': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'minor': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPrincipleIcon = (principle: string) => {
    switch (principle) {
      case 'perceivable': return <Eye className="w-4 h-4" />;
      case 'operable': return <Mouse className="w-4 h-4" />;
      case 'understandable': return <Type className="w-4 h-4" />;
      case 'robust': return <Zap className="w-4 h-4" />;
      default: return <Accessibility className="w-4 h-4" />;
    }
  };

  const filteredIssues = issues.filter(issue => {
    const matchesSeverity = selectedSeverity === 'all' || issue.severity === selectedSeverity;
    const matchesPrinciple = selectedPrinciple === 'all' || issue.principle === selectedPrinciple;
    return matchesSeverity && matchesPrinciple;
  });

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Accessibility Score Overview */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <Accessibility className="w-5 h-5 mr-2" />
              Accessibility Audit
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                onClick={handleRunAudit}
                disabled={isAuditing}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isAuditing ? (
                  <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <Accessibility className="w-4 h-4 mr-1" />
                )}
                Run Audit
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={onConfigureSettings}
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{score.overall}%</div>
              <div className="text-xs text-gray-600">Overall Score</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{score.violations}</div>
              <div className="text-xs text-gray-600">Violations</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{score.passes}</div>
              <div className="text-xs text-gray-600">Passes</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">{score.incomplete}</div>
              <div className="text-xs text-gray-600">Needs Review</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">AA</div>
              <div className="text-xs text-gray-600">WCAG Level</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accessibility Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="w-full bg-gray-100 rounded-md p-1">
          <TabsTrigger value="overview" className="flex-1 text-xs">Overview</TabsTrigger>
          <TabsTrigger value="issues" className="flex-1 text-xs">Issues</TabsTrigger>
          <TabsTrigger value="principles" className="flex-1 text-xs">WCAG Principles</TabsTrigger>
          <TabsTrigger value="reports" className="flex-1 text-xs">Reports</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="flex-1 mt-4">
          <div className="space-y-4">
            {/* WCAG Principles Scores */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">WCAG 2.1 Principles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="flex items-center">
                        <Eye className="w-4 h-4 mr-2" />
                        Perceivable
                      </span>
                      <span>{score.perceivable}%</span>
                    </div>
                    <Progress value={score.perceivable} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="flex items-center">
                        <Mouse className="w-4 h-4 mr-2" />
                        Operable
                      </span>
                      <span>{score.operable}%</span>
                    </div>
                    <Progress value={score.operable} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="flex items-center">
                        <Type className="w-4 h-4 mr-2" />
                        Understandable
                      </span>
                      <span>{score.understandable}%</span>
                    </div>
                    <Progress value={score.understandable} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="flex items-center">
                        <Zap className="w-4 h-4 mr-2" />
                        Robust
                      </span>
                      <span>{score.robust}%</span>
                    </div>
                    <Progress value={score.robust} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
                    <Contrast className="w-6 h-6 mb-2" />
                    <span className="text-sm">Check Contrast</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
                    <Keyboard className="w-6 h-6 mb-2" />
                    <span className="text-sm">Keyboard Test</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
                    <Volume2 className="w-6 h-6 mb-2" />
                    <span className="text-sm">Screen Reader</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
                    <Heart className="w-6 h-6 mb-2" />
                    <span className="text-sm">Focus Test</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Issues Tab */}
        <TabsContent value="issues" className="flex-1 mt-4">
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex items-center space-x-3">
              <select
                className="border rounded px-3 py-2 text-sm"
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="serious">Serious</option>
                <option value="moderate">Moderate</option>
                <option value="minor">Minor</option>
              </select>
              <select
                className="border rounded px-3 py-2 text-sm"
                value={selectedPrinciple}
                onChange={(e) => setSelectedPrinciple(e.target.value)}
              >
                <option value="all">All Principles</option>
                <option value="perceivable">Perceivable</option>
                <option value="operable">Operable</option>
                <option value="understandable">Understandable</option>
                <option value="robust">Robust</option>
              </select>
              <Badge variant="secondary" className="ml-auto">
                {filteredIssues.length} issues
              </Badge>
            </div>

            {/* Issues List */}
            <div className="space-y-3">
              {filteredIssues.map((issue) => (
                <Card key={issue.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start space-x-3 flex-1">
                        {getIssueIcon(issue.type, issue.severity)}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-sm">{issue.description}</span>
                            <Badge className={`text-xs border ${getSeverityColor(issue.severity)}`}>
                              {issue.severity}
                            </Badge>
                            <div className="flex items-center space-x-1">
                              {getPrincipleIcon(issue.principle)}
                              <span className="text-xs text-gray-600 capitalize">{issue.principle}</span>
                            </div>
                          </div>
                          <div className="text-xs text-gray-600 mb-2">{issue.impact}</div>
                          <div className="text-xs font-mono bg-gray-100 p-2 rounded mb-2">{issue.element}</div>
                          <div className="text-xs text-gray-500">Selector: {issue.selector}</div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => onFixIssue(issue.id)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Fix
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <div className="text-xs font-medium text-gray-700 mb-1">Guidelines:</div>
                        <div className="flex flex-wrap gap-1">
                          {issue.guidelines.map((guideline, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {guideline}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-xs font-medium text-gray-700 mb-1">Suggestions:</div>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {issue.suggestions.map((suggestion, index) => (
                            <li key={index} className="pl-2">• {suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* WCAG Principles Tab */}
        <TabsContent value="principles" className="flex-1 mt-4">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Eye className="w-5 h-5 mr-2" />
                  1. Perceivable
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">
                  Information and user interface components must be presentable to users in ways they can perceive.
                </p>
                <div className="flex justify-between items-center">
                  <Progress value={score.perceivable} className="flex-1 mr-4" />
                  <span className="text-sm font-medium">{score.perceivable}%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Mouse className="w-5 h-5 mr-2" />
                  2. Operable
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">
                  User interface components and navigation must be operable by all users.
                </p>
                <div className="flex justify-between items-center">
                  <Progress value={score.operable} className="flex-1 mr-4" />
                  <span className="text-sm font-medium">{score.operable}%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Type className="w-5 h-5 mr-2" />
                  3. Understandable
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">
                  Information and the operation of user interface must be understandable.
                </p>
                <div className="flex justify-between items-center">
                  <Progress value={score.understandable} className="flex-1 mr-4" />
                  <span className="text-sm font-medium">{score.understandable}%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Zap className="w-5 h-5 mr-2" />
                  4. Robust
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">
                  Content must be robust enough to be interpreted reliably by assistive technologies.
                </p>
                <div className="flex justify-between items-center">
                  <Progress value={score.robust} className="flex-1 mr-4" />
                  <span className="text-sm font-medium">{score.robust}%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="flex-1 mt-4">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Accessibility Reports</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => onExportReport('html')}
                    className="flex flex-col items-center p-4 h-auto"
                  >
                    <FileText className="w-6 h-6 mb-2" />
                    <span className="text-sm">HTML Report</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => onExportReport('json')}
                    className="flex flex-col items-center p-4 h-auto"
                  >
                    <BarChart3 className="w-6 h-6 mb-2" />
                    <span className="text-sm">JSON Export</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => onExportReport('csv')}
                    className="flex flex-col items-center p-4 h-auto"
                  >
                    <Download className="w-6 h-6 mb-2" />
                    <span className="text-sm">CSV Data</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};