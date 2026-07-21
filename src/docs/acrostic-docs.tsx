import { PropsTable } from './props-table'
import { AnatomyList } from './anatomy-list'
import { CodeBlock } from './code-block'

const USAGE_ROOT = `import { Acrostic } from './lib/acrostic'

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
</Acrostic.Root>`

const USAGE_LINE = `// Alternative: skip Root's \`lines\` array entirely and let each
// Acrostic.Line own its layout directly.
<Acrostic.Root solution="PU" onSolvedChange={console.log}>
  <Acrostic.Line index={0} line={{ clue: 'Unlocked, unsealed, or begun', longWordLength: 6, smallWordStart: 1, smallWordEnd: 3 }} />
  <Acrostic.Line index={1} line={{ clue: 'Dwellings where families live', longWordLength: 6, smallWordStart: 2, smallWordEnd: 4 }} />

  <Acrostic.Answer />
</Acrostic.Root>`

export function AcrosticDocs() {
  return (
    <section className="docs-section">
      <h2>Acrostic</h2>
      <p className="docs-lede">
        A clue chain: each line has a clue and a row of blank boxes the player types their guess into
        directly — no answer text is ever stored or rendered, only how many boxes there are. The whole
        typed word is the <strong>long word</strong>; a configurable span within it is the{' '}
        <strong>small word</strong>. Each line's small word contributes its first letter, in order, to the
        final answer.
      </p>

      <h3>Anatomy</h3>
      <AnatomyList
        parts={[
          { name: 'Acrostic.Root', description: 'Owns the puzzle state and provides it to every child part.' },
          {
            name: 'Acrostic.Line',
            description:
              "One clue + box row for `index`. Composes Acrostic.Clue and Acrostic.Word internally. Can own its layout via its own `line` prop instead of Root's `lines` array.",
          },
          { name: 'Acrostic.Clue', description: "The clue text for `index` (defaults to lines[index].clue)." },
          {
            name: 'Acrostic.Word',
            description: "The row of blank input boxes for `index`'s long word, sized to lines[index].longWordLength.",
          },
          {
            name: 'Acrostic.Box',
            description:
              'One directly-typeable, single-letter input box within a line’s guess. Typing a letter auto-advances focus to the next box, including into the next line.',
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
            type: '{ clue: string; longWordLength: number; smallWordStart: number; smallWordEnd: number }[]',
            description:
              "Optional if every Acrostic.Line supplies its own line prop instead. longWordLength sets the box count; smallWordStart/smallWordEnd (0-indexed, inclusive) mark the small word — its first letter contributes to the answer.",
          },
          {
            name: 'solution',
            type: 'string',
            description: "The final answer, spelled by the first letter of each line's small word.",
          },
          {
            name: 'lettersInNextWord',
            type: 'boolean',
            description:
              "When true, every letter of a line's small word must also appear among the next line's typed letters (multiset containment) before the puzzle counts as complete. No effect on the last line. Once both sides are fully typed, the small word's boxes (and the line itself) pick up data-chain-valid or data-chain-invalid for styling.",
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
        rows={[
          { name: 'index', type: 'number', description: 'Which line this renders, 0-indexed. Required on all three.' },
          {
            name: 'line',
            type: '{ clue: string; longWordLength: number; smallWordStart: number; smallWordEnd: number }',
            description:
              "Acrostic.Line only. This line's own layout, as an alternative to including it in Root's lines array — overrides that array's entry at index if both are given.",
          },
        ]}
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
        typing just the small word's first letter updates the live <code>answer</code> preview but doesn't
        mark the puzzle solvable until the whole long word is filled in.
      </p>

      <h3>Usage</h3>
      <CodeBlock code={USAGE_ROOT} />
      <CodeBlock code={USAGE_LINE} />
    </section>
  )
}
