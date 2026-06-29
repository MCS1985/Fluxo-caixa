import { useState, type ComponentType, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  LayoutDashboard,
  ListTree,
  Tags,
  Plus,
  Wallet,
  Settings as SettingsIcon,
  RefreshCw,
  Trash2,
  Lock,
  LogOut,
  KeyRound,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { DashboardView } from "@/components/finance/DashboardView";
import { TransactionsView } from "@/components/finance/TransactionsView";
import { NaturezasView } from "@/components/finance/NaturezasView";
import { TransactionDialog } from "@/components/finance/TransactionDialog";
import { financeActions, useFinance, useHydrateFinance } from "@/lib/finance-store";
import { authActions } from "@/lib/auth-store";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Fluxo · Finanças Pessoais MCS" },
      {
        name: "description",
        content:
          "Dashboard moderno de fluxo de caixa pessoal com receitas, despesas, naturezas e centros de resultado.",
      },
    ],
  }),
  component: AppHome,
});

type Tab = "dashboard" | "lancamentos" | "naturezas";

const NAV: { id: Tab; label: string; icon: ComponentType<{ className?: string }> }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "lancamentos", label: "Lançamentos", icon: ListTree },
  { id: "naturezas", label: "Naturezas & CRs", icon: Tags },
];

function AppHome() {
  useHydrateFinance();
  const { transactions } = useFinance();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [openNew, setOpenNew] = useState(false);
  const [openChangePass, setOpenChangePass] = useState(false);
  const [year] = useState(2026);

  return (
    <div className="min-h-screen">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-surface/80 backdrop-blur-xl lg:flex">
        <div className="flex items-center gap-3 px-6 py-6">
          <div className="flex size-10 items-center justify-center rounded-xl gradient-mint shadow-[var(--shadow-glow-mint)]">
            <Wallet className="size-5" />
          </div>
          <div>
            <div className="font-display text-base font-bold leading-tight">Fluxo</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Finanças MCS
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3">
          {NAV.map((item) => {
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={cn(
                  "group mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                  active
                    ? "bg-primary/10 text-primary ring-1 ring-primary/20"
                    : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
                )}
              >
                <item.icon className={cn("size-4", active && "text-primary")} />
                {item.label}
                {active && <span className="ml-auto size-1.5 rounded-full bg-primary" />}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-border p-4">
          <div className="rounded-xl border border-border bg-muted/30 p-3">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Total registrado
            </div>
            <div className="mt-1 font-display text-xl font-semibold num">{transactions.length}</div>
            <div className="text-xs text-muted-foreground">lançamentos salvos localmente</div>
          </div>
        </div>
      </aside>

      {/* Mobile top nav */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background/80 px-4 py-3 backdrop-blur-xl lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg gradient-mint">
            <Wallet className="size-4" />
          </div>
          <span className="font-display font-bold">Fluxo</span>
        </div>
        <div className="flex gap-1 rounded-full border border-border bg-muted/40 p-1 text-xs">
          {NAV.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={cn(
                "rounded-full px-3 py-1 font-medium",
                tab === item.id ? "bg-primary text-primary-foreground" : "text-muted-foreground",
              )}
            >
              {item.label.split(" ")[0]}
            </button>
          ))}
        </div>
      </header>

      {/* Main */}
      <main className="lg:pl-64">
        <div className="mx-auto max-w-7xl px-4 py-6 pb-28 lg:px-8 lg:py-8">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">
                Ano-base · {year}
              </div>
              <h1 className="mt-1 font-display text-3xl font-bold leading-tight md:text-4xl">
                {tab === "dashboard" && (
                  <>
                    Bem-vindo de volta, <span className="text-gradient-mint">MCS</span>
                  </>
                )}
                {tab === "lancamentos" && "Todos os lançamentos"}
                {tab === "naturezas" && "Naturezas & Centros de Resultado"}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {tab === "dashboard" && "Visão consolidada do seu fluxo de caixa em tempo real."}
                {tab === "lancamentos" && "Filtre, edite e organize todas as suas movimentações."}
                {tab === "naturezas" && "Gerencie categorias e entidades do seu cadastro."}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => setOpenNew(true)}
                className="gradient-mint font-semibold shadow-[var(--shadow-glow-mint)] transition-transform hover:scale-[1.02]"
              >
                <Plus className="size-4" /> Novo lançamento
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" aria-label="Configurações">
                    <SettingsIcon className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Dados locais</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <ResetItem />
                  <ClearItem />
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                      setOpenChangePass(true);
                    }}
                  >
                    <Lock className="size-4" /> Alterar senha
                  </DropdownMenuItem>
                  <LogoutItem />
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {tab === "dashboard" && <DashboardView year={year} />}
          {tab === "lancamentos" && <TransactionsView year={year} />}
          {tab === "naturezas" && <NaturezasView />}
        </div>

        {/* Floating action button - mobile */}
        <button
          onClick={() => setOpenNew(true)}
          className="fixed bottom-6 right-6 z-40 flex size-14 items-center justify-center rounded-full gradient-mint shadow-[var(--shadow-glow-mint)] transition-transform hover:scale-110 lg:hidden"
          aria-label="Novo lançamento"
        >
          <Plus className="size-6" />
        </button>
      </main>

      <TransactionDialog open={openNew} onOpenChange={setOpenNew} />
      <ChangePasswordDialog open={openChangePass} onOpenChange={setOpenChangePass} />
    </div>
  );
}

