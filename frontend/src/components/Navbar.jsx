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
import collabLogo from '../assets/collabdocs_favicon.svg';

const Navbar = ({ showSearch = true, onMenuClick }) => {
  const { authUser, logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <nav className="h-14 border-b border-[#242424] bg-[#1c1c1c] px-4 md:px-6 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden text-[#898989] hover:text-[#fafafa]"
            onClick={onMenuClick}
          >
            <Menu className="w-5 h-5" />
          </Button>
        )}
        <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => navigate('/dashboard')}>
          <div className="w-8 h-8 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
            <img src={collabLogo} alt="CollabDocs Logo" className="w-full h-full object-contain" />
          </div>
          <span className="text-xl font-medium tracking-tight text-[#fafafa] leading-none">
            Collab<span className="text-[#3ecf8e]">Docs</span>
          </span>
        </div>
      </div>


      <div className="flex items-center gap-4">
        {/* Search Bar */}
        {showSearch && (
          <div className="hidden md:flex items-center gap-2 bg-[#171717] border border-[#2e2e2e] rounded-lg px-3 py-1.5 w-64 group focus-within:border-[#3ecf8e]/50 transition-all">
            <Search className="w-4 h-4 text-[#4d4d4d] group-focus-within:text-[#3ecf8e]" />
            <input
              type="text"
              placeholder="Search docs..."
              className="bg-transparent border-none outline-none text-sm w-full placeholder:text-[#4d4d4d] text-[#fafafa]"
            />
          </div>
        )}

        <div className="flex items-center gap-2 border-l border-[#2e2e2e] pl-4 ml-2">
          <Button variant="ghost" size="icon" className="text-[#898989] hover:text-[#fafafa] hover:bg-[#242424]">
            <Bell className="w-5 h-5" />
          </Button>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-2 cursor-pointer group ml-2">
                <Avatar className="w-8 h-8 ring-offset-[#171717] transition-all group-hover:ring-2 group-hover:ring-[#3ecf8e]/50">
                  <AvatarImage src={authUser?.avatarUrl} />
                  <AvatarFallback className="bg-[#3ecf8e] text-[#171717] text-xs font-bold">
                    {authUser?.name?.substring(0, 2).toUpperCase() || 'AD'}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="w-4 h-4 text-[#4d4d4d] group-hover:text-[#fafafa] transition-colors" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-[#1c1c1c] border-[#2e2e2e] text-[#fafafa] p-2 shadow-2xl rounded-xl">
              <DropdownMenuLabel className="px-2 py-1.5">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-[#fafafa]">{authUser?.name}</span>
                  <span className="text-xs text-[#898989] truncate">{authUser?.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[#2e2e2e] my-1" />
              <DropdownMenuItem
                className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-[#242424] cursor-pointer transition-colors focus:bg-[#242424] focus:text-[#3ecf8e]"
                onClick={() => navigate('/dashboard')}
              >
                <Layout className="w-4 h-4" />
                <span>Workspace</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-[#242424] cursor-pointer transition-colors focus:bg-[#242424] focus:text-[#3ecf8e]"
                onClick={() => navigate('/settings')}
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#2e2e2e] my-1" />
              <DropdownMenuItem
                className="flex items-center gap-2 px-2 py-2 rounded-lg text-red-400 hover:bg-red-400/10 cursor-pointer transition-colors focus:bg-red-400/10"
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
