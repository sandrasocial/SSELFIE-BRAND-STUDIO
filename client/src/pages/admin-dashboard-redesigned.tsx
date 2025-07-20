import React, { useState } from 'react';
import { Link } from 'wouter';
import { Plus, Globe, Edit, Trash2, Eye } from 'lucide-react';

interface Website {
  id: string;
  name: string;
  domain: string;
  status: 'draft' | 'published';
  lastModified: string;
  preview: string;
}

export default function BuildDashboard() {
  const [websites] = useState<Website[]>([
    {
      id: '1',
      name: 'My Portfolio',
      domain: 'myportfolio.sselfie.com',
      status: 'published',
      lastModified: '2024-01-15',
      preview: '/api/placeholder/300/200'
    },
    {
      id: '2',
      name: 'Creative Studio',
      domain: 'creative.sselfie.com',
      status: 'draft',
      lastModified: '2024-01-14',
      preview: '/api/placeholder/300/200'
    }
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-serif text-black mb-2">BUILD</h1>
            <p className="text-gray-600">Create and manage your websites with AI assistance</p>
          </div>
          <Link href="/build/new">
            <button className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2">
              <Plus size={20} />
              New Website
            </button>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Globe className="text-blue-600" size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-black">{websites.length}</h3>
                <p className="text-gray-600">Total Websites</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Eye className="text-green-600" size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-black">
                  {websites.filter(w => w.status === 'published').length}
                </h3>
                <p className="text-gray-600">Published</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Edit className="text-orange-600" size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-black">
                  {websites.filter(w => w.status === 'draft').length}
                </h3>
                <p className="text-gray-600">Drafts</p>
              </div>
            </div>
          </div>
        </div>

        {/* Websites Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {websites.map((website) => (
            <div key={website.id} className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-video bg-gray-100 relative">
                <img 
                  src={website.preview} 
                  alt={website.name}
                  className="w-full h-full object-cover"
                />
                <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${
                  website.status === 'published' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-orange-100 text-orange-700'
                }`}>
                  {website.status}
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-lg font-semibold text-black mb-2">{website.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{website.domain}</p>
                <p className="text-gray-500 text-xs mb-4">Last modified: {website.lastModified}</p>
                
                <div className="flex gap-2">
                  <Link href={`/build/edit/${website.id}`}>
                    <button className="flex-1 bg-black text-white py-2 px-3 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 text-sm">
                      <Edit size={16} />
                      Edit
                    </button>
                  </Link>
                  <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <Eye size={16} className="text-gray-600" />
                  </button>
                  <button className="p-2 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                    <Trash2 size={16} className="text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {/* Create New Card */}
          <Link href="/build/new">
            <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors cursor-pointer aspect-[4/3] flex items-center justify-center">
              <div className="text-center">
                <Plus size={48} className="text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">Create New Website</h3>
                <p className="text-gray-500 text-sm">Start building with AI assistance</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}