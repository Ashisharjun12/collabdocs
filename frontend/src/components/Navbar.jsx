import React from 'react';
import { useAuthStore } from '../store/auth-store';
import {
  Layout,
  Search,
  Bell,
  Settings,
  User,
  LogOut,
  ChevronDown,
  Menu
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';

const Navbar = ({ showSearch = true, onMenuClick }) => {
  const { authUser, logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <nav className="h-14 border-b border-[#1e2130] bg-[#13151f] px-4 md:px-6 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden text-slate-400 hover:text-white"
            onClick={onMenuClick}
          >
            <Menu className="w-5 h-5" />
          </Button>
        )}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <div className="w-7 h-7 bg-[#1D9E75] rounded-lg flex items-center justify-center shadow-lg shadow-[#1D9E75]/20">
            <Layout className="text-white w-4 h-4" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-white">
            Collab<span className="text-[#1D9E75]">Docs</span>
          </span>
        </div>
      </div>


      <div className="flex items-center gap-4">
        {/* Search Bar */}
        {showSearch && (
          <div className="hidden md:flex items-center gap-2 bg-[#1a1d28] border border-[#2a2d3a] rounded-lg px-3 py-1.5 w-64 group focus-within:border-[#1D9E75]/50 transition-all">
            <Search className="w-4 h-4 text-slate-500 group-focus-within:text-[#1D9E75]" />
            <input
              type="text"
              placeholder="Search docs..."
              className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-600"
            />
          </div>
        )}

        <div className="flex items-center gap-2 border-l border-[#1e2130] pl-4 ml-2">
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-[#1a1d28]">
            <Bell className="w-5 h-5" />
          </Button>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-2 cursor-pointer group ml-2">
                <Avatar className="w-8 h-8 ring-offset-[#0f1117] transition-all group-hover:ring-2 group-hover:ring-[#1D9E75]/50">
                  <AvatarImage src={authUser?.avatarUrl} />


                  <AvatarFallback className="bg-[#1D9E75] text-white text-xs font-bold">
                    {authUser?.name?.substring(0, 2).toUpperCase() || 'AD'}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-[#13151f] border-[#1e2130] text-slate-200 p-2 shadow-2xl">
              <DropdownMenuLabel className="px-2 py-1.5">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-semibold text-white">{authUser?.name}</span>
                  <span className="text-xs text-slate-500 truncate">{authUser?.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[#1e2130] my-1" />
              <DropdownMenuItem
                className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-[#1a1d28] cursor-pointer transition-colors focus:bg-[#1a1d28] focus:text-[#1D9E75]"
                onClick={() => navigate('/dashboard')}
              >
                <Layout className="w-4 h-4" />
                <span>Workspace</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-[#1a1d28] cursor-pointer transition-colors focus:bg-[#1a1d28] focus:text-[#1D9E75]"
                onClick={() => navigate('/settings')}
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#1e2130] my-1" />
              <DropdownMenuItem
                className="flex items-center gap-2 px-2 py-2 rounded-md text-red-400 hover:bg-red-400/10 cursor-pointer transition-colors focus:bg-red-400/10"
                onClick={logout}
              >
                <LogOut className="w-4 h-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
