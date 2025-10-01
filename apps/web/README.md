# Chess Roadmap web app

The `apps/web` package hosts the Next.js 15 App Router experience for Chess Roadmap. It is a work-in-progress scaffold that currently ships the base layout, styling primitives, linting configuration, and developer tooling required to continue through the roadmap build.

## Commands

```bash
pnpm dev           # start the development server
pnpm lint          # run ESLint with zero-warning budget
pnpm typecheck     # TypeScript project references
pnpm test          # run unit tests with Vitest
pnpm e2e           # execute Playwright tests
pnpm build         # production build
```

Additional tooling (link checks, formatting, etc.) is wired through the root workspace scripts for consistency across packages.
