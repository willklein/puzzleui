'use client'

import { forwardRef } from 'react'
import { mergeProps } from '@zag-js/react'
import { ark } from '@ark-ui/react/factory'
import type { HTMLArkProps } from '@ark-ui/react/factory'
import { useSudokuContext } from './sudoku-context'
import { SudokuCell } from './sudoku-cell'

export interface SudokuGridProps extends HTMLArkProps<'div'> {}

/** Renders every cell in the grid; the consumer never maps cells manually. */
export const SudokuGrid = forwardRef<HTMLDivElement, SudokuGridProps>((props, ref) => {
  const sudoku = useSudokuContext()
  const { style, ...restProps } = props
  const mergedProps = mergeProps(sudoku.getGridProps(), restProps)
  const { size, boxesAcross, boxesDown } = sudoku.layout

  const gridStyle = {
    ...style,
    '--sudoku-size': size,
    '--sudoku-boxes-across': boxesAcross,
    '--sudoku-boxes-down': boxesDown,
  } as React.CSSProperties

  return (
    <ark.div {...mergedProps} style={gridStyle} ref={ref}>
      {Array.from({ length: size * size }, (_, index) => (
        <SudokuCell key={index} index={index} />
      ))}
    </ark.div>
  )
})

SudokuGrid.displayName = 'Sudoku.Grid'
