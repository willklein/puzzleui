import type { PropTypes } from '@zag-js/react'
import type { NormalizeProps } from '@zag-js/types'
import type { AcrosticApi, AcrosticService } from './acrostic.types'
import { dataAttr } from '../shared/dom'

export function connect<T extends PropTypes>(service: AcrosticService, normalize: NormalizeProps<T>): AcrosticApi<T> {
  const { context, prop, computed, send } = service

  const lines = computed('effectiveLines')
  const guesses = context.get('guesses')
  const solved = computed('solved')
  const complete = computed('complete')
  const disabled = !!prop('disabled')

  return {
    lines,
    guesses,
    answer: computed('answer'),
    complete,
    solved,
    disabled,

    setBoxLetter(lineIndex, boxIndex, letter) {
      send({ type: 'BOX.SET', lineIndex, boxIndex, letter })
    },
    setGuesses(next) {
      send({ type: 'GUESSES.SET', guesses: next })
    },
    clearAll() {
      send({ type: 'GUESSES.CLEAR' })
    },
    registerLine(index, line) {
      send({ type: 'LINE.REGISTER', index, line })
    },
    unregisterLine(index) {
      send({ type: 'LINE.UNREGISTER', index })
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
      const line = guesses[lineIndex] ?? []
      const filled = line.length > 0 && line.every((letter) => letter !== '')
      return normalize.element({
        'data-scope': 'acrostic',
        'data-part': 'line',
        'data-index': lineIndex,
        'data-filled': dataAttr(filled),
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

    getBoxProps(lineIndex, boxIndex) {
      const line = lines[lineIndex]
      const letter = guesses[lineIndex]?.[boxIndex] ?? ''
      const inWord = !!line && boxIndex >= line.smallWordStart && boxIndex <= line.smallWordEnd
      const isAnswerBox = !!line && boxIndex === line.smallWordStart

      return normalize.input({
        type: 'text',
        maxLength: 1,
        value: letter,
        'data-scope': 'acrostic',
        'data-part': 'box',
        'data-index': boxIndex,
        'data-in-word': dataAttr(inWord),
        'data-answer-box': dataAttr(isAnswerBox),
        'data-filled': dataAttr(!!letter),
        disabled,
        'aria-label': `Line ${lineIndex + 1}, letter ${boxIndex + 1}`,
        onChange(event) {
          if (disabled) return
          const value = event.target.value.slice(-1).toUpperCase()
          send({ type: 'BOX.SET', lineIndex, boxIndex, letter: value })
        },
      })
    },
  }
}
