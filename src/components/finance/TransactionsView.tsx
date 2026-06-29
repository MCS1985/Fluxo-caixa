import { useMemo, useState } from "react";
import { Search, Pencil, Trash2, ArrowUpRight, ArrowDownRight, Filter } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TransactionDialog } from "./TransactionDialog";
import { financeActions, useFinance, GRUPO_LABELS, type Transaction } from "@/lib/finance-store";
import { BRL, formatDatePt, MES_CURTO } from "@/lib/format";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Props = { year: number };

export function TransactionsView({ year }: Props) {
  const { transactions, naturezas } = useFinance();
  const [q, setQ] = useState("");
  const [tipo, setTipo] = useState<"todas" | "receita" | "despesa">("todas");
  const [grupo, setGrupo] = useState<string>("todos");
  const [mes, setMes] = useState<string>("todos");
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [toDelete, setToDelete] = useState<Transaction | null>(null);

  const natMap = useMemo(() => new Map(naturezas.map((n) => [n.codigo, n])), [naturezas]);
  const grupos = useMemo(() => Array.from(new Set(naturezas.map((n) => n.grupo))), [naturezas]);

  const filtered = useMemo(() => {
    return transactions
      .filter((t) => t.data.startsWith(String(year)))
      .filter((t) => {
        if (tipo === "receita" && t.valor < 0) return false;
        if (tipo === "despesa" && t.valor >= 0) return false;
        if (grupo !== "todos") {
          const n = natMap.get(t.natureza);
          if (n?.grupo !== grupo) return false;
        }
        if (mes !== "todos" && t.data.slice(5, 7) !== mes) return false;
        if (q.trim()) {
          const needle = q.trim().toLowerCase();
          const hay = `${t.descricao} ${t.cr} ${t.natureza} ${t.obs}`.toLowerCase();
          if (!hay.includes(needle)) return false;
        }
        return true;
      })
      .sort((a, b) => (a.data < b.data ? 1 : a.data > b.data ? -1 : 0));
  }, [transactions, year, tipo, grupo, mes, q, natMap]);

  const totalFiltered = filtered.reduce((s, t) => s + t.valor, 0);

  return (
    <div className="space-y-4">
      <div className="glass-card flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por descrição, natureza ou centro…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="size-4 text-muted-foreground" />
          <Select value={tipo} onValueChange={(v) => setTipo(v as any)}>
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todos os tipos</SelectItem>
              <SelectItem value="receita">Receitas</SelectItem>
              <SelectItem value="despesa">Despesas</SelectItem>
            </SelectContent>
          </Select>
          <Select value={grupo} onValueChange={setGrupo}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os grupos</SelectItem>
              {grupos.map((g) => (
                <SelectItem key={g} value={g}>
                  {GRUPO_LABELS[g] ?? g}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={mes} onValueChange={setMes}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos meses</SelectItem>
              {MES_CURTO.map((m, i) => (
                <SelectItem key={m} value={String(i + 1).padStart(2, "0")}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-5 py-3 text-sm">
          <span className="text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "lançamento" : "lançamentos"}
          </span>
          <span className="num font-semibold">
            Saldo:{" "}
            <span className={cn(totalFiltered >= 0 ? "text-primary" : "text-destructive")}>
              {BRL.format(totalFiltered)}
            </span>
          </span>
        </div>

        <div className="hidden grid-cols-[110px_1fr_180px_120px_140px_72px] gap-4 border-b border-border bg-muted/30 px-5 py-2.5 text-xs uppercase tracking-wider text-muted-foreground md:grid">
          <div>Data</div>
          <div>Descrição</div>
          <div>Centro de resultado</div>
          <div>Natureza</div>
          <div className="text-right">Valor</div>
          <div className="text-right">Ações</div>
        </div>

        <ul className="divide-y divide-border">
          {filtered.length === 0 && (
            <li className="px-5 py-10 text-center text-sm text-muted-foreground">
              Nenhum lançamento encontrado com esses filtros.
            </li>
          )}
          {filtered.slice(0, 200).map((t) => {
            const isReceita = t.valor >= 0;
            const n = natMap.get(t.natureza);
            return (
              <li
                key={t.id}
                className="grid grid-cols-1 gap-2 px-5 py-3 transition-colors hover:bg-muted/20 md:grid-cols-[110px_1fr_180px_120px_140px_72px] md:items-center md:gap-4"
              >
                <div className="flex items-center gap-3 text-sm">
                  <span
                    className={cn(
                      "flex size-8 items-center justify-center rounded-lg border md:hidden",
                      isReceita
                        ? "border-primary/30 bg-primary/10 text-primary"
                        : "border-destructive/30 bg-destructive/10 text-destructive",
                    )}
                  >
                    {isReceita ? (
                      <ArrowUpRight className="size-4" />
                    ) : (
                      <ArrowDownRight className="size-4" />
                    )}
                  </span>
                  <span className="num text-muted-foreground">{formatDatePt(t.data)}</span>
                </div>
                <div className="text-sm">
                  <div className="font-medium">{t.descricao || "—"}</div>
                  {t.obs && (
                    <div className="line-clamp-1 text-xs text-muted-foreground">{t.obs}</div>
                  )}
                </div>
                <div className="line-clamp-1 text-xs text-muted-foreground">
                  {t.cr || n?.descricao || "—"}
                </div>
                <div className="text-xs">
                  <span className="rounded-md border border-border bg-muted/40 px-2 py-0.5 font-mono">
                    {t.natureza}
                  </span>
                </div>
                <div
                  className={cn(
                    "num text-right text-sm font-semibold",
                    isReceita ? "text-primary" : "text-destructive",
                  )}
                >
                  {isReceita ? "+" : "−"}
                  {BRL.format(Math.abs(t.valor))}
                </div>
                <div className="flex items-center justify-end gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setEditing(t)}
                    aria-label="Editar"
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setToDelete(t)}
                    aria-label="Excluir"
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>

        {filtered.length > 200 && (
          <div className="border-t border-border px-5 py-3 text-center text-xs text-muted-foreground">
            Mostrando 200 de {filtered.length}. Refine os filtros para ver mais.
          </div>
        )}
      </div>

      <TransactionDialog
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        editing={editing}
      />

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir este lançamento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O lançamento será removido do seu fluxo de caixa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (toDelete) {
                  financeActions.deleteTransaction(toDelete.id);
                  toast.success("Lançamento excluído");
                }
                setToDelete(null);
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
