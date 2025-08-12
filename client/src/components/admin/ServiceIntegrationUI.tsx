import { FormEvent, ReactNode, useState } from 'react';
/**
 * Service Integration UI - Luxury interface for service setup and management
 * SSELFIE Studio Enhancement Project - Aria Implementation
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  AlertCircle, 
  Settings, 
  Zap, 
  Mail, 
  CreditCard,
  MessageSquare,
  RefreshCw,
  ExternalLink,
  Shield
} from 'lucide-react';

interface ServiceStatus {
  id: string;
  name: string;
  icon: ReactNode;
  status: 'connected' | 'disconnected' | 'error' | 'configuring';
  description: string;
  lastChecked: Date;
  config?: Record<string, any>;
}

interface ServiceConfig {
  apiKey?: string;
  webhookUrl?: string;
  accountId?: string;
  secretKey?: string;
}

export default function ServiceIntegrationUI() {
  const { toast } = useToast();
  const [services, setServices] = useState<ServiceStatus[]>([
    {
      id: 'stripe',
      name: 'Stripe',
      icon: <CreditCard className="h-5 w-5" />,
      status: 'connected',
      description: 'Payment processing and subscription management',
      lastChecked: new Date(),
      config: { accountId: 'acct_****' }
    },
    {
      id: 'resend',
      name: 'Resend',
      icon: <Mail className="h-5 w-5" />,
      status: 'connected',
      description: 'Transactional email delivery',
      lastChecked: new Date(),
      config: { domain: 'sselfie.ai' }
    },
    {
      id: 'flodesk',
      name: 'Flodesk',
      icon: <Zap className="h-5 w-5" />,
      status: 'disconnected',
      description: 'Email marketing and automation',
      lastChecked: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      id: 'manychat',
      name: 'ManyChat',
      icon: <MessageSquare className="h-5 w-5" />,
      status: 'error',
      description: 'Instagram automation and lead capture',
      lastChecked: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    }
  ]);

  const [selectedService, setSelectedService] = useState<string>('stripe');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [configs, setConfigs] = useState<Record<string, ServiceConfig>>({});

  const getStatusColor = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'connected': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'error': return 'bg-red-50 text-red-700 border-red-200';
      case 'configuring': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4 text-emerald-600" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'configuring': return <RefreshCw className="h-4 w-4 text-amber-600 animate-spin" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    
    try {
      const response = await fetch('/api/admin/services/health-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const healthData = await response.json();
        
        setServices(prev => prev.map(service => ({
          ...service,
          status: healthData[service.id] ? 'connected' : 'disconnected',
          lastChecked: new Date()
        })));
        
        toast({
          title: "Services refreshed",
          description: "All service connections have been checked",
        });
      }
    } catch (error) {
      toast({
        title: "Refresh failed",
        description: "Could not check service connections",
        
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleServiceConfig = async (serviceId: string, config: ServiceConfig) => {
    try {
      const response = await fetch(`/api/admin/services/${serviceId}/configure`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      
      if (response.ok) {
        setServices(prev => prev.map(service => 
          service.id === serviceId 
            ? { ...service, status: 'connected', lastChecked: new Date(), config }
            : service
        ));
        
        toast({
          title: "Service configured",
          description: `${services.find(s => s.id === serviceId)?.name} has been successfully configured`,
        });
      }
    } catch (error) {
      toast({
        title: "Configuration failed",
        description: "Could not save service configuration",
        
      });
    }
  };

  const selectedServiceData = services.find(s => s.id === selectedService);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Service Integration</h2>
          <p className="text-gray-600 mt-1">Manage external service connections and configurations</p>
        </div>
        <Button 
          onClick={handleRefreshAll}
          disabled={isRefreshing}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh All
        </Button>
      </div>

      {/* Services Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {services.map((service) => (
          <Card 
            key={service.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedService === service.id ? 'ring-2 ring-black' : ''
            }`}
            onClick={() => setSelectedService(service.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {service.icon}
                  <h3 className="font-medium">{service.name}</h3>
                </div>
                {getStatusIcon(service.status)}
              </div>
              
              <Badge 
                variant="outline" 
                className={getStatusColor(service.status)}
              >
                {service.status}
              </Badge>
              
              <p className="text-sm text-gray-600 mt-2">
                {service.description}
              </p>
              
              <p className="text-xs text-gray-500 mt-2">
                Last checked: {service.lastChecked.toLocaleTimeString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Service Details */}
      {selectedServiceData && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selectedServiceData.icon}
                <div>
                  <CardTitle>{selectedServiceData.name} Configuration</CardTitle>
                  <CardDescription>{selectedServiceData.description}</CardDescription>
                </div>
              </div>
              <Badge className={getStatusColor(selectedServiceData.status)}>
                {selectedServiceData.status}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="config" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="config">Configuration</TabsTrigger>
                <TabsTrigger value="status">Status</TabsTrigger>
                <TabsTrigger value="docs">Documentation</TabsTrigger>
              </TabsList>
              
              <TabsContent value="config" className="space-y-4 mt-6">
                <ServiceConfigForm 
                  service={selectedServiceData}
                  onSave={(config) => handleServiceConfig(selectedService, config)}
                />
              </TabsContent>
              
              <TabsContent value="status" className="space-y-4 mt-6">
                <ServiceStatusDetails service={selectedServiceData} />
              </TabsContent>
              
              <TabsContent value="docs" className="space-y-4 mt-6">
                <ServiceDocumentation service={selectedServiceData} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ServiceConfigForm({ 
  service, 
  onSave 
}: { 
  service: ServiceStatus; 
  onSave: (config: ServiceConfig) => void; 
}) {
  const [config, setConfig] = useState<ServiceConfig>({});

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave(config);
  };

  const getConfigFields = () => {
    switch (service.id) {
      case 'stripe':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="secretKey">Secret Key</Label>
              <Input
                id="secretKey"
                type="password"
                placeholder="sk_test_..."
                value={config.secretKey || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, secretKey: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="webhookUrl">Webhook Endpoint</Label>
              <Input
                id="webhookUrl"
                placeholder="https://yourdomain.com/webhooks/stripe"
                value={config.webhookUrl || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, webhookUrl: e.target.value }))}
              />
            </div>
          </>
        );
      case 'resend':
        return (
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="re_..."
              value={config.apiKey || ''}
              onChange={(e) => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
            />
          </div>
        );
      case 'flodesk':
        return (
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="Your Flodesk API key"
              value={config.apiKey || ''}
              onChange={(e) => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
            />
          </div>
        );
      case 'manychat':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Your ManyChat API key"
                value={config.apiKey || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountId">Page ID</Label>
              <Input
                id="accountId"
                placeholder="Your Instagram/Facebook Page ID"
                value={config.accountId || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, accountId: e.target.value }))}
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {getConfigFields()}
      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Save Configuration
        </Button>
        <Button type="button" variant="outline">
          Test Connection
        </Button>
      </div>
    </form>
  );
}

