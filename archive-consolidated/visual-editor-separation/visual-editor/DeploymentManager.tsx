import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Rocket,
  Globe,
  Server,
  Settings,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  ExternalLink,
  Copy,
  RefreshCw,
  Play,
  Square,
  Pause,
  BarChart3,
  Users,
  Zap,
  Shield,
  Database,
  Cloud,
  Terminal,
  FileText,
  Download,
  Upload,
  GitBranch,
  Tag
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Deployment {
  id: string;
  name: string;
  environment: 'development' | 'staging' | 'production';
  status: 'active' | 'deploying' | 'failed' | 'stopped';
  url: string;
  branch: string;
  commit: string;
  version: string;
  deployedAt: Date;
  buildTime: number;
  health: 'healthy' | 'degraded' | 'unhealthy';
  traffic: number;
  memory: number;
  cpu: number;
}

interface Environment {
  name: string;
  variables: { [key: string]: string };
  secrets: string[];
  configuration: {
    region: string;
    scaling: 'auto' | 'manual';
    instances: number;
    resources: {
      memory: string;
      cpu: string;
      storage: string;
    };
  };
}

interface BuildLog {
  id: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'error';
  message: string;
  service?: string;
}

const SAMPLE_DEPLOYMENTS: Deployment[] = [
  {
    id: '1',
    name: 'SSELFIE Studio Production',
    environment: 'production',
    status: 'active',
    url: 'https://sselfie.ai',
    branch: 'main',
    commit: 'a1b2c3d',
    version: '2.1.0',
    deployedAt: new Date(Date.now() - 3600000),
    buildTime: 142,
    health: 'healthy',
    traffic: 87,
    memory: 64,
    cpu: 23
  },
  {
    id: '2',
    name: 'SSELFIE Studio Staging',
    environment: 'staging',
    status: 'active',
    url: 'https://staging.sselfie.ai',
    branch: 'feature/category-7-deployment',
    commit: 'e4f5g6h',
    version: '2.2.0-beta',
    deployedAt: new Date(Date.now() - 1800000),
    buildTime: 156,
    health: 'healthy',
    traffic: 12,
    memory: 48,
    cpu: 15
  },
  {
    id: '3',
    name: 'SSELFIE Studio Development',
    environment: 'development',
    status: 'deploying',
    url: 'https://dev.sselfie.ai',
    branch: 'feature/category-7-deployment',
    commit: 'i7j8k9l',
    version: '2.2.0-dev',
    deployedAt: new Date(),
    buildTime: 0,
    health: 'healthy',
    traffic: 3,
    memory: 32,
    cpu: 8
  }
];

const SAMPLE_ENVIRONMENTS: Environment[] = [
  {
    name: 'production',
    variables: {
      NODE_ENV: 'production',
      DATABASE_URL: '***hidden***',
      API_BASE_URL: 'https://api.sselfie.ai',
      CDN_URL: 'https://cdn.sselfie.ai'
    },
    secrets: ['DATABASE_URL', 'STRIPE_SECRET_KEY', 'JWT_SECRET', 'OPENAI_API_KEY'],
    configuration: {
      region: 'us-east-1',
      scaling: 'auto',
      instances: 3,
      resources: {
        memory: '2GB',
        cpu: '1vCPU',
        storage: '20GB'
      }
    }
  },
  {
    name: 'staging',
    variables: {
      NODE_ENV: 'staging',
      DATABASE_URL: '***hidden***',
      API_BASE_URL: 'https://staging-api.sselfie.ai',
      DEBUG: 'true'
    },
    secrets: ['DATABASE_URL', 'STRIPE_TEST_KEY', 'JWT_SECRET'],
    configuration: {
      region: 'us-east-1',
      scaling: 'manual',
      instances: 1,
      resources: {
        memory: '1GB',
        cpu: '0.5vCPU',
        storage: '10GB'
      }
    }
  }
];

