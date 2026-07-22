import { useState } from 'react'
import { Dialog } from '@ark-ui/react/dialog'
import { Portal } from '@ark-ui/react/portal'
import { Cryptex } from '../lib/cryptex'
import { CryptexDocs } from '../docs/cryptex-docs'

interface Attempt {
  guess: string
  correct: boolean
}

const MIN_LENGTH = 1
const MAX_LENGTH = 12
const MIN_LINES = 1

const DEFAULT_LINES: string[][] = [
  ['B', 'O', 'L', 'P', 'O', 'S'],
  ['C', 'A', 'R', 'T', 'I', 'N'],
  ['G', 'U', 'N', 'D', 'E', 'M'],
]
const DEFAULT_SOLUTION = 'GARDEN'

/** Transposes line-major editor rows into the column-major `letters` shape the Cryptex component expects. */
function linesToLetters(lines: string[][], length: number): string[][] {
  return Array.from({ length }, (_, col) => {
    const candidates = lines
      .map((line) => line[col]?.trim().toUpperCase())
      .filter((letter): letter is string => !!letter)
    return candidates.length > 0 ? candidates : ['?']
  })
}

function resizeLine(line: string[], length: number): string[] {
  return Array.from({ length }, (_, i) => line[i] ?? '')
}

export function CryptexExample() {
  const [guess, setGuess] = useState('')
  const [solved, setSolved] = useState(false)
  const [attempts, setAttempts] = useState<Attempt[]>([])

  const [length, setLength] = useState(DEFAULT_LINES[0].length)
  const [lines, setLines] = useState(DEFAULT_LINES)
  const [solution, setSolution] = useState<string | undefined>(DEFAULT_SOLUTION)
  const [configVersion, setConfigVersion] = useState(0)
  const letters = linesToLetters(lines, length)

  const [editorOpen, setEditorOpen] = useState(false)
  const [draftLength, setDraftLength] = useState(length)
  const [draftLines, setDraftLines] = useState(lines)
  const [draftSolution, setDraftSolution] = useState(solution ?? '')

  const canSave = guess.length === letters.length

  function handleOpenChange(details: { open: boolean }) {
    if (details.open) {
      setDraftLength(length)
      setDraftLines(lines)
      setDraftSolution(solution ?? '')
    }
    setEditorOpen(details.open)
  }

  function handleLengthChange(nextLength: number) {
    if (Number.isNaN(nextLength)) return
    const clamped = Math.min(Math.max(nextLength, MIN_LENGTH), MAX_LENGTH)
    setDraftLength(clamped)
    setDraftLines((prev) => prev.map((line) => resizeLine(line, clamped)))
  }

  function handleLetterChange(row: number, col: number, rawValue: string) {
    const letter = rawValue.slice(-1).toUpperCase()
    setDraftLines((prev) => prev.map((line, r) => (r === row ? line.map((l, c) => (c === col ? letter : l)) : line)))
  }

  function addRow() {
    setDraftLines((prev) => [...prev, resizeLine([], draftLength)])
  }

  function removeLastRow() {
    setDraftLines((prev) => (prev.length > MIN_LINES ? prev.slice(0, -1) : prev))
  }

  function handleUpdate() {
    const nextLetters = linesToLetters(draftLines, draftLength)
    const trimmedSolution = draftSolution.trim().toUpperCase()
    setLength(draftLength)
    setLines(draftLines)
    setSolution(trimmedSolution ? trimmedSolution : undefined)
    setGuess(nextLetters.map((candidates) => candidates[0]).join(''))
    setSolved(false)
    setConfigVersion((prev) => prev + 1)
    setEditorOpen(false)
  }

  return (
    <div className="example">
      <div className="example-toolbar">
        <p className="example-intro">
          Dial in each wheel to line up a word. Click a wheel or tab into the puzzle, then use <kbd>↑</kbd>/<kbd>↓</kbd>{' '}
          to swap in the letter above or below, and <kbd>←</kbd>/<kbd>→</kbd> to move between wheels. Save a combination
          to add it to the list below.
        </p>
        <Dialog.Root open={editorOpen} onOpenChange={handleOpenChange}>
          <Dialog.Trigger className="edit-button">Edit</Dialog.Trigger>
          <Portal>
            <Dialog.Backdrop className="dialog-backdrop" />
            <Dialog.Positioner className="dialog-positioner">
              <Dialog.Content className="dialog-content">
                <Dialog.Title className="dialog-title">Edit puzzle</Dialog.Title>
                <Dialog.Description className="dialog-description">
                  Set the word length, then fill in each row with one letter per position. Every row becomes a candidate
                  option for its column.
                </Dialog.Description>

                <label className="field">
                  <span className="field-label">Letters</span>
                  <input
                    type="number"
                    min={MIN_LENGTH}
                    max={MAX_LENGTH}
                    value={draftLength}
                    onChange={(event) => handleLengthChange(event.target.valueAsNumber)}
                    className="length-input"
                  />
                </label>

                <label className="field">
                  <span className="field-label">Solution (optional)</span>
                  <input
                    type="text"
                    value={draftSolution}
                    onChange={(event) => setDraftSolution(event.target.value)}
                    placeholder="e.g. GARDEN"
                    className="solution-input"
                  />
                </label>
                <p className="field-hint">
                  Leave blank if the puzzle shouldn't have a single correct answer — it'll still show the dialed word,
                  just never report as solved.
                </p>

                <div className="editor-lines">
                  {draftLines.map((line, row) => (
                    <div key={row} className="editor-line">
                      {line.map((letter, col) => (
                        <input
                          key={col}
                          type="text"
                          maxLength={1}
                          value={letter}
                          onChange={(event) => handleLetterChange(row, col, event.target.value)}
                          className="letter-input"
                          aria-label={`Row ${row + 1}, letter ${col + 1}`}
                        />
                      ))}
                    </div>
                  ))}
                </div>

                <div className="editor-row-actions">
                  <button type="button" onClick={addRow}>
                    Add row
                  </button>
                  <button type="button" onClick={removeLastRow} disabled={draftLines.length <= MIN_LINES}>
                    Delete last row
                  </button>
                </div>

                <div className="editor-actions">
                  <Dialog.CloseTrigger className="cancel-button">Cancel</Dialog.CloseTrigger>
                  <button type="button" className="update-button" onClick={handleUpdate}>
                    Update
                  </button>
                </div>
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.Root>
      </div>

      <Cryptex.Root
        key={configVersion}
        className="cryptex"
        letters={letters}
        solution={solution}
        onValueChange={(details) => setGuess(details.valueAsString)}
        onSolvedChange={setSolved}
      >
        <Cryptex.Label className="cryptex-label">Crack the cryptex</Cryptex.Label>

        <div className="cryptex-wheels">
          {letters.map((candidates, index) => (
            <Cryptex.Wheel key={index} index={index} letters={candidates} className="cryptex-wheel" />
          ))}
        </div>

        <Cryptex.ValueText className="cryptex-value-text" />

        <Cryptex.SolvedIndicator className="cryptex-solved" fallback={<span>Locked</span>}>
          Unlocked! The word was {solution}.
        </Cryptex.SolvedIndicator>
      </Cryptex.Root>

      <button
        type="button"
        className="save-button"
        disabled={!canSave}
        onClick={() => setAttempts((prev) => [{ guess, correct: solved }, ...prev])}
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

      <div className="example-docs">
        <CryptexDocs />
      </div>
    </div>
  )
}
