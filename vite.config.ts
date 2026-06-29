// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { writeFileSync, mkdirSync, readdirSync } from "fs";
import { resolve } from "path";

export default defineConfig({
  base: "/Fluxo-caixa/",
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    plugins: [
      {
        name: "gh-pages-html",
        closeBundle() {
          const out = resolve(__dirname, ".output/public");
          const files = readdirSync(resolve(out, "assets"));
          const js = files.find((f) => f.startsWith("index-") && f.endsWith(".js"));
          const css = files.find((f) => f.startsWith("styles-") && f.endsWith(".css"));

          const html = `<!DOCTYPE html>
<html lang="pt-BR" class="dark">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="theme-color" content="#0a0a0f" />
  <title>Fluxo · Finanças Pessoais</title>
  <link rel="stylesheet" href="/Fluxo-caixa/assets/${css}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" />
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/Fluxo-caixa/assets/${js}"></script>
</body>
</html>`;

          writeFileSync(resolve(out, "index.html"), html);
          writeFileSync(resolve(out, "404.html"), html);
          writeFileSync(resolve(out, ".nojekyll"), "");
        },
      },
    ],
  },
});
