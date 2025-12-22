import { supabase } from "@/lib/supabase";

export type TransactionRecord = {
  id: number;
  date: string; // ISO date (YYYY-MM-DD)
  title: string;
  category: string;
  amount: number; // negative for gastos, positive for receitas
  responsavel?: string | null;
};

export type ReminderStatus = "pending" | "done";

export type ReminderRecord = {
  id: number;
  title: string;
  message: string | null;
  date: string; // ISO date (YYYY-MM-DD)
  timeLabel: string; // "HH:MM" in pt-PT
  status: ReminderStatus;
};

export type NoteRecord = {
  id: number;
  title: string;
  body: string;
  date: string; // ISO date (YYYY-MM-DD)
  tone?: "finance" | "notes" | "reminders";
};

function toDateKey(dateTime: string | null): string {
  if (!dateTime) return new Date().toISOString().slice(0, 10);
  const d = new Date(dateTime);
  return d.toISOString().slice(0, 10);
}

function toTimeLabel(dateTime: string | null): string {
  if (!dateTime) return "";
  const d = new Date(dateTime);
  return d.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });
}

export async function fetchTransactions(startDate: Date, endDate: Date): Promise<TransactionRecord[]> {
  const { data, error } = await supabase
    .from("financeiro_registros")
    .select("id, data_hora, valor, categoria, tipo, descricao, responsavel")
    .gte("data_hora", startDate.toISOString())
    .lte("data_hora", endDate.toISOString())
    .order("data_hora", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row: any) => {
    // 1. Clean the strings for comparison
    const rawDesc = String(row.descricao || "").toLowerCase();
    const rawCat = String(row.categoria || "").toLowerCase();
    const rawType = String(row.tipo || "").toLowerCase();

    // 2. DEFINE WHAT IS INCOME (The Exceptions)
    // If it mentions 'receita', 'salário', 'investimento' or 'entrada', it is Income.
    const isIncome =
      rawType.includes("receita") ||
      rawType.includes("entrada") ||
      rawCat.includes("receita") ||
      rawCat.includes("investimento") ||
      rawDesc.includes("salário") ||
      rawDesc.includes("freelancer");

    // 3. EVERYTHING ELSE IS AN EXPENSE
    const isExpense = !isIncome;

    // 4. Force the Sign
    const rawValue = Number(row.valor);
    // Always make it positive first using Math.abs, then apply sign
    const finalAmount = Math.abs(rawValue) * (isExpense ? -1 : 1);

    return {
      id: row.id,
      date: row.data_hora ? new Date(row.data_hora).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      title: row.descricao || "Sem título",
      category: row.categoria || "Outros",
      amount: finalAmount, // Now Expenses are GUARANTEED to be negative
      responsavel: row.responsavel ?? null,
    } satisfies TransactionRecord;
  });
}

export async function fetchReminders(userId: string): Promise<ReminderRecord[]> {
  const { data, error } = await supabase
    .from("lembretes")
    .select("id, titulo, mensagem, data_hora, enviado")
    .eq("usuario", userId)
    .order("data_hora", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row: any) => {
    const title = (row.titulo as string | null) || (row.mensagem as string | null) || "Lembrete";

    return {
      id: row.id,
      title,
      message: row.mensagem ?? null,
      date: toDateKey(row.data_hora),
      timeLabel: toTimeLabel(row.data_hora),
      status: row.enviado ? "done" : "pending",
    } satisfies ReminderRecord;
  });
}

export async function completeReminder(id: number): Promise<void> {
  const { error } = await supabase.from("lembretes").update({ enviado: true }).eq("id", id);
  if (error) throw error;
}

export async function fetchNotes(userId: string): Promise<NoteRecord[]> {
  const { data, error } = await supabase
    .from("notas")
    .select("id, titulo, conteudo, created_at")
    .eq("usuario", userId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    id: row.id,
    title: row.titulo ?? "",
    body: row.conteudo ?? "",
    date: toDateKey(row.created_at),
    tone: "notes",
  } satisfies NoteRecord));
}

export async function updateNote(id: number, title: string, body: string): Promise<void> {
  const { error } = await supabase
    .from("notas")
    .update({ titulo: title, conteudo: body })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteNote(id: number): Promise<void> {
  const { error } = await supabase.from("notas").delete().eq("id", id);
  if (error) throw error;
}
