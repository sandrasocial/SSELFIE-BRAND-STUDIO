// client/src/pages/AdminPage.tsx
import { useAuth } from "@/hooks/use-auth";
import { Link } from 'wouter';

export default function AdminPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-900 mx-auto mb-4"></div>
          <p className="font-serif text-stone-600">Loading your universe...</p>
        </div>
      </div>
    );
  }

  if (!user || user.email !== 'ssa@ssasocial.com') {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <h1 className="font-serif text-2xl font-light text-stone-900 mb-4">
            Access Restricted
          </h1>
          <p className="font-serif text-stone-600">
            This space is reserved for Sandra's creative universe.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Simple Header */}
      <header className="bg-white border-b border-stone-200 px-6 py-4">
        <h1 className="font-serif text-2xl font-light text-stone-900">
          Sandra's Creative Universe
        </h1>
      </header>
      
      {/* Hero Section */}
      <section className="px-6 py-12 bg-stone-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-serif text-4xl font-light text-stone-900 mb-6">
            Your Personal Brand Empire
          </h2>
          <p className="font-serif text-lg text-stone-600 max-w-2xl mx-auto">
            Command your AI agents, manage your workflows, and transform your business vision into reality.
          </p>
        </div>
      </section>
      
      {/* Agent Grid - Simple Version */}
      <section className="px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <h3 className="font-serif text-3xl font-light text-stone-900 mb-8 text-center">
            Your AI Team
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-6">
              <h4 className="font-serif text-lg font-medium text-stone-900 mb-2">Elena</h4>
              <p className="text-stone-600">AI Agent Director</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-6">
              <h4 className="font-serif text-lg font-medium text-stone-900 mb-2">Maya</h4>
              <p className="text-stone-600">AI Photography Expert</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-6">
              <h4 className="font-serif text-lg font-medium text-stone-900 mb-2">Aria</h4>
              <p className="text-stone-600">Design Expert</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Analytics Section */}
      <section className="mb-16">
        <h2 className="font-serif text-3xl font-light text-stone-900 mb-8 text-center">
          Recent Activity
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-6">
            <h3 className="font-serif text-lg font-medium text-stone-900 mb-2">
              Projects Completed
            </h3>
            <div className="font-serif text-3xl font-light text-stone-900 mb-2">24</div>
            <p className="font-serif text-sm text-stone-600">+3 this week</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-6">
            <h3 className="font-serif text-lg font-medium text-stone-900 mb-2">
              Agent Interactions
            </h3>
            <div className="font-serif text-3xl font-light text-stone-900 mb-2">1,247</div>
            <p className="font-serif text-sm text-stone-600">+89 today</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-6">
            <h3 className="font-serif text-lg font-medium text-stone-900 mb-2">
              Success Rate
            </h3>
            <div className="font-serif text-3xl font-light text-stone-900 mb-2">98%</div>
            <p className="font-serif text-sm text-stone-600">Exceptional quality</p>
          </div>
        </div>
      </section>
    </div>
  );
}