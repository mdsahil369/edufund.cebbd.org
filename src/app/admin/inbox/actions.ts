"use server";

import { createClient } from "@/lib/supabase/server";
import type { ContactMessage } from "@/types";

interface ContactMessageRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

const SUBJECTS = ["general", "donation", "student", "partnership", "media"] as const;

function toContactMessage(row: ContactMessageRow): ContactMessage {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone ?? undefined,
    subject: SUBJECTS.includes(row.subject as (typeof SUBJECTS)[number])
      ? (row.subject as ContactMessage["subject"])
      : "general",
    message: row.message,
    status: row.status === "read" ? "read" : "new",
    createdAt: row.created_at,
  };
}

/** Contact enquiries for the admin inbox (read-only). */
export async function listContactMessagesAction(): Promise<ContactMessage[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role !== "admin") {
    return [];
  }

  const { data, error } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[admin/inbox] Failed to load messages:", error.message);
    return [];
  }

  return ((data ?? []) as ContactMessageRow[]).map(toContactMessage);
}
