"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import type {
  CampaignStatus,
  Conversation,
  Donation,
  DonationInput,
  Donor,
  FundingSummary,
  Message,
  PaymentSettings,
  Session,
  SiteSettings,
  Student,
  StudentSupportPlans,
} from "@/types";
import { students as initialStudents } from "@/lib/mock-data/students";
import { donors as initialDonors } from "@/lib/mock-data/donors";
import { donations as initialDonations } from "@/lib/mock-data/donations";
import {
  conversations as initialConversations,
  messages as initialMessages,
} from "@/lib/mock-data/conversations";
import {
  paymentSettings as initialPaymentSettings,
  siteSettings as initialSiteSettings,
} from "@/lib/mock-data/settings";
import { getFunding, generateId } from "@/lib/utils";

const STORAGE_KEY = "edufund-demo-v2";
const DEMO_DONOR_ID = "donor-01";
const ADMIN_EMAIL = "admin@edufund.demo";

interface DemoDataState {
  session: Session | null;
  students: Student[];
  donors: Donor[];
  donations: Donation[];
  conversations: Conversation[];
  messages: Message[];
  paymentSettings: PaymentSettings;
  siteSettings: SiteSettings;
}

function createInitialState(): DemoDataState {
  return {
    session: null,
    students: initialStudents,
    donors: initialDonors,
    donations: initialDonations,
    conversations: initialConversations,
    messages: initialMessages,
    paymentSettings: initialPaymentSettings,
    siteSettings: initialSiteSettings,
  };
}

interface RegisterInput {
  fullName: string;
  email: string;
  phone?: string;
}

interface DemoContextValue extends DemoDataState {
  hydrated: boolean;
  unreadDonorCount: number;
  unreadAdminCount: number;
  login: (
    email: string,
    password: string,
  ) => Promise<{ ok: boolean; role?: "donor" | "admin"; error?: string }>;
  register: (
    input: RegisterInput,
  ) => Promise<{ ok: boolean; role?: "donor"; error?: string }>;
  logout: () => void;
  submitDonation: (input: DonationInput) => Promise<Donation>;
  approveDonation: (id: string) => void;
  rejectDonation: (id: string, note: string) => void;
  startConversation: (
    studentId: string,
    body: string,
    subject?: string,
  ) => Promise<string>;
  sendDonorMessage: (conversationId: string, body: string) => void;
  sendAdminReply: (conversationId: string, body: string) => void;
  markConversationRead: (conversationId: string, role: "donor" | "admin") => void;
  updateDonorProfile: (
    patch: Partial<Pick<Donor, "fullName" | "email" | "phone" | "address" | "bio" | "avatarUrl">>,
  ) => void;
  setShowNamePublicly: (value: boolean) => void;
  addStudent: (student: Student) => void;
  updateStudent: (id: string, patch: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  toggleStudentVisibility: (id: string) => void;
  updateCampaignStatus: (id: string, status: CampaignStatus) => void;
  updateSupportPlans: (studentId: string, plans: StudentSupportPlans) => void;
  updatePaymentSettings: (settings: PaymentSettings) => void;
  updateSiteSettings: (settings: SiteSettings) => void;
  resetDemoData: () => void;
  fundingFor: (studentId: string) => FundingSummary;
}

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoDataState>(createInitialState);
  const [hydrated, setHydrated] = useState(false);

