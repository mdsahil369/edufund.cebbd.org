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
import type { User } from "@supabase/supabase-js";
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
import { createClient } from "@/lib/supabase/client";
import {
  createStudentAction,
  deleteStudentAction,
  listStudentsAction,
  setStudentStatusAction,
  setStudentSupportPlansAction,
  setStudentVisibilityAction,
  updateStudentAction,
  type StudentActionResult,
} from "@/app/admin/students/actions";

const STORAGE_KEY = "edufund-demo-v2";

type AuthRole = "donor" | "admin";

function displayNameFor(user: User): string {
  const metadata = user.user_metadata ?? {};
  const fullName =
    typeof metadata.full_name === "string" ? metadata.full_name.trim() : "";
  if (fullName) return fullName;

  const name = typeof metadata.name === "string" ? metadata.name.trim() : "";
  if (name) return name;

  return user.email?.split("@")[0] ?? "Supporter";
}

function roleFor(user: User): AuthRole {
  return user.app_metadata?.role === "admin" ? "admin" : "donor";
}

function donorFromUser(user: User): Donor {
  const metadata = user.user_metadata ?? {};
  const phone =
    typeof metadata.phone === "string" && metadata.phone.trim()
      ? metadata.phone.trim()
      : undefined;

  return {
    id: user.id,
    fullName: displayNameFor(user),
    email: user.email ?? "",
    phone,
    joinedAt: user.created_at ?? new Date().toISOString(),
    status: "active",
    showNamePublicly: false,
  };
}

function authErrorMessage(message: string): string {
  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login credentials")) {
    return "Email or password is incorrect.";
  }
  if (normalized.includes("email not confirmed")) {
    return "Please confirm your email address before signing in. Check your inbox for the confirmation link.";
  }
  if (normalized.includes("user already registered")) {
    return "An account with this email already exists. Try signing in instead.";
  }
  if (normalized.includes("password should be at least")) {
    return "Use a password with at least 8 characters.";
  }
  if (normalized.includes("rate limit") || normalized.includes("too many")) {
    return "Too many attempts. Please wait a moment and try again.";
  }

  return message;
}

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
    // Students are loaded from Supabase once a user is signed in.
    students: [],
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
  password: string;
}

