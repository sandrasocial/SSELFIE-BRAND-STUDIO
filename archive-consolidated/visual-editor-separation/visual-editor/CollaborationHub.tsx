import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users,
  MessageCircle,
  Share2,
  Eye,
  Edit,
  Settings,
  UserPlus,
  Crown,
  Shield,
  Clock,
  Bell,
  Video,
  Phone,
  Send,
  ThumbsUp,
  MessageSquare,
  AtSign,
  Hash,
  Globe,
  Lock,
  Zap,
  Activity
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Collaborator {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  status: 'online' | 'away' | 'offline';
  lastSeen: Date;
  activeFile?: string;
  permissions: string[];
}

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
  type: 'text' | 'system' | 'file' | 'mention';
  fileRef?: string;
  reactions?: { emoji: string; users: string[] }[];
}

interface LiveSession {
  id: string;
  name: string;
  participants: string[];
  startTime: Date;
  type: 'coding' | 'review' | 'planning' | 'debugging';
  status: 'active' | 'paused' | 'ended';
}

const SAMPLE_COLLABORATORS: Collaborator[] = [
  {
    id: '1',
    name: 'Sandra',
    email: 'ssa@ssasocial.com',
    avatar: '/avatars/sandra.jpg',
    role: 'owner',
    status: 'online',
    lastSeen: new Date(),
    activeFile: 'OptimizedVisualEditor.tsx',
    permissions: ['read', 'write', 'admin', 'deploy']
  },
  {
    id: '2',
    name: 'Elena AI',
    email: 'elena@sselfie.ai',
    role: 'admin',
    status: 'online',
    lastSeen: new Date(Date.now() - 300000),
    activeFile: 'elena-workflow-system.ts',
    permissions: ['read', 'write', 'coordinate']
  },
  {
    id: '3',
    name: 'Maya AI',
    email: 'maya@sselfie.ai',
    role: 'editor',
    status: 'away',
    lastSeen: new Date(Date.now() - 900000),
    activeFile: 'image-generation-service.ts',
    permissions: ['read', 'write']
  },
  {
    id: '4',
    name: 'Victoria AI',
    email: 'victoria@sselfie.ai',
    role: 'editor',
    status: 'offline',
    lastSeen: new Date(Date.now() - 3600000),
    permissions: ['read', 'write']
  }
];

const SAMPLE_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    userId: '1',
    userName: 'Sandra',
    message: 'Category 6 Git integration is looking great! Love the branch management.',
    timestamp: new Date(),
    type: 'text'
  },
  {
    id: '2',
    userId: '2',
    userName: 'Elena AI',
    message: 'I can coordinate the next phase - should we focus on deployment features?',
    timestamp: new Date(Date.now() - 300000),
    type: 'text'
  },
  {
    id: '3',
    userId: 'system',
    userName: 'System',
    message: 'Maya AI committed 3 files to feature/category-6-git',
    timestamp: new Date(Date.now() - 600000),
    type: 'system',
    fileRef: 'GitIntegration.tsx'
  }
];

const SAMPLE_SESSION: LiveSession = {
  id: 'session-1',
  name: 'Category 6 Development',
  participants: ['1', '2', '3'],
  startTime: new Date(Date.now() - 1800000),
  type: 'coding',
  status: 'active'
};

interface CollaborationHubProps {
  onInviteUser?: (email: string, role: string) => void;
  onStartSession?: (type: string) => void;
  onSendMessage?: (message: string) => void;
}

