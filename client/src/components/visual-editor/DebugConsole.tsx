import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bug,
  Terminal,
  Play,
  Square,
  RotateCcw,
  Trash2,
  Search,
  Filter,
  Download,
  Settings,
  AlertTriangle,
  CheckCircle,
  Info,
  XCircle,
  Clock,
  Zap,
  Eye,
  EyeOff,
  Copy,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'error' | 'warn' | 'info' | 'debug' | 'log';
  message: string;
  source: string;
  stack?: string;
  metadata?: Record<string, any>;
  count?: number;
}

interface DebugSession {
  id: string;
  name: string;
  status: 'running' | 'paused' | 'stopped';
  breakpoints: number[];
  currentLine?: number;
  variables: Record<string, any>;
  callStack: string[];
}

const SAMPLE_LOGS: LogEntry[] = [
  {
    id: '1',
    timestamp: new Date(),
    level: 'info',
    message: 'Category 4: Workspace Intelligence initialized successfully',
    source: 'WorkspaceIntelligence.tsx:45',
    metadata: { component: 'WorkspaceIntelligence', category: 4 }
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 1000),
    level: 'debug',
    message: 'File management system loaded with 127 files',
    source: 'FileManagement.tsx:89',
    metadata: { fileCount: 127, type: 'initialization' }
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 2000),
    level: 'warn',
    message: 'Large component detected: OptimizedVisualEditor.tsx (2800+ lines)',
    source: 'ProjectOrganization.tsx:156',
    metadata: { lineCount: 2847, complexity: 'high' }
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 3000),
    level: 'error',
    message: 'Failed to parse code block syntax',
    source: 'CodeIntelligence.tsx:234',
    stack: 'SyntaxError: Unexpected token\n  at parseCode (CodeIntelligence.tsx:234:15)\n  at processMessage (FormattedAgentMessage.tsx:89:22)',
    metadata: { errorCode: 'SYNTAX_ERROR', retryable: true }
  }
];

const SAMPLE_DEBUG_SESSION: DebugSession = {
  id: 'debug-1',
  name: 'Visual Editor Debug',
  status: 'paused',
  breakpoints: [234, 445, 892],
  currentLine: 234,
  variables: {
    currentAgent: { id: 'elena', name: 'Elena' },
    activeTab: 'workspace',
    chatMessages: '[Array(12)]',
    workflowActive: false,
    selectedFiles: '["file1.tsx", "file2.ts"]'
  },
  callStack: [
    'handleFileSelect (FileManagement.tsx:234)',
    'onFileSelect (OptimizedVisualEditor.tsx:2057)',
    'onClick (FileManagement.tsx:189)'
  ]
};

interface DebugConsoleProps {
  onExecuteCommand?: (command: string) => void;
  onSetBreakpoint?: (line: number) => void;
  onClearBreakpoints?: () => void;
}

