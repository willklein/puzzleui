# Architecture

Design rationale and conventions for contributors extending or adding components. For how to _use_ a
component, see [README.md](README.md) — keep that document and this one in sync when either changes.

## Component skeleton

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
(`src/styles/globals.css`).

## Model prop + guards/callbacks

Introduced for `Sudoku` (reference implementation: `src/lib/sudoku/sudoku.types.ts`,
`sudoku.machine.ts`, `sudoku-root.tsx`) to close two gaps a plain `Root { ...config }` API can't:

1. **Opt-in complexity, à la [Workday Canvas Kit's "model"](https://canvas.workday.com/get-started/for-developers/documentation/compound-components#models).**
   A `model` prop on `*Root` accepts a pre-built `use*()` instance instead of building one from the other
   config props. This lets a consumer construct state outside the component's own subtree — read/drive it
   from a parent, share one instance across disconnected parts of a page, or fully customize per-part
   rendering (paired with a `render<Part>={false}` opt-out of the default auto-rendered children, e.g.
   Sudoku's `renderGrid`).

2. **Veto capability.** Every event that mutates state or a persistent mode gets a `should<Event>` guard
   (checked first, returns `false` to veto — no state change, no matching callback) and an `on<Event>`
   callback (fires after, with the state as it stood immediately before). This is a genuinely different
   capability from the existing `on<Field>Change` props: a `Change` prop fires whenever a value actually
   _differs_ and can only react, never veto.

**Shape to reuse** when a second component needs this (don't invent a new shape per component):

- `<Component>StateSnapshot` — a dedicated interface mirroring the full readable half of `<Component>Api`,
  not the (usually narrower) undo/redo history snapshot if one exists. Built once per guarded action via an
  unexported `buildStateSnapshot()` helper and reused as both `state` (guard) and `prevState` (callback).
- `type Guard<TData> = (params: { data: TData; state: StateSnapshot }) => boolean | void` and
  `type Callback<TData> = (params: { data: TData; prevState: StateSnapshot }) => void` — `boolean | void`,
  not strict `boolean`, since a guard with no return statement must type-check as "proceed" (checked via
  `=== false`).
- One per-event `data` type matching that event's real payload — omit fields the event doesn't actually
  carry even if derivable from `state` (e.g. Sudoku's `AUTO_SOLVE` guard/callback `data` is `{ index }`
  only; the digit is `state.singleCandidate[data.index]`).
- Thread guard/callback pairs through whatever single chokepoint function already applies every mutation
  (Sudoku's `commit()`) rather than duplicating the check-then-mutate-then-callback dance at every call
  site. Events that bypass that chokepoint (Sudoku's `undo`/`redo`, and simple `context.set()` actions like
  `setNoteMode`) get the same shape written out inline instead.
- `*Root`'s hook call must stay unconditional even when `model` is supplied — `const x = model ?? useX(...)`
  is **not** hooks-rule-safe (`||`/`??` on a hook call violates rules of hooks); call `useX()` every render
  into an `internal` variable, then pick with `model ?? internal` afterward. This means a second machine
  instance mounts and computes even when discarded — an accepted, bounded cost for what should stay a rare/
  advanced path, not a reason to avoid the pattern.
- **Gotcha:** the machine's `props()` factory is an explicit allowlist, not a spread. Every new guard/
  callback prop must be added there or `prop('shouldX')` silently returns `undefined` forever at runtime —
  no type error anywhere, since the prop _interface_ still declares it correctly.

Adopt this pattern when a second component actually needs external model construction or veto capability —
resist extracting it into a shared/published utility before then; one real, validated use case (plus
whatever a second component's implementation confirms is actually common) should drive that generic shape,
not speculation from a single instance.
