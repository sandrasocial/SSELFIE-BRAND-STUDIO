import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, Mail, Phone, CreditCard, TrendingUp, UserX } from 'lucide-react';

interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  plan: string;
  monthlyGenerationLimit: number;
  generationsUsedThisMonth: number;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  createdAt: string;
  lastActiveAt?: string;
  totalSpent: number;
  status: 'active' | 'inactive' | 'cancelled';
}

export function CustomerManagementDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'cancelled'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'spent' | 'usage'>('created');

  const { data: customers, isLoading } = useQuery({
    queryKey: ['/api/admin/customers', { search: searchTerm, status: filterStatus, sort: sortBy }],
    refetchInterval: 60000, // Refresh every minute
  });

  const { data: customerInsights } = useQuery({
    queryKey: ['/api/admin/customer-insights'],
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-100 animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Customer Insights Grid */}
      <div className="grid grid-cols-4 gap-6">
        <div className="border border-gray-200 p-6 text-center">
          <div className="text-3xl font-serif font-light mb-2">
            {(customerInsights as any)?.newThisMonth || 0}
          </div>
          <div className="text-xs uppercase tracking-[0.3em] text-gray-600">
            New This Month
          </div>
        </div>
        <div className="border border-gray-200 p-6 text-center">
          <div className="text-3xl font-serif font-light mb-2 text-green-600">
            €{(customerInsights as any)?.averageLifetimeValue || 0}
          </div>
          <div className="text-xs uppercase tracking-[0.3em] text-gray-600">
            Avg Lifetime Value
          </div>
        </div>
        <div className="border border-gray-200 p-6 text-center">
          <div className="text-3xl font-serif font-light mb-2">
            {customerInsights?.averageGenerationsPerMonth || 0}
          </div>
          <div className="text-xs uppercase tracking-[0.3em] text-gray-600">
            Avg Monthly Usage
          </div>
        </div>
        <div className="border border-gray-200 p-6 text-center">
          <div className="text-3xl font-serif font-light mb-2 text-red-600">
            {customerInsights?.churnRate || 0}%
          </div>
          <div className="text-xs uppercase tracking-[0.3em] text-gray-600">
            Churn Rate
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex items-center justify-between gap-6 p-6 bg-gray-50">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 text-sm focus:outline-none focus:border-black"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 text-sm focus:outline-none focus:border-black"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 text-sm focus:outline-none focus:border-black"
          >
            <option value="created">Sort by Created</option>
            <option value="name">Sort by Name</option>
            <option value="spent">Sort by Spent</option>
            <option value="usage">Sort by Usage</option>
          </select>
        </div>
      </div>

      {/* Customer List */}
      <div className="space-y-4">
        {customers?.map((customer: Customer) => (
          <div key={customer.id} className="border border-gray-200 hover:border-black transition-colors">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="font-medium text-lg">
                      {customer.firstName} {customer.lastName}
                    </h3>
                    <p className="text-gray-600 text-sm">{customer.email}</p>
                  </div>
                  
                  <div className={`px-3 py-1 text-xs uppercase tracking-wide ${
                    customer.status === 'active' ? 'bg-green-100 text-green-700' :
                    customer.status === 'inactive' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {customer.status}
                  </div>
                  
                  <div className="px-3 py-1 bg-gray-100 text-gray-700 text-xs uppercase tracking-wide">
                    {customer.plan}
                  </div>
                </div>

                <div className="flex items-center gap-6 text-right">
                  <div>
                    <div className="text-lg font-serif">€{customer.totalSpent}</div>
                    <div className="text-xs text-gray-500">Total Spent</div>
                  </div>
                  
                  <div>
                    <div className="text-lg font-serif">
                      {customer.generationsUsedThisMonth}/{customer.monthlyGenerationLimit === -1 ? '∞' : customer.monthlyGenerationLimit}
                    </div>
                    <div className="text-xs text-gray-500">Monthly Usage</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-600">
                      Joined {new Date(customer.createdAt).toLocaleDateString()}
                    </div>
                    {customer.lastActiveAt && (
                      <div className="text-xs text-gray-500">
                        Last active {new Date(customer.lastActiveAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Customer Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-wide border border-gray-300 hover:bg-gray-50 transition-colors">
                    <Mail size={14} />
                    Email
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-wide border border-gray-300 hover:bg-gray-50 transition-colors">
                    <CreditCard size={14} />
                    Billing
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-wide border border-gray-300 hover:bg-gray-50 transition-colors">
                    <TrendingUp size={14} />
                    Analytics
                  </button>
                </div>
                
                <div className="flex gap-3">
                  <button className="px-4 py-2 text-xs uppercase tracking-wide bg-black text-white hover:bg-gray-800 transition-colors">
                    View Profile
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-wide text-red-600 border border-red-200 hover:bg-red-50 transition-colors">
                    <UserX size={14} />
                    Suspend
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {(!customers || customers.length === 0) && (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">No customers found</div>
          <div className="text-sm text-gray-400">
            Try adjusting your search criteria or filters
          </div>
        </div>
      )}
    </div>
  );
}