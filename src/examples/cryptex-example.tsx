import { useState } from 'react'
import { Cryptex } from '../lib/cryptex'

interface Attempt {
  guess: string
  correct: boolean
}

const SOLUTION = 'GARDEN'

const LETTERS: string[][] = [
  ['B', 'C', 'G'],
  ['O', 'A', 'U'],
  ['L', 'R', 'N'],
  ['P', 'T', 'D'],
  ['O', 'I', 'E'],
  ['S', 'N', 'M'],
]

export function CryptexExample() {
  const [guess, setGuess] = useState('')
  const [solved, setSolved] = useState(false)
  const [attempts, setAttempts] = useState<Attempt[]>([])

  const canSave = guess.length === LETTERS.length

  return (
    <div className="example">
      <p className="example-intro">
        Dial in each wheel to line up a six-letter word. Click a wheel or tab into the puzzle, then use{' '}
        <kbd>↑</kbd>/<kbd>↓</kbd> to swap in the letter above or below, and <kbd>←</kbd>/<kbd>→</kbd> to move
        between wheels. Save a combination to add it to the list below — the cryptex itself unlocks only when
        the letters match the hidden solution.
      </p>

      <Cryptex.Root
        className="cryptex"
        letters={LETTERS}
        solution={SOLUTION}
        onValueChange={(details) => setGuess(details.valueAsString)}
        onSolvedChange={setSolved}
      >
        <Cryptex.Label className="cryptex-label">Crack the cryptex</Cryptex.Label>

        <div className="cryptex-wheels">
          {LETTERS.map((letters, index) => (
            <Cryptex.Wheel key={index} index={index} letters={letters} className="cryptex-wheel" />
          ))}
        </div>

        <Cryptex.ValueText className="cryptex-value-text" />

        <Cryptex.SolvedIndicator className="cryptex-solved" fallback={<span>Locked</span>}>
          Unlocked! The word was {SOLUTION}.
        </Cryptex.SolvedIndicator>
      </Cryptex.Root>

      <button
        type="button"
        className="save-button"
        disabled={!canSave}
        onClick={() =>
          setAttempts((prev) => [{ guess, correct: solved }, ...prev])
        }
      >
        Save this combination
      </button>

      <div className="saved-list">
        <h3>Saved combinations</h3>
        {attempts.length === 0 ? (
          <p className="saved-empty">Nothing saved yet — dial in a full word and save it.</p>
        ) : (
          <ol>
            {attempts.map((attempt, i) => (
              <li key={i} className={attempt.correct ? 'saved-item correct' : 'saved-item'}>
                <span className="saved-guess">{attempt.guess}</span>
                <span className="saved-status">{attempt.correct ? 'Solved' : 'Not solved'}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  )
}
