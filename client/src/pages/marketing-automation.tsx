// Marketing automation page component

export default function MarketingAutomation() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Marketing Automation
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Automated marketing workflows for SSELFIE Studio
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Email Campaigns
            </h3>
            <p className="text-gray-600">
              Automated email sequences for user onboarding and engagement.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Social Media
            </h3>
            <p className="text-gray-600">
              Scheduled posts and engagement tracking across platforms.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Analytics
            </h3>
            <p className="text-gray-600">
              Track campaign performance and user engagement metrics.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}