import { Tabs } from '@ark-ui/react/tabs'
import { CryptexExample } from './examples/cryptex-example'
import { AcrosticExample } from './examples/acrostic-example'

export function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>puzzleui</h1>
        <p>A puzzle component library built on Ark UI, with state managed by Zag JS.</p>
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
