import type { Meta, StoryObj } from '@storybook/react-vite'
import { Cryptex, type CryptexProps } from '../../src/lib/cryptex'

const LETTERS: string[][] = [
  ['B', 'C', 'G'],
  ['O', 'A', 'U'],
  ['L', 'R', 'N'],
  ['P', 'T', 'D'],
  ['O', 'I', 'E'],
  ['S', 'N', 'M'],
]
const SOLUTION = 'GARDEN'

type CryptexDemoProps = Pick<CryptexProps, 'defaultValue' | 'disabled' | 'onValueChange' | 'onSolvedChange'>

function CryptexDemo({ defaultValue, disabled, onValueChange, onSolvedChange }: CryptexDemoProps) {
  return (
    <Cryptex.Root
      className="cryptex"
      letters={LETTERS}
      solution={SOLUTION}
      defaultValue={defaultValue}
      disabled={disabled}
      onValueChange={onValueChange}
      onSolvedChange={onSolvedChange}
    >
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
  args: {
    disabled: false,
  },
  argTypes: {
    defaultValue: {
      control: 'object',
      description:
        "Initial letter dialed into each wheel, uncontrolled. One entry per wheel, e.g. `['G', 'A', 'R', 'D', 'E', 'N']`.",
    },
    disabled: {
      control: 'boolean',
      description: 'Disables interaction with every wheel.',
    },
    onValueChange: {
      table: { category: 'Events' },
      description: 'Fires whenever a wheel is dialed to a new letter.',
    },
    onSolvedChange: {
      table: { category: 'Events' },
      description: 'Fires when the dialed guess starts or stops matching `solution`.',
    },
  },
}

export default meta
type Story = StoryObj<typeof CryptexDemo>

/** Each wheel dials in a letter for its position; arrow keys move between wheels and step through candidates. */
export const Default: Story = {}

/** Pre-dialed to the correct word, showing the unlocked state. */
export const Solved: Story = {
  args: {
    defaultValue: ['C', 'A', 'R', 'D', 'E', 'N'],
  },
}
