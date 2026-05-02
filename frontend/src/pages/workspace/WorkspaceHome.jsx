import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWorkspaceStore } from '../../store/workspace-store';
import { useDocStore } from '../../store/doc-store';
import { Loader2, Star } from 'lucide-react';

import CreateDocModal from '../../components/CreateDocModal';
import CreateDocSection from '../../components/docs/CreateDocSection';
import RecentDocsSection from '../../components/docs/RecentDocsSection';

const WorkspaceHome = ({ view }) => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { workspaces, activeWorkspace, setActiveWorkspace } = useWorkspaceStore();
  const { 
    documents, 
    fetchDocuments, 
    deleteDocument,
    isLoading: isDocsLoading,
    docsStatus,
    starredDocuments,
    fetchFavorites
  } = useDocStore();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (workspaces.length > 0) {
      const workspace = workspaces.find(ws => ws.slug === slug);
      if (workspace) {
        setActiveWorkspace(workspace);
      } else {
        setActiveWorkspace(workspaces[0]);
        navigate(`/dashboard/workspace/${workspaces[0].slug}`, { replace: true });
      }
    }
  }, [slug, workspaces, setActiveWorkspace, navigate]);

  useEffect(() => {
    if (activeWorkspace) {
      if (view === 'starred') {
        fetchFavorites(activeWorkspace.id);
      } else {
        fetchDocuments(activeWorkspace.id);
      }
    }
  }, [activeWorkspace?.id, fetchDocuments, fetchFavorites, view]);


  const handleNavigateToDoc = (docId) => {
    navigate(`/dashboard/workspace/${slug}/doc/${docId}`);
  };

  if (!activeWorkspace) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <Loader2 className="w-10 h-10 text-[#3ecf8e] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-10 selection:bg-[#3ecf8e]/30 selection:text-[#fafafa]">
      {view !== 'starred' && (
        <>
          {/* Create Section - horizontal wide boxes */}
          <CreateDocSection onOpenModal={() => setIsCreateModalOpen(true)} />
          <div className="h-px bg-[#2e2e2e] mb-12 opacity-50" />
          
          {/* Filter Tabs */}
          <div className="flex items-center gap-2 mb-8">
            {['active', 'archived', 'all'].map((filterTab) => (
              <button
                key={filterTab}
                onClick={() => fetchDocuments(activeWorkspace.id, filterTab, 1)}
                className={`px-4 py-2 rounded-lg text-[13px] font-medium capitalize transition-all cursor-pointer ${
                  docsStatus === filterTab
                    ? 'bg-[#3ecf8e]/10 text-[#3ecf8e] border border-[#3ecf8e]/20'
                    : 'bg-[#1c1c1c] text-[#898989] border border-[#2e2e2e] hover:text-[#fafafa] hover:border-[#4d4d4d]'
                }`}
              >
                {filterTab} Documents
              </button>
            ))}
          </div>
        </>
      )}

      {view === 'starred' && (
        <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-2xl font-medium text-[#fafafa] tracking-tight flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#3ecf8e]/10 flex items-center justify-center border border-[#3ecf8e]/20">
              <Star className="w-6 h-6 text-[#3ecf8e]" />
            </div>
            Starred Documents
          </h1>
          <p className="text-[#898989] text-[14px] mt-3 font-normal">All your favorited documents in {activeWorkspace.name}</p>
        </div>
      )}

      {/* Recent Documents Section */}
      <RecentDocsSection 
        documents={view === 'starred' ? starredDocuments : documents}
        isLoading={isDocsLoading}
        onDelete={deleteDocument}
        onNavigate={handleNavigateToDoc}
        activeWorkspaceId={activeWorkspace.id}
        title={view === 'starred' ? "" : "Recent Documents"}
      />


      <CreateDocModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)}
        workspaceId={activeWorkspace?.id}
        workspaceSlug={slug}
      />
    </div>
  );
};

export default WorkspaceHome;
