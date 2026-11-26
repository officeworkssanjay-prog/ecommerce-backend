"use client";

import { useState } from "react";
import { ArrowLeft, MessagesSquare, Send } from "lucide-react";
import { ChatSendSchema } from "@ecommerce/shared-types";
import { api, errorMessage } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { usePolling } from "@/lib/usePolling";
import type { ChatMessage, Conversation } from "@/lib/types";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/cn";
import { PageHeader } from "@/components/admin/AdminKit";
import { MessageList } from "@/components/chat/MessageList";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/Field";
import { EmptyState, ErrorState, PageLoader } from "@/components/ui/States";

const THREAD_POLL_MS = 5_000;
const LIST_POLL_MS = 10_000;

interface ThreadProps {
  conversation: Conversation;
  adminId: string;
  onBack: () => void;
  onSent: () => void;
}

function Thread({ conversation, adminId, onBack, onSent }: ThreadProps) {
  const { partner } = conversation;
  const thread = usePolling<ChatMessage[]>(`/chat/messages/${partner.id}`, THREAD_POLL_MS);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = ChatSendSchema.safeParse({ receiverId: partner.id, message: draft });
    if (!parsed.success) return setSendError(parsed.error.issues[0]?.message ?? "Invalid message");
    setSending(true);
    setSendError(null);
    try {
      await api.post("/chat/send", parsed.data);
      setDraft("");
      thread.refresh();
      onSent();
    } catch (err) {
      setSendError(errorMessage(err));
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <div className="flex shrink-0 items-center gap-3 border-b border-sand px-4 py-3">
        <button type="button" onClick={onBack} aria-label="Back to conversations" className="rounded p-1 hover:bg-parchment md:hidden">
          <ArrowLeft className="h-5 w-5" aria-hidden />
        </button>
        <h2 className="font-serif text-lg text-ink">{partner.name}</h2>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto bg-cream">
        {thread.data ? (
          <MessageList messages={thread.data} currentUserId={adminId} />
        ) : thread.error ? (
          <ErrorState message={thread.error} onRetry={thread.refresh} />
        ) : (
          <PageLoader label="Loading messages…" className="py-10" />
        )}
      </div>

      <form onSubmit={send} className="shrink-0 space-y-2 border-t border-sand p-3">
        <FormError message={sendError} />
        <div className="flex items-end gap-2">
          <label htmlFor="admin-reply" className="sr-only">
            Reply to {partner.name}
          </label>
          <textarea
            id="admin-reply"
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
            placeholder="Type your reply…"
            className="flex-1 resize-none rounded-md border border-sand bg-cream px-3 py-2 text-sm text-ink focus:border-gold focus:outline-none"
          />
          <Button type="submit" loading={sending} disabled={!draft.trim()} icon={<Send className="h-4 w-4" aria-hidden />}>
            Send
          </Button>
        </div>
      </form>
    </>
  );
}

export default function AdminChatPage() {
  const { user } = useAuth();
  const list = usePolling<Conversation[]>("/chat/conversations", LIST_POLL_MS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = list.data?.find((c) => c.partner.id === selectedId) ?? null;

  let body;
  if (!list.data && list.error) body = <ErrorState message={list.error} onRetry={list.refresh} />;
  else if (!list.data || !user) body = <PageLoader label="Loading conversations…" />;
  else if (list.data.length === 0) {
    body = (
      <EmptyState
        icon={<MessagesSquare className="h-10 w-10" aria-hidden />}
        title="No conversations yet"
        description="When a signed-in customer writes to you from the chat icon on the website, it appears here."
      />
    );
  } else {
    body = (
      <div className="flex h-[calc(100dvh-14rem)] min-h-96 overflow-hidden rounded-card border border-sand bg-white shadow-card">
        <ul className={cn("w-full shrink-0 overflow-y-auto border-sand md:block md:w-72 md:border-r", selected && "hidden")}>
          {list.data.map(({ partner, lastMessage, unseenCount }) => {
            // The open thread is being read, so it never shows as unread.
            const unread = partner.id === selectedId ? 0 : unseenCount;
            return (
              <li key={partner.id} className="border-b border-sand">
                <button
                  type="button"
                  aria-current={partner.id === selectedId ? "true" : undefined}
                  onClick={() => setSelectedId(partner.id)}
                  className={cn("block w-full px-4 py-3 text-left hover:bg-parchment", partner.id === selectedId && "bg-parchment")}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-ink">{partner.name}</span>
                    {unread > 0 && (
                      <span className="rounded-full bg-danger px-1.5 text-[11px] font-bold text-white">
                        {unread}
                        <span className="sr-only"> unread</span>
                      </span>
                    )}
                  </span>
                  <span className={cn("block truncate text-xs", unread > 0 ? "font-medium text-ink" : "text-ink/60")}>
                    {lastMessage.senderId === user.id && "You: "}
                    {lastMessage.message}
                  </span>
                  <span className="block text-[10px] text-ink/45">{formatDateTime(lastMessage.createdAt)}</span>
                </button>
              </li>
            );
          })}
        </ul>
        <div className={cn("min-w-0 flex-1 flex-col", selected ? "flex" : "hidden md:flex")}>
          {selected ? (
            <Thread key={selected.partner.id} conversation={selected} adminId={user.id} onBack={() => setSelectedId(null)} onSent={list.refresh} />
          ) : (
            <p className="m-auto px-6 text-center text-sm text-ink/60">Choose a conversation to read and reply.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Live chat" description="Messages customers send from the website. New messages appear within a few seconds." />
      {body}
    </div>
  );
}
