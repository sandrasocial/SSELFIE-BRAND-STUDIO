import React from 'react';
import { Link } from 'wouter';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

// Agent specializations with quick access descriptions
const AGENT_SPECIALISTS = [
  {
    name: 'elena',
    displayName: 'Elena',
    role: 'Strategic Leader',
    emoji: '👑',
    expertise: ['Business Strategy', 'Revenue Growth', 'Leadership', 'Market Analysis'],
    quickActions: ['Revenue Review', 'Strategic Planning', 'Market Opportunities'],
    color: 'bg-purple-100 border-purple-300 text-purple-800'
  },
  {
    name: 'aria',
    displayName: 'Aria',
    role: 'Brand Designer',
    emoji: '🎨',
    expertise: ['Visual Design', 'Brand Identity', 'UI/UX', 'Creative Direction'],
    quickActions: ['Brand Review', 'Design Audit', 'Visual Optimization'],
    color: 'bg-pink-100 border-pink-300 text-pink-800'
  },
  {
    name: 'zara',
    displayName: 'Zara',
    role: 'Technical Architect',
    emoji: '⚡',
    expertise: ['System Performance', 'Technical Architecture', 'Security', 'Optimization'],
    quickActions: ['Performance Check', 'Security Audit', 'Tech Optimization'],
    color: 'bg-blue-100 border-blue-300 text-blue-800'
  },
  {
    name: 'maya',
    displayName: 'Maya',
    role: 'AI Stylist',
    emoji: '✨',
    expertise: ['AI Styling', 'Personal Branding', 'Image Generation', 'Style Trends'],
    quickActions: ['Style Analysis', 'Trend Report', 'AI Enhancement'],
    color: 'bg-yellow-100 border-yellow-300 text-yellow-800'
  },
  {
    name: 'victoria',
    displayName: 'Victoria',
    role: 'UX Strategist',
    emoji: '📊',
    expertise: ['User Experience', 'Conversion Optimization', 'Analytics', 'Business Intelligence'],
    quickActions: ['UX Audit', 'Conversion Review', 'Analytics Report'],
    color: 'bg-green-100 border-green-300 text-green-800'
  },
  {
    name: 'rachel',
    displayName: 'Rachel',
    role: 'Brand Copywriter',
    emoji: '✍️',
    expertise: ['Copywriting', 'Content Strategy', 'Brand Voice', 'Messaging'],
    quickActions: ['Copy Review', 'Content Strategy', 'Brand Voice Audit'],
    color: 'bg-indigo-100 border-indigo-300 text-indigo-800'
  },
  {
    name: 'ava',
    displayName: 'Ava',
    role: 'Automation Specialist',
    emoji: '🤖',
    expertise: ['Process Automation', 'Workflow Optimization', 'Efficiency', 'Integration'],
    quickActions: ['Automation Audit', 'Workflow Review', 'Efficiency Analysis'],
    color: 'bg-gray-100 border-gray-300 text-gray-800'
  },
  {
    name: 'martha',
    displayName: 'Martha',
    role: 'Marketing Director',
    emoji: '📈',
    expertise: ['Marketing Strategy', 'Campaign Management', 'Customer Acquisition', 'Growth'],
    quickActions: ['Campaign Review', 'Marketing Audit', 'Growth Strategy'],
    color: 'bg-red-100 border-red-300 text-red-800'
  }
];

