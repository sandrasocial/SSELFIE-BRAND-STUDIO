import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings,
  Key,
  Database,
  Cloud,
  Shield,
  Variable,
  Eye,
  EyeOff,
  Copy,
  Edit,
  Trash2,
  Plus,
  Save,
  RefreshCw,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle,
  Server,
  Cpu,
  HardDrive,
  Gauge,
  Globe,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EnvironmentVariable {
  key: string;
  value: string;
  encrypted: boolean;
  description?: string;
  required: boolean;
}

interface Secret {
  key: string;
  description: string;
  masked: boolean;
  lastUpdated: Date;
  source: 'manual' | 'external' | 'inherited';
}

interface ResourceConfig {
  memory: string;
  cpu: string;
  storage: string;
  bandwidth: string;
  instances: {
    min: number;
    max: number;
    target: number;
  };
  scaling: {
    enabled: boolean;
    metric: 'cpu' | 'memory' | 'requests';
    threshold: number;
  };
}

interface DatabaseConfig {
  type: 'postgresql' | 'mysql' | 'mongodb' | 'redis';
  version: string;
  size: string;
  backups: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    retention: number;
  };
  replicas: number;
}

const SAMPLE_VARIABLES: EnvironmentVariable[] = [
  {
    key: 'NODE_ENV',
    value: 'production',
    encrypted: false,
    description: 'Application environment mode',
    required: true
  },
  {
    key: 'API_BASE_URL',
    value: 'https://api.sselfie.ai',
    encrypted: false,
    description: 'Base URL for API endpoints',
    required: true
  },
  {
    key: 'CDN_URL',
    value: 'https://cdn.sselfie.ai',
    encrypted: false,
    description: 'Content delivery network URL',
    required: false
  },
  {
    key: 'DEBUG',
    value: 'false',
    encrypted: false,
    description: 'Enable debug logging',
    required: false
  }
];

const SAMPLE_SECRETS: Secret[] = [
  {
    key: 'DATABASE_URL',
    description: 'PostgreSQL database connection string',
    masked: true,
    lastUpdated: new Date(Date.now() - 86400000),
    source: 'external'
  },
  {
    key: 'STRIPE_SECRET_KEY',
    description: 'Stripe payment processing secret key',
    masked: true,
    lastUpdated: new Date(Date.now() - 604800000),
    source: 'manual'
  },
  {
    key: 'JWT_SECRET',
    description: 'JSON Web Token signing secret',
    masked: true,
    lastUpdated: new Date(Date.now() - 2592000000),
    source: 'manual'
  },
  {
    key: 'OPENAI_API_KEY',
    description: 'OpenAI API key for AI services',
    masked: true,
    lastUpdated: new Date(Date.now() - 172800000),
    source: 'manual'
  }
];

const SAMPLE_RESOURCES: ResourceConfig = {
  memory: '2GB',
  cpu: '1vCPU',
  storage: '20GB',
  bandwidth: '100GB',
  instances: {
    min: 1,
    max: 10,
    target: 3
  },
  scaling: {
    enabled: true,
    metric: 'cpu',
    threshold: 70
  }
};

const SAMPLE_DATABASE: DatabaseConfig = {
  type: 'postgresql',
  version: '15.0',
  size: '10GB',
  backups: {
    enabled: true,
    frequency: 'daily',
    retention: 30
  },
  replicas: 2
};

interface EnvironmentConfigProps {
  environment: string;
  onSave?: (config: any) => void;
  onTest?: () => void;
  onDeploy?: () => void;
}

