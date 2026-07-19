# puzzleui

A small puzzle-component library built on [Ark UI](https://ark-ui.com/docs) primitives, with all state
managed by hand-written [Zag JS](https://zagjs.com) state machines (the same engine Ark UI's own components
are built on).

```
pnpm install
pnpm dev      # examples app
pnpm build    # typecheck + production build
```

## Components

### `Cryptex` — src/lib/cryptex

Modeled on the mechanical letter-lock from *The Da Vinci Code*: a fixed word length, and for each position a
set of candidate letters the player can dial in. An optional `solution` prop lets the component report when
the dialed word matches.

```tsx
import { Cryptex } from './lib/cryptex'

<Cryptex.Root letters={[['G','C','B'], ['A','O','U'], ...]} solution="GARDEN" onSolvedChange={...}>
  <Cryptex.Label>Crack the cryptex</Cryptex.Label>
  {letters.map((opts, i) => (
    <Cryptex.Wheel key={i} index={i} letters={opts} />
  ))}
  <Cryptex.ValueText />
  <Cryptex.SolvedIndicator fallback={<span>Locked</span>}>Unlocked!</Cryptex.SolvedIndicator>
</Cryptex.Root>
```

Each `Cryptex.Wheel` is an Ark UI `RadioGroup` under the hood (one selectable letter per position); the
`cryptex.machine.ts` Zag machine owns the combined per-wheel value, the derived guess string, and `solved`.

The example app (`src/examples/cryptex-example.tsx`) adds a "Save this combination" button that pushes the
current guess into a list rendered below the puzzle.

### `Acrostic` — src/lib/acrostic

A puzzle-hunt style acrostic: a series of clued lines, each with an outer word (6+ letters). Hidden inside
each outer word is a shorter word (3+ letters, contiguous). Click one letter then another (or drag) to mark
the span of the hidden word. The first letter of each line's hidden word, in order, spells the final answer.

```tsx
import { Acrostic } from './lib/acrostic'

<Acrostic.Root lines={[{ clue: 'Unlocked, unsealed, or begun', word: 'OPENED' }, ...]} solution="PUZZLE">
  {lines.map((_, i) => (
    <Acrostic.Line key={i} index={i} />
  ))}
  <Acrostic.Answer />
  <Acrostic.SolvedIndicator fallback={<span>Keep going…</span>}>Solved!</Acrostic.SolvedIndicator>
</Acrostic.Root>
```

The bundled example (`src/examples/acrostic-example.tsx`) spells **PUZZLE** from six real words:
OPENED→PEN, HOUSES→USE, AMAZED→ZED, ZIGZAG→ZAG, PILOTS→LOT, CHEATS→EAT.

## Architecture

Both components follow the same pattern Ark UI itself uses internally for every component (verified against
`@ark-ui/react`'s own source):

- `*.types.ts` — the Zag `MachineSchema` (state/props/context/computed/events) plus the public `Api` shape.
- `*.machine.ts` — a `createMachine` state machine from `@zag-js/core` (props, context, computed, watchers,
  transitions, actions).
- `*.connect.ts` — turns a running machine `Service` into the public `Api`, producing DOM props via
  `normalize.element(...)` and `data-scope`/`data-part` attributes for styling (Ark UI's own styling
  convention).
- `use-*.ts` — the React hook: `useMachine(machine, props)` + `connect(service, normalizeProps)`, exactly the
  pattern documented at zagjs.com and used by every Ark UI component.
- `*-context.tsx`, `*-root.tsx`, `*-<part>.tsx` — the compound-component React layer, built on Ark UI's `ark`
  factory (`@ark-ui/react/factory`) for polymorphic, `asChild`-capable DOM parts. `Cryptex.Wheel` composes
  Ark UI's real `RadioGroup` component for its letter selection UI.

Styling hooks into the same `[data-scope][data-part]` attributes Ark UI documents for its own components
(`src/styles/globals.css`).