export function DebugConsole({
  onExecuteCommand,
  onSetBreakpoint,
  onClearBreakpoints
}: DebugConsoleProps) {
  const [logs, setLogs] = useState<LogEntry[]>(SAMPLE_LOGS);
  const [debugSession, setDebugSession] = useState<DebugSession>(SAMPLE_DEBUG_SESSION);
  const [command, setCommand] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [logFilter, setLogFilter] = useState<'all' | 'error' | 'warn' | 'info' | 'debug'>('all');
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
  const [autoScroll, setAutoScroll] = useState(true);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Auto-scroll to bottom
  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  // Filter logs
  const filteredLogs = logs.filter(log => {
    if (logFilter !== 'all' && log.level !== logFilter) return false;
    if (searchQuery && !log.message.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Get log icon and color
  const getLogIcon = (level: string) => {
    switch (level) {
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warn': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'info': return <Info className="w-4 h-4 text-blue-500" />;
      case 'debug': return <Bug className="w-4 h-4 text-gray-500" />;
      default: return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  const getLogColor = (level: string) => {
    switch (level) {
      case 'error': return 'border-l-red-500 bg-red-50';
      case 'warn': return 'border-l-yellow-500 bg-yellow-50';
      case 'info': return 'border-l-blue-500 bg-blue-50';
      case 'debug': return 'border-l-gray-500 bg-gray-50';
      default: return 'border-l-green-500 bg-green-50';
    }
  };

  // Handle command execution
  const executeCommand = () => {
    if (!command.trim()) return;

    // Add command to logs
    const commandLog: LogEntry = {
      id: Date.now().toString(),
      timestamp: new Date(),
      level: 'info',
      message: `> ${command}`,
      source: 'DebugConsole',
      metadata: { type: 'command' }
    };

    setLogs(prev => [...prev, commandLog]);
    onExecuteCommand?.(command);
    setCommand('');

    // Simulate command response
    setTimeout(() => {
      const responseLog: LogEntry = {
        id: (Date.now() + 1).toString(),
        timestamp: new Date(),
        level: 'debug',
        message: `Command executed: ${command}`,
        source: 'DebugConsole',
        metadata: { type: 'response', success: true }
      };
      setLogs(prev => [...prev, responseLog]);
    }, 100);
  };

  // Toggle log expansion
  const toggleLogExpansion = (logId: string) => {
    setExpandedLogs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(logId)) {
        newSet.delete(logId);
      } else {
        newSet.add(logId);
      }
      return newSet;
    });
  };

  // Clear logs
  const clearLogs = () => {
    setLogs([]);
    toast({
      title: 'Logs Cleared',
      description: 'Debug console has been cleared',
    });
  };

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <Bug className="w-5 h-5 mr-2" />
            Debug Console
          </CardTitle>
          <Badge variant="secondary" className="text-xs bg-black text-white">
            Category 5
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col space-y-4">
        <Tabs defaultValue="console" className="flex flex-col h-full">
          <TabsList className="w-full h-8 bg-gray-100 rounded-md p-1">
            <TabsTrigger value="console" className="flex-1 text-xs h-6 rounded-sm">Console</TabsTrigger>
            <TabsTrigger value="debugger" className="flex-1 text-xs h-6 rounded-sm">Debugger</TabsTrigger>
            <TabsTrigger value="network" className="flex-1 text-xs h-6 rounded-sm">Network</TabsTrigger>
            <TabsTrigger value="performance" className="flex-1 text-xs h-6 rounded-sm">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="console" className="flex-1 flex flex-col">
            {/* Console Controls */}
            <div className="flex items-center space-x-2 mb-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-8 text-xs"
                />
              </div>

              <select
                value={logFilter}
                onChange={(e) => setLogFilter(e.target.value as any)}
                className="text-xs border rounded px-2 py-1 h-8"
              >
                <option value="all">All</option>
                <option value="error">Errors</option>
                <option value="warn">Warnings</option>
                <option value="info">Info</option>
                <option value="debug">Debug</option>
              </select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoScroll(!autoScroll)}
                className={`h-8 ${autoScroll ? 'bg-blue-50' : ''}`}
              >
                {autoScroll ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              </Button>

              <Button variant="outline" size="sm" onClick={clearLogs} className="h-8">
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>

            {/* Log Display */}
            <div className="flex-1 overflow-y-auto border rounded-lg bg-gray-900 text-white font-mono text-xs">
              <div className="p-2 space-y-1">
                {filteredLogs.map((log) => {
                  const isExpanded = expandedLogs.has(log.id);
                  
                  return (
                    <div key={log.id} className={`border-l-2 pl-2 py-1 rounded-r ${getLogColor(log.level)} text-gray-900`}>
                      <div 
                        className="flex items-start justify-between cursor-pointer"
                        onClick={() => log.stack && toggleLogExpansion(log.id)}
                      >
                        <div className="flex items-start space-x-2 flex-1">
                          {getLogIcon(log.level)}
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-500">
                                {log.timestamp.toLocaleTimeString()}
                              </span>
                              <span className="text-xs font-semibold uppercase">
                                {log.level}
                              </span>
                              <span className="text-xs text-gray-600">
                                {log.source}
                              </span>
                            </div>
                            <div className="mt-1">{log.message}</div>
                            
                            {log.metadata && (
                              <div className="mt-1 text-xs text-gray-600">
                                {Object.entries(log.metadata).map(([key, value]) => (
                                  <span key={key} className="mr-2">
                                    {key}: {JSON.stringify(value)}
                                  </span>
                                ))}
                              </div>
                            )}

                            {isExpanded && log.stack && (
                              <div className="mt-2 p-2 bg-gray-800 text-white rounded text-xs font-mono">
                                <pre className="whitespace-pre-wrap">{log.stack}</pre>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          {log.stack && (
                            <Button variant="ghost" size="sm" className="p-1">
                              {isExpanded ? 
                                <ChevronDown className="w-3 h-3" /> : 
                                <ChevronRight className="w-3 h-3" />
                              }
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" className="p-1">
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={logsEndRef} />
              </div>
            </div>

            {/* Command Input */}
            <div className="flex items-center space-x-2 mt-2">
              <Terminal className="w-4 h-4 text-gray-500" />
              <Input
                placeholder="Enter debug command..."
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && executeCommand()}
                className="flex-1 h-8 text-xs font-mono"
              />
              <Button variant="outline" size="sm" onClick={executeCommand} className="h-8">
                <Play className="w-3 h-3 mr-1" />
                Run
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="debugger" className="flex-1 flex flex-col">
            {/* Debugger Controls */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Badge variant={debugSession.status === 'running' ? 'default' : 'secondary'}>
                  {debugSession.status}
                </Badge>
                <span className="text-xs text-gray-600">{debugSession.name}</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <Button variant="outline" size="sm" className="h-8">
                  <Play className="w-3 h-3" />
                </Button>
                <Button variant="outline" size="sm" className="h-8">
                  <Square className="w-3 h-3" />
                </Button>
                <Button variant="outline" size="sm" className="h-8">
                  <RotateCcw className="w-3 h-3" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
              {/* Call Stack */}
              <div>
                <h4 className="text-sm font-medium mb-2">Call Stack</h4>
                <div className="space-y-1">
                  {debugSession.callStack.map((frame, index) => (
                    <div 
                      key={index} 
                      className={`p-2 text-xs rounded border ${
                        index === 0 ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
                      }`}
                    >
                      {frame}
                    </div>
                  ))}
                </div>
              </div>

              {/* Variables */}
              <div>
                <h4 className="text-sm font-medium mb-2">Variables</h4>
                <div className="space-y-2">
                  {Object.entries(debugSession.variables).map(([name, value]) => (
                    <div key={name} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                      <span className="font-medium">{name}</span>
                      <span className="text-gray-600 font-mono">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Breakpoints */}
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Breakpoints</h4>
              <div className="flex flex-wrap gap-2">
                {debugSession.breakpoints.map((line, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    Line {line}
                  </Badge>
                ))}
                <Button variant="outline" size="sm" className="h-6 text-xs">
                  Add Breakpoint
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="network" className="flex-1">
            <div className="text-center text-gray-500 text-sm mt-8">
              Network monitoring will show API requests, response times, and error rates
            </div>
          </TabsContent>

          <TabsContent value="performance" className="flex-1">
            <div className="text-center text-gray-500 text-sm mt-8">
              Performance metrics including component render times and memory usage
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}