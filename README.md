# 🧪 Alchemist's Cauldron

A browser puzzle game: mix ingredients in a cauldron, move **Temperature**, **Density** and **Magic Power** into the recipe target ranges and brew potions before the time or lives run out.

Built with **TypeScript** and **Vite**, without frameworks or game libraries.

**Play:** https://akylbek04.github.io/alchemist-s-cauldron/

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
- [x] US 1.2 — cauldron parameter bars
- [x] US 1.3 — recipe & brewing check
- [x] US 1.4 — timer & game over

## How to play

- The start screen shows an empty shelf and cauldron, score and time `0` and no lives. Press **Start Game** (or **Help** for the rules).
- The game picks a random recipe. The recipe book shows its name, the 3 target ranges and the counter **Ingredients: 0 / 4**.
- The shelf shows 6 ingredients. Each card shows its **T**emperature, **D**ensity and **M**agic **P**ower and a badge with the portions left (random 2–15 per game).
- Click a card (or focus it and press **Enter** / **Space**) to add the ingredient to the cauldron. Each add spends 1 portion. An ingredient with 0 portions becomes an empty slot.
- The cauldron holds up to 4 ingredients. When it is full (**4 / 4**, highlighted), the shelf is blocked.
- The 3 bars show the cauldron's values (the sum of the added ingredients, starting at 0 / 0 / 0). The green zone is the recipe's target range, the diamond is the current value, and a bar glows when its value is inside the range. Temperature and Density can go negative: `0` is the center.
- Press **Brew**. Each value may miss its range by up to **±8**.
  - Success: **+200** points, **+10 s** (never above 150 s) and a new random recipe.
  - Failure: **−1 life**.
  - Either way the cauldron is cleared and the used ingredients are spent.
- The game starts with **150 s** and **3 lives** (hearts in the top bar). The timer shows `MM:SS` and a shrinking bar, and turns red and pulses under **15 s**. It is calculated from timestamps, so it stays correct in a background tab.
- The game ends when the time reaches `00:00`, all lives are lost, or the shelf and the cauldron are both empty (**Out of ingredients**). The Game Over screen shows the reason, the final score and **Play again**.

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

## Deploy

Every push to a `story-*` branch builds the game and deploys it to GitHub Pages (`.github/workflows/deploy.yml`). The final story PRs stay unmerged, so `main` is never deployed.
