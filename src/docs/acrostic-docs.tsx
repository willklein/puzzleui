import { PropsTable } from './props-table'
import { AnatomyList } from './anatomy-list'
import { CodeBlock } from './code-block'

const USAGE = `import { Acrostic } from './lib/acrostic'

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
</Acrostic.Root>`

export function AcrosticDocs() {
  return (
    <section className="docs-section">
      <h2>Acrostic</h2>
      <p className="docs-lede">
        A puzzle-hunt style clue chain: each line has an outer word (6+ letters) hiding a shorter word (3+
        letters) as a contiguous span. Click one letter then another within a line to mark the span — the
        first letter of each line's marked span, in order, spells the final answer.
      </p>

      <h3>Anatomy</h3>
      <AnatomyList
        parts={[
          { name: 'Acrostic.Root', description: 'Owns the puzzle state and provides it to every child part.' },
          {
            name: 'Acrostic.Line',
            description: "One clue + outer word row for `index`. Composes Acrostic.Clue and Acrostic.Word internally.",
          },
          { name: 'Acrostic.Clue', description: "The clue text for `index` (defaults to lines[index].clue)." },
          { name: 'Acrostic.Word', description: "The row of letter buttons for `index`'s outer word." },
          {
            name: 'Acrostic.Letter',
            description: 'A single letter button. Click two letters in the same line to mark the span between them.',
          },
          {
            name: 'Acrostic.Answer',
            description: 'Displays the assembled final answer (unfilled lines render as `_`).',
          },
          {
            name: 'Acrostic.SolvedIndicator',
            description: 'Renders its children once `solved` is true, otherwise renders `fallback`.',
          },
        ]}
      />

      <h3>Acrostic.Root props</h3>
      <PropsTable
        rows={[
          {
            name: 'lines',
            type: '{ clue: string; word: string }[]',
            description: 'One clue + outer word per line, in the order the final answer is spelled.',
          },
          {
            name: 'solution',
            type: 'string',
            description: "The final answer, spelled by the first letter of each line's hidden word.",
          },
          {
            name: 'selections',
            type: 'Array<{ start: number; end: number } | null>',
            description: 'Controlled per-line hidden-word span selections.',
          },
          {
            name: 'defaultSelections',
            type: 'Array<{ start: number; end: number } | null>',
            description: 'Initial per-line selections when uncontrolled.',
            default: '[]',
          },
          { name: 'disabled', type: 'boolean', description: 'Disables selecting letters on every line.' },
          {
            name: 'onAnswerChange',
            type: '(details: { answer: string; selections: Array<{ start; end } | null> }) => void',
            description: 'Called whenever any line’s selection changes.',
          },
          { name: 'onSolvedChange', type: '(solved: boolean) => void', description: 'Called whenever `solved` changes.' },
          { name: 'id', type: 'string', description: 'Base id used to derive part ids.' },
        ]}
      />

      <h3>Acrostic.Line / Clue / Word props</h3>
      <PropsTable
        rows={[{ name: 'index', type: 'number', description: 'Which line this renders, 0-indexed. Required on all three.' }]}
      />

      <h3>Acrostic.Letter props</h3>
      <PropsTable
        rows={[
          { name: 'lineIndex', type: 'number', description: 'Which line this letter belongs to.' },
          { name: 'letterIndex', type: 'number', description: "This letter's position within the line's word." },
        ]}
      />

      <h3>Acrostic.SolvedIndicator props</h3>
      <PropsTable
        rows={[{ name: 'fallback', type: 'ReactNode', description: 'Content to render while the puzzle is not yet solved.' }]}
      />

      <p className="docs-note">
        <code>MIN_HIDDEN_WORD_LENGTH</code> (3) is exported from the library — a span shorter than that is
        discarded rather than committed as a selection.
      </p>

      <h3>Usage</h3>
      <CodeBlock code={USAGE} />
    </section>
  )
}
