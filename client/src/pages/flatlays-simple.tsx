import MemberNavigation from "@/components/member-navigation";

export default function FlatlaysSimple() {
  return (
    <div className="min-h-screen bg-white">
      <MemberNavigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-serif text-black mb-6">Simple Flatlays Test</h1>
          <p className="text-lg text-gray-600 mb-8">
            This is a simple test to verify the flatlays route is working properly.
          </p>
          <div className="bg-green-100 p-8 rounded">
            <p className="text-sm text-green-800">
              ✅ If you can see this page, the /flatlays route is working correctly!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}