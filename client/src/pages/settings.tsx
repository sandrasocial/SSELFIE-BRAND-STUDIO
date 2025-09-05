import React, { useState, useEffect } from 'react';
import { MemberNavigation } from '../components/member-navigation';
import { useAuth } from '../hooks/use-auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import { useToast } from '../hooks/use-toast';

interface Subscription {
  id: string;
  status: string;
  current_period_end: number;
  cancel_at: number | null;
  canceled_at: number | null;
  plan: {
    amount: number;
    currency: string;
    interval: string;
  };
}

interface Invoice {
  id: string;
  amount_paid: number;
  currency: string;
  status: string;
  created: number;
  hosted_invoice_url: string;
  invoice_pdf: string;
}

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Fetch subscription data
  const { data: subscription, isLoading: subscriptionLoading } = useQuery({
    queryKey: ['/api/subscription'],
    enabled: !!user,
  });

  // Fetch invoices
  const { data: invoices = [], isLoading: invoicesLoading } = useQuery({
    queryKey: ['/api/invoices'],
    enabled: !!user,
  });

  // Cancel subscription mutation
  const cancelSubscription = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/subscription/cancel', 'POST');
    },
    onSuccess: () => {
      toast({
        title: "Subscription Cancelled",
        description: "Your subscription has been cancelled. You'll continue to have access until your current period ends.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/subscription'] });
      setShowCancelConfirm(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Unable to cancel subscription. Please contact support.",
      });
    },
  });

  // Reactivate subscription mutation
  const reactivateSubscription = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/subscription/reactivate', 'POST');
    },
    onSuccess: () => {
      toast({
        title: "Subscription Reactivated",
        description: "Your subscription has been reactivated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/subscription'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Unable to reactivate subscription. Please contact support.",
      });
    },
  });

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  // SEO Meta tags setup
  useEffect(() => {
    document.title = "Account Settings - SSELFIE Studio";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Manage your SSELFIE Studio subscription, billing, and account preferences. Cancel anytime, view invoices, and get support.');
    }
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <MemberNavigation transparent={false} />
      
      {/* Hero Section */}
      <section className="bg-black text-white py-24 mt-20">
        <div className="max-w-5xl mx-auto px-8 text-center">
          <div className="text-xs tracking-[0.4em] uppercase text-white/60 mb-8 font-light">
            Account Management
          </div>
          <h1 className="font-serif text-[clamp(3rem,8vw,6rem)] leading-[0.9] font-extralight tracking-[0.2em] uppercase mb-8">
            Settings
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto font-light">
            Manage your subscription, billing, and account preferences
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-8 py-24">
        
        {/* Account Information */}
        <section className="mb-24">
          <div className="mb-12">
            <div className="text-xs tracking-[0.4em] uppercase text-gray-500 mb-4">
              Account Information
            </div>
            <h2 className="font-serif text-3xl font-light text-black mb-8">
              Profile Details
            </h2>
          </div>
          
          <div className="bg-gray-50 p-8 border border-gray-200">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium text-black">Email Address</div>
                  <div className="text-gray-600">{user?.email}</div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium text-black">Name</div>
                  <div className="text-gray-600">{user?.firstName} {user?.lastName}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Subscription Management */}
        <section className="mb-24">
          <div className="mb-12">
            <div className="text-xs tracking-[0.4em] uppercase text-gray-500 mb-4">
              Subscription
            </div>
            <h2 className="font-serif text-3xl font-light text-black mb-8">
              Billing & Subscription
            </h2>
          </div>

          {subscriptionLoading ? (
            <div className="bg-gray-50 p-8 border border-gray-200 text-center">
              <div className="animate-spin w-6 h-6 border-2 border-black border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Loading subscription details...</p>
            </div>
          ) : subscription as Subscription ? (
            <div className="bg-gray-50 p-8 border border-gray-200">
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-black mb-2">SSELFIE Studio</div>
                    <div className="text-sm text-gray-600">
                      {formatAmount((subscription as Subscription).plan?.amount || 4700, (subscription as Subscription).plan?.currency || 'eur')} per {(subscription as Subscription).plan?.interval || 'month'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`inline-block px-3 py-1 text-xs uppercase tracking-wider rounded-sm ${
                      (subscription as Subscription).status === 'active' ? 'bg-green-100 text-green-800' :
                      (subscription as Subscription).status === 'canceled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {(subscription as Subscription).status}
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-300 pt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <div className="font-medium text-black mb-1">Current Period Ends</div>
                      <div className="text-gray-600">{formatDate((subscription as Subscription).current_period_end)}</div>
                    </div>
                    {(subscription as Subscription).cancel_at && (
                      <div>
                        <div className="font-medium text-black mb-1">Will Cancel On</div>
                        <div className="text-gray-600">{formatDate((subscription as Subscription).cancel_at)}</div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-300 pt-6 space-y-4">
                  {(subscription as Subscription).status === 'active' && !(subscription as Subscription).cancel_at && (
                    <button
                      onClick={() => setShowCancelConfirm(true)}
                      className="bg-transparent border border-red-600 text-red-600 px-6 py-3 text-xs uppercase tracking-wider hover:bg-red-600 hover:text-white transition-colors"
                    >
                      Cancel Subscription
                    </button>
                  )}
                  
                  {(subscription as Subscription).cancel_at && (subscription as Subscription).status === 'active' && (
                    <button
                      onClick={() => reactivateSubscription.mutate()}
                      disabled={reactivateSubscription.isPending}
                      className="bg-black text-white px-6 py-3 text-xs uppercase tracking-wider hover:bg-gray-800 disabled:opacity-50 transition-colors"
                    >
                      {reactivateSubscription.isPending ? 'Processing...' : 'Reactivate Subscription'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 p-8 border border-gray-200 text-center">
              <p className="text-gray-600 mb-4">No active subscription found</p>
              <a
                href="/pricing"
                className="bg-black text-white px-6 py-3 text-xs uppercase tracking-wider hover:bg-gray-800 transition-colors inline-block"
              >
                View Plans
              </a>
            </div>
          )}
        </section>

        {/* Billing History */}
        <section className="mb-24">
          <div className="mb-12">
            <div className="text-xs tracking-[0.4em] uppercase text-gray-500 mb-4">
              Billing History
            </div>
            <h2 className="font-serif text-3xl font-light text-black mb-8">
              Invoices & Receipts
            </h2>
          </div>

          {invoicesLoading ? (
            <div className="bg-gray-50 p-8 border border-gray-200 text-center">
              <div className="animate-spin w-6 h-6 border-2 border-black border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Loading billing history...</p>
            </div>
          ) : (invoices as Invoice[]).length > 0 ? (
            <div className="bg-gray-50 border border-gray-200">
              <div className="hidden sm:grid sm:grid-cols-5 gap-4 p-6 border-b border-gray-300 text-xs uppercase tracking-wider text-gray-500">
                <div>Date</div>
                <div>Amount</div>
                <div>Status</div>
                <div>Invoice</div>
                <div>Receipt</div>
              </div>
              {(invoices as Invoice[]).map((invoice: Invoice) => (
                <div key={invoice.id} className="grid grid-cols-1 sm:grid-cols-5 gap-4 p-6 border-b border-gray-200 last:border-b-0">
                  <div className="sm:hidden font-medium text-black mb-2">Invoice</div>
                  <div>
                    <div className="sm:hidden text-xs text-gray-500 mb-1">Date</div>
                    <div className="text-gray-600">{formatDate(invoice.created)}</div>
                  </div>
                  <div>
                    <div className="sm:hidden text-xs text-gray-500 mb-1">Amount</div>
                    <div className="font-medium text-black">{formatAmount(invoice.amount_paid, invoice.currency)}</div>
                  </div>
                  <div>
                    <div className="sm:hidden text-xs text-gray-500 mb-1">Status</div>
                    <div className={`inline-block px-2 py-1 text-xs uppercase tracking-wider rounded-sm ${
                      invoice.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {invoice.status}
                    </div>
                  </div>
                  <div>
                    <div className="sm:hidden text-xs text-gray-500 mb-1">Invoice</div>
                    <a
                      href={invoice.hosted_invoice_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-black hover:opacity-60 transition-opacity text-xs uppercase tracking-wider underline"
                    >
                      View Invoice
                    </a>
                  </div>
                  <div>
                    <div className="sm:hidden text-xs text-gray-500 mb-1">Receipt</div>
                    <a
                      href={invoice.invoice_pdf}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-black hover:opacity-60 transition-opacity text-xs uppercase tracking-wider underline"
                    >
                      Download PDF
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 p-8 border border-gray-200 text-center">
              <p className="text-gray-600">No billing history available</p>
            </div>
          )}
        </section>

        {/* Support */}
        <section>
          <div className="mb-12">
            <div className="text-xs tracking-[0.4em] uppercase text-gray-500 mb-4">
              Support
            </div>
            <h2 className="font-serif text-3xl font-light text-black mb-8">
              Need Help?
            </h2>
          </div>
          
          <div className="bg-gray-50 p-8 border border-gray-200 text-center">
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Have questions about your subscription, need technical support, or want to provide feedback? 
              We're here to help you get the most out of SSELFIE Studio.
            </p>
            <a
              href="mailto:hello@sselfie.ai"
              className="bg-black text-white px-8 py-4 text-xs uppercase tracking-wider hover:bg-gray-800 transition-colors inline-block"
            >
              Contact Support
            </a>
          </div>
        </section>
      </main>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-md w-full p-8">
            <h3 className="font-serif text-2xl font-light text-black mb-4">
              Cancel Subscription?
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to cancel your subscription? You'll continue to have access until {subscription && formatDate((subscription as Subscription).current_period_end)}.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-3 text-xs uppercase tracking-wider hover:bg-gray-50 transition-colors"
              >
                Keep Subscription
              </button>
              <button
                onClick={() => cancelSubscription.mutate()}
                disabled={cancelSubscription.isPending}
                className="flex-1 bg-red-600 text-white px-4 py-3 text-xs uppercase tracking-wider hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {cancelSubscription.isPending ? 'Processing...' : 'Cancel Subscription'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}