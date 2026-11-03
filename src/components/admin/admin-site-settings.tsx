"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Globe2,
  Megaphone,
  RotateCcw,
  Save,
  ShieldCheck,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useDemoData } from "@/lib/store/demo-store";
import type { SiteSettings } from "@/types";

export function AdminSiteSettings() {
  const { hydrated } = useDemoData();

  if (!hydrated) {
    return (
      <div className="space-y-4">
        <div className="h-20 animate-pulse rounded-2xl bg-white" />
        <div className="h-96 animate-pulse rounded-2xl bg-white" />
      </div>
    );
  }

  return <SiteSettingsForm />;
}

function SiteSettingsForm() {
  const { siteSettings, updateSiteSettings, resetDemoData } = useDemoData();
  const router = useRouter();
  const [form, setForm] = useState<SiteSettings>(siteSettings);
  const [resetOpen, setResetOpen] = useState(false);

  const save = () => {
    if (
      !form.siteName.trim() ||
      !form.organization.trim() ||
      !form.contactEmail.trim() ||
      !form.contactPhone.trim()
    ) {
      toast.error("Site name, organization, and contact details are required.");
      return;
    }
    updateSiteSettings(form);
    toast.success("Site settings saved. Header details update immediately.");
  };

  const setField = <K extends keyof SiteSettings>(
    key: K,
    value: SiteSettings[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Site Settings"
        description="Manage public site details, the announcement bar, and sample data. Changes are stored in this browser."
        action={
          <Button onClick={save}>
            <Save className="size-4" />
            Save settings
          </Button>
        }
      />

      <div className="grid items-start gap-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-border bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-border px-5 py-4">
              <Globe2 className="size-4 text-brand" />
              <div>
                <h2 className="text-[14px] font-bold text-navy">Organization</h2>
                <p className="text-[10.5px] text-slate-muted">
                  Core identity used across the site and metadata.
                </p>
              </div>
            </div>
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <div>
                <label htmlFor="siteName" className="mb-1 block text-[11.5px] font-semibold text-ink">
                  Site name
                </label>
                <Input
                  id="siteName"
                  value={form.siteName}
                  onChange={(event) => setField("siteName", event.target.value)}
                />
              </div>
              <div>
                <label htmlFor="organization" className="mb-1 block text-[11.5px] font-semibold text-ink">
                  Organization
                </label>
                <Input
                  id="organization"
                  value={form.organization}
                  onChange={(event) => setField("organization", event.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="tagline" className="mb-1 block text-[11.5px] font-semibold text-ink">
                  Tagline
                </label>
                <Input
                  id="tagline"
                  value={form.tagline}
                  onChange={(event) => setField("tagline", event.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="description" className="mb-1 block text-[11.5px] font-semibold text-ink">
                  Description
                </label>
                <Textarea
                  id="description"
                  rows={3}
                  value={form.description}
                  onChange={(event) => setField("description", event.target.value)}
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-border px-5 py-4">
              <Megaphone className="size-4 text-brand" />
              <div>
                <h2 className="text-[14px] font-bold text-navy">
                  Announcement & contact
                </h2>
                <p className="text-[10.5px] text-slate-muted">
                  The announcement appears in the top bar of the public site.
                </p>
              </div>
            </div>
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="announcement" className="mb-1 block text-[11.5px] font-semibold text-ink">
                  Announcement text
                </label>
                <Input
                  id="announcement"
                  value={form.announcement}
                  onChange={(event) => setField("announcement", event.target.value)}
                />
              </div>
              <div>
                <label htmlFor="announcementHref" className="mb-1 block text-[11.5px] font-semibold text-ink">
                  Announcement link
                </label>
                <Input
                  id="announcementHref"
                  value={form.announcementHref}
                  onChange={(event) =>
                    setField("announcementHref", event.target.value)
                  }
                />
              </div>
              <div>
                <label htmlFor="contactEmail" className="mb-1 block text-[11.5px] font-semibold text-ink">
                  Contact email
                </label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={form.contactEmail}
                  onChange={(event) => setField("contactEmail", event.target.value)}
                />
              </div>
              <div>
                <label htmlFor="contactPhone" className="mb-1 block text-[11.5px] font-semibold text-ink">
                  Contact phone
                </label>
                <Input
                  id="contactPhone"
                  value={form.contactPhone}
                  onChange={(event) => setField("contactPhone", event.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="address" className="mb-1 block text-[11.5px] font-semibold text-ink">
                  Office address
                </label>
                <Input
                  id="address"
                  value={form.address}
                  onChange={(event) => setField("address", event.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="donationNote" className="mb-1 block text-[11.5px] font-semibold text-ink">
                  Donation note
                </label>
                <Textarea
                  id="donationNote"
                  rows={2}
                  value={form.donationNote}
                  onChange={(event) => setField("donationNote", event.target.value)}
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-border px-5 py-4">
              <Share2 className="size-4 text-brand" />
              <div>
                <h2 className="text-[14px] font-bold text-navy">Social links</h2>
                <p className="text-[10.5px] text-slate-muted">
                  Full URLs used in the footer.
                </p>
              </div>
            </div>
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              {(
                [
                  ["facebook", "Facebook"],
                  ["instagram", "Instagram"],
                  ["linkedin", "LinkedIn"],
                  ["youtube", "YouTube"],
                ] as const
              ).map(([key, label]) => (
                <div key={key}>
                  <label
                    htmlFor={`social-${key}`}
                    className="mb-1 block text-[11.5px] font-semibold text-ink"
                  >
                    {label}
                  </label>
                  <Input
                    id={`social-${key}`}
                    value={form.socials[key]}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        socials: { ...current.socials, [key]: event.target.value },
                      }))
                    }
                  />
                </div>
              ))}
            </div>
          </section>

          <div className="flex justify-end">
            <Button onClick={save}>
              <Save className="size-4" />
              Save all settings
            </Button>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-brand/15 bg-brand-soft p-5">
            <p className="flex items-center gap-2 text-[12px] font-bold text-brand-dark">
              <ShieldCheck className="size-4" />
Platform preview
            </p>
            <p className="mt-2 text-[11.5px] leading-relaxed text-slate-muted">
              Site settings are stored in localStorage in this phase. Header
              contact details and the announcement update immediately; the footer
              uses seeded content until the Supabase integration.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
            <p className="flex items-center gap-2 text-[12px] font-bold text-navy">
              <RotateCcw className="size-4 text-brand" />
              Reset sample data
            </p>
            <p className="mt-2 text-[11px] leading-relaxed text-slate-muted">
              Restore the original students, donations, conversations, and
              settings. This also signs you out and clears all local changes.
            </p>
            <Button
              variant="outline"
              className="mt-3 w-full border-red-200 text-red-700 hover:bg-red-50"
              onClick={() => setResetOpen(true)}
            >
              <RotateCcw className="size-4" />
              Reset sample data
            </Button>
          </div>
        </aside>
      </div>

      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset all sample data?</DialogTitle>
            <DialogDescription>
              This restores the seeded students, donations, messages, and settings,
              and signs you out. Any changes you made in this browser will be lost.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[11.5px] text-red-700">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            This action cannot be undone.
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                resetDemoData();
                setResetOpen(false);
                toast.success("Sample data restored.");
                router.push("/login");
              }}
            >
              <RotateCcw className="size-4" />
              Reset everything
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
