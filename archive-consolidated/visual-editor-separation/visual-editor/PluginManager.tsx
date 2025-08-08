import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Download, 
  Upload, 
  Trash2, 
  Star,
  Code,
  Zap,
  Eye,
  Edit3
} from 'lucide-react';

interface Plugin {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  category: 'theme' | 'extension' | 'integration' | 'tool';
  enabled: boolean;
  installed: boolean;
  rating: number;
  downloads: number;
}

interface PluginManagerProps {
  onInstallPlugin: (pluginId: string) => void;
  onUninstallPlugin: (pluginId: string) => void;
  onTogglePlugin: (pluginId: string, enabled: boolean) => void;
  onConfigurePlugin: (pluginId: string) => void;
  onCreatePlugin: () => void;
  onImportPlugin: (file: File) => void;
}

const mockPlugins: Plugin[] = [
  {
    id: 'dark-theme-pro',
    name: 'Dark Theme Pro',
    description: 'Professional dark theme with syntax highlighting optimizations',
    version: '2.1.0',
    author: 'ThemeStudio',
    category: 'theme',
    enabled: true,
    installed: true,
    rating: 4.8,
    downloads: 12500
  },
  {
    id: 'git-enhanced',
    name: 'Git Enhanced',
    description: 'Advanced Git integration with visual diff and merge tools',
    version: '1.4.2',
    author: 'DevTools',
    category: 'extension',
    enabled: false,
    installed: true,
    rating: 4.6,
    downloads: 8900
  },
  {
    id: 'figma-sync',
    name: 'Figma Sync',
    description: 'Real-time design synchronization with Figma projects',
    version: '3.0.1',
    author: 'DesignBridge',
    category: 'integration',
    enabled: true,
    installed: false,
    rating: 4.9,
    downloads: 15600
  },
  {
    id: 'ai-assistant-plus',
    name: 'AI Assistant Plus',
    description: 'Enhanced AI coding assistant with context awareness',
    version: '1.8.0',
    author: 'AITools',
    category: 'tool',
    enabled: false,
    installed: false,
    rating: 4.7,
    downloads: 22100
  }
];

export function PluginManager({
  onInstallPlugin,
  onUninstallPlugin,
  onTogglePlugin,
  onConfigurePlugin,
  onCreatePlugin,
  onImportPlugin
}: PluginManagerProps) {
  const [plugins] = useState<Plugin[]>(mockPlugins);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredPlugins = plugins.filter(plugin => {
    const matchesSearch = plugin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plugin.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || plugin.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const installedPlugins = plugins.filter(p => p.installed);
  const enabledPlugins = installedPlugins.filter(p => p.enabled);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'theme': return <Eye className="w-4 h-4" />;
      case 'extension': return <Zap className="w-4 h-4" />;
      case 'integration': return <Code className="w-4 h-4" />;
      case 'tool': return <Settings className="w-4 h-4" />;
      default: return <Code className="w-4 h-4" />;
    }
  };

  const getBadgeVariant = (category: string) => {
    switch (category) {
      case 'theme': return 'secondary';
      case 'extension': return 'default';
      case 'integration': return 'outline';
      case 'tool': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Plugin Manager</h3>
            <p className="text-sm text-gray-600">
              {installedPlugins.length} installed • {enabledPlugins.length} enabled
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={onCreatePlugin} variant="outline" size="sm">
              <Edit3 className="w-4 h-4 mr-2" />
              Create
            </Button>
            <Button 
              onClick={() => document.getElementById('plugin-import')?.click()} 
              variant="outline" 
              size="sm"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
            <input
              id="plugin-import"
              type="file"
              accept=".zip,.json"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onImportPlugin(file);
              }}
            />
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-2">
          <Input
            placeholder="Search plugins..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Categories</option>
            <option value="theme">Themes</option>
            <option value="extension">Extensions</option>
            <option value="integration">Integrations</option>
            <option value="tool">Tools</option>
          </select>
        </div>
      </div>

      {/* Plugin Tabs */}
      <Tabs defaultValue="installed" className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-2 grid w-auto grid-cols-3">
          <TabsTrigger value="installed">Installed</TabsTrigger>
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          <TabsTrigger value="development">Development</TabsTrigger>
        </TabsList>

        {/* Installed Plugins */}
        <TabsContent value="installed" className="flex-1 p-4 space-y-3 overflow-y-auto">
          {installedPlugins.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Code className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No plugins installed</p>
            </div>
          ) : (
            installedPlugins.map((plugin) => (
              <Card key={plugin.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getCategoryIcon(plugin.category)}
                      <h4 className="font-medium">{plugin.name}</h4>
                      <Badge variant={getBadgeVariant(plugin.category)} className="text-xs">
                        {plugin.category}
                      </Badge>
                      {plugin.enabled && (
                        <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                          Active
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{plugin.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>v{plugin.version}</span>
                      <span>by {plugin.author}</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span>{plugin.rating}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => onTogglePlugin(plugin.id, !plugin.enabled)}
                      variant={plugin.enabled ? "destructive" : "default"}
                      size="sm"
                    >
                      {plugin.enabled ? 'Disable' : 'Enable'}
                    </Button>
                    <Button
                      onClick={() => onConfigurePlugin(plugin.id)}
                      variant="outline"
                      size="sm"
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => onUninstallPlugin(plugin.id)}
                      variant="outline"
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Marketplace */}
        <TabsContent value="marketplace" className="flex-1 p-4 space-y-3 overflow-y-auto">
          {filteredPlugins.filter(p => !p.installed).map((plugin) => (
            <Card key={plugin.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getCategoryIcon(plugin.category)}
                    <h4 className="font-medium">{plugin.name}</h4>
                    <Badge variant={getBadgeVariant(plugin.category)} className="text-xs">
                      {plugin.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{plugin.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>v{plugin.version}</span>
                    <span>by {plugin.author}</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span>{plugin.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="w-3 h-3" />
                      <span>{plugin.downloads.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => onInstallPlugin(plugin.id)}
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Install
                </Button>
              </div>
            </Card>
          ))}
        </TabsContent>

        {/* Development */}
        <TabsContent value="development" className="flex-1 p-4">
          <div className="space-y-4">
            <Card className="p-4">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="text-base">Plugin Development</CardTitle>
                <CardDescription>
                  Create custom plugins to extend the editor functionality
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Button onClick={onCreatePlugin} className="h-auto p-4 flex flex-col items-start">
                    <Edit3 className="w-6 h-6 mb-2" />
                    <span className="font-medium">Create Plugin</span>
                    <span className="text-xs opacity-75">Start from template</span>
                  </Button>
                  <Button 
                    onClick={() => document.getElementById('plugin-import')?.click()}
                    variant="outline" 
                    className="h-auto p-4 flex flex-col items-start"
                  >
                    <Upload className="w-6 h-6 mb-2" />
                    <span className="font-medium">Import Plugin</span>
                    <span className="text-xs opacity-75">Upload .zip or .json</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="p-4">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="text-base">Plugin SDK</CardTitle>
                <CardDescription>
                  Documentation and tools for plugin development
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">Plugin API Documentation</p>
                      <p className="text-xs text-gray-600">Complete reference guide</p>
                    </div>
                    <Button variant="outline" size="sm">View Docs</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">Development Templates</p>
                      <p className="text-xs text-gray-600">Starter templates for common plugin types</p>
                    </div>
                    <Button variant="outline" size="sm">Browse</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">Testing Tools</p>
                      <p className="text-xs text-gray-600">Debug and test your plugins</p>
                    </div>
                    <Button variant="outline" size="sm">Launch</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}