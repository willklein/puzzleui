import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  stories: ['./stories/**/*.mdx', './stories/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@storybook/addon-docs', 'storybook-addon-playscape'],
  framework: '@storybook/react-vite',
}
export default config
