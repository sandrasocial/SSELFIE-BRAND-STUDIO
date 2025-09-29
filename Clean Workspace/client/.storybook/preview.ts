import type { Preview } from '@storybook/react';

// Import global CSS for Storybook (adjust path if needed)
import '../src/fixed-tailwind.css';
import '../src/index.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
  },
};

export default preview;