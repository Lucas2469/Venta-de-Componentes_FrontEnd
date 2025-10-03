import React, { useState } from 'react';
import { CalificationPage } from './section/CalificationPage';

interface MainContentProps {
  currentSection?: string;
  onBack?: () => void;
}

export function MainContent({ currentSection = "califications", onBack }: MainContentProps) {
  const [showCalificationPage, setShowCalificationPage] = useState(false);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      setShowCalificationPage(false);
    }
  };

  const renderCurrentSection = () => {
    switch (currentSection) {
      case "califications":
        return (
          <CalificationPage 
            onBack={handleBack} 
          />
        );
      default:
        return (
          <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
              <div className="text-center py-8">
                <h1 className="text-3xl font-bold mb-4" style={{ color: '#9d0045' }}>
                  Sección no encontrada
                </h1>
                <p className="text-gray-600">
                  La sección "{currentSection}" no está disponible.
                </p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex-1">
      {renderCurrentSection()}
    </div>
  );
}
