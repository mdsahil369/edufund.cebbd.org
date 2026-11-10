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
  DonorStatus,
  DonationType,
  EducationCategory,
  FundingSummary,
  FundingTotals,
  Message,
  PaymentMethodId,
  PaymentSettings,
  Session,
  SiteSettings,
  Student,
  StudentSupportPlans,
} from "@/types";
import {
  conversations as initialConversations,
  messages as initialMessages,
} from "@/lib/mock-data/conversations";
import {
  paymentSettings as initialPaymentSettings,
  siteSettings as initialSiteSettings,
} from "@/lib/mock-data/settings";
import { generateId } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import {
  loadDonorAccountAction,
  setDonorPrivacyAction,
  submitDonationAction,
  updateDonorProfileAction,
  type DonorActionResult,
} from "@/app/dashboard/actions";
import {
  createManualDonationAction,
  listDonorsForAdminAction,
  reviewDonationAction,
  setDonorStatusAction,
  updateDonorAdminNotesAction,
} from "@/app/admin/donors/actions";
import { listCategoriesAction } from "@/app/admin/categories/actions";
import {
  createStudentAction,
  deleteStudentAction,
  listFundingSummariesAction,
  listStudentsAction,
  setStudentStatusAction,
  setStudentSupportPlansAction,
  setStudentVisibilityAction,
  updateStudentAction,
  type StudentActionResult,
} from "@/app/admin/students/actions";

/**
 * Donor profiles and donations live in Supabase. Messaging, payment settings
 * and site settings are intentionally still local sample data (the client asked
 * to keep the message system static for now).
 */
const STORAGE_KEY = "edufund-demo-v3";
// Bumping the payload version is not required to read old data: stored settings
// are merged onto the current defaults below.
const STORAGE_VERSION = 4;
const READABLE_VERSIONS = [3, STORAGE_VERSION];

type AuthRole = "donor" | "admin";

type PersistedData = Pick<
  DemoDataState,
  "conversations" | "messages" | "paymentSettings" | "siteSettings"
>;

/**
 * Settings saved in localStorage can come from an older release, so every
 * nested field is merged onto the current defaults. Without this, a new field
 * (for example `paymentSettings.international`) would be undefined at runtime.
 */
function withDefaultPaymentSettings(
  stored?: Partial<PaymentSettings> | null,
): PaymentSettings {
  if (!stored) return initialPaymentSettings;
  return {
    ...initialPaymentSettings,
    ...stored,
    bank: { ...initialPaymentSettings.bank, ...(stored.bank ?? {}) },
    bkash: { ...initialPaymentSettings.bkash, ...(stored.bkash ?? {}) },
    nagad: { ...initialPaymentSettings.nagad, ...(stored.nagad ?? {}) },
    whatsapp: { ...initialPaymentSettings.whatsapp, ...(stored.whatsapp ?? {}) },
    instructions:
      Array.isArray(stored.instructions) && stored.instructions.length > 0
        ? stored.instructions
        : initialPaymentSettings.instructions,
    international:
      Array.isArray(stored.international) && stored.international.length > 0
        ? stored.international
        : initialPaymentSettings.international,
  };
}

function withDefaultSiteSettings(
  stored?: Partial<SiteSettings> | null,
): SiteSettings {
  if (!stored) return initialSiteSettings;
  return {
    ...initialSiteSettings,
    ...stored,
    socials: { ...initialSiteSettings.socials, ...(stored.socials ?? {}) },
  };
}

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
  categories: EducationCategory[];
  donors: Donor[];
  donations: Donation[];
  fundingSummaries: Record<string, FundingTotals>;
  conversations: Conversation[];
  messages: Message[];
  paymentSettings: PaymentSettings;
  siteSettings: SiteSettings;
}

