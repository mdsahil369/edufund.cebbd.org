import { achievements } from "@/lib/mock-data/achievements";
import { paymentSettings, siteSettings } from "@/lib/mock-data/settings";
import { impactStats } from "@/lib/mock-data/stats";
import type { Achievement, PaymentSettings, SiteSettings } from "@/types";

export async function getPaymentSettings(): Promise<PaymentSettings> {
  return paymentSettings;
}

export async function getSiteSettings(): Promise<SiteSettings> {
  return siteSettings;
}

export async function getAchievements(): Promise<Achievement[]> {
  return achievements;
}

export async function getImpactStats() {
  return impactStats;
}
