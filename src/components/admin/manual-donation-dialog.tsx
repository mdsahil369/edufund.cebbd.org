"use client";

import { useState } from "react";
import { HandCoins, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDemoData } from "@/lib/store/demo-store";
import type { DonationType, PaymentMethodId } from "@/types";
import { donationTypeLabels, paymentMethodLabels } from "@/lib/utils";
import { MIN_ONE_TIME_BDT } from "@/lib/currency";

const donationTypes: DonationType[] = [
  "one-time",
  "monthly",
  "yearly",
  "full-scholarship",
];
const methods: PaymentMethodId[] = [
  "bkash",
  "bank-transfer",
  "card",
  "nagad",
];

/**
 * Lets an admin record a donation the team received personally. Approved rows
 * immediately count toward the student's campaign.
 */
export function ManualDonationDialog() {
  const { donors, students, addManualDonation } = useDemoData();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [donorId, setDonorId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [type, setType] = useState<DonationType>("one-time");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethodId>("bkash");
  const [transactionId, setTransactionId] = useState("");
  const [senderReference, setSenderReference] = useState("");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"approved" | "pending">("approved");

  const reset = () => {
    setDonorId("");
    setStudentId("");
    setType("one-time");
    setAmount("");
    setMethod("bkash");
    setTransactionId("");
    setSenderReference("");
    setPaymentDate(new Date().toISOString().slice(0, 10));
    setMessage("");
    setStatus("approved");
  };

  const submit = async () => {
    const parsedAmount = Number(amount);
    if (!donorId) {
      toast.error("Choose the donor this payment belongs to.");
      return;
    }
    if (!studentId) {
      toast.error("Choose the student this donation supports.");
      return;
    }
    if (!Number.isFinite(parsedAmount) || parsedAmount < MIN_ONE_TIME_BDT) {
      toast.error("Enter an amount of at least ৳1,000.");
      return;
    }

    setSaving(true);
    const result = await addManualDonation({
      donorId,
      studentId,
      type,
      amount: parsedAmount,
      method,
      transactionId: transactionId.trim() || undefined,
      senderReference: senderReference.trim() || undefined,
      paymentDate,
      message: message.trim() || undefined,
      status,
    });
    setSaving(false);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    toast.success(
      status === "approved"
        ? "Donation added and counted toward the campaign."
        : "Donation added as pending review.",
    );
    reset();
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Add manual donation
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HandCoins className="size-4 text-brand" />
            Record a donation received personally
          </DialogTitle>
          <DialogDescription>
            Use this when someone paid by bKash, bank, or an international
            transfer outside the website. Amounts are stored in BDT.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="manual-donor">Donor</Label>
              <Select value={donorId} onValueChange={setDonorId}>
                <SelectTrigger id="manual-donor" className="mt-1.5">
                  <SelectValue placeholder="Choose donor" />
                </SelectTrigger>
                <SelectContent>
                  {donors.map((donor) => (
                    <SelectItem key={donor.id} value={donor.id}>
                      {donor.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="manual-student">Student</Label>
              <Select value={studentId} onValueChange={setStudentId}>
                <SelectTrigger id="manual-student" className="mt-1.5">
                  <SelectValue placeholder="Choose student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="manual-type">Support type</Label>
              <Select
                value={type}
                onValueChange={(value) => setType(value as DonationType)}
              >
                <SelectTrigger id="manual-type" className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {donationTypes.map((item) => (
                    <SelectItem key={item} value={item}>
                      {donationTypeLabels[item]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="manual-method">Payment method</Label>
              <Select
                value={method}
                onValueChange={(value) => setMethod(value as PaymentMethodId)}
              >
                <SelectTrigger id="manual-method" className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {methods.map((item) => (
                    <SelectItem key={item} value={item}>
                      {paymentMethodLabels[item]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="manual-amount">Amount (BDT)</Label>
              <Input
                id="manual-amount"
                type="number"
                min={MIN_ONE_TIME_BDT}
                step={100}
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className="mt-1.5"
                placeholder="e.g. 2100"
              />
            </div>
            <div>
              <Label htmlFor="manual-date">Payment date</Label>
              <Input
                id="manual-date"
                type="date"
                value={paymentDate}
                max={new Date().toISOString().slice(0, 10)}
                onChange={(event) => setPaymentDate(event.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="manual-txn">Transaction ID (optional)</Label>
              <Input
                id="manual-txn"
                value={transactionId}
                onChange={(event) => setTransactionId(event.target.value)}
                className="mt-1.5"
                placeholder="Generated if left blank"
              />
            </div>
            <div>
              <Label htmlFor="manual-ref">Reference / sender (optional)</Label>
              <Input
                id="manual-ref"
                value={senderReference}
                onChange={(event) => setSenderReference(event.target.value)}
                className="mt-1.5"
                placeholder="e.g. Bank MT103 ref"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="manual-note">Internal note (optional)</Label>
            <Textarea
              id="manual-note"
              rows={2}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              className="mt-1.5"
              placeholder="Anything the finance team should know."
            />
          </div>

          <div>
            <Label htmlFor="manual-status">Status</Label>
            <Select
              value={status}
              onValueChange={(value) => setStatus(value as "approved" | "pending")}
            >
              <SelectTrigger id="manual-status" className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="approved">
                  Approved — count immediately
                </SelectItem>
                <SelectItem value="pending">Pending — review later</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <p className="rounded-lg bg-surface px-3 py-2 text-[10.5px] leading-relaxed text-slate-muted">
            Only add a donation after you have confirmed the money arrived in the
            CEBBD bKash or bank account.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={saving}>
            {saving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Plus className="size-4" />
            )}
            {saving ? "Adding…" : "Add donation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
