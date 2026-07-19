import type { EventObject, Machine, Service } from '@zag-js/core'
import type { PropTypes } from '@zag-js/react'

export interface CryptexValueChangeDetails {
  value: string[]
  valueAsString: string
}

export interface CryptexProps {
  /**
   * The candidate letters for each wheel, in order.
   * `letters[i]` are the options a player can dial in for position `i`,
   * top-to-bottom. The word length is derived from `letters.length`.
   */
  letters: string[][]
  /**
   * The correct combination of letters. When provided, the puzzle can
   * compute `solved` once every wheel is set.
   */
  solution?: string | undefined
  /** The controlled value: one selected letter per wheel. */
  value?: string[] | undefined
  /**
   * The initial value when uncontrolled. Positions left unset default to
   * their wheel's first candidate letter.
   */
  defaultValue?: string[] | undefined
  /** Disables interaction with every wheel. */
  disabled?: boolean | undefined
  id?: string | undefined
  onValueChange?: ((details: CryptexValueChangeDetails) => void) | undefined
  onSolvedChange?: ((solved: boolean) => void) | undefined
}

export interface CryptexSchema {
  state: 'idle'
  props: CryptexProps
  context: {
    value: string[]
    /** Which wheel currently has (roving) keyboard focus. */
    focusedIndex: number
  }
  computed: {
    count: number
    guess: string
    complete: boolean
    solved: boolean
  }
  event: EventObject
  action: string
  guard: string
  effect: string
}

export type CryptexService = Service<CryptexSchema>
export type CryptexMachine = Machine<CryptexSchema>

export interface CryptexApi<T extends PropTypes = PropTypes> {
  /** The word length, derived from `letters.length`. */
  count: number
  /** The currently dialed-in letter for each wheel. */
  value: string[]
  /** `value` joined into a single string. */
  guess: string
  /** Whether every wheel has a letter selected. */
  complete: boolean
  /** Whether `guess` matches `solution` (always `false` if no `solution` was given). */
  solved: boolean
  disabled: boolean
  /** Which wheel index currently owns keyboard focus (roving tabindex). */
  focusedIndex: number

  setValueAtIndex: (index: number, letter: string) => void
  setValue: (value: string[]) => void
  /** Resets every wheel back to its first candidate letter. */
  clearValue: () => void
  /** Moves wheel `index` up (`delta < 0`) or down (`delta > 0`) through its candidates, wrapping. */
  stepValueAtIndex: (index: number, delta: number) => void
  /** Moves keyboard focus left (`delta < 0`) or right (`delta > 0`) between wheels, wrapping. */
  moveFocus: (delta: number) => void

  getRootProps: () => T['element']
  getLabelProps: () => T['element']
  /** Props for the focusable button that displays/drives wheel `index`. */
  getWheelProps: (index: number) => T['button']
  getValueTextProps: () => T['element']
  getSolvedIndicatorProps: () => T['element']
}
