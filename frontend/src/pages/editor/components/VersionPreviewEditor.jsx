import React, { useState, useEffect } from 'react';
import { BlockNoteView } from "@blocknote/shadcn";
import { useCreateBlockNote } from "@blocknote/react";
import "@blocknote/shadcn/style.css";
import { Loader2 } from 'lucide-react';
import * as Y from 'yjs';

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
      <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-[#050608]">
        <Loader2 className="h-8 w-8 animate-spin text-[#1D9E75]" />
        <span className="text-xs font-medium text-white/50">Loading Version History...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#050608] text-red-400">
        <span className="text-sm font-bold">Error: {error}</span>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-[#050608] animate-in fade-in duration-300">
      <div className="flex-1 overflow-y-auto py-10 opacity-70">
        <div className="mx-auto max-w-4xl px-8">
          <BlockNoteView 
            editor={editor} 
            editable={false} 
            theme="dark" 
            className="bn-shadcn"
          />
        </div>
      </div>
    </div>
  );
};

export default VersionPreviewEditor;
