import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  History, 
  Search, 
  Clock, 
  Hash, 
  Star, 
  Trash2,
  Filter
} from 'lucide-react';

interface InputHistoryEntry {
  id: string;
  message: string;
  timestamp: Date;
  agentId: string;
  frequency: number;
  isStarred: boolean;
  tags: string[];
}

interface InputHistoryManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMessage: (message: string) => void;
}

export function InputHistoryManager({ 
  isOpen, 
  onClose, 
  onSelectMessage 
}: InputHistoryManagerProps) {
  const [history, setHistory] = useState<InputHistoryEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAgent, setFilterAgent] = useState('all');
  const [sortBy, setSortBy] = useState<'recent' | 'frequency' | 'starred'>('recent');

  // Load history from localStorage
  React.useEffect(() => {
    const savedHistory = localStorage.getItem('agent-input-history');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setHistory(parsed.map((entry: any, index: number) => ({
          id: entry.id || `hist-${index}`,
          message: entry.message,
          timestamp: new Date(entry.timestamp),
          agentId: entry.agentId || 'unknown',
          frequency: entry.frequency || 1,
          isStarred: entry.isStarred || false,
          tags: entry.tags || []
        })));
      } catch (error) {
        console.error('Failed to load input history:', error);
      }
    }
  }, [isOpen]);

  // Filter and sort history
  const filteredHistory = history
    .filter(entry => {
      const matchesSearch = entry.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           entry.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesAgent = filterAgent === 'all' || entry.agentId === filterAgent;
      return matchesSearch && matchesAgent;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'frequency':
          return b.frequency - a.frequency;
        case 'starred':
          return (b.isStarred ? 1 : 0) - (a.isStarred ? 1 : 0);
        case 'recent':
        default:
          return b.timestamp.getTime() - a.timestamp.getTime();
      }
    });

  // Toggle star status
  const toggleStar = (id: string) => {
    const updatedHistory = history.map(entry =>
      entry.id === id ? { ...entry, isStarred: !entry.isStarred } : entry
    );
    setHistory(updatedHistory);
    localStorage.setItem('agent-input-history', JSON.stringify(updatedHistory));
  };

  // Delete entry
  const deleteEntry = (id: string) => {
    const updatedHistory = history.filter(entry => entry.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem('agent-input-history', JSON.stringify(updatedHistory));
  };

  // Get unique agents
  const uniqueAgents = Array.from(new Set(history.map(entry => entry.agentId)));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <History className="w-5 h-5 mr-2" />
              Input History
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>
          
          {/* Search and Filters */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search messages and tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <select
                value={filterAgent}
                onChange={(e) => setFilterAgent(e.target.value)}
                className="px-3 py-2 border rounded text-sm"
              >
                <option value="all">All Agents</option>
                {uniqueAgents.map(agent => (
                  <option key={agent} value={agent}>
                    {agent.charAt(0).toUpperCase() + agent.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Sort by:</span>
              {(['recent', 'frequency', 'starred'] as const).map(sort => (
                <Button
                  key={sort}
                  variant={sortBy === sort ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSortBy(sort)}
                  className="text-xs"
                >
                  {sort === 'recent' && <Clock className="w-3 h-3 mr-1" />}
                  {sort === 'frequency' && <Hash className="w-3 h-3 mr-1" />}
                  {sort === 'starred' && <Star className="w-3 h-3 mr-1" />}
                  {sort.charAt(0).toUpperCase() + sort.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="overflow-y-auto max-h-96">
          {filteredHistory.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <History className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <div>No input history found</div>
              <div className="text-xs">Start chatting to build your input history</div>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredHistory.map((entry) => (
                <div
                  key={entry.id}
                  className="group border border-gray-200 rounded p-3 hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    onSelectMessage(entry.message);
                    onClose();
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium line-clamp-2 mb-1">
                        {entry.message}
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <Badge variant="outline" className="text-xs">
                          {entry.agentId}
                        </Badge>
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {entry.timestamp.toLocaleDateString()}
                        </span>
                        {entry.frequency > 1 && (
                          <span className="flex items-center">
                            <Hash className="w-3 h-3 mr-1" />
                            Used {entry.frequency}x
                          </span>
                        )}
                      </div>
                      {entry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {entry.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStar(entry.id);
                        }}
                        className={`h-6 w-6 p-0 ${entry.isStarred ? 'text-yellow-500' : 'text-gray-400'}`}
                      >
                        <Star className={`w-3 h-3 ${entry.isStarred ? 'fill-current' : ''}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteEntry(entry.id);
                        }}
                        className="h-6 w-6 p-0 text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}