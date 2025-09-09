import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, TrendingDown, DollarSign, Users, Calendar, Target } from 'lucide-react';

interface RevenueData {
  monthlyRevenue: number;
  previousMonthRevenue: number;
  yearlyRevenue: number;
  averageRevenuePerUser: number;
  monthlyGrowthRate: number;
  churnRate: number;
  newCustomerRevenue: number;
  recurringRevenue: number;
}

interface RevenueBreakdown {
  subscriptions: number;
  retraining: number;
  oneTime: number;
}

export function RevenueAnalyticsDashboard() {
  const [timeframe, setTimeframe] = useState<'month' | 'quarter' | 'year'>('month');

  const { data: revenueData, isLoading } = useQuery({
    queryKey: ['/api/admin/revenue-analytics', timeframe],
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  const { data: revenueBreakdown } = useQuery({
    queryKey: ['/api/admin/revenue-breakdown', timeframe],
    refetchInterval: 300000,
  });

  const { data: revenueChart } = useQuery({
    queryKey: ['/api/admin/revenue-chart', timeframe],
    refetchInterval: 300000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-100 animate-pulse"></div>
        ))}
      </div>
    );
  }

  const revenue = revenueData as RevenueData;
  const breakdown = revenueBreakdown as RevenueBreakdown;

  return (
    <div className="space-y-8">
      {/* Time Frame Selector */}
      <div className="flex justify-center">
        <div className="flex border border-gray-300">
          {[
            { id: 'month', label: 'Month' },
            { id: 'quarter', label: 'Quarter' },
            { id: 'year', label: 'Year' }
          ].map((period) => (
            <button
              key={period.id}
              onClick={() => setTimeframe(period.id as any)}
              className={`px-6 py-3 text-xs uppercase tracking-[0.3em] transition-colors ${
                timeframe === period.id
                  ? 'bg-black text-white'
                  : 'hover:bg-gray-50'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Key Revenue Metrics */}
      <div className="grid grid-cols-4 gap-6">
        <div className="border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <DollarSign size={24} className="text-green-600" />
            <div className={`flex items-center gap-1 text-sm ${
              revenue?.monthlyGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {revenue?.monthlyGrowthRate >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {Math.abs(revenue?.monthlyGrowthRate || 0)}%
            </div>
          </div>
          <div className="text-3xl font-serif font-light mb-2">
            €{revenue?.monthlyRevenue?.toLocaleString() || 0}
          </div>
          <div className="text-xs uppercase tracking-[0.3em] text-gray-600">
            Monthly Revenue
          </div>
        </div>

        <div className="border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <Users size={24} className="text-blue-600" />
          </div>
          <div className="text-3xl font-serif font-light mb-2">
            €{revenue?.averageRevenuePerUser?.toFixed(0) || 0}
          </div>
          <div className="text-xs uppercase tracking-[0.3em] text-gray-600">
            Avg Revenue Per User
          </div>
        </div>

        <div className="border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <Calendar size={24} className="text-gray-600" />
          </div>
          <div className="text-3xl font-serif font-light mb-2">
            €{revenue?.yearlyRevenue?.toLocaleString() || 0}
          </div>
          <div className="text-xs uppercase tracking-[0.3em] text-gray-600">
            Annual Revenue Run Rate
          </div>
        </div>

        <div className="border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <Target size={24} className="text-orange-600" />
          </div>
          <div className="text-3xl font-serif font-light mb-2">
            {revenue?.churnRate || 0}%
          </div>
          <div className="text-xs uppercase tracking-[0.3em] text-gray-600">
            Monthly Churn Rate
          </div>
        </div>
      </div>

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-2 gap-8">
        <div className="border border-gray-200 p-6">
          <h3 className="font-serif text-2xl font-light mb-6 uppercase tracking-wide">
            Revenue Sources
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <div className="font-medium">Studio Subscriptions</div>
                <div className="text-sm text-gray-600">€47/month plans</div>
              </div>
              <div className="text-right">
                <div className="text-xl font-serif">€{breakdown?.subscriptions?.toLocaleString() || 0}</div>
                <div className="text-xs text-gray-500">
                  {breakdown ? Math.round((breakdown.subscriptions / (breakdown.subscriptions + breakdown.retraining + breakdown.oneTime)) * 100) : 0}%
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <div className="font-medium">Retraining Packages</div>
                <div className="text-sm text-gray-600">One-time retraining</div>
              </div>
              <div className="text-right">
                <div className="text-xl font-serif">€{breakdown?.retraining?.toLocaleString() || 0}</div>
                <div className="text-xs text-gray-500">
                  {breakdown ? Math.round((breakdown.retraining / (breakdown.subscriptions + breakdown.retraining + breakdown.oneTime)) * 100) : 0}%
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <div className="font-medium">Other Services</div>
                <div className="text-sm text-gray-600">Consulting & extras</div>
              </div>
              <div className="text-right">
                <div className="text-xl font-serif">€{breakdown?.oneTime?.toLocaleString() || 0}</div>
                <div className="text-xs text-gray-500">
                  {breakdown ? Math.round((breakdown.oneTime / (breakdown.subscriptions + breakdown.retraining + breakdown.oneTime)) * 100) : 0}%
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-gray-200 p-6">
          <h3 className="font-serif text-2xl font-light mb-6 uppercase tracking-wide">
            Financial Health
          </h3>
          
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Monthly Recurring Revenue</span>
                <span className="font-medium">€{revenue?.recurringRevenue?.toLocaleString() || 0}</span>
              </div>
              <div className="w-full bg-gray-200 h-2">
                <div 
                  className="h-2 bg-green-600" 
                  style={{ width: `${Math.min(100, (revenue?.recurringRevenue || 0) / 10000 * 100)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">New Customer Revenue</span>
                <span className="font-medium">€{revenue?.newCustomerRevenue?.toLocaleString() || 0}</span>
              </div>
              <div className="w-full bg-gray-200 h-2">
                <div 
                  className="h-2 bg-blue-600" 
                  style={{ width: `${Math.min(100, (revenue?.newCustomerRevenue || 0) / 5000 * 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <div className="text-sm text-gray-600 mb-2">Growth Trajectory</div>
              <div className={`text-lg font-serif ${
                revenue?.monthlyGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {revenue?.monthlyGrowthRate >= 0 ? '+' : ''}{revenue?.monthlyGrowthRate || 0}% 
                <span className="text-sm text-gray-600 ml-2">month-over-month</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Targets */}
      <div className="border border-gray-200 p-6">
        <h3 className="font-serif text-2xl font-light mb-6 uppercase tracking-wide">
          Revenue Targets & Projections
        </h3>
        
        <div className="grid grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl font-serif font-light mb-2">€25K</div>
            <div className="text-xs uppercase tracking-[0.3em] text-gray-600 mb-4">Monthly Target</div>
            <div className="w-full bg-gray-200 h-3">
              <div 
                className="h-3 bg-black" 
                style={{ width: `${Math.min(100, (revenue?.monthlyRevenue || 0) / 25000 * 100)}%` }}
              ></div>
            </div>
            <div className="text-sm text-gray-600 mt-2">
              {Math.round((revenue?.monthlyRevenue || 0) / 25000 * 100)}% achieved
            </div>
          </div>

          <div className="text-center">
            <div className="text-4xl font-serif font-light mb-2">€300K</div>
            <div className="text-xs uppercase tracking-[0.3em] text-gray-600 mb-4">Annual Target</div>
            <div className="w-full bg-gray-200 h-3">
              <div 
                className="h-3 bg-black" 
                style={{ width: `${Math.min(100, (revenue?.yearlyRevenue || 0) / 300000 * 100)}%` }}
              ></div>
            </div>
            <div className="text-sm text-gray-600 mt-2">
              {Math.round((revenue?.yearlyRevenue || 0) / 300000 * 100)}% projected
            </div>
          </div>

          <div className="text-center">
            <div className="text-4xl font-serif font-light mb-2">532</div>
            <div className="text-xs uppercase tracking-[0.3em] text-gray-600 mb-4">Target Customers</div>
            <div className="w-full bg-gray-200 h-3">
              <div className="h-3 bg-black" style={{ width: '68%' }}></div>
            </div>
            <div className="text-sm text-gray-600 mt-2">68% to target</div>
          </div>
        </div>
      </div>
    </div>
  );
}