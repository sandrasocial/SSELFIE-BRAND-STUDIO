import { useUser } from "@/hooks/use-user";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Users, DollarSign, TrendingUp, Sparkles } from "lucide-react";

export default function AdminDashboard() {
  const { user } = useUser();

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-serif text-white mb-4">Access Denied</h1>
          <p className="text-gray-300">Administrative privileges required.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Full-Bleed Hero Section - Editorial Design */}
      <div className="relative h-[60vh] bg-gradient-to-br from-black via-gray-900 to-black overflow-hidden">
        {/* Luxury Grid Pattern Overlay */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }}
        />
        
        {/* Hero Content */}
        <div className="relative z-10 h-full flex items-center justify-center px-8">
          <div className="text-center max-w-4xl">
            <div className="mb-6">
              <Sparkles className="w-16 h-16 text-white mx-auto mb-4 opacity-90" />
            </div>
            
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-serif text-white mb-6 tracking-tight leading-none">
              EMPIRE
              <span className="block text-4xl md:text-5xl lg:text-6xl text-gray-300 font-light italic mt-2">
                Command Center
              </span>
            </h1>
            
            <div className="w-32 h-px bg-white mx-auto mb-8 opacity-60"></div>
            
            <p className="text-xl md:text-2xl text-gray-300 font-light max-w-2xl mx-auto leading-relaxed">
              Welcome back, Sandra. Your digital empire awaits your vision.
            </p>
          </div>
        </div>
        
        {/* Subtle Bottom Border */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-30"></div>
      </div>

      {/* Editorial Stats Grid */}
      <div className="px-8 py-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Revenue Card */}
          <Card className="bg-white border-0 shadow-2xl group hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto group-hover:bg-gray-800 transition-colors duration-300">
                  <DollarSign className="w-8 h-8 text-white" />
                </div>
              </div>
              
              <h3 className="text-4xl font-serif text-black mb-2 group-hover:text-gray-800 transition-colors">
                $47.2K
              </h3>
              <p className="text-gray-600 font-light tracking-wide uppercase text-sm">
                Monthly Revenue
              </p>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <span className="text-green-600 text-sm font-medium">↗ +23% vs last month</span>
              </div>
            </CardContent>
          </Card>

          {/* Users Card */}
          <Card className="bg-white border-0 shadow-2xl group hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto group-hover:bg-gray-800 transition-colors duration-300">
                  <Users className="w-8 h-8 text-white" />
                </div>
              </div>
              
              <h3 className="text-4xl font-serif text-black mb-2 group-hover:text-gray-800 transition-colors">
                1,847
              </h3>
              <p className="text-gray-600 font-light tracking-wide uppercase text-sm">
                Active Users
              </p>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <span className="text-green-600 text-sm font-medium">↗ +12% growth</span>
              </div>
            </CardContent>
          </Card>

          {/* Messages Card */}
          <Card className="bg-white border-0 shadow-2xl group hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto group-hover:bg-gray-800 transition-colors duration-300">
                  <MessageSquare className="w-8 h-8 text-white" />
                </div>
              </div>
              
              <h3 className="text-4xl font-serif text-black mb-2 group-hover:text-gray-800 transition-colors">
                12.8K
              </h3>
              <p className="text-gray-600 font-light tracking-wide uppercase text-sm">
                Messages Today
              </p>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <span className="text-green-600 text-sm font-medium">↗ Peak engagement</span>
              </div>
            </CardContent>
          </Card>

          {/* Growth Card */}
          <Card className="bg-white border-0 shadow-2xl group hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto group-hover:bg-gray-800 transition-colors duration-300">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
              </div>
              
              <h3 className="text-4xl font-serif text-black mb-2 group-hover:text-gray-800 transition-colors">
                89%
              </h3>
              <p className="text-gray-600 font-light tracking-wide uppercase text-sm">
                Satisfaction Score
              </p>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <span className="text-green-600 text-sm font-medium">↗ Exceptional</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Editorial Action Section */}
        <div className="mt-24 text-center">
          <div className="w-24 h-px bg-black mx-auto mb-12"></div>
          
          <h2 className="text-4xl font-serif text-white mb-8">
            Strategic Command
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-white text-black hover:bg-gray-100 px-12 py-4 text-lg font-light tracking-wide transition-all duration-300 hover:shadow-xl"
            >
              VIEW ANALYTICS
            </Button>
            
            <Button 
              size="lg" 
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-black px-12 py-4 text-lg font-light tracking-wide transition-all duration-300"
            >
              MANAGE USERS
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}