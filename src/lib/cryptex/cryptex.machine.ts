import { createMachine } from '@zag-js/core'
import type { CryptexSchema } from './cryptex.types'

/** Fills `value` to `letters.length`, defaulting unset positions to that wheel's first candidate. */
function fill(value: string[] | undefined, letters: string[][]): string[] {
  return letters.map((candidates, i) => value?.[i] ?? candidates[0] ?? '')
}

function wrap(index: number, count: number): number {
  if (count === 0) return 0
  return ((index % count) + count) % count
}

export const machine = createMachine<CryptexSchema>({
  props({ props }) {
    return {
      letters: props.letters ?? [],
      solution: props.solution,
      value: props.value,
      defaultValue: props.defaultValue ?? [],
      disabled: props.disabled,
      id: props.id,
      onValueChange: props.onValueChange,
      onSolvedChange: props.onSolvedChange,
    }
  },

  initialState() {
    return 'idle'
  },

  context({ prop, bindable }) {
    return {
      value: bindable<string[]>(() => ({
        value: prop('value') ? fill(prop('value'), prop('letters')) : undefined,
        defaultValue: fill(prop('defaultValue'), prop('letters')),
        isEqual: (a, b) => a.join(' ') === b?.join(' '),
        onChange(value) {
          prop('onValueChange')?.({ value, valueAsString: value.join('') })
        },
      })),
      focusedIndex: bindable<number>(() => ({
        defaultValue: 0,
      })),
    }
  },

  computed: {
    count: ({ prop }) => prop('letters').length,
    guess: ({ context }) => context.get('value').join(''),
    complete: ({ context, computed }) => {
      const value = context.get('value')
      return value.length === computed('count') && value.every((letter) => letter !== '')
    },
    solved: ({ prop, computed }) => {
      const solution = prop('solution')
      if (!solution) return false
      return computed('complete') && computed('guess').toUpperCase() === solution.toUpperCase()
    },
  },

  watch({ track, action, computed }) {
    track([() => computed('solved')], () => {
      action(['notifySolvedChange'])
    })
  },

  on: {
    'VALUE.SET_AT_INDEX': {
      actions: ['setValueAtIndex'],
    },
    'VALUE.SET': {
      actions: ['setValue'],
    },
    'VALUE.CLEAR': {
      actions: ['clearValue'],
    },
    'WHEEL.FOCUS': {
      actions: ['setFocusedIndex'],
    },
    'WHEEL.STEP': {
      actions: ['stepValueAtIndex'],
    },
    'WHEEL.MOVE_FOCUS': {
      actions: ['moveFocus'],
    },
  },

  states: {
    idle: {},
  },

  implementations: {
    actions: {
      setValueAtIndex({ context, event, prop }) {
        const value = fill(context.get('value'), prop('letters'))
        value[event.index] = event.letter
        context.set('value', value)
      },
      setValue({ context, event, prop }) {
        context.set('value', fill(event.value, prop('letters')))
      },
      clearValue({ context, prop }) {
        context.set('value', fill([], prop('letters')))
      },
      setFocusedIndex({ context, event }) {
        context.set('focusedIndex', event.index)
      },
      stepValueAtIndex({ context, event, prop }) {
        const letters = prop('letters')
        const candidates = letters[event.index]
        if (!candidates || candidates.length === 0) return

        const value = fill(context.get('value'), letters)
        const currentPos = candidates.indexOf(value[event.index])
        const basePos = currentPos === -1 ? 0 : currentPos
        value[event.index] = candidates[wrap(basePos + event.delta, candidates.length)]
        context.set('value', value)
      },
      moveFocus({ context, event, prop }) {
        const count = prop('letters').length
        const next = wrap(context.get('focusedIndex') + event.delta, count)
        context.set('focusedIndex', next)
      },
      notifySolvedChange({ prop, computed }) {
        prop('onSolvedChange')?.(computed('solved'))
      },
    },
  },
})
