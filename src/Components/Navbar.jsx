import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Users, BarChart3, Settings, Tag, Truck, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';

const Navbar = ({ collapsed, setCollapsed }) => {
  const location = useLocation();

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { id: 'products', icon: Package, label: 'Products', path: '/products' },
    { id: 'orders', icon: ShoppingCart, label: 'Orders', path: '/orders' },
    { id: 'customers', icon: Users, label: 'Customers', path: '/customers' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics', path: '/analytics' },
    { id: 'promotions', icon: Tag, label: 'Promotions', path: '/promotions' },
    { id: 'shipping', icon: Truck, label: 'Shipping', path: '/shipping' },
    { id: 'reviews', icon: MessageSquare, label: 'Reviews', path: '/reviews' },
    { id: 'settings', icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <div className={`h-screen bg-slate-950 text-white transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'} flex flex-col fixed left-0 top-0`}>
      {/* Header */}
      <div className="p-6 flex items-center justify-between border-b border-slate-800">
        {!collapsed && (
          <div>
            <img src="https://lovestorybyanna.com/wp-content/uploads/2025/02/cropped-Black-and-Yellow-Classy-and-Refined-Curved-Text-Logo-70x69.png" alt="" />
            <h1 className="text-xl font-bold">LoveStoryByAnna</h1>
            <p className="text-xs text-slate-400 mt-1">Admin Dashboard</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:bg-slate-800 rounded-lg transition-colors ml-auto"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 py-6 px-3 overflow-y-scroll scrollbar-hide">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`w-full flex items-center gap-4 px-4 py-3 mb-2 rounded-lg transition-all ${
                isActive
                  ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/50'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              } ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? item.label : ''}
            >
              <Icon size={20} className="flex-shrink-0" />
              {!collapsed && (
                <span className="font-medium">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800">
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-sm font-semibold">
              AD
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Admin User</p>
              <p className="text-xs text-slate-400">admin@shop.com</p>
            </div>
          </div>
        ) : (
          <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-sm font-semibold mx-auto">
            AD
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;