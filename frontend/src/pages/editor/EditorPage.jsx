import React, { useState } from 'react';
import * as Y from 'yjs';
import { useParams, useNavigate } from 'react-router-dom';
import { Archive } from 'lucide-react';
import { useAuthStore } from '../../store/auth-store';
import { useWorkspaceStore } from '../../store/workspace-store';
import { useLayoutStore } from '../../store/layout-store';
import EditorHeader from './components/EditorHeader';
import LeftSidebar from './components/LeftSidebar';
import RightSidebar from './components/RightSidebar';
import CollaborativeEditor from './components/CollaborativeEditor';
import VersionPreviewEditor from './components/VersionPreviewEditor';
import VersionHistoryHeader from './components/VersionHistoryHeader';
import VersionHistorySidebar from './components/VersionHistorySidebar';
import CollaborationProvider from '../../services/CollaborationProvider';
import { useHocuspocusProvider } from '@hocuspocus/provider-react';
import { offlineSupport } from '../../services/OfflineSupportService';
import { useDocStore } from '../../store/doc-store';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const StatusPoller = ({ docId }) => {
  const { setActiveDocument } = useDocStore();
  
  React.useEffect(() => {
    let stopped = false;

    const poll = setInterval(async () => {
      if (stopped) return;
      try {
        const { docApi } = await import('../../services/api');
        const response = await docApi.getDocById(docId);
        const doc = response.data.data.doc;
        
        if (doc.importStatus === 'active') {
          stopped = true;
          clearInterval(poll);
          // Store imported blocks in sessionStorage so the editor can load them on mount
          if (doc.importedBlocks) {
            sessionStorage.setItem(`import-blocks-${docId}`, doc.importedBlocks);
          }
          setActiveDocument(doc);  // triggers re-render → CollaborationProvider remounts
        } else if (doc.importStatus === 'failed') {
          stopped = true;
          clearInterval(poll);
          toast.error('Import failed. Please try again.');
          setActiveDocument({ ...doc, importStatus: 'active' }); // show editor anyway
        }
      } catch (err) {
        console.error('[StatusPoller] polling failed:', err);
      }
    }, 2000);
    
    return () => { stopped = true; clearInterval(poll); };
  }, [docId, setActiveDocument]);
  
  return null;
};