export function CollaborationHub({
  onInviteUser,
  onStartSession,
  onSendMessage
}: CollaborationHubProps) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>(SAMPLE_COLLABORATORS);
  const [messages, setMessages] = useState<ChatMessage[]>(SAMPLE_MESSAGES);
  const [currentSession, setCurrentSession] = useState<LiveSession>(SAMPLE_SESSION);
  const [newMessage, setNewMessage] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'editor' | 'viewer'>('editor');
  const { toast } = useToast();

  // Get status color and icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <div className="w-2 h-2 bg-green-500 rounded-full" />;
      case 'away': return <div className="w-2 h-2 bg-yellow-500 rounded-full" />;
      case 'offline': return <div className="w-2 h-2 bg-gray-400 rounded-full" />;
      default: return <div className="w-2 h-2 bg-gray-400 rounded-full" />;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="w-3 h-3 text-yellow-500" />;
      case 'admin': return <Shield className="w-3 h-3 text-blue-500" />;
      case 'editor': return <Edit className="w-3 h-3 text-green-500" />;
      case 'viewer': return <Eye className="w-3 h-3 text-gray-500" />;
      default: return <Eye className="w-3 h-3 text-gray-500" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-yellow-100 text-yellow-800';
      case 'admin': return 'bg-blue-100 text-blue-800';
      case 'editor': return 'bg-green-100 text-green-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Send message
  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      userId: '1',
      userName: 'Sandra',
      message: newMessage,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [message, ...prev]);
    setNewMessage('');
    onSendMessage?.(newMessage);

    toast({
      title: 'Message Sent',
      description: 'Your message has been sent to the team',
    });
  };

  // Invite user
  const inviteUser = () => {
    if (!inviteEmail.trim()) return;

    const newCollaborator: Collaborator = {
      id: Date.now().toString(),
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole,
      status: 'offline',
      lastSeen: new Date(),
      permissions: inviteRole === 'editor' ? ['read', 'write'] : ['read']
    };

    setCollaborators(prev => [...prev, newCollaborator]);
    setInviteEmail('');
    onInviteUser?.(inviteEmail, inviteRole);

    toast({
      title: 'Invitation Sent',
      description: `Invited ${inviteEmail} as ${inviteRole}`,
    });
  };

  // Start live session
  const startLiveSession = (type: 'coding' | 'review' | 'planning' | 'debugging') => {
    const session: LiveSession = {
      id: Date.now().toString(),
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Session`,
      participants: ['1'],
      startTime: new Date(),
      type,
      status: 'active'
    };

    setCurrentSession(session);
    onStartSession?.(type);

    toast({
      title: 'Live Session Started',
      description: `${session.name} is now active`,
    });
  };

  return (
    <div className="w-full h-full flex flex-col space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Collaboration Hub
            </CardTitle>
            <Badge variant="secondary" className="text-xs bg-black text-white">
              Category 6
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {collaborators.filter(c => c.status === 'online').length}
              </div>
              <div className="text-xs text-gray-600">Online</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{messages.length}</div>
              <div className="text-xs text-gray-600">Messages</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{currentSession.participants.length}</div>
              <div className="text-xs text-gray-600">In Session</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{collaborators.length}</div>
              <div className="text-xs text-gray-600">Team Members</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Team Members */}
        <Card className="flex flex-col">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center">
                <Users className="w-4 h-4 mr-2" />
                Team Members ({collaborators.length})
              </CardTitle>
              <Button variant="outline" size="sm">
                <UserPlus className="w-3 h-3" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto space-y-2">
            {collaborators.map((collaborator) => (
              <div key={collaborator.id} className="p-3 border rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={collaborator.avatar} />
                        <AvatarFallback className="text-xs">
                          {collaborator.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1">
                        {getStatusIcon(collaborator.status)}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{collaborator.name}</span>
                        {getRoleIcon(collaborator.role)}
                      </div>
                      <div className="text-xs text-gray-600">{collaborator.email}</div>
                      {collaborator.activeFile && (
                        <div className="text-xs text-blue-600 mt-1">
                          Editing: {collaborator.activeFile}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-1">
                    <Badge variant="secondary" className={`text-xs ${getRoleColor(collaborator.role)}`}>
                      {collaborator.role}
                    </Badge>
                    {collaborator.status !== 'online' && (
                      <div className="text-xs text-gray-500">
                        {collaborator.lastSeen.toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Invite Section */}
            <div className="pt-3 border-t space-y-2">
              <Input
                placeholder="Email address"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="text-xs"
              />
              <div className="flex space-x-2">
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as 'editor' | 'viewer')}
                  className="flex-1 text-xs border rounded px-2 py-1"
                >
                  <option value="editor">Editor</option>
                  <option value="viewer">Viewer</option>
                </select>
                <Button variant="outline" size="sm" onClick={inviteUser}>
                  <Send className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Chat */}
        <Card className="flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center">
              <MessageCircle className="w-4 h-4 mr-2" />
              Team Chat
            </CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-2 mb-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-2 rounded-lg ${
                    message.type === 'system' ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs font-medium">{message.userName}</span>
                        <span className="text-xs text-gray-500">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                        {message.type === 'system' && (
                          <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                            system
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm">{message.message}</div>
                      {message.fileRef && (
                        <div className="text-xs text-blue-600 mt-1">
                          📎 {message.fileRef}
                        </div>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" className="p-1">
                      <ThumbsUp className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="flex space-x-2">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                className="flex-1 text-xs"
              />
              <Button variant="outline" size="sm" onClick={sendMessage}>
                <Send className="w-3 h-3" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Live Sessions */}
        <Card className="flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center">
              <Activity className="w-4 h-4 mr-2" />
              Live Sessions
            </CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1 space-y-3">
            {/* Current Session */}
            {currentSession && (
              <div className="p-3 border rounded-lg bg-green-50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium">{currentSession.name}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                    {currentSession.status}
                  </Badge>
                </div>
                
                <div className="text-xs text-gray-600 mb-2">
                  Started {currentSession.startTime.toLocaleTimeString()}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    {collaborators
                      .filter(c => currentSession.participants.includes(c.id))
                      .slice(0, 3)
                      .map(c => (
                        <Avatar key={c.id} className="w-6 h-6">
                          <AvatarFallback className="text-xs">{c.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      ))}
                    {currentSession.participants.length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{currentSession.participants.length - 3}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-1">
                    <Button variant="outline" size="sm" className="p-1">
                      <Video className="w-3 h-3" />
                    </Button>
                    <Button variant="outline" size="sm" className="p-1">
                      <Share2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-gray-600">Start New Session</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => startLiveSession('coding')}
                  className="text-xs"
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Coding
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => startLiveSession('review')}
                  className="text-xs"
                >
                  <Eye className="w-3 h-3 mr-1" />
                  Review
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => startLiveSession('planning')}
                  className="text-xs"
                >
                  <Hash className="w-3 h-3 mr-1" />
                  Planning
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => startLiveSession('debugging')}
                  className="text-xs"
                >
                  <Zap className="w-3 h-3 mr-1" />
                  Debug
                </Button>
              </div>
            </div>

            {/* Permissions & Settings */}
            <div className="pt-3 border-t">
              <h4 className="text-xs font-medium text-gray-600 mb-2">Workspace Settings</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs">Public visibility</span>
                  <Globe className="w-3 h-3 text-gray-400" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs">Private workspace</span>
                  <Lock className="w-3 h-3 text-gray-400" />
                </div>
                <Button variant="outline" size="sm" className="w-full text-xs">
                  <Settings className="w-3 h-3 mr-1" />
                  Manage Permissions
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}