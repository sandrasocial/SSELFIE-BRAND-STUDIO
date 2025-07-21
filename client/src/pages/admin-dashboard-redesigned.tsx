import React, { useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { ChevronRight, Settings, Users, BarChart3, Sparkles } from 'lucide-react';

// Agent interface for luxury card system
interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  status: 'active' | 'idle' | 'working';
  icon: string;
  color: string;
}

const luxuryAgents: Agent[] = [
  {
    id: 'rachel',
    name: 'Rachel',
    role: 'Brand Voice Architect',
    description: 'Crafting authentic Sandra voice throughout every touchpoint',
    status: 'active',
    icon: '✍️',
    color: 'from-rose-500 to-pink-600'
  },
  {
    id: 'aria',
    name: 'Aria',
    role: 'Editorial Design Director',
    description: 'Creating magazine-quality visual experiences',
    status: 'working',
    icon: '🎨',
    color: 'from-purple-500 to-indigo-600'
  },
  {
    id: 'zara',
    name: 'Zara',
    role: 'Technical Excellence Lead',
    description: 'Building luxury digital experiences with flawless code',
    status: 'active',
    icon: '⚡',
    color: 'from-emerald-500 to-teal-600'
  }
];

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<string>('overview');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50">
      {/* Luxury Navigation Header */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center space-x-3">
                <Sparkles className="h-8 w-8 text-indigo-600" />
                <span className="font-serif text-2xl font-bold text-gray-900">
                  SSELFIE Studio
                </span>
              </Link>
              
              <div className="hidden md:flex items-center space-x-6">
                {['Overview', 'Agents', 'Analytics', 'Settings'].map((item) => (
                  <button
                    key={item}
                    onClick={() => setActiveSection(item.toLowerCase())}
                    className={`font-serif text-sm font-medium transition-all duration-200 px-3 py-2 rounded-lg ${
                      activeSection === item.toLowerCase()
                        ? 'text-indigo-600 bg-indigo-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Settings className="h-5 w-5" />
              </button>
              <div className="h-8 w-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"></div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Full Bleed Magazine Style */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-95"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="font-serif text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              SSELFIE Studio
              <span className="block text-3xl md:text-4xl font-light text-white/90 mt-2">
                Admin Command Center
              </span>
            </h1>
            
            <p className="font-serif text-xl text-white/80 max-w-3xl mx-auto leading-relaxed mb-8">
              Where luxury meets technology. Orchestrating AI agents to create 
              extraordinary digital experiences with the sophistication of high fashion.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <button className="group bg-white text-gray-900 font-serif font-semibold px-8 py-4 rounded-xl hover:bg-gray-50 transition-all duration-200 flex items-center space-x-2">
                <span>View Live Studio</span>
                <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button className="font-serif font-medium text-white border-2 border-white/30 px-8 py-4 rounded-xl hover:bg-white/10 transition-all duration-200">
                System Analytics
              </button>
            </div>
          </motion.div>
        </div>
        
        {/* Elegant bottom curve */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="w-full h-12 text-white">
            <path fill="currentColor" d="M0,120V60c240-40,480-40,720,0s480,40,720,0V120z"></path>
          </svg>
        </div>
      </section>

      {/* Agent Cards Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center mb-16"
          >
            <h2 className="font-serif text-4xl font-bold text-gray-900 mb-4">
              Meet Your AI Dream Team
            </h2>
            <p className="font-serif text-lg text-gray-600 max-w-2xl mx-auto">
              Three specialized AI agents working in perfect harmony to deliver 
              luxury experiences that rival the world's finest brands.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {luxuryAgents.map((agent, index) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
              >
                {/* Status indicator */}
                <div className="absolute top-4 right-4">
                  <div className={`w-3 h-3 rounded-full ${
                    agent.status === 'active' ? 'bg-green-400' :
                    agent.status === 'working' ? 'bg-amber-400' : 'bg-gray-300'
                  } animate-pulse`}></div>
                </div>

                {/* Gradient header */}
                <div className={`h-32 bg-gradient-to-r ${agent.color} relative`}>
                  <div className="absolute inset-0 bg-black/10"></div>
                  <div className="absolute bottom-4 left-6">
                    <div className="text-4xl mb-2">{agent.icon}</div>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="font-serif text-2xl font-bold text-gray-900 mb-2">
                    {agent.name}
                  </h3>
                  
                  <p className="font-serif text-sm font-medium text-indigo-600 mb-3 uppercase tracking-wider">
                    {agent.role}
                  </p>
                  
                  <p className="font-serif text-gray-600 leading-relaxed mb-6">
                    {agent.description}
                  </p>

                  <button className="group w-full bg-gray-50 hover:bg-gray-100 text-gray-900 font-serif font-medium py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-between">
                    <span>View Details</span>
                    <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Analytics Preview Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-serif text-4xl font-bold text-gray-900 mb-6">
                Performance Analytics
              </h2>
              
              <p className="font-serif text-lg text-gray-600 mb-8 leading-relaxed">
                Track your AI agents' performance with luxury-grade analytics. 
                Monitor response times, user satisfaction, and system efficiency 
                with the precision of Swiss clockwork.
              </p>

              <div className="space-y-4">
                {[
                  { label: 'Agent Response Time', value: '0.3s avg', color: 'text-green-600' },
                  { label: 'User Satisfaction', value: '98.5%', color: 'text-indigo-600' },
                  { label: 'System Uptime', value: '99.9%', color: 'text-purple-600' }
                ].map((stat, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100">
                    <span className="font-serif font-medium text-gray-900">{stat.label}</span>
                    <span className={`font-serif font-bold text-lg ${stat.color}`}>{stat.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100"
            >
              <div className="flex items-center space-x-3 mb-6">
                <BarChart3 className="h-8 w-8 text-indigo-600" />
                <h3 className="font-serif text-2xl font-bold text-gray-900">Live Metrics</h3>
              </div>
              
              {/* Placeholder for chart */}
              <div className="h-64 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl flex items-center justify-center border border-indigo-100">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-indigo-400 mx-auto mb-4" />
                  <p className="font-serif text-indigo-600 font-medium">
                    Real-time analytics visualization
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}