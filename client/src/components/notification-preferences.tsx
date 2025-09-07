import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface NotificationPreferences {
  slackEnabled: boolean;
  emailEnabled: boolean;
  frequency: 'immediate' | 'hourly' | 'daily';
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  priorities: {
    high: boolean;
    medium: boolean;
    low: boolean;
  };
  insightTypes: {
    strategic: boolean;
    technical: boolean;
    operational: boolean;
    urgent: boolean;
  };
  agents: {
    [key: string]: boolean;
  };
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  slackEnabled: true,
  emailEnabled: false,
  frequency: 'immediate',
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00'
  },
  priorities: {
    high: true,
    medium: true,
    low: false
  },
  insightTypes: {
    strategic: true,
    technical: true,
    operational: true,
    urgent: true
  },
  agents: {
    elena: true,
    aria: true,
    zara: true,
    maya: true,
    victoria: true,
    rachel: true,
    ava: false,
    quinn: false,
    sophia: false,
    martha: true,
    diana: false,
    wilma: false,
    olga: false,
    flux: false
  }
};

export function NotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const [hasChanges, setHasChanges] = useState(false);
  const queryClient = useQueryClient();

  // Save preferences mutation
  const savePreferences = useMutation({
    mutationFn: async (prefs: NotificationPreferences) => {
      const response = await fetch('/api/admin/notification-preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(prefs)
      });
      if (!response.ok) throw new Error('Failed to save preferences');
      return response.json();
    },
    onSuccess: () => {
      setHasChanges(false);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/notification-preferences'] });
    }
  });

  const updatePreference = (key: string, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
  };

  const updateNestedPreference = (section: string, key: string, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof NotificationPreferences],
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const agentNames = [
    { key: 'elena', name: 'Elena', emoji: '👑', role: 'Strategic Leader' },
    { key: 'aria', name: 'Aria', emoji: '🎨', role: 'Brand Designer' },
    { key: 'zara', name: 'Zara', emoji: '⚡', role: 'Technical Architect' },
    { key: 'maya', name: 'Maya', emoji: '✨', role: 'AI Stylist' },
    { key: 'victoria', name: 'Victoria', emoji: '📊', role: 'UX Strategist' },
    { key: 'rachel', name: 'Rachel', emoji: '✍️', role: 'Brand Copywriter' },
    { key: 'ava', name: 'Ava', emoji: '🤖', role: 'Automation' },
    { key: 'quinn', name: 'Quinn', emoji: '🔍', role: 'QA' },
    { key: 'sophia', name: 'Sophia', emoji: '📱', role: 'Social Media' },
    { key: 'martha', name: 'Martha', emoji: '📈', role: 'Marketing' },
    { key: 'diana', name: 'Diana', emoji: '📋', role: 'Coordination' },
    { key: 'wilma', name: 'Wilma', emoji: '⚙️', role: 'Workflow' },
    { key: 'olga', name: 'Olga', emoji: '🗂️', role: 'Organization' },
    { key: 'flux', name: 'Flux', emoji: '🎯', role: 'Image Generation' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-serif text-xl font-light">Notification Preferences</h3>
          <p className="text-sm text-gray-600 mt-1">Control how and when your agents communicate with you</p>
        </div>
        {hasChanges && (
          <Button 
            onClick={() => savePreferences.mutate(preferences)}
            disabled={savePreferences.isPending}
          >
            {savePreferences.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        )}
      </div>

      {/* Delivery Channels */}
      <div className="bg-white border border-gray-200 p-6">
        <h4 className="font-medium mb-4">Delivery Channels</h4>
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={preferences.slackEnabled}
              onChange={(e) => updatePreference('slackEnabled', e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm">💬 Slack Notifications</span>
            <Badge variant="outline" className="text-xs">Recommended</Badge>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={preferences.emailEnabled}
              onChange={(e) => updatePreference('emailEnabled', e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm">📧 Email Notifications</span>
            <Badge variant="outline" className="text-xs">Coming Soon</Badge>
          </label>
        </div>
      </div>

      {/* Notification Frequency */}
      <div className="bg-white border border-gray-200 p-6">
        <h4 className="font-medium mb-4">Notification Frequency</h4>
        <div className="space-y-2">
          {[
            { value: 'immediate', label: 'Immediate', desc: 'Get notified as insights are generated' },
            { value: 'hourly', label: 'Hourly Digest', desc: 'Receive a summary every hour' },
            { value: 'daily', label: 'Daily Summary', desc: 'One comprehensive report per day' }
          ].map(option => (
            <label key={option.value} className="flex items-start gap-3 p-3 border border-gray-100 rounded hover:bg-gray-50">
              <input
                type="radio"
                name="frequency"
                value={option.value}
                checked={preferences.frequency === option.value}
                onChange={(e) => updatePreference('frequency', e.target.value)}
                className="mt-1"
              />
              <div>
                <div className="font-medium text-sm">{option.label}</div>
                <div className="text-xs text-gray-600">{option.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Quiet Hours */}
      <div className="bg-white border border-gray-200 p-6">
        <h4 className="font-medium mb-4">Quiet Hours</h4>
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={preferences.quietHours.enabled}
              onChange={(e) => updateNestedPreference('quietHours', 'enabled', e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm">Enable quiet hours (no notifications)</span>
          </label>
          
          {preferences.quietHours.enabled && (
            <div className="ml-6 flex items-center gap-4">
              <div>
                <label className="text-xs text-gray-600">From:</label>
                <input
                  type="time"
                  value={preferences.quietHours.start}
                  onChange={(e) => updateNestedPreference('quietHours', 'start', e.target.value)}
                  className="block mt-1 text-sm border border-gray-300 rounded px-2 py-1"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600">To:</label>
                <input
                  type="time"
                  value={preferences.quietHours.end}
                  onChange={(e) => updateNestedPreference('quietHours', 'end', e.target.value)}
                  className="block mt-1 text-sm border border-gray-300 rounded px-2 py-1"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Priority Filters */}
      <div className="bg-white border border-gray-200 p-6">
        <h4 className="font-medium mb-4">Priority Levels</h4>
        <div className="space-y-2">
          {[
            { key: 'high', label: 'High Priority', desc: 'Critical business decisions and urgent issues', color: 'text-red-600' },
            { key: 'medium', label: 'Medium Priority', desc: 'Important optimizations and opportunities', color: 'text-yellow-600' },
            { key: 'low', label: 'Low Priority', desc: 'Minor suggestions and informational insights', color: 'text-green-600' }
          ].map(priority => (
            <label key={priority.key} className="flex items-start gap-3 p-3 border border-gray-100 rounded hover:bg-gray-50">
              <input
                type="checkbox"
                checked={preferences.priorities[priority.key as keyof typeof preferences.priorities]}
                onChange={(e) => updateNestedPreference('priorities', priority.key, e.target.checked)}
                className="mt-1 rounded border-gray-300"
              />
              <div>
                <div className={`font-medium text-sm ${priority.color}`}>{priority.label}</div>
                <div className="text-xs text-gray-600">{priority.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Insight Types */}
      <div className="bg-white border border-gray-200 p-6">
        <h4 className="font-medium mb-4">Insight Types</h4>
        <div className="grid grid-cols-2 gap-3">
          {[
            { key: 'strategic', label: 'Strategic', desc: 'Business growth and planning', emoji: '🧠' },
            { key: 'technical', label: 'Technical', desc: 'System performance and optimization', emoji: '⚡' },
            { key: 'operational', label: 'Operational', desc: 'Process improvements and efficiency', emoji: '⚙️' },
            { key: 'urgent', label: 'Urgent', desc: 'Immediate attention required', emoji: '🚨' }
          ].map(type => (
            <label key={type.key} className="flex items-start gap-3 p-3 border border-gray-100 rounded hover:bg-gray-50">
              <input
                type="checkbox"
                checked={preferences.insightTypes[type.key as keyof typeof preferences.insightTypes]}
                onChange={(e) => updateNestedPreference('insightTypes', type.key, e.target.checked)}
                className="mt-1 rounded border-gray-300"
              />
              <div>
                <div className="font-medium text-sm flex items-center gap-2">
                  <span>{type.emoji}</span>
                  {type.label}
                </div>
                <div className="text-xs text-gray-600">{type.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Agent Preferences */}
      <div className="bg-white border border-gray-200 p-6">
        <h4 className="font-medium mb-4">Agent Notifications</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {agentNames.map(agent => (
            <label key={agent.key} className="flex items-center gap-3 p-3 border border-gray-100 rounded hover:bg-gray-50">
              <input
                type="checkbox"
                checked={preferences.agents[agent.key] || false}
                onChange={(e) => updateNestedPreference('agents', agent.key, e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-lg">{agent.emoji}</span>
              <div>
                <div className="font-medium text-sm">{agent.name}</div>
                <div className="text-xs text-gray-600">{agent.role}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Quick Presets */}
      <div className="bg-gray-50 border border-gray-200 p-6">
        <h4 className="font-medium mb-4">Quick Presets</h4>
        <div className="flex gap-2 flex-wrap">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              setPreferences({
                ...DEFAULT_PREFERENCES,
                priorities: { high: true, medium: true, low: false },
                insightTypes: { strategic: true, technical: true, operational: false, urgent: true }
              });
              setHasChanges(true);
            }}
          >
            🎯 High Priority Only
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              setPreferences({
                ...DEFAULT_PREFERENCES,
                agents: { elena: true, victoria: true, martha: true, zara: true, maya: false, aria: false, rachel: false, ava: false, quinn: false, sophia: false, diana: false, wilma: false, olga: false, flux: false }
              });
              setHasChanges(true);
            }}
          >
            👑 Strategic Team Only
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              setPreferences({
                ...DEFAULT_PREFERENCES,
                frequency: 'daily',
                quietHours: { enabled: true, start: '18:00', end: '09:00' }
              });
              setHasChanges(true);
            }}
          >
            🌙 Minimal Interruptions
          </Button>
        </div>
      </div>
    </div>
  );
}