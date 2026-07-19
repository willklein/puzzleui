import { useState } from 'react'
import { Dialog } from '@ark-ui/react/dialog'
import { Portal } from '@ark-ui/react/portal'
import { Acrostic, type AcrosticLineData } from '../lib/acrostic'
import { AcrosticDocs } from '../docs/acrostic-docs'

const MIN_LINES = 1

const DEFAULT_LINES: AcrosticLineData[] = [
  { clue: 'Writing tool you sharpen to a point', word: 'PENCIL' },
  { clue: 'Keeps you dry when it rains', word: 'UMBRELLA' },
  { clue: 'Striped relative of the horse', word: 'ZEBRA' },
  { clue: 'Moves in sharp, alternating turns', word: 'ZIGZAG' },
  { clue: 'Portable light for camping in the dark', word: 'LANTERN' },
  { clue: 'What powers a car forward', word: 'ENGINE' },
]
const DEFAULT_SOLUTION = 'PUZZLE'

export function AcrosticExample() {
  const [answer, setAnswer] = useState('')
  const [solved, setSolved] = useState(false)

  const [lines, setLines] = useState(DEFAULT_LINES)
  const [solution, setSolution] = useState<string | undefined>(DEFAULT_SOLUTION)
  const [configVersion, setConfigVersion] = useState(0)

  const [editorOpen, setEditorOpen] = useState(false)
  const [draftLines, setDraftLines] = useState(lines)
  const [draftSolution, setDraftSolution] = useState(solution ?? '')

  function handleOpenChange(details: { open: boolean }) {
    if (details.open) {
      setDraftLines(lines)
      setDraftSolution(solution ?? '')
    }
    setEditorOpen(details.open)
  }

  function handleClueChange(index: number, value: string) {
    setDraftLines((prev) => prev.map((line, i) => (i === index ? { ...line, clue: value } : line)))
  }

  function handleWordChange(index: number, value: string) {
    setDraftLines((prev) => prev.map((line, i) => (i === index ? { ...line, word: value.toUpperCase() } : line)))
  }

  function addLine() {
    setDraftLines((prev) => [...prev, { clue: '', word: '' }])
  }

  function removeLastLine() {
    setDraftLines((prev) => (prev.length > MIN_LINES ? prev.slice(0, -1) : prev))
  }

  function handleUpdate() {
    const trimmedSolution = draftSolution.trim().toUpperCase()
    setLines(draftLines.map((line) => ({ clue: line.clue.trim(), word: line.word.trim().toUpperCase() })))
    setSolution(trimmedSolution ? trimmedSolution : undefined)
    setAnswer('')
    setSolved(false)
    setConfigVersion((prev) => prev + 1)
    setEditorOpen(false)
  }

  return (
    <div className="example">
      <div className="example-toolbar">
        <p className="example-intro">
          Each line has a clue — type your best guess for the answer word into its boxes. The first letter of
          each line's guess spells the final answer.
        </p>
        <Dialog.Root open={editorOpen} onOpenChange={handleOpenChange}>
          <Dialog.Trigger className="edit-button">Edit</Dialog.Trigger>
          <Portal>
            <Dialog.Backdrop className="dialog-backdrop" />
            <Dialog.Positioner className="dialog-positioner">
              <Dialog.Content className="dialog-content">
                <Dialog.Title className="dialog-title">Edit puzzle</Dialog.Title>
                <Dialog.Description className="dialog-description">
                  Add a clue and answer word for each line. The word is never shown to the player — it only
                  sets how many boxes that line gets. The first letter of what they type in spells the final
                  answer.
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
                        <input
                          type="text"
                          value={line.word}
                          onChange={(event) => handleWordChange(index, event.target.value)}
                          placeholder="Answer word (hidden from players)"
                          className="word-input"
                          aria-label={`Line ${index + 1} answer word`}
                        />
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

      <div className="example-docs">
        <AcrosticDocs />
      </div>
    </div>
  )
}
