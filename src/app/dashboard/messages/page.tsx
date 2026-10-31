import type { Metadata } from "next";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { MessagingWorkspace } from "@/components/messaging/messaging-workspace";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Messages",
  description: "Conversations with the CEBBD support team.",
};

export default function DashboardMessagesPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Messages"
        description="Ask questions about a student or a donation. The CEBBD team replies on behalf of students within one business day."
        action={
          <Button asChild variant="outline">
            <Link href="/students">
              <MessageSquare className="size-4" />
              Message a student
            </Link>
          </Button>
        }
      />
      <MessagingWorkspace role="donor" />
    </div>
  );
}
