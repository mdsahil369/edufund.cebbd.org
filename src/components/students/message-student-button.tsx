"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useDemoData } from "@/lib/store/demo-store";

interface MessageStudentButtonProps {
  studentId: string;
  studentName: string;
  variant?: "default" | "outline" | "soft";
  className?: string;
}

export function MessageStudentButton({
  studentId,
  studentName,
  variant = "outline",
  className,
}: MessageStudentButtonProps) {
  const { session, hydrated, startConversation, conversations } = useDemoData();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  const existing = conversations.find(
    (conversation) =>
      conversation.donorId === session?.donorId &&
      conversation.studentId === studentId,
  );

  if (!hydrated) {
    return (
      <Button variant={variant} className={className} disabled>
        <MessageSquare className="size-4" />
        Send Message
      </Button>
    );
  }

  if (!session || session.role !== "donor") {
    return (
      <Button asChild variant={variant} className={className}>
        <Link href="/login">
          <MessageSquare className="size-4" />
          Send Message
        </Link>
      </Button>
    );
  }

  const handleSend = async () => {
    if (body.trim().length < 10) {
      toast.error("Please write at least 10 characters so our team can help.");
      return;
    }
    setSending(true);
    try {
      await startConversation(studentId, body);
      toast.success(
        `Your message about ${studentName} has been sent to the CEBBD team.`,
      );
      setOpen(false);
      setBody("");
      router.push("/dashboard/messages");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not send your message.",
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Button
        variant={variant}
        className={className}
        onClick={() => setOpen(true)}
      >
        <MessageSquare className="size-4" />
        {existing ? "Continue Conversation" : "Send Message"}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Message about {studentName}</DialogTitle>
            <DialogDescription>
              Your message goes to the CEBBD team, who reply on behalf of the
              student. Please do not include sensitive personal information.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <label
              htmlFor="student-message"
              className="mb-2 block text-[13px] font-semibold text-ink"
            >
              Your message
            </label>
            <Textarea
              id="student-message"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder={`Assalamu alaikum, I would like to know more about ${studentName.split(" ")[0]}'s education costs…`}
              rows={5}
              maxLength={800}
            />
            <p className="mt-1.5 text-right text-[11px] text-slate-muted">
              {body.length}/800
            </p>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSend} disabled={sending}>
              {sending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
              {sending ? "Sending…" : "Send message"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
