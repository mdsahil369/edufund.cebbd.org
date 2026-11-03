"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Mail,
  MessageSquare,
  Send,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Enter your name."),
  email: z
    .string()
    .trim()
    .min(1, "Enter your email address.")
    .email("Enter a valid email address."),
  subject: z.enum(["general", "donation", "student", "partnership", "media"]),
  message: z
    .string()
    .trim()
    .min(20, "Please write at least 20 characters.")
    .max(1200, "Keep your message under 1,200 characters."),
});

type ContactValues = z.infer<typeof contactSchema>;

const subjects = [
  { value: "general", label: "General enquiry" },
  { value: "donation", label: "Donation or payment" },
  { value: "student", label: "Student support" },
  { value: "partnership", label: "Partnership" },
  { value: "media", label: "Media & press" },
];

export function ContactForm() {
  const [sent, setSent] = useState<ContactValues | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "general",
      message: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    await new Promise((resolve) => setTimeout(resolve, 700));
    setSent(values);
    toast.success("Your message has been recorded.");
    reset();
  });

  if (sent) {
    return (
      <div className="rounded-2xl border border-border bg-white p-6 text-center shadow-sm sm:p-8">
        <span className="mx-auto inline-flex size-14 items-center justify-center rounded-2xl bg-brand-light text-brand-dark">
          <CheckCircle2 className="size-7" />
        </span>
        <h2 className="mt-4 text-xl font-extrabold text-navy">
          Thank you, {sent.name.split(" ")[0]}.
        </h2>
        <p className="mx-auto mt-2 max-w-md text-[13px] leading-relaxed text-slate-muted">
          Your message has been recorded for the CEBBD team. For urgent matters,
          please email or call us directly using the contact details on this
          page.
        </p>
        <div className="mx-auto mt-4 max-w-md rounded-lg bg-surface px-3 py-2.5 text-left text-[11px] text-slate-muted">
          <p className="font-semibold text-ink">Reference</p>
          <p className="mt-0.5">
            {sent.subject} · {sent.email}
          </p>
        </div>
        <Button
          variant="outline"
          className="mt-5"
          onClick={() => setSent(null)}
        >
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-7">
      <div className="flex items-start gap-3">
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-light text-brand-dark">
          <MessageSquare className="size-5" />
        </span>
        <div>
          <h2 className="text-[16px] font-bold text-navy">Send us a message</h2>
          <p className="mt-0.5 text-[11.5px] text-slate-muted">
            We usually reply within one business day.
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="mt-5 space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="mb-1.5 block text-[12px] font-semibold text-ink">
              Your name
            </label>
            <div className="relative">
              <User
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-muted"
                aria-hidden="true"
              />
              <Input
                id="name"
                className="pl-9"
                placeholder="Full name"
                aria-invalid={Boolean(errors.name)}
                {...register("name")}
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-[11px] text-red-600">{errors.name.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="contact-email" className="mb-1.5 block text-[12px] font-semibold text-ink">
              Email address
            </label>
            <div className="relative">
              <Mail
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-muted"
                aria-hidden="true"
              />
              <Input
                id="contact-email"
                type="email"
                className="pl-9"
                placeholder="you@example.com"
                aria-invalid={Boolean(errors.email)}
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-[11px] text-red-600">{errors.email.message}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="subject" className="mb-1.5 block text-[12px] font-semibold text-ink">
            What is this about?
          </label>
          <Controller
            control={control}
            name="subject"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="subject" className="w-full">
                  <SelectValue placeholder="Choose a topic" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.value} value={subject.value}>
                      {subject.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div>
          <label htmlFor="message" className="mb-1.5 block text-[12px] font-semibold text-ink">
            Message
          </label>
          <Textarea
            id="message"
            rows={5}
            placeholder="Tell us how we can help. Please do not include student phone numbers or private addresses."
            aria-invalid={Boolean(errors.message)}
            {...register("message")}
          />
          {errors.message && (
            <p className="mt-1 text-[11px] text-red-600">{errors.message.message}</p>
          )}
        </div>

        <div className="flex items-start gap-2 rounded-lg bg-surface px-3 py-2.5 text-[10.5px] leading-relaxed text-slate-muted">
          <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
          For urgent payment verification, include your receipt number. Never send
          full bank account numbers or passwords.
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
          {isSubmitting ? "Sending…" : "Send message"}
        </Button>
      </form>
    </div>
  );
}
