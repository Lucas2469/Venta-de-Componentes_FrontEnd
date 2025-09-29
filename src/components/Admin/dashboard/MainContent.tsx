
import React from "react";
import { MeetingPointsSection } from "../sections/MeetingPointsSection";
import { CategoriesSection } from "../sections/CategoriesSection";

interface MainContentProps {
  activeSection: string;
}

export function MainContent({ activeSection }: MainContentProps) {
  const menuItems = [
    { id: "meeting-points", label: "Puntos de Encuentro" },
    { id: "categories", label: "Categorías" },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "meeting-points":
        return <MeetingPointsSection />;
      case "categories":
        return <CategoriesSection />;
      default:
        return <MeetingPointsSection />;
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {menuItems.find(item => item.id === activeSection)?.label || 'Puntos de Encuentro'}
          </h2>
        </div>
        {renderContent()}
      </div>
    </div>
  );
}
