import {
  conversations,
  messages,
  messagesForConversation,
} from "@/lib/mock-data/conversations";
import type { Conversation, Message } from "@/types";

export async function getConversationsForDonor(
  donorId: string,
): Promise<Conversation[]> {
  return conversations
    .filter((conversation) => conversation.donorId === donorId)
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
}

export async function getAdminInbox(): Promise<Conversation[]> {
  return [...conversations].sort(
    (a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export async function getConversationMessages(
  conversationId: string,
): Promise<Message[]> {
  return messagesForConversation(conversationId);
}

export async function getUnreadCountForDonor(donorId: string): Promise<number> {
  return conversations
    .filter((conversation) => conversation.donorId === donorId)
    .reduce((total, conversation) => total + conversation.unreadForDonor, 0);
}

export async function getUnreadCountForAdmin(): Promise<number> {
  return conversations.reduce(
    (total, conversation) => total + conversation.unreadForAdmin,
    0,
  );
}

export function getConversationMessagesSync(conversationId: string): Message[] {
  return messages
    .filter((message) => message.conversationId === conversationId)
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
}
