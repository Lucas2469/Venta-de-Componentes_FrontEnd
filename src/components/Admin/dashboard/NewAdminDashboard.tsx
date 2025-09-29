
import React, { useState } from "react";
import { Sidebar } from "./SideBar";
import { MainContent } from "./MainContent";
import { Users, BarChart3, MapPin, Package, ShoppingBag, Settings, Star, Receipt } from "lucide-react";

export function NewAdminDashboard() {
  const [activeSection, setActiveSection] = useState("meeting-points");

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      <MainContent activeSection={activeSection} />
    </div>
  );
}