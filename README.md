# Dust Wars

A modern single-player remake of the classic turn-based trading game
(originally _Dope Wars_ / _Drug Wars_, 1984). Buy low in one city, sell
high in another, and stay one step ahead of the loan shark, the cops,
and your own bad decisions.

No backend, no accounts, no telemetry. Runs entirely in the browser.

---

## Requirements

| Tool       | Version       | Notes                                                                                                                                          |
| ---------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Node.js    | **v24.x LTS** | Tested on v24.21.0. Node 22 also works, but shows a harmless engine warning during install (a transitive Quasar dependency declares Node 24+). |
| npm        | **v11.x**     | Tested on v11.4.1. Ships with Node 24.                                                                                                         |
| Quasar CLI | **v2.5.0+**   | Optional. All commands also work via `npx quasar`.                                                                                             |

Install Node.js from [nodejs.org](https://nodejs.org) — pick the current
LTS release. Installing Node also installs npm.

To install the Quasar CLI globally (optional but convenient):

    npm install -g @quasar/cli

---

## First-time setup

From the folder that contains the project:

    cd DustWars
    npm install

`npm install` downloads ~400 MB of dependencies into `node_modules/`.
Expect 1–3 minutes on a decent connection.

---

## Running the project

Development server with hot-reload:

    quasar dev

or, if you skipped the global CLI install:

    npx quasar dev

The browser opens automatically at **http://localhost:9000**.

- Edits to `.vue`, `.ts`, and `.scss` files hot-reload instantly.
- Edits to `quasar.config.ts` trigger a full restart.
- Stop the dev server with `Ctrl+C` in the terminal.

---

## Other commands

| Command          | What it does                      |
| ---------------- | --------------------------------- |
| `quasar dev`     | Start the dev server (hot-reload) |
| `quasar build`   | Production build → `dist/spa/`    |
| `npm run lint`   | Run ESLint across the project     |
| `npm run format` | Run Prettier to auto-format files |
| `quasar clean`   | Delete build artifacts and cache  |

---

## Tech stack

| Layer         | Choice                                    |
| ------------- | ----------------------------------------- |
| Framework     | Vue 3 (Composition API, `<script setup>`) |
| Component kit | Quasar Framework v2                       |
| Language      | TypeScript (strict mode)                  |
| State         | Pinia                                     |
| Routing       | Vue Router (hash mode)                    |
| Styling       | SCSS                                      |
| Bundler       | Vite (via Quasar CLI)                     |
| Linting       | ESLint + Prettier + vite-plugin-checker   |
| Rendering     | Client-only SPA — no SSR                  |

No backend, no database. Game state lives in memory, and will be
persisted to `localStorage` later.

---

## Project structure

    DustWars/
    ├── public/                 static assets served as-is
    ├── src/
    │   ├── components/         reusable Vue components
    │   ├── css/                global styles + design tokens
    │   ├── data/               static definitions (cities, drugs, cars)
    │   ├── domain/             pure game logic — no Vue, no Pinia
    │   ├── layouts/            page shells (topbar + sidebar grid)
    │   ├── pages/              one folder per screen (market, map, bank, log)
    │   ├── router/             route table + vue-router setup
    │   ├── stores/             Pinia stores (game, market, world)
    │   ├── types/              TypeScript type definitions
    │   └── utils/              small pure helpers (formatting, RNG)
    ├── quasar.config.ts        Quasar build + alias config
    ├── tsconfig.json           TS config (extends .quasar/tsconfig.json)
    └── package.json

**Dependency rule:** `domain/` and `data/` never import from `stores/`,
`components/`, `pages/`, or `layouts/`. `utils/` is pure and may be
imported from anywhere.

---

## Design

Dark, dim, easy on the eyes. Antique gold on near-black, with muted
forest-green and wine-red accents.

The palette is defined once in `src/css/tokens.scss` as CSS custom
properties. Components reference those variables — `var(--gold)`,
`var(--wine-soft)` — rather than hard-coded color values. Quasar's
own semantic colors are mapped in `src/css/quasar.variables.scss`.

Base font size is 16px. Prices and stat values are 20px. Trade log
text is 15px. These are set as tokens and should not be shrunk.

---

## Status

Early development. Working: shell layout, topbar, sidebar, routing.
Next: market screen with live per-city pricing, buy/sell actions,
and the day/travel loop.
