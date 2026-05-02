import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  MessageSquare, 
  Send,
  MoreVertical,
  Circle,
  Loader2,
  ArrowDown,
  Shield,
  Layout
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../../store/auth-store';
import { useDocStore } from '../../../store/doc-store';
import { docApi } from '../../../services/api';
import { format } from 'date-fns';
import { toast } from 'sonner';

import { socketService } from '../../../services/socket';
import { Button } from "@/components/ui/button";

const RightSidebar = ({ isOpen, docId, provider }) => {
  const { authUser } = useAuthStore();
  const { activeDocument } = useDocStore();
  
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [activeUsersCount, setActiveUsersCount] = useState(1);
  const [typingUsers, setTypingUsers] = useState({});
  const [showScrollButton, setShowScrollButton] = useState(false);
  
  const scrollRef = useRef(null);
  const isInitialLoad = useRef(true);

  // Fetch History
  const fetchHistory = useCallback(async (isLoadMore = false) => {
    if (!docId || (isLoadMore && !hasMore)) return;
    try {
      if (isLoadMore) setIsLoadingMore(true);
      else setIsLoading(true);
      const cursor = isLoadMore && messages.length > 0 ? messages[0].id : undefined;
      const response = await docApi.getChatHistory(docId, 50, cursor);
      const newMessages = response.data.data.messages;
      if (newMessages.length < 50) setHasMore(false);
      if (isLoadMore) {
        const oldScrollHeight = scrollRef.current?.scrollHeight || 0;
        setMessages(prev => {
          const filteredNew = newMessages.reverse().filter(nm => !prev.find(pm => pm.id === nm.id));
          return [...filteredNew, ...prev];
        });
        setTimeout(() => {
          if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight - oldScrollHeight;
        }, 0);
      } else setMessages(newMessages.reverse());
    } catch (error) { console.error(error); } finally { setIsLoading(false); setIsLoadingMore(false); }
  }, [docId, messages, hasMore]);

  useEffect(() => {
    isInitialLoad.current = true;
    setHasMore(true);
    fetchHistory();
  }, [docId]);

  // Socket Connection
  useEffect(() => {
    if (!docId || !authUser) return;
    socketService.connect(docId);
    const handleChatMessage = (newMessage) => {
      setMessages(prev => prev.find(m => m.id === newMessage.id) ? prev : [...prev, newMessage]);
      if (scrollRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        if (scrollHeight - scrollTop - clientHeight < 200) setTimeout(() => scrollToBottom('smooth'), 50);
        else if (newMessage.user.id !== authUser?.id) setShowScrollButton(true);
      }
    };
    const handleUserTyping = (data) => setTypingUsers(prev => {
      const next = { ...prev };
      if (data.isTyping) next[data.userId] = data.name;
      else delete next[data.userId];
      return next;
    });
    socketService.on("chat_message", handleChatMessage);
    socketService.on("user_typing", handleUserTyping);
    return () => {
      socketService.off("chat_message", handleChatMessage);
      socketService.off("user_typing", handleUserTyping);
    };
  }, [docId, authUser]);

  // Awareness (Presence)
  useEffect(() => {
    if (!provider) return;
    const update = () => setActiveUsersCount(provider.awareness.getStates().size);
    provider.awareness.on('change', update);
    update();
    return () => provider.awareness.off('change', update);
  }, [provider]);

  const scrollToBottom = (behavior = 'auto') => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior });
      setShowScrollButton(false);
    }
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    setShowScrollButton(scrollHeight - scrollTop - clientHeight > 400);
    if (scrollTop < 50 && !isLoadingMore && hasMore) fetchHistory(true);
  };

  // Typing state
  useEffect(() => {
    if (!docId || !authUser) return;
    const userName = authUser.name || authUser.username;
    if (message.trim().length > 0) {
      socketService.emit("typing_start", { docId, userId: authUser.id, name: userName });
      const timeout = setTimeout(() => socketService.emit("typing_stop", { docId, userId: authUser.id, name: userName }), 3000);
      return () => { clearTimeout(timeout); socketService.emit("typing_stop", { docId, userId: authUser.id, name: userName }); };
    } else socketService.emit("typing_stop", { docId, userId: authUser.id, name: userName });
  }, [message, docId, authUser]);

  useEffect(() => {
    if (isInitialLoad.current && !isLoading && messages.length > 0) {
      scrollToBottom();
      isInitialLoad.current = false;
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!message.trim() || !docId) return;
    const content = message.trim();
    setMessage('');
    socketService.emit("typing_stop", { docId, userId: authUser.id, name: authUser.name || authUser.username });
    try {
      const response = await docApi.sendChatMessage(docId, content);
      setMessages(prev => [...prev, response.data.data.message]);
      setTimeout(() => scrollToBottom('smooth'), 50);
    } catch (error) { console.error(error); }
  };

  const onKeyPress = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } };

  return (
    <aside className="w-[340px] border-l border-[#2e2e2e] bg-[#171717] flex flex-col h-full shrink-0 shadow-2xl relative z-20 overflow-hidden">
      {/* Header - Simple */}
      <div className="px-6 py-5 border-b border-[#2e2e2e] bg-[#1c1c1c]/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#3ecf8e]/10 flex items-center justify-center border border-[#3ecf8e]/20">
              <MessageSquare className="w-4 h-4 text-[#3ecf8e]" />
            </div>
            <h3 className="text-[10px] font-bold text-[#fafafa] uppercase tracking-[2px]">Collaboration</h3>
          </div>
          <button className="p-2 hover:bg-[#242424] rounded-lg text-[#4d4d4d] hover:text-[#fafafa] transition-all cursor-pointer">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 relative flex flex-col min-h-0">
        {/* Feed */}
        <div 
          ref={scrollRef} onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar"
        >
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 text-[#4d4d4d]">
              <Loader2 className="w-6 h-6 animate-spin text-[#3ecf8e]" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Syncing History</span>
            </div>
          ) : (
            <>
              {!hasMore && <div className="text-center py-4 text-[9px] font-bold text-[#4d4d4d] uppercase tracking-[3px]">Beginning of chat</div>}
              {messages.map(m => {
                const isMe = m.user.id === authUser?.id;
                return (
                  <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1.5`}>
                    <div className={`flex items-end gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}>
                      {m.user.avatarUrl ? (
                        <img 
                          src={m.user.avatarUrl} 
                          alt={m.user.name} 
                          className="w-6 h-6 rounded-lg shrink-0 border border-[#2e2e2e] shadow-lg object-cover" 
                        />
                      ) : (
                        <div className={`w-6 h-6 rounded-lg shrink-0 border border-white/5 flex items-center justify-center text-[9px] font-bold text-white shadow-lg`} style={{ backgroundColor: m.user.color || '#3ecf8e' }}>
                          {m.user.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className={`px-4 py-3 rounded-2xl text-[13px] tracking-tight leading-relaxed shadow-xl ${
                        isMe ? 'bg-[#3ecf8e] text-[#171717] font-medium rounded-tr-none' : 'bg-[#1c1c1c] text-[#fafafa] border border-[#2e2e2e] rounded-tl-none'
                      }`}>
                        {m.content}
                      </div>
                    </div>
                    <div className="px-9 flex items-center gap-2">
                       <span className="text-[10px] font-bold text-[#4d4d4d] tabular-nums">{format(new Date(m.createdAt), 'HH:mm')}</span>
                    </div>
                  </div>
                );
              })}
              {Object.keys(typingUsers).length > 0 && (
                <div className="flex items-center gap-2 text-[10px] text-[#4d4d4d] font-bold uppercase tracking-widest pl-2">
                  <Circle className="w-1.5 h-1.5 fill-[#3ecf8e] text-[#3ecf8e] animate-pulse" />
                  <span>Activity...</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Scroll to Bottom Button */}
        <AnimatePresence>
          {showScrollButton && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => scrollToBottom('smooth')}
              className="absolute bottom-32 right-8 w-11 h-11 rounded-xl bg-[#3ecf8e] text-[#171717] flex items-center justify-center shadow-2xl hover:scale-105 transition-all z-30 cursor-pointer"
            >
              <ArrowDown className="w-5 h-5" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Dedicated Chat Input Area */}
        <div className="p-6 bg-[#1c1c1c]/30 border-t border-[#2e2e2e]">
           <div className="relative bg-[#1c1c1c] border border-[#2e2e2e] rounded-2xl p-2.5 shadow-inner focus-within:border-[#3ecf8e]/40 transition-all">
              <textarea
                value={message} onChange={e => setMessage(e.target.value)} onKeyDown={onKeyPress}
                placeholder="Type a message..."
                className="w-full bg-transparent border-none outline-none text-[13px] text-[#fafafa] placeholder:text-[#4d4d4d] p-2 resize-none max-h-[120px] custom-scrollbar"
                rows={1}
              />
              <div className="flex justify-between items-center mt-2 px-1">
                 <div className="flex items-center gap-2">
                   <span className="text-[9px] font-bold text-[#4d4d4d] uppercase tracking-widest">{activeUsersCount} Online</span>
                   <div className="w-1 h-1 rounded-full bg-[#3ecf8e] animate-pulse" />
                 </div>
                 <Button 
                   onClick={handleSendMessage} disabled={!message.trim()}
                   className="h-8 w-8 rounded-lg bg-[#3ecf8e] hover:bg-[#3ecf8e]/90 text-[#171717] p-0 shadow-lg shadow-[#3ecf8e]/10"
                 >
                   <Send className="w-3.5 h-3.5" />
                 </Button>
              </div>
           </div>
        </div>
      </div>

    </aside>
  );
};

export default RightSidebar;
