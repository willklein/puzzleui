import type { EventObject, Machine, Service } from '@zag-js/core'
import type { PropTypes } from '@zag-js/react'

/** The minimum length (in letters) a hidden word may span. */
export const MIN_HIDDEN_WORD_LENGTH = 3

export interface AcrosticLine {
  /** The clue for this line's outer word. */
  clue: string
  /** The outer word for this line. Should be at least 6 letters long. */
  word: string
}

export interface AcrosticSelection {
  /** Index of the first selected letter of the hidden word (inclusive). */
  start: number
  /** Index of the last selected letter of the hidden word (inclusive). */
  end: number
}

export interface AcrosticAnswerChangeDetails {
  answer: string
  selections: Array<AcrosticSelection | null>
}

export interface AcrosticAnchor {
  lineIndex: number
  letterIndex: number
}

export interface AcrosticProps {
  /** One clue + outer word per line, in the order the final answer is spelled. */
  lines: AcrosticLine[]
  /** The final answer, spelled by the first letter of each line's hidden word. */
  solution?: string | undefined
  /** The controlled per-line hidden-word selections. */
  selections?: Array<AcrosticSelection | null> | undefined
  /** The initial per-line selections when uncontrolled. */
  defaultSelections?: Array<AcrosticSelection | null> | undefined
  disabled?: boolean | undefined
  id?: string | undefined
  onAnswerChange?: ((details: AcrosticAnswerChangeDetails) => void) | undefined
  onSolvedChange?: ((solved: boolean) => void) | undefined
}

export interface AcrosticSchema {
  state: 'idle' | 'selecting'
  props: AcrosticProps
  context: {
    selections: Array<AcrosticSelection | null>
    anchor: AcrosticAnchor | null
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
  selections: Array<AcrosticSelection | null>
  anchor: AcrosticAnchor | null
  /** The assembled final answer; unfilled lines render as `_`. */
  answer: string
  /** Whether every line has a hidden-word selection of at least 3 letters. */
  complete: boolean
  /** Whether `answer` matches `solution` (always `false` if no `solution` was given). */
  solved: boolean
  disabled: boolean

  setSelections: (selections: Array<AcrosticSelection | null>) => void
  clearAll: () => void

  getRootProps: () => T['element']
  getAnswerProps: () => T['element']
  getSolvedIndicatorProps: () => T['element']
  getLineProps: (lineIndex: number) => T['element']
  getClueProps: (lineIndex: number) => T['element']
  getWordProps: (lineIndex: number) => T['element']
  getLetterProps: (lineIndex: number, letterIndex: number) => T['button']
}
