import { achievements } from "@/lib/mock-data/achievements";
import {
  mergePaymentSettings,
  mergeSiteSettings,
} from "@/lib/mock-data/settings";
import { impactStats } from "@/lib/mock-data/stats";
import { createPublicClient } from "@/lib/supabase/public";
import type {
  Achievement,
  PaymentSettings,
  SiteSettings,
} from "@/types";

interface SettingsRow {
  payment: unknown;
  site: unknown;
}

/**
 * Reads the settings row from Supabase. Any failure (table missing, network,
 * RLS) falls back to the built-in defaults so pages always render.
 */
async function readSettings(): Promise<SettingsRow | null> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("payment, site")
      .eq("id", "default")
      .maybeSingle();

    if (error) {
      console.warn("[settings] Using default settings:", error.message);
      return null;
    }

    return (data ?? null) as SettingsRow | null;
  } catch (error) {
    console.error(
      "[settings] Failed to read from Supabase:",
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}

export async function getPaymentSettings(): Promise<PaymentSettings> {
  const row = await readSettings();
  return mergePaymentSettings(
    (row?.payment ?? null) as Partial<PaymentSettings> | null,
  );
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const row = await readSettings();
  return mergeSiteSettings(
    (row?.site ?? null) as Partial<SiteSettings> | null,
  );
}

export async function getAchievements(): Promise<Achievement[]> {
  return achievements;
}

export async function getImpactStats() {
  return impactStats;
}
