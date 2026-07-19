import type { PropTypes } from '@zag-js/react'
import type { NormalizeProps } from '@zag-js/types'
import type { AcrosticApi, AcrosticService } from './acrostic.types'
import { dataAttr } from '../shared/dom'

export function connect<T extends PropTypes>(service: AcrosticService, normalize: NormalizeProps<T>): AcrosticApi<T> {
  const { context, prop, computed, send } = service

  const lines = prop('lines')
  const selections = context.get('selections')
  const anchor = context.get('anchor')
  const solved = computed('solved')
  const complete = computed('complete')
  const disabled = !!prop('disabled')

  return {
    lines,
    selections,
    anchor,
    answer: computed('answer'),
    complete,
    solved,
    disabled,

    setSelections(next) {
      send({ type: 'SELECTION.SET', selections: next })
    },
    clearAll() {
      send({ type: 'SELECTION.CLEAR_ALL' })
    },

    getRootProps() {
      return normalize.element({
        'data-scope': 'acrostic',
        'data-part': 'root',
        'data-solved': dataAttr(solved),
        'data-complete': dataAttr(complete),
      })
    },

    getAnswerProps() {
      return normalize.element({
        'data-scope': 'acrostic',
        'data-part': 'answer',
      })
    },

    getSolvedIndicatorProps() {
      return normalize.element({
        'data-scope': 'acrostic',
        'data-part': 'solved-indicator',
        hidden: !solved,
      })
    },

    getLineProps(lineIndex) {
      return normalize.element({
        'data-scope': 'acrostic',
        'data-part': 'line',
        'data-index': lineIndex,
        'data-filled': dataAttr(!!selections[lineIndex]),
      })
    },

    getClueProps(lineIndex) {
      return normalize.element({
        'data-scope': 'acrostic',
        'data-part': 'clue',
        'data-index': lineIndex,
      })
    },

    getWordProps(lineIndex) {
      return normalize.element({
        'data-scope': 'acrostic',
        'data-part': 'word',
        'data-index': lineIndex,
      })
    },

    getLetterProps(lineIndex, letterIndex) {
      const sel = selections[lineIndex]
      const inRange = !!sel && letterIndex >= sel.start && letterIndex <= sel.end
      const isAnswerLetter = !!sel && letterIndex === sel.start
      const isAnchor = anchor?.lineIndex === lineIndex && anchor?.letterIndex === letterIndex

      return normalize.button({
        type: 'button',
        'data-scope': 'acrostic',
        'data-part': 'letter',
        'data-index': letterIndex,
        'data-selected': dataAttr(inRange),
        'data-answer-letter': dataAttr(isAnswerLetter),
        'data-anchor': dataAttr(isAnchor),
        disabled,
        onClick() {
          if (disabled) return
          send({ type: 'LETTER.CLICK', lineIndex, letterIndex })
        },
      })
    },
  }
}
