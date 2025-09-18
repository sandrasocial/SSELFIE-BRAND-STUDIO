import type { Meta, StoryObj } from '@storybook/react';
import ImageActions from '../ImageActions';

// Sample image variations for stories
const sampleVariations = [
  {
    id: '1',
    url: 'https://images.unsplash.com/photo-1494790108755-2616c75f91af?w=400&h=500&fit=crop',
    title: 'Professional Portrait - Version 1'
  },
  {
    id: '2', 
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop',
    title: 'Professional Portrait - Version 2'
  },
  {
    id: '3',
    url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop',
    title: 'Professional Portrait - Version 3'
  },
  {
    id: '4',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop',
    title: 'Professional Portrait - Version 4'
  }
];

const meta: Meta<typeof ImageActions> = {
  title: 'Components/ImageActions',
  component: ImageActions,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'ImageActions component provides comparison functionality for image variations with keyboard navigation support.'
      }
    }
  },
  argTypes: {
    variations: {
      description: 'Array of image variations to compare'
    },
    selectedIndex: {
      description: 'Currently selected image index',
      control: { type: 'number', min: 0 }
    },
    onSelect: {
      description: 'Callback when an image is selected',
      action: 'onSelect'
    },
    className: {
      description: 'Additional CSS classes'
    }
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variations: sampleVariations,
    selectedIndex: 0
  }
};

export const TwoVariations: Story = {
  args: {
    variations: sampleVariations.slice(0, 2),
    selectedIndex: 0
  }
};

export const SingleImage: Story = {
  args: {
    variations: sampleVariations.slice(0, 1),
    selectedIndex: 0
  },
  parameters: {
    docs: {
      description: {
        story: 'When only one image is available, the component renders nothing (no comparison needed).'
      }
    }
  }
};

export const WithSelectedIndex: Story = {
  args: {
    variations: sampleVariations,
    selectedIndex: 2
  },
  parameters: {
    docs: {
      description: {
        story: 'Starting with a different image selected (third variation).'
      }
    }
  }
};

export const Interactive: Story = {
  args: {
    variations: sampleVariations,
    selectedIndex: 0,
    onSelect: (index: number) => {
      console.log('Selected variation:', index);
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive example with callback handling. Click "Compare" to enter full-screen comparison mode and use arrow keys to navigate.'
      }
    }
  }
};
