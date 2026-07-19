import { useState } from 'react'
import { Dialog } from '@ark-ui/react/dialog'
import { Portal } from '@ark-ui/react/portal'
import { Acrostic, type AcrosticLineData } from '../lib/acrostic'
import { AcrosticDocs } from '../docs/acrostic-docs'

const MIN_LINES = 1
const MIN_LENGTH = 3
const MAX_LENGTH = 12

const DEFAULT_LINES: AcrosticLineData[] = [
  { clue: 'Unlocked, unsealed, or begun', longWordLength: 6, smallWordStart: 1, smallWordEnd: 3 },
  { clue: 'Dwellings where families live', longWordLength: 6, smallWordStart: 2, smallWordEnd: 4 },
  { clue: 'Utterly astonished', longWordLength: 6, smallWordStart: 3, smallWordEnd: 5 },
  { clue: 'Moves in sharp, alternating turns', longWordLength: 6, smallWordStart: 3, smallWordEnd: 5 },
  { clue: 'Flies aircraft, or guides a ship', longWordLength: 6, smallWordStart: 2, smallWordEnd: 4 },
  { clue: 'Breaks the rules for unfair advantage', longWordLength: 6, smallWordStart: 2, smallWordEnd: 4 },
]
const DEFAULT_SOLUTION = 'PUZZLE'

/** Keeps a line's longWordLength/smallWordStart/smallWordEnd mutually valid after any single field changes. */
function clampLine(line: AcrosticLineData): AcrosticLineData {
  const longWordLength = Math.min(Math.max(Math.round(line.longWordLength) || MIN_LENGTH, MIN_LENGTH), MAX_LENGTH)
  const smallWordStart = Math.min(Math.max(Math.round(line.smallWordStart), 0), longWordLength - 1)
  const smallWordEnd = Math.min(Math.max(Math.round(line.smallWordEnd), smallWordStart), longWordLength - 1)
  return { ...line, longWordLength, smallWordStart, smallWordEnd }
}

export interface AcrosticExampleProps {
  /** Optional heading shown above the puzzle, e.g. for a game-specific instance of this example. */
  title?: string | undefined
  /** Optional flavor text shown under `title`. */
  description?: string | undefined
  /** Whether to render the component-library docs section. Defaults to `true`. */
  showDocs?: boolean | undefined
}

