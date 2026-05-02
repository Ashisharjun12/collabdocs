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
  Crown,
  Sparkles
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
      icon: <Lock className="w-3.5 h-3.5" />,
      color: '#f36a88'
    },
    { 
      id: 'workspace', 
      label: 'Workspace', 
      desc: 'Anyone in your team', 
      icon: <Users className="w-3.5 h-3.5" />,
      color: '#8499f5'
    },
    { 
      id: 'public', 
      label: 'Anyone with link', 
      desc: 'Public on the web', 
      icon: <Globe2 className="w-3.5 h-3.5" />,
      color: '#3ecf8e'
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
            className="absolute inset-0 bg-[#0f0f0f]/90 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            className="relative w-full max-w-xl bg-[#171717] border border-[#2e2e2e] rounded-[24px] shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header Area */}
            <div className="px-8 pt-8 pb-6 flex items-center justify-between border-b border-[#242424]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#0f0f0f] border border-[#2e2e2e] flex items-center justify-center text-[#3ecf8e] shadow-inner">
                  <Share2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-[18px] font-medium text-[#fafafa] tracking-tight">Share & Collaborate</h2>
                  <p className="text-[12px] text-[#898989] font-normal flex items-center gap-2">
                     <span className="truncate max-w-[200px]">{activeDocument.title}</span>
                     <span className="opacity-30">•</span>
                     <span className="text-[#3ecf8e] uppercase tracking-wider text-[10px] font-bold">Encrypted</span>
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-[#242424] rounded-full text-[#4d4d4d] hover:text-[#fafafa] transition-all cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Workspace */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8 max-h-[65vh]">
              
              {/* Invite Bar */}
              <div className="space-y-3">
                 <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-[#4d4d4d]">
                       <Search className="w-4 h-4" />
                    </div>
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={onSearchChange}
                      placeholder="Add colleagues by name or email..."
                      className="w-full bg-[#0f0f0f] border border-[#2e2e2e] rounded-2xl pl-11 pr-4 py-4 text-[14px] text-[#fafafa] focus:outline-none focus:border-[#3ecf8e]/40 focus:ring-4 focus:ring-[#3ecf8e]/5 transition-all placeholder:text-[#4d4d4d]"
                    />
                    
                    {/* Search Results */}
                    <AnimatePresence>
                      {searchResults.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute top-full left-0 right-0 mt-3 bg-[#1c1c1c] border border-[#2e2e2e] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden z-[200]"
                        >
                          {searchResults.map((user) => (
                            <button
                              key={user.id}
                              onClick={() => addMember(user)}
                              className="w-full flex items-center gap-4 p-4 hover:bg-[#242424] transition-all text-left group"
                            >
                              <div className="w-10 h-10 rounded-full bg-[#2e2e2e] border border-[#363636] flex items-center justify-center overflow-hidden">
                                 {user.avatarUrl ? (
                                   <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                                 ) : (
                                   <span className="text-xs font-bold text-[#fafafa]">{user.name.charAt(0).toUpperCase()}</span>
                                 )}
                              </div>
                              <div className="flex-1">
                                <p className="text-[13px] font-medium text-[#fafafa]">{user.name}</p>
                                <p className="text-[11px] text-[#898989]">{user.email}</p>
                              </div>
                              <div className="w-8 h-8 rounded-lg bg-[#3ecf8e]/10 flex items-center justify-center text-[#3ecf8e] opacity-0 group-hover:opacity-100 transition-opacity">
                                <UserPlus className="w-4 h-4" />
                              </div>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                 </div>
              </div>

              {/* Members Grid */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                   <h3 className="text-[11px] font-bold text-[#4d4d4d] uppercase tracking-[2px]">Team with access</h3>
                   <span className="text-[10px] text-[#4d4d4d]">{members.length + 1} members</span>
                </div>
                <div className="space-y-2">
                   {/* Owner Card */}
                   <div className="flex items-center justify-between p-4 bg-[#0f0f0f]/40 border border-[#2e2e2e] rounded-2xl">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-full bg-[#1c1c1c] border border-[#2e2e2e] overflow-hidden flex items-center justify-center ring-2 ring-[#3ecf8e]/20 ring-offset-2 ring-offset-[#171717]">
                            {authUser?.avatarUrl ? <img src={authUser.avatarUrl} alt="" className="w-full h-full object-cover" /> : <span className="text-xs font-bold text-[#fafafa]">{authUser?.name?.charAt(0)}</span>}
                         </div>
                         <div>
                            <p className="text-[13px] font-medium text-[#fafafa]">{authUser?.name}</p>
                            <p className="text-[11px] text-[#4d4d4d]">{authUser?.email}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1 bg-[#3ecf8e]/10 border border-[#3ecf8e]/20 rounded-full">
                         <Crown className="w-3 h-3 text-[#3ecf8e]" />
                         <span className="text-[10px] font-bold text-[#3ecf8e] uppercase tracking-wider">Owner</span>
                      </div>
                   </div>

                   {/* Other Members */}
                   {members.map((member) => (
                      <div key={member.userId} className="flex items-center justify-between p-4 hover:bg-[#0f0f0f]/40 border border-transparent hover:border-[#2e2e2e] rounded-2xl group transition-all">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-full bg-[#1c1c1c] border border-[#2e2e2e] overflow-hidden flex items-center justify-center">
                              {member.user?.avatarUrl ? <img src={member.user.avatarUrl} alt="" className="w-full h-full object-cover" /> : <span className="text-xs font-bold text-[#898989]">{member.user?.name?.charAt(0)}</span>}
                           </div>
                           <div>
                              <p className="text-[13px] font-medium text-[#fafafa]">{member.user?.name}</p>
                              <p className="text-[11px] text-[#4d4d4d]">{member.user?.email}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-3">
                           <span className="text-[11px] font-medium text-[#898989] px-3 py-1 bg-[#242424] rounded-full border border-[#2e2e2e] capitalize">
                              {member.role}
                           </span>
                           <button 
                             onClick={() => removeMember(member.userId)}
                             className="p-2 text-[#4d4d4d] hover:text-[#f36a88] hover:bg-[#f36a88]/10 rounded-xl transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                           >
                              <Trash2 className="w-4 h-4" />
                           </button>
                        </div>
                      </div>
                   ))}
                </div>
              </div>
              
              {/* Privacy & Sharing Section */}
              <div className="space-y-4 pt-4">
                <h3 className="text-[11px] font-bold text-[#4d4d4d] uppercase tracking-[2px] ml-1">Privacy & Reach</h3>
                
                <div className="relative">
                   <div 
                    onClick={() => setShowAccessMenu(!showAccessMenu)}
                    className="flex items-center justify-between p-5 bg-[#0f0f0f] border border-[#2e2e2e] rounded-2xl cursor-pointer hover:bg-[#1c1c1c] hover:border-[#3ecf8e]/30 transition-all group"
                   >
                     <div className="flex items-center gap-4">
                        <div 
                          className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110"
                          style={{ backgroundColor: `${currentAccess.color}15`, border: `1px solid ${currentAccess.color}30` }}
                        >
                           {React.cloneElement(currentAccess.icon, { style: { color: currentAccess.color } })}
                        </div>
                        <div>
                           <p className="text-[15px] font-medium text-[#fafafa]">{currentAccess.label}</p>
                           <p className="text-[12px] text-[#898989]">{currentAccess.desc}</p>
                        </div>
                     </div>
                     <ChevronDown className={`w-5 h-5 text-[#4d4d4d] transition-transform duration-300 ${showAccessMenu ? 'rotate-180 text-[#3ecf8e]' : ''}`} />
                   </div>

                   <AnimatePresence>
                     {showAccessMenu && (
                       <motion.div 
                        initial={{ opacity: 0, scale: 0.98, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98, y: 10 }}
                        className="absolute bottom-full left-0 right-0 mb-3 bg-[#1c1c1c] border border-[#2e2e2e] rounded-2xl shadow-2xl overflow-hidden z-[100]"
                       >
                          {accessOptions.map((option) => (
                            <button
                              key={option.id}
                              onClick={() => updateVisibility(option.id)}
                              className={`w-full flex items-center gap-5 p-5 hover:bg-[#242424] transition-all text-left ${visibility === option.id ? 'bg-[#3ecf8e]/5' : ''}`}
                            >
                               <div 
                                 className="w-10 h-10 rounded-xl flex items-center justify-center"
                                 style={{ backgroundColor: `${option.color}15` }}
                               >
                                 {React.cloneElement(option.icon, { style: { color: option.color } })}
                               </div>
                               <div className="flex-1">
                                 <p className="text-[14px] font-medium text-[#fafafa]">{option.label}</p>
                                 <p className="text-[11px] text-[#898989]">{option.desc}</p>
                               </div>
                               {visibility === option.id && <Check className="w-4 h-4 text-[#3ecf8e]" />}
                            </button>
                          ))}
                       </motion.div>
                     )}
                   </AnimatePresence>
                </div>
              </div>

              {/* Public Link Engine */}
              <AnimatePresence mode="wait">
                {isPublic && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="p-6 bg-gradient-to-br from-[#171717] to-[#0f0f0f] border border-[#3ecf8e]/20 rounded-[28px] space-y-5 relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2.5">
                          <div className="w-2 h-2 rounded-full bg-[#3ecf8e] animate-pulse" />
                          <span className="text-[10px] font-bold text-[#3ecf8e] uppercase tracking-[2px]">Public Page Live</span>
                       </div>
                       <a 
                        href={publicLink} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-[11px] font-bold text-[#4d4d4d] hover:text-[#fafafa] flex items-center gap-1.5 transition-colors group"
                       >
                         Preview <ExternalLink className="w-3 h-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                       </a>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-[#0f0f0f] border border-[#2e2e2e] rounded-xl px-5 py-4 text-[13px] text-[#898989] font-normal truncate select-all">
                        {publicLink}
                      </div>
                      <button 
                        onClick={handleCopyLink}
                        className={`h-full px-6 py-4 rounded-xl font-bold text-[13px] transition-all flex items-center gap-2 cursor-pointer shadow-lg ${copied ? 'bg-[#3ecf8e] text-[#171717]' : 'bg-[#1c1c1c] text-[#fafafa] border border-[#2e2e2e] hover:bg-[#242424]'}`}
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-[#3ecf8e]/5 rounded-2xl border border-[#3ecf8e]/10">
                       <ShieldCheck className="w-5 h-5 text-[#3ecf8e]/40 shrink-0 mt-0.5" />
                       <p className="text-[12px] text-[#898989] leading-relaxed">
                         Anyone with this link can view. Changes made in the editor sync instantly to the public page.
                       </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Premium Bottom Action */}
            <div className="px-8 py-6 bg-[#0f0f0f] border-t border-[#242424] flex items-center justify-between">
               <div className="flex items-center gap-2 text-[12px] font-medium text-[#4d4d4d]">
                  <Globe className="w-4 h-4" />
                  <span>Public documents are indexed by Google</span>
               </div>
               <button 
                onClick={onClose}
                className="px-10 py-3 bg-[#3ecf8e] hover:bg-[#00c573] text-[#171717] rounded-full text-[14px] font-bold transition-all shadow-[0_0_20px_rgba(62,207,142,0.1)] active:scale-95 cursor-pointer"
               >
                Finish Setup
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
