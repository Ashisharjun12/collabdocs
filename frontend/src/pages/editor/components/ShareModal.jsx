import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Share2, 
  Globe, 
  Users, 
  Check, 
  Copy, 
  ExternalLink, 
  Lock, 
  ShieldCheck,
  ChevronDown,
  Globe2,
  MoreHorizontal,
  Search,
  UserPlus,
  Trash2,
  Crown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { docApi, userApi } from '../../../services/api';
import { useDocStore } from '../../../store/doc-store';
import { useAuthStore } from '../../../store/auth-store';
import { toast } from 'sonner';

const ShareModal = ({ isOpen, onClose, docId }) => {
  const { activeDocument, setActiveDocument } = useDocStore();
  const { authUser } = useAuthStore();
  const [isUpdating, setIsUpdating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showAccessMenu, setShowAccessMenu] = useState(false);
  
  // Member Management State
  const [members, setMembers] = useState([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeout = useRef(null);

  useEffect(() => {
    if (isOpen && docId) {
      fetchMembers();
    }
  }, [isOpen, docId]);

  const fetchMembers = async () => {
    try {
      setIsLoadingMembers(true);
      const response = await docApi.listMembers(docId);
      setMembers(response.data.data.members || []);
    } catch (error) {
      console.error('Failed to fetch members:', error);
    } finally {
      setIsLoadingMembers(false);
    }
  };

  const handleSearchUsers = async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      setIsSearching(true);
      const response = await userApi.searchUsers(query);
      // Filter out people already in members
      const filtered = response.data.data.users.filter(
        u => !members.some(m => m.userId === u.id) && u.id !== authUser?.id
      );
      setSearchResults(filtered);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const onSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => handleSearchUsers(query), 300);
  };

  const addMember = async (user) => {
    try {
      await docApi.addMember(docId, user.id, 'viewer');
      toast.success(`Invited ${user.name}`);
      setSearchQuery('');
      setSearchResults([]);
      fetchMembers();
    } catch (error) {
      toast.error('Failed to add member');
    }
  };

  const removeMember = async (userId) => {
    try {
      await docApi.removeMember(docId, userId);
      toast.success('Access removed');
      fetchMembers();
    } catch (error) {
      toast.error('Failed to remove access');
    }
  };

  if (!activeDocument) return null;

  const visibility = activeDocument.visibility;
  const isPublic = visibility === 'public';
  const shareIdentifier = activeDocument.shareToken || activeDocument.slug;
  const publicLink = `${window.location.origin}/p/${shareIdentifier}`;

  const handleCopyLink = () => {
    if (!isPublic) {
      toast.error('Publish the document to enable public sharing');
      return;
    }
    navigator.clipboard.writeText(publicLink);
    setCopied(true);
    toast.success('Public link copied');
    setTimeout(() => setCopied(false), 2000);
  };

  const updateVisibility = async (newVisibility) => {
    if (!docId || isUpdating) return;
    try {
      setIsUpdating(true);
      const response = await docApi.updateDoc(docId, { visibility: newVisibility });
      setActiveDocument(response.data.data.doc);
      toast.success(`Access updated to ${newVisibility}`);
      setShowAccessMenu(false);
    } catch (error) {
      toast.error('Failed to update access');
    } finally {
      setIsUpdating(false);
    }
  };

  const accessOptions = [
    { 
      id: 'private', 
      label: 'Restricted', 
      desc: 'Only you and invited people', 
      icon: <Lock className="w-3.5 h-3.5" color="#ef4444" /> 
    },
    { 
      id: 'workspace', 
      label: 'Workspace', 
      desc: 'Anyone in your team', 
      icon: <Users className="w-3.5 h-3.5" color="#3b82f6" /> 
    },
    { 
      id: 'public', 
      label: 'Anyone with link', 
      desc: 'Public on the web', 
      icon: <Globe2 className="w-3.5 h-3.5" color="#1D9E75" /> 
    }
  ];

  const currentAccess = accessOptions.find(o => o.id === visibility) || accessOptions[0];

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#050608]/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 10 }}
            className="relative w-full max-w-lg bg-[#0d0e12] border border-white/10 rounded-[28px] shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1D9E75] to-[#1D9E75]/20 flex items-center justify-center shadow-lg shadow-[#1D9E75]/10">
                  <Share2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white tracking-tight">Share Document</h2>
                  <p className="text-[11px] text-slate-500 font-medium truncate max-w-[220px]">{activeDocument.title}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-slate-500 hover:text-white transition-all cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 max-h-[60vh]">
              
              {/* Invite Section */}
              <div className="space-y-3">
                 <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-600">
                       <Search className="w-4 h-4" />
                    </div>
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={onSearchChange}
                      placeholder="Add people and groups..."
                      className="w-full bg-white/[0.03] border border-white/5 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#1D9E75]/50 focus:bg-white/[0.05] transition-all"
                    />
                    
                    {/* Search Results Dropdown */}
                    <AnimatePresence>
                      {searchResults.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          className="absolute top-full left-0 right-0 mt-2 bg-[#16171d] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[200]"
                        >
                          {searchResults.map((user) => (
                            <button
                              key={user.id}
                              onClick={() => addMember(user)}
                              className="w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-all text-left group"
                            >
                              <div className="w-9 h-9 rounded-full bg-[#1D9E75]/20 border border-[#1D9E75]/30 flex items-center justify-center overflow-hidden">
                                 {user.avatarUrl ? (
                                   <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                                 ) : (
                                   <span className="text-xs font-bold text-[#1D9E75]">{user.name.charAt(0)}</span>
                                 )}
                              </div>
                              <div className="flex-1">
                                <p className="text-xs font-bold text-white">{user.name}</p>
                                <p className="text-[10px] text-slate-500">{user.email}</p>
                              </div>
                              <UserPlus className="w-4 h-4 text-slate-600 group-hover:text-[#1D9E75] transition-colors" />
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                 </div>
              </div>

              {/* Members List */}
              <div className="space-y-3">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.1em] ml-1">People with access</h3>
                <div className="space-y-1">
                   {/* Owner Always Shown First */}
                   <div className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-center gap-3">
                         <div className="w-9 h-9 rounded-full bg-slate-800 border border-white/5 overflow-hidden flex items-center justify-center">
                            {authUser?.avatarUrl ? <img src={authUser.avatarUrl} alt="" className="w-full h-full object-cover" /> : <span className="text-xs font-bold text-white">ME</span>}
                         </div>
                         <div>
                            <p className="text-xs font-bold text-white">{authUser?.name} <span className="text-[9px] text-[#1D9E75] ml-1 font-medium">(You)</span></p>
                            <p className="text-[10px] text-slate-600">{authUser?.email}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 px-2 py-1 bg-white/5 rounded-lg border border-white/5">
                         <Crown className="w-3 h-3 text-amber-500" /> Owner
                      </div>
                   </div>

                   {/* Invited Members */}
                   {members.map((member) => (
                      <div key={member.userId} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.02] group transition-colors">
                        <div className="flex items-center gap-3">
                           <div className="w-9 h-9 rounded-full bg-white/5 border border-white/5 overflow-hidden flex items-center justify-center">
                              {member.user?.avatarUrl ? <img src={member.user.avatarUrl} alt="" className="w-full h-full object-cover" /> : <span className="text-xs font-bold text-slate-400">{member.user?.name?.charAt(0)}</span>}
                           </div>
                           <div>
                              <p className="text-xs font-bold text-white">{member.user?.name}</p>
                              <p className="text-[10px] text-slate-600">{member.user?.email}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-2">
                           <div className="text-[10px] font-bold text-slate-500 px-2 py-1 bg-white/5 rounded-lg border border-white/5 capitalize">
                              {member.role}
                           </div>
                           <button 
                            onClick={() => removeMember(member.userId)}
                            className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                           >
                              <Trash2 className="w-3.5 h-3.5" />
                           </button>
                        </div>
                      </div>
                   ))}
                </div>
              </div>
              
              {/* General Access Selector */}
              <div className="space-y-3 pt-2">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.1em] ml-1">General Access</h3>
                <div className="relative">
                   <div 
                    onClick={() => setShowAccessMenu(!showAccessMenu)}
                    className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/5 rounded-2xl cursor-pointer hover:bg-white/[0.05] transition-all group"
                   >
                     <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-white/5 border border-white/5 group-hover:scale-105 transition-transform`}>
                           {currentAccess.icon}
                        </div>
                        <div>
                           <p className="text-sm font-bold text-white">{currentAccess.label}</p>
                           <p className="text-[11px] text-slate-500">{currentAccess.desc}</p>
                        </div>
                     </div>
                     <ChevronDown className={`w-4 h-4 text-slate-600 transition-transform ${showAccessMenu ? 'rotate-180' : ''}`} />
                   </div>

                   <AnimatePresence>
                     {showAccessMenu && (
                       <motion.div 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute bottom-full left-0 right-0 mb-2 bg-[#16171d] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[100]"
                       >
                          {accessOptions.map((option) => (
                            <button
                              key={option.id}
                              onClick={() => updateVisibility(option.id)}
                              className={`w-full flex items-center gap-4 p-4 hover:bg-white/5 transition-all text-left ${visibility === option.id ? 'bg-[#1D9E75]/5' : ''}`}
                            >
                               <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5">
                                 {option.icon}
                               </div>
                               <div className="flex-1">
                                 <p className="text-xs font-bold text-white">{option.label}</p>
                                 <p className="text-[10px] text-slate-500">{option.desc}</p>
                               </div>
                               {visibility === option.id && <Check className="w-4 h-4 text-[#1D9E75]" />}
                            </button>
                          ))}
                       </motion.div>
                     )}
                   </AnimatePresence>
                </div>
              </div>

              {/* Share Link Card */}
              <AnimatePresence mode="wait">
                {isPublic && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-5 bg-gradient-to-br from-[#1D9E75]/10 to-black/20 border border-[#1D9E75]/20 rounded-[24px] space-y-4"
                  >
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-[#1D9E75]" />
                          <span className="text-[10px] font-bold text-[#1D9E75] uppercase tracking-wider">Public Link Active</span>
                       </div>
                       <a 
                        href={publicLink} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-[10px] font-bold text-slate-500 hover:text-white flex items-center gap-1 transition-colors"
                       >
                         View Page <ExternalLink className="w-2.5 h-2.5" />
                       </a>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-[11px] text-slate-400 font-medium truncate select-all">
                        {publicLink}
                      </div>
                      <button 
                        onClick={handleCopyLink}
                        className={`px-4 py-3 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${copied ? 'bg-[#1D9E75] text-white' : 'bg-white/5 text-slate-200 hover:bg-white/10'}`}
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4 text-slate-400" />}
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-black/20 rounded-xl border border-white/5">
                       <ShieldCheck className="w-4 h-4 text-[#1D9E75]/50 shrink-0 mt-0.5" />
                       <p className="text-[10px] text-slate-500 leading-relaxed">
                         Anyone with this <span className="text-slate-300 font-semibold italic">secret link</span> can view. Access can be revoked by changing to Restricted.
                       </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="p-6 bg-black/20 border-t border-white/5 mt-auto flex items-center justify-between">
               <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/5 rounded-xl text-[10px] font-bold text-slate-500">
                  <ShieldCheck className="w-3 h-3 text-[#1D9E75]" /> Encrypted Sharing
               </div>
               <button 
                onClick={onClose}
                className="px-8 py-3 bg-[#1D9E75] hover:bg-[#1D9E75]/80 text-white rounded-[18px] text-xs font-bold transition-all shadow-lg shadow-[#1D9E75]/20 cursor-pointer"
               >
                Done
               </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default ShareModal;
