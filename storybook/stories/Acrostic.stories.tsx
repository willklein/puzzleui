import type { Meta, StoryObj } from '@storybook/react-vite'
import { Acrostic, type AcrosticLineData } from '../../src/lib/acrostic'

const LINES: AcrosticLineData[] = [
  { clue: 'Unlocked, unsealed, or begun', longWordLength: 6, smallWordStart: 1, smallWordEnd: 3 },
  { clue: 'Dwellings where families live', longWordLength: 6, smallWordStart: 2, smallWordEnd: 4 },
  { clue: 'Utterly astonished', longWordLength: 6, smallWordStart: 3, smallWordEnd: 5 },
  { clue: 'Moves in sharp, alternating turns', longWordLength: 6, smallWordStart: 3, smallWordEnd: 5 },
  { clue: 'Flies aircraft, or guides a ship', longWordLength: 6, smallWordStart: 2, smallWordEnd: 4 },
  { clue: 'Breaks the rules for unfair advantage', longWordLength: 6, smallWordStart: 2, smallWordEnd: 4 },
]
const SOLUTION = 'PUZZLE'
const SOLVED_WORDS = ['OPENED', 'HOUSES', 'AMAZED', 'ZIGZAG', 'PILOTS', 'CHEATS']

interface AcrosticDemoProps {
  defaultGuesses?: string[][]
}

function AcrosticDemo({ defaultGuesses }: AcrosticDemoProps) {
  return (
    <Acrostic.Root className="acrostic" lines={LINES} solution={SOLUTION} defaultGuesses={defaultGuesses}>
      {LINES.map((_, index) => (
        <Acrostic.Line key={index} index={index} className="acrostic-line" />
      ))}

      <div className="acrostic-answer-row">
        <span className="acrostic-answer-label">Answer</span>
        <Acrostic.Answer className="acrostic-answer" />
      </div>

      <Acrostic.SolvedIndicator className="acrostic-solved" fallback={<span>Keep going…</span>}>
        Solved! The answers spell {SOLUTION}.
      </Acrostic.SolvedIndicator>
    </Acrostic.Root>
  )
}

const meta: Meta<typeof AcrosticDemo> = {
  title: 'Components/Acrostic',
  component: AcrosticDemo,
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof AcrosticDemo>

/** Type a guess into each line's boxes; the small word's first letter (highlighted) spells the answer. */
export const Default: Story = {}

/** Pre-filled with the correct long words, showing the solved state. */
export const Solved: Story = {
  args: {
    defaultGuesses: SOLVED_WORDS.map((word) => word.split('')),
  },
}
