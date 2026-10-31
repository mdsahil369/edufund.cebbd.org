"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCheck,
  Inbox,
  Loader2,
  MessageSquare,
  Search,
  Send,
} from "lucide-react";
import { StudentAvatar } from "@/components/students/student-avatar";
import { StatusPill } from "@/components/shared/status-pill";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDemoData } from "@/lib/store/demo-store";
import type { Message } from "@/types";
import { cn, formatDate, timeAgo } from "@/lib/utils";

type WorkspaceRole = "donor" | "admin";

interface MessagingWorkspaceProps {
  role: WorkspaceRole;
}

function dayLabel(value: string) {
  const date = new Date(value);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return formatDate(value, "d MMM yyyy");
}

export function MessagingWorkspace({ role }: MessagingWorkspaceProps) {
  const {
    session,
    hydrated,
    conversations,
    messages,
    students,
    donors,
    sendDonorMessage,
    sendAdminReply,
    markConversationRead,
  } = useDemoData();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [draft, setDraft] = useState("");
  const threadRef = useRef<HTMLDivElement>(null);

  const lastMessageByConversation = useMemo(() => {
    const map = new Map<string, Message>();
    for (const message of messages) {
      const current = map.get(message.conversationId);
      if (
        !current ||
        new Date(message.createdAt).getTime() >
          new Date(current.createdAt).getTime()
      ) {
        map.set(message.conversationId, message);
      }
    }
    return map;
  }, [messages]);

  const scoped = useMemo(() => {
    return conversations
      .filter((conversation) =>
        role === "donor" ? conversation.donorId === session?.donorId : true,
      )
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
  }, [conversations, role, session?.donorId]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return scoped.filter((conversation) => {
      const unread =
        role === "donor"
          ? conversation.unreadForDonor
          : conversation.unreadForAdmin;
      if (unreadOnly && unread === 0) return false;
      if (!query) return true;
      const student = students.find((item) => item.id === conversation.studentId);
      const donor = donors.find((item) => item.id === conversation.donorId);
      const lastMessage = lastMessageByConversation.get(conversation.id);
      return [
        conversation.subject,
        student?.fullName ?? "",
        donor?.fullName ?? "",
        lastMessage?.body ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [
    scoped,
    search,
    unreadOnly,
    role,
    students,
    donors,
    lastMessageByConversation,
  ]);

  const totalUnread = scoped.reduce(
    (total, conversation) =>
      total +
      (role === "donor"
        ? conversation.unreadForDonor
        : conversation.unreadForAdmin),
    0,
  );

  // Open the first conversation automatically on desktop so the workspace never
  // looks empty on a wide screen. On mobile the list stays visible first.
  useEffect(() => {
    if (!hydrated || selectedId || scoped.length === 0) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 1024px)").matches
    ) {
      setSelectedId(scoped[0].id);
    }
  }, [hydrated, selectedId, scoped]);

  const selected = scoped.find((conversation) => conversation.id === selectedId);
  const selectedStudent = selected
    ? students.find((student) => student.id === selected.studentId)
    : undefined;
  const selectedDonor = selected
    ? donors.find((donor) => donor.id === selected.donorId)
    : undefined;

  const selectedMessages = useMemo(() => {
    if (!selected) return [];
    return messages
      .filter((message) => message.conversationId === selected.id)
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
  }, [messages, selected]);

  useEffect(() => {
    if (!selectedId) return;
    markConversationRead(selectedId, role);
  }, [selectedId, role, markConversationRead]);

  useEffect(() => {
    const node = threadRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [selectedId, selectedMessages.length]);

  if (!hydrated || !session) {
    return (
      <div className="grid h-[calc(100dvh-160px)] min-h-[520px] animate-pulse gap-4 overflow-hidden rounded-2xl border border-border bg-white lg:grid-cols-[320px_1fr]">
        <div className="hidden border-r border-border p-4 lg:block">
          <div className="h-9 rounded-lg bg-muted" />
          <div className="mt-4 space-y-3">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="h-16 rounded-xl bg-muted" />
            ))}
          </div>
        </div>
        <div className="p-6">
          <div className="h-12 w-1/3 rounded-lg bg-muted" />
          <div className="mt-8 space-y-4">
            <div className="h-20 w-2/3 rounded-2xl bg-muted" />
            <div className="ml-auto h-16 w-1/2 rounded-2xl bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  const send = () => {
    const body = draft.trim();
    if (!body || !selected) return;
    if (role === "donor") sendDonorMessage(selected.id, body);
    else sendAdminReply(selected.id, body);
    setDraft("");
  };

  return (
    <div className="grid h-[calc(100dvh-150px)] min-h-[560px] overflow-hidden rounded-2xl border border-border bg-white shadow-sm lg:grid-cols-[320px_1fr] xl:grid-cols-[360px_1fr]">
      {/* Conversation list */}
      <aside
        className={cn(
          "flex-col border-border lg:flex lg:border-r",
          selectedId ? "hidden" : "flex",
        )}
      >
        <div className="border-b border-border p-3.5">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-[13px] font-bold text-navy">
              Conversations
              {totalUnread > 0 && (
                <span className="rounded-full bg-brand px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {totalUnread}
                </span>
              )}
            </h2>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setUnreadOnly(false)}
                className={cn(
                  "rounded-full px-2 py-1 text-[10.5px] font-semibold",
                  unreadOnly
                    ? "text-slate-muted hover:bg-muted"
                    : "bg-brand-light text-brand-dark",
                )}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setUnreadOnly(true)}
                className={cn(
                  "rounded-full px-2 py-1 text-[10.5px] font-semibold",
                  unreadOnly
                    ? "bg-brand-light text-brand-dark"
                    : "text-slate-muted hover:bg-muted",
                )}
              >
                Unread
              </button>
            </div>
          </div>
          <div className="relative mt-2.5">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-slate-muted"
              aria-hidden="true"
            />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={
                role === "admin"
                  ? "Search donor, student, message…"
                  : "Search conversations…"
              }
              aria-label="Search conversations"
              className="h-8.5 pl-8 text-[12px]"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-1 items-center justify-center p-4">
            <div className="text-center">
              <Inbox className="mx-auto size-7 text-slate-300" />
              <p className="mt-2 text-[12px] font-semibold text-ink">
                {scoped.length === 0 ? "No conversations yet" : "No matches"}
              </p>
              <p className="mt-1 text-[10.5px] leading-relaxed text-slate-muted">
                {scoped.length === 0
                  ? role === "donor"
                    ? "Open a student profile and send a message to start a conversation."
                    : "Donor conversations will appear here."
                  : "Try a different search or show all conversations."}
              </p>
              {scoped.length > 0 && (
                <Button
                  variant="outline"
                  size="xs"
                  className="mt-2.5"
                  onClick={() => {
                    setSearch("");
                    setUnreadOnly(false);
                  }}
                >
                  Clear filters
                </Button>
              )}
            </div>
          </div>
        ) : (
          <ul className="flex-1 divide-y divide-border overflow-y-auto">
            {filtered.map((conversation) => {
              const student = students.find(
                (item) => item.id === conversation.studentId,
              );
              const donor = donors.find(
                (item) => item.id === conversation.donorId,
              );
              const lastMessage = lastMessageByConversation.get(conversation.id);
              const unread =
                role === "donor"
                  ? conversation.unreadForDonor
                  : conversation.unreadForAdmin;
              return (
                <li key={conversation.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedId(conversation.id);
                      setDraft("");
                    }}
                    className={cn(
                      "flex w-full items-start gap-3 px-3.5 py-3.5 text-left transition-colors hover:bg-surface",
                      selectedId === conversation.id && "bg-brand-soft/60",
                    )}
                  >
                    <StudentAvatar
                      name={student?.fullName ?? "Student"}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-[12.5px] font-semibold text-ink">
                          {student?.fullName ?? "Student"}
                        </p>
                        <span className="shrink-0 text-[10px] text-slate-muted">
                          {timeAgo(conversation.updatedAt)}
                        </span>
                      </div>
                      {role === "admin" && (
                        <p className="truncate text-[10.5px] text-slate-muted">
                          Donor: {donor?.fullName ?? "Unknown donor"}
                        </p>
                      )}
                      <p
                        className={cn(
                          "mt-0.5 line-clamp-1 text-[11px]",
                          unread > 0
                            ? "font-medium text-ink"
                            : "text-slate-muted",
                        )}
                      >
                        {lastMessage?.body ?? conversation.subject}
                      </p>
                    </div>
                    {unread > 0 && (
                      <span className="mt-1.5 flex size-4.5 shrink-0 items-center justify-center rounded-full bg-brand text-[9px] font-bold text-white">
                        {unread}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </aside>

      {/* Thread */}
      <section
        className={cn(
          "min-w-0 flex-col bg-surface/40 lg:flex",
          selectedId ? "flex" : "hidden",
        )}
      >
        {selected ? (
          <>
            <header className="flex items-start gap-3 border-b border-border bg-white px-4 py-3.5">
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="mt-1 rounded-md p-1 text-slate-muted hover:bg-muted lg:hidden"
                aria-label="Back to conversations"
              >
                <ArrowLeft className="size-4" />
              </button>
              <StudentAvatar
                name={selectedStudent?.fullName ?? "Student"}
                size="md"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-[14px] font-bold text-navy">
                    {selectedStudent?.fullName ?? "Student"}
                  </h2>
                  <StatusPill
                    tone={selected.status === "open" ? "success" : "neutral"}
                    className="py-0.5 text-[10px]"
                  >
                    {selected.status === "open" ? "Open" : "Closed"}
                  </StatusPill>
                </div>
                <p className="truncate text-[11px] text-slate-muted">
                  {selected.subject}
                </p>
                <p className="mt-0.5 truncate text-[10.5px] text-slate-muted">
                  {role === "admin"
                    ? `${selectedDonor?.fullName ?? "Donor"} · ${selectedDonor?.email ?? ""}`
                    : "CEBBD support team replies on behalf of the student"}
                </p>
              </div>
              {selectedStudent && (
                <Button
                  asChild
                  variant="outline"
                  size="xs"
                  className="hidden shrink-0 sm:inline-flex"
                >
                  <Link
                    href={
                      role === "admin"
                        ? `/students/${selectedStudent.slug}`
                        : `/students/${selectedStudent.slug}`
                    }
                  >
                    Profile
                    <ArrowUpRight className="size-3" />
                  </Link>
                </Button>
              )}
            </header>

            <div
              ref={threadRef}
              className="flex-1 overflow-y-auto px-4 py-5 sm:px-6"
              aria-live="polite"
            >
              {selectedMessages.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <p className="text-[12px] text-slate-muted">
                    No messages in this conversation yet.
                  </p>
                </div>
              ) : (
                <div className="mx-auto max-w-2xl space-y-1">
                  {selectedMessages.map((message, index) => {
                    const own =
                      (role === "donor" && message.authorRole === "donor") ||
                      (role === "admin" && message.authorRole === "admin");
                    const previous = selectedMessages[index - 1];
                    const showDay =
                      !previous ||
                      new Date(previous.createdAt).toDateString() !==
                        new Date(message.createdAt).toDateString();
                    return (
                      <div key={message.id}>
                        {showDay && (
                          <div className="my-4 flex items-center gap-3">
                            <span className="h-px flex-1 bg-border" />
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-muted">
                              {dayLabel(message.createdAt)}
                            </span>
                            <span className="h-px flex-1 bg-border" />
                          </div>
                        )}
                        <div
                          className={cn(
                            "flex",
                            own ? "justify-end" : "justify-start",
                          )}
                        >
                          <div
                            className={cn(
                              "max-w-[85%] rounded-2xl px-3.5 py-2.5 sm:max-w-[75%]",
                              own
                                ? "rounded-br-md bg-brand text-white"
                                : "rounded-bl-md border border-border bg-white text-ink",
                            )}
                          >
                            <p
                              className={cn(
                                "mb-1 text-[10px] font-bold",
                                own ? "text-white/70" : "text-brand-dark",
                              )}
                            >
                              {own
                                ? role === "admin"
                                  ? "You · CEBBD"
                                  : "You"
                                : message.authorName}
                            </p>
                            <p className="whitespace-pre-line text-[12.5px] leading-relaxed">
                              {message.body}
                            </p>
                            <p
                              className={cn(
                                "mt-1.5 flex items-center justify-end gap-1 text-[9.5px]",
                                own ? "text-white/55" : "text-slate-muted",
                              )}
                            >
                              {formatDate(message.createdAt, "h:mm a")}
                              {own && (
                                <CheckCheck
                                  className="size-3"
                                  aria-label={
                                    message.readByDonor && message.readByAdmin
                                      ? "Read"
                                      : "Delivered"
                                  }
                                />
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {selected.status === "closed" ? (
              <div className="border-t border-border bg-white px-4 py-4 text-center text-[11.5px] text-slate-muted">
                This conversation is closed. Contact the CEBBD team to reopen it.
              </div>
            ) : (
              <div className="border-t border-border bg-white p-3 sm:p-3.5">
                <div className="flex items-end gap-2">
                  <textarea
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        send();
                      }
                    }}
                    rows={2}
                    placeholder={
                      role === "admin"
                        ? "Reply on behalf of the student…"
                        : "Write a message to the CEBBD team…"
                    }
                    aria-label="Message"
                    className="max-h-32 min-h-[44px] flex-1 resize-none rounded-xl border border-border bg-surface px-3 py-2.5 text-[12.5px] text-ink outline-none placeholder:text-slate-muted focus:border-brand focus:ring-2 focus:ring-brand/15"
                  />
                  <Button
                    type="button"
                    size="icon"
                    onClick={send}
                    disabled={!draft.trim()}
                    aria-label="Send message"
                    className="size-11 shrink-0 rounded-xl"
                  >
                    <Send className="size-4" />
                  </Button>
                </div>
                <p className="mt-1.5 hidden text-[10px] text-slate-muted sm:block">
                  Press Enter to send · Shift + Enter for a new line. Never share
                  bank details or transaction IDs in a public forum.
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center p-6">
            <EmptyState
              icon={MessageSquare}
              title="Select a conversation"
              description="Choose a conversation from the list to read the thread and reply."
              className="border-0 bg-transparent"
            />
          </div>
        )}
      </section>
    </div>
  );
}

export function MessagingLoading() {
  return (
    <div className="flex items-center justify-center py-24 text-slate-muted">
      <Loader2 className="size-5 animate-spin" />
    </div>
  );
}
