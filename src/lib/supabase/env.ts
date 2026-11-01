import { z } from "zod";

const supabaseEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL."),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is required."),
});

export type SupabaseEnv = {
  url: string;
  publishableKey: string;
};

/**
 * Returns true when both public Supabase variables are present. This is a
 * presence check only; use getSupabaseEnv() when a client needs the values.
 */
export function hasSupabaseEnv(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim(),
  );
}

/**
 * Validates the public Supabase configuration and returns it in a stable
 * shape. Throws a descriptive error that names the missing/invalid variables,
 * but never includes their values.
 */
export function getSupabaseEnv(): SupabaseEnv {
  const parsed = supabaseEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL?.trim(),
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim(),
  });

  if (!parsed.success) {
    const fields = Array.from(
      new Set(
        parsed.error.issues
          .map((issue) => issue.path.join("."))
          .filter((field) => field.length > 0),
      ),
    );

    throw new Error(
      `Supabase is not configured. Add ${fields.join(
        " and ",
      )} to .env.local. See .env.example for the required variables.`,
    );
  }

  return {
    url: parsed.data.NEXT_PUBLIC_SUPABASE_URL,
    publishableKey: parsed.data.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  };
}