interface DemoContextValue extends DemoDataState {
  hydrated: boolean;
  unreadDonorCount: number;
  unreadAdminCount: number;
  login: (
    email: string,
    password: string,
  ) => Promise<{ ok: boolean; role?: AuthRole; error?: string }>;
  register: (input: RegisterInput) => Promise<{
    ok: boolean;
    role?: "donor";
    error?: string;
    needsEmailConfirmation?: boolean;
  }>;
  logout: () => Promise<void>;
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
  addStudent: (student: Student) => Promise<StudentActionResult>;
  updateStudent: (
    id: string,
    patch: Partial<Student>,
  ) => Promise<StudentActionResult>;
  deleteStudent: (id: string) => Promise<StudentActionResult>;
  toggleStudentVisibility: (id: string) => Promise<StudentActionResult>;
  updateCampaignStatus: (
    id: string,
    status: CampaignStatus,
  ) => Promise<StudentActionResult>;
  updateSupportPlans: (
    studentId: string,
    plans: StudentSupportPlans,
  ) => Promise<StudentActionResult>;
  updatePaymentSettings: (settings: PaymentSettings) => void;
  updateSiteSettings: (settings: SiteSettings) => void;
  resetDemoData: () => void;
  fundingFor: (studentId: string) => FundingSummary;
}

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoDataState>(createInitialState);
  const [hydrated, setHydrated] = useState(false);

  const loadStudents = useCallback(async () => {
    try {
      const list = await listStudentsAction();
      setState((previous) => ({ ...previous, students: list }));
    } catch {
      // Keep whatever is already loaded if the request fails.
    }
  }, []);

  const applyUser = useCallback((user: User | null) => {
    if (!user) {
      setState((previous) => ({ ...previous, session: null, students: [] }));
      return;
    }

    const role = roleFor(user);
    const name = displayNameFor(user);
    const email = user.email ?? "";

    setState((previous) => {
      let donors = previous.donors;

      if (role === "donor" && !donors.some((donor) => donor.id === user.id)) {
        donors = [donorFromUser(user), ...donors];
      }

      const session: Session = {
        role,
        donorId: role === "donor" ? user.id : undefined,
        name,
        email,
      };

      return { ...previous, donors, session };
    });
  }, []);

  // Restore the sample data from localStorage after mount. Supabase owns the
  // auth session now, so the stored `session` field is intentionally ignored.
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
          // Hydrating from localStorage after mount is intentional: the server
          // has no access to it, so doing this during render would mismatch.
          // Students are never restored from storage — they come from Supabase.
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setState((previous) => ({
            ...previous,
            ...data,
            students: [],
            session: null,
          }));
        }
      }
    } catch {
      // Corrupt storage should never break the app.
    }
  }, []);

  // Load the real Supabase user and keep the session in sync with auth events.
  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;

    try {
      const supabase = createClient();

      const sync = async () => {
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (!active) return;
          applyUser(user);
          if (user) await loadStudents();
        } catch {
          if (active) applyUser(null);
        } finally {
          if (active) setHydrated(true);
        }
      };

      void sync();

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        // Supabase holds an internal lock while this callback runs. Defer the
        // state update so we never call other Supabase methods inside it.
        setTimeout(() => {
          if (!active) return;
          applyUser(session?.user ?? null);
          if (session?.user) void loadStudents();
        }, 0);
      });

      unsubscribe = () => subscription.unsubscribe();
    } catch {
      // Missing configuration should not trap the UI in a loading state.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHydrated(true);
    }

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, [applyUser, loadStudents]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          version: 2,
          data: { ...state, session: null, students: [] },
        }),
      );
    } catch {
      // Storage may be unavailable (private mode); the app still works.
    }
  }, [state, hydrated]);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });

        if (error) {
          return { ok: false as const, error: authErrorMessage(error.message) };
        }

        if (!data.user) {
          return { ok: false as const, error: "Could not sign you in." };
        }

        applyUser(data.user);
        await loadStudents();
        return { ok: true as const, role: roleFor(data.user) };
      } catch {
        return {
          ok: false as const,
          error: "Authentication is unavailable right now. Please try again.",
        };
      }
    },
    [applyUser, loadStudents],
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.auth.signUp({
          email: input.email.trim().toLowerCase(),
          password: input.password,
          options: {
            data: {
              full_name: input.fullName.trim(),
              phone: input.phone?.trim() || null,
            },
          },
        });

        if (error) {
          return { ok: false as const, error: authErrorMessage(error.message) };
        }

        // When email confirmation is enabled Supabase returns no session until
        // the user clicks the confirmation link.
        if (!data.session || !data.user) {
          return {
            ok: true as const,
            role: "donor" as const,
            needsEmailConfirmation: true,
          };
        }

        applyUser(data.user);
        await loadStudents();
        return { ok: true as const, role: "donor" as const };
      } catch {
        return {
          ok: false as const,
          error: "Authentication is unavailable right now. Please try again.",
        };
      }
    },
    [applyUser, loadStudents],
  );

  const logout = useCallback(async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // Ignore a missing configuration; local state is still cleared below.
    }
    setState((previous) => ({ ...previous, session: null, students: [] }));
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

      // Keep the name in Supabase user metadata so it survives a refresh or a
      // different browser. Email changes go through Supabase's own flow.
      const metadata: Record<string, unknown> = {};
      if (patch.fullName !== undefined) metadata.full_name = patch.fullName;
      if (patch.phone !== undefined) metadata.phone = patch.phone;

      if (Object.keys(metadata).length > 0) {
        void createClient()
          .auth.updateUser({ data: metadata })
          .catch(() => undefined);
      }
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

  const addStudent = useCallback(
    async (student: Student): Promise<StudentActionResult> => {
      const result = await createStudentAction(student);
      if (!result.ok) return result;

      setState((previous) => ({
        ...previous,
        students: [student, ...previous.students],
      }));

      return result;
    },
    [],
  );

  const updateStudent = useCallback(
    async (id: string, patch: Partial<Student>): Promise<StudentActionResult> => {
      const existing = state.students.find((student) => student.id === id);
      if (!existing) {
        return { ok: false, error: "This student could not be found." };
      }

      const next: Student = { ...existing, ...patch, id };
      const result = await updateStudentAction(id, next);
      if (!result.ok) return result;

      setState((previous) => ({
        ...previous,
        students: previous.students.map((student) =>
          student.id === id ? next : student,
        ),
      }));

      return result;
    },
    [state.students],
  );

  const deleteStudent = useCallback(
    async (id: string): Promise<StudentActionResult> => {
      const result = await deleteStudentAction(id);
      if (!result.ok) return result;

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

      return result;
    },
    [],
  );

  const toggleStudentVisibility = useCallback(
    async (id: string): Promise<StudentActionResult> => {
      const existing = state.students.find((student) => student.id === id);
      if (!existing) {
        return { ok: false, error: "This student could not be found." };
      }

      const visibility =
        existing.visibility === "published" ? "unpublished" : "published";
      const result = await setStudentVisibilityAction(id, visibility);
      if (!result.ok) return result;

      setState((previous) => ({
        ...previous,
        students: previous.students.map((student) =>
          student.id === id ? { ...student, visibility } : student,
        ),
      }));

      return result;
    },
    [state.students],
  );

  const updateCampaignStatus = useCallback(
    async (
      id: string,
      status: CampaignStatus,
    ): Promise<StudentActionResult> => {
      const result = await setStudentStatusAction(id, status);
      if (!result.ok) return result;

      setState((previous) => ({
        ...previous,
        students: previous.students.map((student) =>
          student.id === id ? { ...student, campaignStatus: status } : student,
        ),
      }));

      return result;
    },
    [],
  );

  const updateSupportPlans = useCallback(
    async (
      studentId: string,
      plans: StudentSupportPlans,
    ): Promise<StudentActionResult> => {
      const result = await setStudentSupportPlansAction(studentId, plans);
      if (!result.ok) return result;

      setState((previous) => ({
        ...previous,
        students: previous.students.map((student) =>
          student.id === studentId
            ? { ...student, supportPlans: plans }
            : student,
        ),
      }));

      return result;
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
    setState((previous) => {
      const fresh = createInitialState();
      const donorId = previous.session?.donorId;
      const currentDonor = donorId
        ? previous.donors.find((donor) => donor.id === donorId)
        : undefined;

      return {
        ...fresh,
        students: previous.students,
        session: previous.session,
        donors: currentDonor ? [currentDonor, ...fresh.donors] : fresh.donors,
      };
    });
    toast.success("Sample data has been reset.");
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
