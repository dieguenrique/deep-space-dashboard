import type React from "react";
import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  CreditCard,
  ArrowDownRight,
  ArrowUpRight,
  PiggyBank,
  PenSquare,
  BellRing,
  Search,
  Utensils,
  Car,
  Home,
  PartyPopper,
  CheckCircle2,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Check,
  Sparkles,
  Loader2,
  ListChecks,
  X as CloseIcon,
  AlertCircle,
  Trash2,
  Edit3,
  LogOut,
  Download,
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from "recharts";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { type Cliente, getStoredCliente, storeCliente, clearCliente, requestCode, validateCode, restoreSession } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchTransactions, fetchReminders, fetchNotes, completeReminder, updateNote, deleteNote, deleteReminder, type TransactionRecord, type ReminderRecord, type NoteRecord } from "@/services/api";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
const financeEvolution = [
  { month: "Jan", value: 1200 },
  { month: "Fev", value: 1500 },
  { month: "Mar", value: 1800 },
  { month: "Abr", value: 1650 },
  { month: "Mai", value: 2100 },
  { month: "Jun", value: 2400 },
];

const financeEvolutionThisMonth = [
  { day: "1", value: 400 },
  { day: "5", value: 650 },
  { day: "10", value: 980 },
  { day: "15", value: 1200 },
  { day: "20", value: 1420 },
  { day: "25", value: 1600 },
  { day: "30", value: 1750 },
];

const financeCategories = [
  { category: "Alimentação", value: 65 },
  { category: "Transporte", value: 35 },
  { category: "Lazer", value: 42 },
  { category: "Saúde", value: 28 },
  { category: "Outros", value: 30 },
];

const currencyFormatter = new Intl.NumberFormat("pt-PT", {
  style: "currency",
  currency: "EUR",
});

const recentTransactions = [
  {
    id: 1,
    title: "Restaurante · almoço",
    subtitle: "Hoje · Cartão crédito · Categoria: Alimentação",
    amount: -74.9,
    cashback: 1.8,
    category: "Alimentação",
    date: "2025-01-10",
  },
  {
    id: 2,
    title: "Uber · reunião cliente",
    subtitle: "Ontem · Cartão crédito · Categoria: Transporte",
    amount: -32.5,
    cashback: 0.7,
    category: "Transporte",
    date: "2025-01-09",
  },
  {
    id: 3,
    title: "Aluguel apartamento",
    subtitle: "01/10 · Débito automático · Categoria: Casa",
    amount: -950,
    cashback: 5,
    category: "Casa",
    date: "2025-01-01",
  },
  {
    id: 4,
    title: "Netflix & Spotify",
    subtitle: "Esta semana · Cartão crédito · Categoria: Lazer",
    amount: -29.9,
    cashback: 0.5,
    category: "Lazer",
    date: "2025-01-06",
  },
];

const calendarTransactions = [
  { id: 101, title: "Salário", amount: 3200, category: "Receita", date: "2025-01-01" },
  { id: 102, title: "Supermercado", amount: -120.4, category: "Alimentação", date: "2025-01-02" },
  { id: 103, title: "Uber", amount: -18.9, category: "Transporte", date: "2025-01-03" },
  { id: 104, title: "Restaurante · jantar", amount: -85.3, category: "Alimentação", date: "2025-01-04" },
  { id: 105, title: "Freelancer · projeto", amount: 540, category: "Receita", date: "2025-01-04" },
  { id: 106, title: "Cinema", amount: -42, category: "Lazer", date: "2025-01-05" },
  { id: 107, title: "Aluguel", amount: -950, category: "Casa", date: "2025-01-06" },
  { id: 108, title: "Ginásio", amount: -39.9, category: "Saúde", date: "2025-01-06" },
  { id: 109, title: "Reembolso empresa", amount: 210, category: "Receita", date: "2025-01-07" },
  { id: 110, title: "Café coworking", amount: -12.5, category: "Alimentação", date: "2025-01-07" },
  { id: 111, title: "Combustível", amount: -70, category: "Transporte", date: "2025-01-08" },
  { id: 112, title: "Streaming anual", amount: -199, category: "Lazer", date: "2025-01-09" },
  { id: 113, title: "Bónus", amount: 860, category: "Receita", date: "2025-01-09" },
  { id: 114, title: "Farmácia", amount: -26.7, category: "Saúde", date: "2025-01-10" },
  { id: 115, title: "Restaurante · família", amount: -132.8, category: "Alimentação", date: "2025-01-11" },
  { id: 116, title: "Táxi", amount: -15.2, category: "Transporte", date: "2025-01-11" },
  { id: 117, title: "Consultoria", amount: 430, category: "Receita", date: "2025-01-12" },
  { id: 118, title: "Bar · amigos", amount: -64.3, category: "Lazer", date: "2025-01-12" },
  { id: 119, title: "Supermercado grande", amount: -210.5, category: "Alimentação", date: "2025-01-13" },
  { id: 120, title: "Rendimento investimentos", amount: 190.1, category: "Receita", date: "2025-01-14" },
];

const calendarNotes = [
  {
    id: 201,
    date: "2025-01-04",
    title: "Revisar orçamento semanal",
    body: "Verificar gastos em restaurantes e transportes desta semana.",
  },
  {
    id: 202,
    date: "2025-01-06",
    title: "Checklist de faturas",
    body: "Confirmar pagamento de aluguel, ginásio e streaming.",
  },
  {
    id: 203,
    date: "2025-01-07",
    title: "Ideias de corte de custos",
    body: "Explorar alternativas mais baratas para transporte diário.",
  },
  {
    id: 204,
    date: "2025-01-09",
    title: "Planeamento de bónus",
    body: "Definir percentagem para investimentos vs. lazer.",
  },
  {
    id: 205,
    date: "2025-01-11",
    title: "Fim de semana em família",
    body: "Controlar limite de gastos em refeições e passeios.",
  },
  {
    id: 206,
    date: "2025-01-12",
    title: "Revisão de assinaturas",
    body: "Ver se ainda faz sentido manter todas as subscrições.",
  },
  {
    id: 207,
    date: "2025-01-13",
    title: "Supermercado mensal",
    body: "Comparar preços entre supermercados habituais.",
  },
  {
    id: 208,
    date: "2025-01-14",
    title: "Reinvestir rendimentos",
    body: "Escolher ativos para aplicar o rendimento dos investimentos.",
  },
];
const getCategoryIcon = (category: string) => {
  switch (category) {
    case "Alimentação":
      return Utensils;
    case "Transporte":
      return Car;
    case "Casa":
      return Home;
    case "Lazer":
      return PartyPopper;
    default:
      return CreditCard;
  }
};

const tabVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const cardHover = {
  rest: { y: 0, scale: 1, boxShadow: "0 0 0 rgba(0,0,0,0)" },
  hover: {
    y: -2,
    scale: 1.01,
    boxShadow: "0 18px 45px rgba(15,23,42,0.7)",
  },
};

const bottomDockItems = [
  { key: "finance", label: "Finanças", icon: CreditCard },
  { key: "notes", label: "Notas", icon: PenSquare },
  { key: "reminders", label: "Lembretes", icon: BellRing },
  { key: "calendar", label: "Calendário", icon: CalendarDays },
] as const;

type TabKey = (typeof bottomDockItems)[number]["key"];

const getDateKey = (date: Date) => date.toISOString().slice(0, 10);

