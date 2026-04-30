import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { docApi } from '../../services/api';
import CollaborativeEditor from './components/CollaborativeEditor';
import CollaborationProvider from '../../services/CollaborationProvider';
import { useDocStore } from '../../store/doc-store';
import { motion } from 'framer-motion';
import { Globe, ShieldAlert } from 'lucide-react';
import { useAuthStore } from '../../store/auth-store';
import { useHocuspocusProvider } from '@hocuspocus/provider-react';


// ── Wrapper to wait for Sync and get Doc ──────────────────────────────────
const PublicEditorContent = ({ docId, viewerUser }) => {
  const provider = useHocuspocusProvider();
  const [isSynced, setIsSynced] = useState(false);

  useEffect(() => {
    if (!provider) return;
    const onSynced = () => setIsSynced(true);
    const onDisconnect = () => setIsSynced(false);
    provider.on('synced', onSynced);
    provider.on('disconnect', onDisconnect);
    if (provider.isSynced) setIsSynced(true);
    return () => {
      provider.off('synced', onSynced);
      provider.off('disconnect', onDisconnect);
    };
  }, [provider]);

  // Broadcast guest identity once synced
  useEffect(() => {
    if (!provider || !isSynced) return;
    provider.setAwarenessField('user', {
      name: viewerUser.name,
      color: viewerUser.color,
      avatarUrl: viewerUser.avatarUrl || null,
      isGuest: viewerUser.isGuest || false,
    });
  }, [provider, isSynced, viewerUser]);

  if (!isSynced) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <div className="w-10 h-10 border-4 border-[#1D9E75] border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 font-medium text-xs uppercase tracking-widest animate-pulse">Syncing document...</p>
      </div>
    );
  }

  return (
    <CollaborativeEditor 
      doc={provider.document}
      provider={provider}
      docId={docId}
      user={viewerUser}
      readOnly={true}
    />
  );
};




const PublicEditorPage = () => {
  const { slug } = useParams();
  const [doc, setDoc] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { setActiveDocument } = useDocStore();
  const { authUser } = useAuthStore();

  // Generate a random guest identity if not logged in
  const viewerUser = React.useMemo(() => {
    if (authUser) return {
      id: authUser.id,
      name: authUser.name || authUser.username || 'Collaborator',
      avatarUrl: authUser.avatarUrl,

      color: '#1D9E75'
    };
    
    // Stable random ID for the session
    let sessionGuestId = sessionStorage.getItem('guest_id');
    if (!sessionGuestId) {
      sessionGuestId = `guest-${Math.random().toString(36).substr(2, 6)}`;
      sessionStorage.setItem('guest_id', sessionGuestId);
    }
    
    const colors = ['#64748b', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    return {
      id: sessionGuestId,
      name: `Guest ${sessionGuestId.split('-')[1].toUpperCase()}`,
      color: randomColor,
      isGuest: true
    };

  }, [authUser]);

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const response = await docApi.getPublicDocBySlug(slug);
        const publicDoc = response.data.data.doc;
        setDoc(publicDoc);
        setActiveDocument(publicDoc);
      } catch (err) {
        console.error('[PublicEditorPage] Failed to fetch:', err);
        setError(err.response?.data?.message || 'Document not found or private');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDoc();
    return () => setActiveDocument(null);
  }, [slug, setActiveDocument]);

  if (isLoading) {
    return (
      <div className="h-screen w-full bg-[#0a0b10] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#1D9E75] border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 font-medium animate-pulse text-sm">Loading public document...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-full bg-[#0a0b10] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white/5 border border-white/10 rounded-2xl p-8 text-center"
        >
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-slate-400 text-sm mb-6">{error}</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-bold transition-all"
          >
            Go to Homepage
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-[#0a0b10] overflow-hidden flex flex-col">
      {/* Mini Public Header */}
      <header className="h-12 border-b border-white/5 flex items-center justify-between px-6 bg-[#0a0b10]/60 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-[#1D9E75]/20 rounded flex items-center justify-center">
            <Globe className="w-3.5 h-3.5 text-[#1D9E75]" />
          </div>
          <span className="text-sm font-bold text-slate-200 truncate max-w-[300px]">{doc.title}</span>
          <span className="text-[10px] px-1.5 py-0.5 bg-white/5 text-slate-500 rounded font-bold uppercase tracking-wider">Public View</span>
        </div>
        <div className="flex items-center gap-4">
           <span className="text-[10px] text-slate-500 font-medium hidden sm:inline">Powered by CollabDocs</span>
           <button 
            onClick={() => window.location.href = '/signup'}
            className="px-3 py-1.5 bg-[#1D9E75] text-white rounded-lg text-[10px] font-bold hover:bg-[#1D9E75]/80 transition-all shadow-lg shadow-[#1D9E75]/20"
           >
            Create Your Own
           </button>
        </div>
      </header>

      {/* Editor Area - Centered, Read-Only, No Sidebar */}
      <main className="flex-1 overflow-y-auto custom-scrollbar relative bg-[#0d0e14]">
        <CollaborationProvider docId={doc.id} token={null}>
          <div className="max-w-screen-xl mx-auto py-12 px-4 md:px-8">
             <PublicEditorContent docId={doc.id} viewerUser={viewerUser} />
          </div>
        </CollaborationProvider>


      </main>
    </div>
  );
};

export default PublicEditorPage;
