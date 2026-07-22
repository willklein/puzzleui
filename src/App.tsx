import { Tabs } from '@ark-ui/react/tabs'
import { CryptexExample } from './examples/cryptex-example'
import { AcrosticExample } from './examples/acrostic-example'

export function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>puzzleui</h1>
        <p>
          A puzzle component library built on{' '}
          <a href="https://ark-ui.com/" target="_blank" rel="noreferrer">
            Ark UI
          </a>
          , with state managed by{' '}
          <a href="https://zagjs.com/" target="_blank" rel="noreferrer">
            Zag
          </a>
          .
        </p>
        <p className="app-links">
          Source:{' '}
          <a href="https://github.com/willklein/puzzleui" target="_blank" rel="noreferrer">
            GitHub
          </a>{' '}
          ·{' '}
          <a href="https://tangled.org/willkle.in/puzzleui" target="_blank" rel="noreferrer">
            Tangled
          </a>
        </p>
      </header>

      <Tabs.Root defaultValue="cryptex" className="tabs">
        <Tabs.List className="tabs-list">
          <Tabs.Trigger value="cryptex" className="tabs-trigger">
            Cryptex
          </Tabs.Trigger>
          <Tabs.Trigger value="acrostic" className="tabs-trigger">
            Acrostic
          </Tabs.Trigger>
          <Tabs.Indicator className="tabs-indicator" />
        </Tabs.List>

        <Tabs.Content value="cryptex" className="tabs-content">
          <CryptexExample />
        </Tabs.Content>
        <Tabs.Content value="acrostic" className="tabs-content">
          <AcrosticExample />
        </Tabs.Content>
      </Tabs.Root>
    </div>
  )
}
