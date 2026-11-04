"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Banknote,
  CalendarClock,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Copy,
  GraduationCap,
  Heart,
  Landmark,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  Smartphone,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { StudentAvatar } from "@/components/students/student-avatar";
import { FundingProgress } from "@/components/students/funding-progress";
import { StatusPill } from "@/components/shared/status-pill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useDemoData } from "@/lib/store/demo-store";
import type {
  Donation,
  DonationType,
  FundingSummary,
  PaymentMethodId,
  PublicStudent,
} from "@/types";
import {
  cn,
  donationTypeLabels,
  formatBDT,
  formatDate,
  paymentMethodLabels,
} from "@/lib/utils";

const supportTypes: {
  value: DonationType;
  label: string;
  icon: typeof Heart;
  description: string;
}[] = [
  {
    value: "one-time",
    label: "One-time donation",
    icon: Heart,
    description: "Make a single contribution of any amount.",
  },
  {
    value: "monthly",
    label: "Monthly sponsorship",
    icon: CalendarClock,
    description: "Support the student month by month.",
  },
  {
    value: "yearly",
    label: "Yearly sponsorship",
    icon: CalendarDays,
    description: "Cover a full academic year of support.",
  },
  {
    value: "full-scholarship",
    label: "Full scholarship",
    icon: GraduationCap,
    description: "Meet the remaining campaign need in one gift.",
  },
];

const methods: {
  value: PaymentMethodId;
  label: string;
  icon: typeof Landmark;
}[] = [
  { value: "bank-transfer", label: "Bank transfer", icon: Landmark },
  { value: "bkash", label: "bKash", icon: Smartphone },
  { value: "nagad", label: "Nagad", icon: Wallet },
];

const stepLabels = [
  "Support type",
  "Amount",
  "Payment",
  "Details",
  "Confirmation",
];

const validTypes: DonationType[] = [
  "one-time",
  "monthly",
  "yearly",
  "full-scholarship",
];

const donationFormSchema = z.object({
  method: z.enum(["bank-transfer", "bkash", "nagad"]),
  transactionId: z
    .string()
    .trim()
    .min(6, "Enter the transaction ID from your payment receipt.")
    .max(80, "Transaction ID is too long."),
  senderReference: z
    .string()
    .trim()
    .min(4, "Enter the sender number or account reference.")
    .max(80, "Reference is too long."),
  amount: z
    .number({ message: "Enter a valid amount." })
    .min(100, "The minimum donation is ৳100."),
  paymentDate: z.string().min(1, "Select the date you made the payment."),
  message: z.string().max(500, "Please keep your message under 500 characters.").optional(),
});

type DonationFormValues = z.infer<typeof donationFormSchema>;

interface DonationWizardProps {
  student: PublicStudent;
  funding: FundingSummary;
}

function CopyValue({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(`${label} copied.`);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy. Please select the text manually.");
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-3 py-2.5">
      <div className="min-w-0">
        <p className="text-[10.5px] font-medium text-slate-muted">{label}</p>
        <p className="truncate text-[13px] font-semibold text-ink">{value}</p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        onClick={copy}
        aria-label={`Copy ${label}`}
      >
        {copied ? <Check className="size-3.5 text-brand" /> : <Copy className="size-3.5" />}
      </Button>
    </div>
  );
}