function ResetItem() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <RefreshCw className="size-4" /> Restaurar planilha original
        </DropdownMenuItem>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Restaurar dados originais?</AlertDialogTitle>
          <AlertDialogDescription>
            Isso vai substituir tudo pelos dados originais da planilha 2026 (648 lançamentos). Suas
            alterações locais serão perdidas.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              financeActions.resetAll();
              toast.success("Dados restaurados");
            }}
          >
            Restaurar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function ClearItem() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
          <Trash2 className="size-4" /> Limpar todos os lançamentos
        </DropdownMenuItem>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir todos os lançamentos?</AlertDialogTitle>
          <AlertDialogDescription>
            Naturezas e entidades serão mantidas, mas todas as movimentações serão apagadas. Esta
            ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={() => {
              financeActions.clearAll();
              toast.success("Lançamentos excluídos");
            }}
          >
            Excluir tudo
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function LogoutItem() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
          <LogOut className="size-4" /> Sair
        </DropdownMenuItem>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Sair do aplicativo?</AlertDialogTitle>
          <AlertDialogDescription>
            Você será desconectado e precisará informar sua senha novamente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={() => {
              authActions.logout();
              toast.success("Desconectado");
            }}
          >
            Sair
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

type ChangePassProps = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
};

function ChangePasswordDialog({ open, onOpenChange }: ChangePassProps) {
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!currentPass || !newPass || !confirmPass) {
      setError("Preencha todos os campos");
      return;
    }
    if (newPass.length < 4) {
      setError("A nova senha deve ter no mínimo 4 caracteres");
      return;
    }
    if (newPass !== confirmPass) {
      setError("As senhas não conferem");
      return;
    }
    if (currentPass === newPass) {
      setError("A nova senha deve ser diferente da atual");
      return;
    }

    const ok = authActions.changePassword(currentPass, newPass);
    if (!ok) {
      setError("Senha atual incorreta");
      return;
    }

    toast.success("Senha alterada com sucesso");
    setCurrentPass("");
    setNewPass("");
    setConfirmPass("");
    onOpenChange(false);
  }

  function handleClose() {
    setCurrentPass("");
    setNewPass("");
    setConfirmPass("");
    setError("");
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) handleClose();
      }}
    >
      <DialogContent className="glass-elevated max-w-sm p-0 sm:rounded-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="border-b border-border px-6 py-5">
            <DialogTitle className="font-display text-xl">Alterar senha</DialogTitle>
            <DialogDescription>Informe sua senha atual e escolha uma nova.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 px-6 py-5">
            <div>
              <label htmlFor="currentPass" className="text-sm font-medium">
                Senha atual
              </label>
              <div className="relative mt-1.5">
                <input
                  id="currentPass"
                  type={showCurrent ? "text" : "password"}
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-border bg-input px-3 py-2 pr-10 text-sm outline-none ring-primary/30 transition-all focus:ring-2"
                  placeholder="••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showCurrent ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="newPass" className="text-sm font-medium">
                Nova senha
              </label>
              <div className="relative mt-1.5">
                <input
                  id="newPass"
                  type={showNew ? "text" : "password"}
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-border bg-input px-3 py-2 pr-10 text-sm outline-none ring-primary/30 transition-all focus:ring-2"
                  placeholder="••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPass" className="text-sm font-medium">
                Confirmar nova senha
              </label>
              <input
                id="confirmPass"
                type="password"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                className="mt-1.5 flex h-10 w-full rounded-lg border border-border bg-input px-3 py-2 text-sm outline-none ring-primary/30 transition-all focus:ring-2"
                placeholder="••••••"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-destructive/10 px-3 py-2 text-center text-sm text-destructive">
                {error}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
            <button
              type="button"
              onClick={handleClose}
              className="inline-flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg gradient-mint px-4 text-sm font-semibold shadow-[var(--shadow-glow-mint)] transition-all hover:scale-[1.02]"
            >
              <KeyRound className="size-4" /> Alterar
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
