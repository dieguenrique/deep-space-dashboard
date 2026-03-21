const N8N_BASE_URL = "https://n8n-secundario-n8n.ofvt9y.easypanel.host";

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

export function clearCliente(): void {
  window.localStorage.removeItem(STORAGE_KEY);
  window.localStorage.removeItem("app_user_id");
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
  return res.json();
}
