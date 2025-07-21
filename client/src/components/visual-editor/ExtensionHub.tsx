import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Download, 
  Star,
  Code,
  Zap,
  Eye,
  Edit3,
  Puzzle,
  Heart
} from 'lucide-react';

interface Extension {
  id: string;
  name: string;
  description: string;
  version: string;
  publisher: string;
  category: 'productivity' | 'theme' | 'language' | 'debugger' | 'snippet';
  enabled: boolean;
  installed: boolean;
  rating: number;
  installs: number;
  featured: boolean;
}

interface ExtensionHubProps {
  onInstallExtension: (extensionId: string) => void;
  onUninstallExtension: (extensionId: string) => void;
  onToggleExtension: (extensionId: string, enabled: boolean) => void;
  onConfigureExtension: (extensionId: string) => void;
  onRecommendExtension: (extensionId: string) => void;
}

const mockExtensions: Extension[] = [
  {
    id: 'prettier-code-formatter',
    name: 'Prettier - Code Formatter',
    description: 'Code formatter using prettier with advanced configuration options',
    version: '9.10.4',
    publisher: 'Prettier',
    category: 'productivity',
    enabled: true,
    installed: true,
    rating: 4.9,
    installs: 28500000,
    featured: true
  },
  {
    id: 'material-icon-theme',
    name: 'Material Icon Theme',
    description: 'Material Design icons for Visual Studio Code and compatible editors',
    version: '4.28.0',
    publisher: 'Philipp Kief',
    category: 'theme',
    enabled: true,
    installed: true,
    rating: 4.8,
    installs: 14200000,
    featured: true
  },
  {
    id: 'eslint',
    name: 'ESLint',
    description: 'Integrates ESLint JavaScript into your editor for real-time linting',
    version: '2.4.2',
    publisher: 'Microsoft',
    category: 'productivity',
    enabled: false,
    installed: true,
    rating: 4.7,
    installs: 22100000,
    featured: false
  },
  {
    id: 'typescript-hero',
    name: 'TypeScript Hero',
    description: 'Additional TypeScript tooling for enhanced development experience',
    version: '3.0.16',
    publisher: 'rbbit',
    category: 'language',
    enabled: false,
    installed: false,
    rating: 4.6,
    installs: 1200000,
    featured: false
  },
  {
    id: 'bracket-pair-colorizer',
    name: 'Bracket Pair Colorizer',
    description: 'Colorize matching brackets to improve code readability',
    version: '1.0.61',
    publisher: 'CoenraadS',
    category: 'productivity',
    enabled: false,
    installed: false,
    rating: 4.5,
    installs: 8900000,
    featured: true
  }
];

