import { supabase } from "./supabase";

const N8N_BASE_URL = "https://n8n-secundario-n8n.ofvt9y.easypanel.host";
const SUPABASE_URL = "https://bhlhoodsajtnkjfbcddp.supabase.co";

export type Cliente = {
  id: string;
  nome: string;
  whatsapp: string;
};

const STORAGE_KEY = "vectra_cliente";

export function getStoredCliente(): Cliente | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Cliente;
  } catch {
    return null;
  }
}

export function storeCliente(cliente: Cliente): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cliente));
}

export async function clearCliente(): Promise<void> {
  window.localStorage.removeItem(STORAGE_KEY);
  window.localStorage.removeItem("app_user_id");
  await supabase.auth.signOut();
}

export async function requestCode(whatsapp: string): Promise<{ success: boolean; error?: string }> {
  const res = await fetch(`${N8N_BASE_URL}/webhook/verificar-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ whatsapp }),
  });
  return res.json();
}

export async function validateCode(
  whatsapp: string,
  codigo: string
): Promise<{ success: boolean; cliente?: Cliente; error?: string }> {
  const res = await fetch(`${N8N_BASE_URL}/webhook/validar-codigo`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ whatsapp, codigo }),
  });
  const result = await res.json();

  if (result.success && result.cliente) {
    // After successful WhatsApp verification, get a Supabase Auth session
    try {
      await generateSupabaseSession(whatsapp);
    } catch (err) {
      console.warn("Failed to establish authenticated session:", err);
      // Login still works, but without RLS protection
    }
  }

  return result;
}

async function generateSupabaseSession(whatsapp: string): Promise<void> {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/generate-session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ whatsapp }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Session generation failed");
  }

  const { access_token, refresh_token } = await res.json();

  // Set the authenticated session on the Supabase client
  await supabase.auth.setSession({
    access_token,
    refresh_token,
  });
}

/** Restore session on app startup if stored tokens exist */
export async function restoreSession(): Promise<boolean> {
  const { data } = await supabase.auth.getSession();
  return !!data.session;
}
