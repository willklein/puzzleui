import type { Meta, StoryObj } from '@storybook/react-vite'
import { Cryptex } from '../../src/lib/cryptex'

const LETTERS: string[][] = [
  ['B', 'C', 'G'],
  ['O', 'A', 'U'],
  ['L', 'R', 'N'],
  ['P', 'T', 'D'],
  ['O', 'I', 'E'],
  ['S', 'N', 'M'],
]
const SOLUTION = 'GARDEN'

interface CryptexDemoProps {
  defaultValue?: string[]
}

function CryptexDemo({ defaultValue }: CryptexDemoProps) {
  return (
    <Cryptex.Root className="cryptex" letters={LETTERS} solution={SOLUTION} defaultValue={defaultValue}>
      <Cryptex.Label className="cryptex-label">Crack the cryptex</Cryptex.Label>

      <div className="cryptex-wheels">
        {LETTERS.map((candidates, index) => (
          <Cryptex.Wheel key={index} index={index} letters={candidates} className="cryptex-wheel" />
        ))}
      </div>

      <Cryptex.ValueText className="cryptex-value-text" />

      <Cryptex.SolvedIndicator className="cryptex-solved" fallback={<span>Locked</span>}>
        Unlocked! The word was {SOLUTION}.
      </Cryptex.SolvedIndicator>
    </Cryptex.Root>
  )
}

const meta: Meta<typeof CryptexDemo> = {
  title: 'Components/Cryptex',
  component: CryptexDemo,
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof CryptexDemo>

/** Each wheel dials in a letter for its position; arrow keys move between wheels and step through candidates. */
export const Default: Story = {}

/** Pre-dialed to the correct word, showing the unlocked state. */
export const Solved: Story = {
  args: {
    defaultValue: SOLUTION.split(''),
  },
}
