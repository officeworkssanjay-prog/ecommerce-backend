"use client";

import { useEffect, useRef } from "react";
import type { ChatMessage } from "@/lib/types";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/cn";

/** Chat bubbles, own messages on the right. Scrolls its container to the newest message. */
export function MessageList({ messages, currentUserId }: { messages: ChatMessage[]; currentUserId: string }) {
  const end = useRef<HTMLLIElement>(null);
  useEffect(() => {
    end.current?.scrollIntoView?.({ block: "nearest" });
  }, [messages.length]);

  return (
    <ul className="space-y-3 p-4" aria-live="polite" aria-label="Conversation">
      {messages.map((m) => {
        const mine = m.senderId === currentUserId;
        return (
          <li key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
            <div className={cn("max-w-[80%] rounded-2xl px-3.5 py-2 text-sm", mine ? "rounded-br-sm bg-gold text-ink-deep" : "rounded-bl-sm border border-sand bg-white text-ink")}>
              <p className="whitespace-pre-wrap break-words">{m.message}</p>
              <p className={cn("mt-1 text-[10px]", mine ? "text-ink-deep/70" : "text-ink/50")}>{formatDateTime(m.createdAt)}</p>
            </div>
          </li>
        );
      })}
      <li ref={end} aria-hidden />
    </ul>
  );
}
