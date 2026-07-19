import { createMachine } from '@zag-js/core'
import type { AcrosticLine, AcrosticSchema } from './acrostic.types'

/** Merges Root's `lines` array with any per-line registrations, override winning per index. */
function getEffectiveLines(lines: AcrosticLine[], overrides: Record<number, AcrosticLine>): AcrosticLine[] {
  if (lines.length > 0) {
    return lines.map((line, i) => overrides[i] ?? line)
  }
  const indexes = Object.keys(overrides).map(Number)
  if (indexes.length === 0) return []
  const maxIndex = Math.max(...indexes)
  return Array.from({ length: maxIndex + 1 }, (_, i) => overrides[i] ?? { clue: '', longWordLength: 0, smallWordStart: 0, smallWordEnd: 0 })
}

/** Builds a per-line, per-box guess grid sized to each line's long-word length. */
function fill(lines: AcrosticLine[], existing?: string[][]): string[][] {
  return lines.map((line, i) => {
    const existingLine = existing?.[i]
    return Array.from({ length: line.longWordLength }, (_, j) => existingLine?.[j] ?? '')
  })
}

/** The assembled answer: each line contributes its small word's first letter. */
function computeAnswer(lines: AcrosticLine[], guesses: string[][]): string {
  return lines.map((line, i) => guesses[i]?.[line.smallWordStart]?.toUpperCase() || '_').join('')
}

/** Whether every letter of `small` is present in `big` (multiset containment, case-insensitive). */
function lettersContained(small: string, big: string): boolean {
  const remaining = new Map<string, number>()
  for (const letter of big.toUpperCase()) {
    remaining.set(letter, (remaining.get(letter) ?? 0) + 1)
  }
  for (const letter of small.toUpperCase()) {
    const count = remaining.get(letter) ?? 0
    if (count === 0) return false
    remaining.set(letter, count - 1)
  }
  return true
}

export const machine = createMachine<AcrosticSchema>({
  props({ props }) {
    return {
      lines: props.lines ?? [],
      solution: props.solution,
      lettersInNextWord: props.lettersInNextWord,
      guesses: props.guesses,
      defaultGuesses: props.defaultGuesses ?? [],
      disabled: props.disabled,
      id: props.id,
      onAnswerChange: props.onAnswerChange,
      onSolvedChange: props.onSolvedChange,
    }
  },

  initialState() {
    return 'idle'
  },

  context({ prop, bindable }) {
    return {
      guesses: bindable<string[][]>(() => ({
        value: prop('guesses') ? fill(prop('lines'), prop('guesses')) : undefined,
        defaultValue: fill(prop('lines'), prop('defaultGuesses')),
        isEqual: (a, b) => a.map((line) => line.join('')).join('|') === b?.map((line) => line.join('')).join('|'),
        onChange(guesses) {
          prop('onAnswerChange')?.({ answer: computeAnswer(prop('lines'), guesses), guesses })
        },
      })),
      lineOverrides: bindable<Record<number, AcrosticLine>>(() => ({
        defaultValue: {},
      })),
      focusTarget: bindable<string | null>(() => ({
        defaultValue: null,
      })),
    }
  },

  computed: {
    effectiveLines: ({ prop, context }) => getEffectiveLines(prop('lines'), context.get('lineOverrides')),
    lineCount: ({ computed }) => computed('effectiveLines').length,
    answer: ({ context, computed }) => computeAnswer(computed('effectiveLines'), context.get('guesses')),
    complete: ({ context, prop, computed }) => {
      const lines = computed('effectiveLines')
      const guesses = context.get('guesses')
      const allFilled =
        guesses.length === computed('lineCount') &&
        guesses.every((line) => line.length > 0 && line.every((letter) => letter !== ''))
      if (!allFilled) return false
      if (!prop('lettersInNextWord')) return true

      for (let i = 0; i < lines.length - 1; i++) {
        const line = lines[i]
        const smallWord = guesses[i].slice(line.smallWordStart, line.smallWordEnd + 1).join('')
        const nextWord = guesses[i + 1].join('')
        if (!lettersContained(smallWord, nextWord)) return false
      }
      return true
    },
    solved: ({ prop, computed }) => {
      const solution = prop('solution')
      if (!solution) return false
      return computed('complete') && computed('answer').toUpperCase() === solution.toUpperCase()
    },
  },

  watch({ track, action, computed }) {
    track([() => computed('solved')], () => {
      action(['notifySolvedChange'])
    })
  },

  on: {
    'BOX.SET': {
      actions: ['setBoxLetter'],
    },
    'GUESSES.SET': {
      actions: ['setGuesses'],
    },
    'GUESSES.CLEAR': {
      actions: ['clearGuesses'],
    },
    'LINE.REGISTER': {
      actions: ['registerLine'],
    },
    'LINE.UNREGISTER': {
      actions: ['unregisterLine'],
    },
  },

  states: {
    idle: {},
  },

  implementations: {
    actions: {
      setBoxLetter({ context, event, computed }) {
        const lines = computed('effectiveLines')
        const guesses = fill(lines, context.get('guesses'))
        const line = guesses[event.lineIndex]
        if (!line) return
        line[event.boxIndex] = event.letter
        context.set('guesses', guesses)

        if (!event.letter) {
          context.set('focusTarget', null)
          return
        }

        const currentLine = lines[event.lineIndex]
        if (currentLine && event.boxIndex + 1 < currentLine.longWordLength) {
          context.set('focusTarget', `${event.lineIndex}:${event.boxIndex + 1}`)
        } else if (event.lineIndex + 1 < lines.length) {
          context.set('focusTarget', `${event.lineIndex + 1}:0`)
        } else {
          context.set('focusTarget', null)
        }
      },
      setGuesses({ context, event, computed }) {
        context.set('guesses', fill(computed('effectiveLines'), event.guesses))
      },
      clearGuesses({ context, computed }) {
        context.set('guesses', fill(computed('effectiveLines'), []))
      },
      registerLine({ context, event, prop }) {
        const overrides = { ...context.get('lineOverrides'), [event.index]: event.line }
        context.set('lineOverrides', overrides)
        context.set('guesses', fill(getEffectiveLines(prop('lines'), overrides), context.get('guesses')))
      },
      unregisterLine({ context, event }) {
        const overrides = { ...context.get('lineOverrides') }
        delete overrides[event.index]
        context.set('lineOverrides', overrides)
      },
      notifySolvedChange({ prop, computed }) {
        prop('onSolvedChange')?.(computed('solved'))
      },
    },
  },
})