const EditorWorkspace = ({ docId, authUser }) => {
  const provider = useHocuspocusProvider();
  const [isSynced, setIsSynced] = useState(false);
  const navigate = useNavigate();
  
  // Layout State
  const { isLeftOpen, setLeftOpen, isRightOpen, setRightOpen } = useLayoutStore();
  
  // Version History State
  const [isHistoryMode, setIsHistoryMode] = useState(false);
  const [previewVersion, setPreviewVersion] = useState(null);
  
  // Live Editor State
  const [liveEditor, setLiveEditor] = useState(null);
  
  // Native Print Logic
  const handlePrint = () => {
    window.print();
  };
  
  const { isOfflineEnabled, activeDocument } = useDocStore();

  // Track sync state — don't render the editor until Hocuspocus has synced
  React.useEffect(() => {
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

  // Initialize Offline IndexedDB Support dynamically
  React.useEffect(() => {
    if (!provider || !provider.document || !docId || !isSynced) return;
    if (isOfflineEnabled) {
      offlineSupport.init(docId, provider.document);
    } else {
      offlineSupport.destroy();
    }
    return () => { offlineSupport.destroy(); };
  }, [provider, docId, isOfflineEnabled, isSynced]);

  const handleRestore = async () => {
    if (!liveEditor || !previewVersion) return;
    
    try {
      const { toast } = await import('sonner');
      const response = await fetch(previewVersion.url);
      const arrayBuffer = await response.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      const tempDoc = new Y.Doc();
      Y.applyUpdate(tempDoc, uint8Array);
      
      const { yXmlFragmentToBlocks } = await import("@blocknote/core/yjs");
      const snapshotBlocks = yXmlFragmentToBlocks(liveEditor, tempDoc.getXmlFragment("blocknote"));
      
      liveEditor.replaceBlocks(liveEditor.topLevelBlocks, snapshotBlocks);
      
      toast.success("Document restored!");
      setIsHistoryMode(false);
      setPreviewVersion(null);
    } catch (err) {
      console.error("Restore failed:", err);
    }
  };  return (
    <div className="flex flex-col w-full h-full bg-[#171717] overflow-hidden">
      
      {/* 1. TOP HEADER (Full Width - Always on top) */}
      <div className="z-[100] shrink-0">
        {isHistoryMode ? (
          <VersionHistoryHeader 
            onExit={() => {
              setIsHistoryMode(false);
              setPreviewVersion(null);
            }}
            onRestore={handleRestore}
            previewVersion={previewVersion}
          />
        ) : (
          <EditorHeader 
            onToggleLeft={() => setLeftOpen(!isLeftOpen)}
            onToggleRight={() => setRightOpen(!isRightOpen)}
            isLeftOpen={isLeftOpen}
            isRightOpen={isRightOpen}
            editor={liveEditor}
          />
        )}
      </div>

      {/* 2. MAIN WORKSPACE (Sidebars + Editor) */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Mobile Backdrop */}
        <AnimatePresence>
          {(isLeftOpen || isRightOpen) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setLeftOpen(false);
                setRightOpen(false);
              }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[140] lg:hidden"
            />
          )}
        </AnimatePresence>

        {/* Left Sidebar */}
        {!isHistoryMode && (
          <div className={`fixed inset-y-0 left-0 z-[150] lg:relative lg:z-30 transition-all duration-500 ease-in-out ${isLeftOpen ? 'translate-x-0 lg:w-[280px] lg:opacity-100' : '-translate-x-full lg:w-0 lg:opacity-0 lg:pointer-events-none'}`}>
            <LeftSidebar 
              isOpen={isLeftOpen} 
              onEnterHistoryMode={() => setIsHistoryMode(true)} 
              onPrint={handlePrint}
              editor={liveEditor}
              provider={provider}
            />
          </div>
        )}

        {/* Center: Editor Column */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#171717] relative overflow-hidden">
          {/* Archived Banner */}
          {!isHistoryMode && activeDocument?.isArchived && (
            <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-1.5 flex items-center justify-between z-[50] shrink-0">
              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Read Only Mode</span>
            </div>
          )}

          {/* Editor Surface */}
          <div className="flex-1 relative overflow-hidden custom-scrollbar">
            {isHistoryMode ? (
              previewVersion ? (
                <VersionPreviewEditor version={previewVersion} />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#4d4d4d] text-[10px] font-bold uppercase tracking-[2px] px-4 text-center">
                  Loading snapshots...
                </div>
              )
            ) : !isSynced ? (
              <div className="flex flex-col h-full w-full items-center justify-center gap-4 bg-[#171717]">
                <div className="w-8 h-8 border-2 border-[#3ecf8e] border-t-transparent rounded-full animate-spin" />
                <span className="text-[10px] text-[#4d4d4d] uppercase tracking-[2px] font-bold">Connecting</span>
              </div>
            ) : (
              <CollaborativeEditor 
                doc={provider.document}
                provider={provider}
                docId={docId}
                user={{
                  name: authUser?.name || authUser?.username,
                  id: authUser?.id,
                  avatarUrl: authUser?.avatarUrl
                }}
                onEditorReady={setLiveEditor}
              />
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className={`fixed inset-y-0 right-0 z-[150] lg:relative lg:z-30 transition-all duration-500 ease-in-out ${isRightOpen ? 'translate-x-0 lg:w-[340px] lg:opacity-100' : 'translate-x-full lg:w-0 lg:opacity-0 lg:pointer-events-none'}`}>
          {isHistoryMode ? (
            <VersionHistorySidebar 
              previewVersion={previewVersion} 
              setPreviewVersion={setPreviewVersion} 
            />
          ) : (
            <RightSidebar 
              isOpen={isRightOpen} 
              docId={docId}
              provider={provider}
              editor={liveEditor}
              onEnterHistoryMode={() => setIsHistoryMode(true)}
              onPrint={handlePrint}
            />
          )}
        </div>
      </div>

    </div>
  );
};

const EditorPage = () => {
  const { docId } = useParams();
  const { authUser, accessToken } = useAuthStore();
  const { activeDocument, setActiveDocument } = useDocStore();
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    const { fetchWorkspaceDetails } = useWorkspaceStore.getState();
    const fetchDoc = async () => {
      if (!docId) return;
      try {
        const { docApi } = await import('../../services/api');
        const response = await docApi.getDocById(docId);
        const doc = response.data.data.doc;
        setActiveDocument(doc);
        
        if (doc.importStatus === 'active' && doc.importedBlocks) {
          const storageKey = `import-blocks-${docId}`;
          if (!sessionStorage.getItem(storageKey)) {
            sessionStorage.setItem(storageKey, doc.importedBlocks);
          }
        }
        
        if (doc.workspaceId) {
          const workspace = await fetchWorkspaceDetails(doc.workspaceId);
          useWorkspaceStore.getState().setActiveWorkspace(workspace);
        }
      } catch (error) {
        console.error("Failed to fetch document metadata:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDoc();
    return () => setActiveDocument(null);
  }, [docId, setActiveDocument]);

  if (!accessToken || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#171717]">
        <div className="w-10 h-10 border-2 border-[#3ecf8e] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (activeDocument?.importStatus === 'importing') {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-[#171717] px-6">
        <div className="relative mb-10 group">
          <div className="w-24 h-24 rounded-3xl bg-[#1c1c1c] border border-[#2e2e2e] flex items-center justify-center shadow-2xl transition-all duration-500 group-hover:border-[#3ecf8e]/30 group-hover:scale-105">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#3ecf8e]">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
          </div>
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '4s' }}>
            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#3ecf8e] rounded-full shadow-lg shadow-[#3ecf8e]/50 border-2 border-[#171717]" />
          </div>
        </div>

        <h2 className="text-2xl font-medium text-[#fafafa] mb-2 tracking-tight">
          Preparing your document
        </h2>
        <p className="text-[#898989] text-sm max-w-sm text-center leading-relaxed mb-10">
          We&apos;re reading your file and setting up the collaborative environment. This won&apos;t take long.
        </p>

        <div className="flex flex-col gap-3 w-full max-w-[240px]">
          {[
            { label: 'Uploading resource', done: true },
            { label: 'Converting content', done: false, active: true },
            { label: 'Initializing editor', done: false },
          ].map(({ label, done, active }) => (
            <div key={label} className="flex items-center gap-4">
              <div className={`w-5 h-5 rounded-lg flex-shrink-0 flex items-center justify-center border transition-all duration-500 ${
                done
                  ? 'border-[#3ecf8e] bg-[#3ecf8e]'
                  : active
                    ? 'border-[#3ecf8e] bg-transparent shadow-[0_0_10px_rgba(62,207,142,0.2)]'
                    : 'border-[#2e2e2e] bg-transparent'
              }`}>
                {done && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="#171717" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
                {active && (
                  <div className="w-1.5 h-1.5 bg-[#3ecf8e] rounded-full animate-pulse" />
                )}
              </div>
              <span className={`text-xs font-medium tracking-tight ${
                done ? 'text-[#fafafa]' : active ? 'text-[#3ecf8e]' : 'text-[#4d4d4d]'
              }`}>
                {label}
              </span>
            </div>
          ))}
        </div>

        <StatusPoller docId={docId} />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#171717] text-[#fafafa] overflow-hidden font-sans selection:bg-[#3ecf8e]/30">

      <CollaborationProvider 
        key={`${docId}-${activeDocument?.importStatus}`} 
        docId={docId} 
        token={accessToken}
      >
        <EditorWorkspace docId={docId} authUser={authUser} />
      </CollaborationProvider>
    </div>
  );
};

export default EditorPage;