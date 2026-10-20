# 🧪 Alchemist's Cauldron

A browser puzzle game: mix ingredients in a cauldron, move **Temperature**, **Density** and **Magic Power** into the recipe target ranges and brew potions before the time or lives run out.

Built with **TypeScript** and **Vite**, without frameworks or game libraries.

## Game goal

1. A random recipe is picked. It shows 3 target ranges and how many ingredients you may use.
2. Add ingredients from the shelf to the cauldron. Each ingredient changes the 3 values and has a limited stock.
3. Click **Brew**. If every value is inside its range (± tolerance), you get points and extra time and a new recipe appears. Otherwise you lose a life.
4. The game ends when the time runs out, you lose all lives, or the ingredients run out.

## Task structure

The work is split into stories. Each story is developed in its own branch (`story-1`, `story-2`, …) with task branches merged into it.

| Stage               | Content                                                                          |
| ------------------- | -------------------------------------------------------------------------------- |
| Precondition 1      | Repository setup, tooling, folder structure and quality checks                   |
| Level 1 — Basic     | Shelf & cauldron, parameter bars, recipe & brew check, timer, pause, leaderboard |
| Level 2 — Extended  | Difficulty selection, auto-save and Continue Game                                |
| Level 3 — Full game | Drag & drop, tooltip, reactions, Pour Out, visual feedback, keyboard shortcuts   |

## Implemented

- [x] Precondition 1 — project setup
- [x] US 1.1 — ingredient shelf & cauldron

## How to play

- The shelf shows 6 ingredients. Each card shows its **Temperature**, **Density** and **Magic Power** and a badge with the portions left (random 2–15 per game).
- Click a card (or focus it and press **Enter** / **Space**) to add the ingredient to the cauldron. Each add spends 1 portion.
- An ingredient with 0 portions becomes an empty slot and can't be used.
- The cauldron holds up to 4 ingredients in the order they were added. When it is full (**Ingredients: 4 / 4**), the shelf is blocked.

## Project structure

```text
src/
  data/      static game data: ingredients, recipes, difficulty, reactions
  logic/     pure game rules: calculations, brew check, stock, timer
  state/     game state
  storage/   localStorage: save game, leaderboard
  ui/        DOM rendering and event handlers
  styles/    CSS
  assets/    icons and images
  main.ts    entry point
```

## How to run

Requires Node.js `^20.19.0` or `>=22.12.0`.

```bash
npm install
npm run dev       # start the dev server
npm run build     # type-check and build to dist/
npm run preview   # preview the production build
```

Code quality:

```bash
npm run lint          # ESLint (strict TypeScript rules, no console, no any)
npm run lint:fix      # ESLint with auto-fix
npm run format        # format all files with Prettier
npm run format:check  # check formatting
npm test              # game logic tests (Node built-in test runner)
```

Git hooks (Husky):

- `commit-msg` — the message must follow the RS School convention: `<type>: <description>`, e.g. `feat: add ingredient shelf`. Types: `init`, `feat`, `fix`, `refactor`, `docs`, `style`, `test`, `chore`, `perf`, `build`, `ci`, `revert`.
- `pre-push` — runs `lint`, `format:check` and `test`; the push is blocked if any of them fails.
