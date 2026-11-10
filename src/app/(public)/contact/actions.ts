"use server";

import { createClient } from "@/lib/supabase/server";

export type ContactMessageResult = { ok: true } | { ok: false; error: string };

const subjects = ["general", "donation", "student", "partnership", "media"] as const;

/**
 * Store a public contact enquiry in Supabase. The table allows anonymous
 * inserts only (no reads, no updates), and the admin inbox reads them.
 */
export async function submitContactMessageAction(input: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}): Promise<ContactMessageResult> {
  const name = input.name?.trim() ?? "";
  const email = input.email?.trim() ?? "";
  const phone = input.phone?.trim() ?? "";
  const message = input.message?.trim() ?? "";
  const subject = subjects.includes(input.subject as (typeof subjects)[number])
    ? input.subject
    : "general";

  if (name.length < 2 || name.length > 80) {
    return { ok: false, error: "Enter your name (2–80 characters)." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 160) {
    return { ok: false, error: "Enter a valid email address." };
  }
  if (phone && (phone.length < 6 || phone.length > 30)) {
    return { ok: false, error: "Enter a valid phone number, or leave it blank." };
  }
  if (message.length < 20 || message.length > 2000) {
    return { ok: false, error: "Please write between 20 and 2,000 characters." };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("contact_messages").insert({
      name,
      email: email.toLowerCase(),
      phone: phone || null,
      subject,
      message,
      status: "new",
    });

    if (error) {
      console.error("[contact] Failed to store message:", error.message);
      return {
        ok: false,
        error: "We could not save your message right now. Please email us directly.",
      };
    }

    return { ok: true };
  } catch (error) {
    console.error(
      "[contact] Supabase is not configured:",
      error instanceof Error ? error.message : error,
    );
    return {
      ok: false,
      error: "We could not save your message right now. Please email us directly.",
    };
  }
}
