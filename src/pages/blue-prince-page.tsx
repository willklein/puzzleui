import { Tabs } from '@ark-ui/react/tabs'
import { CryptexExample } from '../examples/cryptex-example'
import { AcrosticExample } from '../examples/acrostic-example'

interface PuzzleMeta {
  value: string
  tabLabel: string
  title: string
  description: string
}

const CRYPTEX_PUZZLES: PuzzleMeta[] = [
  {
    value: 'cryptex-1',
    tabLabel: 'Cryptex 1',
    title: 'Cryptex 1 — TODO name',
    description: 'TODO: where this cryptex is found, what it unlocks, and any relevant clue.',
  },
  {
    value: 'cryptex-2',
    tabLabel: 'Cryptex 2',
    title: 'Cryptex 2 — TODO name',
    description: 'TODO: where this cryptex is found, what it unlocks, and any relevant clue.',
  },
  {
    value: 'cryptex-3',
    tabLabel: 'Cryptex 3',
    title: 'Cryptex 3 — TODO name',
    description: 'TODO: where this cryptex is found, what it unlocks, and any relevant clue.',
  },
  {
    value: 'cryptex-4',
    tabLabel: 'Cryptex 4',
    title: 'Cryptex 4 — TODO name',
    description: 'TODO: where this cryptex is found, what it unlocks, and any relevant clue.',
  },
]

const ACROSTIC_PUZZLE: PuzzleMeta = {
  value: 'acrostic-1',
  tabLabel: 'Acrostic',
  title: 'Acrostic — TODO name',
  description: 'TODO: where this acrostic is found, what it unlocks, and any relevant clue.',
}

export function BluePrincePage() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Blue Prince</h1>
        <p>TODO: description of these Blue Prince puzzles goes here.</p>
      </header>

      <Tabs.Root defaultValue={CRYPTEX_PUZZLES[0].value} className="tabs">
        <Tabs.List className="tabs-list">
          {CRYPTEX_PUZZLES.map((puzzle) => (
            <Tabs.Trigger key={puzzle.value} value={puzzle.value} className="tabs-trigger">
              {puzzle.tabLabel}
            </Tabs.Trigger>
          ))}
          <Tabs.Trigger value={ACROSTIC_PUZZLE.value} className="tabs-trigger">
            {ACROSTIC_PUZZLE.tabLabel}
          </Tabs.Trigger>
          <Tabs.Indicator className="tabs-indicator" />
        </Tabs.List>

        {CRYPTEX_PUZZLES.map((puzzle) => (
          <Tabs.Content key={puzzle.value} value={puzzle.value} className="tabs-content">
            <CryptexExample
              title={puzzle.title}
              description={puzzle.description}
              showSavedList={false}
              showDocs={false}
            />
          </Tabs.Content>
        ))}
        <Tabs.Content value={ACROSTIC_PUZZLE.value} className="tabs-content">
          <AcrosticExample title={ACROSTIC_PUZZLE.title} description={ACROSTIC_PUZZLE.description} showDocs={false} />
        </Tabs.Content>
      </Tabs.Root>
    </div>
  )
}
