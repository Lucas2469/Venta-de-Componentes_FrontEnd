import React from "react";
import { ShoppingCart, Package, Users, TrendingUp, LogOut } from "lucide-react";

interface DashboardProps {
  onLogout: () => void;
}

export function Dashboard({ onLogout }: DashboardProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-pink-800 text-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">ELECTROMARKET Dashboard</h1>
          <button
            onClick={onLogout}
            className="flex items-center px-3 py-2 text-white hover:bg-white/10 rounded-md transition-colors"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-pink-800 mb-2">Welcome to ELECTROMARKET</h2>
          <p className="text-gray-600">Your electronics marketplace dashboard</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Total Products</h3>
              <Package className="h-4 w-4 text-teal-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">1,234</div>
            <p className="text-xs text-gray-500">+12% from last month</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Active Users</h3>
              <Users className="h-4 w-4 text-teal-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">5,678</div>
            <p className="text-xs text-gray-500">+8% from last month</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Orders</h3>
              <ShoppingCart className="h-4 w-4 text-teal-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">892</div>
            <p className="text-xs text-gray-500">+23% from last month</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Revenue</h3>
              <TrendingUp className="h-4 w-4 text-teal-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">$45,231</div>
            <p className="text-xs text-gray-500">+15% from last month</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="bg-pink-800 text-white p-6">
              <h3 className="text-lg font-bold">Quick Actions</h3>
              <p className="text-white/80 text-sm">
                Manage your marketplace activities
              </p>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <button className="w-full flex items-center justify-start px-4 py-3 border border-teal-600 text-teal-600 rounded-md hover:bg-teal-50 transition-colors">
                  <Package className="h-4 w-4 mr-2" />
                  Add New Product
                </button>
                <button className="w-full flex items-center justify-start px-4 py-3 border border-teal-600 text-teal-600 rounded-md hover:bg-teal-50 transition-colors">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  View Orders
                </button>
                <button className="w-full flex items-center justify-start px-4 py-3 border border-teal-600 text-teal-600 rounded-md hover:bg-teal-50 transition-colors">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Customers
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="bg-pink-800 text-white p-6">
              <h3 className="text-lg font-bold">Recent Activity</h3>
              <p className="text-white/80 text-sm">
                Latest updates from your marketplace
              </p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full mt-2 bg-teal-600" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">New order received</p>
                    <p className="text-xs text-gray-500">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full mt-2 bg-teal-600" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">Product stock updated</p>
                    <p className="text-xs text-gray-500">1 hour ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full mt-2 bg-teal-600" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">New user registered</p>
                    <p className="text-xs text-gray-500">3 hours ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}