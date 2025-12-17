import { motion } from "framer-motion";
import { useState, useMemo, useEffect, useCallback } from "react";
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
import { MOCK_USERS, type DashboardUser } from "@/lib/supabaseClient";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const financeEvolution = [
  { month: "Jan", value: 1200 },
  { month: "Fev", value: 1500 },
  { month: "Mar", value: 1800 },
  { month: "Abr", value: 1650 },
  { month: "Mai", value: 2100 },
  { month: "Jun", value: 2400 },
];

const financeCategories = [
  { category: "Alimentação", value: 65 },
  { category: "Transporte", value: 35 },
  { category: "Lazer", value: 42 },
  { category: "Saúde", value: 28 },
  { category: "Outros", value: 30 },
];

const mockNotes = [
  { id: 1, userId: "351932966990", title: "Planejamento da semana", body: "Revisar metas de gastos, separar horário para leitura e treino.", tone: "finance" },
  { id: 2, userId: "351932966990", title: "Ideias de side hustle", body: "Newsletter em PT-BR sobre finanças pessoais digitais.", tone: "notes" },
  { id: 3, userId: "351929426244", title: "To-dos de hoje", body: "Enviar comprovantes, renegociar plano de internet, backup do Notion.", tone: "reminders" },
  { id: 4, userId: "351929426244", title: "Viagem SP", body: "Criar orçamento diário com teto em restaurantes e transporte.", tone: "finance" },
];

const mockReminders = [
  { id: 1, userId: "351932966990", title: "Pagar cartão de crédito", time: "Hoje · 18:00", status: "pending" as const, date: "2025-01-10" },
  { id: 2, userId: "351932966990", title: "Rever orçamento do mês", time: "Amanhã · 09:00", status: "pending" as const, date: "2025-01-11" },
  { id: 3, userId: "351929426244", title: "Assinar relatório de investimentos", time: "Concluído ontem", status: "done" as const, date: "2025-01-09" },
];

const currencyFormatter = new Intl.NumberFormat("pt-PT", {
  style: "currency",
  currency: "EUR",
});

const financeEvolutionThisMonth = [
  { day: "1", value: 400 },
  { day: "5", value: 650 },
  { day: "10", value: 980 },
  { day: "15", value: 1200 },
  { day: "20", value: 1420 },
  { day: "25", value: 1600 },
  { day: "30", value: 1750 },
];

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

const Index = () => {
  const [selectedUser, setSelectedUser] = useState<DashboardUser | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("finance");
  const [privacyOn, setPrivacyOn] = useState(false);
  const [notesQuery, setNotesQuery] = useState("");
  const [focusedNoteId, setFocusedNoteId] = useState<number | null>(null);
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");
  const [selectedDay, setSelectedDay] = useState<Date | undefined>();

  const filteredNotes = useMemo(() => {
    if (!selectedUser) return [];
    return mockNotes.filter((note) => {
      if (note.userId !== selectedUser.id) return false;
      if (!notesQuery.trim()) return true;
      const q = notesQuery.toLowerCase();
      return note.title.toLowerCase().includes(q) || note.body.toLowerCase().includes(q);
    });
  }, [notesQuery, selectedUser]);

  const filteredReminders = useMemo(() => {
    if (!selectedUser) return [];
    return mockReminders.filter((r) => r.userId === selectedUser.id);
  }, [selectedUser]);

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

          {/* Global search bar */}
          <div className="mb-4">
            <button
              type="button"
              onClick={() => setGlobalSearchOpen(true)}
              className="aura-card aura-strong glass-card flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-left text-xs hover:bg-card/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              <Search className="h-4 w-4 text-muted-foreground" />
              <span className="flex-1 text-muted-foreground/80">Buscar em tudo (notas, lembretes, transações)</span>
              <span className="hidden text-[10px] text-muted-foreground/70 md:inline-flex items-center gap-1">
                <kbd className="rounded bg-muted/60 px-1.5 py-0.5 text-[9px] font-medium">⌘</kbd>
                <kbd className="rounded bg-muted/60 px-1.5 py-0.5 text-[9px] font-medium">K</kbd>
              </span>
            </button>
          </div>

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
                      active ? "text-primary" : "text-muted-foreground/80 hover:text-foreground"
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
                          : "border-border/60 bg-card/60"
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

          {/* Global search overlay */}
          <Dialog open={globalSearchOpen} onOpenChange={setGlobalSearchOpen}>
            <DialogContent className="glass-card aura-card max-w-xl border border-border/70 bg-background/95 p-0">
              <div className="border-b border-border/70 px-4 py-2.5">
                <div className="relative flex items-center gap-2">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    autoFocus
                    value={globalSearchQuery}
                    onChange={(e) => setGlobalSearchQuery(e.target.value)}
                    placeholder="Digite para buscar em notas, lembretes e transações"
                    className="h-9 rounded-full border-border/70 bg-card/80 pl-9 text-xs placeholder:text-muted-foreground/70"
                  />
                </div>
              </div>
              <GlobalSearchResults
                query={globalSearchQuery}
                notes={filteredNotes}
                reminders={filteredReminders}
                transactions={recentTransactions}
              />
            </DialogContent>
          </Dialog>
        </motion.main>
      )}
    </div>
  );
};

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

  const formatCurrency = (value: number) => (privacyOn ? "•••••" : currencyFormatter.format(value));

  const evolutionData = evolutionFilter === "6m" ? financeEvolution : financeEvolutionThisMonth;
  const evolutionXKey = evolutionFilter === "6m" ? "month" : "day";

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

      {/* Scrollable KPI cards */}
      <div className="no-scrollbar -mx-2 flex gap-3 overflow-x-auto px-2 pb-1">
        <motion.div
          className="glass-card min-w-[72%] max-w-sm flex-1 rounded-2xl p-4"
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

        <motion.div className="glass-card min-w-[60%] max-w-xs flex-1 rounded-2xl p-4" variants={cardHover} initial="rest" whileHover="hover">
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

        <motion.div className="glass-card min-w-[60%] max-w-xs flex-1 rounded-2xl p-4" variants={cardHover} initial="rest" whileHover="hover">
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

        <motion.div className="glass-card rounded-2xl p-4" variants={cardHover} initial="rest" whileHover="hover">
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
  notes: typeof mockNotes;
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
        <div className="glass-card flex flex-col items-center justify-center gap-1 rounded-2xl p-5 text-center">
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
                "mb-3 w-full break-inside-avoid rounded-2xl border px-3 py-3 text-left text-xs shadow-sm transition-transform hover:-translate-y-1",
                "border-border/60 bg-card/80 backdrop-blur-md",
                note.tone === "finance" && "border-[hsl(var(--finance-gradient-start))]/40",
                note.tone === "notes" && "border-[hsl(var(--notes-accent))]/40",
                note.tone === "reminders" && "border-[hsl(var(--reminders-accent))]/40"
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

