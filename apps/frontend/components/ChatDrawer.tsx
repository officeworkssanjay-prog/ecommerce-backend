"use client";

import React, { useEffect, useState, useRef } from "react";
import { api, withFallback } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  MessageSquare,
  X,
  Send,
  User as UserIcon,
  Store,
  Clock,
  Sparkles,
  Search,
} from "lucide-react";

interface Conversation {
  partner: { id: string; name: string; avatar?: string | null; role: string };
  lastMessage: { id: string; message: string; seen: boolean; createdAt: string };
  unseenCount: number;
}

interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  seen: boolean;
  createdAt: string;
}

const mockConversations: Conversation[] = [
  {
    partner: { id: "vendor-1", name: "Artisan Potteries Support", role: "VENDOR" },
    lastMessage: {
      id: "m-1",
      message: "Yes! Custom colors for the terracotta vase are available upon request.",
      seen: true,
      createdAt: new Date().toISOString(),
    },
    unseenCount: 0,
  },
];

const mockMessages: ChatMessage[] = [
  {
    id: "m-1",
    senderId: "customer",
    receiverId: "vendor-1",
    message: "Hi! Can this ceramic vase be made in turquoise glaze?",
    seen: true,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "m-2",
    senderId: "vendor-1",
    receiverId: "customer",
    message: "Yes! Custom colors for the terracotta vase are available upon request.",
    seen: true,
    createdAt: new Date().toISOString(),
  },
];

export default function ChatDrawer({
  isOpen,
  onClose,
  initialPartnerId,
}: {
  isOpen: boolean;
  onClose: () => void;
  initialPartnerId?: string;
}) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [activePartnerId, setActivePartnerId] = useState<string | null>(initialPartnerId || mockConversations[0].partner.id);
  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadConversations();
    }
  }, [isOpen]);

  useEffect(() => {
    if (activePartnerId) {
      loadMessages(activePartnerId);
    }
  }, [activePartnerId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadConversations() {
    const res = await withFallback<Conversation[]>(
      api.get("/chat/conversations"),
      mockConversations
    );
    if (res.data && res.data.length > 0) {
      setConversations(res.data);
      if (!activePartnerId) {
        setActivePartnerId(res.data[0].partner.id);
      }
    }
  }

  async function loadMessages(partnerId: string) {
    const res = await withFallback<ChatMessage[]>(
      api.get(`/chat/messages/${partnerId}`),
      mockMessages
    );
    setMessages(res.data || mockMessages);
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activePartnerId || !user) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: user.id,
      receiverId: activePartnerId,
      message: inputText.trim(),
      seen: false,
      createdAt: new Date().toISOString(),
    };

    // Optimistic append
    setMessages((prev) => [...prev, newMsg]);
    setInputText("");

    await api.post("/chat/send", {
      receiverId: activePartnerId,
      message: newMsg.message,
    });
  };

  if (!isOpen) return null;

  const activeConversation = conversations.find(
    (c) => c.partner.id === activePartnerId
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-end">
      <div className="bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 w-full max-w-lg h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                Live Messenger
              </h3>
              <p className="text-[11px] text-zinc-400">
                Chat directly with artisans and marketplace support
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Active Partner Banner */}
          {activeConversation && (
            <div className="px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800 flex items-center space-x-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                {activeConversation.partner.name}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 font-bold">
                {activeConversation.partner.role}
              </span>
            </div>
          )}

          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
            {messages.map((m) => {
              const isMine = m.senderId === user?.id || m.senderId === "customer";
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[80%] p-3.5 rounded-2xl ${
                      isMine
                        ? "bg-amber-500 text-white rounded-br-none shadow-md shadow-amber-500/10"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-bl-none"
                    }`}
                  >
                    <p className="leading-relaxed">{m.message}</p>
                  </div>
                  <span className="text-[10px] text-zinc-400 mt-1 px-1">
                    {new Date(m.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center space-x-2 bg-white dark:bg-zinc-900"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-3 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold transition shadow-md shadow-amber-500/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
