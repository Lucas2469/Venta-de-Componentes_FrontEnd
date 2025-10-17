import React from "react";
import { MapPin, Settings } from "lucide-react";

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export function Sidebar({ activeSection, setActiveSection }: SidebarProps) {
  const menuItems = [
    { id: "meeting-points", label: "Puntos de Encuentro", icon: MapPin },
    { id: "categories", label: "Categorías", icon: Settings },
  ];

  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold" style={{ color: '#9d0045' }}>
          ELECTROMARKET
        </h1>
        <p className="text-sm text-gray-600 mt-1">Panel Administrativo</p>
      </div>
      
      <nav className="mt-6">
        <div className="px-3">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center px-3 py-2 mb-2 rounded-lg text-left transition-colors ${
                activeSection === item.id
                  ? 'bg-electromarket-maroon text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <item.icon className="h-5 w-5 mr-3" />
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}