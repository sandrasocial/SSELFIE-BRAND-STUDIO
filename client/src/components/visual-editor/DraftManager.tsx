import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Save, 
  FileText, 
  Clock, 
  Trash2, 
  Edit3,
  Plus,
  Search
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Draft {
  id: string;
  title: string;
  content: string;
  agentId: string;
  createdAt: Date;
  lastModified: Date;
  isAutoSaved: boolean;
}

interface DraftManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadDraft: (content: string) => void;
  currentDraft?: string;
  currentAgent?: string;
}

export function DraftManager({ 
  isOpen, 
  onClose, 
  onLoadDraft, 
  currentDraft = '',
  currentAgent = 'general'
}: DraftManagerProps) {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingDraft, setEditingDraft] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const { toast } = useToast();

  // Load drafts from localStorage
  useEffect(() => {
    const savedDrafts = localStorage.getItem('agent-input-drafts');
    if (savedDrafts) {
      try {
        const parsed = JSON.parse(savedDrafts);
        setDrafts(parsed.map((draft: any) => ({
          ...draft,
          createdAt: new Date(draft.createdAt),
          lastModified: new Date(draft.lastModified)
        })));
      } catch (error) {
        console.error('Failed to load drafts:', error);
      }
    }
  }, [isOpen]);

  // Save drafts to localStorage
  const saveDrafts = (updatedDrafts: Draft[]) => {
    setDrafts(updatedDrafts);
    localStorage.setItem('agent-input-drafts', JSON.stringify(updatedDrafts));
  };

  // Save current draft
  const saveCurrentDraft = () => {
    if (!currentDraft.trim()) {
      toast({
        title: 'No content',
        description: 'Cannot save empty draft',
        variant: 'destructive',
      });
      return;
    }

    const title = currentDraft.slice(0, 50) + (currentDraft.length > 50 ? '...' : '');
    const newDraft: Draft = {
      id: `draft-${Date.now()}`,
      title,
      content: currentDraft,
      agentId: currentAgent,
      createdAt: new Date(),
      lastModified: new Date(),
      isAutoSaved: false
    };

    const updatedDrafts = [newDraft, ...drafts];
    saveDrafts(updatedDrafts);

    toast({
      title: 'Draft saved',
      description: `Saved as "${title}"`,
    });
  };

  // Auto-save draft
  const autoSaveDraft = () => {
    if (!currentDraft.trim()) return;

    const existingAutoSave = drafts.find(d => d.agentId === currentAgent && d.isAutoSaved);
    const title = `Auto-save for ${currentAgent}`;

    if (existingAutoSave) {
      // Update existing auto-save
      const updatedDrafts = drafts.map(draft =>
        draft.id === existingAutoSave.id
          ? { ...draft, content: currentDraft, lastModified: new Date() }
          : draft
      );
      saveDrafts(updatedDrafts);
    } else {
      // Create new auto-save
      const autoSaveDraft: Draft = {
        id: `autosave-${currentAgent}-${Date.now()}`,
        title,
        content: currentDraft,
        agentId: currentAgent,
        createdAt: new Date(),
        lastModified: new Date(),
        isAutoSaved: true
      };
      saveDrafts([autoSaveDraft, ...drafts]);
    }
  };

  // Load draft
  const loadDraft = (draft: Draft) => {
    onLoadDraft(draft.content);
    onClose();
    toast({
      title: 'Draft loaded',
      description: `Loaded "${draft.title}"`,
    });
  };

  // Delete draft
  const deleteDraft = (id: string) => {
    const updatedDrafts = drafts.filter(draft => draft.id !== id);
    saveDrafts(updatedDrafts);
    toast({
      title: 'Draft deleted',
      description: 'Draft removed successfully',
    });
  };

  // Update draft title
  const updateDraftTitle = (id: string, newTitle: string) => {
    const updatedDrafts = drafts.map(draft =>
      draft.id === id ? { ...draft, title: newTitle, lastModified: new Date() } : draft
    );
    saveDrafts(updatedDrafts);
    setEditingDraft(null);
    toast({
      title: 'Title updated',
      description: 'Draft title has been updated',
    });
  };

  // Filter drafts
  const filteredDrafts = drafts.filter(draft =>
    draft.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    draft.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    draft.agentId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <Card className="w-full max-w-3xl max-h-[80vh] overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Draft Manager
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>
          
          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                onClick={saveCurrentDraft}
                disabled={!currentDraft.trim()}
                className="bg-black text-white"
              >
                <Save className="w-3 h-3 mr-1" />
                Save Current
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={autoSaveDraft}
                disabled={!currentDraft.trim()}
              >
                Auto-save
              </Button>
            </div>
            
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search drafts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-64"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="overflow-y-auto max-h-96">
          {filteredDrafts.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <div>No drafts found</div>
              <div className="text-xs">Save your work in progress for later</div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDrafts.map((draft) => (
                <div
                  key={draft.id}
                  className="group border border-gray-200 rounded p-4 hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {/* Title */}
                      <div className="flex items-center space-x-2 mb-2">
                        {editingDraft === draft.id ? (
                          <div className="flex items-center space-x-2 flex-1">
                            <Input
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="text-sm"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  updateDraftTitle(draft.id, editTitle);
                                }
                                if (e.key === 'Escape') {
                                  setEditingDraft(null);
                                }
                              }}
                              autoFocus
                            />
                            <Button
                              size="sm"
                              onClick={() => updateDraftTitle(draft.id, editTitle)}
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingDraft(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <>
                            <h3 className="font-medium text-sm line-clamp-1">
                              {draft.title}
                            </h3>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingDraft(draft.id);
                                setEditTitle(draft.title);
                              }}
                              className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100"
                            >
                              <Edit3 className="w-3 h-3" />
                            </Button>
                          </>
                        )}
                      </div>

                      {/* Content Preview */}
                      <div className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {draft.content}
                      </div>

                      {/* Metadata */}
                      <div className="flex items-center space-x-3 text-xs text-gray-500">
                        <Badge 
                          variant={draft.isAutoSaved ? "secondary" : "outline"} 
                          className="text-xs"
                        >
                          {draft.isAutoSaved ? 'Auto-saved' : 'Manual'}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {draft.agentId}
                        </Badge>
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {draft.lastModified.toLocaleDateString()}
                        </span>
                        <span>{draft.content.length} chars</span>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => loadDraft(draft)}
                        className="h-8 w-8 p-0 bg-black text-white hover:bg-gray-800"
                        title="Load draft"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteDraft(draft.id)}
                        className="h-8 w-8 p-0 text-red-500 hover:bg-red-50"
                        title="Delete draft"
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