export function QuickSpecialistAccess() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-serif text-xl font-light">Quick Specialist Access</h3>
          <p className="text-sm text-gray-600 mt-1">Instant access to your agent specialists and their expertise</p>
        </div>
      </div>

      {/* Top Tier Specialists - Strategic & High-Impact */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3 uppercase tracking-wide">Strategic Leadership</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {AGENT_SPECIALISTS.filter(agent => ['elena', 'victoria', 'martha'].includes(agent.name)).map(agent => (
            <div key={agent.name} className={`border-2 ${agent.color} p-4 rounded-lg`}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{agent.emoji}</span>
                <div>
                  <h5 className="font-medium">{agent.displayName}</h5>
                  <p className="text-xs text-gray-600">{agent.role}</p>
                </div>
                <div className="ml-auto">
                  <Link href={`/admin-consulting-agents?agent=${agent.name}`}>
                    <Button size="sm" variant="outline">
                      Chat Now
                    </Button>
                  </Link>
                </div>
              </div>
              
              <div className="space-y-2">
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-1">Expertise:</p>
                  <div className="flex flex-wrap gap-1">
                    {agent.expertise.slice(0, 2).map(skill => (
                      <Badge key={skill} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-1">Quick Actions:</p>
                  <div className="flex flex-wrap gap-1">
                    {agent.quickActions.slice(0, 2).map(action => (
                      <Link key={action} href={`/admin-consulting-agents?agent=${agent.name}&action=${action}`}>
                        <button className="text-xs bg-white bg-opacity-50 px-2 py-1 rounded border hover:bg-opacity-70 transition-colors">
                          {action}
                        </button>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Creative & Technical Specialists */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3 uppercase tracking-wide">Creative & Technical</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {AGENT_SPECIALISTS.filter(agent => ['aria', 'zara', 'maya', 'rachel'].includes(agent.name)).map(agent => (
            <div key={agent.name} className={`border ${agent.color} p-4 rounded-lg`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{agent.emoji}</span>
                <div className="flex-1">
                  <h5 className="font-medium text-sm">{agent.displayName}</h5>
                  <p className="text-xs text-gray-600">{agent.role}</p>
                </div>
                <Link href={`/admin-consulting-agents?agent=${agent.name}`}>
                  <Button size="sm" variant="outline" className="text-xs px-2 py-1">
                    Chat
                  </Button>
                </Link>
              </div>
              
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  {agent.expertise.slice(0, 2).map(skill => (
                    <Badge key={skill} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {agent.quickActions.slice(0, 2).map(action => (
                    <Link key={action} href={`/admin-consulting-agents?agent=${agent.name}&action=${action}`}>
                      <button className="text-xs bg-white bg-opacity-50 px-1.5 py-0.5 rounded text-gray-700 hover:bg-opacity-70 transition-colors">
                        {action}
                      </button>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Operational Specialists - Quick Access Grid */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3 uppercase tracking-wide">Operational Support</h4>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {[
            { name: 'ava', emoji: '🤖', displayName: 'Ava', role: 'Automation' },
            { name: 'quinn', emoji: '🔍', displayName: 'Quinn', role: 'QA' },
            { name: 'sophia', emoji: '📱', displayName: 'Sophia', role: 'Social' },
            { name: 'diana', emoji: '📋', displayName: 'Diana', role: 'Coordination' },
            { name: 'wilma', emoji: '⚙️', displayName: 'Wilma', role: 'Workflow' },
            { name: 'olga', emoji: '🗂️', displayName: 'Olga', role: 'Organization' }
          ].map(agent => (
            <Link key={agent.name} href={`/admin-consulting-agents?agent=${agent.name}`}>
              <div className="border border-gray-200 p-3 text-center hover:border-black hover:shadow-sm transition-all cursor-pointer">
                <div className="text-lg mb-1">{agent.emoji}</div>
                <div className="text-xs font-medium">{agent.displayName}</div>
                <div className="text-xs text-gray-500">{agent.role}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Emergency Specialist Access */}
      <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-red-800 mb-2 flex items-center gap-2">
          🚨 Emergency Specialist Access
        </h4>
        <p className="text-xs text-red-700 mb-3">For urgent technical issues, critical business decisions, or immediate assistance</p>
        <div className="flex gap-2">
          <Link href="/admin-consulting-agents?agent=zara&priority=urgent">
            <Button size="sm" variant="destructive" className="text-xs">
              ⚡ Technical Emergency
            </Button>
          </Link>
          <Link href="/admin-consulting-agents?agent=elena&priority=urgent">
            <Button size="sm" variant="destructive" className="text-xs">
              👑 Strategic Emergency
            </Button>
          </Link>
          <Link href="/admin-consulting-agents?agent=quinn&priority=urgent">
            <Button size="sm" variant="destructive" className="text-xs">
              🔍 Quality Emergency
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}