import React from 'react';
import { 
  FileText, 
  Clock, 
  Loader2 
} from 'lucide-react';
import { Button } from '../ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import DocActions from './DocActions';
import { useDocStore } from '../../store/doc-store';

const RecentDocsSection = ({ documents, isLoading, onDelete, onNavigate, activeWorkspaceId, title = "Recent Documents" }) => {
  const { hasMoreDocs, loadMoreDocs, isLoadingMore } = useDocStore();
  return (
    <section>
      {title && (
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 bg-[#1c1c1c] rounded-lg flex items-center justify-center border border-[#2e2e2e]">
            <Clock className="w-4 h-4 text-[#4d4d4d]" />
          </div>
          <h2 className="text-[12px] font-medium uppercase tracking-[1.2px] text-[#898989]">{title}</h2>
        </div>
      )}

      
      <AnimatePresence mode="wait">
        <motion.div
          key={activeWorkspaceId}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {isLoading && documents.length === 0 ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl animate-pulse" />
              ))}
            </div>
          ) : documents.length > 0 ? (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div 
                  key={doc.id}
                  className="flex items-center gap-4 bg-[#1c1c1c] border border-[#242424] p-4 rounded-xl hover:border-[#3ecf8e]/30 transition-all cursor-pointer group shadow-sm hover:shadow-2xl hover:shadow-black/20"
                >
                  <div 
                    onClick={() => onNavigate(doc.id)}
                    className="flex flex-1 items-center gap-5 min-w-0 cursor-pointer"
                  >
                    <div className="w-11 h-11 bg-[#171717] text-[#4d4d4d] rounded-xl flex items-center justify-center border border-[#2e2e2e] group-hover:border-[#3ecf8e]/20 group-hover:bg-[#3ecf8e]/5 group-hover:text-[#3ecf8e] transition-all">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[15px] font-medium text-[#fafafa] group-hover:text-[#3ecf8e] transition-colors truncate mb-1">
                        {doc.title}
                      </h3>
                      <div className="flex items-center gap-4 text-[11px] text-[#898989] font-normal">
                        <span className="flex items-center gap-1.5">
                          Last edited {new Date(doc.updatedAt).toLocaleDateString()}
                        </span>
                        {doc.visibility === 'public' && (
                           <span className="flex items-center gap-1.5 text-[#3ecf8e] bg-[#3ecf8e]/5 px-2 py-0.5 rounded-full border border-[#3ecf8e]/10">
                             Public Link
                           </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <DocActions doc={doc} />
                </div>
              ))}
              
              {hasMoreDocs && (
                <div className="pt-6 pb-2 flex justify-center">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => loadMoreDocs(activeWorkspaceId)}
                    disabled={isLoadingMore}
                    className="border-[#2e2e2e] bg-[#1c1c1c] text-[#898989] hover:text-[#fafafa] hover:bg-[#242424] rounded-lg px-6"
                  >
                    {isLoadingMore ? (
                      <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading...</>
                    ) : (
                      'Load older documents'
                    )}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[#1c1c1c]/50 border border-dashed border-[#2e2e2e] rounded-xl py-24 flex flex-col items-center justify-center text-center px-4">
              <div className="w-20 h-20 bg-[#171717] rounded-full flex items-center justify-center mb-6 border border-[#2e2e2e]">
                <FileText className="w-10 h-10 text-[#2e2e2e]" />
              </div>
              <h3 className="text-[#fafafa] text-lg font-medium mb-3">
                {!title ? "No starred documents yet" : "Your workspace is empty"}
              </h3>
              <p className="text-[#898989] text-[14px] max-w-sm font-normal leading-relaxed">
                {!title 
                  ? "Star your most important documents to access them quickly from here." 
                  : "Start by creating a new document to organize your thoughts and collaborate with your team."}
              </p>
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </section>
  );
};

export default RecentDocsSection;