function ServiceStatusDetails({ service }: { service: ServiceStatus }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium text-sm text-gray-700">Connection Status</h4>
          <div className="flex items-center gap-2 mt-1">
            {getStatusIcon(service.status)}
            <span className="capitalize">{service.status}</span>
          </div>
        </div>
        <div>
          <h4 className="font-medium text-sm text-gray-700">Last Checked</h4>
          <p className="text-sm text-gray-600 mt-1">
            {service.lastChecked.toLocaleString()}
          </p>
        </div>
      </div>
      
      {service.config && (
        <div>
          <h4 className="font-medium text-sm text-gray-700 mb-2">Configuration</h4>
          <div className="bg-gray-50 rounded-lg p-3">
            <pre className="text-sm text-gray-600">
              {JSON.stringify(service.config, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

function ServiceDocumentation({ service }: { service: ServiceStatus }) {
  const getDocLinks = () => {
    switch (service.id) {
      case 'stripe':
        return [
          { label: 'API Documentation', url: 'https://stripe.com/docs/api' },
          { label: 'Webhooks Guide', url: 'https://stripe.com/docs/webhooks' }
        ];
      case 'resend':
        return [
          { label: 'API Documentation', url: 'https://resend.com/docs' },
          { label: 'Email Templates', url: 'https://resend.com/docs/send/with-react' }
        ];
      case 'flodesk':
        return [
          { label: 'API Documentation', url: 'https://developers.flodesk.com' }
        ];
      case 'manychat':
        return [
          { label: 'API Documentation', url: 'https://api.manychat.com' },
          { label: 'Instagram Integration', url: 'https://manychat.com/instagram' }
        ];
      default:
        return [];
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-medium text-sm text-gray-700 mb-2">Documentation Links</h4>
        <div className="space-y-2">
          {getDocLinks().map((link, index) => (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
            >
              <ExternalLink className="h-3 w-3" />
              {link.label}
            </a>
          ))}
        </div>
      </div>
      
      <div>
        <h4 className="font-medium text-sm text-gray-700 mb-2">Service Description</h4>
        <p className="text-sm text-gray-600">{service.description}</p>
      </div>
    </div>
  );
}

function getStatusIcon(status: ServiceStatus['status']) {
  switch (status) {
    case 'connected': return <CheckCircle className="h-4 w-4 text-emerald-600" />;
    case 'error': return <AlertCircle className="h-4 w-4 text-red-600" />;
    case 'configuring': return <RefreshCw className="h-4 w-4 text-amber-600 animate-spin" />;
    default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
  }
}