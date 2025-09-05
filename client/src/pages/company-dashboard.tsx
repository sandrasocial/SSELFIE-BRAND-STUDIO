import { useState, useEffect } from 'react';
import { useLocation } from "wouter";

// Mock data for demonstration
const mockEmployees = [
  { id: 1, name: "Sarah Johnson", department: "Marketing", status: "trained", photos: 45, lastGenerated: "2 days ago" },
  { id: 2, name: "Mike Chen", department: "Sales", status: "training", photos: 0, lastGenerated: "Training in progress" },
  { id: 3, name: "Emma Wilson", department: "C-Suite", status: "trained", photos: 67, photos_remaining: 33, lastGenerated: "1 hour ago" },
  { id: 4, name: "David Rodriguez", department: "Engineering", status: "pending", photos: 0, lastGenerated: "Not started" },
  { id: 5, name: "Lisa Zhang", department: "Marketing", status: "trained", photos: 23, photos_remaining: 77, lastGenerated: "5 days ago" }
];

const departments = ["All", "Marketing", "Sales", "C-Suite", "Engineering"];

export default function CompanyDashboard() {
  const [, setLocation] = useLocation();
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [generatingPhotos, setGeneratingPhotos] = useState(false);

  const filteredEmployees = selectedDepartment === "All" 
    ? mockEmployees 
    : mockEmployees.filter(emp => emp.department === selectedDepartment);

  const handleGeneratePhotos = async (employee) => {
    setGeneratingPhotos(true);
    // Simulate photo generation
    setTimeout(() => {
      setGeneratingPhotos(false);
      alert(`Generated 10 new professional photos for ${employee.name}`);
    }, 3000);
  };

  const stats = {
    totalEmployees: mockEmployees.length,
    trainedModels: mockEmployees.filter(emp => emp.status === "trained").length,
    photosGenerated: mockEmployees.reduce((sum, emp) => sum + emp.photos, 0),
    activeThisWeek: 3
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div 
              className="font-serif text-2xl font-light tracking-wide text-black cursor-pointer"
              style={{ fontFamily: "Times New Roman, serif" }}
              onClick={() => setLocation("/")}
            >
              SSELFIE<span className="text-sm ml-2 opacity-70">COMPANY DASHBOARD</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">ACME Corporation</span>
              <button className="text-xs tracking-wider uppercase px-4 py-2 border border-gray-300 hover:bg-gray-50">
                Settings
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 border border-gray-200">
            <div className="text-3xl font-light mb-2">{stats.totalEmployees}</div>
            <div className="text-sm text-gray-600 uppercase tracking-wider">Total Employees</div>
          </div>
          <div className="bg-white p-6 border border-gray-200">
            <div className="text-3xl font-light mb-2">{stats.trainedModels}</div>
            <div className="text-sm text-gray-600 uppercase tracking-wider">Trained Models</div>
          </div>
          <div className="bg-white p-6 border border-gray-200">
            <div className="text-3xl font-light mb-2">{stats.photosGenerated}</div>
            <div className="text-sm text-gray-600 uppercase tracking-wider">Photos Generated</div>
          </div>
          <div className="bg-white p-6 border border-gray-200">
            <div className="text-3xl font-light mb-2">{stats.activeThisWeek}</div>
            <div className="text-sm text-gray-600 uppercase tracking-wider">Active This Week</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 
              className="text-3xl font-light mb-2"
              style={{ fontFamily: "Times New Roman, serif" }}
            >
              Team Photo Management
            </h1>
            <p className="text-gray-600">Generate professional photos for your entire team</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <select 
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="border border-gray-300 px-4 py-2 text-sm"
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            
            <button className="bg-black text-white px-6 py-2 text-xs uppercase tracking-wider hover:bg-gray-800">
              Add Employee
            </button>
          </div>
        </div>

        {/* Employee Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredEmployees.map(employee => (
            <div key={employee.id} className="bg-white border border-gray-200 overflow-hidden">
              {/* Employee Photo Placeholder */}
              <div className="h-48 bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-2"></div>
                  <div className="text-sm text-gray-500">Latest Photo</div>
                </div>
              </div>
              
              {/* Employee Info */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium">{employee.name}</h3>
                    <p className="text-sm text-gray-600">{employee.department}</p>
                  </div>
                  <span className={`
                    text-xs px-2 py-1 rounded-full uppercase tracking-wider
                    ${employee.status === 'trained' ? 'bg-green-100 text-green-800' :
                      employee.status === 'training' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'}
                  `}>
                    {employee.status}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Photos Generated:</span>
                    <span className="font-medium">{employee.photos}</span>
                  </div>
                  {employee.photos_remaining && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Remaining This Month:</span>
                      <span className="font-medium">{employee.photos_remaining}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Last Generated:</span>
                    <span className="font-medium">{employee.lastGenerated}</span>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="space-y-2">
                  {employee.status === 'trained' && (
                    <button
                      onClick={() => handleGeneratePhotos(employee)}
                      disabled={generatingPhotos}
                      className="w-full bg-black text-white py-2 px-4 text-xs uppercase tracking-wider hover:bg-gray-800 disabled:opacity-50"
                    >
                      {generatingPhotos ? 'Generating...' : 'Generate Photos'}
                    </button>
                  )}
                  
                  {employee.status === 'pending' && (
                    <button className="w-full border border-gray-300 text-gray-700 py-2 px-4 text-xs uppercase tracking-wider hover:bg-gray-50">
                      Start Training
                    </button>
                  )}
                  
                  <button className="w-full border border-gray-300 text-gray-700 py-2 px-4 text-xs uppercase tracking-wider hover:bg-gray-50">
                    View Gallery
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bulk Actions */}
        <div className="mt-12 bg-white border border-gray-200 p-6">
          <h2 
            className="text-xl font-light mb-4"
            style={{ fontFamily: "Times New Roman, serif" }}
          >
            Bulk Actions
          </h2>
          
          <div className="grid md:grid-cols-3 gap-4">
            <button className="border border-gray-300 p-4 text-left hover:bg-gray-50">
              <div className="font-medium mb-2">Generate Team Photos</div>
              <div className="text-sm text-gray-600">Create photos for all trained employees</div>
            </button>
            
            <button className="border border-gray-300 p-4 text-left hover:bg-gray-50">
              <div className="font-medium mb-2">Download All Assets</div>
              <div className="text-sm text-gray-600">Export team photos in various formats</div>
            </button>
            
            <button className="border border-gray-300 p-4 text-left hover:bg-gray-50">
              <div className="font-medium mb-2">Brand Update</div>
              <div className="text-sm text-gray-600">Apply new brand guidelines to all models</div>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 
              className="text-xl font-light"
              style={{ fontFamily: "Times New Roman, serif" }}
            >
              Recent Activity
            </h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            <div className="p-6 flex items-center justify-between">
              <div>
                <div className="font-medium">Emma Wilson generated 10 new photos</div>
                <div className="text-sm text-gray-600">1 hour ago • C-Suite Department</div>
              </div>
              <button className="text-xs uppercase tracking-wider text-gray-500 hover:text-gray-700">
                View
              </button>
            </div>
            
            <div className="p-6 flex items-center justify-between">
              <div>
                <div className="font-medium">Mike Chen model training completed</div>
                <div className="text-sm text-gray-600">3 hours ago • Sales Department</div>
              </div>
              <button className="text-xs uppercase tracking-wider text-gray-500 hover:text-gray-700">
                View
              </button>
            </div>
            
            <div className="p-6 flex items-center justify-between">
              <div>
                <div className="font-medium">Brand guidelines updated</div>
                <div className="text-sm text-gray-600">2 days ago • All Departments</div>
              </div>
              <button className="text-xs uppercase tracking-wider text-gray-500 hover:text-gray-700">
                View
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}