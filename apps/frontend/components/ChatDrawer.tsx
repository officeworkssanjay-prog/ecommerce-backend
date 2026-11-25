"use client";

import { useEffect, useRef, useState } from "react";
import { MessageSquare, Send, X } from "lucide-react";
import { ChatSendSchema } from "@ecommerce/shared-types";
import { ApiError, api, errorMessage } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useApi } from "@/lib/useApi";
import type { ChatMessage, ChatPartner } from "@/lib/types";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { EmptyState, ErrorState, PageLoader } from "@/components/ui/States";
import { FormError } from "@/components/ui/Field";

const POLL_MS = 15_000;

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

/** Buyers chat with the store's support admin. Not used by admins. */
export default function ChatDrawer({ isOpen, onClose }: Props) {
  const { user, isAdmin } = useAuth();
  const enabled = isOpen && !!user && !isAdmin;
  const agent = useApi(async () => (await api.get<ChatPartner>("/chat/support-agent")).data, [], { enabled });

  const [messages, setMessages] = useState<ChatMessage[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const panel = useRef<HTMLDivElement>(null);
  const end = useRef<HTMLDivElement>(null);
  const agentId = agent.data?.id;

  const [tick, setTick] = useState(0);

  // Load, then poll every 15s only while the drawer is open.
  useEffect(() => {
    if (!enabled || !agentId) return;
    let cancelled = false;
    const run = () =>
      api
        .get<ChatMessage[]>(`/chat/messages/${agentId}`)
        .then((res) => {
          if (cancelled) return;
          setMessages(res.data);
          setLoadError(null);
        })
        .catch((err) => !cancelled && setLoadError(errorMessage(err)));
    void run();
    const timer = setInterval(() => void run(), POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [enabled, agentId, tick]);

  useEffect(() => {
    end.current?.scrollIntoView?.({ block: "end" });
  }, [messages?.length]);

  useEffect(() => {
    if (!isOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    panel.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previous?.focus?.();
    };
  }, [isOpen, onClose]);

  if (!isOpen || !user || isAdmin) return null;

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentId) return;
    const parsed = ChatSendSchema.safeParse({ receiverId: agentId, message: draft });
    if (!parsed.success) return setSendError(parsed.error.issues[0]?.message ?? "Invalid message");
    setSending(true);
    setSendError(null);
    try {
      const res = await api.post<ChatMessage>("/chat/send", parsed.data);
      setMessages((m) => [...(m ?? []), res.data]);
      setDraft("");
    } catch (err) {
      setSendError(err instanceof ApiError && err.status === 429 ? "You are sending messages too quickly. Please slow down." : errorMessage(err));
    } finally {
      setSending(false);
    }
  };

  let body;
  if (agent.loading && !agent.data) body = <PageLoader label="Connecting to support…" className="py-10" />;
  else if (agent.error || !agent.data) {
    body = (
      <ErrorState message={agent.error?.isNotFound ? "Support is not available right now. Please try again later." : agent.message} onRetry={agent.reload} />
    );
  } else if (!messages && !loadError) body = <PageLoader label="Loading messages…" className="py-10" />;
  else if (!messages) body = <ErrorState message={loadError} onRetry={() => setTick((t) => t + 1)} />;
  else if (messages.length === 0) {
    body = <EmptyState icon={<MessageSquare className="h-10 w-10" aria-hidden />} title="Start a conversation" description="Ask us about a product, an order or a custom piece." />;
  } else {
    body = (
      <ul className="space-y-3 p-4" aria-live="polite" aria-label="Conversation">
        {messages.map((m) => {
          const mine = m.senderId === user.id;
          return (
            <li key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
              <div className={cn("max-w-[80%] rounded-2xl px-3.5 py-2 text-sm", mine ? "rounded-br-sm bg-gold text-ink-deep" : "rounded-bl-sm border border-sand bg-white text-ink")}>
                <p className="whitespace-pre-wrap break-words">{m.message}</p>
                <p className={cn("mt-1 text-[10px]", mine ? "text-ink-deep/70" : "text-ink/50")}>{formatDateTime(m.createdAt)}</p>
              </div>
            </li>
          );
        })}
        <div ref={end} />
      </ul>
    );
  }

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="fixed inset-0 bg-ink-deep/40" onClick={onClose} aria-hidden />
      <div ref={panel} role="dialog" aria-modal="true" aria-label="Chat with the store" tabIndex={-1} className="fixed inset-y-0 right-0 flex w-full max-w-md flex-col bg-cream shadow-2xl outline-none">
        <div className="flex items-center justify-between border-b border-sand bg-ink px-5 py-4 text-white">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-5 w-5 text-gold" aria-hidden />
            <div>
              <h2 className="font-serif text-lg leading-tight">Chat with {agent.data?.name ?? "Sawariya Jewels"}</h2>
              <p className="text-[11px] text-cream/60">Replies appear here. Updates every 15 seconds.</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close chat" className="rounded p-1.5 hover:bg-white/10">
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">{body}</div>

        {agent.data && (
          <form onSubmit={send} className="space-y-2 border-t border-sand bg-white p-3">
            <FormError message={sendError} />
            <div className="flex items-end gap-2">
              <label htmlFor="chat-message" className="sr-only">
                Your message
              </label>
              <textarea
                id="chat-message"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    e.currentTarget.form?.requestSubmit();
                  }
                }}
                rows={2}
                maxLength={2000}
                placeholder="Type your message…"
                className="flex-1 resize-none rounded-md border border-sand bg-cream px-3 py-2 text-sm text-ink focus:border-gold focus:outline-none"
              />
              <Button type="submit" loading={sending} disabled={!draft.trim()} aria-label="Send message">
                <Send className="h-4 w-4" aria-hidden />
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
