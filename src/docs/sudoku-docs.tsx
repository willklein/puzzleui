import { PropsTable } from './props-table'
import { AnatomyList } from './anatomy-list'
import { CodeBlock } from './code-block'

const USAGE_ROOT = `import { Sudoku, SUDOKU_9X9 } from './lib/sudoku'

// null marks an empty, player-fillable cell. Flat-indexed row * size + col.
const givens = [
  5, 3, null, null, 7, null, null, null, null,
  // ...9 rows of 9
]

<Sudoku.Root layout={SUDOKU_9X9} givens={givens} onSolvedChange={console.log}>
  <Sudoku.SolvedIndicator fallback={<span>Keep going…</span>}>Solved!</Sudoku.SolvedIndicator>
</Sudoku.Root>`

const USAGE_LAYOUT = `import { Sudoku, SUDOKU_6X6 } from './lib/sudoku'

// 6x6: boxes are 3 cols x 2 rows, laid out 2 boxes across x 3 down.
<Sudoku.Root layout={SUDOKU_6X6} givens={sixBySixGivens} />

// Any box-shaped layout works, as long as boxWidth * boxHeight === size.
<Sudoku.Root layout={{ size: 4, boxWidth: 2, boxHeight: 2 }} givens={fourByFourGivens} />`

const USAGE_TOOLBAR = `// A ready-made control strip: notes-mode toggle, box/row/column highlight-mode
// buttons, auto-note, clear-notes, and undo/redo.
<Sudoku.Root layout={SUDOKU_9X9} givens={givens}>
  <Sudoku.Toolbar />
</Sudoku.Root>

// Or compose the individual parts yourself for a custom layout/subset/labels —
// each one is just a button wired to the matching Api method, with sensible
// default text that any children you pass override.
<Sudoku.Root layout={SUDOKU_9X9} givens={givens}>
  <Sudoku.NoteModeToggle />
  <Sudoku.HighlightModeToggle mode="row">Pairs in a row</Sudoku.HighlightModeToggle>
  <Sudoku.UndoTrigger />
  <Sudoku.RedoTrigger />
</Sudoku.Root>`

const USAGE_MODEL = `// Build state with useSudoku() outside Sudoku.Root's own subtree, then hand it
// to Root via the \`model\` prop — Root uses it instead of building its own, so
// it can be read/driven from anywhere, e.g. an external progress readout.
import { Sudoku, useSudoku, SUDOKU_9X9 } from './lib/sudoku'

function Puzzle() {
  const sudoku = useSudoku({ layout: SUDOKU_9X9, givens })
  const filled = sudoku.values.filter((v) => v != null).length

  return (
    <>
      <p>{filled} / {sudoku.layout.size * sudoku.layout.size} filled</p>
      <Sudoku.Root model={sudoku}>
        <Sudoku.Toolbar />
      </Sudoku.Root>
    </>
  )
}

// renderGrid={false} opts out of Root's automatic <Sudoku.Grid />, e.g. to
// fully customize per-cell rendering via children instead.
<Sudoku.Root layout={SUDOKU_9X9} givens={givens} renderGrid={false}>
  {/* your own cell rendering, reading from useSudokuContext() */}
</Sudoku.Root>`

const USAGE_GUARDS = `// shouldEventName guards run first and can veto an attempt (return false) before
// anything changes; onEventName callbacks fire after, with the state as it was
// immediately before. Together they cover what on*Change props can't: vetoing.
<Sudoku.Root
  layout={SUDOKU_9X9}
  givens={givens}
  solution={solution}
  shouldSetValue={({ data, state }) => solution[data.index] == null || data.digit === solution[data.index]}
  onSetValue={({ data }) => console.log('committed', data.digit, 'at', data.index)}
>
  <Sudoku.Toolbar />
</Sudoku.Root>`