function Stepper({ step }: { step: number }) {
  return (
    <div>
      <div className="flex items-center justify-between lg:hidden">
        <p className="text-[12px] font-semibold text-ink">
          Step {step} of 5 · {stepLabels[step - 1]}
        </p>
        <p className="text-[11px] text-slate-muted">{Math.round((step / 5) * 100)}%</p>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted lg:hidden">
        <div
          className="h-full rounded-full bg-brand transition-all duration-500"
          style={{ width: `${(step / 5) * 100}%` }}
        />
      </div>
      <ol className="hidden items-center gap-2 lg:flex">
        {stepLabels.map((label, index) => {
          const number = index + 1;
          const complete = number < step;
          const active = number === step;
          return (
            <li key={label} className="flex flex-1 items-center gap-2">
              <span
                className={cn(
                  "inline-flex size-7 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold",
                  complete
                    ? "border-brand bg-brand text-white"
                    : active
                      ? "border-brand bg-brand-light text-brand-dark"
                      : "border-border bg-white text-slate-muted",
                )}
              >
                {complete ? <Check className="size-3.5" /> : number}
              </span>
              <span
                className={cn(
                  "text-[11.5px] font-medium whitespace-nowrap",
                  active ? "text-brand-dark" : complete ? "text-ink" : "text-slate-muted",
                )}
              >
                {label}
              </span>
              {index < stepLabels.length - 1 && (
                <span className="mx-1 h-px flex-1 bg-border" aria-hidden="true" />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function DonationWizard({ student, funding }: DonationWizardProps) {
  const searchParams = useSearchParams();
  const { session, hydrated, submitDonation, paymentSettings } = useDemoData();

  const initialType = useMemo(() => {
    const value = searchParams.get("type");
    return validTypes.includes(value as DonationType)
      ? (value as DonationType)
      : "one-time";
  }, [searchParams]);

  const [step, setStep] = useState(1);
  const [type, setType] = useState<DonationType>(initialType);
  const [customAmount, setCustomAmount] = useState(false);
  const [amount, setAmount] = useState<number>(
    student.supportPlans.oneTimeOptions[0] ?? 1000,
  );
  const [submitted, setSubmitted] = useState<Donation | null>(null);

  // The payment date cannot be in the future. Computed once per mount.
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const form = useForm<DonationFormValues>({
    resolver: zodResolver(donationFormSchema),
    defaultValues: {
      method: "bkash",
      transactionId: "",
      senderReference: "",
      amount: student.supportPlans.oneTimeOptions[0] ?? 1000,
      paymentDate: today,
      message: "",
    },
  });

  const selectedMethod = form.watch("method");

  useEffect(() => {
    if (type === "one-time") {
      setAmount(student.supportPlans.oneTimeOptions[0] ?? 1000);
      setCustomAmount(false);
    } else if (type === "monthly") {
      setAmount(student.supportPlans.monthly);
    } else if (type === "yearly") {
      setAmount(student.supportPlans.yearly);
    } else {
      setAmount(student.supportPlans.fullScholarship);
    }
  }, [type, student.supportPlans]);

  useEffect(() => {
    form.setValue("amount", amount);
  }, [amount, form]);

  const goToStep = (next: number) => {
    setStep(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleContinue = () => {
    if (step === 2 && type === "one-time" && amount < 100) {
      toast.error("Please enter at least ৳100.");
      return;
    }
    goToStep(Math.min(step + 1, 5));
  };

  const onSubmit = form.handleSubmit(async (values) => {
    if (!session?.donorId) {
      toast.error("Please sign in as a donor before submitting a donation.");
      return;
    }

    try {
      const donation = await submitDonation({
        donorId: session.donorId,
        studentId: student.id,
        type,
        amount: values.amount,
        method: values.method,
        transactionId: values.transactionId,
        senderReference: values.senderReference,
        paymentDate: values.paymentDate,
        message: values.message,
      });
      setSubmitted(donation);
      goToStep(5);
      toast.success("Donation submitted. Awaiting verification.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not submit your donation. Please try again.",
      );
    }
  });

  if (!hydrated) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="h-[420px] animate-pulse rounded-2xl border border-border bg-white" />
        <div className="h-[300px] animate-pulse rounded-2xl border border-border bg-white" />
      </div>
    );
  }

  if (!session || session.role !== "donor") {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-border bg-white p-8 text-center shadow-sm">
        <span className="mx-auto inline-flex size-14 items-center justify-center rounded-2xl bg-brand-light text-brand-dark">
          <LockKeyhole className="size-6" />
        </span>
        <h2 className="mt-5 text-xl font-bold text-navy">
          Sign in to support {student.fullName.split(" ")[0]}
        </h2>
        <p className="mt-2 text-[13.5px] leading-relaxed text-slate-muted">
          Donor accounts keep your donation history and verification status in one
          place. No online payment is processed — our finance team verifies every
          transfer manually.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button asChild size="lg">
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/register">Create an account</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (step === 5 && submitted) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          <div className="bg-gradient-to-br from-brand-deep to-brand-dark p-8 text-center text-white">
            <span className="mx-auto inline-flex size-16 items-center justify-center rounded-full bg-white/15">
              <CheckCircle2 className="size-8" />
            </span>
            <h2 className="mt-4 text-2xl font-bold">Thank you for your kindness</h2>
            <p className="mt-2 text-[13.5px] text-white/70">
              Your donation has been submitted and is awaiting verification.
            </p>
          </div>
          <div className="p-6 sm:p-8">
            <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <div className="flex items-center gap-2 text-amber-800">
                <Clock3 className="size-4" />
                <span className="text-[13px] font-semibold">Awaiting verification</span>
              </div>
              <StatusPill tone="warning">Pending</StatusPill>
            </div>

            <dl className="mt-5 space-y-3 text-[13px]">
              {[
                ["Receipt number", submitted.receiptNumber],
                ["Student", student.fullName],
                ["Support type", donationTypeLabels[submitted.type]],
                ["Amount", formatBDT(submitted.amount)],
                ["Payment method", paymentMethodLabels[submitted.method]],
                ["Transaction ID", submitted.transactionId],
                ["Payment date", formatDate(submitted.paymentDate)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-4 border-b border-dashed border-border pb-3 last:border-0">
                  <dt className="text-slate-muted">{label}</dt>
                  <dd className="text-right font-semibold text-ink">{value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-5 rounded-xl bg-surface p-4">
              <p className="text-[12px] font-semibold text-navy">What happens next?</p>
              <ol className="mt-2 space-y-1.5 text-[11.5px] leading-relaxed text-slate-muted">
                <li>1. Our finance team matches your transaction within 1–2 business days.</li>
                <li>2. If approved, the donation is added to {student.fullName.split(" ")[0]}&apos;s campaign.</li>
                <li>3. You can follow the status in your donor dashboard at any time.</li>
              </ol>
            </div>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <Button asChild className="flex-1">
                <Link href="/dashboard/donations">View my donations</Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href="/dashboard">Go to dashboard</Link>
              </Button>
            </div>
            <p className="mt-4 text-center text-[11px] text-slate-muted">
              Pending donations never increase the public campaign total.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
      <div className="rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-7">
        <Stepper step={step} />

        <div className="mt-7">
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold text-navy">How would you like to support?</h2>
              <p className="mt-1.5 text-[13px] text-slate-muted">
                Support amounts are set by CEBBD for this student.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {supportTypes.map((option) => {
                  const selected = type === option.value;
                  const optionAmount =
                    option.value === "one-time"
                      ? `From ${formatBDT(Math.min(...student.supportPlans.oneTimeOptions))}`
                      : option.value === "monthly"
                        ? `${formatBDT(student.supportPlans.monthly)} / month`
                        : option.value === "yearly"
                          ? `${formatBDT(student.supportPlans.yearly)} / year`
                          : formatBDT(student.supportPlans.fullScholarship);
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setType(option.value)}
                      className={cn(
                        "flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all",
                        selected
                          ? "border-brand bg-brand-soft ring-2 ring-brand/15"
                          : "border-border hover:border-brand/30 hover:bg-surface",
                      )}
                      aria-pressed={selected}
                    >
                      <span
                        className={cn(
                          "inline-flex size-9 items-center justify-center rounded-lg",
                          selected
                            ? "bg-brand text-white"
                            : "bg-brand-light text-brand-dark",
                        )}
                      >
                        <option.icon className="size-4" />
                      </span>
                      <span className="text-[13.5px] font-bold text-ink">
                        {option.label}
                      </span>
                      <span className="text-[12.5px] font-semibold text-brand-dark">
                        {optionAmount}
                      </span>
                      <span className="text-[11.5px] leading-relaxed text-slate-muted">
                        {option.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold text-navy">Choose your amount</h2>
              <p className="mt-1.5 text-[13px] text-slate-muted">
                {type === "one-time"
                  ? "Pick a suggested amount or enter your own."
                  : "This amount is configured by CEBBD and cannot be edited."}
              </p>

              {type === "one-time" ? (
                <div className="mt-5">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {student.supportPlans.oneTimeOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => {
                          setCustomAmount(false);
                          setAmount(option);
                        }}
                        className={cn(
                          "rounded-xl border px-3 py-3 text-[13px] font-bold transition-colors",
                          !customAmount && amount === option
                            ? "border-brand bg-brand text-white"
                            : "border-border bg-white text-ink hover:border-brand/30",
                        )}
                      >
                        {formatBDT(option)}
                      </button>
                    ))}
                  </div>
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setCustomAmount(true);
                        setAmount(0);
                      }}
                      className={cn(
                        "text-[12.5px] font-semibold",
                        customAmount ? "text-brand-dark" : "text-slate-muted hover:text-brand",
                      )}
                    >
                      Or enter a custom amount
                    </button>
                    {customAmount && (
                      <div className="mt-2 max-w-xs">
                        <label htmlFor="custom-amount" className="mb-1.5 block text-[11.5px] font-medium text-ink">
                          Amount (BDT)
                        </label>
                        <Input
                          id="custom-amount"
                          type="number"
                          min={100}
                          step={100}
                          value={amount || ""}
                          onChange={(event) => setAmount(Number(event.target.value))}
                          placeholder="Enter amount"
                        />
                        <p className="mt-1 text-[10.5px] text-slate-muted">Minimum ৳100</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mt-5 rounded-xl border border-brand/20 bg-brand-soft p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-dark">
                    {donationTypeLabels[type]}
                  </p>
                  <p className="mt-1 text-3xl font-extrabold text-brand-dark">
                    {formatBDT(amount)}
                  </p>
                  <p className="mt-1 text-[12px] text-slate-muted">
                    {type === "monthly"
                      ? "Pay this amount each month through your chosen manual method."
                      : type === "yearly"
                        ? "Pay this amount once per academic year."
                        : "Covers the remaining verified need for this campaign."}
                  </p>
                </div>
              )}

              <div className="mt-6 rounded-xl border border-border bg-surface p-4 text-[12px] leading-relaxed text-slate-muted">
                <ShieldCheck className="mr-1.5 inline size-4 text-brand" />
                Only admin-approved donations are added to the campaign total. Your
                submission starts as <strong>pending</strong>.
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-xl font-bold text-navy">Make your manual payment</h2>
              <p className="mt-1.5 text-[13px] text-slate-muted">
                Send <strong className="text-ink">{formatBDT(amount)}</strong> using one
                of the methods below, then continue to submit your payment details.
              </p>

              <Tabs defaultValue="bkash" className="mt-5">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="bkash">bKash</TabsTrigger>
                  <TabsTrigger value="nagad">Nagad</TabsTrigger>
                  <TabsTrigger value="bank-transfer">Bank</TabsTrigger>
                </TabsList>
                <TabsContent value="bkash" className="mt-4 space-y-2.5">
                  <CopyValue label="bKash number" value={paymentSettings.bkash.number} />
                  <CopyValue label="Account type" value={paymentSettings.bkash.accountType} />
                  <p className="text-[11.5px] leading-relaxed text-slate-muted">
                    Use the &quot;Send Money&quot; option and keep the transaction ID
                    from your confirmation SMS.
                  </p>
                </TabsContent>
                <TabsContent value="nagad" className="mt-4 space-y-2.5">
                  <CopyValue label="Nagad number" value={paymentSettings.nagad.number} />
                  <CopyValue label="Account type" value={paymentSettings.nagad.accountType} />
                  <p className="text-[11.5px] leading-relaxed text-slate-muted">
                    Send money to the number above and keep the transaction ID from
                    your confirmation SMS.
                  </p>
                </TabsContent>
                <TabsContent value="bank-transfer" className="mt-4 space-y-2.5">
                  <CopyValue label="Bank" value={paymentSettings.bank.bankName} />
                  <CopyValue label="Account name" value={paymentSettings.bank.accountName} />
                  <CopyValue label="Account number" value={paymentSettings.bank.accountNumber} />
                  <CopyValue label="Branch" value={paymentSettings.bank.branch} />
                  <CopyValue label="Routing number" value={paymentSettings.bank.routingNumber} />
                  <p className="text-[11.5px] leading-relaxed text-slate-muted">
                    Use your name and the student&apos;s name as the transfer
                    reference, then keep the bank slip or confirmation.
                  </p>
                </TabsContent>
              </Tabs>

              <div className="mt-5 rounded-xl border border-border bg-surface p-4">
                <p className="text-[12px] font-semibold text-navy">Payment instructions</p>
                <ol className="mt-2 space-y-1.5 text-[11.5px] leading-relaxed text-slate-muted">
                  {paymentSettings.instructions.map((instruction, index) => (
                    <li key={instruction} className="flex gap-2">
                      <span className="font-bold text-brand">{index + 1}.</span>
                      {instruction}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-xl font-bold text-navy">Submit your payment details</h2>
              <p className="mt-1.5 text-[13px] text-slate-muted">
                Our finance team uses these details to verify your transfer.
              </p>

              <form onSubmit={onSubmit} className="mt-5 space-y-4" noValidate>
                <div>
                  <p className="mb-2 text-[12px] font-semibold text-ink">Payment method</p>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {methods.map((method) => (
                      <button
                        key={method.value}
                        type="button"
                        onClick={() => form.setValue("method", method.value, { shouldValidate: true })}
                        className={cn(
                          "flex items-center gap-2 rounded-lg border px-3 py-2.5 text-[12.5px] font-semibold transition-colors",
                          selectedMethod === method.value
                            ? "border-brand bg-brand-soft text-brand-dark"
                            : "border-border bg-white text-ink hover:border-brand/30",
                        )}
                        aria-pressed={selectedMethod === method.value}
                      >
                        <method.icon className="size-4" />
                        {method.label}
                      </button>
                    ))}
                  </div>
                  {form.formState.errors.method && (
                    <p className="mt-1 text-[11px] text-red-600">{form.formState.errors.method.message}</p>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="transactionId" className="mb-1.5 block text-[12px] font-semibold text-ink">
                      Transaction ID <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="transactionId"
                      placeholder="e.g. TRX-9F2K71"
                      aria-invalid={Boolean(form.formState.errors.transactionId)}
                      {...form.register("transactionId")}
                    />
                    {form.formState.errors.transactionId && (
                      <p className="mt-1 text-[11px] text-red-600">
                        {form.formState.errors.transactionId.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="senderReference" className="mb-1.5 block text-[12px] font-semibold text-ink">
                      Sender number / account reference <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="senderReference"
                      placeholder="e.g. 01700-000201"
                      aria-invalid={Boolean(form.formState.errors.senderReference)}
                      {...form.register("senderReference")}
                    />
                    {form.formState.errors.senderReference && (
                      <p className="mt-1 text-[11px] text-red-600">
                        {form.formState.errors.senderReference.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="amount" className="mb-1.5 block text-[12px] font-semibold text-ink">
                      Amount (BDT) <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="amount"
                      type="number"
                      min={100}
                      step={100}
                      readOnly={type !== "one-time"}
                      className={type !== "one-time" ? "bg-muted/60" : undefined}
                      aria-invalid={Boolean(form.formState.errors.amount)}
                      {...form.register("amount", { valueAsNumber: true })}
                    />
                    {form.formState.errors.amount && (
                      <p className="mt-1 text-[11px] text-red-600">
                        {form.formState.errors.amount.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="paymentDate" className="mb-1.5 block text-[12px] font-semibold text-ink">
                      Payment date <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="paymentDate"
                      type="date"
                      max={today}
                      aria-invalid={Boolean(form.formState.errors.paymentDate)}
                      {...form.register("paymentDate")}
                    />
                    {form.formState.errors.paymentDate && (
                      <p className="mt-1 text-[11px] text-red-600">
                        {form.formState.errors.paymentDate.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="mb-1.5 block text-[12px] font-semibold text-ink">
                    Optional message to the CEBBD team
                  </label>
                  <Textarea
                    id="message"
                    rows={3}
                    maxLength={500}
                    placeholder="Anything our team should know about this payment…"
                    {...form.register("message")}
                  />
                  {form.formState.errors.message && (
                    <p className="mt-1 text-[11px] text-red-600">
                      {form.formState.errors.message.message}
                    </p>
                  )}
                </div>

                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-[11.5px] leading-relaxed text-amber-800">
                  <AlertCircle className="mr-1.5 inline size-3.5" />
                  Do not submit the same transaction ID twice. Duplicate transaction
                  IDs are rejected during verification.
                </div>

                <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <BadgeCheck className="size-4" />
                  )}
                  {form.formState.isSubmitting
                    ? "Submitting…"
                    : "Submit for verification"}
                </Button>
              </form>
            </div>
          )}
        </div>

        {step < 4 && (
          <div className="mt-8 flex items-center justify-between gap-3 border-t border-border pt-5">
            <Button
              type="button"
              variant="ghost"
              onClick={() => goToStep(Math.max(1, step - 1))}
              disabled={step === 1}
            >
              <ArrowLeft className="size-4" />
              Back
            </Button>
            <Button type="button" onClick={handleContinue}>
              Continue
              <ArrowRight className="size-4" />
            </Button>
          </div>
        )}

        {step === 4 && (
          <div className="mt-5 border-t border-border pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => goToStep(3)}
              className="text-slate-muted"
            >
              <ArrowLeft className="size-4" />
              Back to payment instructions
            </Button>
          </div>
        )}
      </div>

      <aside className="space-y-4 lg:sticky lg:top-24">
        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-muted">
            Supporting
          </p>
          <div className="mt-3 flex items-center gap-3">
            <StudentAvatar name={student.fullName} size="md" />
            <div className="min-w-0">
              <p className="truncate text-[14px] font-bold text-navy">{student.fullName}</p>
              <p className="truncate text-[11px] text-slate-muted">{student.institution}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-[11px] text-slate-muted">
              <span>{formatBDT(funding.raised)} raised</span>
              <span>{funding.percent}%</span>
            </div>
            <FundingProgress percent={funding.percent} className="mt-2" />
            <p className="mt-2 text-[10.5px] text-slate-muted">
              {formatBDT(funding.remaining)} still needed
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-muted">
            Your support
          </p>
          <dl className="mt-3 space-y-2.5 text-[12.5px]">
            <div className="flex justify-between gap-3">
              <dt className="text-slate-muted">Type</dt>
              <dd className="font-semibold text-ink">{donationTypeLabels[type]}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-muted">Amount</dt>
              <dd className="font-bold text-brand-dark">{formatBDT(amount)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-muted">Status</dt>
              <dd><StatusPill tone="warning">Pending verification</StatusPill></dd>
            </div>
          </dl>
        </div>

        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <h3 className="flex items-center gap-2 text-[12.5px] font-bold text-navy">
            <ShieldCheck className="size-4 text-brand" />
            Verified process
          </h3>
          <ul className="mt-2.5 space-y-2 text-[11px] leading-relaxed text-slate-muted">
            <li>• Manual payments only — no card or gateway is charged.</li>
            <li>• Our finance team verifies every transaction.</li>
            <li>• Approved funds are paid to the institution.</li>
            <li>• You can track the status in your dashboard.</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
