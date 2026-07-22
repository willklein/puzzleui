import { PropsTable } from './props-table'
import { AnatomyList } from './anatomy-list'
import { CodeBlock } from './code-block'

const USAGE = `import { Cryptex } from './lib/cryptex'

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
</Cryptex.Root>`

export function CryptexDocs() {
  return (
    <section className="docs-section">
      <h2>Cryptex</h2>
      <p className="docs-lede">
        Models the rotating letter-lock from <em>The Da Vinci Code</em>: a fixed word length, and for each position a
        set of candidate letters a player can dial in. Give it a <code>solution</code> and it reports when the dialed
        word matches.
      </p>

      <h3>Anatomy</h3>
      <AnatomyList
        parts={[
          { name: 'Cryptex.Root', description: 'Owns the puzzle state and provides it to every child part.' },
          { name: 'Cryptex.Label', description: 'An optional label for the puzzle.' },
          {
            name: 'Cryptex.Wheel',
            description:
              'One reel for a single word position: a focusable button showing the current letter, with the neighboring candidates visible above/below and step buttons for mouse users.',
          },
          {
            name: 'Cryptex.ValueText',
            description: 'Displays the currently dialed word (defaults to the guess, padded with `_`).',
          },
          {
            name: 'Cryptex.SolvedIndicator',
            description: 'Renders its children once `solved` is true, otherwise renders `fallback`.',
          },
        ]}
      />

      <h3>Keyboard interactions</h3>
      <p className="docs-note">
        Only one wheel is in the tab order at a time (roving tabindex). Click a wheel, or tab into the puzzle, to focus
        the first one.
      </p>
      <AnatomyList
        parts={[
          {
            name: '↑ / ↓',
            description: 'Dial the focused wheel to the candidate above/below it, wrapping at the ends.',
          },
          { name: '← / →', description: 'Move focus to the neighboring wheel, wrapping at the ends.' },
        ]}
      />

      <h3>Cryptex.Root props</h3>
      <PropsTable
        rows={[
          {
            name: 'letters',
            type: 'string[][]',
            description:
              'Candidate letters for each wheel, top-to-bottom. letters[i] are the options for position i; the word length is letters.length.',
          },
          {
            name: 'solution',
            type: 'string',
            description: 'The correct combination. When provided, `solved` becomes computable.',
          },
          { name: 'value', type: 'string[]', description: 'Controlled value: one letter per wheel.' },
          {
            name: 'defaultValue',
            type: 'string[]',
            description: "Initial value when uncontrolled. Unset positions default to that wheel's first candidate.",
            default: '[]',
          },
          { name: 'disabled', type: 'boolean', description: 'Disables interaction with every wheel.' },
          {
            name: 'onValueChange',
            type: '(details: { value: string[]; valueAsString: string }) => void',
            description: "Called whenever any wheel's value changes.",
          },
          {
            name: 'onSolvedChange',
            type: '(solved: boolean) => void',
            description: 'Called whenever `solved` changes.',
          },
          { name: 'id', type: 'string', description: 'Base id used to derive part ids.' },
        ]}
      />

      <h3>Cryptex.Wheel props</h3>
      <PropsTable
        rows={[
          { name: 'index', type: 'number', description: 'Which wheel (word position) this renders, 0-indexed.' },
          { name: 'letters', type: 'string[]', description: 'The candidate letters for this wheel, top-to-bottom.' },
        ]}
      />

      <h3>Cryptex.SolvedIndicator props</h3>
      <PropsTable
        rows={[
          { name: 'fallback', type: 'ReactNode', description: 'Content to render while the puzzle is not yet solved.' },
        ]}
      />

      <h3>Usage</h3>
      <CodeBlock code={USAGE} />
    </section>
  )
}
