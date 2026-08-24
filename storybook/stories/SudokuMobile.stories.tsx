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

/**
 * Whether a cell currently shows its selection ring — the `box-shadow` CSS rule keyed off
 * `[data-focused]`/`[data-selected]`, suppressed only while `.sudoku-mobile-grid` isn't
 * `:focus-within` (see globals.css). This is deliberately a *computed-style* check, not a
 * `data-focused` attribute check: the attribute reflects the machine's own bookkeeping and can
 * stay present even when the ring has visually disappeared, which is exactly the gap these
 * tests are after.
 */
function hasSelectionRing(cell: HTMLElement) {
  return getComputedStyle(cell).boxShadow !== 'none'
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

/**
 * Clearing the active (armed) digit: all six stories below start from an explicitly blurred
 * grid (see the module doc comment) and arm a digit via the pad first, matching "select a
 * number" as a first action. The digit's own pad button carries `data-active` while armed —
 * that's what every assertion here reads.
 */

/** 1) Tap an armed digit again (nothing else in between) — a plain toggle-off. */
export const ClearActiveDigitByTappingItAgain: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const user = userEvent.setup()

    await blurGrid(canvas, user)
    const digitBtn = eligibleDigitButtons(canvas)[0]
    await user.click(digitBtn) // arm
    expect(digitBtn).toHaveAttribute('data-active')

    await user.click(digitBtn) // tap again
    expect(digitBtn).not.toHaveAttribute('data-active')
  },
}

/** 2) Arm a digit, then click outside the puzzle and every button — should also clear it. */
export const ClearActiveDigitByBlurring: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const user = userEvent.setup()

    await blurGrid(canvas, user)
    const digitBtn = eligibleDigitButtons(canvas)[0]
    await user.click(digitBtn) // arm
    expect(digitBtn).toHaveAttribute('data-active')

    await blurGrid(canvas, user) // click outside again
    expect(digitBtn).not.toHaveAttribute('data-active')
  },
}

/** 3) Arm a digit, use it to place a note, then tap the same digit again to clear it. */
export const ActiveDigitAfterNoteTapAgain: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const user = userEvent.setup()
    const grid = cells(canvas)

    await blurGrid(canvas, user)
    await user.click(canvas.getByRole('button', { name: 'Notes' }))
    const digitBtn = eligibleDigitButtons(canvas)[0]
    await user.click(digitBtn) // arm
    await user.click(grid[2]) // places a note in an empty cell using the armed digit
    expect(digitBtn).toHaveAttribute('data-active')

    await user.click(digitBtn) // tap the same digit again
    expect(digitBtn).not.toHaveAttribute('data-active')
  },
}

/** 4) Same as 3, but blurring (clicking outside) instead of tapping the digit again. */
export const ActiveDigitAfterNoteBlur: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const user = userEvent.setup()
    const grid = cells(canvas)

    await blurGrid(canvas, user)
    await user.click(canvas.getByRole('button', { name: 'Notes' }))
    const digitBtn = eligibleDigitButtons(canvas)[0]
    await user.click(digitBtn) // arm
    await user.click(grid[3]) // places a note in an empty cell using the armed digit
    expect(digitBtn).toHaveAttribute('data-active')

    await blurGrid(canvas, user)
    expect(digitBtn).not.toHaveAttribute('data-active')
  },
}

/** 5) Same as 3, but entering a solved value instead of a note. */
export const ActiveDigitAfterSolutionTapAgain: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const user = userEvent.setup()
    const grid = cells(canvas)

    await blurGrid(canvas, user)
    const digitBtn = eligibleDigitButtons(canvas)[0]
    await user.click(digitBtn) // arm
    await user.click(grid[5]) // solves an empty cell with the armed digit
    expect(digitBtn).toHaveAttribute('data-active')

    await user.click(digitBtn) // tap the same digit again
    expect(digitBtn).not.toHaveAttribute('data-active')
  },
}

/** 6) Same as 5, but blurring (clicking outside) instead of tapping the digit again. */
export const ActiveDigitAfterSolutionBlur: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const user = userEvent.setup()
    const grid = cells(canvas)

    await blurGrid(canvas, user)
    const digitBtn = eligibleDigitButtons(canvas)[0]
    await user.click(digitBtn) // arm
    await user.click(grid[6]) // solves an empty cell with the armed digit
    expect(digitBtn).toHaveAttribute('data-active')

    await blurGrid(canvas, user)
    expect(digitBtn).not.toHaveAttribute('data-active')
  },
}

/**
 * A digit's pad button hides once it's been placed all `layout.size` times without any of
 * those placements conflicting with each other in a row/column/box — regardless of whether
 * each placement is in its actual solution cell ("correct" here means rule-valid, not solved).
 * Digit 2 has the fewest givens in this puzzle (2, at cells 49 and 60), so painting it into 7
 * more empty cells — one in each still-needed row/column/box (2, 17, 21, 28, 43, 63, 77;
 * verified conflict-free offline against the puzzle's fixed layout) — completes it without
 * needing to solve the rest of the puzzle first.
 */
export const HidesFullyAndValidlyPlacedDigit: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const user = userEvent.setup()
    const grid = cells(canvas)

    await blurGrid(canvas, user)
    const digitTwo = canvas.getByRole('button', { name: '2' })
    await user.click(digitTwo) // arm digit 2

    for (const index of [2, 17, 21, 28, 43, 63, 77]) {
      await user.click(grid[index]) // paint mode: each tap places the armed digit directly
    }

    expect(grid[2]).toHaveTextContent('2')
    expect(canvas.queryByRole('button', { name: '2' })).not.toBeInTheDocument()

    // an unrelated, not-yet-fully-placed digit stays selectable
    expect(canvas.getByRole('button', { name: '1' })).toBeInTheDocument()
  },
}

/**
 * 1) Select an unsolved (empty) cell, then toggle *into* Notes mode via the toolbar button —
 * the cell's selection ring should stay visible. The toolbar's Notes toggle, unlike the digit
 * pad, doesn't guard `onPointerDown` against stealing DOM focus, so a real tap on it moves
 * focus off the grid — and the cell's ring is driven by `.sudoku-mobile-grid:focus-within` in
 * CSS, not by the machine's `focusedIndex`/`data-focused` bookkeeping, which never changes here.
 */
export const SelectionRingSurvivesTogglingIntoNoteMode: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const user = userEvent.setup()
    const grid = cells(canvas)

    await blurGrid(canvas, user)
    await user.click(grid[2]) // select an unsolved cell
    expect(hasSelectionRing(grid[2])).toBe(true)

    await user.click(canvas.getByRole('button', { name: 'Notes' }))
    expect(hasSelectionRing(grid[2])).toBe(true)
  },
}

/** 2) Same as 1, but toggling the other direction: start in Notes mode, select a cell, then toggle back to solve mode. */
export const SelectionRingSurvivesTogglingOutOfNoteMode: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const user = userEvent.setup()
    const grid = cells(canvas)

    await blurGrid(canvas, user)
    await user.click(canvas.getByRole('button', { name: 'Notes' }))
    await user.click(grid[3]) // select an unsolved cell
    expect(hasSelectionRing(grid[3])).toBe(true)

    await user.click(canvas.getByRole('button', { name: 'Notes' })) // toggle back to solve mode
    expect(hasSelectionRing(grid[3])).toBe(true)
  },
}
