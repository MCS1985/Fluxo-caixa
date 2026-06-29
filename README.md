# Fluxo · Finanças Pessoais MCS

Dashboard moderno de fluxo de caixa pessoal com receitas, despesas, naturezas e centros de resultado.

## Tecnologias

- **React 19** + **TypeScript**
- **TanStack Start** (SSR) + **TanStack Router**
- **Tailwind CSS 4** + **shadcn/ui**
- **Recharts** (gráficos)
- **Vite** (bundler)

## Funcionalidades

- Dashboard com saldo mensal, evolução e top naturezas
- Lançamentos com filtro por tipo, mês e CR
- Cadastro de naturezas e centros de resultado (CR)
- Dados salvos localmente no navegador (localStorage)
- Autenticação com login e senha
- Alteração de senha

## Como usar

### 1. Clonar e instalar

```bash
git clone <url-do-repositorio>
cd Fluxo_Caixa/Projeto
npm install
```

### 2. Executar em desenvolvimento

```bash
npm run dev
```

Acesse **http://localhost:8080**

### 3. Build para produção

```bash
npm run build
npm run preview
```

## Autenticação

O acesso ao app é protegido por login e senha.

| Campo     | Valor padrão |
|-----------|-------------|
| Usuário   | `admin`     |
| Senha     | `admin`     |

Altere a senha no menu **Configurações** → **Alterar senha**.

> Todos os dados são armazenados exclusivamente no navegador (localStorage). Nenhuma informação é enviada para servidores externos.

## Estrutura do projeto

```
src/
├── components/
│   ├── auth/          # LoginScreen
│   ├── finance/       # DashboardView, TransactionsView, NaturezasView, TransactionDialog
│   └── ui/            # shadcn/ui components
├── hooks/             # Custom hooks
├── lib/
│   ├── auth-store.ts      # Estado de autenticação
│   ├── finance-store.ts   # Estado financeiro reativo
│   ├── format.ts          # Formatação de moeda/data
│   ├── seed-data.json     # Dados iniciais (planilha 2026)
│   └── utils.ts           # Utilitários (cn)
├── routes/
│   ├── __root.tsx     # Layout raiz com gate de autenticação
│   └── index.tsx      # Página principal (app)
├── router.tsx         # Configuração do TanStack Router
├── server.ts          # Error handler SSR
├── start.ts           # Instância TanStack Start
└── styles.css         # Estilos globais Tailwind
```

## Licença

Uso pessoal.
