import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { useIsMobile } from '@/hooks/use-mobile';
import ImageUploader from './ImageUploader';

const AppLayout: React.FC = () => {
  const { sidebarOpen, toggleSidebar } = useAppContext();
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img 
              src="https://d64gsuwffb70l.cloudfront.net/686418b0159b15d08cb66e96_1751399476366_01b277eb.png" 
              alt="Spotify Advertising Logo" 
              className="h-16 w-auto"
            />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Spotify Logo Resizer
          </h1>
          <p className="text-gray-600 text-lg">
            Transform your images to perfect 640x640 dimensions without distortion
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <ImageUploader />
        </div>
        
        <div className="text-center mt-12 text-sm text-gray-500">
          <p>Upload PNG or JPG files • Images are processed locally in your browser</p>
        </div>
      </div>
    </div>
  );
};

export default AppLayout;