const SAMPLE_BUILD_LOGS: BuildLog[] = [
  {
    id: '1',
    timestamp: new Date(),
    level: 'info',
    message: 'Starting deployment to development environment',
    service: 'deployment'
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 30000),
    level: 'info',
    message: 'Building React application with Vite...',
    service: 'build'
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 60000),
    level: 'info',
    message: 'Installing dependencies...',
    service: 'build'
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 90000),
    level: 'info',
    message: 'Fetching source code from Git repository',
    service: 'git'
  }
];

interface DeploymentManagerProps {
  onDeploy?: (environment: string, branch: string) => void;
  onStop?: (deploymentId: string) => void;
  onRestart?: (deploymentId: string) => void;
  onPromote?: (fromEnv: string, toEnv: string) => void;
}

export function DeploymentManager({
  onDeploy,
  onStop,
  onRestart,
  onPromote
}: DeploymentManagerProps) {
  const [deployments, setDeployments] = useState<Deployment[]>(SAMPLE_DEPLOYMENTS);
  const [environments, setEnvironments] = useState<Environment[]>(SAMPLE_ENVIRONMENTS);
  const [buildLogs, setBuildLogs] = useState<BuildLog[]>(SAMPLE_BUILD_LOGS);
  const [selectedEnvironment, setSelectedEnvironment] = useState('production');
  const [deployBranch, setDeployBranch] = useState('main');
  const [isDeploying, setIsDeploying] = useState(false);
  const { toast } = useToast();

  // Get status color and icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'deploying': return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'stopped': return <Square className="w-4 h-4 text-gray-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'deploying': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'stopped': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEnvironmentColor = (env: string) => {
    switch (env) {
      case 'production': return 'bg-red-100 text-red-800';
      case 'staging': return 'bg-yellow-100 text-yellow-800';
      case 'development': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'degraded': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'unhealthy': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <CheckCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  // Deploy application
  const deployApplication = () => {
    if (isDeploying) return;

    setIsDeploying(true);
    onDeploy?.(selectedEnvironment, deployBranch);

    // Simulate deployment
    const newDeployment: Deployment = {
      id: Date.now().toString(),
      name: `SSELFIE Studio ${selectedEnvironment.charAt(0).toUpperCase() + selectedEnvironment.slice(1)}`,
      environment: selectedEnvironment as any,
      status: 'deploying',
      url: `https://${selectedEnvironment === 'production' ? '' : selectedEnvironment + '.'}sselfie.ai`,
      branch: deployBranch,
      commit: Math.random().toString(36).substring(2, 9),
      version: '2.2.0',
      deployedAt: new Date(),
      buildTime: 0,
      health: 'healthy',
      traffic: 0,
      memory: 0,
      cpu: 0
    };

    setDeployments(prev => prev.map(d => 
      d.environment === selectedEnvironment ? newDeployment : d
    ));

    // Simulate build completion
    setTimeout(() => {
      setDeployments(prev => prev.map(d => 
        d.id === newDeployment.id ? { ...d, status: 'active', buildTime: 156 } : d
      ));
      setIsDeploying(false);
      toast({
        title: 'Deployment Complete',
        description: `Successfully deployed to ${selectedEnvironment}`,
      });
    }, 5000);

    toast({
      title: 'Deployment Started',
      description: `Deploying ${deployBranch} to ${selectedEnvironment}`,
    });
  };

  // Stop deployment
  const stopDeployment = (deploymentId: string) => {
    setDeployments(prev => prev.map(d => 
      d.id === deploymentId ? { ...d, status: 'stopped' } : d
    ));
    onStop?.(deploymentId);
    toast({
      title: 'Deployment Stopped',
      description: 'Application has been stopped',
    });
  };

  // Restart deployment
  const restartDeployment = (deploymentId: string) => {
    setDeployments(prev => prev.map(d => 
      d.id === deploymentId ? { ...d, status: 'deploying' } : d
    ));
    
    setTimeout(() => {
      setDeployments(prev => prev.map(d => 
        d.id === deploymentId ? { ...d, status: 'active' } : d
      ));
    }, 3000);

    onRestart?.(deploymentId);
    toast({
      title: 'Deployment Restarted',
      description: 'Application is restarting',
    });
  };

  // Promote deployment
  const promoteDeployment = (fromEnv: string, toEnv: string) => {
    const sourceDeployment = deployments.find(d => d.environment === fromEnv);
    if (sourceDeployment) {
      const promotedDeployment: Deployment = {
        ...sourceDeployment,
        id: Date.now().toString(),
        name: `SSELFIE Studio ${toEnv.charAt(0).toUpperCase() + toEnv.slice(1)}`,
        environment: toEnv as any,
        url: `https://${toEnv === 'production' ? '' : toEnv + '.'}sselfie.ai`,
        deployedAt: new Date(),
        status: 'deploying'
      };

      setDeployments(prev => prev.map(d => 
        d.environment === toEnv ? promotedDeployment : d
      ));

      setTimeout(() => {
        setDeployments(prev => prev.map(d => 
          d.id === promotedDeployment.id ? { ...d, status: 'active' } : d
        ));
      }, 3000);

      onPromote?.(fromEnv, toEnv);
      toast({
        title: 'Deployment Promoted',
        description: `Promoted ${fromEnv} to ${toEnv}`,
      });
    }
  };

  return (
    <div className="w-full h-full flex flex-col space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <Rocket className="w-5 h-5 mr-2" />
              Deployment Manager
            </CardTitle>
            <Badge variant="secondary" className="text-xs bg-black text-white">
              Category 7
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {deployments.filter(d => d.status === 'active').length}
              </div>
              <div className="text-xs text-gray-600">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {deployments.filter(d => d.status === 'deploying').length}
              </div>
              <div className="text-xs text-gray-600">Deploying</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {deployments.reduce((sum, d) => sum + d.traffic, 0)}
              </div>
              <div className="text-xs text-gray-600">Total Traffic</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">99.9%</div>
              <div className="text-xs text-gray-600">Uptime</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Deploy */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <select
                value={selectedEnvironment}
                onChange={(e) => setSelectedEnvironment(e.target.value)}
                className="text-sm border rounded px-3 py-1"
              >
                <option value="development">Development</option>
                <option value="staging">Staging</option>
                <option value="production">Production</option>
              </select>
              
              <Input
                placeholder="Branch name"
                value={deployBranch}
                onChange={(e) => setDeployBranch(e.target.value)}
                className="w-32 text-sm"
              />
              
              <Button 
                onClick={deployApplication}
                disabled={isDeploying || !deployBranch.trim()}
              >
                <Rocket className="w-4 h-4 mr-1" />
                {isDeploying ? 'Deploying...' : 'Deploy'}
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-1" />
                Configure
              </Button>
              <Button variant="outline" size="sm">
                <BarChart3 className="w-4 h-4 mr-1" />
                Analytics
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Deployments */}
        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center">
                <Globe className="w-4 h-4 mr-2" />
                Active Deployments ({deployments.length})
              </CardTitle>
              <Button variant="outline" size="sm">
                <RefreshCw className="w-3 h-3" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto space-y-3">
            {deployments.map((deployment) => (
              <div key={deployment.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getStatusIcon(deployment.status)}
                      <span className="font-medium text-sm">{deployment.name}</span>
                      <Badge variant="secondary" className={`text-xs ${getEnvironmentColor(deployment.environment)}`}>
                        {deployment.environment}
                      </Badge>
                      <Badge variant="secondary" className={`text-xs ${getStatusColor(deployment.status)}`}>
                        {deployment.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-600 mb-2">
                      <div className="flex items-center space-x-1">
                        <Globe className="w-3 h-3" />
                        <a href={deployment.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {deployment.url}
                        </a>
                      </div>
                      <div className="flex items-center space-x-1">
                        <GitBranch className="w-3 h-3" />
                        <span>{deployment.branch}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Tag className="w-3 h-3" />
                        <span>{deployment.version}</span>
                      </div>
                    </div>

                    {deployment.status === 'active' && (
                      <div className="grid grid-cols-4 gap-4 text-xs">
                        <div>
                          <div className="flex items-center space-x-1 mb-1">
                            {getHealthIcon(deployment.health)}
                            <span className="font-medium">Health</span>
                          </div>
                          <div className="text-gray-600">{deployment.health}</div>
                        </div>
                        <div>
                          <div className="flex items-center space-x-1 mb-1">
                            <Users className="w-3 h-3" />
                            <span className="font-medium">Traffic</span>
                          </div>
                          <div className="text-gray-600">{deployment.traffic}%</div>
                        </div>
                        <div>
                          <div className="flex items-center space-x-1 mb-1">
                            <Server className="w-3 h-3" />
                            <span className="font-medium">Memory</span>
                          </div>
                          <div className="text-gray-600">{deployment.memory}%</div>
                        </div>
                        <div>
                          <div className="flex items-center space-x-1 mb-1">
                            <Zap className="w-3 h-3" />
                            <span className="font-medium">CPU</span>
                          </div>
                          <div className="text-gray-600">{deployment.cpu}%</div>
                        </div>
                      </div>
                    )}

                    {deployment.status === 'deploying' && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span>Deployment progress</span>
                          <span>68%</span>
                        </div>
                        <Progress value={68} className="h-2" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col space-y-1">
                    {deployment.status === 'active' && (
                      <>
                        <Button variant="outline" size="sm" className="text-xs">
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => restartDeployment(deployment.id)}
                          className="text-xs"
                        >
                          <RefreshCw className="w-3 h-3" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => stopDeployment(deployment.id)}
                          className="text-xs"
                        >
                          <Square className="w-3 h-3" />
                        </Button>
                      </>
                    )}
                    {deployment.status === 'stopped' && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => restartDeployment(deployment.id)}
                        className="text-xs"
                      >
                        <Play className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="text-xs text-gray-500">
                  Deployed {deployment.deployedAt.toLocaleString()} • Build time: {deployment.buildTime}s
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Environment & Logs */}
        <Card className="flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center">
              <Terminal className="w-4 h-4 mr-2" />
              Environment & Logs
            </CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto">
            <Tabs defaultValue="logs" className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-2 h-8">
                <TabsTrigger value="logs" className="text-xs">Build Logs</TabsTrigger>
                <TabsTrigger value="env" className="text-xs">Environment</TabsTrigger>
              </TabsList>

              <TabsContent value="logs" className="flex-1 mt-2">
                <div className="space-y-2">
                  {buildLogs.map((log) => (
                    <div key={log.id} className="p-2 border rounded text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className={`text-xs ${
                            log.level === 'error' ? 'bg-red-100 text-red-800' :
                            log.level === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {log.level}
                          </Badge>
                          {log.service && (
                            <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-800">
                              {log.service}
                            </Badge>
                          )}
                        </div>
                        <span className="text-gray-500">{log.timestamp.toLocaleTimeString()}</span>
                      </div>
                      <div>{log.message}</div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="env" className="flex-1 mt-2">
                <div className="space-y-3">
                  {environments.map((env) => (
                    <div key={env.name} className="border rounded p-3">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary" className={`text-xs ${getEnvironmentColor(env.name)}`}>
                          {env.name}
                        </Badge>
                        <Button variant="outline" size="sm" className="text-xs">
                          <Settings className="w-3 h-3" />
                        </Button>
                      </div>
                      
                      <div className="text-xs space-y-2">
                        <div>
                          <div className="font-medium mb-1">Variables ({Object.keys(env.variables).length})</div>
                          {Object.entries(env.variables).slice(0, 2).map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between">
                              <span className="text-gray-600">{key}</span>
                              <span className="font-mono text-xs">{value}</span>
                            </div>
                          ))}
                        </div>
                        
                        <div>
                          <div className="font-medium mb-1">Resources</div>
                          <div className="text-gray-600">
                            {env.configuration.resources.memory} • {env.configuration.resources.cpu}
                          </div>
                        </div>

                        <div>
                          <div className="font-medium mb-1">Secrets ({env.secrets.length})</div>
                          <div className="flex flex-wrap gap-1">
                            {env.secrets.slice(0, 2).map((secret) => (
                              <Badge key={secret} variant="secondary" className="text-xs bg-red-100 text-red-800">
                                {secret}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}