function createInitialState(): DemoDataState {
  return {
    session: null,
    // Students, donors and donations are loaded from Supabase once signed in.
    students: [],
    categories: [],
    donors: [],
    donations: [],
    fundingSummaries: {},
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

interface DonorProfilePatch {
  fullName?: string;
  phone?: string | null;
  address?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
}

interface DemoContextValue extends DemoDataState {
  hydrated: boolean;
  /** True once the signed-in user's donor / donation data has been fetched. */
  accountReady: boolean;
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
  addManualDonation: (input: {
    donorId: string;
    studentId: string;
    type: DonationType;
    amount: number;
    method: PaymentMethodId;
    transactionId?: string;
    senderReference?: string;
    paymentDate?: string;
    message?: string;
    status?: "pending" | "approved";
  }) => Promise<DonorActionResult>;
  approveDonation: (id: string) => Promise<DonorActionResult>;
  rejectDonation: (id: string, note: string) => Promise<DonorActionResult>;
  startConversation: (
    studentId: string,
    body: string,
    subject?: string,
  ) => Promise<string>;
  sendDonorMessage: (conversationId: string, body: string) => void;
  sendAdminReply: (conversationId: string, body: string) => void;
  markConversationRead: (conversationId: string, role: "donor" | "admin") => void;
  updateDonorProfile: (patch: DonorProfilePatch) => Promise<DonorActionResult>;
  setShowNamePublicly: (value: boolean) => Promise<DonorActionResult>;
  setDonorStatus: (
    donorId: string,
    status: DonorStatus,
  ) => Promise<DonorActionResult>;
  saveDonorAdminNotes: (
    donorId: string,
    notes: string,
  ) => Promise<DonorActionResult>;
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
  const [accountReady, setAccountReady] = useState(false);

  const refreshFundingSummaries = useCallback(async () => {
    const funding = await listFundingSummariesAction();
    setState((previous) => ({ ...previous, fundingSummaries: funding }));
  }, []);

  const loadAccountData = useCallback(async (user: User) => {
    const role = roleFor(user);

    try {
      const [students, funding] = await Promise.all([
        listStudentsAction(),
        listFundingSummariesAction(),
      ]);

      if (role === "admin") {
        const [{ donors, donations }, categories] = await Promise.all([
          listDonorsForAdminAction(),
          listCategoriesAction(),
        ]);
        setState((previous) => ({
          ...previous,
          students,
          categories,
          fundingSummaries: funding,
          donors,
          donations,
        }));
      } else {
        const { donor, donations } = await loadDonorAccountAction();
        setState((previous) => ({
          ...previous,
          students,
          fundingSummaries: funding,
          donors: donor ? [donor] : [],
          donations,
        }));
      }
    } catch (error) {
      console.error(
        "[account] Failed to load Supabase data:",
        error instanceof Error ? error.message : error,
      );
    } finally {
      setAccountReady(true);
    }
  }, []);

  const applyUser = useCallback((user: User | null) => {
    if (!user) {
      setState((previous) => ({
        ...previous,
        session: null,
        students: [],
        categories: [],
        donors: [],
        donations: [],
        fundingSummaries: {},
      }));
      setAccountReady(false);
      return;
    }

    const session: Session = {
      role: roleFor(user),
      donorId: roleFor(user) === "donor" ? user.id : undefined,
      name: displayNameFor(user),
      email: user.email ?? "",
    };

    setState((previous) => ({ ...previous, session }));
  }, []);

  // Restore local sample data (messages + settings only) after mount.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as {
          version?: number;
          data?: Partial<PersistedData>;
        };
        const data = parsed.data;
        if (data && parsed.version && READABLE_VERSIONS.includes(parsed.version)) {
          // Hydrating from localStorage after mount is intentional: the server
          // has no access to it, so doing this during render would mismatch.
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setState((previous) => ({
            ...previous,
            ...data,
            paymentSettings: withDefaultPaymentSettings(data.paymentSettings),
            siteSettings: withDefaultSiteSettings(data.siteSettings),
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
          if (user) {
            await loadAccountData(user);
          } else {
            setAccountReady(true);
          }
        } catch {
          if (active) {
            applyUser(null);
            setAccountReady(true);
          }
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
          if (session?.user) void loadAccountData(session.user);
        }, 0);
      });

      unsubscribe = () => subscription.unsubscribe();
    } catch {
      // Missing configuration should not trap the UI in a loading state.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHydrated(true);
      setAccountReady(true);
    }

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, [applyUser, loadAccountData]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      const data: PersistedData = {
        conversations: state.conversations,
        messages: state.messages,
        paymentSettings: state.paymentSettings,
        siteSettings: state.siteSettings,
      };
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ version: STORAGE_VERSION, data }),
      );
    } catch {
      // Storage may be unavailable (private mode); the app still works.
    }
  }, [
    state.conversations,
    state.messages,
    state.paymentSettings,
    state.siteSettings,
    hydrated,
  ]);

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
        await loadAccountData(data.user);
        return { ok: true as const, role: roleFor(data.user) };
      } catch {
        return {
          ok: false as const,
          error: "Authentication is unavailable right now. Please try again.",
        };
      }
    },
    [applyUser, loadAccountData],
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
        await loadAccountData(data.user);
        return { ok: true as const, role: "donor" as const };
      } catch {
        return {
          ok: false as const,
          error: "Authentication is unavailable right now. Please try again.",
        };
      }
    },
    [applyUser, loadAccountData],
  );

  const logout = useCallback(async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // Ignore a missing configuration; local state is still cleared below.
    }
    setState((previous) => ({
      ...previous,
      session: null,
      students: [],
      categories: [],
      donors: [],
      donations: [],
      fundingSummaries: {},
    }));
    setAccountReady(false);
    toast.success("You have been signed out.");
  }, []);

  const submitDonation = useCallback(async (input: DonationInput) => {
    const result = await submitDonationAction(input);
    if (!result.ok) {
      throw new Error(result.error);
    }

    setState((previous) => ({
      ...previous,
      donations: [result.donation, ...previous.donations],
    }));

    return result.donation;
  }, []);

  const addManualDonation = useCallback(
    async (input: {
      donorId: string;
      studentId: string;
      type: DonationType;
      amount: number;
      method: PaymentMethodId;
      transactionId?: string;
      senderReference?: string;
      paymentDate?: string;
      message?: string;
      status?: "pending" | "approved";
    }): Promise<DonorActionResult> => {
      const result = await createManualDonationAction(input);
      if (!result.ok) return result;

      setState((previous) => ({
        ...previous,
        donations: [result.donation, ...previous.donations],
      }));
      await refreshFundingSummaries();
      return { ok: true };
    },
    [refreshFundingSummaries],
  );

  const approveDonation = useCallback(
    async (id: string): Promise<DonorActionResult> => {
      const result = await reviewDonationAction(id, "approved");
      if (!result.ok) return result;

      setState((previous) => ({
        ...previous,
        donations: previous.donations.map((donation) =>
          donation.id === id ? result.donation : donation,
        ),
      }));
      await refreshFundingSummaries();
      return { ok: true };
    },
    [refreshFundingSummaries],
  );

  const rejectDonation = useCallback(
    async (id: string, note: string): Promise<DonorActionResult> => {
      const result = await reviewDonationAction(id, "rejected", note);
      if (!result.ok) return result;

      setState((previous) => ({
        ...previous,
        donations: previous.donations.map((donation) =>
          donation.id === id ? result.donation : donation,
        ),
      }));
      await refreshFundingSummaries();
      return { ok: true };
    },
    [refreshFundingSummaries],
  );

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
    async (patch: DonorProfilePatch): Promise<DonorActionResult> => {
      const donorId = state.session?.donorId;
      if (!donorId) {
        return { ok: false, error: "Please sign in again." };
      }

      const result = await updateDonorProfileAction(patch);
      if (!result.ok) return result;

      const donorPatch: Partial<Donor> = {};
      if (patch.fullName !== undefined) {
        donorPatch.fullName = patch.fullName.trim();
      }
      if (patch.phone !== undefined) {
        donorPatch.phone = patch.phone?.trim() || undefined;
      }
      if (patch.address !== undefined) {
        donorPatch.address = patch.address?.trim() || undefined;
      }
      if (patch.bio !== undefined) {
        donorPatch.bio = patch.bio?.trim() || undefined;
      }
      if (patch.avatarUrl !== undefined) {
        donorPatch.avatarUrl = patch.avatarUrl?.trim() || undefined;
      }

      setState((previous) => ({
        ...previous,
        donors: previous.donors.map((donor) =>
          donor.id === donorId ? { ...donor, ...donorPatch } : donor,
        ),
        session: previous.session
          ? {
              ...previous.session,
              name: donorPatch.fullName ?? previous.session.name,
            }
          : previous.session,
      }));

      return { ok: true };
    },
    [state.session],
  );

  const setShowNamePublicly = useCallback(
    async (value: boolean): Promise<DonorActionResult> => {
      const donorId = state.session?.donorId;
      if (!donorId) {
        return { ok: false, error: "Please sign in again." };
      }

      const result = await setDonorPrivacyAction(value);
      if (!result.ok) return result;

      setState((previous) => ({
        ...previous,
        donors: previous.donors.map((donor) =>
          donor.id === donorId
            ? { ...donor, showNamePublicly: value }
            : donor,
        ),
      }));

      return { ok: true };
    },
    [state.session],
  );

  const setDonorStatus = useCallback(
    async (
      donorId: string,
      status: DonorStatus,
    ): Promise<DonorActionResult> => {
      const result = await setDonorStatusAction(donorId, status);
      if (!result.ok) return result;

      setState((previous) => ({
        ...previous,
        donors: previous.donors.map((donor) =>
          donor.id === donorId ? { ...donor, status } : donor,
        ),
      }));

      return { ok: true };
    },
    [],
  );

  const saveDonorAdminNotes = useCallback(
    async (donorId: string, notes: string): Promise<DonorActionResult> => {
      const result = await updateDonorAdminNotesAction(donorId, notes);
      if (!result.ok) return result;

      setState((previous) => ({
        ...previous,
        donors: previous.donors.map((donor) =>
          donor.id === donorId
            ? { ...donor, adminNotes: notes.trim() || undefined }
            : donor,
        ),
      }));

      return { ok: true };
    },
    [],
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

    // Donor and donation records live in Supabase, so only the local sample
    // messages and settings are reset here.
    setState((previous) => ({
      ...previous,
      conversations: initialConversations,
      messages: initialMessages,
      paymentSettings: initialPaymentSettings,
      siteSettings: initialSiteSettings,
    }));
    toast.success("Sample messages and settings have been reset.");
  }, []);

  const fundingFor = useCallback(
    (studentId: string): FundingSummary => {
      const student = state.students.find((item) => item.id === studentId);
      const totals = state.fundingSummaries[studentId] ?? {
        raised: 0,
        approvedDonationCount: 0,
        supporterCount: 0,
      };
      const required = student?.requiredAmount ?? 0;
      const raised = totals.raised;

      return {
        required,
        raised,
        remaining: Math.max(0, required - raised),
        percent:
          required > 0
            ? Math.min(100, Math.round((raised / required) * 100))
            : 0,
        approvedDonationCount: totals.approvedDonationCount,
        supporterCount: totals.supporterCount,
      };
    },
    [state.students, state.fundingSummaries],
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
      accountReady,
      unreadDonorCount,
      unreadAdminCount,
      login,
      register,
      logout,
      submitDonation,
      addManualDonation,
      approveDonation,
      rejectDonation,
      startConversation,
      sendDonorMessage,
      sendAdminReply,
      markConversationRead,
      updateDonorProfile,
      setShowNamePublicly,
      setDonorStatus,
      saveDonorAdminNotes,
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
      accountReady,
      unreadDonorCount,
      unreadAdminCount,
      login,
      register,
      logout,
      submitDonation,
      addManualDonation,
      approveDonation,
      rejectDonation,
      startConversation,
      sendDonorMessage,
      sendAdminReply,
      markConversationRead,
      updateDonorProfile,
      setShowNamePublicly,
      setDonorStatus,
      saveDonorAdminNotes,
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
