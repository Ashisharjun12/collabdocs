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
        <Loader2 className="w-10 h-10 text-[#1D9E75] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-10">
      {view !== 'starred' && (
        <>
          {/* Create Section - horizontal wide boxes */}
          <CreateDocSection onOpenModal={() => setIsCreateModalOpen(true)} />
          <div className="h-px bg-gradient-to-r from-[#1e2130] via-[#2a2d3a] to-[#1e2130] mb-8 opacity-50" />
          
          {/* Filter Tabs */}
          <div className="flex items-center gap-2 mb-6">
            {['active', 'archived', 'all'].map((filterTab) => (
              <button
                key={filterTab}
                onClick={() => fetchDocuments(activeWorkspace.id, filterTab, 1)}
                className={`px-4 py-2 rounded-full text-xs font-bold capitalize transition-all ${
                  docsStatus === filterTab
                    ? 'bg-[#1D9E75]/10 text-[#1D9E75] border border-[#1D9E75]/20'
                    : 'bg-[#13151f] text-slate-400 border border-[#1e2130] hover:text-white hover:border-slate-700'
                }`}
              >
                {filterTab} Documents
              </button>
            ))}
          </div>
        </>
      )}

      {view === 'starred' && (
        <div className="mb-8">
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1D9E75]/10 flex items-center justify-center border border-[#1D9E75]/20">
              <Star className="w-5 h-5 text-[#1D9E75]" />
            </div>
            Starred Documents
          </h1>
          <p className="text-slate-500 text-sm mt-2 font-medium">All your favorited documents in {activeWorkspace.name}</p>
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
