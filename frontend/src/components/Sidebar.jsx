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
    <aside className="w-64 border-r border-[#242424] bg-[#1c1c1c] flex flex-col h-full">
      <div className="p-4 flex flex-col h-full overflow-y-auto custom-scrollbar">
        {/* Workspace Switcher */}
        <div className="mb-8">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-3 p-2.5 hover:bg-[#242424] rounded-xl cursor-pointer transition-all border border-[#2e2e2e] hover:border-[#3ecf8e]/30 group bg-[#1c1c1c] shadow-sm">
                <div className="w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center shadow-md bg-[#171717] border border-[#2e2e2e]">
                  {activeWorkspace?.logoType === 'custom' ? (
                    <img src={activeWorkspace.logo} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Avvvatars value={activeWorkspace?.logo || 'default'} style="shape" size={36} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-[#fafafa] truncate leading-tight group-hover:text-[#3ecf8e] transition-colors tracking-tight">{activeWorkspace?.name || 'Workspace'}</p>
                  <p className="text-[10px] text-[#898989] font-medium uppercase tracking-[1.2px] mt-0.5">
                    {activeWorkspace?.userRole || 'Owner'}
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-[#4d4d4d] group-hover:text-[#3ecf8e] transition-colors" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64 bg-[#1c1c1c] border-[#2e2e2e] text-[#fafafa] p-2 shadow-2xl z-[100] rounded-xl border-opacity-60 backdrop-blur-xl">
              <div className="px-3 py-2 text-[10px] font-medium text-[#898989] uppercase tracking-[1.2px]">Your Teams</div>
              <DropdownMenuSeparator className="bg-[#2e2e2e] my-2" />
              <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-1">
                {workspaces.map((ws) => (
                  <div 
                    key={ws.id}
                    className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all hover:bg-[#242424] group ${activeWorkspace?.id === ws.id ? 'bg-[#3ecf8e]/10 text-[#3ecf8e]' : ''}`}
                    onClick={() => {
                      setActiveWorkspace(ws);
                      navigate(`/dashboard/workspace/${ws.slug}`);
                      handleNavClick();
                    }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-7 h-7 rounded-lg overflow-hidden flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-sm border border-[#2e2e2e]">
                        {ws.logoType === 'custom' ? (
                          <img src={ws.logo} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Avvvatars value={ws.logo || 'default'} style="shape" size={28} />
                        )}
                      </div>
                      <span className="truncate text-[13px] font-medium tracking-tight">{ws.name}</span>
                    </div>
                    
                    <WorkspaceActions workspace={ws} />
                  </div>
                ))}
              </div>
              <DropdownMenuSeparator className="bg-[#2e2e2e] my-2" />
              <DropdownMenuItem 
                className="flex items-center gap-2 px-3 py-3 rounded-lg hover:bg-[#242424] cursor-pointer transition-colors focus:bg-[#242424] text-[13px] font-medium text-[#3ecf8e]"
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
                  flex items-center justify-between px-3.5 py-2.5 rounded-lg text-[13px] font-medium transition-all group cursor-pointer
                  ${isActive 
                    ? 'bg-[#3ecf8e]/10 text-[#3ecf8e] border border-[#3ecf8e]/10 shadow-sm' 
                    : 'text-[#898989] hover:bg-[#242424] hover:text-[#fafafa]'
                  }
                `}
              >
                {({ isActive }) => (
                  <div className="flex items-center gap-3.5">
                    <item.icon className={`w-[18px] h-[18px] transition-colors ${isActive ? 'text-[#3ecf8e]' : 'text-[#4d4d4d] group-hover:text-[#fafafa]'}`} />
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

