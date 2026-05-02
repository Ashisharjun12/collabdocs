import React, { useState, useEffect } from 'react';
import { BlockNoteView } from "@blocknote/shadcn";
import { useCreateBlockNote } from "@blocknote/react";
import "@blocknote/shadcn/style.css";
import { Loader2, ShieldCheck, Eye } from 'lucide-react';
import * as Y from 'yjs';
import { motion } from 'framer-motion';

/**
 * Read-only version preview using BlockNote
 */
const VersionPreviewEditor = ({ version }) => {
  const [ydoc, setYdoc] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchSnapshot = async () => {
      try {
        setIsLoading(true);
        if (!version.url) throw new Error("No download URL available.");

        // Fetch binary Yjs update from R2
        const response = await fetch(version.url);
        if (!response.ok) throw new Error(`Download failed: ${response.statusText}`);
        
        const arrayBuffer = await response.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        const newYDoc = new Y.Doc();
        Y.applyUpdate(newYDoc, uint8Array);

        if (isMounted) setYdoc(newYDoc);
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchSnapshot();
    return () => { isMounted = false; };
  }, [version.url]);

  // Initialize BlockNote in read-only mode using the snapshot document
  const editor = useCreateBlockNote({
    collaboration: {
      fragment: ydoc ? ydoc.getXmlFragment("blocknote") : new Y.Doc().getXmlFragment("blocknote"),
    },
  }, [ydoc]); // Re-create when ydoc changes

  if (isLoading) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-6 bg-[#0f0f0f]">
        <div className="relative">
           <Loader2 className="h-12 w-12 animate-spin text-[#3ecf8e]" />
           <div className="absolute inset-0 blur-xl bg-[#3ecf8e]/20 rounded-full animate-pulse" />
        </div>
        <span className="text-[11px] font-bold text-[#4d4d4d] uppercase tracking-[3px]">Retrieving Snapshot...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#0f0f0f] text-[#f36a88]">
        <div className="bg-[#f36a88]/10 border border-[#f36a88]/20 px-6 py-3 rounded-2xl flex items-center gap-3">
           <ShieldCheck className="w-5 h-5" />
           <span className="text-sm font-medium">Snapshot Error: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-50 flex flex-col bg-[#0f0f0f] overflow-hidden"
    >
      <div className="flex-1 overflow-y-auto pt-24 pb-32 transition-opacity duration-1000">
        <div className="mx-auto max-w-4xl px-8">
          <BlockNoteView 
            editor={editor} 
            theme="dark" 
            editable={false}
            className="bn-shadcn"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default VersionPreviewEditor;