export function EnvironmentConfig({
  environment = 'production',
  onSave,
  onTest,
  onDeploy
}: EnvironmentConfigProps) {
  const [variables, setVariables] = useState<EnvironmentVariable[]>(SAMPLE_VARIABLES);
  const [secrets, setSecrets] = useState<Secret[]>(SAMPLE_SECRETS);
  const [resources, setResources] = useState<ResourceConfig>(SAMPLE_RESOURCES);
  const [database, setDatabase] = useState<DatabaseConfig>(SAMPLE_DATABASE);
  const [newVariable, setNewVariable] = useState({ key: '', value: '', description: '' });
  const [newSecret, setNewSecret] = useState({ key: '', value: '', description: '' });
  const [visibleSecrets, setVisibleSecrets] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // Get environment color
  const getEnvironmentColor = (env: string) => {
    switch (env) {
      case 'production': return 'bg-red-100 text-red-800';
      case 'staging': return 'bg-yellow-100 text-yellow-800';
      case 'development': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Toggle secret visibility
  const toggleSecretVisibility = (key: string) => {
    setVisibleSecrets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  // Add environment variable
  const addVariable = () => {
    if (!newVariable.key.trim() || !newVariable.value.trim()) return;

    const variable: EnvironmentVariable = {
      key: newVariable.key,
      value: newVariable.value,
      description: newVariable.description,
      encrypted: false,
      required: false
    };

    setVariables(prev => [...prev, variable]);
    setNewVariable({ key: '', value: '', description: '' });

    toast({
      title: 'Variable Added',
      description: `Added environment variable: ${variable.key}`,
    });
  };

  // Remove variable
  const removeVariable = (key: string) => {
    setVariables(prev => prev.filter(v => v.key !== key));
    toast({
      title: 'Variable Removed',
      description: `Removed environment variable: ${key}`,
    });
  };

  // Add secret
  const addSecret = () => {
    if (!newSecret.key.trim() || !newSecret.value.trim()) return;

    const secret: Secret = {
      key: newSecret.key,
      description: newSecret.description,
      masked: true,
      lastUpdated: new Date(),
      source: 'manual'
    };

    setSecrets(prev => [...prev, secret]);
    setNewSecret({ key: '', value: '', description: '' });

    toast({
      title: 'Secret Added',
      description: `Added secret: ${secret.key}`,
    });
  };

  // Remove secret
  const removeSecret = (key: string) => {
    setSecrets(prev => prev.filter(s => s.key !== key));
    toast({
      title: 'Secret Removed',
      description: `Removed secret: ${key}`,
    });
  };

  // Save configuration
  const saveConfiguration = () => {
    const config = {
      environment,
      variables,
      secrets,
      resources,
      database
    };

    onSave?.(config);
    toast({
      title: 'Configuration Saved',
      description: `Environment configuration updated for ${environment}`,
    });
  };

  // Test configuration
  const testConfiguration = () => {
    onTest?.();
    toast({
      title: 'Testing Configuration',
      description: 'Running configuration validation tests...',
    });
  };

  return (
    <div className="w-full h-full flex flex-col space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CardTitle className="text-lg flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Environment Configuration
              </CardTitle>
              <Badge variant="secondary" className={`text-sm ${getEnvironmentColor(environment)}`}>
                {environment}
              </Badge>
            </div>
            <Badge variant="secondary" className="text-xs bg-black text-white">
              Category 7
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{variables.length}</div>
              <div className="text-xs text-gray-600">Variables</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{secrets.length}</div>
              <div className="text-xs text-gray-600">Secrets</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{resources.instances.target}</div>
              <div className="text-xs text-gray-600">Instances</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{resources.memory}</div>
              <div className="text-xs text-gray-600">Memory</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button onClick={saveConfiguration}>
                <Save className="w-4 h-4 mr-1" />
                Save Config
              </Button>
              <Button variant="outline" onClick={testConfiguration}>
                <CheckCircle className="w-4 h-4 mr-1" />
                Test Config
              </Button>
              <Button variant="outline" onClick={onDeploy}>
                <Zap className="w-4 h-4 mr-1" />
                Deploy
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Copy className="w-4 h-4 mr-1" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-1" />
                Sync
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex-1">
        <Tabs defaultValue="variables" className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="variables">Variables</TabsTrigger>
            <TabsTrigger value="secrets">Secrets</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
          </TabsList>

          <TabsContent value="variables" className="flex-1 mt-4">
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center">
                  <Variable className="w-4 h-4 mr-2" />
                  Environment Variables ({variables.length})
                </CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1 overflow-y-auto space-y-3">
                {/* Add Variable */}
                <div className="p-3 border rounded-lg bg-gray-50">
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <Input
                      placeholder="Variable name"
                      value={newVariable.key}
                      onChange={(e) => setNewVariable(prev => ({ ...prev, key: e.target.value }))}
                      className="text-sm"
                    />
                    <Input
                      placeholder="Value"
                      value={newVariable.value}
                      onChange={(e) => setNewVariable(prev => ({ ...prev, value: e.target.value }))}
                      className="text-sm"
                    />
                    <Button onClick={addVariable} size="sm">
                      <Plus className="w-3 h-3 mr-1" />
                      Add
                    </Button>
                  </div>
                  <Input
                    placeholder="Description (optional)"
                    value={newVariable.description}
                    onChange={(e) => setNewVariable(prev => ({ ...prev, description: e.target.value }))}
                    className="text-sm"
                  />
                </div>

                {/* Variables List */}
                {variables.map((variable) => (
                  <div key={variable.key} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <code className="text-sm font-medium bg-blue-100 px-2 py-1 rounded">
                            {variable.key}
                          </code>
                          {variable.required && (
                            <Badge variant="secondary" className="text-xs bg-red-100 text-red-800">
                              required
                            </Badge>
                          )}
                          {variable.encrypted && (
                            <Shield className="w-4 h-4 text-green-600" />
                          )}
                        </div>
                        
                        <div className="text-sm text-gray-600 mb-1">
                          <code className="bg-gray-100 px-2 py-1 rounded">{variable.value}</code>
                        </div>
                        
                        {variable.description && (
                          <div className="text-xs text-gray-500">{variable.description}</div>
                        )}
                      </div>
                      
                      <div className="flex space-x-1">
                        <Button variant="outline" size="sm" className="p-1">
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button variant="outline" size="sm" className="p-1">
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => removeVariable(variable.key)}
                          className="p-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="secrets" className="flex-1 mt-4">
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center">
                  <Key className="w-4 h-4 mr-2" />
                  Secrets & API Keys ({secrets.length})
                </CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1 overflow-y-auto space-y-3">
                {/* Add Secret */}
                <div className="p-3 border rounded-lg bg-red-50">
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <Input
                      placeholder="Secret name"
                      value={newSecret.key}
                      onChange={(e) => setNewSecret(prev => ({ ...prev, key: e.target.value }))}
                      className="text-sm"
                    />
                    <Input
                      type="password"
                      placeholder="Secret value"
                      value={newSecret.value}
                      onChange={(e) => setNewSecret(prev => ({ ...prev, value: e.target.value }))}
                      className="text-sm"
                    />
                    <Button onClick={addSecret} size="sm">
                      <Plus className="w-3 h-3 mr-1" />
                      Add
                    </Button>
                  </div>
                  <Input
                    placeholder="Description"
                    value={newSecret.description}
                    onChange={(e) => setNewSecret(prev => ({ ...prev, description: e.target.value }))}
                    className="text-sm"
                  />
                </div>

                {/* Secrets List */}
                {secrets.map((secret) => (
                  <div key={secret.key} className="p-3 border rounded-lg bg-red-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <Lock className="w-4 h-4 text-red-600" />
                          <code className="text-sm font-medium bg-red-100 px-2 py-1 rounded">
                            {secret.key}
                          </code>
                          <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-800">
                            {secret.source}
                          </Badge>
                        </div>
                        
                        <div className="text-sm text-gray-600 mb-1 flex items-center space-x-2">
                          <code className="bg-gray-100 px-2 py-1 rounded">
                            {visibleSecrets.has(secret.key) ? '••••••••••••••••' : '••••••••'}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleSecretVisibility(secret.key)}
                            className="p-1"
                          >
                            {visibleSecrets.has(secret.key) ? (
                              <EyeOff className="w-3 h-3" />
                            ) : (
                              <Eye className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                        
                        <div className="text-xs text-gray-500 mb-1">{secret.description}</div>
                        <div className="text-xs text-gray-500">
                          Updated {secret.lastUpdated.toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div className="flex space-x-1">
                        <Button variant="outline" size="sm" className="p-1">
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button variant="outline" size="sm" className="p-1">
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => removeSecret(secret.key)}
                          className="p-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources" className="flex-1 mt-4">
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center">
                  <Server className="w-4 h-4 mr-2" />
                  Resource Configuration
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Resource Allocation */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium mb-1 block flex items-center">
                        <Gauge className="w-4 h-4 mr-1" />
                        Memory
                      </label>
                      <select className="w-full text-sm border rounded px-3 py-2">
                        <option value="1GB">1GB</option>
                        <option value="2GB" selected>2GB</option>
                        <option value="4GB">4GB</option>
                        <option value="8GB">8GB</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-1 block flex items-center">
                        <Cpu className="w-4 h-4 mr-1" />
                        CPU
                      </label>
                      <select className="w-full text-sm border rounded px-3 py-2">
                        <option value="0.5vCPU">0.5 vCPU</option>
                        <option value="1vCPU" selected>1 vCPU</option>
                        <option value="2vCPU">2 vCPU</option>
                        <option value="4vCPU">4 vCPU</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium mb-1 block flex items-center">
                        <HardDrive className="w-4 h-4 mr-1" />
                        Storage
                      </label>
                      <select className="w-full text-sm border rounded px-3 py-2">
                        <option value="10GB">10GB</option>
                        <option value="20GB" selected>20GB</option>
                        <option value="50GB">50GB</option>
                        <option value="100GB">100GB</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-1 block flex items-center">
                        <Globe className="w-4 h-4 mr-1" />
                        Bandwidth
                      </label>
                      <select className="w-full text-sm border rounded px-3 py-2">
                        <option value="50GB">50GB</option>
                        <option value="100GB" selected>100GB</option>
                        <option value="500GB">500GB</option>
                        <option value="1TB">1TB</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Scaling Configuration */}
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium mb-3 flex items-center">
                    <Zap className="w-4 h-4 mr-1" />
                    Auto Scaling
                  </h4>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Min Instances</label>
                      <Input type="number" value={resources.instances.min} className="text-sm" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Target Instances</label>
                      <Input type="number" value={resources.instances.target} className="text-sm" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Max Instances</label>
                      <Input type="number" value={resources.instances.max} className="text-sm" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Scaling Metric</label>
                      <select className="w-full text-sm border rounded px-3 py-2">
                        <option value="cpu" selected>CPU Usage</option>
                        <option value="memory">Memory Usage</option>
                        <option value="requests">Request Count</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Threshold (%)</label>
                      <Input type="number" value={resources.scaling.threshold} className="text-sm" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="database" className="flex-1 mt-4">
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center">
                  <Database className="w-4 h-4 mr-2" />
                  Database Configuration
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Database Type</label>
                    <select className="w-full text-sm border rounded px-3 py-2">
                      <option value="postgresql" selected>PostgreSQL</option>
                      <option value="mysql">MySQL</option>
                      <option value="mongodb">MongoDB</option>
                      <option value="redis">Redis</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Version</label>
                    <select className="w-full text-sm border rounded px-3 py-2">
                      <option value="14.0">14.0</option>
                      <option value="15.0" selected>15.0</option>
                      <option value="16.0">16.0</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Storage Size</label>
                    <select className="w-full text-sm border rounded px-3 py-2">
                      <option value="5GB">5GB</option>
                      <option value="10GB" selected>10GB</option>
                      <option value="25GB">25GB</option>
                      <option value="50GB">50GB</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Replicas</label>
                    <select className="w-full text-sm border rounded px-3 py-2">
                      <option value="1">1 (No replication)</option>
                      <option value="2" selected>2 (Read replica)</option>
                      <option value="3">3 (High availability)</option>
                    </select>
                  </div>
                </div>

                {/* Backup Configuration */}
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium mb-3">Backup Configuration</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Backup Frequency</label>
                      <select className="w-full text-sm border rounded px-3 py-2">
                        <option value="daily" selected>Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Retention (days)</label>
                      <Input type="number" value={database.backups.retention} className="text-sm" />
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        checked={database.backups.enabled}
                        className="rounded"
                      />
                      <span className="text-sm">Enable automatic backups</span>
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}