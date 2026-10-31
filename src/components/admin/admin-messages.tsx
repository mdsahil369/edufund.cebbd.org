import { MessagingWorkspace } from "@/components/messaging/messaging-workspace";
import { PageHeader } from "@/components/shared/page-header";

export function AdminMessages() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Messages"
        description="Reply to donors on behalf of students. Conversations are private between the donor and the CEBBD team."
      />
      <MessagingWorkspace role="admin" />
    </div>
  );
}