const USAGE_EXTERNAL = `// Not every "special feature" needs a Sudoku.Root prop — the public Api and its
// data-value/data-part attributes are often enough on their own. This component
// highlights every cell sharing the focused cell's value, with zero changes to
// Sudoku itself; render it as a child of Sudoku.Root like any other part.
import { useSudokuContext } from './lib/sudoku'

function SudokuSameValueHighlight() {
  const sudoku = useSudokuContext()
  const selectedValue = sudoku.values[sudoku.focusedIndex]
  if (selectedValue == null) return null

  return (
    <style>{\`[data-scope='sudoku'][data-part='cell'][data-value='\${selectedValue}'] {
      background: var(--sudoku-same-value-bg);
    }\`}</style>
  )
}

<Sudoku.Root layout={SUDOKU_9X9} givens={givens}>
  <Sudoku.Toolbar />
  <SudokuSameValueHighlight />
</Sudoku.Root>`

export function SudokuDocs() {
  return (
    <section className="docs-section">
      <h2>Sudoku</h2>
      <p className="docs-lede">
        A configurable-size Sudoku grid (9×9, 6×6, 4×4, or any box-shaped layout) with a full note-taking system:
        candidate notes per cell, a "pair-highlight" technique for marking when a digit has exactly two possible cells
        within a box, row, or column — which then automatically crosses that digit out everywhere else it's no longer
        possible — plus auto-note, auto-clear-on-commit, single-candidate auto-solve, and full undo/redo history.
      </p>

      <h3>Anatomy</h3>
      <AnatomyList
        parts={[
          {
            name: 'Sudoku.Root',
            description: 'Owns the puzzle state and provides it to every child part. Renders Sudoku.Grid internally.',
          },
          {
            name: 'Sudoku.Grid',
            description: 'Renders every cell in the grid — the consumer never maps cells manually.',
          },
          {
            name: 'Sudoku.Cell',
            description:
              'One cell, keyboard-navigable (roving tabindex). Shows its committed digit if filled, otherwise composes Sudoku.Note for every digit `1..size`.',
          },
          {
            name: 'Sudoku.Note',
            description:
              "One candidate-digit slot within a cell. Purely display — notes are toggled via the cell's own keyboard handling, not by clicking a note directly.",
          },
          {
            name: 'Sudoku.SolvedIndicator',
            description: 'Renders its children once `solved` is true, otherwise renders `fallback`.',
          },
          {
            name: 'Sudoku.Toolbar',
            description:
              'A ready-made control strip composing every trigger/toggle below. Optional — nothing else in the tree depends on it.',
          },
          { name: 'Sudoku.NoteModeToggle', description: 'Toggles `noteMode` on click.' },
          {
            name: 'Sudoku.HighlightModeToggle',
            description: 'Sets `highlightMode` to its `mode` prop on click — one instance per kind (box/row/col).',
          },
          { name: 'Sudoku.AutoNoteTrigger', description: 'Calls `autoNote()` on click.' },
          { name: 'Sudoku.ClearNotesTrigger', description: 'Calls `clearAllNotes()` on click.' },
          { name: 'Sudoku.UndoTrigger', description: 'Calls `undo()` on click. Disabled when `canUndo` is false.' },
          { name: 'Sudoku.RedoTrigger', description: 'Calls `redo()` on click. Disabled when `canRedo` is false.' },
        ]}
      />

      <h3>Keyboard interactions</h3>
      <AnatomyList
        parts={[
          {
            name: 'Arrow keys',
            description: 'Move focus one cell at a time, clamped at the grid edges (not wrapped).',
          },
          {
            name: 'Digit key (1..size)',
            description:
              "Sets the cell's value when `noteMode` is off; toggles a plain candidate note when `noteMode` is on.",
          },
          {
            name: 'Shift + digit key',
            description:
              "Toggles a plain candidate note, even while `noteMode` is off — a shortcut for jotting one note without leaving value-entry mode. While `noteMode` IS on, Shift instead marks/re-tags the note as highlighted using the current `highlightMode` ('box', 'row', or 'col'), since a plain digit there already toggles a note.",
          },
          {
            name: 'Backspace / Delete',
            description:
              "On a valued cell, clears its value and restores the notes it had right before being filled in — deterministically, independent of what else has happened in the undo/redo history since. On an empty cell, clears just that cell's notes. No-op on a given cell. (The separate Undo/Redo buttons still walk the full action history.)",
          },
          {
            name: 'Click / tap',
            description:
              'Focuses the cell; if its notes (established via `autoNote()`) have narrowed to exactly one remaining, un-eliminated candidate (`autoSolveOnClick`, on by default), commits that digit immediately. Deliberately requires the player to have actually noted the cell — a forced cell the assist could solve from live constraint math alone, but that was never noted, does not auto-solve.',
          },
        ]}
      />

      <h3>Sudoku.Root props</h3>
      <PropsTable
        rows={[
          {
            name: 'layout',
            type: '{ size: number; boxWidth: number; boxHeight: number }',
            description:
              'The grid shape. boxWidth * boxHeight must equal size. Presets: SUDOKU_9X9, SUDOKU_6X6, SUDOKU_4X4.',
            default: 'SUDOKU_9X9',
          },
          {
            name: 'givens',
            type: 'Array<number | null>',
            description:
              "The puzzle's fixed clues, flat-indexed row * size + col. null marks an empty cell. Required, length size * size — unless model is supplied, in which case it's ignored.",
          },
          {
            name: 'model',
            type: 'UseSudokuReturn',
            description:
              'A pre-built useSudoku() instance to use instead of building one from the other props (which are then ignored). Lets state be read/driven from outside this subtree, or shared across multiple places in a page.',
          },
          {
            name: 'renderGrid',
            type: 'boolean',
            description:
              'Whether to auto-render Sudoku.Grid. Set to false to supply your own cell rendering via children instead.',
            default: 'true',
          },
          {
            name: 'value / defaultValue / onValueChange',
            type: 'Array<number | null>',
            description: 'Controlled/uncontrolled per-cell committed digits (given + player-entered).',
          },
          {
            name: 'notes / defaultNotes / onNotesChange',
            type: 'number[][]',
            description: 'Controlled/uncontrolled per-cell candidate notes.',
          },
          {
            name: 'highlights / defaultHighlights / onHighlightsChange',
            type: "Array<Record<number, 'box' | 'row' | 'col'>>",
            description:
              "Controlled/uncontrolled per-cell note highlights (digit → which kind of pair it's marked as).",
          },
          {
            name: 'noteMode / defaultNoteMode / onNoteModeChange',
            type: 'boolean',
            description: 'Whether digit keys toggle notes instead of setting the value.',
            default: 'false',
          },
          {
            name: 'highlightMode / defaultHighlightMode / onHighlightModeChange',
            type: "'box' | 'row' | 'col'",
            description: 'Which kind newly-marked highlights get.',
            default: "'box'",
          },
          {
            name: 'autoSolveOnClick',
            type: 'boolean',
            description: 'Whether clicking a cell with exactly one remaining candidate immediately commits it.',
            default: 'true',
          },
          {
            name: 'solution',
            type: 'Array<number | null>',
            description:
              'An optional known-correct grid to validate against. Not required — solved otherwise self-verifies via the standard Sudoku rules (complete + no conflicts).',
          },
          { name: 'maxHistoryLength', type: 'number', description: 'Maximum undo/redo stack depth.', default: '200' },
          { name: 'disabled', type: 'boolean', description: 'Disables interaction with every cell.' },
          {
            name: 'onSolvedChange',
            type: '(solved: boolean) => void',
            description: 'Called whenever `solved` changes.',
          },
          { name: 'id', type: 'string', description: 'Base id used to derive part ids.' },
        ]}
      />

      <h3>Sudoku.Root guards &amp; callbacks</h3>
      <p className="docs-note">
        Every mutating event has a matching <code>should*</code>/<code>on*</code> pair, distinct from the{' '}
        <code>on*Change</code> props above: an <code>on*Change</code> prop fires whenever a value actually{' '}
        <em>differs</em> (including from external controlled-prop changes) and receives the new value directly, while
        these fire whenever the event is <em>attempted</em> and receive <code>{'{ data, state }'}</code> (guard) or{' '}
        <code>{'{ data, prevState }'}</code> (callback) — <code>state</code>/<code>prevState</code> is a full snapshot
        of every readable Api field as it stood immediately before. Only a <code>should*</code> guard can veto an
        attempt (return <code>false</code>) before it happens; an <code>on*Change</code> prop cannot.
      </p>
      <PropsTable
        rows={[
          {
            name: 'shouldSetValue / onSetValue',
            type: '{ index: number; digit: number | null }',
            description:
              'Committing (or clearing) a cell — via setValue(), a digit key, Backspace, or click auto-solve.',
          },
          {
            name: 'shouldToggleNote / onToggleNote',
            type: '{ index: number; digit: number }',
            description: 'Toggling a plain candidate note.',
          },
          {
            name: 'shouldToggleNoteHighlight / onToggleNoteHighlight',
            type: '{ index: number; digit: number }',
            description: "Toggling/re-tagging a note's highlight.",
          },
          {
            name: 'shouldClearCellNotes / onClearCellNotes',
            type: '{ index: number }',
            description: "Clearing one cell's notes.",
          },
          {
            name: 'shouldAutoSolveCell / onAutoSolveCell',
            type: '{ index: number }',
            description:
              'Committing a cell via autoSolveCell()/click. digit is derivable as state.singleCandidate[data.index].',
          },
          {
            name: 'shouldAutoNote / onAutoNote',
            type: 'undefined',
            description: 'Bulk-filling every cell’s notes via autoNote().',
          },
          {
            name: 'shouldClearAllNotes / onClearAllNotes',
            type: 'undefined',
            description: 'Clearing every cell’s notes grid-wide.',
          },
          {
            name: 'shouldSetHighlightMode / onSetHighlightMode',
            type: '{ mode: SudokuHighlightKind }',
            description: 'Changing highlightMode.',
          },
          {
            name: 'shouldSetNoteMode / onSetNoteMode',
            type: '{ enabled: boolean }',
            description: 'Changing noteMode.',
          },
          { name: 'shouldUndo / onUndo', type: 'undefined', description: 'Calling undo().' },
          { name: 'shouldRedo / onRedo', type: 'undefined', description: 'Calling redo().' },
        ]}
      />

      <h3>Sudoku.Cell / Sudoku.Note props</h3>
      <PropsTable
        rows={[
          {
            name: 'index',
            type: 'number',
            description: 'Sudoku.Cell only. Which cell this renders, flat-indexed row * size + col.',
          },
          {
            name: 'index / digit',
            type: 'number',
            description: 'Sudoku.Note only. Which cell and candidate digit this slot represents.',
          },
        ]}
      />

      <h3>Sudoku.SolvedIndicator props</h3>
      <PropsTable
        rows={[
          { name: 'fallback', type: 'ReactNode', description: 'Content to render while the puzzle is not yet solved.' },
        ]}
      />

      <h3>Sudoku.HighlightModeToggle props</h3>
      <PropsTable
        rows={[
          { name: 'mode', type: "'box' | 'row' | 'col'", description: 'Which highlight kind this button selects.' },
        ]}
      />

      <p className="docs-note">
        <code>Sudoku.Toolbar</code> and its sub-parts (<code>NoteModeToggle</code>, <code>HighlightModeToggle</code>,{' '}
        <code>AutoNoteTrigger</code>, <code>ClearNotesTrigger</code>, <code>UndoTrigger</code>, <code>RedoTrigger</code>
        ) each render sensible default button text — pass <code>children</code> to any of them to override it.
      </p>

      <p className="docs-note">
        The pair-highlight technique is the core note-taking mechanic: marking a digit as highlighted in exactly two
        cells of the same box/row/column asserts "this digit can only be in one of these two cells" — the component then
        propagates that: no other cell in that unit can hold it, and if those two cells also happen to share a
        <em> different</em> kind of unit (a box-pair that's also in the same row, for example), the digit is crossed out
        there too. This mirrors two real solving techniques: pointing pairs (box → row/col) and box-line reduction
        (row/col → box). Everything is derived live from <code>notes</code>/<code>highlights</code>, so toggling a
        highlight off immediately un-does its eliminations.
      </p>

      <h3>Usage</h3>
      <CodeBlock code={USAGE_ROOT} />
      <CodeBlock code={USAGE_LAYOUT} />
      <CodeBlock code={USAGE_TOOLBAR} />
      <CodeBlock code={USAGE_MODEL} />
      <CodeBlock code={USAGE_GUARDS} />
      <CodeBlock code={USAGE_EXTERNAL} />
    </section>
  )
}
