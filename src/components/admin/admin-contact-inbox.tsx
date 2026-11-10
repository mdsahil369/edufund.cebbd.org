"use client";

import { useMemo, useState } from "react";
import { Inbox, Mail, Phone, Search } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusPill } from "@/components/shared/status-pill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ContactMessage } from "@/types";
import { formatDateTime } from "@/lib/utils";

const subjectLabels: Record<ContactMessage["subject"], string> = {
  general: "General enquiry",
  donation: "Donation or payment",
  student: "Student support",
  partnership: "Partnership",
  media: "Media & press",
};

interface AdminContactInboxProps {
  messages: ContactMessage[];
}

export function AdminContactInbox({ messages }: AdminContactInboxProps) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ContactMessage | null>(null);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return messages;
    return messages.filter((message) =>
      [message.name, message.email, message.phone ?? "", message.message, message.subject]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [messages, search]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contact Inbox"
        description="Messages sent through the public contact form. This inbox is read-only — reply to the sender by email or phone."
        action={
          <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 text-[11.5px] text-slate-muted">
            <Inbox className="size-4 text-brand" />
            {messages.length} total messages
          </div>
        }
      />

      <div className="rounded-2xl border border-border bg-white shadow-sm">
        <div className="border-b border-border p-4">
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-muted"
              aria-hidden="true"
            />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, email, phone, or message…"
              aria-label="Search contact messages"
              className="h-9 pl-9 text-[12.5px]"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={Inbox}
              title={messages.length === 0 ? "No messages yet" : "No messages match your search"}
              description={
                messages.length === 0
                  ? "Messages sent through the contact form will appear here."
                  : "Try a different name, email, or keyword."
              }
              action={
                messages.length > 0 ? (
                  <Button variant="outline" size="sm" onClick={() => setSearch("")}>
                    Clear search
                  </Button>
                ) : undefined
              }
              className="border-0 bg-surface"
            />
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((message) => (
              <li key={message.id}>
                <button
                  type="button"
                  onClick={() => setSelected(message)}
                  className="flex w-full flex-col gap-2 px-5 py-4 text-left transition-colors hover:bg-surface sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 text-[13px] font-semibold text-ink">
                      {message.name}
                      <StatusPill tone="neutral" className="py-0 text-[9.5px]">
                        {subjectLabels[message.subject]}
                      </StatusPill>
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-slate-muted">
                      {message.email}
                      {message.phone ? ` · ${message.phone}` : ""}
                    </p>
                    <p className="mt-1 line-clamp-2 text-[11.5px] leading-relaxed text-ink/70">
                      {message.message}
                    </p>
                  </div>
                  <span className="shrink-0 text-[10.5px] text-slate-muted">
                    {formatDateTime(message.createdAt)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.name}</DialogTitle>
                <DialogDescription>
                  {subjectLabels[selected.subject]} · {formatDateTime(selected.createdAt)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <a
                    href={`mailto:${selected.email}`}
                    className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-[11.5px] font-medium text-ink transition-colors hover:border-brand/30 hover:text-brand-dark"
                  >
                    <Mail className="size-3.5" />
                    {selected.email}
                  </a>
                  {selected.phone && (
                    <a
                      href={`tel:${selected.phone.replace(/\s/g, "")}`}
                      className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-[11.5px] font-medium text-ink transition-colors hover:border-brand/30 hover:text-brand-dark"
                    >
                      <Phone className="size-3.5" />
                      {selected.phone}
                    </a>
                  )}
                </div>

                <div className="whitespace-pre-wrap rounded-xl border border-border bg-surface p-4 text-[12.5px] leading-relaxed text-ink/80">
                  {selected.message}
                </div>

                <div className="flex justify-end">
                  <Button variant="outline" onClick={() => setSelected(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
