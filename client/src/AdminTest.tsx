import React from 'react';
import { AdminDashboard, AdminTestButton } from './components/admin';

const AdminTest: React.FC = () => {
  const handleTestClick = () => {
    console.log('Admin test button clicked!');
    alert('Admin test button works perfectly! 🚀');
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
        SSELFIE Admin Components Test
      </h1>
      
      {/* Standalone Test Buttons */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Standalone Test Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <AdminTestButton 
            variant="primary" 
            size="lg" 
            onClick={handleTestClick}
          >
            🚀 Primary Test
          </AdminTestButton>
          
          <AdminTestButton 
            variant="secondary" 
            size="md" 
            onClick={handleTestClick}
          >
            ⚡ Secondary Test
          </AdminTestButton>
          
          <AdminTestButton 
            variant="danger" 
            size="sm" 
            onClick={handleTestClick}
          >
            🔥 Danger Test
          </AdminTestButton>
        </div>
      </div>

      {/* Full Admin Dashboard */}
      <AdminDashboard />
    </div>
  );
};

export default AdminTest;