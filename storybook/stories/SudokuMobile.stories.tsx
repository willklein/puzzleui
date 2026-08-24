import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { SudokuPage } from '../../src/pages/sudoku-page'

/**
 * View-level stories for the `/sudoku` mobile demo page itself (`src/pages/sudoku-page.tsx`),
 * not just the underlying `Sudoku` library components. `SudokuPage` owns its own puzzle
 * instance and hardcodes the classic Wikipedia example puzzle as givens — every play function
 * below relies on that fixed layout to know which cell indices are empty:
 *
 *   5, 3, _,  _, 7, _,  _, _, _,     (indices 0-8: empty at 2, 3, 5, 6, 7, 8)
 *   6, _, _,  1, 9, 5,  _, _, _,     ...
 *
 * A "cell" here means the grid buttons, in DOM order — index 0 is row 1 col 1, etc. — matching
 * `sudoku.values`'s own indexing.
 *
 * Two setup quirks every play function below has to account for:
 *
 * - Digit-pad buttons are queried dynamically rather than by a hardcoded digit: once a cell is
 *   focused, the pad hides (`visibility: hidden`, so genuinely unclickable — not just
 *   `aria-hidden`) every digit that isn't a remaining candidate for that cell, so a play
 *   function can't just pick an arbitrary digit for a cell it selected first without risking a
 *   hidden button. Picking whichever digit is currently visible sidesteps needing to hand-solve
 *   the puzzle to know which digits are valid where.
 * - The grid's roving-tabindex effect focuses cell 0 on mount (needed for real keyboard nav),
 *   which bubbles up as `gridHasFocus` becoming true before any interaction at all — so a story
 *   that needs to start from a genuinely *unfocused* grid (the "digit first" path, which only
 *   behaves as "arm a digit" while nothing is focused) has to blur explicitly first.
 */
const meta: Meta<typeof SudokuPage> = {
  title: 'Views/SudokuMobile',
  component: SudokuPage,
  parameters: { layout: 'fullscreen' },
}

export default meta
type Story = StoryObj<typeof SudokuPage>

function cells(canvas: ReturnType<typeof within>) {
  return canvas.getAllByRole('button', { name: /^Row \d+, column \d+/ })
}

/** Whichever digit-pad buttons are currently eligible (not candidate-filtered away). */
function eligibleDigitButtons(canvas: ReturnType<typeof within>) {
  return canvas.getAllByRole('button', { name: /^[1-9]$/ })
}

function selectedCells(grid: HTMLElement[]) {
  return grid.filter((cell) => cell.hasAttribute('data-selected'))
}

/** Taps the always-present "Keep going…" indicator — outside the grid and not a button. */
async function blurGrid(canvas: ReturnType<typeof within>, user: ReturnType<typeof userEvent.setup>) {
  await user.click(canvas.getByText('Keep going…'))
}

/** Baseline render, no interaction — the other stories all cover behavior via play functions. */
export const Default: Story = {}

/**
 * Regression test for the "stale post-blur anchor" bug: solving a cell, blurring (which
 * collapses back to a single-cell "selection"), then tapping a different empty cell used to
 * extend the stale anchor instead of replacing it. Fixed via `selectionSessionRef` in
 * `SudokuMobileCell`.
 */
export const NoStaleSelectionAfterBlur: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const user = userEvent.setup()
    const grid = cells(canvas)

    await user.click(grid[2]) // select an empty cell
    await user.click(eligibleDigitButtons(canvas)[0]) // enter a solution
    await blurGrid(canvas, user) // collapses back to a single cell
    await user.click(grid[6]) // select a different empty cell

    expect(grid[6]).toHaveAttribute('data-focused')
    expect(selectedCells(grid)).toHaveLength(0)
  },
}

/** Same bug, but via a note entry instead of a solved value. */
export const NoStaleSelectionAfterBlurWithNotes: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const user = userEvent.setup()
    const grid = cells(canvas)

    await user.click(canvas.getByRole('button', { name: 'Notes' }))
    await user.click(grid[3])
    await user.click(eligibleDigitButtons(canvas)[0])
    await blurGrid(canvas, user)
    await user.click(grid[7])

    expect(grid[7]).toHaveAttribute('data-focused')
    expect(selectedCells(grid)).toHaveLength(0)
  },
}

/**
 * The legitimate feature the fix above must not break: consecutive taps on empty cells,
 * *without* an intervening blur, should keep extending one multi-select session.
 */
export const MultiSelectExtendsWithoutBlur: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const user = userEvent.setup()
    const grid = cells(canvas)

    await user.click(grid[5])
    await user.click(grid[6])
    await user.click(grid[7])

    expect(selectedCells(grid)).toEqual([grid[5], grid[6], grid[7]])
  },
}

/**
 * The known-good path: arm a digit from the pad *first*, with nothing focused (hence the
 * explicit blur — see the module doc comment), then tap empty cells one at a time. Each tap
 * paints that digit directly and never accumulates a stale multi-select — this is the
 * reference behavior `CellFirstThenDigitThenSelectCells` (below) is missing.
 */
export const DigitFirstThenSelectCells: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const user = userEvent.setup()
    const grid = cells(canvas)

    await blurGrid(canvas, user) // start from a genuinely unfocused grid
    const digitBtn = eligibleDigitButtons(canvas)[0] // arm a digit, no cell focused
    const digit = digitBtn.textContent
    await user.click(digitBtn)
    await user.click(grid[2]) // paints cell 2
    await user.click(grid[3]) // paints cell 3

    expect(digitBtn).toHaveAttribute('data-active')
    expect(selectedCells(grid)).toHaveLength(0)
    expect(grid[2]).toHaveTextContent(digit!)
    expect(grid[3]).toHaveTextContent(digit!)
  },
}

/**
 * The reported bug: select an empty cell first, *then* tap a digit on the pad to solve it,
 * then tap a different empty cell. Per the digit-first path above, the just-entered digit
 * should stay armed/highlighted (`data-active` on its pad button) and the next tap should
 * target only the new cell — not retain the previous one in a stale multi-select.
 */
export const CellFirstThenDigitThenSelectCells: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const user = userEvent.setup()
    const grid = cells(canvas)

    await user.click(grid[3]) // select an empty cell first
    const digitBtn = eligibleDigitButtons(canvas)[0] // a candidate valid for cell 3 specifically
    const digit = digitBtn.textContent
    await user.click(digitBtn) // solve it via the pad
    await user.click(grid[7]) // then move to a different empty cell

    expect(digitBtn).toHaveAttribute('data-active')
    expect(selectedCells(grid)).toHaveLength(0)
    expect(grid[7]).toHaveTextContent(digit!) // parity with the digit-first path: still armed, so it paints
  },
}