  // Restore the demo session/data from localStorage after mount so the server
  // and first client render always match.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as {
          version?: number;
          data?: Partial<DemoDataState>;
        };
        const data = parsed.data;
        if (parsed.version === 2 && data) {
          setState((previous) => ({
            ...previous,
            ...data,
            session: data.session ?? null,
          }));
        }
      }
    } catch {
      // Corrupt demo storage should never break the prototype.
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ version: 2, data: state }),
      );
    } catch {
      // Storage may be unavailable (private mode); the demo still works.
    }
  }, [state, hydrated]);

  const login = useCallback(
    async (email: string, password: string) => {
      await new Promise((resolve) => setTimeout(resolve, 550));
      const normalized = email.trim().toLowerCase();

      if (normalized === ADMIN_EMAIL) {
        setState((previous) => ({
          ...previous,
          session: {
            role: "admin",
            name: "CEBBD Admin",
            email: ADMIN_EMAIL,
          },
        }));
        return { ok: true as const, role: "admin" as const };
      }

      if (!password) {
        return { ok: false as const, error: "Please enter your password." };
      }

      const donor =
        state.donors.find(
          (item) => item.email.toLowerCase() === normalized,
        ) ?? state.donors.find((item) => item.id === DEMO_DONOR_ID);

      if (!donor) {
        return { ok: false as const, error: "No donor account found." };
      }

      setState((previous) => ({
        ...previous,
        session: {
          role: "donor",
          donorId: donor.id,
          name: donor.fullName,
          email: donor.email,
        },
      }));
      return { ok: true as const, role: "donor" as const };
    },
    [state.donors],
  );

  const register = useCallback(async (input: RegisterInput) => {
    await new Promise((resolve) => setTimeout(resolve, 650));
    const existing = state.donors.find(
      (donor) => donor.email.toLowerCase() === input.email.trim().toLowerCase(),
    );
    if (existing) {
      return {
        ok: false as const,
        error: "An account with this email already exists. Try signing in.",
      };
    }

    const donor: Donor = {
      id: generateId("donor"),
      fullName: input.fullName.trim(),
      email: input.email.trim().toLowerCase(),
      phone: input.phone?.trim() || undefined,
      joinedAt: new Date().toISOString(),
      status: "active",
      showNamePublicly: false,
    };

    setState((previous) => ({
      ...previous,
      donors: [donor, ...previous.donors],
      session: {
        role: "donor",
        donorId: donor.id,
        name: donor.fullName,
        email: donor.email,
      },
    }));

    return { ok: true as const, role: "donor" as const };
  }, [state.donors]);

  const logout = useCallback(() => {
    setState((previous) => ({ ...previous, session: null }));
    toast.success("You have been signed out.");
  }, []);

  const submitDonation = useCallback(
    async (input: DonationInput) => {
      await new Promise((resolve) => setTimeout(resolve, 700));

      const duplicate = state.donations.some(
        (donation) =>
          donation.transactionId.trim().toLowerCase() ===
          input.transactionId.trim().toLowerCase(),
      );
      if (duplicate) {
        throw new Error(
          "This transaction ID has already been submitted. Please check your payment receipt and try again.",
        );
      }

      const donation: Donation = {
        id: generateId("don"),
        receiptNumber: `EF-2026-${Math.floor(3000 + Math.random() * 6900)}`,
        donorId: input.donorId,
        studentId: input.studentId,
        type: input.type,
        amount: input.amount,
        method: input.method,
        transactionId: input.transactionId.trim(),
        senderReference: input.senderReference.trim(),
        paymentDate: input.paymentDate,
        message: input.message?.trim() || undefined,
        status: "pending",
        submittedAt: new Date().toISOString(),
      };

      setState((previous) => ({
        ...previous,
        donations: [donation, ...previous.donations],
      }));

      return donation;
    },
    [state.donations],
  );

  const approveDonation = useCallback((id: string) => {
    setState((previous) => ({
      ...previous,
      donations: previous.donations.map((donation) =>
        donation.id === id
          ? {
              ...donation,
              status: "approved",
              reviewedAt: new Date().toISOString(),
              reviewNote: undefined,
            }
          : donation,
      ),
    }));
  }, []);

  const rejectDonation = useCallback((id: string, note: string) => {
    setState((previous) => ({
      ...previous,
      donations: previous.donations.map((donation) =>
        donation.id === id
          ? {
              ...donation,
              status: "rejected",
              reviewedAt: new Date().toISOString(),
              reviewNote: note.trim() || "Payment could not be verified.",
            }
          : donation,
      ),
    }));
  }, []);

  const startConversation = useCallback(
    async (studentId: string, body: string, subject?: string) => {
      await new Promise((resolve) => setTimeout(resolve, 450));
      const donorId = state.session?.donorId;
      if (!donorId) throw new Error("Please sign in to send a message.");

      const student = state.students.find((item) => item.id === studentId);
      if (!student) throw new Error("Student not found.");

      const existing = state.conversations.find(
        (conversation) =>
          conversation.donorId === donorId &&
          conversation.studentId === studentId,
      );

      const now = new Date().toISOString();
      const message: Message = {
        id: generateId("msg"),
        conversationId: existing?.id ?? generateId("conv"),
        authorRole: "donor",
        authorName: state.session?.name ?? "Supporter",
        body: body.trim(),
        createdAt: now,
        readByDonor: true,
        readByAdmin: false,
      };

      if (existing) {
        setState((previous) => ({
          ...previous,
          conversations: previous.conversations.map((conversation) =>
            conversation.id === existing.id
              ? {
                  ...conversation,
                  updatedAt: now,
                  unreadForAdmin: conversation.unreadForAdmin + 1,
                  status: "open",
                }
              : conversation,
          ),
          messages: [...previous.messages, message],
        }));
        return existing.id;
      }

      const conversation: Conversation = {
        id: message.conversationId,
        donorId,
        studentId,
        subject: subject?.trim() || `Conversation about ${student.fullName}`,
        createdAt: now,
        updatedAt: now,
        unreadForDonor: 0,
        unreadForAdmin: 1,
        status: "open",
      };

      setState((previous) => ({
        ...previous,
        conversations: [conversation, ...previous.conversations],
        messages: [...previous.messages, message],
      }));

      return conversation.id;
    },
    [state.session, state.students, state.conversations],
  );

  const sendDonorMessage = useCallback(
    (conversationId: string, body: string) => {
      const donorId = state.session?.donorId;
      if (!donorId) return;
      const now = new Date().toISOString();
      const message: Message = {
        id: generateId("msg"),
        conversationId,
        authorRole: "donor",
        authorName: state.session?.name ?? "Supporter",
        body: body.trim(),
        createdAt: now,
        readByDonor: true,
        readByAdmin: false,
      };
      setState((previous) => ({
        ...previous,
        conversations: previous.conversations.map((conversation) =>
          conversation.id === conversationId
            ? {
                ...conversation,
                updatedAt: now,
                unreadForAdmin: conversation.unreadForAdmin + 1,
                status: "open",
              }
            : conversation,
        ),
        messages: [...previous.messages, message],
      }));
    },
    [state.session],
  );

  const sendAdminReply = useCallback((conversationId: string, body: string) => {
    const now = new Date().toISOString();
    const message: Message = {
      id: generateId("msg"),
      conversationId,
      authorRole: "admin",
      authorName: "CEBBD Support Team",
      body: body.trim(),
      createdAt: now,
      readByDonor: false,
      readByAdmin: true,
    };
    setState((previous) => ({
      ...previous,
      conversations: previous.conversations.map((conversation) =>
        conversation.id === conversationId
          ? {
              ...conversation,
              updatedAt: now,
              unreadForDonor: conversation.unreadForDonor + 1,
              status: "open",
            }
          : conversation,
      ),
      messages: [...previous.messages, message],
    }));
  }, []);

  const markConversationRead = useCallback(
    (conversationId: string, role: "donor" | "admin") => {
      setState((previous) => ({
        ...previous,
        conversations: previous.conversations.map((conversation) =>
          conversation.id === conversationId
            ? {
                ...conversation,
                unreadForDonor:
                  role === "donor" ? 0 : conversation.unreadForDonor,
                unreadForAdmin:
                  role === "admin" ? 0 : conversation.unreadForAdmin,
              }
            : conversation,
        ),
        messages: previous.messages.map((message) =>
          message.conversationId === conversationId
            ? {
                ...message,
                readByDonor: role === "donor" ? true : message.readByDonor,
                readByAdmin: role === "admin" ? true : message.readByAdmin,
              }
            : message,
        ),
      }));
    },
    [],
  );

  const updateDonorProfile = useCallback(
    (
      patch: Partial<
        Pick<
          Donor,
          "fullName" | "email" | "phone" | "address" | "bio" | "avatarUrl"
        >
      >,
    ) => {
      const donorId = state.session?.donorId;
      if (!donorId) return;
      setState((previous) => ({
        ...previous,
        donors: previous.donors.map((donor) =>
          donor.id === donorId ? { ...donor, ...patch } : donor,
        ),
        session: previous.session
          ? {
              ...previous.session,
              name: patch.fullName ?? previous.session.name,
              email: patch.email ?? previous.session.email,
            }
          : previous.session,
      }));
    },
    [state.session],
  );

  const setShowNamePublicly = useCallback(
    (value: boolean) => {
      const donorId = state.session?.donorId;
      if (!donorId) return;
      setState((previous) => ({
        ...previous,
        donors: previous.donors.map((donor) =>
          donor.id === donorId
            ? { ...donor, showNamePublicly: value }
            : donor,
        ),
      }));
    },
    [state.session],
  );

  const addStudent = useCallback((student: Student) => {
    setState((previous) => ({
      ...previous,
      students: [student, ...previous.students],
    }));
  }, []);

  const updateStudent = useCallback((id: string, patch: Partial<Student>) => {
    setState((previous) => ({
      ...previous,
      students: previous.students.map((student) =>
        student.id === id ? { ...student, ...patch } : student,
      ),
    }));
  }, []);

  const deleteStudent = useCallback((id: string) => {
    setState((previous) => ({
      ...previous,
      students: previous.students.filter((student) => student.id !== id),
      donations: previous.donations.filter(
        (donation) => donation.studentId !== id,
      ),
      conversations: previous.conversations.filter(
        (conversation) => conversation.studentId !== id,
      ),
    }));
  }, []);

  const toggleStudentVisibility = useCallback((id: string) => {
    setState((previous) => ({
      ...previous,
      students: previous.students.map((student) =>
        student.id === id
          ? {
              ...student,
              visibility:
                student.visibility === "published" ? "unpublished" : "published",
            }
          : student,
      ),
    }));
  }, []);

  const updateCampaignStatus = useCallback(
    (id: string, status: CampaignStatus) => {
      setState((previous) => ({
        ...previous,
        students: previous.students.map((student) =>
          student.id === id ? { ...student, campaignStatus: status } : student,
        ),
      }));
    },
    [],
  );

  const updateSupportPlans = useCallback(
    (studentId: string, plans: StudentSupportPlans) => {
      setState((previous) => ({
        ...previous,
        students: previous.students.map((student) =>
          student.id === studentId
            ? { ...student, supportPlans: plans }
            : student,
        ),
      }));
    },
    [],
  );

  const updatePaymentSettings = useCallback((settings: PaymentSettings) => {
    setState((previous) => ({
      ...previous,
      paymentSettings: { ...settings, updatedAt: new Date().toISOString() },
    }));
  }, []);

  const updateSiteSettings = useCallback((settings: SiteSettings) => {
    setState((previous) => ({ ...previous, siteSettings: settings }));
  }, []);

  const resetDemoData = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setState(createInitialState());
    toast.success("Demo data has been reset.");
  }, []);

  const fundingFor = useCallback(
    (studentId: string): FundingSummary => {
      const student = state.students.find((item) => item.id === studentId);
      if (!student) {
        return {
          required: 0,
          raised: 0,
          remaining: 0,
          percent: 0,
          approvedDonationCount: 0,
          supporterCount: 0,
        };
      }
      return getFunding(student, state.donations);
    },
    [state.students, state.donations],
  );

  const unreadDonorCount = useMemo(() => {
    const donorId = state.session?.donorId;
    if (!donorId) return 0;
    return state.conversations
      .filter((conversation) => conversation.donorId === donorId)
      .reduce((total, conversation) => total + conversation.unreadForDonor, 0);
  }, [state.conversations, state.session]);

  const unreadAdminCount = useMemo(
    () =>
      state.conversations.reduce(
        (total, conversation) => total + conversation.unreadForAdmin,
        0,
      ),
    [state.conversations],
  );

  const value = useMemo<DemoContextValue>(
    () => ({
      ...state,
      hydrated,
      unreadDonorCount,
      unreadAdminCount,
      login,
      register,
      logout,
      submitDonation,
      approveDonation,
      rejectDonation,
      startConversation,
      sendDonorMessage,
      sendAdminReply,
      markConversationRead,
      updateDonorProfile,
      setShowNamePublicly,
      addStudent,
      updateStudent,
      deleteStudent,
      toggleStudentVisibility,
      updateCampaignStatus,
      updateSupportPlans,
      updatePaymentSettings,
      updateSiteSettings,
      resetDemoData,
      fundingFor,
    }),
    [
      state,
      hydrated,
      unreadDonorCount,
      unreadAdminCount,
      login,
      register,
      logout,
      submitDonation,
      approveDonation,
      rejectDonation,
      startConversation,
      sendDonorMessage,
      sendAdminReply,
      markConversationRead,
      updateDonorProfile,
      setShowNamePublicly,
      addStudent,
      updateStudent,
      deleteStudent,
      toggleStudentVisibility,
      updateCampaignStatus,
      updateSupportPlans,
      updatePaymentSettings,
      updateSiteSettings,
      resetDemoData,
      fundingFor,
    ],
  );

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemoData() {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error("useDemoData must be used inside a DemoProvider");
  }
  return context;
}
