import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import { playwright } from '@vitest/browser-playwright'

const dirname = path.dirname(fileURLToPath(import.meta.url))

// Runs every story's play function (and, for stories without one, a render smoke test) as a
// Vitest test in a real browser. See: https://storybook.js.org/docs/writing-tests/integrations/vitest-addon
export default defineConfig({
  // @testing-library/dom (used by Storybook's play functions) pulls in several CJS deps
  // (aria-query, lz-string, pretty-format, ...) in shapes Vite's on-the-fly CJS->ESM transform
  // can't statically detect named/default exports from. Pre-bundling it here pulls its whole
  // dependency tree through esbuild instead, which detects them correctly. It's also listed as
  // a direct devDependency so pnpm's strict node_modules actually hoists it to a location
  // optimizeDeps can resolve by name.
  optimizeDeps: {
    include: ['@testing-library/dom'],
  },
  test: {
    projects: [
      {
        extends: true,
        plugins: [storybookTest({ configDir: path.join(dirname, 'storybook') })],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
})
