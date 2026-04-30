import React from 'react';
import { 
  User, 
  Bell, 
  Lock, 
  Shield, 
  Palette,
  LogOut,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth-store';


const SettingsSidebar = () => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const menuItems = [
    { id: 'profile', label: 'Profile', icon: User, path: '/settings/profile' },
    { id: 'notifications', label: 'Notifications', icon: Bell, path: '/settings/notifications' },
    { id: 'security', label: 'Security', icon: Lock, path: '/settings/security' },
    { id: 'appearance', label: 'Appearance', icon: Palette, path: '/settings/appearance' },
    { id: 'billing', label: 'Billing', icon: Shield, path: '/settings/billing' },
  ];

  return (
    <aside className="w-64 border-r border-[#1e2130] bg-[#0d0f18] flex flex-col hidden md:flex sticky top-14 h-[calc(100vh-3.5rem)]">
      <div className="p-4 flex-1">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-xs font-medium mb-6 px-3 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
          Back to Workspace
        </button>

        <h2 className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-4">Settings</h2>

        <nav className="space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) => `
                flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group
                ${isActive 
                  ? 'bg-[#1D9E75]/10 text-[#1D9E75]' 
                  : 'text-slate-400 hover:bg-[#13151f] hover:text-white'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </div>
              <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-[#1e2130]">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-400/10 transition-all group"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
};

export default SettingsSidebar;
