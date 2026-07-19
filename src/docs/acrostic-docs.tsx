import { PropsTable } from './props-table'
import { AnatomyList } from './anatomy-list'
import { CodeBlock } from './code-block'

const USAGE = `import { Acrostic } from './lib/acrostic'

const lines = [
  { clue: 'Unlocked, unsealed, or begun', word: 'OPENED' },
  { clue: 'Dwellings where families live', word: 'HOUSES' },
]

<Acrostic.Root lines={lines} solution="OH" onSolvedChange={console.log}>
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
        A clue chain: each line has a clue and an answer word. The word itself is never shown — instead each
        line renders a row of blank boxes (one per letter) that the player types their guess into directly.
        The first letter of each line's guess, in order, spells the final answer.
      </p>

      <h3>Anatomy</h3>
      <AnatomyList
        parts={[
          { name: 'Acrostic.Root', description: 'Owns the puzzle state and provides it to every child part.' },
          {
            name: 'Acrostic.Line',
            description: "One clue + answer row for `index`. Composes Acrostic.Clue and Acrostic.Word internally.",
          },
          { name: 'Acrostic.Clue', description: "The clue text for `index` (defaults to lines[index].clue)." },
          {
            name: 'Acrostic.Word',
            description: "The row of blank input boxes for `index`'s answer, sized to that answer's length.",
          },
          {
            name: 'Acrostic.Box',
            description: 'One directly-typeable, single-letter input box within a line’s guess.',
          },
          {
            name: 'Acrostic.Answer',
            description: 'Displays the assembled final answer (lines with no first letter yet render as `_`).',
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
            description:
              "One clue + answer word per line, in the order the final answer is spelled. word is never rendered — only its length sizes that line's boxes.",
          },
          {
            name: 'solution',
            type: 'string',
            description: "The final answer, spelled by the first letter of each line's guess.",
          },
          {
            name: 'guesses',
            type: 'string[][]',
            description: 'Controlled per-line, per-box guessed letters.',
          },
          {
            name: 'defaultGuesses',
            type: 'string[][]',
            description: 'Initial per-line guesses when uncontrolled.',
            default: '[]',
          },
          { name: 'disabled', type: 'boolean', description: 'Disables typing into every box.' },
          {
            name: 'onAnswerChange',
            type: '(details: { answer: string; guesses: string[][] }) => void',
            description: 'Called whenever any box changes.',
          },
          { name: 'onSolvedChange', type: '(solved: boolean) => void', description: 'Called whenever `solved` changes.' },
          { name: 'id', type: 'string', description: 'Base id used to derive part ids.' },
        ]}
      />

      <h3>Acrostic.Line / Clue / Word props</h3>
      <PropsTable
        rows={[{ name: 'index', type: 'number', description: 'Which line this renders, 0-indexed. Required on all three.' }]}
      />

      <h3>Acrostic.Box props</h3>
      <PropsTable
        rows={[
          { name: 'lineIndex', type: 'number', description: 'Which line this box belongs to.' },
          { name: 'boxIndex', type: 'number', description: "This box's position within the line's guess." },
        ]}
      />

      <h3>Acrostic.SolvedIndicator props</h3>
      <PropsTable
        rows={[{ name: 'fallback', type: 'ReactNode', description: 'Content to render while the puzzle is not yet solved.' }]}
      />

      <p className="docs-note">
        A line only counts toward <code>complete</code>/<code>solved</code> once every box in it is filled —
        typing just a first letter updates the live <code>answer</code> preview but doesn't mark the puzzle
        solvable until each word is fully guessed.
      </p>

      <h3>Usage</h3>
      <CodeBlock code={USAGE} />
    </section>
  )
}
