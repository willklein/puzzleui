# puzzleui

A small puzzle-component library built on [Ark UI](https://ark-ui.com/) primitives, with all state managed
by hand-written [Zag](https://zagjs.com/) state machines (the same engine Ark UI's own components are built
on).

Source: [GitHub](https://github.com/willklein/puzzleui) · [Tangled](https://tangled.org/willkle.in/puzzleui)

```
pnpm install
pnpm dev      # examples + docs app
pnpm build    # typecheck + production build
```

The dev app has three tabs, **Cryptex**, **Acrostic**, and **Sudoku** — each a live playable example with its
component's docs (anatomy, props tables, usage snippet) rendered underneath, the same content as below, kept
in sync.

## Components

### `Cryptex` — src/lib/cryptex

Models the rotating letter-lock from _The Da Vinci Code_: a fixed word length, and for each position a set
of candidate letters the player can dial in. Give it a `solution` and it reports when the dialed word
matches.

```tsx
import { Cryptex } from './lib/cryptex'

const letters = [
  ['B', 'C', 'G'],
  ['O', 'A', 'U'],
  ['L', 'R', 'N'],
]

<Cryptex.Root letters={letters} solution="CAR" onSolvedChange={console.log}>
  <Cryptex.Label>Crack the cryptex</Cryptex.Label>

  {letters.map((candidates, index) => (
    <Cryptex.Wheel key={index} index={index} letters={candidates} />
  ))}

  <Cryptex.ValueText />
  <Cryptex.SolvedIndicator fallback={<span>Locked</span>}>Unlocked!</Cryptex.SolvedIndicator>
</Cryptex.Root>
```

**Anatomy**

| Part                      | Description                                                                                                                                                               |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Cryptex.Root`            | Owns the puzzle state and provides it to every child part.                                                                                                                |
| `Cryptex.Label`           | An optional label for the puzzle.                                                                                                                                         |
| `Cryptex.Wheel`           | One reel for a single word position: a focusable button showing the current letter, with the neighboring candidates visible above/below and step buttons for mouse users. |
| `Cryptex.ValueText`       | Displays the currently dialed word (defaults to the guess, padded with `_`).                                                                                              |
| `Cryptex.SolvedIndicator` | Renders its children once `solved` is true, otherwise renders `fallback`.                                                                                                 |

**Keyboard interactions** — only one wheel is in the tab order at a time (roving tabindex); click a wheel,
or tab into the puzzle, to focus the first one.

| Keys      | Behavior                                                                      |
| --------- | ----------------------------------------------------------------------------- |
| `↑` / `↓` | Dial the focused wheel to the candidate above/below it, wrapping at the ends. |
| `←` / `→` | Move focus to the neighboring wheel, wrapping at the ends.                    |

**`Cryptex.Root` props**

| Prop             | Type                                                            | Default | Description                                                                                                                          |
| ---------------- | --------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `letters`        | `string[][]`                                                    | —       | Candidate letters for each wheel, top-to-bottom. `letters[i]` are the options for position `i`; the word length is `letters.length`. |
| `solution`       | `string`                                                        | —       | The correct combination. When provided, `solved` becomes computable.                                                                 |
| `value`          | `string[]`                                                      | —       | Controlled value: one letter per wheel.                                                                                              |
| `defaultValue`   | `string[]`                                                      | `[]`    | Initial value when uncontrolled. Unset positions default to that wheel's first candidate.                                            |
| `disabled`       | `boolean`                                                       | —       | Disables interaction with every wheel.                                                                                               |
| `onValueChange`  | `(details: { value: string[]; valueAsString: string }) => void` | —       | Called whenever any wheel's value changes.                                                                                           |
| `onSolvedChange` | `(solved: boolean) => void`                                     | —       | Called whenever `solved` changes.                                                                                                    |
| `id`             | `string`                                                        | —       | Base id used to derive part ids.                                                                                                     |

**`Cryptex.Wheel` props**: `index: number` (0-indexed position), `letters: string[]` (this wheel's candidates).

**`Cryptex.SolvedIndicator` props**: `fallback?: ReactNode` (content shown while not solved).

The example app (`src/examples/cryptex-example.tsx`) adds a "Save this combination" button that pushes the
current guess into a list rendered below the puzzle.

### `Acrostic` — src/lib/acrostic

A clue chain: each line has a clue and a row of blank boxes the player types their guess into directly, styled
like Cryptex's letter boxes but freeform (no cycling) — no answer text is ever stored or rendered, only how
many boxes there are. The whole typed word is the **long word**; a configurable span within it is the
**small word**. Each line's small word contributes its first letter, in order, to the final answer.

```tsx
import { Acrostic } from './lib/acrostic'

// A 6-box long word whose small word spans boxes 2-4 (0-indexed).
const lines = [
  { clue: 'Unlocked, unsealed, or begun', longWordLength: 6, smallWordStart: 1, smallWordEnd: 3 },
  { clue: 'Dwellings where families live', longWordLength: 6, smallWordStart: 2, smallWordEnd: 4 },
]

<Acrostic.Root lines={lines} solution="PU" onSolvedChange={console.log}>
  {lines.map((_, index) => (
    <Acrostic.Line key={index} index={index} />
  ))}

  <Acrostic.Answer />
  <Acrostic.SolvedIndicator fallback={<span>Keep going…</span>}>Solved!</Acrostic.SolvedIndicator>
</Acrostic.Root>
```

Lines don't have to live on Root — each `Acrostic.Line` can own its layout directly via its own `line` prop
instead (overriding Root's array entry at that index if both are given), so `lines` on Root is optional:

```tsx
<Acrostic.Root solution="PU" onSolvedChange={console.log}>
  <Acrostic.Line
    index={0}
    line={{ clue: 'Unlocked, unsealed, or begun', longWordLength: 6, smallWordStart: 1, smallWordEnd: 3 }}
  />
  <Acrostic.Line
    index={1}
    line={{ clue: 'Dwellings where families live', longWordLength: 6, smallWordStart: 2, smallWordEnd: 4 }}
  />
  <Acrostic.Answer />
</Acrostic.Root>
```

**Anatomy**

| Part                       | Description                                                                                                                                                          |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Acrostic.Root`            | Owns the puzzle state and provides it to every child part.                                                                                                           |
| `Acrostic.Line`            | One clue + box row for `index`. Composes `Acrostic.Clue` and `Acrostic.Word` internally. Can own its layout via its own `line` prop instead of Root's `lines` array. |
| `Acrostic.Clue`            | The clue text for `index` (defaults to `lines[index].clue`).                                                                                                         |
| `Acrostic.Word`            | The row of blank input boxes for `index`'s long word, sized to `lines[index].longWordLength`.                                                                        |
| `Acrostic.Box`             | One directly-typeable, single-letter input box within a line's guess. Typing a letter auto-advances focus to the next box, including into the next line.             |
| `Acrostic.Answer`          | Displays the assembled final answer (lines with no first letter yet render as `_`).                                                                                  |
| `Acrostic.SolvedIndicator` | Renders its children once `solved` is true, otherwise renders `fallback`.                                                                                            |

**`Acrostic.Root` props**

| Prop                | Type                                                                                       | Default | Description                                                                                                                                                                                                                                                                                                                             |
| ------------------- | ------------------------------------------------------------------------------------------ | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `lines`             | `{ clue: string; longWordLength: number; smallWordStart: number; smallWordEnd: number }[]` | —       | Optional if every `Acrostic.Line` supplies its own `line` prop instead. `longWordLength` sets the box count; `smallWordStart`/`smallWordEnd` (0-indexed, inclusive) mark the small word — its first letter contributes to the answer.                                                                                                   |
| `solution`          | `string`                                                                                   | —       | The final answer, spelled by the first letter of each line's small word.                                                                                                                                                                                                                                                                |
| `lettersInNextWord` | `boolean`                                                                                  | —       | When true, every letter of a line's small word must also appear among the next line's typed letters (multiset containment) before the puzzle counts as complete. No effect on the last line. Once both sides are fully typed, the small word's boxes (and the line itself) pick up `data-chain-valid`/`data-chain-invalid` for styling. |
| `guesses`           | `string[][]`                                                                               | —       | Controlled per-line, per-box guessed letters.                                                                                                                                                                                                                                                                                           |
| `defaultGuesses`    | `string[][]`                                                                               | `[]`    | Initial per-line guesses when uncontrolled.                                                                                                                                                                                                                                                                                             |
| `disabled`          | `boolean`                                                                                  | —       | Disables typing into every box.                                                                                                                                                                                                                                                                                                         |
| `onAnswerChange`    | `(details: { answer: string; guesses: string[][] }) => void`                               | —       | Called whenever any box changes.                                                                                                                                                                                                                                                                                                        |
| `onSolvedChange`    | `(solved: boolean) => void`                                                                | —       | Called whenever `solved` changes.                                                                                                                                                                                                                                                                                                       |
| `id`                | `string`                                                                                   | —       | Base id used to derive part ids.                                                                                                                                                                                                                                                                                                        |

**`Acrostic.Line` / `Acrostic.Clue` / `Acrostic.Word` props**: `index: number` (0-indexed line, required on
all three). `Acrostic.Line` also takes an optional `line: { clue, longWordLength, smallWordStart, smallWordEnd }`.

**`Acrostic.Box` props**: `lineIndex: number`, `boxIndex: number`.

**`Acrostic.SolvedIndicator` props**: `fallback?: ReactNode` (content shown while not solved).

A line only counts toward `complete`/`solved` once every box in it is filled — typing just the small word's
first letter updates the live `answer` preview but doesn't mark the puzzle solvable until the whole long word
is filled in.

The bundled example (`src/examples/acrostic-example.tsx`) spells **PUZZLE** from six lines, each with a
2–4 letter small word embedded in a 6-letter long word.

### `Sudoku` — src/lib/sudoku

A configurable-size Sudoku grid — 9×9, 6×6, 4×4, or any box-shaped layout — with a full note-taking system:
candidate notes per cell, a pair-highlight technique for marking when a digit has exactly two possible cells
within a box, row, or column (which then automatically crosses that digit out everywhere else it's no longer
possible), auto-note, auto-clear-on-commit, single-candidate auto-solve, and full undo/redo history.

```tsx
import { Sudoku, SUDOKU_9X9 } from './lib/sudoku'

// null marks an empty, player-fillable cell. Flat-indexed row * size + col.
const givens = [
  5, 3, null, null, 7, null, null, null, null,
  // ...9 rows of 9
]

<Sudoku.Root layout={SUDOKU_9X9} givens={givens} onSolvedChange={console.log}>
  <Sudoku.SolvedIndicator fallback={<span>Keep going…</span>}>Solved!</Sudoku.SolvedIndicator>
</Sudoku.Root>
```

`Sudoku.Root` renders `Sudoku.Grid` internally — unlike Cryptex/Acrostic, the consumer never maps cells
manually. A layout is just `{ size, boxWidth, boxHeight }` (with `boxWidth * boxHeight === size`); named
presets `SUDOKU_9X9`/`SUDOKU_6X6`/`SUDOKU_4X4` are exported for convenience, but any box-shaped size works:

```tsx
import { Sudoku, SUDOKU_6X6 } from './lib/sudoku'

// 6x6: boxes are 3 cols x 2 rows, laid out 2 boxes across x 3 down.
;<Sudoku.Root layout={SUDOKU_6X6} givens={sixBySixGivens} />
```

**Anatomy**

| Part                         | Description                                                                                                                 |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `Sudoku.Root`                | Owns the puzzle state and provides it to every child part. Renders `Sudoku.Grid` internally.                                |
| `Sudoku.Grid`                | Renders every cell in the grid — the consumer never maps cells manually.                                                    |
| `Sudoku.Cell`                | One cell, keyboard-navigable (roving tabindex). Shows its committed digit if filled, else composes `Sudoku.Note` per digit. |
| `Sudoku.Note`                | One candidate-digit slot within a cell. Purely display — notes toggle via the cell's own keyboard handling.                 |
| `Sudoku.SolvedIndicator`     | Renders its children once `solved` is true, otherwise renders `fallback`.                                                   |
| `Sudoku.Toolbar`             | A ready-made control strip composing every trigger/toggle below. Optional.                                                  |
| `Sudoku.NoteModeToggle`      | Toggles `noteMode` on click.                                                                                                |
| `Sudoku.HighlightModeToggle` | Sets `highlightMode` to its `mode` prop on click — one instance per kind (box/row/col).                                     |
| `Sudoku.AutoNoteTrigger`     | Calls `autoNote()` on click.                                                                                                |
| `Sudoku.ClearNotesTrigger`   | Calls `clearAllNotes()` on click.                                                                                           |
| `Sudoku.UndoTrigger`         | Calls `undo()` on click. Disabled when `canUndo` is false.                                                                  |
| `Sudoku.RedoTrigger`         | Calls `redo()` on click. Disabled when `canRedo` is false.                                                                  |

**Keyboard interactions**

| Keys                   | Behavior                                                                                                                                                                                                                                                                                     |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Arrow keys             | Move focus one cell, clamped at the grid edges (not wrapped).                                                                                                                                                                                                                                |
| Digit key (`1`..size)  | Sets the cell's value when `noteMode` is off; toggles a plain candidate note when `noteMode` is on.                                                                                                                                                                                          |
| `Shift` + digit key    | Toggles a plain candidate note, even while `noteMode` is off — a shortcut for jotting one note without leaving value-entry mode. While `noteMode` IS on, Shift instead marks/re-tags the note as highlighted using the current `highlightMode` (`'box'`/`'row'`/`'col'`).                    |
| `Backspace` / `Delete` | On a valued cell, clears its value and restores the notes it had right before being filled in, independent of anything else in the undo/redo history since. On an empty cell, clears its notes. (Undo/Redo buttons still walk the full history.)                                             |
| Click / tap            | Focuses the cell; if its notes (established via `autoNote()`) have narrowed to exactly one remaining candidate (`autoSolveOnClick`, on by default), commits it immediately — a forced cell the assist could solve from constraint math alone, but that was never noted, does not auto-solve. |

**`Sudoku.Root` props**

| Prop                                                               | Type                                                    | Default      | Description                                                                                                                    |
| ------------------------------------------------------------------ | ------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| `layout`                                                           | `{ size: number; boxWidth: number; boxHeight: number }` | `SUDOKU_9X9` | The grid shape. `boxWidth * boxHeight` must equal `size`.                                                                      |
| `givens`                                                           | `Array<number \| null>`                                 | —            | The puzzle's fixed clues, flat-indexed `row * size + col`. `null` marks an empty cell. Required, length `size * size`.         |
| `value` / `defaultValue` / `onValueChange`                         | `Array<number \| null>`                                 | —            | Controlled/uncontrolled per-cell committed digits (given + player-entered).                                                    |
| `notes` / `defaultNotes` / `onNotesChange`                         | `number[][]`                                            | —            | Controlled/uncontrolled per-cell candidate notes.                                                                              |
| `highlights` / `defaultHighlights` / `onHighlightsChange`          | `Array<Record<number, 'box' \| 'row' \| 'col'>>`        | —            | Controlled/uncontrolled per-cell note highlights.                                                                              |
| `noteMode` / `defaultNoteMode` / `onNoteModeChange`                | `boolean`                                               | `false`      | Whether digit keys toggle notes instead of setting the value.                                                                  |
| `highlightMode` / `defaultHighlightMode` / `onHighlightModeChange` | `'box' \| 'row' \| 'col'`                               | `'box'`      | Which kind newly-marked highlights get.                                                                                        |
| `autoSolveOnClick`                                                 | `boolean`                                               | `true`       | Whether clicking a cell with exactly one remaining candidate immediately commits it.                                           |
| `solution`                                                         | `Array<number \| null>`                                 | —            | An optional known-correct grid to validate against. Not required — `solved` otherwise self-verifies (complete + no conflicts). |
| `maxHistoryLength`                                                 | `number`                                                | `200`        | Maximum undo/redo stack depth.                                                                                                 |
| `disabled`                                                         | `boolean`                                               | —            | Disables interaction with every cell.                                                                                          |
| `onSolvedChange`                                                   | `(solved: boolean) => void`                             | —            | Called whenever `solved` changes.                                                                                              |
| `id`                                                               | `string`                                                | —            | Base id used to derive part ids.                                                                                               |

**`Sudoku.Cell` props**: `index: number` (flat-indexed `row * size + col`).

**`Sudoku.Note` props**: `index: number`, `digit: number`.

**`Sudoku.SolvedIndicator` props**: `fallback?: ReactNode` (content shown while not solved).

**`Sudoku.HighlightModeToggle` props**: `mode: 'box' | 'row' | 'col'` (which kind this button selects).

`Sudoku.Toolbar` and its sub-parts each render sensible default button text — pass `children` to any of them
to override it:

```tsx
<Sudoku.Root layout={SUDOKU_9X9} givens={givens}>
  <Sudoku.Toolbar />
</Sudoku.Root>

// Or compose the individual parts yourself for a custom layout/subset/labels:
<Sudoku.Root layout={SUDOKU_9X9} givens={givens}>
  <Sudoku.NoteModeToggle />
  <Sudoku.HighlightModeToggle mode="row">Pairs in a row</Sudoku.HighlightModeToggle>
  <Sudoku.UndoTrigger />
  <Sudoku.RedoTrigger />
</Sudoku.Root>
```

The pair-highlight mechanic is the core note-taking feature: marking a digit highlighted in exactly two cells
of the same box/row/column asserts "this digit can only be in one of these two cells." The component
propagates that — no other cell in that unit can hold it, and if those two cells also happen to share a
_different_ kind of unit (a box-pair that's also in the same row, for example), the digit is crossed out
there too. This mirrors two real solving techniques: pointing pairs (box → row/col) and box-line reduction
(row/col → box). Everything derives live from `notes`/`highlights`, so toggling a highlight off immediately
undoes its eliminations. There's also a separate, general undo/redo history covering every mutating action
(`Sudoku.Root`'s API exposes `undo()`/`redo()`/`canUndo`/`canRedo`), not just note pairs.

The bundled example (`src/examples/sudoku-example.tsx`) offers 9×9/6×6/4×4 preset puzzles with a toolbar for
notes mode, highlight mode, auto-note, and undo/redo.

## Architecture

All three components follow the same pattern [Ark UI](https://ark-ui.com/) itself uses internally for every
component (verified against `@ark-ui/react`'s own source):

- `*.types.ts` — the [Zag](https://zagjs.com/) `MachineSchema` (state/props/context/computed/events) plus
  the public `Api` shape.
- `*.machine.ts` — a `createMachine` state machine from `@zag-js/core` (props, context, computed, watchers,
  transitions, actions).
- `*.connect.ts` — turns a running machine `Service` into the public `Api`, producing DOM props via
  `normalize.element(...)`/`normalize.button(...)` and `data-scope`/`data-part` attributes for styling
  (Ark UI's own styling convention).
- `use-*.ts` — the React hook: `useMachine(machine, props)` + `connect(service, normalizeProps)`, exactly the
  pattern documented at [zagjs.com](https://zagjs.com/) and used by every Ark UI component.
- `*-context.tsx`, `*-root.tsx`, `*-<part>.tsx` — the compound-component React layer, built on Ark UI's `ark`
  factory (`@ark-ui/react/factory`) for polymorphic, `asChild`-capable DOM parts.

Styling hooks into the same `[data-scope][data-part]` attributes Ark UI documents for its own components
(`src/styles/globals.css`). The in-app docs (`src/docs`) are hand-authored, static content — not generated
from source — so keep them in sync with this README when either changes.
