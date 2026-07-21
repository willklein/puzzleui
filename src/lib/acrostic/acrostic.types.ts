import type { EventObject, Machine, Service } from '@zag-js/core'
import type { PropTypes } from '@zag-js/react'

export interface AcrosticLine {
  /** The clue for this line's long word. */
  clue: string
  /** How many letter boxes the long word has. */
  longWordLength: number
  /** Index (0-based) of the first letter of the small word within the long word. */
  smallWordStart: number
  /** Index (0-based, inclusive) of the last letter of the small word within the long word. */
  smallWordEnd: number
}

export interface AcrosticAnswerChangeDetails {
  answer: string
  guesses: string[][]
}

export interface AcrosticProps {
  /**
   * One clue + layout per line, in the order the final answer is spelled.
   * Optional if every `Acrostic.Line` supplies its own `line` prop instead —
   * an entry here is overridden by that line's own prop when both are given.
   */
  lines?: AcrosticLine[] | undefined
  /** The final answer, spelled by the first letter of each line's small word. */
  solution?: string | undefined
  /**
   * When true, every letter of a line's small word must also appear among
   * the next line's typed letters (multiset containment) for the puzzle to
   * be considered complete/solvable. Has no effect on the last line.
   */
  lettersInNextWord?: boolean | undefined
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
  /** `lines` is normalized to always be an array inside the machine (see `props()`). */
  props: AcrosticProps & { lines: AcrosticLine[] }
  context: {
    guesses: string[][]
    /** Per-line overrides registered by `Acrostic.Line`'s own `line` prop, keyed by index. */
    lineOverrides: Record<number, AcrosticLine>
    /** `"lineIndex:boxIndex"` of the box to focus next (auto-advance), or `null`. */
    focusTarget: string | null
  }
  computed: {
    /** `lines` merged with any registered per-line overrides. */
    effectiveLines: AcrosticLine[]
    lineCount: number
    answer: string
    /**
     * Per line, whether its small word's letters all appear in the next
     * line's typed letters. `undefined` while there's not yet enough typed
     * to check (or `lettersInNextWord` is off, or it's the last line).
     */
    chainStatuses: Array<boolean | undefined>
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
  /** `lines` merged with any registered per-line overrides. */
  lines: AcrosticLine[]
  /** `guesses[lineIndex][boxIndex]` is the letter typed into that box, or `""`. */
  guesses: string[][]
  /** The assembled final answer, from each line's small word; unfilled lines render as `_`. */
  answer: string
  /**
   * Per line, whether its small word's letters all appear in the next
   * line's typed letters. `undefined` while there's not yet enough typed
   * to check (or `lettersInNextWord` is off, or it's the last line).
   */
  chainStatuses: Array<boolean | undefined>
  /** Whether every line has every box filled in (and, if `lettersInNextWord`, the chain rule holds). */
  complete: boolean
  /** Whether `answer` matches `solution` (always `false` if no `solution` was given). */
  solved: boolean
  disabled: boolean
  /**
   * `"lineIndex:boxIndex"` of the box that should take focus next, or `null`.
   * Set automatically when a letter is typed, to auto-advance to the
   * following box (and into the next line, if at the end of one). Each
   * `Acrostic.Box` compares this against its own position to know when to
   * focus itself.
   */
  focusTarget: string | null

  setBoxLetter: (lineIndex: number, boxIndex: number, letter: string) => void
  setGuesses: (guesses: string[][]) => void
  clearAll: () => void
  /** Registers or updates line `index`'s layout, as an alternative to Root's `lines` array. */
  registerLine: (index: number, line: AcrosticLine) => void
  /** Removes a previously registered line override for `index`. */
  unregisterLine: (index: number) => void

  getRootProps: () => T['element']
  getAnswerProps: () => T['element']
  getSolvedIndicatorProps: () => T['element']
  getLineProps: (lineIndex: number) => T['element']
  getClueProps: (lineIndex: number) => T['element']
  getWordProps: (lineIndex: number) => T['element']
  getBoxProps: (lineIndex: number, boxIndex: number) => T['input']
}
