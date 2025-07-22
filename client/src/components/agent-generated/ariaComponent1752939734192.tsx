import React from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';

export const BuildVisualStudio: React.FC = () => {
  return (
    <div className="h-screen bg-white flex flex-col">
      <header className="border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl" style={{ fontFamily: 'Times New Roman, serif' }}>BUILD Studio</h1>
      </header>
      
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* LEFT PANEL: Live Website Preview */}
        <ResizablePanel defaultSize={50} minSize={30}>
          <div className="h-full border-r border-gray-200 p-4">
            <h2 className="text-lg mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>Live Preview</h2>
            <iframe
              src="/"
              className="w-full h-full border border-gray-300 rounded"
              title="Website Preview"
            />
          </div>
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        {/* RIGHT PANEL: 5 Tabs */}
        <ResizablePanel defaultSize={50} minSize={30}>
          <div className="h-full flex flex-col">
            <div className="border-b border-gray-200">
              <nav className="flex">
                <button className="px-4 py-2 border-b-2 border-black" style={{ fontFamily: 'Times New Roman, serif' }}>Chat</button>
                <button className="px-4 py-2 border-b-2 border-transparent" style={{ fontFamily: 'Times New Roman, serif' }}>Gallery</button>
                <button className="px-4 py-2 border-b-2 border-transparent" style={{ fontFamily: 'Times New Roman, serif' }}>Library</button>
                <button className="px-4 py-2 border-b-2 border-transparent" style={{ fontFamily: 'Times New Roman, serif' }}>Edit</button>
                <button className="px-4 py-2 border-b-2 border-transparent" style={{ fontFamily: 'Times New Roman, serif' }}>Upload</button>
              </nav>
            </div>
            <div className="flex-1 p-4">
              <div className="bg-gray-50 h-full rounded p-4">
                <p>Victoria Chat Interface Coming Soon...</p>
              </div>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default BuildVisualStudio;