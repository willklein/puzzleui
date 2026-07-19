import type { PropTypes } from '@zag-js/react'
import type { NormalizeProps } from '@zag-js/types'
import type { CryptexApi, CryptexService } from './cryptex.types'
import { dataAttr } from '../shared/dom'

export function connect<T extends PropTypes>(service: CryptexService, normalize: NormalizeProps<T>): CryptexApi<T> {
  const { context, prop, computed, send } = service

  const value = context.get('value')
  const focusedIndex = context.get('focusedIndex')
  const solved = computed('solved')
  const complete = computed('complete')
  const disabled = !!prop('disabled')

  return {
    count: computed('count'),
    value,
    guess: computed('guess'),
    complete,
    solved,
    disabled,
    focusedIndex,

    setValueAtIndex(index, letter) {
      send({ type: 'VALUE.SET_AT_INDEX', index, letter })
    },
    setValue(next) {
      send({ type: 'VALUE.SET', value: next })
    },
    clearValue() {
      send({ type: 'VALUE.CLEAR' })
    },
    stepValueAtIndex(index, delta) {
      send({ type: 'WHEEL.STEP', index, delta })
    },
    moveFocus(delta) {
      send({ type: 'WHEEL.MOVE_FOCUS', delta })
    },

    getRootProps() {
      return normalize.element({
        'data-scope': 'cryptex',
        'data-part': 'root',
        'data-solved': dataAttr(solved),
        'data-complete': dataAttr(complete),
        'data-disabled': dataAttr(disabled),
      })
    },

    getLabelProps() {
      return normalize.element({
        'data-scope': 'cryptex',
        'data-part': 'label',
      })
    },

    getWheelProps(index) {
      const letter = value[index]
      const focused = index === focusedIndex

      return normalize.button({
        type: 'button',
        'data-scope': 'cryptex',
        'data-part': 'wheel',
        'data-index': index,
        'data-focused': dataAttr(focused),
        tabIndex: focused ? 0 : -1,
        disabled,
        'aria-label': `Position ${index + 1} of ${computed('count')}, currently ${letter || 'unset'}`,
        onFocus() {
          if (disabled) return
          send({ type: 'WHEEL.FOCUS', index })
        },
        onKeyDown(event) {
          if (disabled) return
          switch (event.key) {
            case 'ArrowUp':
              event.preventDefault()
              send({ type: 'WHEEL.STEP', index, delta: -1 })
              break
            case 'ArrowDown':
              event.preventDefault()
              send({ type: 'WHEEL.STEP', index, delta: 1 })
              break
            case 'ArrowLeft':
              event.preventDefault()
              send({ type: 'WHEEL.MOVE_FOCUS', delta: -1 })
              break
            case 'ArrowRight':
              event.preventDefault()
              send({ type: 'WHEEL.MOVE_FOCUS', delta: 1 })
              break
          }
        },
      })
    },

    getValueTextProps() {
      return normalize.element({
        'data-scope': 'cryptex',
        'data-part': 'value-text',
      })
    },

    getSolvedIndicatorProps() {
      return normalize.element({
        'data-scope': 'cryptex',
        'data-part': 'solved-indicator',
        hidden: !solved,
      })
    },
  }
}
