interface ActivityItem {
  id: string;
  type: string;
  title: string;
  timestamp: string;
  user?: string;
  avatar?: string;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
}

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <div className="bg-white">
      <h2 
        className="text-3xl font-light tracking-[0.3em] uppercase text-center mb-12 text-black"
        style={{ fontFamily: 'Times New Roman, serif' }}
      >
        {'R E C E N T   A C T I V I T Y'.split('').join(' ')}
      </h2>
      
      <div className="space-y-6">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-center justify-between border-b border-gray-100 pb-6 hover:bg-gray-50 transition-colors duration-200 px-4 py-2 rounded-lg">
            <div className="flex items-center space-x-6">
              <div 
                className="w-16 h-16 bg-gray-200 rounded-full bg-cover bg-center"
                style={{
                  backgroundImage: activity.avatar ? `url('${activity.avatar}')` : 'none',
                  backgroundPosition: '50% 30%'
                }}
              />
              <div>
                <h4 
                  className="text-lg font-light text-black mb-1"
                  style={{ fontFamily: 'Times New Roman, serif' }}
                >
                  {activity.title}
                </h4>
                <p className="text-gray-600 text-sm">
                  {activity.timestamp}
                </p>
                {activity.user && (
                  <p className="text-gray-500 text-xs tracking-[0.1em] uppercase">
                    {activity.user}
                  </p>
                )}
              </div>
            </div>
            <button className="text-sm text-gray-500 tracking-[0.1em] uppercase hover:text-black transition-colors">
              {'V I E W   D E T A I L S'.split('').join(' ')}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}