export function ExtensionHub({
  onInstallExtension,
  onUninstallExtension,
  onToggleExtension,
  onConfigureExtension,
  onRecommendExtension
}: ExtensionHubProps) {
  const [extensions] = useState<Extension[]>(mockExtensions);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredExtensions = extensions.filter(extension => {
    const matchesSearch = extension.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         extension.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         extension.publisher.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || extension.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const installedExtensions = extensions.filter(e => e.installed);
  const enabledExtensions = installedExtensions.filter(e => e.enabled);
  const featuredExtensions = extensions.filter(e => e.featured && !e.installed);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'productivity': return <Zap className="w-4 h-4" />;
      case 'theme': return <Eye className="w-4 h-4" />;
      case 'language': return <Code className="w-4 h-4" />;
      case 'debugger': return <Settings className="w-4 h-4" />;
      case 'snippet': return <Edit3 className="w-4 h-4" />;
      default: return <Puzzle className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'productivity': return 'bg-blue-100 text-blue-800';
      case 'theme': return 'bg-purple-100 text-purple-800';
      case 'language': return 'bg-green-100 text-green-800';
      case 'debugger': return 'bg-red-100 text-red-800';
      case 'snippet': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatInstalls = (installs: number) => {
    if (installs >= 1000000) {
      return `${(installs / 1000000).toFixed(1)}M`;
    } else if (installs >= 1000) {
      return `${(installs / 1000).toFixed(0)}K`;
    }
    return installs.toString();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold flex items-center">
              <Puzzle className="w-5 h-5 mr-2" />
              Extension Hub
            </h3>
            <p className="text-sm text-gray-600">
              {installedExtensions.length} installed • {enabledExtensions.length} enabled
            </p>
          </div>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Extension Settings
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-2">
          <Input
            placeholder="Search extensions..."
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
            <option value="productivity">Productivity</option>
            <option value="theme">Themes</option>
            <option value="language">Languages</option>
            <option value="debugger">Debuggers</option>
            <option value="snippet">Snippets</option>
          </select>
        </div>
      </div>

      {/* Extension Tabs */}
      <Tabs defaultValue="installed" className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-2 grid w-auto grid-cols-4">
          <TabsTrigger value="installed">Installed</TabsTrigger>
          <TabsTrigger value="featured">Featured</TabsTrigger>
          <TabsTrigger value="browse">Browse</TabsTrigger>
          <TabsTrigger value="updates">Updates</TabsTrigger>
        </TabsList>

        {/* Installed Extensions */}
        <TabsContent value="installed" className="flex-1 p-4 space-y-3 overflow-y-auto">
          {installedExtensions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Puzzle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No extensions installed</p>
              <Button className="mt-3" onClick={() => {}} variant="outline">
                Browse Extensions
              </Button>
            </div>
          ) : (
            installedExtensions.map((extension) => (
              <Card key={extension.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getCategoryIcon(extension.category)}
                      <h4 className="font-medium">{extension.name}</h4>
                      <Badge className={`text-xs ${getCategoryColor(extension.category)}`}>
                        {extension.category}
                      </Badge>
                      {extension.enabled && (
                        <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                          Enabled
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{extension.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>v{extension.version}</span>
                      <span>{extension.publisher}</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span>{extension.rating}</span>
                      </div>
                      <span>{formatInstalls(extension.installs)} installs</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => onToggleExtension(extension.id, !extension.enabled)}
                      variant={extension.enabled ? "destructive" : "default"}
                      size="sm"
                    >
                      {extension.enabled ? 'Disable' : 'Enable'}
                    </Button>
                    <Button
                      onClick={() => onConfigureExtension(extension.id)}
                      variant="outline"
                      size="sm"
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Featured Extensions */}
        <TabsContent value="featured" className="flex-1 p-4 space-y-3 overflow-y-auto">
          <div className="mb-4">
            <h4 className="font-medium text-sm mb-2 flex items-center">
              <Star className="w-4 h-4 mr-2 text-yellow-500" />
              Featured Extensions
            </h4>
            <p className="text-xs text-gray-600">Hand-picked extensions to enhance your development experience</p>
          </div>
          
          {featuredExtensions.map((extension) => (
            <Card key={extension.id} className="p-4 border-l-4 border-l-yellow-400">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getCategoryIcon(extension.category)}
                    <h4 className="font-medium">{extension.name}</h4>
                    <Badge className={`text-xs ${getCategoryColor(extension.category)}`}>
                      {extension.category}
                    </Badge>
                    <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                      Featured
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{extension.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>v{extension.version}</span>
                    <span>{extension.publisher}</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span>{extension.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="w-3 h-3" />
                      <span>{formatInstalls(extension.installs)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => onRecommendExtension(extension.id)}
                    variant="outline"
                    size="sm"
                  >
                    <Heart className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => onInstallExtension(extension.id)}
                    size="sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Install
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>

        {/* Browse All Extensions */}
        <TabsContent value="browse" className="flex-1 p-4 space-y-3 overflow-y-auto">
          {filteredExtensions.filter(e => !e.installed).map((extension) => (
            <Card key={extension.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getCategoryIcon(extension.category)}
                    <h4 className="font-medium">{extension.name}</h4>
                    <Badge className={`text-xs ${getCategoryColor(extension.category)}`}>
                      {extension.category}
                    </Badge>
                    {extension.featured && (
                      <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                        Featured
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{extension.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>v{extension.version}</span>
                    <span>{extension.publisher}</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span>{extension.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="w-3 h-3" />
                      <span>{formatInstalls(extension.installs)}</span>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => onInstallExtension(extension.id)}
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Install
                </Button>
              </div>
            </Card>
          ))}
        </TabsContent>

        {/* Updates Tab */}
        <TabsContent value="updates" className="flex-1 p-4">
          <div className="text-center py-8 text-gray-500">
            <Download className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">All extensions are up to date</p>
            <p className="text-sm">Automatic updates keep your extensions current</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}