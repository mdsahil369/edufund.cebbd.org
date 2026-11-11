"use server";

import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import {
  mergePaymentSettings,
  mergeSiteSettings,
} from "@/lib/mock-data/settings";
import type { PaymentSettings, SiteSettings } from "@/types";

export type SettingsActionResult =
  | { ok: true }
  | { ok: false; error: string };

export interface LoadedSettings {
  paymentSettings: PaymentSettings;
  siteSettings: SiteSettings;
}

const UNAUTHORISED = "Only administrators can change website settings.";

interface SettingsRow {
  payment: unknown;
  site: unknown;
}

function logError(context: string, error: unknown) {
  console.error(
    `[settings] ${context}:`,
    error instanceof Error ? error.message : error,
  );
}

/**
 * Reads the settings row with the anonymous key. Settings are public data, so
 * this works for signed-out visitors too, and any failure falls back to the
 * built-in defaults instead of breaking the page.
 */
export async function loadSettingsAction(): Promise<LoadedSettings> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("payment, site")
      .eq("id", "default")
      .maybeSingle();

    if (error) {
      // A missing table (SQL not run yet) must not break the site.
      console.warn("[settings] Using default settings:", error.message);
      return {
        paymentSettings: mergePaymentSettings(null),
        siteSettings: mergeSiteSettings(null),
      };
    }

    const row = (data ?? null) as SettingsRow | null;
    return {
      paymentSettings: mergePaymentSettings(
        (row?.payment ?? null) as Partial<PaymentSettings> | null,
      ),
      siteSettings: mergeSiteSettings(
        (row?.site ?? null) as Partial<SiteSettings> | null,
      ),
    };
  } catch (error) {
    logError("Load failed", error);
    return {
      paymentSettings: mergePaymentSettings(null),
      siteSettings: mergeSiteSettings(null),
    };
  }
}

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase: null, error: "Your session expired. Please sign in again." };
  }
  if (user.app_metadata?.role !== "admin") {
    return { supabase: null, error: UNAUTHORISED };
  }
  return { supabase, error: null };
}

function cleanLines(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 30);
}

function cleanText(value: unknown, max = 300): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

/** Validates the incoming payment settings before they reach the database. */
function normalisePayment(input: PaymentSettings): PaymentSettings {
  return {
    bank: {
      bankName: cleanText(input?.bank?.bankName, 120),
      accountName: cleanText(input?.bank?.accountName, 120),
      accountNumber: cleanText(input?.bank?.accountNumber, 60),
      branch: cleanText(input?.bank?.branch, 120),
      routingNumber: cleanText(input?.bank?.routingNumber, 40),
    },
    bkash: {
      number: cleanText(input?.bkash?.number, 40),
      accountType: cleanText(input?.bkash?.accountType, 80),
    },
    nagad: {
      number: cleanText(input?.nagad?.number, 40),
      accountType: cleanText(input?.nagad?.accountType, 120),
    },
    whatsapp: {
      name: cleanText(input?.whatsapp?.name, 80),
      number: cleanText(input?.whatsapp?.number, 40),
    },
    instructions: cleanLines(input?.instructions),
    international: cleanLines(input?.international),
    verificationNote: cleanText(input?.verificationNote, 500),
    supportEmail: cleanText(input?.supportEmail, 120),
    supportPhone: cleanText(input?.supportPhone, 40),
    updatedAt: new Date().toISOString(),
  };
}

/** Validates the incoming public site settings before they reach the database. */
function normaliseSite(input: SiteSettings): SiteSettings {
  return {
    siteName: cleanText(input?.siteName, 80),
    organization: cleanText(input?.organization, 120),
    tagline: cleanText(input?.tagline, 200),
    description: cleanText(input?.description, 500),
    contactEmail: cleanText(input?.contactEmail, 120),
    contactPhone: cleanText(input?.contactPhone, 40),
    address: cleanText(input?.address, 200),
    announcement: cleanText(input?.announcement, 200),
    announcementHref: cleanText(input?.announcementHref, 200) || "/students",
    socials: {
      facebook: cleanText(input?.socials?.facebook, 200),
      instagram: cleanText(input?.socials?.instagram, 200),
      linkedin: cleanText(input?.socials?.linkedin, 200),
      youtube: cleanText(input?.socials?.youtube, 200),
    },
    donationNote: cleanText(input?.donationNote, 300),
  };
}

export async function savePaymentSettingsAction(
  settings: PaymentSettings,
): Promise<SettingsActionResult> {
  const { supabase, error } = await requireAdmin();
  if (!supabase) return { ok: false, error: error ?? UNAUTHORISED };

  const payment = normalisePayment(settings);
  if (!payment.bank.accountNumber && !payment.bkash.number) {
    return {
      ok: false,
      error: "Add at least a bank account number or a bKash number.",
    };
  }

  const { error: saveError } = await supabase
    .from("site_settings")
    .upsert({ id: "default", payment }, { onConflict: "id" });

  if (saveError) {
    logError("Save payment settings failed", saveError.message);
    return { ok: false, error: "Could not save payment settings. Please try again." };
  }

  return { ok: true };
}

export async function saveSiteSettingsAction(
  settings: SiteSettings,
): Promise<SettingsActionResult> {
  const { supabase, error } = await requireAdmin();
  if (!supabase) return { ok: false, error: error ?? UNAUTHORISED };

  const site = normaliseSite(settings);
  if (!site.siteName || !site.contactEmail || !site.contactPhone) {
    return {
      ok: false,
      error: "Site name, contact email and contact phone are required.",
    };
  }

  const { error: saveError } = await supabase
    .from("site_settings")
    .upsert({ id: "default", site }, { onConflict: "id" });

  if (saveError) {
    logError("Save site settings failed", saveError.message);
    return { ok: false, error: "Could not save site settings. Please try again." };
  }

  return { ok: true };
}
