import type { EventObject, Machine, Service } from '@zag-js/core'
import type { PropTypes } from '@zag-js/react'

export interface AcrosticLine {
  /** The clue for this line's answer word. */
  clue: string
  /**
   * The answer word for this line. Never rendered or exposed to the
   * player — only its length is used, to size the line's input boxes.
   */
  word: string
}

export interface AcrosticAnswerChangeDetails {
  answer: string
  guesses: string[][]
}

export interface AcrosticProps {
  /** One clue + answer word per line, in the order the final answer is spelled. */
  lines: AcrosticLine[]
  /** The final answer, spelled by the first letter of each line's guess. */
  solution?: string | undefined
  /** The controlled per-line, per-box guessed letters. */
  guesses?: string[][] | undefined
  /** The initial per-line guesses when uncontrolled. */
  defaultGuesses?: string[][] | undefined
  disabled?: boolean | undefined
  id?: string | undefined
  onAnswerChange?: ((details: AcrosticAnswerChangeDetails) => void) | undefined
  onSolvedChange?: ((solved: boolean) => void) | undefined
}

export interface AcrosticSchema {
  state: 'idle'
  props: AcrosticProps
  context: {
    guesses: string[][]
  }
  computed: {
    lineCount: number
    answer: string
    complete: boolean
    solved: boolean
  }
  event: EventObject
  action: string
  guard: string
  effect: string
}

export type AcrosticService = Service<AcrosticSchema>
export type AcrosticMachine = Machine<AcrosticSchema>

export interface AcrosticApi<T extends PropTypes = PropTypes> {
  lines: AcrosticLine[]
  /** `guesses[lineIndex][boxIndex]` is the letter typed into that box, or `""`. */
  guesses: string[][]
  /** The assembled final answer; lines with no first letter typed render as `_`. */
  answer: string
  /** Whether every line has every box filled in. */
  complete: boolean
  /** Whether `answer` matches `solution` (always `false` if no `solution` was given). */
  solved: boolean
  disabled: boolean

  setBoxLetter: (lineIndex: number, boxIndex: number, letter: string) => void
  setGuesses: (guesses: string[][]) => void
  clearAll: () => void

  getRootProps: () => T['element']
  getAnswerProps: () => T['element']
  getSolvedIndicatorProps: () => T['element']
  getLineProps: (lineIndex: number) => T['element']
  getClueProps: (lineIndex: number) => T['element']
  getWordProps: (lineIndex: number) => T['element']
  getBoxProps: (lineIndex: number, boxIndex: number) => T['input']
}
