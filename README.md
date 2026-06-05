# Tools Collection

A client-side tools app built with Vite, React, TypeScript, and TanStack Router. It is configured for GitHub Pages deployment at:

<https://SanttuA.github.io/tools-collection/>

## Tools

- Calculator: standard arithmetic with decimal, percent, sign, and keyboard input.
- JSON Formatter: validate, pretty-print, and minify JSON.
- Base64 Converter: encode and decode UTF-8 text.
- HTML Validator: validate HTML markup offline.
- JWT Decoder: decode JWT header, payload, and time claims locally without verification.

## Stack

- Vite
- React
- TypeScript
- TanStack Router with hash history
- Vitest
- Playwright
- axe accessibility testing
- Oxlint
- Prettier
- pnpm with a 24-hour minimum package age policy

## Getting Started

Install dependencies:

```sh
pnpm install
```

Start the local dev server:

```sh
pnpm dev
```

Open:

```txt
http://127.0.0.1:5173/tools-collection/
```

## Scripts

```sh
pnpm typecheck
pnpm lint
pnpm format:check
pnpm test
pnpm build
pnpm e2e
pnpm test:a11y
```

## Adding Tools

Tools are registered in `src/tools/registry.ts`. Add a feature folder under `src/tools/`, export a tool component, then add a `ToolDefinition` entry with a unique slug, title, category, description, keywords, icon, and lazy component import.

The app uses the route `/tools/$toolSlug`, so new tools become addressable as:

```txt
/tools-collection/#/tools/<tool-slug>
```

## Deployment

The GitHub Actions workflow in `.github/workflows/deploy.yml` verifies the app and deploys `dist/` to GitHub Pages on pushes to `main`.

## License

MIT. See [LICENSE](LICENSE).
