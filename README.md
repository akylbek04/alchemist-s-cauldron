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

| Stage                  | Content                                                                          |
| ---------------------- | -------------------------------------------------------------------------------- |
| Precondition 1         | Repository setup, tooling, folder structure and quality checks                   |
| Level 1 — Basic        | Shelf & cauldron, parameter bars, recipe & brew check, timer, pause, leaderboard |
| Level 2 — Extended     | Difficulty selection, auto-save and Continue Game                                |
| Level 3 — Full game    | Drag & drop, tooltip, reactions, Pour Out, visual feedback, keyboard shortcuts  |

## Implemented

- [x] Precondition 1 — project setup

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
