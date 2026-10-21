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
- [x] US 1.5 — pause
- [x] US 1.6 — leaderboard (Top-10)
- [x] US 2.1 — difficulty selection
- [x] US 2.2 — auto-save & continue game
- [x] US 3.1 — drag & drop
- [x] US 3.2 — ingredient tooltip
- [x] US 3.3 — chemical reactions

Level 1 is complete.

## How to play

- The start screen shows an empty shelf and cauldron, score and time `0` and no lives. Press **Start Game** (or **Help** for the rules).
- **Settings** on the start screen chooses **Easy**, **Medium** (default, the Level 1 rules) or **Hard** for the next game. Every number comes from the difficulty table:

  | Setting        | Easy  | Medium | Hard  |
  | -------------- | :---: | :----: | :---: |
  | Shelf          |   4   |   6    |   8   |
  | Cauldron limit |   4   |   4    |   5   |
  | Start time     | 180 s | 150 s  | 150 s |
  | Tolerance      |  ±12  |   ±8   |  ±5   |
  | Lives          |   5   |   3    |   3   |
  | Score per brew |  100  |  200   |  300  |
  | Time bonus     | +15 s | +10 s  | +5 s  |
  | Reactions      |   0   |   2    |   3   |

  Recipes come only from the chosen difficulty. The difficulty can't be changed during a game. The rest of this list describes **Medium**.

- The game picks a random recipe. The recipe book shows its name, the 3 target ranges and the counter **Ingredients: 0 / 4**.
- The shelf shows 6 ingredients. Each card shows only its icon, name and a badge with the portions left (random 2–15 per game). Hover a card (or focus it with the keyboard) to see its **Temperature**, **Density** and **Magic Power** in a tooltip, with `+` / `−` signs. Near the right or bottom screen edge the tooltip opens to the left or upward; it is hidden while the game is paused.
- Click a card (or focus it and press **Enter** / **Space**) to add the ingredient to the cauldron, or drag the card into the cauldron with the mouse (the cauldron glows while a valid card is over it). A drop follows the same rules as a click: nothing happens when the cauldron is full or the game is paused, and empty slots can't be dragged. Each add spends 1 portion. An ingredient with 0 portions becomes an empty slot.
- **Reactions** (Medium and Hard): some mixes react while they stay in the cauldron. The values are always rebuilt from the ingredient list: plain sums first, then every active reaction in table order. The bars and the brew check both use these values. A reaction fires (message, and its one-time time or life cost) only when it changes from not active to active; adding more ingredients to the same mix does not fire it again. **Help** lists the reactions of the current difficulty.

  | Difficulty | Reaction       | Trigger                                                    | Effect                              |
  | ---------- | -------------- | ---------------------------------------------------------- | ----------------------------------- |
  | Medium     | Bubbling       | Fairy Dust + Caustic Acid                                  | Magic Power +50%, −10 s once        |
  | Medium     | Solar Frost    | Dragon Tears + Frost Lotus                                 | Temperature set to 0, Density +20%  |
  | Hard       | Volatile Mix   | Phoenix Feather + Essence of the Void                      | −1 life and the cauldron is cleared |
  | Hard       | Pressure Spike | Total Density ≥ 70                                         | Density set to 70, Magic Power +10% |
  | Hard       | Burning Root   | Mandrake Root + Phoenix Feather and total Temperature ≥ 40 | Temperature +15, Density −10%       |

  Percent changes are rounded to whole numbers. Medium uses only ingredients from its 6-card shelf.

- The cauldron holds up to 4 ingredients. When it is full (**4 / 4**, highlighted), the shelf is blocked.
- The 3 bars show the cauldron's values (the sum of the added ingredients, starting at 0 / 0 / 0). The green zone is the recipe's target range, the diamond is the current value, and a bar glows when its value is inside the range. Temperature and Density can go negative: `0` is the center.
- Press **Brew**. Each value may miss its range by up to **±8**.
  - Success: **+200** points, **+10 s** (never above 150 s) and a new random recipe.
  - Failure: **−1 life**.
  - Either way the cauldron is cleared and the used ingredients are spent.
- The game starts with **150 s** and **3 lives** (hearts in the top bar). The timer shows `MM:SS` and a shrinking bar, and turns red and pulses under **15 s**. It is calculated from timestamps, so it stays correct in a background tab.
- Press the **Pause** button next to the timer to stop the game: the timer stops, the field is blurred and the shelf and Brew are blocked. **Resume** continues the same game, **Exit to Menu** goes back to the start screen. The game also pauses by itself when the browser tab is hidden.
- The running game is saved in `localStorage` after every move, on pause and while the timer runs. After a reload, **Continue Game** appears on the start screen. It restores the same difficulty, score, time, lives, recipe, cauldron and stock (not re-rolled) and opens the game paused. A new game overwrites the save; **Exit to Menu** and Game Over delete it. A broken or edited save is checked field by field, deleted, and never offered.
- The game ends when the time reaches `00:00`, all lives are lost, or the shelf and the cauldron are both empty (**Out of ingredients**). The Game Over screen shows the reason, the final score and **Play again**.
- If the final score (above 0) makes the Top-10, the Game Over screen asks for a name: 2–15 characters, letters, digits, space, `_` and `-`. The result is saved in `localStorage`.
- The **Leaderboard** (from the start screen or the Game Over screen) keeps one Top-10 per difficulty, with **Easy / Medium / Hard** tabs. It opens on the current difficulty and shows rank, name, score, difficulty and date (`DD.MM.YYYY HH:MM`), sorted by score; on equal scores the earlier result stays higher. **Clear Leaderboard** clears the shown difficulty and asks for confirmation in an in-app dialog. Broken or blocked storage never crashes the game: the board is just empty.

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
