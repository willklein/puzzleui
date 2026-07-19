import { createMachine } from '@zag-js/core'
import type { AcrosticLine, AcrosticSchema } from './acrostic.types'

/** Builds a per-line, per-box guess grid sized to each line's word length. */
function fill(lines: AcrosticLine[], existing?: string[][]): string[][] {
  return lines.map((line, i) => {
    const existingLine = existing?.[i]
    return Array.from({ length: line.word.length }, (_, j) => existingLine?.[j] ?? '')
  })
}

function computeAnswer(lines: AcrosticLine[], guesses: string[][]): string {
  return lines.map((_, i) => guesses[i]?.[0]?.toUpperCase() || '_').join('')
}

export const machine = createMachine<AcrosticSchema>({
  props({ props }) {
    return {
      lines: props.lines ?? [],
      solution: props.solution,
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
    }
  },

  computed: {
    lineCount: ({ prop }) => prop('lines').length,
    answer: ({ prop, context }) => computeAnswer(prop('lines'), context.get('guesses')),
    complete: ({ context, computed }) => {
      const guesses = context.get('guesses')
      return (
        guesses.length === computed('lineCount') &&
        guesses.every((line) => line.length > 0 && line.every((letter) => letter !== ''))
      )
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
  },

  states: {
    idle: {},
  },

  implementations: {
    actions: {
      setBoxLetter({ context, event, prop }) {
        const guesses = fill(prop('lines'), context.get('guesses'))
        const line = guesses[event.lineIndex]
        if (!line) return
        line[event.boxIndex] = event.letter
        context.set('guesses', guesses)
      },
      setGuesses({ context, event, prop }) {
        context.set('guesses', fill(prop('lines'), event.guesses))
      },
      clearGuesses({ context, prop }) {
        context.set('guesses', fill(prop('lines'), []))
      },
      notifySolvedChange({ prop, computed }) {
        prop('onSolvedChange')?.(computed('solved'))
      },
    },
  },
})
