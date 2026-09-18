import React from 'react';
import Header from './Header';

interface MainLayoutProps {
  children: React.ReactNode;
  currentView?: 'landing' | 'browse' | 'investor-signup' | 'investor-dashboard';
  onViewChange?: (view: 'landing' | 'browse' | 'investor-signup' | 'investor-dashboard') => void;
  isOverlay?: boolean;
}

export default function MainLayout({ 
  children, 
  currentView = 'browse', 
  onViewChange = () => {}, 
  isOverlay = false 
}: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        currentView={currentView} 
        onViewChange={onViewChange} 
        isOverlay={isOverlay} 
      />
      {children}
    </div>
  );
}