export function AcrosticExample({ title, description, showDocs = true }: AcrosticExampleProps = {}) {
  const [answer, setAnswer] = useState('')
  const [solved, setSolved] = useState(false)

  const [lines, setLines] = useState(DEFAULT_LINES)
  const [solution, setSolution] = useState<string | undefined>(DEFAULT_SOLUTION)
  const [lettersInNextWord, setLettersInNextWord] = useState(false)
  const [configVersion, setConfigVersion] = useState(0)

  const [editorOpen, setEditorOpen] = useState(false)
  const [draftLines, setDraftLines] = useState(lines)
  const [draftSolution, setDraftSolution] = useState(solution ?? '')
  const [draftLettersInNextWord, setDraftLettersInNextWord] = useState(lettersInNextWord)

  function handleOpenChange(details: { open: boolean }) {
    if (details.open) {
      setDraftLines(lines)
      setDraftSolution(solution ?? '')
      setDraftLettersInNextWord(lettersInNextWord)
    }
    setEditorOpen(details.open)
  }

  function updateLine(index: number, patch: Partial<AcrosticLineData>) {
    setDraftLines((prev) => prev.map((line, i) => (i === index ? clampLine({ ...line, ...patch }) : line)))
  }

  function handleClueChange(index: number, value: string) {
    setDraftLines((prev) => prev.map((line, i) => (i === index ? { ...line, clue: value } : line)))
  }

  function handleLengthChange(index: number, value: number) {
    if (Number.isNaN(value)) return
    updateLine(index, { longWordLength: value })
  }

  function handleSmallWordStartChange(index: number, displayValue: number) {
    if (Number.isNaN(displayValue)) return
    updateLine(index, { smallWordStart: displayValue - 1 })
  }

  function handleSmallWordEndChange(index: number, displayValue: number) {
    if (Number.isNaN(displayValue)) return
    updateLine(index, { smallWordEnd: displayValue - 1 })
  }

  function addLine() {
    setDraftLines((prev) => [...prev, { clue: '', longWordLength: 6, smallWordStart: 0, smallWordEnd: 2 }])
  }

  function removeLastLine() {
    setDraftLines((prev) => (prev.length > MIN_LINES ? prev.slice(0, -1) : prev))
  }

  function handleUpdate() {
    const trimmedSolution = draftSolution.trim().toUpperCase()
    setLines(draftLines.map((line) => ({ ...line, clue: line.clue.trim() })))
    setSolution(trimmedSolution ? trimmedSolution : undefined)
    setLettersInNextWord(draftLettersInNextWord)
    setAnswer('')
    setSolved(false)
    setConfigVersion((prev) => prev + 1)
    setEditorOpen(false)
  }

  return (
    <div className="example">
      {title && (
        <div className="example-heading">
          <h2>{title}</h2>
          {description && <p className="example-description">{description}</p>}
        </div>
      )}
      <div className="example-toolbar">
        <p className="example-intro">
          Each line has a clue — type your best guess into its boxes. A configurable span of letters within
          each line is the "small word" hiding in the "long word"; its first letter spells the final answer.
        </p>
        <Dialog.Root open={editorOpen} onOpenChange={handleOpenChange}>
          <Dialog.Trigger className="edit-button">Edit</Dialog.Trigger>
          <Portal>
            <Dialog.Backdrop className="dialog-backdrop" />
            <Dialog.Positioner className="dialog-positioner">
              <Dialog.Content className="dialog-content">
                <Dialog.Title className="dialog-title">Edit puzzle</Dialog.Title>
                <Dialog.Description className="dialog-description">
                  For each line, set a clue, how many letter boxes the long word has, and which span of boxes
                  (start through end, 1-indexed) is the small word — its first letter is what contributes to
                  the final answer.
                </Dialog.Description>

                <label className="field">
                  <span className="field-label">Solution (optional)</span>
                  <input
                    type="text"
                    value={draftSolution}
                    onChange={(event) => setDraftSolution(event.target.value)}
                    placeholder="e.g. PUZZLE"
                    className="solution-input"
                  />
                </label>
                <p className="field-hint">
                  Leave blank if the puzzle shouldn't have a single correct answer — it'll still track the
                  assembled answer, just never report as solved.
                </p>

                <label className="field checkbox-field">
                  <input
                    type="checkbox"
                    checked={draftLettersInNextWord}
                    onChange={(event) => setDraftLettersInNextWord(event.target.checked)}
                  />
                  <span className="field-label">Require chain: small word's letters must appear in next line</span>
                </label>
                <p className="field-hint">
                  When on, every letter of a line's small word must also appear among the next line's typed
                  letters before the puzzle can be marked complete. Has no effect on the last line.
                </p>

                <div className="editor-acrostic-lines">
                  {draftLines.map((line, index) => (
                    <div key={index} className="editor-acrostic-line">
                      <span className="editor-acrostic-line-index">{index + 1}</span>
                      <div className="editor-acrostic-line-fields">
                        <input
                          type="text"
                          value={line.clue}
                          onChange={(event) => handleClueChange(index, event.target.value)}
                          placeholder="Clue"
                          className="clue-input"
                          aria-label={`Line ${index + 1} clue`}
                        />
                        <div className="editor-acrostic-span">
                          <label className="span-field">
                            <span className="span-field-label">Length</span>
                            <input
                              type="number"
                              min={MIN_LENGTH}
                              max={MAX_LENGTH}
                              value={line.longWordLength}
                              onChange={(event) => handleLengthChange(index, event.target.valueAsNumber)}
                              className="span-input"
                              aria-label={`Line ${index + 1} long word length`}
                            />
                          </label>
                          <label className="span-field">
                            <span className="span-field-label">Start</span>
                            <input
                              type="number"
                              min={1}
                              max={line.longWordLength}
                              value={line.smallWordStart + 1}
                              onChange={(event) => handleSmallWordStartChange(index, event.target.valueAsNumber)}
                              className="span-input"
                              aria-label={`Line ${index + 1} small word start`}
                            />
                          </label>
                          <label className="span-field">
                            <span className="span-field-label">End</span>
                            <input
                              type="number"
                              min={1}
                              max={line.longWordLength}
                              value={line.smallWordEnd + 1}
                              onChange={(event) => handleSmallWordEndChange(index, event.target.valueAsNumber)}
                              className="span-input"
                              aria-label={`Line ${index + 1} small word end`}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="editor-row-actions">
                  <button type="button" onClick={addLine}>
                    Add line
                  </button>
                  <button type="button" onClick={removeLastLine} disabled={draftLines.length <= MIN_LINES}>
                    Delete last line
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

      <Acrostic.Root
        key={configVersion}
        className="acrostic"
        lines={lines}
        solution={solution}
        lettersInNextWord={lettersInNextWord}
        onAnswerChange={(details) => setAnswer(details.answer)}
        onSolvedChange={setSolved}
      >
        {lines.map((_, index) => (
          <Acrostic.Line key={index} index={index} className="acrostic-line" />
        ))}

        <div className="acrostic-answer-row">
          <span className="acrostic-answer-label">Answer</span>
          <Acrostic.Answer className="acrostic-answer" />
        </div>

        <Acrostic.SolvedIndicator className="acrostic-solved" fallback={<span>Keep going…</span>}>
          Solved! The answers spell {solution}.
        </Acrostic.SolvedIndicator>
      </Acrostic.Root>

      <p className="acrostic-debug">
        Current answer: <code>{answer || '(nothing typed yet)'}</code> {solved ? '✓' : ''}
      </p>

      {showDocs && (
        <div className="example-docs">
          <AcrosticDocs />
        </div>
      )}
    </div>
  )
}
