import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  MessageSquare, 
  Send,
  MoreVertical,
  Circle,
  Hash,
  Smile,
  Loader2,
  ArrowDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../../store/auth-store';
import { docApi } from '../../../services/api';
import { format } from 'date-fns';

import { socketService } from '../../../services/socket';

const RightSidebar = ({ isOpen, docId, provider }) => {
  const { authUser } = useAuthStore();
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

  // 1. Initial & Paginated History Fetch
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
          const filteredNew = newMessages.reverse().filter(
            nm => !prev.find(pm => pm.id === nm.id)
          );
          return [...filteredNew, ...prev];
        });
        
        setTimeout(() => {
          if (scrollRef.current) {
            const newScrollHeight = scrollRef.current.scrollHeight;
            scrollRef.current.scrollTop = newScrollHeight - oldScrollHeight;
          }
        }, 0);
      } else {
        setMessages(newMessages.reverse());
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [docId, messages, hasMore]);

  useEffect(() => {
    isInitialLoad.current = true;
    setHasMore(true);
    fetchHistory();
  }, [docId]);

  // 2. Socket.io Connection & Listeners
  useEffect(() => {
    if (!docId || !authUser) return;

    const socket = socketService.connect(docId);

    const handleChatMessage = (newMessage) => {
      setMessages(prev => {
        if (prev.find(m => m.id === newMessage.id)) return prev;
        return [...prev, newMessage];
      });

      if (scrollRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 200;
        if (isNearBottom) {
          setTimeout(() => scrollToBottom('smooth'), 50);
        } else if (newMessage.user.id !== authUser?.id) {
          setShowScrollButton(true);
        }
      }
    };

    const handleUserTyping = (data) => {
      setTypingUsers(prev => {
        const newTyping = { ...prev };
        if (data.isTyping) {
          newTyping[data.userId] = data.name;
        } else {
          delete newTyping[data.userId];
        }
        return newTyping;
      });
    };

    socketService.on("chat_message", handleChatMessage);
    socketService.on("user_typing", handleUserTyping);

    return () => {
      socketService.off("chat_message", handleChatMessage);
      socketService.off("user_typing", handleUserTyping);
    };
  }, [docId, authUser]);

  // Presence still handled by Hocuspocus for now (more accurate for document)
  useEffect(() => {
    if (!provider) return;
    const updatePresence = () => {
      const states = provider.awareness.getStates();
      setActiveUsersCount(states.size);
    };
    provider.awareness.on('change', updatePresence);
    updatePresence();
    return () => provider.awareness.off('change', updatePresence);
  }, [provider]);

  // 3. Scroll Helpers
  const scrollToBottom = (behavior = 'auto') => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ 
        top: scrollRef.current.scrollHeight, 
        behavior 
      });
      setShowScrollButton(false);
    }
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    setShowScrollButton(scrollHeight - scrollTop - clientHeight > 400);
    if (scrollTop < 50 && !isLoadingMore && hasMore) {
      fetchHistory(true);
    }
  };

  // 4. Handle 'Is Typing' via Socket.io
  useEffect(() => {
    if (!docId || !authUser) return;

    const userName = authUser.name || authUser.username;

    if (message.trim().length > 0) {
      socketService.emit("typing_start", { 
        docId, 
        userId: authUser.id, 
        name: userName 
      });
      
      const timeout = setTimeout(() => {
        socketService.emit("typing_stop", { docId, userId: authUser.id, name: userName });
      }, 3000);

      return () => {
        clearTimeout(timeout);
        socketService.emit("typing_stop", { docId, userId: authUser.id, name: userName });
      };
    } else {
      socketService.emit("typing_stop", { docId, userId: authUser.id, name: userName });
    }
  }, [message, docId, authUser]);

  // 4. Initial Scroll & Auto-Scrollers
  useEffect(() => {
    if (isInitialLoad.current && !isLoading && messages.length > 0) {
      scrollToBottom();
      isInitialLoad.current = false;
    }
  }, [messages, isLoading]);

  // 5. Send Message
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!message.trim() || !docId) return;

    const content = message.trim();
    const userName = authUser.name || authUser.username;
    setMessage('');

    // Clear typing indicator immediately on send
    socketService.emit("typing_stop", { docId, userId: authUser.id, name: userName });

    try {
      const response = await docApi.sendChatMessage(docId, content);
      const sentMessage = response.data.data.message;
      
      setMessages(prev => [...prev, sentMessage]);
      setTimeout(() => scrollToBottom('smooth'), 50);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const onKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <aside className="w-[320px] md:w-[340px] border-l border-white/5 bg-[#0a0b10] flex flex-col h-full overflow-hidden shrink-0 shadow-2xl">
      <div className="flex flex-col h-full w-[340px]">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-b from-white/[0.02] to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1D9E75]/10 flex items-center justify-center border border-[#1D9E75]/20">
              <MessageSquare className="w-5 h-5 text-[#1D9E75]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Document Chat</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Circle className="w-1.5 h-1.5 fill-[#1D9E75] text-[#1D9E75] animate-pulse" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{activeUsersCount} Active</span>
              </div>
            </div>
          </div>
          <button className="p-2 hover:bg-white/5 rounded-lg text-slate-500 transition-colors">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>

        {/* Message Feed */}
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar relative"
        >
          {isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-500">
              <Loader2 className="w-5 h-5 animate-spin text-[#1D9E75]" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Fetching History</span>
            </div>
          ) : (
            <>
              {isLoadingMore && (
                <div className="flex justify-center py-2">
                  <Loader2 className="w-4 h-4 animate-spin text-slate-700" />
                </div>
              )}
              
              {!hasMore && messages.length > 0 && (
                <div className="text-center py-2">
                  <span className="px-3 py-1 rounded-full bg-white/[0.03] backdrop-blur-md border border-white/5 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">
                    Beginning of History
                  </span>
                </div>
              )}

              <div className="space-y-6">
                <AnimatePresence initial={false}>
                  {messages.map((msg) => {
                    const isMe = msg.user.id === authUser?.id;
                    return (
                      <motion.div 
                        key={msg.id}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group`}
                      >
                        <div className={`flex items-end gap-2.5 max-w-[85%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                          <div className="shrink-0 mb-1">
                            {msg.user.avatarUrl ? (
                              <img 
                                src={msg.user.avatarUrl} 
                                alt={msg.user.name} 
                                className="w-7 h-7 rounded-lg border border-white/10 shadow-lg object-cover"
                              />
                            ) : (
                              <div 
                                className="w-7 h-7 rounded-lg border border-white/10 flex items-center justify-center text-[10px] font-black text-white shadow-lg"
                                style={{ backgroundColor: msg.user.color || '#1D9E75' }}
                              >
                                {msg.user.name?.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className={`relative px-4 py-2.5 rounded-2xl text-[12.5px] leading-relaxed shadow-xl [word-break:break-all] whitespace-pre-wrap ${
                            isMe 
                              ? 'bg-[#1D9E75] text-white rounded-tr-none' 
                              : 'bg-white/[0.04] text-slate-200 border border-white/5 rounded-tl-none'
                          }`}>
                            {msg.content}
                          </div>
                        </div>
                        <div className={`mt-1.5 flex items-center gap-2 px-10 ${isMe ? 'justify-end' : 'justify-start'}`}>
                          {!isMe && <span className="text-[10px] font-bold text-slate-500">{msg.user.name}</span>}
                          <span className="text-[9px] font-medium text-slate-600 tabular-nums">
                            {format(new Date(msg.createdAt), 'h:mm a')}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {/* Typing Indicator */}
                <AnimatePresence>
                  {Object.keys(typingUsers).length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="flex items-center gap-2 px-2"
                    >
                      <div className="flex gap-1">
                        <span className="w-1 h-1 bg-[#1D9E75] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1 h-1 bg-[#1D9E75] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1 h-1 bg-[#1D9E75] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 italic">
                        {Object.keys(typingUsers).length === 1 
                          ? `${Object.values(typingUsers)[0]} is typing...`
                          : `${Object.keys(typingUsers).length} people are typing...`}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          )}
        </div>

        {/* Scroll to Bottom Button */}
        <AnimatePresence>
          {showScrollButton && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              onClick={() => scrollToBottom('smooth')}
              className="absolute bottom-32 right-8 w-10 h-10 rounded-full bg-[#1D9E75] text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-transform z-30"
            >
              <ArrowDown className="w-5 h-5" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Input Area */}
        <div className="p-4 bg-gradient-to-t from-white/[0.02] to-transparent">
          <form 
            onSubmit={handleSendMessage}
            className="flex items-center gap-2 bg-white/[0.03] border border-white/10 rounded-full pl-5 pr-1.5 py-1.5 focus-within:border-[#1D9E75]/40 transition-all shadow-xl backdrop-blur-md"
          >
            <textarea 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={onKeyPress}
              placeholder="Message..."
              className="flex-1 bg-transparent border-none text-[13px] text-slate-200 outline-none py-1.5 placeholder:text-slate-600 resize-none max-h-[100px] custom-scrollbar"
              rows={1}
            />
            <button 
              type="submit"
              disabled={!message.trim()}
              className={`p-2 w-9 h-9 rounded-full transition-all flex items-center justify-center active:scale-90 ${
                message.trim() 
                  ? 'bg-[#1D9E75] text-white' 
                  : 'text-slate-700'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
};

export default RightSidebar;
