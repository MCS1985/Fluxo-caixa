import { useState, type FormEvent } from "react";
import { Wallet, Eye, EyeOff, ArrowRight, KeyRound } from "lucide-react";
import { authActions } from "@/lib/auth-store";

export function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Preencha todos os campos");
      return;
    }
    setLoading(true);
    setError("");
    const ok = authActions.login(username.trim(), password);
    if (!ok) {
      setError("Usuário ou senha inválidos");
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <div className="pointer-events-none fixed inset-0 bg-[var(--gradient-glow-mint)] opacity-60" />
      <div className="pointer-events-none fixed inset-0 bg-[var(--gradient-glow-violet)] opacity-40" />

      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl gradient-mint shadow-[var(--shadow-glow-mint)]">
            <Wallet className="size-7" />
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold">Fluxo</h1>
          <p className="mt-1 text-sm text-muted-foreground">Finanças Pessoais MCS</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-elevated space-y-5 p-6 sm:p-8">
          <div className="text-center">
            <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-primary/10">
              <KeyRound className="size-5 text-primary" />
            </div>
            <h2 className="mt-3 font-display text-lg font-semibold">Acesso restrito</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Informe suas credenciais para continuar
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="user" className="text-sm font-medium">
                Usuário
              </label>
              <input
                id="user"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1.5 flex h-10 w-full rounded-lg border border-border bg-input px-3 py-2 text-sm outline-none ring-primary/30 transition-all focus:ring-2"
                placeholder="admin"
                autoFocus
                autoComplete="username"
              />
            </div>

            <div>
              <label htmlFor="pass" className="text-sm font-medium">
                Senha
              </label>
              <div className="relative mt-1.5">
                <input
                  id="pass"
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-border bg-input px-3 py-2 pr-10 text-sm outline-none ring-primary/30 transition-all focus:ring-2"
                  placeholder="••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-destructive/10 px-3 py-2 text-center text-sm text-destructive">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg gradient-mint px-4 py-2.5 text-sm font-semibold shadow-[var(--shadow-glow-mint)] transition-all hover:scale-[1.02] disabled:opacity-60"
          >
            {loading ? "Entrando…" : "Entrar"}
            <ArrowRight className="size-4" />
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Fluxo v1.0 &mdash; dados salvos localmente no navegador
        </p>
      </div>
    </div>
  );
}
