# puzzleui

A small puzzle-component library built on [Ark UI](https://ark-ui.com/docs) primitives, with all state
managed by hand-written [Zag JS](https://zagjs.com) state machines (the same engine Ark UI's own components
are built on).

```
pnpm install
pnpm dev      # examples + docs app
pnpm build    # typecheck + production build
```

The dev app has two tabs, **Cryptex** and **Acrostic** — each a live playable example with its component's
docs (anatomy, props tables, usage snippet) rendered underneath, the same content as below, kept in sync.

## Components

### `Cryptex` — src/lib/cryptex

Models the rotating letter-lock from *The Da Vinci Code*: a fixed word length, and for each position a set
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

| Part | Description |
| --- | --- |
| `Cryptex.Root` | Owns the puzzle state and provides it to every child part. |
| `Cryptex.Label` | An optional label for the puzzle. |
| `Cryptex.Wheel` | One reel for a single word position: a focusable button showing the current letter, with the neighboring candidates visible above/below and step buttons for mouse users. |
| `Cryptex.ValueText` | Displays the currently dialed word (defaults to the guess, padded with `_`). |
| `Cryptex.SolvedIndicator` | Renders its children once `solved` is true, otherwise renders `fallback`. |

**Keyboard interactions** — only one wheel is in the tab order at a time (roving tabindex); click a wheel,
or tab into the puzzle, to focus the first one.

| Keys | Behavior |
| --- | --- |
| `↑` / `↓` | Dial the focused wheel to the candidate above/below it, wrapping at the ends. |
| `←` / `→` | Move focus to the neighboring wheel, wrapping at the ends. |

**`Cryptex.Root` props**

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `letters` | `string[][]` | — | Candidate letters for each wheel, top-to-bottom. `letters[i]` are the options for position `i`; the word length is `letters.length`. |
| `solution` | `string` | — | The correct combination. When provided, `solved` becomes computable. |
| `value` | `string[]` | — | Controlled value: one letter per wheel. |
| `defaultValue` | `string[]` | `[]` | Initial value when uncontrolled. Unset positions default to that wheel's first candidate. |
| `disabled` | `boolean` | — | Disables interaction with every wheel. |
| `onValueChange` | `(details: { value: string[]; valueAsString: string }) => void` | — | Called whenever any wheel's value changes. |
| `onSolvedChange` | `(solved: boolean) => void` | — | Called whenever `solved` changes. |
| `id` | `string` | — | Base id used to derive part ids. |

**`Cryptex.Wheel` props**: `index: number` (0-indexed position), `letters: string[]` (this wheel's candidates).

**`Cryptex.SolvedIndicator` props**: `fallback?: ReactNode` (content shown while not solved).

The example app (`src/examples/cryptex-example.tsx`) adds a "Save this combination" button that pushes the
current guess into a list rendered below the puzzle.

### `Acrostic` — src/lib/acrostic

A puzzle-hunt style clue chain: each line has an outer word (6+ letters) hiding a shorter word (3+ letters)
as a contiguous span. Click one letter then another within a line to mark the span — the first letter of
each line's marked span, in order, spells the final answer.

```tsx
import { Acrostic } from './lib/acrostic'

const lines = [
  { clue: 'Unlocked, unsealed, or begun', word: 'OPENED' },
  { clue: 'Dwellings where families live', word: 'HOUSES' },
]

<Acrostic.Root lines={lines} solution="PU" onSolvedChange={console.log}>
  {lines.map((_, index) => (
    <Acrostic.Line key={index} index={index} />
  ))}

  <Acrostic.Answer />
  <Acrostic.SolvedIndicator fallback={<span>Keep going…</span>}>Solved!</Acrostic.SolvedIndicator>
</Acrostic.Root>
```

**Anatomy**

| Part | Description |
| --- | --- |
| `Acrostic.Root` | Owns the puzzle state and provides it to every child part. |
| `Acrostic.Line` | One clue + outer word row for `index`. Composes `Acrostic.Clue` and `Acrostic.Word` internally. |
| `Acrostic.Clue` | The clue text for `index` (defaults to `lines[index].clue`). |
| `Acrostic.Word` | The row of letter buttons for `index`'s outer word. |
| `Acrostic.Letter` | A single letter button. Click two letters in the same line to mark the span between them. |
| `Acrostic.Answer` | Displays the assembled final answer (unfilled lines render as `_`). |
| `Acrostic.SolvedIndicator` | Renders its children once `solved` is true, otherwise renders `fallback`. |

**`Acrostic.Root` props**

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `lines` | `{ clue: string; word: string }[]` | — | One clue + outer word per line, in the order the final answer is spelled. |
| `solution` | `string` | — | The final answer, spelled by the first letter of each line's hidden word. |
| `selections` | `Array<{ start: number; end: number } \| null>` | — | Controlled per-line hidden-word span selections. |
| `defaultSelections` | `Array<{ start: number; end: number } \| null>` | `[]` | Initial per-line selections when uncontrolled. |
| `disabled` | `boolean` | — | Disables selecting letters on every line. |
| `onAnswerChange` | `(details: { answer: string; selections }) => void` | — | Called whenever any line's selection changes. |
| `onSolvedChange` | `(solved: boolean) => void` | — | Called whenever `solved` changes. |
| `id` | `string` | — | Base id used to derive part ids. |

**`Acrostic.Line` / `Acrostic.Clue` / `Acrostic.Word` props**: `index: number` (0-indexed line, required on
all three).

**`Acrostic.Letter` props**: `lineIndex: number`, `letterIndex: number`.

**`Acrostic.SolvedIndicator` props**: `fallback?: ReactNode` (content shown while not solved).

`MIN_HIDDEN_WORD_LENGTH` (`3`) is exported from the library — a span shorter than that is discarded rather
than committed as a selection.

The bundled example (`src/examples/acrostic-example.tsx`) spells **PUZZLE** from six real words:
OPENED→PEN, HOUSES→USE, AMAZED→ZED, ZIGZAG→ZAG, PILOTS→LOT, CHEATS→EAT.

## Architecture

Both components follow the same pattern Ark UI itself uses internally for every component (verified against
`@ark-ui/react`'s own source):

- `*.types.ts` — the Zag `MachineSchema` (state/props/context/computed/events) plus the public `Api` shape.
- `*.machine.ts` — a `createMachine` state machine from `@zag-js/core` (props, context, computed, watchers,
  transitions, actions).
- `*.connect.ts` — turns a running machine `Service` into the public `Api`, producing DOM props via
  `normalize.element(...)`/`normalize.button(...)` and `data-scope`/`data-part` attributes for styling
  (Ark UI's own styling convention).
- `use-*.ts` — the React hook: `useMachine(machine, props)` + `connect(service, normalizeProps)`, exactly the
  pattern documented at zagjs.com and used by every Ark UI component.
- `*-context.tsx`, `*-root.tsx`, `*-<part>.tsx` — the compound-component React layer, built on Ark UI's `ark`
  factory (`@ark-ui/react/factory`) for polymorphic, `asChild`-capable DOM parts.

Styling hooks into the same `[data-scope][data-part]` attributes Ark UI documents for its own components
(`src/styles/globals.css`). The in-app docs (`src/docs`) are hand-authored, static content — not generated
from source — so keep them in sync with this README when either changes.
