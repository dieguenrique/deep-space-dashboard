import { useState, useMemo } from "react";
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
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from "recharts";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { MOCK_USERS, type DashboardUser } from "@/lib/supabaseClient";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { fetchTransactions, fetchReminders, fetchNotes, type TransactionRecord, type ReminderRecord, type NoteRecord } from "@/services/api";

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
  const [selectedUser, setSelectedUser] = useState<DashboardUser | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("finance");
  const [privacyOn, setPrivacyOn] = useState(false);
  const [notesQuery, setNotesQuery] = useState("");
  const [focusedNoteId, setFocusedNoteId] = useState<number | null>(null);
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(new Date());

  const currentUserId = selectedUser?.id ?? null;

  const { data: transactions = [], isLoading: isLoadingTransactions } = useQuery<TransactionRecord[]>({
    queryKey: ["transactions"],
    queryFn: () => {
      const today = new Date();
      const start = new Date(today);
      start.setDate(start.getDate() - 7);
      const end = new Date(today);
      end.setDate(end.getDate() + 7);
      return fetchTransactions(start, end);
    },
    enabled: !!currentUserId,
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
    return notes.filter((note) => {
      if (!notesQuery.trim()) return true;
      const q = notesQuery.toLowerCase();
      return note.title.toLowerCase().includes(q) || note.body.toLowerCase().includes(q);
    });
  }, [notesQuery, notes, currentUserId]);

  const filteredReminders = useMemo(() => {
    if (!currentUserId) return [] as ReminderRecord[];
    return reminders;
  }, [reminders, currentUserId]);

  const focusNote = filteredNotes.find((n) => n.id === focusedNoteId) ?? null;

  const greet = selectedUser ? `Bom dia, ${selectedUser.name}!` : "Bom dia";

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Aurora background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-32 top-0 h-80 w-80 rounded-full bg-primary/20 blur-3xl animate-aurora" />
        <div className="absolute -right-24 top-40 h-72 w-72 rounded-full bg-accent/20 blur-3xl animate-aurora" />
        <div className="absolute left-10 bottom-0 h-64 w-64 rounded-full bg-[hsl(var(--reminders-accent))]/20 blur-3xl animate-aurora" />
      </div>

      {!selectedUser ? (
        <LandingLogin onSelectUser={setSelectedUser} />
      ) : (
        <motion.main
          className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 pb-24 pt-6 md:px-6 md:pb-10"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <header className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Dashboard pessoal</p>
              <h1 className="text-xl font-semibold tracking-tight md:text-2xl">{greet}</h1>
            </div>
            <button
              type="button"
              onClick={() => setPrivacyOn((p) => !p)}
              className="inline-flex items-center gap-1 rounded-full bg-card/70 px-3 py-1 text-xs text-muted-foreground border border-border/60 backdrop-blur-md hover:bg-card/90 transition-colors"
            >
              {privacyOn ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              <span>{privacyOn ? "Ocultar valores" : "Mostrar valores"}</span>
            </button>
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
              {activeTab === "finance" && <FinanceTab privacyOn={privacyOn} />}
              {activeTab === "notes" && (
                <NotesTab
                  notes={filteredNotes}
                  query={notesQuery}
                  onQueryChange={setNotesQuery}
                  onOpenNote={setFocusedNoteId}
                />
              )}
              {activeTab === "reminders" && <RemindersTab reminders={filteredReminders} />}
              {activeTab === "calendar" && (
                <CalendarTab
                  selectedDay={selectedDay}
                  onSelectDay={setSelectedDay}
                  privacyOn={privacyOn}
                  reminders={filteredReminders}
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
            <DialogContent className="glass-card aura-card border border-border/60 bg-background/90 max-w-lg">
              {focusNote && (
                <div className="space-y-3">
                  <span className="tag-pill text-[10px] uppercase tracking-[0.18em]">Focus mode</span>
                  <h2 className="text-lg font-semibold tracking-tight">{focusNote.title}</h2>
                  <p className="text-sm leading-relaxed text-muted-foreground">{focusNote.body}</p>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </motion.main>
      )}
    </div>
  );
};

export { Index };

const LandingLogin = ({ onSelectUser }: { onSelectUser: (user: DashboardUser) => void }) => {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      <div className="absolute inset-x-0 top-10 flex justify-center">
        <div className="rounded-full border border-border/60 bg-card/60 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground backdrop-blur-md shadow-sm">
          Deep Space · Personal OS
        </div>
      </div>

      <motion.div
        className="glass-card relative z-10 flex w-full max-w-xl flex-col gap-6 rounded-3xl px-6 py-7 md:px-8 md:py-8"
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Entre no seu cockpit financeiro</h1>
          <p className="text-sm text-muted-foreground">
            Escolha um perfil para carregar finanças, notas e lembretes em um só lugar.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {MOCK_USERS.map((user, index) => (
            <motion.button
              key={user.id}
              type="button"
              onClick={() => onSelectUser(user)}
              className="group relative flex flex-col items-start gap-3 rounded-2xl border border-border/70 bg-card/80 px-4 py-4 text-left backdrop-blur-md transition-colors hover:border-primary/70"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + index * 0.05, duration: 0.4, ease: "easeOut" }}
              whileTap={{ scale: 0.97 }}
            >
              <div className="flex items-center gap-3">
                <div className="relative h-9 w-9 overflow-hidden rounded-2xl bg-gradient-to-br from-primary/70 via-accent/70 to-primary/40">
                  <div className="absolute inset-[2px] rounded-2xl bg-background/20" />
                  <span className="relative flex h-full w-full items-center justify-center text-xs font-semibold">
                    {user.name[0]}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium leading-tight">{user.name}</p>
                  <p className="text-[11px] text-muted-foreground">Usuário #{user.id}</p>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Toque para abrir o painel pessoal com finanças em tempo real, notas rápidas e lembretes.
              </p>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

const FinanceTab = ({ privacyOn }: { privacyOn: boolean }) => {
  const [evolutionFilter, setEvolutionFilter] = useState<"6m" | "month">("6m");
  const evolutionData = evolutionFilter === "6m" ? financeEvolution : financeEvolutionThisMonth;
  const evolutionXKey = evolutionFilter === "6m" ? "month" : "day";

  const formatCurrency = (value: number) => (privacyOn ? "•••••" : currencyFormatter.format(value));

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <span className="tag-pill bg-gradient-to-r from-[hsl(var(--finance-gradient-start))]/20 to-[hsl(var(--finance-gradient-end))]/20 text-xs">
            Finanças
          </span>
          <span className="text-[11px] text-muted-foreground">Visão geral consolidada</span>
        </div>
      </div>

      {/* KPI cards */}
      <div className="no-scrollbar -mx-2 flex gap-3 overflow-x-auto px-2 pb-1">
        <motion.div
          className="glass-card aura-card min-w-[72%] max-w-sm flex-1 rounded-2xl p-4"
          variants={cardHover}
          initial="rest"
          whileHover="hover"
        >
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs text-muted-foreground">Saldo atual</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight">
                <span className="bg-gradient-to-r from-[hsl(var(--finance-gradient-start))] to-[hsl(var(--finance-gradient-end))] bg-clip-text text-transparent">
                  {formatCurrency(24520)}
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

        <motion.div
          className="glass-card aura-card min-w-[60%] max-w-xs flex-1 rounded-2xl p-4"
          variants={cardHover}
          initial="rest"
          whileHover="hover"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Receitas vs despesas</p>
              <div className="flex items-baseline gap-2 text-xs">
                <span className="inline-flex items-center gap-1 text-emerald-400/90">
                  <ArrowDownRight className="h-3 w-3" /> {formatCurrency(8200)}
                </span>
                <span className="inline-flex items-center gap-1 text-rose-400/90">
                  <ArrowUpRight className="h-3 w-3" /> {formatCurrency(5600)}
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
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400">
              <PiggyBank className="h-4 w-4" />
            </div>
          </div>
        </motion.div>

        <motion.div
          className="glass-card aura-card min-w-[60%] max-w-xs flex-1 rounded-2xl p-4"
          variants={cardHover}
          initial="rest"
          whileHover="hover"
        >
          <p className="text-xs text-muted-foreground">Taxa de economia</p>
          <div className="mt-2 flex items-center gap-3">
            <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-400/30 via-primary/25 to-emerald-300/30">
              <div className="absolute inset-[3px] rounded-full bg-background" />
              <span className="relative text-sm font-semibold">36%</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Você está acima de 82% dos usuários com o mesmo perfil de renda.
            </p>
          </div>
        </motion.div>
      </div>

      <div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)]">
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
        <div className="space-y-2.5">
          {recentTransactions.map((tx) => {
            const Icon = getCategoryIcon(tx.category);
            const isNegative = tx.amount < 0;
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
                    <p className="text-[11px] text-muted-foreground">{tx.subtitle}</p>
                  </div>
                </div>
                <div className="text-right text-xs">
                  <p className={cn("font-medium", isNegative ? "text-rose-400" : "text-emerald-400")}>
                    {privacyOn ? "•••••" : `${isNegative ? "-" : "+"} ${currencyFormatter.format(Math.abs(tx.amount))}`}
                  </p>
                  <p className="text-[11px] text-emerald-400/80">
                    {privacyOn ? "•••••" : `+ ${currencyFormatter.format(tx.cashback)}`}
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
}

const NotesTab = ({ notes, query, onQueryChange, onOpenNote }: NotesTabProps) => {
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
        <div className="columns-1 gap-3 sm:columns-2 md:columns-3">
          {notes.map((note) => (
            <motion.button
              key={note.id}
              type="button"
              onClick={() => onOpenNote(note.id)}
              className={cn(
                "aura-card mb-3 w-full break-inside-avoid rounded-2xl border px-3 py-3 text-left text-xs shadow-sm transition-transform hover:-translate-y-1",
                "border-border/60 bg-card/80 backdrop-blur-md",
                note.tone === "finance" && "border-[hsl(var(--finance-gradient-start))]/40",
                note.tone === "notes" && "border-[hsl(var(--notes-accent))]/40",
                note.tone === "reminders" && "border-[hsl(var(--reminders-accent))]/40",
              )}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground/80">Nota rápida</p>
              <h3 className="mt-1 text-sm font-semibold tracking-tight">{note.title}</h3>
              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{note.body}</p>
            </motion.button>
          ))}
        </div>
      )}
    </section>
  );
};

const RemindersTab = ({ reminders }: { reminders: ReminderRecord[] }) => {
  const [items, setItems] = useState(reminders);

  const handleComplete = (id: number) => {
    setItems((prev) => prev.map((r) => (r.id === id ? { ...r, status: "done" as const } : r)));
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="tag-pill bg-[hsl(var(--reminders-accent))]/20 text-xs">Lembretes</span>
        <span className="text-[11px] text-muted-foreground">Linha do tempo do que importa hoje</span>
      </div>

      {items.length === 0 ? (
        <div className="glass-card aura-card flex flex-col items-center justify-center gap-1 rounded-2xl p-5 text-center">
          <p className="text-xs font-medium">Nenhum lembrete para este usuário.</p>
          <p className="text-[11px] text-muted-foreground">
            Quando conectar sua base, apenas lembretes do usuário logado serão exibidos.
          </p>
        </div>
      ) : (
        <div className="relative pl-3">
          <div className="absolute left-[7px] top-1 bottom-2 w-px bg-gradient-to-b from-[hsl(var(--reminders-accent))] via-border/70 to-transparent" />
          <div className="space-y-3">
            {items.map((reminder, index) => {
              const isPending = reminder.status === "pending";
              return (
                <motion.div
                  key={reminder.id}
                  className="relative flex items-start gap-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                >
                  <div className="z-10 mt-[2px] flex h-3.5 w-3.5 items-center justify-center">
                    <span
                      className={cn(
                        "block h-2.5 w-2.5 rounded-full border-2",
                        isPending
                          ? "border-[hsl(var(--reminders-accent))] bg-[hsl(var(--reminders-accent))]/60 animate-pulse-soft"
                          : "border-muted bg-muted",
                      )}
                    />
                  </div>
                  <div
                    className={cn(
                      "glass-card aura-card flex-1 rounded-2xl px-3 py-2.5 transition-shadow",
                      isPending
                        ? "border border-[hsl(var(--reminders-accent))]/60 shadow-[0_0_22px_hsl(var(--reminders-accent)/0.45)]"
                        : "border border-border/60 opacity-50",
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex flex-col gap-0.5">
                        <p
                          className={cn(
                            "text-xs font-medium",
                            isPending ? "text-foreground" : "line-through text-muted-foreground",
                          )}
                        >
                          {reminder.title}
                        </p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">{reminder.timeLabel}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleComplete(reminder.id)}
                          disabled={!isPending}
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] transition-colors",
                            isPending
                              ? "border-emerald-400 bg-emerald-500 text-background hover:bg-emerald-400"
                              : "border-border/60 bg-muted/40 text-muted-foreground cursor-default",
                          )}
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          {isPending ? "Concluir" : "Concluído"}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};

interface CalendarTabProps {
  selectedDay: Date | undefined;
  onSelectDay: (date: Date | undefined) => void;
  privacyOn: boolean;
  transactions: TransactionRecord[];
  reminders: ReminderRecord[];
  notes: NoteRecord[];
}

const CalendarTab = ({ selectedDay, onSelectDay, privacyOn, transactions, reminders, notes }: CalendarTabProps) => {
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

    calendarTransactions.forEach((tx) => {
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

    calendarNotes.forEach((note) => {
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

    return daysArray.slice(0, 14);
  }, [reminders]);

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
                        <TimelineReminderItem key={`rem-${rem.id}`} rem={rem} />
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
            isNegative ? "text-rose-400" : "text-emerald-400",
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
          isNegative ? "text-rose-400" : "text-emerald-400",
        )}
      >
        {privacyOn ? "•••••" : `${isNegative ? "-" : "+"} ${currencyFormatter.format(Math.abs(tx.amount))}`}
      </span>
    </div>
  );
};

interface TimelineReminderItemProps {
  rem: ReminderRecord;
}

const TimelineReminderItem = ({ rem }: TimelineReminderItemProps) => {
  return (
    <div className="flex items-center justify-between gap-2 py-1.5 text-xs">
      <div className="flex items-center gap-2">
        <button
          type="button"
          className={cn(
            "flex h-5 w-5 items-center justify-center rounded-full border-2 text-[9px]",
            rem.status === "pending"
              ? "border-[hsl(var(--reminders-accent))] text-[hsl(var(--reminders-accent))]"
              : "border-muted text-muted-foreground bg-muted/30",
          )}
        >
          {rem.status === "pending" ? "" : "✓"}
        </button>
        <div className="flex flex-col gap-0.5">
          <span className="inline-flex w-fit items-center rounded-full bg-[hsl(var(--reminders-accent))]/15 px-2 py-0.5 text-[10px] text-[hsl(var(--reminders-accent))]">
            {rem.time}
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
