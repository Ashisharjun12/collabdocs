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
    <aside className="w-64 border-r border-[#2e2e2e] bg-[#171717] flex flex-col hidden md:flex sticky top-14 h-[calc(100vh-3.5rem)]">
      <div className="p-5 flex-1">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-[#898989] hover:text-[#fafafa] transition-all text-xs font-medium mb-8 px-3 group cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
          Back to Workspace
        </button>

        <h2 className="px-3 text-[10px] font-medium uppercase tracking-[1.5px] text-[#4d4d4d] mb-5">Personal</h2>

        <nav className="space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) => `
                flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all group cursor-pointer
                ${isActive 
                  ? 'bg-[#3ecf8e]/5 text-[#3ecf8e]' 
                  : 'text-[#898989] hover:bg-[#242424] hover:text-[#fafafa]'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <item.icon className={`w-4 h-4 transition-colors ${item.path === window.location.pathname ? 'text-[#3ecf8e]' : 'group-hover:text-[#fafafa]'}`} />
                <span className="tracking-tight">{item.label}</span>
              </div>
              <ChevronRight className={`w-3 h-3 transition-all opacity-0 group-hover:opacity-100 ${item.path === window.location.pathname ? 'opacity-100 translate-x-0.5' : ''}`} />
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-5 border-t border-[#2e2e2e]">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-400/5 transition-all group cursor-pointer"
        >
          <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span className="tracking-tight">Sign out</span>
        </button>
      </div>
    </aside>
  );
};

export default SettingsSidebar;