const Index = () => {
  const [selectedUser, setSelectedUser] = useState<Cliente | null>(null);
  const [bootstrappedUser, setBootstrappedUser] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("finance");
  const [privacyOn, setPrivacyOn] = useState(false);
  const [notesQuery, setNotesQuery] = useState("");
  const [focusedNoteId, setFocusedNoteId] = useState<number | null>(null);
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(new Date());
  const [viewDate, setViewDate] = useState<Date>(new Date());
  const [focusChecklist, setFocusChecklist] = useState<{ id: string; text: string; done: boolean }[]>([]);
  const [focusShowChecklist, setFocusShowChecklist] = useState(false);
  const [editingNote, setEditingNote] = useState<NoteRecord | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  useEffect(() => {
    try {
      const stored = getStoredCliente();
      if (stored) {
        setSelectedUser(stored);
        // Try to restore Supabase Auth session
        restoreSession().catch(() => {});
      }
    } catch (error) {
      console.error("Failed to read stored user from localStorage", error);
    } finally {
      setBootstrappedUser(true);
    }
  }, []);

  const handleLogin = (cliente: Cliente) => {
    setSelectedUser(cliente);
  };

  const handleLogout = async () => {
    await clearCliente();
    setSelectedUser(null);
  };

  const currentUserId = selectedUser?.whatsapp ?? null;
  const queryClient = useQueryClient();

  const { data: transactions = [], isLoading: isLoadingTransactions } = useQuery<TransactionRecord[]>({
    queryKey: ["transactions", currentUserId], // Removed date from key to cache globally
    queryFn: () => {
      // Fetch a wide range to get "all" history for cumulative balance
      // From 2020 to 2030 should cover most personal use cases
      const start = new Date(2020, 0, 1);
      const end = new Date(2030, 11, 31, 23, 59, 59);
      return fetchTransactions(start, end, currentUserId!);
    },
    enabled: !!currentUserId,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const { data: reminders = [], isLoading: isLoadingReminders } = useQuery<ReminderRecord[]>({
    queryKey: ["reminders", currentUserId],
    queryFn: () => fetchReminders(currentUserId!),
    enabled: !!currentUserId,
  });

  const { data: notes = [], isLoading: isLoadingNotes } = useQuery<NoteRecord[]>({
    queryKey: ["notes", currentUserId],
    queryFn: () => fetchNotes(currentUserId!),
    enabled: !!currentUserId,
  });
  const filteredNotes = useMemo(() => {
    if (!currentUserId) return [] as NoteRecord[];
    const q = notesQuery.toLowerCase().trim();
    return notes.filter((note) => {
      if (!q) return true;
      return note.title.toLowerCase().includes(q) || note.body.toLowerCase().includes(q);
    });
  }, [notesQuery, notes, currentUserId]);

  const filteredReminders = useMemo(() => {
    if (!currentUserId) return [] as ReminderRecord[];
    const q = notesQuery.toLowerCase().trim();
    return reminders.filter((reminder) => {
      if (!q) return true;
      return reminder.title.toLowerCase().includes(q);
    });
  }, [reminders, notesQuery, currentUserId]);

  const filteredTransactions = useMemo(() => {
    if (!currentUserId) return [] as TransactionRecord[];
    const q = notesQuery.toLowerCase().trim();

    // Filter by Month/Year of viewDate
    const monthTransactions = transactions.filter((tx) => {
      const txDate = new Date(tx.date);
      return (
        txDate.getMonth() === viewDate.getMonth() &&
        txDate.getFullYear() === viewDate.getFullYear()
      );
    });

    return monthTransactions.filter((tx) => {
      if (!q) return true;
      return tx.title.toLowerCase().includes(q) || tx.category.toLowerCase().includes(q);
    });
  }, [transactions, notesQuery, currentUserId, viewDate]);

  const cumulativeBalance = useMemo(() => {
    if (!transactions) return 0;
    const endOfViewMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0, 23, 59, 59, 999);

    return transactions
      .filter((t) => new Date(t.date) <= endOfViewMonth)
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, viewDate]);

  const completeReminderMutation = useMutation({
    mutationFn: (id: number) => completeReminder(id),
  });

  const handleCompleteReminder = (id: number) => {
    if (!currentUserId) return;
    const key = ["reminders", currentUserId] as const;

    queryClient.setQueryData<ReminderRecord[]>(key, (old) =>
      (old ?? []).map((r) => (r.id === id ? { ...r, status: "done" as const } : r)),
    );

    completeReminderMutation.mutate(id, {
      onError: () => {
        queryClient.setQueryData<ReminderRecord[]>(key, (old) =>
          (old ?? []).map((r) => (r.id === id ? { ...r, status: "pending" as const } : r)),
        );
      },
    });
  };

  const deleteRemindersMutation = useMutation({
    mutationFn: (ids: number[]) => Promise.all(ids.map((id) => deleteReminder(id))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders", currentUserId] });
      toast({ title: "Lembretes excluídos", description: "Os lembretes selecionados foram removidos." });
    },
    onError: () => {
      toast({ title: "Erro", description: "Falha ao excluir lembretes.", variant: "destructive" });
    },
  });

  const handleDeleteReminders = (ids: number[]) => {
    deleteRemindersMutation.mutate(ids);
  };

  // Note mutations
  const updateNoteMutation = useMutation({
    mutationFn: ({ id, title, body }: { id: number; title: string; body: string }) =>
      updateNote(id, title, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", currentUserId] });
      toast({ title: "Nota atualizada", description: "A nota foi atualizada com sucesso." });
      setEditingNote(null);
    },
    onError: () => {
      toast({ title: "Erro", description: "Não foi possível atualizar a nota.", variant: "destructive" });
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: (id: number) => deleteNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", currentUserId] });
      toast({ title: "Nota excluída", description: "A nota foi excluída com sucesso." });
      setDeleteConfirmId(null);
    },
    onError: () => {
      toast({ title: "Erro", description: "Não foi possível excluir a nota.", variant: "destructive" });
    },
  });

  const handleEditNote = (note: NoteRecord) => {
    setEditingNote(note);
    setEditTitle(note.title);
    setEditBody(note.body);
  };

  const handleSaveNote = () => {
    if (!editingNote) return;
    updateNoteMutation.mutate({ id: editingNote.id, title: editTitle, body: editBody });
  };

  const handleDeleteNote = (id: number) => {
    setDeleteConfirmId(id);
  };

  const confirmDeleteNote = () => {
    if (deleteConfirmId) {
      deleteNoteMutation.mutate(deleteConfirmId);
    }
  };

  const focusNote = filteredNotes.find((n) => n.id === focusedNoteId) ?? null;

  useEffect(() => {
    if (!focusNote) {
      setFocusChecklist([]);
      setFocusShowChecklist(false);
      return;
    }

    const body = (focusNote.body ?? "").replace(/\r/g, "");
    const lines = body
      .split("\n")
      .map((line) => line.replace(/^[-•–]\s+/, "").trim())
      .filter((line) => line.length > 0 && line.length > 3);

    const items = lines.map((text, index) => ({
      id: `focus-${focusNote.id}-${index}`,
      text,
      done: false,
    }));

    setFocusChecklist(items);
    setFocusShowChecklist(items.length > 0);
  }, [focusNote]);

  const handleToggleFocusChecklist = () => {
    setFocusShowChecklist((prev) => !prev);
  };

  const handleToggleFocusItem = (itemId: string) => {
    setFocusChecklist((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, done: !item.done } : item)),
    );
  };

  const greet = selectedUser ? `Bom dia, ${selectedUser.nome}!` : "Bom dia";

  return (
    <div className="relative min-h-screen overflow-x-hidden overflow-y-auto">
      {/* Aurora background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-32 top-0 h-80 w-80 rounded-full bg-primary/20 blur-3xl animate-aurora" />
        <div className="absolute -right-24 top-40 h-72 w-72 rounded-full bg-accent/20 blur-3xl animate-aurora" />
        <div className="absolute left-10 bottom-0 h-64 w-64 rounded-full bg-[hsl(var(--reminders-accent))]/20 blur-3xl animate-aurora" />
      </div>

      {!bootstrappedUser ? (
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-xs text-muted-foreground">Carregando cockpit...</p>
        </div>
      ) : !selectedUser ? (
        <WhatsAppLogin onLogin={handleLogin} />
      ) : (
        <motion.main
          className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 pb-24 pt-6 md:px-6 md:pb-10"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <header className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/70">Dashboard pessoal</p>
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{greet}</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPrivacyOn((p) => !p)}
                className="inline-flex items-center gap-1 rounded-full bg-card/70 px-3 py-1 text-xs text-muted-foreground border border-border/60 backdrop-blur-md hover:bg-card/90 transition-colors"
              >
                {privacyOn ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                <span>{privacyOn ? "Ocultar valores" : "Mostrar valores"}</span>
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1 rounded-full bg-card/70 px-3 py-1 text-xs text-muted-foreground border border-border/60 backdrop-blur-md hover:bg-card/90 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sair</span>
              </button>
            </div>
          </header>

          {/* Tabs content */}
          <div className="flex-1 pb-4">
            <motion.div
              key={activeTab}
              variants={tabVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="space-y-4"
            >
              {activeTab === "finance" && (
                <FinanceTab
                  privacyOn={privacyOn}
                  transactions={filteredTransactions}
                  currentDate={viewDate}
                  onDateChange={setViewDate}
                  cumulativeBalance={cumulativeBalance}
                />
              )}
              {activeTab === "notes" && (
                <NotesTab
                  notes={filteredNotes}
                  query={notesQuery}
                  onQueryChange={setNotesQuery}
                  onOpenNote={setFocusedNoteId}
                  onEditNote={handleEditNote}
                  onDeleteNote={handleDeleteNote}
                />
              )}
              {activeTab === "reminders" && (
                <RemindersTab
                  reminders={filteredReminders}
                  onCompleteReminder={handleCompleteReminder}
                  onDeleteReminders={handleDeleteReminders}
                />
              )}
              {activeTab === "calendar" && (
                <CalendarTab
                  selectedDay={selectedDay}
                  onSelectDay={setSelectedDay}
                  privacyOn={privacyOn}
                  viewDate={viewDate}
                  onChangeViewDate={setViewDate}
                  transactions={filteredTransactions}
                  reminders={filteredReminders}
                  notes={filteredNotes}
                  onCompleteReminder={handleCompleteReminder}
                />
              )}
            </motion.div>
          </div>

          {/* Floating bottom dock */}
          <nav className="fixed inset-x-0 bottom-3 z-20 flex justify-center px-4 md:static md:mt-4 md:px-0">
            <div className="glass-nav flex w-full max-w-md items-center justify-between rounded-2xl px-4 py-2.5 md:max-w-lg">
              {bottomDockItems.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setActiveTab(item.key)}
                    className={cn(
                      "group flex flex-1 flex-col items-center gap-0.5 rounded-2xl px-2 py-1.5 text-[11px] font-medium transition-colors",
                      active ? "text-primary" : "text-muted-foreground/80 hover:text-foreground",
                    )}
                  >
                    <motion.div
                      variants={cardHover}
                      initial="rest"
                      whileHover="hover"
                      animate={active ? "hover" : "rest"}
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-2xl border text-xs",
                        active
                          ? "border-primary/60 bg-primary/15 shadow-[0_0_30px_hsl(var(--primary)/0.5)]"
                          : "border-border/60 bg-card/60",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </motion.div>
                    <span className="mt-0.5 leading-none">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          <Dialog open={!!focusNote} onOpenChange={() => setFocusedNoteId(null)}>
            <DialogContent className="glass-card aura-card border border-border/60 bg-background/90 max-w-2xl max-h-[90vh] overflow-hidden p-0 [&>button:last-child]:hidden flex flex-col">
              {focusNote && (
                <>
                  <div className="sticky top-0 z-20 bg-background/90 backdrop-blur-xl border-b border-border/40 px-6 py-5 flex items-center justify-between gap-4 shrink-0">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Focus mode</span>
                      <h2 className="text-2xl font-bold tracking-tight text-foreground leading-tight">{focusNote.title}</h2>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <button
                        type="button"
                        onClick={handleToggleFocusChecklist}
                        className={cn(
                          "inline-flex shrink-0 items-center gap-2 rounded-full border border-border/60 px-4 py-2 text-xs font-semibold transition-all duration-300",
                          focusShowChecklist ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-background/60 text-muted-foreground hover:bg-background/80"
                        )}
                      >
                        <ListChecks className="h-4 w-4" />
                        <span>{focusShowChecklist ? "Visualizar Texto" : "Visualizar Checklist"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFocusedNoteId(null)}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all duration-300"
                        title="Fechar nota"
                      >
                        <CloseIcon className="h-5 w-5" strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 px-8 py-8 overflow-y-auto no-scrollbar">
                    {focusShowChecklist && focusChecklist.length > 0 ? (
                      <ul className="space-y-0">
                        {focusChecklist.map((item) => (
                          <li key={item.id} className="group flex items-start gap-4 border-b border-border/20 py-5 transition-all duration-300 last:border-0">
                            <button
                              type="button"
                              onClick={() => handleToggleFocusItem(item.id)}
                              className={cn(
                                "mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition-all duration-300",
                                item.done
                                  ? "border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                                  : "border-border/60 bg-background/40 group-hover:border-primary/50",
                              )}
                            >
                              {item.done && <Check className="h-4 w-4" strokeWidth={3} />}
                            </button>
                            <p className={cn(
                              "text-[16px] leading-[1.6] transition-all duration-300 flex-1 py-0.5",
                              item.done ? "line-through text-muted-foreground/40 italic" : "text-foreground font-medium"
                            )}>
                              {item.text}
                            </p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-[17px] leading-[1.8] text-muted-foreground/90 whitespace-pre-line font-medium max-w-none">{focusNote.body}</p>
                    )}
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>

          {/* Edit Note Modal */}
          <Dialog open={!!editingNote} onOpenChange={() => setEditingNote(null)}>
            <DialogContent className="glass-card aura-card border border-border/60 bg-background/90 max-w-lg p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Editar Nota</h3>
                  <p className="text-sm text-muted-foreground">Faça as alterações desejadas e salve.</p>
                </div>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label htmlFor="edit-title" className="text-xs font-medium text-muted-foreground">Título</label>
                    <Input
                      id="edit-title"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="bg-card/70 border-border/60"
                      placeholder="Título da nota"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="edit-body" className="text-xs font-medium text-muted-foreground">Conteúdo</label>
                    <Textarea
                      id="edit-body"
                      value={editBody}
                      onChange={(e) => setEditBody(e.target.value)}
                      className="min-h-[150px] bg-card/70 border-border/60 resize-none"
                      placeholder="Conteúdo da nota"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setEditingNote(null)}
                    className="border-border/60"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSaveNote}
                    disabled={updateNoteMutation.isPending}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {updateNoteMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      "Salvar"
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Modal */}
          <Dialog open={deleteConfirmId !== null} onOpenChange={() => setDeleteConfirmId(null)}>
            <DialogContent className="glass-card aura-card border border-border/60 bg-background/90 max-w-sm p-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-500/10 text-rose-500">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold">Excluir Nota</h3>
                    <p className="text-sm text-muted-foreground">
                      Tem certeza que deseja excluir esta nota? Esta ação não pode ser desfeita.
                    </p>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setDeleteConfirmId(null)}
                    className="border-border/60"
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={confirmDeleteNote}
                    disabled={deleteNoteMutation.isPending}
                    className="bg-rose-500 hover:bg-rose-600"
                  >
                    {deleteNoteMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Excluindo...
                      </>
                    ) : (
                      "Excluir"
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </motion.main>
      )}
    </div>
  );
};

export { Index };

const WhatsAppLogin = ({ onLogin }: { onLogin: (cliente: Cliente) => void }) => {
  const [step, setStep] = useState<"phone" | "code" | "loading" | "install">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [pendingCliente, setPendingCliente] = useState<Cliente | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installing, setInstalling] = useState(false);

  // Detect if already running as installed PWA
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true;

  // Detect iOS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

  // Capture the beforeinstallprompt event (Android/Chrome)
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleRequestCode = async () => {
    setError("");
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length < 9) {
      setError("Número inválido");
      return;
    }
    setStep("loading");
    try {
      const result = await requestCode(cleaned);
      if (result.success) {
        setStep("code");
      } else {
        setError(result.error === "not_found" ? "Número não registrado" : "Erro ao enviar código");
        setStep("phone");
      }
    } catch {
      setError("Erro de conexão");
      setStep("phone");
    }
  };

  const handleValidateCode = async () => {
    setError("");
    const cleaned = phone.replace(/\D/g, "");
    setStep("loading");
    try {
      const result = await validateCode(cleaned, code);
      if (result.success && result.cliente) {
        storeCliente(result.cliente);
        // If already installed as PWA, skip install step
        if (isStandalone) {
          onLogin(result.cliente);
        } else {
          setPendingCliente(result.cliente);
          setStep("install");
        }
      } else {
        setError(result.error === "invalid_code" ? "Código inválido ou expirado" : "Erro ao validar");
        setStep("code");
      }
    } catch {
      setError("Erro de conexão");
      setStep("code");
    }
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      setInstalling(true);
      try {
        deferredPrompt.prompt();
        const result = await deferredPrompt.userChoice;
        setDeferredPrompt(null);
        if (result.outcome === "accepted") {
          // Small delay so the PWA transition feels smooth
          setTimeout(() => {
            if (pendingCliente) onLogin(pendingCliente);
          }, 800);
          return;
        }
      } catch {
        // prompt failed, continue to dashboard
      }
      setInstalling(false);
    }
    // If no prompt available or user dismissed, continue anyway
    if (pendingCliente) onLogin(pendingCliente);
  };

  const handleSkipInstall = () => {
    if (pendingCliente) onLogin(pendingCliente);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      <div className="absolute inset-x-0 top-10 flex justify-center">
        <div className="rounded-full border border-border/60 bg-card/60 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground backdrop-blur-md shadow-sm">
          Vectra Finance
        </div>
      </div>

      <motion.div
        className="glass-card relative z-10 flex w-full max-w-md flex-col gap-6 rounded-3xl px-6 py-7 md:px-8 md:py-8"
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        key={step}
      >
        {step === "install" ? (
          <>
            <div className="space-y-1 text-center">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                <Download className="h-8 w-8" />
              </div>
              <h1 className="text-2xl font-semibold tracking-tight">Instalar Vectra</h1>
              <p className="text-sm text-muted-foreground">
                Instale o app no seu telemóvel para acesso rápido e experiência completa
              </p>
            </div>

            <div className="space-y-3">
              {isIOS ? (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-border/60 bg-card/50 p-4 space-y-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-primary">Como instalar no iPhone</p>
                    <div className="space-y-2.5">
                      <div className="flex items-start gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">1</span>
                        <p className="text-sm text-muted-foreground">Toque no ícone <span className="inline-flex items-center gap-1 font-medium text-foreground">Partilhar <ArrowUpRight className="inline h-3.5 w-3.5" /></span> na barra do Safari</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">2</span>
                        <p className="text-sm text-muted-foreground">Selecione <span className="font-medium text-foreground">"Adicionar ao Ecrã principal"</span></p>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">3</span>
                        <p className="text-sm text-muted-foreground">Toque <span className="font-medium text-foreground">"Adicionar"</span> para confirmar</p>
                      </div>
                    </div>
                  </div>
                  <motion.button
                    type="button"
                    onClick={handleSkipInstall}
                    className="w-full rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    whileTap={{ scale: 0.97 }}
                  >
                    Já instalei, continuar
                  </motion.button>
                </div>
              ) : (
                <div className="space-y-3">
                  <motion.button
                    type="button"
                    onClick={handleInstallClick}
                    disabled={installing}
                    className="w-full rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-70 flex items-center justify-center gap-2"
                    whileTap={{ scale: 0.97 }}
                  >
                    {installing ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        Instalar aplicação
                      </>
                    )}
                  </motion.button>

                  {!deferredPrompt && (
                    <div className="rounded-2xl border border-border/60 bg-card/50 p-4 space-y-3">
                      <p className="text-xs font-bold uppercase tracking-wider text-primary">Instalação manual</p>
                      <div className="space-y-2.5">
                        <div className="flex items-start gap-3">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">1</span>
                          <p className="text-sm text-muted-foreground">Toque no menu <span className="font-medium text-foreground">(3 pontos)</span> do navegador</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">2</span>
                          <p className="text-sm text-muted-foreground">Selecione <span className="font-medium text-foreground">"Instalar aplicação"</span> ou <span className="font-medium text-foreground">"Adicionar ao ecrã inicial"</span></p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={handleSkipInstall}
                className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors pt-1"
              >
                Continuar sem instalar
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-1 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">Bem-vindo à Vectra</h1>
              <p className="text-sm text-muted-foreground">
                {step === "code"
                  ? "Digite o código enviado ao seu WhatsApp"
                  : "Insira o seu número de WhatsApp para entrar"}
              </p>
            </div>

            {error && (
              <motion.div
                className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-center text-sm text-rose-300"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {error}
              </motion.div>
            )}

            {step === "loading" ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : step === "phone" ? (
              <div className="flex flex-col gap-4">
                <input
                  type="tel"
                  placeholder="351XXXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-border/70 bg-card/80 px-4 py-3 text-center text-lg tracking-widest backdrop-blur-md placeholder:text-muted-foreground/50 focus:border-primary/70 focus:outline-none"
                  autoFocus
                />
                <motion.button
                  type="button"
                  onClick={handleRequestCode}
                  className="rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  whileTap={{ scale: 0.97 }}
                >
                  Enviar código por WhatsApp
                </motion.button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="0000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  className="w-full rounded-xl border border-border/70 bg-card/80 px-4 py-3 text-center text-2xl font-bold tracking-[0.5em] backdrop-blur-md placeholder:text-muted-foreground/50 focus:border-primary/70 focus:outline-none"
                  autoFocus
                />
                <motion.button
                  type="button"
                  onClick={handleValidateCode}
                  disabled={code.length < 4}
                  className="rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                  whileTap={{ scale: 0.97 }}
                >
                  Verificar
                </motion.button>
                <button
                  type="button"
                  onClick={() => { setStep("phone"); setCode(""); setError(""); }}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Usar outro número
                </button>
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
};

const FinanceTab = ({
  privacyOn,
  transactions,
  currentDate,
  onDateChange,
  cumulativeBalance
}: {
  privacyOn: boolean;
  transactions: TransactionRecord[];
  currentDate: Date;
  onDateChange: (date: Date) => void;
  cumulativeBalance: number;
}) => {
  const [evolutionFilter, setEvolutionFilter] = useState<"6m" | "month">("6m");
  const evolutionData = evolutionFilter === "6m" ? financeEvolution : financeEvolutionThisMonth;
  const evolutionXKey = evolutionFilter === "6m" ? "month" : "day";

  // Aggregate metrics based on the mapped transactions (expenses already negative)
  // totalBalance removed in favor of cumulativeBalance passed from parent
  const totalIncome = transactions.filter((tx) => tx.amount > 0).reduce((sum, tx) => sum + tx.amount, 0);
  const totalExpense = transactions.filter((tx) => tx.amount < 0).reduce((sum, tx) => sum + tx.amount, 0);


  const formatCurrency = (value: number) => (privacyOn ? "•••••" : currencyFormatter.format(value));

  // AI Analysis State
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiPeriod, setAiPeriod] = useState<"30d" | "3m" | "12m">("30d");
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleGenerateAiInsights = async () => {
    setAiLoading(true);
    setAiError(null);
    setAiResult(null);

    try {
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      if (aiPeriod === "30d") startDate.setDate(endDate.getDate() - 30);
      else if (aiPeriod === "3m") startDate.setMonth(endDate.getMonth() - 3);
      else if (aiPeriod === "12m") startDate.setFullYear(endDate.getFullYear() - 1);

      // Fetch transactions if needed (reuse existing if they match)
      const periodTransactions = transactions.filter((tx) => {
        const txDate = new Date(tx.date);
        return txDate >= startDate && txDate <= endDate;
      });

      // Build payload
      const payload = {
        transactions: periodTransactions,
        period: {
          start: startDate.toISOString().split("T")[0],
          end: endDate.toISOString().split("T")[0],
        },
        userQuestion: aiQuestion.trim() || undefined,
      };

      const { data, error } = await supabase.functions.invoke("finance-insights", {
        body: payload,
      });

      if (error) throw error;

      if (data?.error) {
        setAiError(data.error);
        toast({
          title: "Erro ao gerar análise",
          description: data.error,
          variant: "destructive",
        });
      } else {
        setAiResult(data.insightsText || "Análise gerada com sucesso.");
        toast({
          title: "Análise concluída",
          description: "A IA analisou seus gastos e gerou insights.",
        });
      }
    } catch (err: any) {
      console.error("Error generating AI insights:", err);
      const errorMsg = err.message || "Erro desconhecido ao chamar a função de análise.";
      setAiError(errorMsg);
      toast({
        title: "Erro",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <section className="space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="tag-pill bg-gradient-to-r from-[hsl(var(--finance-gradient-start))]/20 to-[hsl(var(--finance-gradient-end))]/20 text-xs text-primary font-bold">
              Finanças
            </span>
            <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider hidden md:inline">Visão geral</span>
          </div>

          <button
            onClick={() => setAiDialogOpen(true)}
            className="group relative flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary transition-all hover:bg-primary/20 hover:border-primary/50 shrink-0"
          >
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            <span>Consultar IA</span>
            <div className="absolute -inset-[1px] -z-10 rounded-full bg-gradient-to-r from-primary/40 to-accent/40 opacity-0 blur-sm transition-opacity group-hover:opacity-100" />
          </button>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-1 bg-card/40 rounded-full border border-border/40 p-0.5">
            <button
              onClick={() => {
                const prev = new Date(currentDate);
                prev.setMonth(prev.getMonth() - 1);
                onDateChange(prev);
              }}
              className="p-1.5 hover:bg-white/5 rounded-full text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs font-medium px-3 min-w-[110px] text-center capitalize">
              {currentDate.toLocaleString("pt-BR", { month: "long", year: "numeric" })}
            </span>
            <button
              onClick={() => {
                const next = new Date(currentDate);
                next.setMonth(next.getMonth() + 1);
                onDateChange(next);
              }}
              className="p-1.5 hover:bg-white/5 rounded-full text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>



      {/* AI Analysis Dialog */}
      <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
        <DialogContent className="glass-card aura-card max-w-2xl border-border/40 bg-background/95 p-0 overflow-hidden">
          <div className="flex flex-col max-h-[85vh]">
            <div className="bg-gradient-to-r from-primary/10 via-accent/5 to-transparent px-6 py-6 border-b border-border/40">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-foreground">Agente Estrategista</h2>
                  <p className="text-sm text-muted-foreground">Inteligência aplicada às suas finanças</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary/80">
                  <div className="h-1 w-1 rounded-full bg-primary" />
                  Configurações do Agente
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Janela Temporal</label>
                    <Select value={aiPeriod} onValueChange={(v: any) => setAiPeriod(v)}>
                      <SelectTrigger className="h-11 rounded-xl border-border/60 bg-card/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-border/60 bg-background/95 backdrop-blur-xl">
                        <SelectItem value="30d">Últimos 30 dias</SelectItem>
                        <SelectItem value="3m">Últimos 3 meses</SelectItem>
                        <SelectItem value="12m">Últimos 12 meses</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Objetivo da IA</label>
                    <div className="flex h-11 items-center rounded-xl border border-border/60 bg-card/50 px-3 text-xs text-foreground/80 font-medium italic">
                      Analista Financeiro Estratégico
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary/80">
                  <div className="h-1 w-1 rounded-full bg-primary" />
                  Sugestões de Consulta
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Como está meu consumo semanal?",
                    "Qual a evolução das minhas despesas?",
                    "Onde posso economizar este mês?",
                    "Análise rápida dos maiores gastos",
                  ].map((sug) => (
                    <button
                      key={sug}
                      onClick={() => setAiQuestion(sug)}
                      className="rounded-full border border-border/40 bg-card/30 px-3 py-1.5 text-[11px] font-medium text-muted-foreground/90 transition-all hover:bg-primary/10 hover:border-primary/30 hover:text-primary"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary/80">
                  <div className="h-1 w-1 rounded-full bg-primary" />
                  Sua Pergunta
                </div>
                <div className="relative group">
                  <Textarea
                    value={aiQuestion}
                    onChange={(e) => setAiQuestion(e.target.value)}
                    placeholder="Ex: Como andam minhas finanças de forma geral?"
                    className="min-h-[100px] rounded-2xl border-border/60 bg-card/50 px-4 py-3 text-sm focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50"
                  />
                  <div className="absolute right-3 bottom-3">
                    <Button
                      onClick={handleGenerateAiInsights}
                      disabled={aiLoading}
                      size="sm"
                      className="rounded-xl bg-primary px-4 font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-transform active:scale-95"
                    >
                      {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enviar"}
                    </Button>
                  </div>
                </div>
              </div>

              {(aiLoading || aiResult || aiError) && (
                <div className="pt-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  {aiLoading ? (
                    <div className="rounded-2xl border border-border/40 bg-card/30 p-8 flex flex-col items-center justify-center text-center gap-4">
                      <div className="relative">
                        <div className="h-12 w-12 rounded-full border-t-2 border-primary animate-spin" />
                        <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 text-primary animate-pulse" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-foreground">Processando inteligência...</p>
                        <p className="text-[11px] text-muted-foreground italic">O estrategista está revisando suas transações.</p>
                      </div>
                    </div>
                  ) : aiError ? (
                    <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 flex items-center gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-500/20 text-rose-400">
                        <AlertCircle className="h-5 w-5" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-sm font-bold text-rose-400">Falha no processamento</p>
                        <p className="text-xs text-rose-400/80">{aiError}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 shadow-2xl shadow-primary/5">
                      <div className="flex items-center justify-between mb-4 border-b border-primary/10 pb-3">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-primary" />
                          <p className="text-xs font-black uppercase tracking-widest text-primary">Relatório de Insights</p>
                        </div>
                        <span className="text-[10px] text-muted-foreground/60 font-mono">Gerado agora</span>
                      </div>
                      <div className="prose prose-sm prose-invert max-w-none">
                        <div className="text-[14px] leading-relaxed text-foreground/90 font-medium whitespace-pre-wrap selection:bg-primary/30">
                          {aiResult}
                        </div>
                      </div>
                      <div className="mt-6 flex justify-end">
                        <button
                          onClick={() => setAiResult(null)}
                          className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
                        >
                          Limpar resultado
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-card/30 border-t border-border/40 text-[10px] text-muted-foreground/60 text-center uppercase tracking-widest italic font-medium">
              Powered by Dashboard Deep Space AI Agent
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {/* Saldo card */}
        <motion.div
          className="glass-card aura-card rounded-2xl p-4"
          variants={cardHover}
          initial="rest"
          whileHover="hover"
        >
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs text-muted-foreground">Saldo atual</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight">
                <span className="bg-gradient-to-r from-[hsl(var(--finance-gradient-start))] to-[hsl(var(--finance-gradient-end))] bg-clip-text text-transparent">
                  {formatCurrency(cumulativeBalance)}
                </span>
              </p>
            </div>
            <div className="flex flex-col items-end text-xs text-emerald-400/90">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium">
                <ArrowUpRight className="h-3 w-3" />
                +12,4% este mês
              </span>
              <span className="mt-1 text-[10px] text-muted-foreground">Em relação ao mês passado</span>
            </div>
          </div>
        </motion.div>

        {/* Receitas vs despesas */}
        <motion.div
          className="glass-card aura-card rounded-2xl p-4"
          variants={cardHover}
          initial="rest"
          whileHover="hover"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-1 flex-1">
              <p className="text-xs text-muted-foreground">Receitas vs despesas</p>
              <div className="flex items-baseline gap-2 text-xs">
                <span className="inline-flex items-center gap-1 text-emerald-500">
                  <ArrowDownRight className="h-3 w-3" />
                  {formatCurrency(
                    transactions.filter((tx) => tx.amount > 0).reduce((sum, tx) => sum + tx.amount, 0),
                  )}
                </span>
                <span className="inline-flex items-center gap-1 text-rose-500">
                  <ArrowUpRight className="h-3 w-3" />
                  {formatCurrency(
                    Math.abs(
                      transactions.filter((tx) => tx.amount < 0).reduce((sum, tx) => sum + tx.amount, 0),
                    ),
                  )}
                </span>
              </div>
              <div className="mt-2 space-y-1">
                <div className="h-1.5 overflow-hidden rounded-full bg-muted/60">
                  <div className="h-full w-[66%] rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500" />
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted/60">
                  <div className="h-full w-[42%] rounded-full bg-gradient-to-r from-rose-500 to-rose-400" />
                </div>
              </div>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400">
              <PiggyBank className="h-4 w-4" />
            </div>
          </div>
        </motion.div>

        {/* Taxa de economia */}
        <motion.div
          className="glass-card aura-card rounded-2xl p-4"
          variants={cardHover}
          initial="rest"
          whileHover="hover"
        >
          <p className="text-xs text-muted-foreground mb-3">Taxa de economia</p>
          <div className="flex items-center gap-4">
            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
              <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="28" fill="none" stroke="hsl(222 30% 18%)" strokeWidth="5" />
                <circle
                  cx="32" cy="32" r="28"
                  fill="none"
                  stroke="url(#savingsGrad)"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={`${0.36 * 2 * Math.PI * 28} ${2 * Math.PI * 28}`}
                />
                <defs>
                  <linearGradient id="savingsGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="hsl(155 78% 55%)" />
                    <stop offset="100%" stopColor="hsl(222 88% 64%)" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="absolute text-base font-bold text-foreground">36%</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Você está acima de <span className="text-emerald-400 font-semibold">82%</span> dos usuários com o mesmo perfil de renda.
            </p>
          </div>
        </motion.div>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)]">
        <motion.div className="glass-card aura-card rounded-2xl p-4" variants={cardHover} initial="rest" whileHover="hover">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Evolução</p>
            <div className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-card/70 p-1 text-[10px]">
              <button
                type="button"
                onClick={() => setEvolutionFilter("6m")}
                className={cn(
                  "rounded-full px-2 py-0.5 transition-colors",
                  evolutionFilter === "6m" ? "bg-primary/20 text-primary" : "text-muted-foreground",
                )}
              >
                6M
              </button>
              <button
                type="button"
                onClick={() => setEvolutionFilter("month")}
                className={cn(
                  "rounded-full px-2 py-0.5 transition-colors",
                  evolutionFilter === "month" ? "bg-primary/20 text-primary" : "text-muted-foreground",
                )}
              >
                Este mês
              </button>
            </div>
          </div>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={evolutionData} margin={{ left: -20, right: 0, top: 5, bottom: 0 }}>
                <defs>
                  <linearGradient id="financeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(222 88% 64%)" stopOpacity={0.9} />
                    <stop offset="80%" stopColor="hsl(155 78% 55%)" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 30% 18%)" vertical={false} />
                <XAxis dataKey={evolutionXKey} stroke="hsl(214 20% 70%)" tickLine={false} axisLine={false} fontSize={10} />
                <YAxis stroke="hsl(214 20% 70%)" tickLine={false} axisLine={false} fontSize={10} width={40} />
                <RechartsTooltip
                  contentStyle={{
                    background: "hsl(222 47% 11%)",
                    borderRadius: 12,
                    border: "1px solid hsl(222 35% 22%)",
                    fontSize: 11,
                  }}
                  labelStyle={{ color: "hsl(214 20% 70%)" }}
                  itemStyle={{ color: "white" }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(222 88% 64%)"
                  strokeWidth={2}
                  fill="url(#financeGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div className="glass-card aura-card rounded-2xl p-4" variants={cardHover} initial="rest" whileHover="hover">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Categorias</p>
            <span className="text-[11px] text-muted-foreground">Radar mensal</span>
          </div>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={financeCategories} outerRadius="80%">
                <PolarGrid stroke="hsl(222 30% 18%)" radialLines={false} />
                <PolarAngleAxis dataKey="category" tick={{ fill: "hsl(214 20% 70%)", fontSize: 9 }} />
                <Radar
                  dataKey="value"
                  stroke="hsl(276 84% 70%)"
                  fill="hsl(276 84% 70%)"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Movimentações recentes</p>
          <button className="text-[11px] text-muted-foreground hover:text-foreground">Ver tudo</button>
        </div>
        <div className="space-y-3 overflow-y-auto no-scrollbar max-h-[450px] pr-2">
          {transactions.map((tx) => {
            const Icon = getCategoryIcon(tx.category);
            const isNegative = tx.amount < 0;
            const dateLabel = new Date(tx.date).toLocaleDateString("pt-PT", {
              day: "2-digit",
              month: "2-digit",
            });
            return (
              <motion.div
                key={tx.id}
                className="glass-card aura-card flex items-center justify-between rounded-2xl px-3 py-2.5"
                variants={cardHover}
                initial="rest"
                whileHover="hover"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium">{tx.title}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {dateLabel} · Categoria: {tx.category}
                    </p>
                  </div>
                </div>
                <div className="text-right text-xs">
                  <p className={cn("font-medium", isNegative ? "text-rose-500" : "text-emerald-500")}>
                    {privacyOn
                      ? "•••••"
                      : `${isNegative ? "-" : "+"} ${currencyFormatter.format(Math.abs(tx.amount))}`}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>
    </section>
  );
};

interface NotesTabProps {
  notes: NoteRecord[];
  query: string;
  onQueryChange: (v: string) => void;
  onOpenNote: (id: number) => void;
  onEditNote: (note: NoteRecord) => void;
  onDeleteNote: (id: number) => void;
}

interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

const buildChecklistFromText = (rawBody: string | null): ChecklistItem[] => {
  if (!rawBody) return [];

  const lines = rawBody
    .replace(/\r/g, "")
    .split("\n")
    .map((line) =>
      line
        .replace(/^[-•–]\s+/, "")
        .trim(),
    )
    .filter((line) => line.length > 0 && line.length > 3);

  return lines.map((text, index) => ({
    id: `${Date.now()}-${index}`,
    text,
    done: false,
  }));
};

const NotesTab = ({ notes, query, onQueryChange, onOpenNote, onEditNote, onDeleteNote }: NotesTabProps) => {
  const [checklistsByNote, setChecklistsByNote] = useState<Record<number, ChecklistItem[]>>({});

  const toggleChecklist = (note: NoteRecord, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }

    setChecklistsByNote((prev) => {
      const current = prev[note.id];
      if (!current || current.length === 0) {
        const items = buildChecklistFromText(note.body ?? null);
        return { ...prev, [note.id]: items };
      }
      return { ...prev, [note.id]: [] };
    });
  };

  const toggleItemDone = (noteId: number, itemId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setChecklistsByNote((prev) => ({
      ...prev,
      [noteId]: prev[noteId].map((item) =>
        item.id === itemId ? { ...item, done: !item.done } : item,
      ),
    }));
  };

  return (
    <section className="space-y-3">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <span className="tag-pill bg-[hsl(var(--notes-accent))]/15 text-xs">Notas</span>
          <span className="text-[11px] text-muted-foreground">Mural de ideias e rascunhos</span>
        </div>
        <div className="w-full max-w-xs">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Buscar por título ou conteúdo"
              className="h-8 rounded-full border-border/70 bg-card/70 pl-8 text-xs placeholder:text-muted-foreground/70"
            />
          </div>
        </div>
      </div>

      {notes.length === 0 ? (
        <div className="glass-card aura-card flex flex-col items-center justify-center gap-1 rounded-2xl p-5 text-center">
          <p className="text-xs font-medium">Nenhuma nota para este usuário ainda.</p>
          <p className="text-[11px] text-muted-foreground">
            Quando você conectar sua base, apenas notas do usuário logado aparecerão aqui.
          </p>
        </div>
      ) : (
        <div className="columns-1 md:columns-2 gap-4 [column-fill:_balance]">
          {notes.map((note) => {
            const createdAt = new Date(note.date);
            const now = new Date();
            const diffMs = now.getTime() - createdAt.getTime();
            const diffHours = diffMs / (1000 * 60 * 60);
            const dateLabel = diffHours < 24
              ? `${Math.max(1, Math.round(diffHours))}h ago`
              : createdAt.toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit" });

            const checklist = checklistsByNote[note.id] ?? [];
            const hasChecklist = checklist.length > 0;

            return (
              <motion.button
                key={note.id}
                type="button"
                onClick={() => onOpenNote(note.id)}
                className="relative mb-4 w-full break-inside-avoid rounded-xl border border-white/10 bg-[hsl(var(--card))/0.7] px-4 py-3 text-left text-xs shadow-lg backdrop-blur-md hover-scale"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-start justify-between gap-4">
                  <h3 className="line-clamp-4 flex-1 text-[15px] font-bold leading-normal text-foreground/90">{note.title}</h3>
                  <button
                    type="button"
                    onClick={(event) => toggleChecklist(note, event)}
                    className={cn(
                      "inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border/60 bg-background/40 px-2.5 py-1 text-[10px] font-medium transition-all duration-300",
                      hasChecklist ? "border-primary/50 bg-primary/10 text-primary shadow-[0_0_10px_rgba(var(--primary),0.2)]" : "text-muted-foreground hover:bg-background/80"
                    )}
                  >
                    <ListChecks className="h-3 w-3" />
                    <span>{hasChecklist ? "Texto" : "Checklist"}</span>
                  </button>
                </div>

                {hasChecklist ? (
                  <ul className="mt-4 space-y-0">
                    {checklist.map((item) => (
                      <li key={item.id} className="group flex items-start gap-2.5 border-b border-border/10 py-2.5 last:border-0">
                        <button
                          type="button"
                          onClick={(event) => toggleItemDone(note.id, item.id, event)}
                          className={cn(
                            "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-[6px] border border-border/70 bg-background/40 transition-all duration-300",
                            item.done ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400" : "group-hover:border-primary/40",
                          )}
                        >
                          {item.done && <Check className="h-3 w-3" />}
                        </button>
                        <p className={cn(
                          "text-[12px] leading-relaxed transition-colors duration-300",
                          item.done ? "line-through text-muted-foreground/50 italic" : "text-muted-foreground font-medium"
                        )}>
                          {item.text}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2.5 line-clamp-3 text-[12px] leading-relaxed text-muted-foreground/80 font-medium">{note.body}</p>
                )}

                <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground/80">
                  <span className="rounded-full bg-[hsl(var(--notes-accent))/0.12] px-2 py-0.5 text-[10px] font-medium text-[hsl(var(--notes-accent))]">
                    Nota
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditNote(note);
                      }}
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/10 text-blue-400 transition-colors hover:bg-blue-500/20"
                      title="Editar nota"
                    >
                      <Edit3 className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteNote(note.id);
                      }}
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-500/10 text-rose-400 transition-colors hover:bg-rose-500/20"
                      title="Excluir nota"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                    <span>{dateLabel}</span>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      )}
    </section>
  );
};

const RemindersTab = ({
  reminders,
  onCompleteReminder,
  onDeleteReminders
}: {
  reminders: ReminderRecord[];
  onCompleteReminder: (id: number) => void;
  onDeleteReminders: (ids: number[]) => void;
}) => {
  const items = reminders;
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const handleComplete = (id: number) => {
    if (selectionMode) return;
    onCompleteReminder(id);
  };

  const toggleSelection = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const executeDelete = () => {
    if (selectedIds.length === 0) return;
    onDeleteReminders(selectedIds);
    setSelectionMode(false);
    setSelectedIds([]);
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="tag-pill bg-[hsl(var(--reminders-accent))]/20 text-xs">Lembretes</span>
          <span className="text-[11px] text-muted-foreground">Lista de tarefas do dia</span>
        </div>
        <button
          onClick={() => {
            setSelectionMode(!selectionMode);
            setSelectedIds([]);
          }}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
            selectionMode
              ? "bg-rose-500/10 text-rose-500 hover:bg-rose-500/20"
              : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
          )}
          title={selectionMode ? "Cancelar seleção" : "Excluir lembretes"}
        >
          {selectionMode ? <CloseIcon className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
        </button>
      </div>

      {items.length === 0 ? (
        <div className="glass-card aura-card flex flex-col items-center justify-center gap-1 rounded-2xl p-5 text-center">
          <p className="text-xs font-medium">Nenhum lembrete para este usuário.</p>
          <p className="text-[11px] text-muted-foreground">
            Quando conectar sua base, apenas lembretes do usuário logado serão exibidos.
          </p>
        </div>
      ) : (
        <div className="flex flex-col space-y-3">
          {items.map((rem) => {
            const isSelected = selectedIds.includes(rem.id);
            return (
              <div
                key={rem.id}
                className={cn(
                  "group flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4 text-xs shadow-sm backdrop-blur-md transition-all hover:bg-white/10",
                  selectionMode && "cursor-pointer",
                  isSelected && "border-rose-500/30 bg-rose-500/5"
                )}
                onClick={() => selectionMode && toggleSelection(rem.id)}
              >
                <div className="flex items-center gap-4">
                  {/* Selection Checkbox or Status */}
                  {selectionMode ? (
                    <div className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-md border-2 transition-all",
                      isSelected ? "border-rose-500 bg-rose-500 text-white" : "border-muted-foreground/40 bg-transparent"
                    )}>
                      {isSelected && <Check size={14} strokeWidth={3} />}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleComplete(rem.id);
                      }}
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all",
                        rem.status === "done"
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : "border-[hsl(var(--reminders-accent))] text-transparent hover:bg-[hsl(var(--reminders-accent))/0.1]",
                      )}
                    >
                      {rem.status === "done" && <Check size={14} strokeWidth={3} />}
                    </button>
                  )}

                  {/* Text Content */}
                  <div className="flex flex-col">
                    <span
                      className={cn(
                        "text-sm font-medium transition-colors",
                        rem.status === "done" && !selectionMode ? "text-white/30 line-through" : "text-foreground",
                        isSelected && "text-rose-200"
                      )}
                    >
                      {rem.title}
                    </span>
                    {rem.timeLabel && (
                      <span className={cn(
                        "text-[11px] font-bold",
                        isSelected ? "text-rose-300/70" : "text-[hsl(var(--reminders-accent))]"
                      )}>
                        {rem.timeLabel}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bulk Delete Action Bar */}
      {selectionMode && selectedIds.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 glass-card px-6 py-3 rounded-full border border-rose-500/20 bg-background/80 shadow-2xl flex items-center gap-4"
        >
          <span className="text-xs font-medium">{selectedIds.length} selecionado(s)</span>
          <div className="h-4 w-px bg-border/60" />
          <button
            onClick={executeDelete}
            className="text-xs font-bold text-rose-500 hover:text-rose-400 flex items-center gap-2"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Excluir
          </button>
        </motion.div>
      )}
    </section>
  );
};

interface CalendarTabProps {
  selectedDay: Date | undefined;
  onSelectDay: (date: Date | undefined) => void;
  privacyOn: boolean;
  viewDate: Date;
  onChangeViewDate: (date: Date) => void;
  transactions: TransactionRecord[];
  reminders: ReminderRecord[];
  notes: NoteRecord[];
  onCompleteReminder: (id: number) => void;
}

const CalendarTab = ({
  selectedDay,
  onSelectDay,
  privacyOn,
  viewDate,
  onChangeViewDate,
  transactions,
  reminders,
  notes,
  onCompleteReminder,
}: CalendarTabProps) => {
  const effectiveDay = selectedDay ?? new Date();
  const selectedKey = getDateKey(effectiveDay);

  const groupedDays = useMemo(() => {
    const map = new Map<
      string,
      {
        date: Date;
        transactions: TransactionRecord[];
        reminders: ReminderRecord[];
        notes: NoteRecord[];
      }
    >();

    transactions.forEach((tx) => {
      let entry = map.get(tx.date);
      if (!entry) {
        entry = { date: new Date(tx.date), transactions: [], reminders: [], notes: [] };
        map.set(tx.date, entry);
      }
      entry.transactions.push(tx);
    });

    reminders.forEach((reminder) => {
      let entry = map.get(reminder.date);
      if (!entry) {
        entry = { date: new Date(reminder.date), transactions: [], reminders: [], notes: [] };
        map.set(reminder.date, entry);
      }
      entry.reminders.push(reminder);
    });

    notes.forEach((note) => {
      let entry = map.get(note.date);
      if (!entry) {
        entry = { date: new Date(note.date), transactions: [], reminders: [], notes: [] };
        map.set(note.date, entry);
      }
      entry.notes.push(note);
    });

    const daysArray = Array.from(map.entries())
      .map(([dateKey, value]) => ({ key: dateKey, ...value }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    return daysArray;
  }, [transactions, reminders, notes]);

  const formatDayLabel = (date: Date) =>
    date.toLocaleDateString("pt-PT", {
      weekday: "short",
    });

  const formatFullDate = (date: Date) =>
    date.toLocaleDateString("pt-PT", {
      weekday: "long",
      day: "2-digit",
      month: "short",
    });

  const handleJumpToDay = (key: string, date: Date) => {
    onSelectDay(date);
    const el = document.getElementById(`day-${key}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const weekStripDays = groupedDays.slice(0, 7);

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="tag-pill bg-[hsl(var(--finance-gradient-start))]/15 text-xs">Calendário</span>
          <span className="text-[11px] text-muted-foreground">Linha do tempo conectada</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <button
            type="button"
            onClick={() => {
              const prev = new Date(viewDate);
              prev.setMonth(prev.getMonth() - 1);
              onChangeViewDate(prev);
            }}
            className="rounded-full border border-border/60 px-2 py-0.5 hover:bg-card/70"
          >
            
          </button>
          <span className="min-w-[96px] text-center">
            {viewDate.toLocaleDateString("pt-PT", { month: "long", year: "numeric" })}
          </span>
          <button
            type="button"
            onClick={() => {
              const next = new Date(viewDate);
              next.setMonth(next.getMonth() + 1);
              onChangeViewDate(next);
            }}
            className="rounded-full border border-border/60 px-2 py-0.5 hover:bg-card/70"
          >
            
          </button>
        </div>
      </div>

      {/* Week strip */}
      {weekStripDays.length > 0 && (
        <div className="glass-card aura-card rounded-2xl px-3 py-2.5">
          <div className="flex items-center justify-between gap-1">
            {weekStripDays.map((day) => {
              const key = day.key;
              const isActive = key === selectedKey;
              const label = day.date.toLocaleDateString("pt-PT", { weekday: "short" });
              const num = day.date.getDate();
              const isToday = key === getDateKey(new Date());

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleJumpToDay(key, day.date)}
                  className={cn(
                    "flex flex-1 flex-col items-center gap-0.5 rounded-2xl px-1.5 py-1 text-[10px] transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <span className="uppercase tracking-[0.18em]">{label}</span>
                  <span
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full border text-xs",
                      isActive
                        ? "border-[hsl(var(--accent))] bg-[hsl(var(--accent))]/20 shadow-[0_0_18px_hsl(var(--accent)/0.7)]"
                        : "border-border/60 bg-card/60",
                    )}
                  >
                    {num}
                  </span>
                  {isToday && (
                    <span className="mt-0.5 rounded-full bg-[hsl(var(--accent))]/20 px-1.5 py-0.5 text-[9px] text-[hsl(var(--accent))]">
                      Hoje
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Connected vertical timeline */}
      <div className="glass-card aura-card aura-strong max-h-[520px] overflow-y-auto rounded-2xl p-3 no-scrollbar">
        <div className="relative pl-6">
          <div className="pointer-events-none absolute left-6 top-0 bottom-0 w-px bg-border/70" />

          <div className="space-y-4">
            {groupedDays.map((day) => {
              const key = day.key;
              const isToday = key === getDateKey(new Date());

              return (
                <section key={key} id={`day-${key}`} className="relative flex gap-3">
                  {/* Left date anchor */}
                  <div className="relative -ml-6 flex w-14 flex-col items-center pt-1 text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                        {formatDayLabel(day.date)}
                      </span>
                      <span className="mt-0.5 text-2xl font-semibold text-[hsl(var(--accent))]">
                        {day.date.getDate()}
                      </span>
                      {isToday && (
                        <span className="mt-1 rounded-full bg-[hsl(var(--accent))]/20 px-2 py-0.5 text-[9px] font-medium text-[hsl(var(--accent))]">
                          Hoje
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right content thread */}
                  <div className="flex-1 pb-3">
                    <div className="sticky top-0 z-10 mb-2 pr-1">
                      <div className="glass-card flex items-center justify-between rounded-2xl bg-background/70 px-3 py-1.5 text-[11px]">
                        <span className="font-medium tracking-tight">{formatFullDate(day.date)}</span>
                        <span className="text-muted-foreground">
                          {day.transactions.length + day.reminders.length + day.notes.length} eventos
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      {/* Financial items: Slim rows */}
                      {day.transactions.map((tx) => (
                        <TimelineTransactionRow key={`tx-${tx.id}`} tx={tx} privacyOn={privacyOn} />
                      ))}

                      {/* Reminders: Task-style items */}
                      {day.reminders.map((rem) => (
                        <TimelineReminderItem key={`rem-${rem.id}`} rem={rem} onComplete={onCompleteReminder} />
                      ))}

                      {/* Notes: Snippet cards */}
                      {day.notes.map((note) => (
                        <TimelineNoteCard key={`note-${note.id}`} note={note} />
                      ))}
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

interface TimelineTransactionRowProps {
  tx: (typeof calendarTransactions)[number];
  privacyOn: boolean;
}

const TimelineTransactionRow = ({ tx, privacyOn }: TimelineTransactionRowProps) => {
  const isNegative = tx.amount < 0;
  const Icon = getCategoryIcon(tx.category);

  return (
    <div className="flex items-center justify-between gap-2 border-b border-border/40 py-2 text-xs last:border-b-0">
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-full border border-border/60 bg-background/40",
            isNegative ? "text-rose-500" : "text-emerald-500",
          )}
        >
          <Icon className="h-3.5 w-3.5" />
        </div>
        <div className="flex flex-col">
          <span className="font-medium leading-tight text-foreground">{tx.title}</span>
          <span className="text-[10px] text-muted-foreground">{tx.category}</span>
        </div>
      </div>
      <span
        className={cn(
          "text-[11px] font-semibold",
          isNegative ? "text-rose-500" : "text-emerald-500",
        )}
      >
        {privacyOn ? "•••••" : `${isNegative ? "-" : "+"} ${currencyFormatter.format(Math.abs(tx.amount))}`}
      </span>
    </div>
  );
};

interface TimelineReminderItemProps {
  rem: ReminderRecord;
  onComplete: (id: number) => void;
}

const TimelineReminderItem = ({ rem, onComplete }: TimelineReminderItemProps) => {
  const isPending = rem.status === "pending";
  return (
    <div className="flex items-center justify-between gap-2 py-1.5 text-xs">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => isPending && onComplete(rem.id)}
          className={cn(
            "flex h-5 w-5 items-center justify-center rounded-full border-2 text-[9px]",
            isPending
              ? "border-[hsl(var(--reminders-accent))] text-[hsl(var(--reminders-accent))]"
              : "border-muted text-muted-foreground bg-muted/30",
          )}
        >
          {isPending ? "" : "✓"}
        </button>
        <div className="flex flex-col gap-0.5">
          <span className="inline-flex w-fit items-center rounded-full bg-[hsl(var(--reminders-accent))]/15 px-2 py-0.5 text-[10px] text-[hsl(var(--reminders-accent))]">
            {rem.timeLabel}
          </span>
          <span className="text-[11px] font-medium leading-tight text-foreground">{rem.title}</span>
        </div>
      </div>
      <span className="text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--reminders-accent))]">
        Lembrete
      </span>
    </div>
  );
};

interface TimelineNoteCardProps {
  note: (typeof calendarNotes)[number];
}

const TimelineNoteCard = ({ note }: TimelineNoteCardProps) => {
  return (
    <div className="mt-1.5 rounded-2xl border-l-2 border-amber-400/90 bg-amber-400/10 px-3 py-2.5 text-xs shadow-sm">
      <p className="text-[11px] font-semibold leading-tight text-foreground">{note.title}</p>
      <p className="mt-0.5 line-clamp-2 text-[11px] text-amber-100/80">{note.body}</p>
    </div>
  );
};

export default Index;