const RemindersTab = ({
  reminders,
}: {
  reminders: typeof mockReminders;
}) => {
  const [items, setItems] = useState(reminders);

  useEffect(() => {
    setItems(reminders);
  }, [reminders]);

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
        <div className="glass-card flex flex-col items-center justify-center gap-1 rounded-2xl p-5 text-center">
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
                        <p className="mt-0.5 text-[11px] text-muted-foreground">{reminder.time}</p>
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

export default Index;

interface GlobalSearchResultsProps {
  query: string;
  notes: typeof mockNotes;
  reminders: typeof mockReminders;
  transactions: typeof recentTransactions;
}

const GlobalSearchResults = ({ query, notes, reminders, transactions }: GlobalSearchResultsProps) => {
  const q = query.trim().toLowerCase();

  const hasQuery = q.length > 0;

  const matchedNotes = useMemo(
    () =>
      !hasQuery
        ? []
        : notes.filter((n) => n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q)),
    [hasQuery, notes, q],
  );

  const matchedReminders = useMemo(
    () =>
      !hasQuery
        ? []
        : reminders.filter((r) => r.title.toLowerCase().includes(q) || r.time.toLowerCase().includes(q)),
    [hasQuery, reminders, q],
  );

  const matchedTransactions = useMemo(
    () =>
      !hasQuery
        ? []
        : transactions.filter((t) => t.title.toLowerCase().includes(q) || t.subtitle.toLowerCase().includes(q)),
    [hasQuery, transactions, q],
  );

  if (!hasQuery) {
    return (
      <div className="px-4 py-6 text-center text-xs text-muted-foreground">
        Comece a digitar para buscar em notas, lembretes e movimentações.
      </div>
    );
  }

  const hasResults = matchedNotes.length + matchedReminders.length + matchedTransactions.length > 0;

  if (!hasResults) {
    return (
      <div className="px-4 py-6 text-center text-xs text-muted-foreground">
        Nada encontrado para "{query}".
      </div>
    );
  }

  return (
    <div className="max-h-[320px] space-y-3 overflow-y-auto px-4 py-3 text-xs">
      {matchedNotes.length > 0 && (
        <section>
          <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Notas</p>
          <div className="space-y-1.5">
            {matchedNotes.map((note) => (
              <div key={note.id} className="rounded-lg border border-border/60 bg-card/70 px-2.5 py-1.5">
                <p className="font-medium">{note.title}</p>
                <p className="text-[11px] text-muted-foreground line-clamp-2">{note.body}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {matchedReminders.length > 0 && (
        <section>
          <p className="mb-1 mt-2 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Lembretes</p>
          <div className="space-y-1.5">
            {matchedReminders.map((reminder) => (
              <div
                key={reminder.id}
                className="flex items-center justify-between rounded-lg border border-border/60 bg-card/70 px-2.5 py-1.5"
              >
                <div>
                  <p className="font-medium">{reminder.title}</p>
                  <p className="text-[11px] text-muted-foreground">{reminder.time}</p>
                </div>
                <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  {reminder.status === "pending" ? "Pendente" : "Concluído"}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {matchedTransactions.length > 0 && (
        <section>
          <p className="mb-1 mt-2 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Movimentações
          </p>
          <div className="space-y-1.5">
            {matchedTransactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between rounded-lg border border-border/60 bg-card/70 px-2.5 py-1.5"
              >
                <div>
                  <p className="font-medium">{tx.title}</p>
                  <p className="text-[11px] text-muted-foreground">{tx.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
