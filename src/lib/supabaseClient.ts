import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Mock-friendly client: if env vars are missing, we don't create a real client yet.
export const supabase =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

export type DashboardUser = {
  id: string;
  name: string;
};

export const MOCK_USERS: DashboardUser[] = [
  { id: "351932966990", name: "Ana" },
  { id: "351929426244", name: "Diego" },
];
