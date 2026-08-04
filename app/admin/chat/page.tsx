'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { Socket } from 'socket.io-client';
import { getChatToken, connectChatSocket, fetchChatJson } from '@/lib/chatClient';

interface ConversationItem {
  _id: string;
  userEmail: string;
  lastMessageAt: string;
  lastMessageText: string;
  unreadByAdmin: number;
}

interface ChatMessage {
  _id: string;
  sender: 'user' | 'admin';
  senderEmail: string;
  text: string;
  createdAt: string;
  isAI?: boolean;
}

export default function AdminChatPage() {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [userTyping, setUserTyping] = useState(false);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  const socketRef = useRef<Socket | null>(null);
  const tokenRef = useRef<string | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeIdRef = useRef<string | null>(null);

  const fetchConversations = useCallback(async () => {
    if (!tokenRef.current) return;
    try {
      const data = await fetchChatJson('/api/conversations', tokenRef.current);
      setConversations(data);
    } catch (err) {
      console.error('Failed to load conversations', err);
    }
  }, []);

  useEffect(() => {
    (async () => {
      const token = await getChatToken();
      if (!token) {
        setLoading(false);
        return;
      }
      tokenRef.current = token;

      await fetchConversations();
      setLoading(false);

      const socket = connectChatSocket(token);
      socketRef.current = socket;

      socket.on('connect', () => setConnected(true));
      socket.on('disconnect', () => setConnected(false));

      socket.on('conversation_updated', fetchConversations);

      socket.on('new_message', (msg: ChatMessage) => {
        if (msg.conversationId === activeIdRef.current || (msg as any).conversationId?.toString?.() === activeIdRef.current) {
          setMessages((prev) => [...prev, msg]);
        }
      });

      socket.on('typing_indicator', ({ typing, role }: { typing: boolean; role: string }) => {
        if (role === 'user') setUserTyping(typing);
      });
    })();

    return () => {
      socketRef.current?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, userTyping]);

  const openConversation = async (id: string) => {
    if (!tokenRef.current || !socketRef.current) return;
    setActiveId(id);
    activeIdRef.current = id;
    setUserTyping(false);

    try {
      const history = await fetchChatJson(`/api/conversations/${id}/messages`, tokenRef.current);
      setMessages(history);
    } catch (err) {
      console.error('Failed to load messages', err);
    }

    socketRef.current.emit('join_conversation', { conversationId: id });
  };

  const handleSend = () => {
    if (!input.trim() || !socketRef.current || !activeId) return;
    socketRef.current.emit('send_message', { conversationId: activeId, text: input.trim() });
    setInput('');
    socketRef.current.emit('stop_typing', { conversationId: activeId });
  };

  const handleTyping = (value: string) => {
    setInput(value);
    if (!socketRef.current || !activeId) return;

    socketRef.current.emit('typing', { conversationId: activeId });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit('stop_typing', { conversationId: activeId });
    }, 1500);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Chat</h1>
        <p className="text-sm text-gray-500">
          Conversations with customers. {connected ? '' : '(connecting...)'}
        </p>
      </div>

      <div className="flex h-[32rem] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="w-72 flex-shrink-0 overflow-y-auto border-r border-gray-100">
          {loading ? (
            <div className="p-4 text-sm text-gray-400">Loading conversations...</div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-sm text-gray-400">No conversations yet.</div>
          ) : (
            conversations.map((c) => (
              <button
                key={c._id}
                onClick={() => openConversation(c._id)}
                className={`flex w-full flex-col items-start gap-0.5 border-b border-gray-50 px-4 py-3 text-left transition ${
                  activeId === c._id ? 'bg-indigo-50' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex w-full items-center justify-between">
                  <span className="truncate text-sm font-semibold text-gray-900">{c.userEmail}</span>
                  {c.unreadByAdmin > 0 && (
                    <span className="ml-2 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-bold text-white">
                      {c.unreadByAdmin}
                    </span>
                  )}
                </div>
                <span className="w-full truncate text-xs text-gray-400">
                  {c.lastMessageText || 'No messages yet'}
                </span>
              </button>
            ))
          )}
        </div>

        <div className="flex flex-1 flex-col">
          {!activeId ? (
            <div className="flex flex-1 items-center justify-center text-sm text-gray-400">
              Select a conversation to view messages.
            </div>
          ) : (
            <>
              <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                {messages.map((msg) => (
                  <div
                    key={msg._id}
                    className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-3.5 py-2 text-sm ${
                        msg.sender === 'admin'
                          ? 'bg-indigo-600 text-white rounded-br-sm'
                          : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                      }`}
                    >
                      {msg.isAI && (
                        <p className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-purple-200">
                          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.448a1 1 0 00-.363 1.118l1.287 3.957c.3.922-.755 1.688-1.54 1.118l-3.367-2.447a1 1 0 00-1.176 0l-3.367 2.447c-.784.57-1.838-.196-1.539-1.118l1.286-3.957a1 1 0 00-.363-1.118L2.062 9.385c-.783-.57-.38-1.81.588-1.81h4.163a1 1 0 00.95-.69l1.286-3.958z" />
                          </svg>
                          AI Assistant replied
                        </p>
                      )}
                      <p>{msg.text}</p>
                      <p
                        className={`mt-1 text-[10px] ${
                          msg.sender === 'admin' ? 'text-indigo-200' : 'text-gray-400'
                        }`}
                      >
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))}

                {userTyping && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl rounded-bl-sm bg-gray-100 px-3.5 py-2 text-sm text-gray-500">
                      <span className="inline-flex gap-1">
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400" />
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 border-t border-gray-100 p-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => handleTyping(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type a reply..."
                  className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
