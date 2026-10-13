# Dust Wars

A browser-based single-player trading game built with Vue 3, Quasar,
TypeScript and Pinia. Buy and sell on a deterministic, supply-sensitive
market. Cargo purchases are recorded in batches and sold oldest first (FIFO).

There is no backend, account system or telemetry. Game state is saved to
localStorage after trades, day advancement, debug actions and reset. The
current save key is dust-wars:save and the format version is 3. The page
loads Inter through Google Fonts; an internet connection is needed for that
font, but gameplay and persistence do not need a server API.

## Setup

Node.js 24 is recommended (verified locally with 24.21.0). The declared Node
22 minimum is 22.15 because the test runner uses Node module hooks. Other
supported versions are listed in package.json.

    npm ci
    npm run dev

The development server prints its local URL and opens a browser by default.
A global Quasar CLI installation is optional; npm scripts use the project's
installed CLI.

## Commands

| Command              | Purpose                                                 |
| -------------------- | ------------------------------------------------------- |
| npm run dev          | Start development with hot reload.                      |
| npm run build        | Build the production SPA into dist/spa.                 |
| npm run lint         | Check source, tests and configuration with ESLint.      |
| npm run lint:fix     | Apply automatic ESLint fixes.                           |
| npm run format       | Format maintained text files with Prettier.             |
| npm run format:check | Check formatting without changing files.                |
| npm run lint:check   | Check both formatting and ESLint.                       |
| npm run typecheck    | Check TypeScript and Vue templates.                     |
| npm test             | Run domain, store and Vue interaction regression tests. |
| npm run check        | Run all formatting, lint, type and test checks.         |

After changing aliases or Quasar build settings, run npx quasar prepare to
regenerate IDE configuration. It also runs automatically after installation.

## Structure

    src/
      components/       Vue components and shared presentation primitives
        market/         Market rows, quantity controls and view types
      css/              Global styles, design tokens and shared primitives
      data/             City/drug catalogs and balance constants
      domain/           Pure pricing, trades, cargo, history and game creation
      layouts/          Application shell
      pages/            Market plus Map/Bank placeholders
      router/           Manual nested route table and router creation
      services/         Browser localStorage persistence
      stores/           Pinia orchestration and cached derived state
      types/            Shared game and catalog types
      utils/            Pure numeric, formatting and random helpers
    tests/              Node tests and a Vue interaction renderer
    docs/               Refactor findings and UI proposals

Dependency direction: presentation uses stores and domain helpers; stores
coordinate the domain and browser services. Domain, data and utilities never
import UI components, stores, browser services, Vue, Pinia or Quasar. ESLint
enforces these boundaries.

## Routing and deployment

Routes are maintained in src/router/routes.ts. The root and unknown paths
redirect to /market. /map and /bank currently show placeholders.

Routing uses HTML5 history. Serve dist/spa over HTTP with a fallback to
index.html for application routes. Opening the built index.html directly
from disk does not work. The project targets a client-side SPA.

## Design and status

The current theme uses antique gold on dark surfaces, with muted green and
red accents. CSS tokens live in src/css/tokens.scss; Quasar semantic colors
live in src/css/quasar.variables.scss. Shared buttons, chips, tooltips,
dialogs and scrollbars are defined in src/css/components.

Market trading, FIFO cargo, supply pressure, recent price history and browser
saves are implemented. Travel, banking and profile screens are unfinished;
debug controls are currently visible. Game-rule correctness and balancing
are a separate next-stage audit.

See [the refactor review](docs/refactor-review.md) for the architecture,
validation and queued logic findings, and [UI proposals](docs/ui-review.md)
for suggested visual/interaction changes awaiting approval.
