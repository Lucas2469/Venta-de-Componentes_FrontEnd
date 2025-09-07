import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { ShoppingCart, Package, Users, TrendingUp, LogOut } from "lucide-react";

interface DashboardProps {
  onLogout: () => void;
}

export function Dashboard({ onLogout }: DashboardProps) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#ffffff' }}>
      {/* Header */}
      <header className="border-b" style={{ backgroundColor: '#9d0045', color: '#ffffff' }}>
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">ELECTROMARKET Dashboard</h1>
          <Button 
            variant="ghost" 
            onClick={onLogout}
            className="text-white hover:bg-white/10"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl mb-2" style={{ color: '#9d0045' }}>Welcome to ELECTROMARKET</h2>
          <p className="text-gray-600">Your electronics marketplace dashboard</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Total Products</CardTitle>
              <Package className="h-4 w-4" style={{ color: '#00adb5' }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">1,234</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Active Users</CardTitle>
              <Users className="h-4 w-4" style={{ color: '#00adb5' }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">5,678</div>
              <p className="text-xs text-muted-foreground">+8% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Orders</CardTitle>
              <ShoppingCart className="h-4 w-4" style={{ color: '#00adb5' }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">892</div>
              <p className="text-xs text-muted-foreground">+23% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Revenue</CardTitle>
              <TrendingUp className="h-4 w-4" style={{ color: '#00adb5' }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">$45,231</div>
              <p className="text-xs text-muted-foreground">+15% from last month</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader style={{ backgroundColor: '#9d0045', color: '#ffffff' }}>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription className="text-white/80">
                Manage your marketplace activities
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  style={{ borderColor: '#00adb5', color: '#00adb5' }}
                >
                  <Package className="h-4 w-4 mr-2" />
                  Add New Product
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  style={{ borderColor: '#00adb5', color: '#00adb5' }}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  View Orders
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  style={{ borderColor: '#00adb5', color: '#00adb5' }}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Manage Customers
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader style={{ backgroundColor: '#9d0045', color: '#ffffff' }}>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription className="text-white/80">
                Latest updates from your marketplace
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div 
                    className="w-2 h-2 rounded-full mt-2" 
                    style={{ backgroundColor: '#00adb5' }}
                  />
                  <div className="flex-1">
                    <p className="text-sm">New order received</p>
                    <p className="text-xs text-muted-foreground">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div 
                    className="w-2 h-2 rounded-full mt-2" 
                    style={{ backgroundColor: '#00adb5' }}
                  />
                  <div className="flex-1">
                    <p className="text-sm">Product stock updated</p>
                    <p className="text-xs text-muted-foreground">1 hour ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div 
                    className="w-2 h-2 rounded-full mt-2" 
                    style={{ backgroundColor: '#00adb5' }}
                  />
                  <div className="flex-1">
                    <p className="text-sm">New user registered</p>
                    <p className="text-xs text-muted-foreground">3 hours ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}