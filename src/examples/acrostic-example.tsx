import { useState } from 'react'
import { Acrostic, type AcrosticLineData } from '../lib/acrostic'
import { AcrosticDocs } from '../docs/acrostic-docs'

const SOLUTION = 'PUZZLE'

const LINES: AcrosticLineData[] = [
  { clue: 'Unlocked, unsealed, or begun', word: 'OPENED' },
  { clue: 'Dwellings where families live', word: 'HOUSES' },
  { clue: 'Utterly astonished', word: 'AMAZED' },
  { clue: 'Moves in sharp, alternating turns', word: 'ZIGZAG' },
  { clue: 'Flies aircraft, or guides a ship', word: 'PILOTS' },
  { clue: 'Breaks the rules for unfair advantage', word: 'CHEATS' },
]

export function AcrosticExample() {
  const [answer, setAnswer] = useState('')
  const [solved, setSolved] = useState(false)

  return (
    <div className="example">
      <p className="example-intro">
        Each line hides a shorter word inside its outer word — click-drag across at least three consecutive
        letters to mark it. The first letter of each hidden word spells the final answer.
      </p>

      <Acrostic.Root
        className="acrostic"
        lines={LINES}
        solution={SOLUTION}
        onAnswerChange={(details) => setAnswer(details.answer)}
        onSolvedChange={setSolved}
      >
        {LINES.map((_, index) => (
          <Acrostic.Line key={index} index={index} className="acrostic-line" />
        ))}

        <div className="acrostic-answer-row">
          <span className="acrostic-answer-label">Answer</span>
          <Acrostic.Answer className="acrostic-answer" />
        </div>

        <Acrostic.SolvedIndicator className="acrostic-solved" fallback={<span>Keep going…</span>}>
          Solved! The hidden words spell {SOLUTION}.
        </Acrostic.SolvedIndicator>
      </Acrostic.Root>

      <p className="acrostic-debug">
        Current answer: <code>{answer || '(nothing selected yet)'}</code> {solved ? '✓' : ''}
      </p>

      <div className="example-docs">
        <AcrosticDocs />
      </div>
    </div>
  )
}
