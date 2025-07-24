import { Link } from "wouter";
import { useAuth } from "../hooks/useAuth";

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Luxury Editorial Header */}
      <header className="py-16 px-8 border-b border-zinc-800">
        <h1 className="font-times text-4xl tracking-[0.2em] text-center font-light uppercase">
          Admin Studio
        </h1>
        <p className="text-zinc-400 text-center mt-4 tracking-wider font-light">
          {user?.name || "Administrator"}
        </p>
      </header>

      {/* Editorial Grid Layout */}
      <main className="max-w-7xl mx-auto px-8 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {/* Users Management Card */}
        <Link href="/admin/users" className="group">
          <div className="relative bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden h-96 transition-all duration-500 hover:border-zinc-700">
            <div className="absolute inset-0 bg-[url('/images/users-management.jpg')] bg-cover bg-center opacity-50 group-hover:opacity-40 transition-opacity duration-500" />
            <div className="absolute inset-0 flex items-center justify-center">
              <h2 className="font-times text-2xl tracking-[0.3em] uppercase text-center">
                Users
              </h2>
            </div>
          </div>
        </Link>

        {/* Content Management Card */}
        <Link href="/admin/content" className="group">
          <div className="relative bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden h-96 transition-all duration-500 hover:border-zinc-700">
            <div className="absolute inset-0 bg-[url('/images/content-management.jpg')] bg-cover bg-center opacity-50 group-hover:opacity-40 transition-opacity duration-500" />
            <div className="absolute inset-0 flex items-center justify-center">
              <h2 className="font-times text-2xl tracking-[0.3em] uppercase text-center">
                Content
              </h2>
            </div>
          </div>
        </Link>

        {/* Analytics Card */}
        <Link href="/admin/analytics" className="group">
          <div className="relative bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden h-96 transition-all duration-500 hover:border-zinc-700">
            <div className="absolute inset-0 bg-[url('/images/analytics-dashboard.jpg')] bg-cover bg-center opacity-50 group-hover:opacity-40 transition-opacity duration-500" />
            <div className="absolute inset-0 flex items-center justify-center">
              <h2 className="font-times text-2xl tracking-[0.3em] uppercase text-center">
                Analytics
              </h2>
            </div>
          </div>
        </Link>

        {/* Settings Card */}
        <Link href="/admin/settings" className="group">
          <div className="relative bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden h-96 transition-all duration-500 hover:border-zinc-700">
            <div className="absolute inset-0 bg-[url('/images/settings-dashboard.jpg')] bg-cover bg-center opacity-50 group-hover:opacity-40 transition-opacity duration-500" />
            <div className="absolute inset-0 flex items-center justify-center">
              <h2 className="font-times text-2xl tracking-[0.3em] uppercase text-center">
                Settings
              </h2>
            </div>
          </div>
        </Link>

        {/* Gallery Management Card */}
        <Link href="/admin/gallery" className="group">
          <div className="relative bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden h-96 transition-all duration-500 hover:border-zinc-700">
            <div className="absolute inset-0 bg-[url('/images/gallery-management.jpg')] bg-cover bg-center opacity-50 group-hover:opacity-40 transition-opacity duration-500" />
            <div className="absolute inset-0 flex items-center justify-center">
              <h2 className="font-times text-2xl tracking-[0.3em] uppercase text-center">
                Gallery
              </h2>
            </div>
          </div>
        </Link>

        {/* Workflows Card */}
        <Link href="/admin/workflows" className="group">
          <div className="relative bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden h-96 transition-all duration-500 hover:border-zinc-700">
            <div className="absolute inset-0 bg-[url('/images/workflow-dashboard.jpg')] bg-cover bg-center opacity-50 group-hover:opacity-40 transition-opacity duration-500" />
            <div className="absolute inset-0 flex items-center justify-center">
              <h2 className="font-times text-2xl tracking-[0.3em] uppercase text-center">
                Workflows
              </h2>
            </div>
          </div>
        </Link>
      </main>

      {/* Luxury Footer */}
      <footer className="border-t border-zinc-800 py-8 px-8">
        <p className="text-zinc-500 text-center font-light tracking-wider">
          SSELFIE Studio Administration
        </p>
      </footer>
    </div>
  );
}