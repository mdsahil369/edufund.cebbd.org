"use client";

import { useState } from "react";
import {
  Building2,
  CheckCircle2,
  Info,
  Landmark,
  RotateCcw,
  Save,
  Smartphone,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useDemoData } from "@/lib/store/demo-store";
import { formatDateTime } from "@/lib/utils";

export function AdminPaymentSettings() {
  const { hydrated, paymentSettings } = useDemoData();

  if (!hydrated) {
    return (
      <div className="space-y-4">
        <div className="h-20 animate-pulse rounded-2xl bg-white" />
        <div className="h-96 animate-pulse rounded-2xl bg-white" />
      </div>
    );
  }

  return <PaymentSettingsForm />;
}

function PaymentSettingsForm() {
  const { paymentSettings, updatePaymentSettings } = useDemoData();
  const [form, setForm] = useState(paymentSettings);
  const [instructionsText, setInstructionsText] = useState(
    paymentSettings.instructions.join("\n"),
  );

  const save = () => {
    const instructions = instructionsText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    if (instructions.length === 0) {
      toast.error("Add at least one payment instruction.");
      return;
    }
    updatePaymentSettings({
      ...form,
      instructions,
      updatedAt: new Date().toISOString(),
    });
    toast.success("Payment settings saved.");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment Settings"
        description="These details appear in the manual donation flow. Donors transfer directly and submit a transaction reference for verification."
        action={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setForm(paymentSettings);
                setInstructionsText(paymentSettings.instructions.join("\n"));
                toast.info("Unsaved changes discarded.");
              }}
            >
              <RotateCcw className="size-4" />
              Discard
            </Button>
            <Button onClick={save}>
              <Save className="size-4" />
              Save settings
            </Button>
          </div>
        }
      />

      <div className="grid items-start gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-border bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-border px-5 py-4">
              <Landmark className="size-4 text-brand" />
              <div>
                <h2 className="text-[14px] font-bold text-navy">Bank transfer</h2>
                <p className="text-[10.5px] text-slate-muted">
                  Shown as the bank option in step 3 of the donation flow.
                </p>
              </div>
            </div>
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              {[
                ["bankName", "Bank name", "Dutch-Bangla Bank"],
                ["accountName", "Account name", "Community Empowerment Bangladesh"],
                ["accountNumber", "Account number", "1021 3456 7890"],
                ["branch", "Branch", "Gulshan Branch, Dhaka"],
                ["routingNumber", "Routing number", "090261726"],
              ].map(([key, label, placeholder]) => (
                <div
                  key={key}
                  className={key === "accountName" ? "sm:col-span-2" : undefined}
                >
                  <label
                    htmlFor={`bank-${key}`}
                    className="mb-1 block text-[11.5px] font-semibold text-ink"
                  >
                    {label}
                  </label>
                  <Input
                    id={`bank-${key}`}
                    value={form.bank[key as keyof typeof form.bank]}
                    placeholder={placeholder}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        bank: { ...current.bank, [key]: event.target.value },
                      }))
                    }
                  />
                </div>
              ))}
            </div>
          </section>

          <div className="grid gap-6 sm:grid-cols-2">
            <section className="rounded-2xl border border-border bg-white shadow-sm">
              <div className="flex items-center gap-2 border-b border-border px-5 py-4">
                <Smartphone className="size-4 text-brand" />
                <div>
                  <h2 className="text-[14px] font-bold text-navy">bKash</h2>
                  <p className="text-[10.5px] text-slate-muted">Merchant or personal</p>
                </div>
              </div>
              <div className="space-y-4 p-5">
                <div>
                  <label
                    htmlFor="bkash-number"
                    className="mb-1 block text-[11.5px] font-semibold text-ink"
                  >
                    Number
                  </label>
                  <Input
                    id="bkash-number"
                    value={form.bkash.number}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        bkash: { ...current.bkash, number: event.target.value },
                      }))
                    }
                  />
                </div>
                <div>
                  <label
                    htmlFor="bkash-type"
                    className="mb-1 block text-[11.5px] font-semibold text-ink"
                  >
                    Account type
                  </label>
                  <Input
                    id="bkash-type"
                    value={form.bkash.accountType}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        bkash: {
                          ...current.bkash,
                          accountType: event.target.value,
                        },
                      }))
                    }
                  />
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-white shadow-sm">
              <div className="flex items-center gap-2 border-b border-border px-5 py-4">
                <Smartphone className="size-4 text-brand" />
                <div>
                  <h2 className="text-[14px] font-bold text-navy">Nagad</h2>
                  <p className="text-[10.5px] text-slate-muted">Merchant or personal</p>
                </div>
              </div>
              <div className="space-y-4 p-5">
                <div>
                  <label
                    htmlFor="nagad-number"
                    className="mb-1 block text-[11.5px] font-semibold text-ink"
                  >
                    Number
                  </label>
                  <Input
                    id="nagad-number"
                    value={form.nagad.number}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        nagad: { ...current.nagad, number: event.target.value },
                      }))
                    }
                  />
                </div>
                <div>
                  <label
                    htmlFor="nagad-type"
                    className="mb-1 block text-[11.5px] font-semibold text-ink"
                  >
                    Account type
                  </label>
                  <Input
                    id="nagad-type"
                    value={form.nagad.accountType}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        nagad: {
                          ...current.nagad,
                          accountType: event.target.value,
                        },
                      }))
                    }
                  />
                </div>
              </div>
            </section>
          </div>

          <section className="rounded-2xl border border-border bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-border px-5 py-4">
              <Info className="size-4 text-brand" />
              <div>
                <h2 className="text-[14px] font-bold text-navy">
                  Instructions & verification
                </h2>
                <p className="text-[10.5px] text-slate-muted">
                  Shown before a donor submits their transaction reference.
                </p>
              </div>
            </div>
            <div className="space-y-4 p-5">
              <div>
                <label
                  htmlFor="instructions"
                  className="mb-1 block text-[11.5px] font-semibold text-ink"
                >
                  Instructions (one per line)
                </label>
                <Textarea
                  id="instructions"
                  rows={6}
                  value={instructionsText}
                  onChange={(event) => setInstructionsText(event.target.value)}
                />
                <p className="mt-1 text-[10px] text-slate-muted">
                  Keep each step short and actionable. These appear as a numbered
                  list for donors.
                </p>
              </div>
              <div>
                <label
                  htmlFor="verificationNote"
                  className="mb-1 block text-[11.5px] font-semibold text-ink"
                >
                  Verification note
                </label>
                <Textarea
                  id="verificationNote"
                  rows={2}
                  value={form.verificationNote}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      verificationNote: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="supportEmail"
                    className="mb-1 block text-[11.5px] font-semibold text-ink"
                  >
                    Support email
                  </label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={form.supportEmail}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        supportEmail: event.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label
                    htmlFor="supportPhone"
                    className="mb-1 block text-[11.5px] font-semibold text-ink"
                  >
                    Support phone
                  </label>
                  <Input
                    id="supportPhone"
                    value={form.supportPhone}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        supportPhone: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-brand/15 bg-brand-soft p-5">
            <p className="flex items-center gap-2 text-[12px] font-bold text-brand-dark">
              <CheckCircle2 className="size-4" />
              Manual verification
            </p>
            <p className="mt-2 text-[11.5px] leading-relaxed text-slate-muted">
              Every donation is submitted as pending. The finance team checks the
              transaction ID and approves or rejects it from the donations queue.
              Approved amounts alone update public campaign totals.
            </p>
            <p className="mt-3 border-t border-brand/10 pt-3 text-[10.5px] text-slate-muted">
              Last updated: {formatDateTime(paymentSettings.updatedAt)}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
            <p className="flex items-center gap-2 text-[12px] font-bold text-navy">
              <Building2 className="size-4 text-brand" />
              Donor-facing checklist
            </p>
            <ul className="mt-3 space-y-2 text-[11px] text-slate-muted">
              {[
                "Bank, bKash, and Nagad details are complete",
                "Instructions explain fees and receipts",
                "Support contact is monitored",
                "Verification note explains pending status",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-600" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
