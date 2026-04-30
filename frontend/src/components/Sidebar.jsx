import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Users, 
  Star, 
  Trash2, 
  Plus, 
  Layout,
  ChevronDown,
  Settings,
  UserPlus
} from 'lucide-react';
import Avvvatars from 'avvvatars-react';
import { DropdownMenuSeparator } from './ui/dropdown-menu';
import { NavLink, useNavigate, useParams, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { useWorkspaceStore } from '../store/workspace-store';
import { useDocStore } from '../store/doc-store';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import CreateWorkspaceModal from './CreateWorkspaceModal';
import WorkspaceActions from './workspace/WorkspaceActions';
import { FileText } from 'lucide-react';

const Sidebar = ({ onClose }) => {
  const { workspaces, activeWorkspace, setActiveWorkspace } = useWorkspaceStore();
  const { starredDocuments, fetchFavorites } = useDocStore();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const navigate = useNavigate();
  const { slug } = useParams();
  const location = useLocation();

  const handleNavClick = () => {
    if (onClose) onClose();
  };

  const getSlugFromPath = () => {
    if (slug) return slug;
    const parts = location.pathname.split('/');
    const wsIndex = parts.indexOf('workspace');
    if (wsIndex !== -1 && parts[wsIndex + 1]) {
      return parts[wsIndex + 1];
    }
    return null;
  };

  const currentSlug = getSlugFromPath() || activeWorkspace?.slug;

  useEffect(() => {
    const urlSlug = getSlugFromPath();
    if (urlSlug && workspaces.length > 0) {
      const workspace = workspaces.find(ws => ws.slug === urlSlug);
      if (workspace && activeWorkspace?.id !== workspace.id) {
        setActiveWorkspace(workspace);
      }
    }
  }, [location.pathname, workspaces, activeWorkspace, setActiveWorkspace]);

  useEffect(() => {
    if (activeWorkspace?.id) {
      fetchFavorites(activeWorkspace.id);
    }
  }, [activeWorkspace?.id, fetchFavorites]);

  const mainItems = [
    { 
      id: 'home', 
      label: 'Home', 
      icon: Home, 
      path: currentSlug ? `/dashboard/workspace/${currentSlug}` : '/dashboard' 
    },
    { 
      id: 'shared', 
      label: 'Shared with me', 
      icon: Users, 
      path: currentSlug ? `/dashboard/workspace/${currentSlug}/shared` : '/dashboard/shared' 
    },
    { 
      id: 'starred', 
      label: 'Starred', 
      icon: Star, 
      path: currentSlug ? `/dashboard/workspace/${currentSlug}/starred` : '/dashboard/starred' 
    },
    {
      id: 'members',
      label: 'Members',
      icon: UserPlus,
      path: currentSlug ? `/dashboard/workspace/${currentSlug}/members` : null
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      path: currentSlug ? `/dashboard/workspace/${currentSlug}/settings` : null
    }
  ];

  return (
    <aside className="w-64 border-r border-[#1e2130] bg-[#0d0f18] flex flex-col h-full">
      <div className="p-4 flex flex-col h-full overflow-y-auto custom-scrollbar">
        {/* Workspace Switcher */}
        <div className="mb-8">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-3 p-2.5 hover:bg-[#13151f] rounded-2xl cursor-pointer transition-all border border-[#1e2130]/50 hover:border-[#1D9E75]/30 group bg-[#13151f]/30 backdrop-blur-sm shadow-xl">
                <div className="w-10 h-10 rounded-2xl overflow-hidden flex items-center justify-center shadow-lg shadow-black/40 bg-[#0d0f18] border border-[#1e2130]">
                  {activeWorkspace?.logoType === 'custom' ? (
                    <img src={activeWorkspace.logo} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Avvvatars value={activeWorkspace?.logo || 'default'} style="shape" size={40} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-black text-white truncate leading-tight group-hover:text-[#1D9E75] transition-colors tracking-tight">{activeWorkspace?.name || 'Workspace'}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                    {activeWorkspace?.userRole || 'Owner'}
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-600 group-hover:text-[#1D9E75] transition-colors" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64 bg-[#0b0c14] border-[#1e2130] text-slate-200 p-2 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] z-[100] rounded-[24px] border-opacity-60 backdrop-blur-xl">
              <div className="px-3 py-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Your Teams</div>
              <DropdownMenuSeparator className="bg-[#1e2130] my-2" />
              <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-1">
                {workspaces.map((ws) => (
                  <div 
                    key={ws.id}
                    className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all hover:bg-[#1a1d28] group ${activeWorkspace?.id === ws.id ? 'bg-[#1D9E75]/10 text-[#1D9E75]' : ''}`}
                    onClick={() => {
                      setActiveWorkspace(ws);
                      navigate(`/dashboard/workspace/${ws.slug}`);
                      handleNavClick();
                    }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-7 h-7 rounded-xl overflow-hidden flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-md">
                        {ws.logoType === 'custom' ? (
                          <img src={ws.logo} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Avvvatars value={ws.logo || 'default'} style="shape" size={28} />
                        )}
                      </div>
                      <span className="truncate text-[13px] font-bold tracking-tight">{ws.name}</span>
                    </div>
                    
                    <WorkspaceActions workspace={ws} />
                  </div>
                ))}
              </div>
              <DropdownMenuSeparator className="bg-[#1e2130] my-2" />
              <DropdownMenuItem 
                className="flex items-center gap-2 px-3 py-3 rounded-xl hover:bg-[#1a1d28] cursor-pointer transition-colors focus:bg-[#1a1d28] text-[13px] font-bold text-[#1D9E75]"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <Plus className="w-4 h-4" />
                <span>Create Workspace</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <CreateWorkspaceModal 
          isOpen={isCreateModalOpen} 
          onClose={() => setIsCreateModalOpen(false)} 
        />
        
        <nav className="space-y-1">
          {mainItems.map((item) => (
            <React.Fragment key={item.id}>
              <NavLink
                to={item.path}
                end={item.path?.endsWith(activeWorkspace?.slug || 'dashboard')}
                onClick={handleNavClick}
                className={({ isActive }) => `
                  flex items-center justify-between px-3.5 py-3 rounded-2xl text-[13px] font-bold transition-all group cursor-pointer
                  ${isActive 
                    ? 'bg-[#1D9E75]/10 text-[#1D9E75] shadow-sm shadow-[#1D9E75]/5' 
                    : 'text-slate-400 hover:bg-[#13151f] hover:text-white'
                  }
                `}
              >
                {({ isActive }) => (
                  <div className="flex items-center gap-3.5">
                    <item.icon className={`w-[18px] h-[18px] transition-colors ${isActive ? 'text-[#1D9E75]' : 'text-slate-500 group-hover:text-white'}`} />
                    <span className="tracking-tight">{item.label}</span>
                  </div>
                )}
              </NavLink>
            </React.Fragment>
          ))}
        </nav>
      </div>
    </aside>



  );
};

export default Sidebar;

