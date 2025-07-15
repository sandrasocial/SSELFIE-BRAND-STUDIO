import MemberNavigation from '@/components/member-navigation';

export default function FlatlayMinimal() {
  return (
    <div className="min-h-screen bg-white">
      <MemberNavigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-serif text-black mb-6">Library Test</h1>
          <p className="text-lg text-gray-600 mb-8">
            This is a minimal test to see if the routing and authentication are working.
          </p>
          <div className="bg-gray-100 p-8 rounded">
            <p className="text-sm text-gray-500">
              If you can see this page, the route and authentication are working correctly.
              The issue is with the flatlay component itself.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}