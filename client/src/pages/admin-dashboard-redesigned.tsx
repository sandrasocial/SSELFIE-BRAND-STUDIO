import { useUser } from "@/hooks/use-user";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, DollarSign, TrendingUp, Calendar, Camera, Sparkles } from "lucide-react";

export default function AdminDashboard() {
  const { user } = useUser();

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-serif text-white mb-4">Access Denied</h1>
          <p className="text-gray-400">Administrator privileges required</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: "Total Users",
      value: "2,847",
      change: "+12.5%",
      icon: Users,
      trend: "up",
      description: "Active SSELFIE members"
    },
    {
      title: "Revenue",
      value: "$54,290",
      change: "+8.2%",
      icon: DollarSign,
      trend: "up",
      description: "Monthly recurring revenue"
    },
    {
      title: "Engagement",
      value: "94.3%",
      change: "+2.1%",
      icon: TrendingUp,
      trend: "up",
      description: "User engagement rate"
    },
    {
      title: "Sessions",
      value: "1,284",
      change: "+15.7%",
      icon: Camera,
      trend: "up",
      description: "Studio sessions this month"
    }
  ];

  const recentActivities = [
    {
      user: "Emma Thompson",
      action: "Completed Premium Shoot",
      time: "2 hours ago",
      type: "session"
    },
    {
      user: "Marcus Chen",
      action: "Upgraded to Pro Plan",
      time: "4 hours ago",
      type: "upgrade"
    },
    {
      user: "Sarah Johnson",
      action: "Published Portfolio",
      time: "6 hours ago",
      type: "publish"
    },
    {
      user: "Alex Rivera",
      action: "Booked Studio Time",
      time: "8 hours ago",
      type: "booking"
    }
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Full-Bleed Luxury Hero Section */}
      <div className="relative h-96 bg-gradient-to-br from-gray-900 via-black to-gray-800 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.03"%3E%3Ccircle cx="7" cy="7" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        
        <div className="relative h-full flex flex-col justify-center px-8 lg:px-16">
          <div className="max-w-4xl">
            <div className="flex items-center space-x-3 mb-6">
              <Sparkles className="w-8 h-8 text-white" />
              <Badge variant="outline" className="border-white/20 text-white bg-white/10 font-light tracking-wide">
                ADMIN CONTROL CENTER
              </Badge>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-serif text-white mb-6 leading-tight">
              Sandra's
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-300 to-gray-500">
                Empire Dashboard
              </span>
            </h1>
            
            <p className="text-xl text-gray-300 font-light leading-relaxed max-w-2xl">
              Your complete command center for the SSELFIE Studio empire. 
              Monitor growth, track success, and orchestrate your vision.
            </p>
          </div>
        </div>
        
        {/* Elegant Bottom Border */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
      </div>

      {/* Editorial Stats Grid */}
      <div className="px-8 lg:px-16 py-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h2 className="text-4xl font-serif text-black mb-4">Performance Metrics</h2>
            <div className="w-24 h-px bg-black"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="border-0 shadow-none bg-transparent group hover:bg-gray-50 transition-colors duration-300">
                  <CardContent className="p-8">
                    <div className="flex items-center justify-between mb-6">
                      <Icon className="w-8 h-8 text-black" />
                      <Badge variant="outline" className="text-emerald-600 border-emerald-600">
                        {stat.change}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-4xl font-serif text-black font-light">
                        {stat.value}
                      </p>
                      <p className="text-sm font-medium text-black uppercase tracking-wider">
                        {stat.title}
                      </p>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {stat.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Activity Feed Section */}
      <div className="px-8 lg:px-16 py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Recent Activity */}
            <div className="lg:col-span-2">
              <div className="mb-8">
                <h2 className="text-3xl font-serif text-black mb-4">Recent Activity</h2>
                <div className="w-20 h-px bg-black"></div>
              </div>
              
              <div className="space-y-6">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4 p-6 bg-white border border-gray-100 hover:shadow-sm transition-shadow">
                    <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {activity.user.charAt(0)}
                      </span>
                    </div>
                    
                    <div className="flex-1">
                      <p className="font-medium text-black">
                        {activity.user}
                      </p>
                      <p className="text-sm text-gray-600">
                        {activity.action}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <div className="mb-8">
                <h2 className="text-3xl font-serif text-black mb-4">Quick Actions</h2>
                <div className="w-20 h-px bg-black"></div>
              </div>
              
              <div className="space-y-4">
                <Button className="w-full justify-start bg-black hover:bg-gray-800 text-white font-light py-6 text-left">
                  <Users className="w-5 h-5 mr-3" />
                  Manage Users
                </Button>
                
                <Button className="w-full justify-start bg-white border border-black text-black hover:bg-gray-50 font-light py-6 text-left">
                  <Calendar className="w-5 h-5 mr-3" />
                  Studio Bookings
                </Button>
                
                <Button className="w-full justify-start bg-white border border-black text-black hover:bg-gray-50 font-light py-6 text-left">
                  <DollarSign className="w-5 h-5 mr-3" />
                  Revenue Reports
                </Button>
                
                <Button className="w-full justify-start bg-white border border-black text-black hover:bg-gray-50 font-light py-6 text-left">
                  <TrendingUp className="w-5 h-5 mr-3" />
                  Analytics
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Editorial Footer */}
      <div className="px-8 lg:px-16 py-12 bg-black">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-400 font-light text-sm tracking-wide">
            SSELFIE STUDIO © 2024 — SANDRA'S EMPIRE DASHBOARD
          </p>
        </div>
      </div>
    </div>
  );
}