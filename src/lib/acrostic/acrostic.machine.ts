import { createMachine } from '@zag-js/core'
import {
  MIN_HIDDEN_WORD_LENGTH,
  type AcrosticAnchor,
  type AcrosticSchema,
  type AcrosticSelection,
} from './acrostic.types'

function fill(
  selections: Array<AcrosticSelection | null> | undefined,
  count: number,
): Array<AcrosticSelection | null> {
  return Array.from({ length: count }, (_, i) => selections?.[i] ?? null)
}

export const machine = createMachine<AcrosticSchema>({
  props({ props }) {
    return {
      lines: props.lines ?? [],
      solution: props.solution,
      selections: props.selections,
      defaultSelections: props.defaultSelections ?? [],
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
      selections: bindable<Array<AcrosticSelection | null>>(() => ({
        value: prop('selections') ? fill(prop('selections'), prop('lines').length) : undefined,
        defaultValue: fill(prop('defaultSelections'), prop('lines').length),
        onChange(selections) {
          const lines = prop('lines')
          const answer = lines
            .map((line, i) => {
              const sel = selections[i]
              return sel ? (line.word[sel.start]?.toUpperCase() ?? '_') : '_'
            })
            .join('')
          prop('onAnswerChange')?.({ answer, selections })
        },
      })),
      anchor: bindable<AcrosticAnchor | null>(() => ({
        defaultValue: null,
      })),
    }
  },

  computed: {
    lineCount: ({ prop }) => prop('lines').length,
    answer: ({ prop, context }) => {
      const lines = prop('lines')
      const selections = context.get('selections')
      return lines
        .map((line, i) => {
          const sel = selections[i]
          return sel ? (line.word[sel.start]?.toUpperCase() ?? '_') : '_'
        })
        .join('')
    },
    complete: ({ context, computed }) => {
      const selections = context.get('selections')
      return selections.length === computed('lineCount') && selections.every((sel) => sel !== null)
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
    'SELECTION.SET': {
      actions: ['setSelections'],
    },
    'SELECTION.CLEAR_ALL': {
      target: 'idle',
      actions: ['clearAllSelections', 'clearAnchor'],
    },
  },

  states: {
    idle: {
      on: {
        'LETTER.CLICK': {
          target: 'selecting',
          actions: ['setAnchor'],
        },
      },
    },
    selecting: {
      on: {
        'LETTER.CLICK': [
          {
            guard: 'sameLine',
            target: 'idle',
            actions: ['commitSelection'],
          },
          {
            actions: ['setAnchor'],
          },
        ],
      },
    },
  },

  implementations: {
    guards: {
      sameLine: ({ context, event }) => context.get('anchor')?.lineIndex === event.lineIndex,
    },

    actions: {
      setAnchor({ context, event }) {
        context.set('anchor', { lineIndex: event.lineIndex, letterIndex: event.letterIndex })
      },
      commitSelection({ context, event, prop }) {
        const anchor = context.get('anchor')
        if (!anchor) return

        const start = Math.min(anchor.letterIndex, event.letterIndex)
        const end = Math.max(anchor.letterIndex, event.letterIndex)
        const length = end - start + 1

        const selections = fill(context.get('selections'), prop('lines').length)
        selections[event.lineIndex] = length >= MIN_HIDDEN_WORD_LENGTH ? { start, end } : null
        context.set('selections', selections)
        context.set('anchor', null)
      },
      clearAnchor({ context }) {
        context.set('anchor', null)
      },
      setSelections({ context, event, prop }) {
        context.set('selections', fill(event.selections, prop('lines').length))
      },
      clearAllSelections({ context, prop }) {
        context.set('selections', fill([], prop('lines').length))
      },
      notifySolvedChange({ prop, computed }) {
        prop('onSolvedChange')?.(computed('solved'))
      },
    },
  },
})
