import React, { useState, useEffect, useMemo, useRef } from "react";
import { BlockNoteView } from "@blocknote/shadcn";
import { useCreateBlockNote } from "@blocknote/react";
import { createExtension, getDefaultSlashMenuItems } from "@blocknote/core";
import { Youtube } from "@tiptap/extension-youtube";
import "@blocknote/shadcn/style.css";
import { uploadApi } from "@/services/api";
import axios from "axios";
import { Video, EyeOff, Zap } from "lucide-react";
import { usePageBreaker } from "../hooks/usePageBreaker";
import { useLayoutStore } from "../../../store/layout-store";
import { useDocStore } from "../../../store/doc-store";

const CURSOR_COLORS = ["#3ecf8e", "#3b82f6", "#ef4444", "#f59e0b", "#8b5cf6", "#ec4899", "#10b981", "#f97316"];

// Page sizes: width × height in cm
const PAGE_SIZES = { A4: [21, 29.7], Letter: [21.59, 27.94], Legal: [21.59, 35.56], A3: [29.7, 42] };
const CM_TO_PX = 37.795; // 1cm at 96dpi

const CollaborativeEditor = ({ doc, provider, user, onEditorReady, docId, readOnly = false }) => {
  const { isZenMode } = useLayoutStore();
  const { activeDocument } = useDocStore();


  const [pageSettings, setPageSettings] = useState({
    mode: 'pages',           // 'pages' | 'pageless'
    orientation: 'portrait',
    pageSize: 'A4',
    backgroundColor: '#ffffff',
    margins: { top: '2.54', bottom: '2.54', left: '2.54', right: '2.54' },
  });

  // Sync page settings from shared Yjs map
  useEffect(() => {
    if (!provider) return;
    const yMap = provider.document.getMap('settings');
    const update = () => {
      const data = yMap.toJSON();
      if (Object.keys(data).length > 0) setPageSettings(p => ({ ...p, ...data }));
    };
    yMap.observe(update);
    update();
    return () => yMap.unobserve(update);
  }, [provider]);

  // ── Computed page geometry ────────────────────────────────────────────────
  const { pageBg, pageWidthCm, pageHeightCm, marginTopPx, marginBottomPx, marginLeftPx, marginRightPx } = useMemo(() => {
    const [wCm, hCm] = PAGE_SIZES[pageSettings.pageSize] || PAGE_SIZES.A4;
    const isP = pageSettings.orientation === 'portrait';
    const m = pageSettings.margins || { top: '2.54', bottom: '2.54', left: '2.54', right: '2.54' };
    return {
      pageBg: pageSettings.backgroundColor || '#ffffff',
      pageWidthCm:  isP ? wCm : hCm,
      pageHeightCm: isP ? hCm : wCm,
      marginTopPx:    parseFloat(m.top)    * CM_TO_PX,
      marginBottomPx: parseFloat(m.bottom) * CM_TO_PX,
      marginLeftPx:   parseFloat(m.left)   * CM_TO_PX,
      marginRightPx:  parseFloat(m.right)  * CM_TO_PX,
    };
  }, [pageSettings]);

  const isPages   = pageSettings.mode !== 'pageless';
  const isDark    = pageBg === '#000000' || pageBg === '#0a0b10';
  const pageHeightPx = pageHeightCm * CM_TO_PX;

  // ── Cursor color (persisted per user) ────────────────────────────────────
  const myColor = useMemo(() => {
    const key = `user-color-${user?.id || 'guest'}`;
    const saved = localStorage.getItem(key);
    if (saved) return saved;
    const fresh = CURSOR_COLORS[Math.floor(Math.random() * CURSOR_COLORS.length)];
    localStorage.setItem(key, fresh);
    return fresh;
  }, [user?.id]);

  // ── YouTube extension ─────────────────────────────────────────────────────
  const youtubeExt = useMemo(() => createExtension({
    key: 'youtube-auto-embed',
    tiptapExtensions: [Youtube.configure({ inline: false, width: 640, height: 480 })],
    inputRules: [{
      find: /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/watch\?v=([a-zA-Z0-9_-]+)/,
      replace: ({ match, editor }) => {
        const id = match[4];
        if (id) editor._tiptapEditor.commands.setYoutubeVideo({ src: `https://www.youtube.com/watch?v=${id}` });
        return undefined;
      },
    }],
  }), []);

  // ── BlockNote editor ──────────────────────────────────────────────────────
  const editor = useCreateBlockNote({
    collaboration: {
      provider,
      fragment: doc.getXmlFragment("blocknote"),
      user: { 
        name: user?.name || user?.username || 'Guest', 
        color: user?.color || myColor, 
        avatarUrl: user?.avatarUrl

      },
    },

    extensions: [youtubeExt],
    slashMenuItems: (ed) => {
      const defaults = getDefaultSlashMenuItems ? getDefaultSlashMenuItems(ed) : [];
      return [
        ...defaults,
        {
          title: 'YouTube',
          onItemClick: () => {
            const url = prompt('Enter YouTube URL:');
            if (url) ed._tiptapEditor.chain().focus().setYoutubeVideo({ src: url }).run();
          },
          aliases: ['yt', 'video', 'youtube'],
          group: 'Media',
          icon: <Video size={18} />,
          hint: 'Embed a YouTube video.',
        },
      ];
    },
    uploadFile: async (file) => {
      const { uploadId } = (await uploadApi.initiateMultipart({ filename: file.name, contentType: file.type })).data.data;
      const parts = [];
      const CHUNK = 5 * 1024 * 1024;
      for (let i = 0; i < Math.ceil(file.size / CHUNK); i++) {
        const url = (await uploadApi.getMultipartPartUrl({ uploadId, partNumber: i + 1 })).data.data.url;
        const res = await axios.put(url, file.slice(i * CHUNK, Math.min((i + 1) * CHUNK, file.size)));
        parts.push({ ETag: res.headers.etag?.replace(/"/g, '') || '', PartNumber: i + 1 });
      }
      return (await uploadApi.completeMultipart({ uploadId, parts })).data.data.publicUrl;
    },
  });

  // ── Editor ready + import blocks from sessionStorage ──────────────────────
  const onReadyCalled = useRef(false);
  useEffect(() => {
    if (!editor || onReadyCalled.current) return;
    
    const timer = setTimeout(() => {
      if (onEditorReady) onEditorReady(editor);
      onReadyCalled.current = true;
    }, 100);
    
    return () => clearTimeout(timer);
  }, [editor, onEditorReady]);

  // Handle import blocks separately
  useEffect(() => {
    if (!editor || !docId) return;
    
    const raw = sessionStorage.getItem(`import-blocks-${docId}`);
    if (raw) {
      try {
        editor.replaceBlocks(editor.document, JSON.parse(raw));
        sessionStorage.removeItem(`import-blocks-${docId}`);
      } catch (e) {
        console.error('[CollaborativeEditor] Failed to load imported blocks:', e);
      }
    }
  }, [editor, docId]);



  // Broadcast presence for team members in the editor.
  // Skip when readOnly — the PublicEditorPage controls guest awareness directly
  // so it can respect the showPublicPresence flag.
  useEffect(() => {
    if (!provider || readOnly) return;
    const userState = {
      name: user?.name || user?.username || 'Team Member',
      color: user?.color || myColor,
      avatarUrl: user?.avatarUrl,

      isGuest: false,
    };
    provider.setAwarenessField('user', userState);
    if (provider.awareness) {
      provider.awareness.setLocalStateField('user', userState);
    }
  }, [provider, user, myColor, readOnly]);


  // linesPerPage: how many text lines fit in the usable area of one page.
  // Using 16px as the base line height (matches BlockNote's default font-size:16px, line-height:1.5 → 24px)
  const LINE_HEIGHT_PX = 24; // 16px font × 1.5 line-height
  const linesPerPage = Math.floor((pageHeightPx - marginTopPx - marginBottomPx) / LINE_HEIGHT_PX);

  // ── Measurement-based page breaks ─────────────────────────────────────────
  usePageBreaker(editor, {
    enabled: isPages,
    linesPerPage,
    pageHeightPx,
    marginTopPx,
    marginBottomPx,
    marginLeftPx,
    marginRightPx,
    pageBg,
  });

  // ── Styles ────────────────────────────────────────────────────────────────
  const editorWrapStyle = isPages ? {
    width: `${pageWidthCm}cm`,
    minHeight: `${pageHeightCm}cm`,
    margin: '48px auto 200px',
    padding: `${marginTopPx}px ${marginRightPx}px ${marginBottomPx}px ${marginLeftPx}px`,
    backgroundColor: pageBg,
    boxShadow: '0 8px 64px rgba(0,0,0,0.55)',
    borderRadius: '1px',
    boxSizing: 'border-box',
    overflow: 'visible',
  } : {
    maxWidth: '900px',
    margin: '48px auto 200px',
    padding: '0 48px 120px',
    backgroundColor: pageBg,
    minHeight: '100vh',
    borderRadius: '2px',
    boxShadow: '0 8px 64px rgba(0,0,0,0.5)',
    boxSizing: 'border-box',
  };

  return (
    <div className={`relative flex h-full w-full flex-col overflow-hidden bg-[#171717] ${isZenMode ? 'zen-mode' : ''}`}>
      <div className="flex-1 overflow-y-auto bg-[#171717] custom-scrollbar">
        <div style={editorWrapStyle}>
          <BlockNoteView
            editor={editor}
            theme={isDark ? 'dark' : 'light'}
            className="bn-shadcn"
            editable={!readOnly}
          />
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .bn-editor  { padding: 0 !important; background: transparent !important; user-select: text !important; }
        .bn-container { background: transparent !important; }

        /* Zen Mode: Hide ALL other cursors, carets, and selections */
        .zen-mode .bn-editor [class*="collaboration-cursor"],
        .zen-mode .bn-editor [class*="collaboration-selection"],
        .zen-mode .bn-editor .collaboration-cursor__caret,
        .zen-mode .bn-editor .collaboration-cursor__label,
        .zen-mode .bn-editor .collaboration-cursor__selection,
        .zen-mode .bn-editor [data-client-id],
        .zen-mode .bn-editor [client-id] {
          display: none !important;
          opacity: 0 !important;
          visibility: hidden !important;
          background-color: transparent !important;
        }

        /* Page separator: full-width bleed handled inline in separator DOM */


        .flow-page-sep {
          display: block !important;
          overflow: visible !important;
        }

        /* Collaboration cursors */
        .collaboration-cursor__caret { border-left: 2px solid var(--cursor-color); position: relative; }
        .collaboration-cursor__label {
          background: var(--cursor-color); border-radius: 4px 4px 4px 0; color: #fff;
          font-size: 10px; font-weight: 700; padding: 2px 6px;
          position: absolute; top: -16px; white-space: nowrap; z-index: 100;
        }
        .collaboration-cursor__selection { background-color: var(--cursor-color); opacity: 0.2; }

        @media print {
          @page { margin: ${pageSettings.margins?.top}cm ${pageSettings.margins?.right}cm ${pageSettings.margins?.bottom}cm ${pageSettings.margins?.left}cm; }
          .flow-page-sep { display: none !important; }
          body * { visibility: hidden; }
          .bn-editor, .bn-editor * { visibility: visible; }
          .bn-editor { position: fixed; inset: 0; padding: 0 !important; }
        }
      `}} />
    </div>
  );
};

export default CollaborativeEditor;
