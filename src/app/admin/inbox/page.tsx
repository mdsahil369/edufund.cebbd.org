import type { Metadata } from "next";
import { AdminContactInbox } from "@/components/admin/admin-contact-inbox";
import { listContactMessagesAction } from "./actions";

export const metadata: Metadata = {
  title: "Contact inbox",
  description: "Read messages sent through the public contact form.",
};

export default async function AdminInboxPage() {
  const messages = await listContactMessagesAction();
  return <AdminContactInbox messages={messages} />;
}
