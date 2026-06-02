import { extendTheme } from '@chakra-ui/react';

const config = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

const colors = {
  brand: {
    50: '#e6f4f1',
    100: '#b3ddd5',
    200: '#80c6b9',
    300: '#4daf9e',
    400: '#26998a',
    500: '#03735F',
    600: '#026652',
    700: '#025847',
    800: '#014a3b',
    900: '#08362E',
  },
  gold: {
    50: '#fff9e6',
    100: '#ffedb3',
    200: '#ffe180',
    300: '#ffd54d',
    400: '#ffcc26',
    500: '#FFC108',
    600: '#e6ae07',
    700: '#cc9a06',
    800: '#b38705',
    900: '#7a5c03',
  },
};

const fonts = {
  heading: `'Outfit', 'Inter', -apple-system, sans-serif`,
  body: `'Inter', 'Outfit', -apple-system, sans-serif`,
};

const styles = {
  global: (props) => ({
    body: {
      // Dark mode: very deep forest green page bg so cards (#0a2e27) pop
      bg: props.colorMode === 'dark' ? '#071f1a' : '#f0f7f5',
      color: props.colorMode === 'dark' ? '#c8e8e2' : '#1a3530',
      transition: 'background-color 0.25s ease, color 0.25s ease',
    },
    // Ensure Chakra color mode class applies to html
    'html, #root': {
      height: '100%',
    },
  }),
};

const components = {
  Card: {
    baseStyle: (props) => ({
      container: {
        bg: props.colorMode === 'dark' ? '#0a2e27' : '#ffffff',
        border: '1px solid',
        borderColor: props.colorMode === 'dark' ? '#0d3d34' : '#d4ede8',
        borderRadius: '2xl',
        boxShadow:
          props.colorMode === 'dark'
            ? '0 4px 24px -4px rgba(0,0,0,0.6)'
            : '0 2px 16px -4px rgba(3,115,95,0.08)',
        transition: 'all 0.2s ease',
      },
    }),
  },
  Button: {
    baseStyle: {
      borderRadius: 'xl',
      fontWeight: '600',
    },
  },
  Table: {
    variants: {
      simple: (props) => ({
        th: {
          borderColor:
            props.colorMode === 'dark' ? 'rgba(255,255,255,0.08)' : '#d4ede8',
          color: props.colorMode === 'dark' ? '#5ddbbb' : '#03735F',
          fontSize: 'xs',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: 'wider',
          py: 4,
        },
        td: {
          borderColor:
            props.colorMode === 'dark' ? 'rgba(255,255,255,0.06)' : '#eaf5f2',
          py: 3,
          color: props.colorMode === 'dark' ? '#c8e8e2' : undefined,
        },
        tr: {
          _hover: {
            bg:
              props.colorMode === 'dark'
                ? 'rgba(93,219,187,0.05)'
                : 'rgba(3,115,95,0.03)',
          },
        },
      }),
    },
  },
  Input: {
    variants: {
      filled: (props) => ({
        field: {
          bg:
            props.colorMode === 'dark'
              ? 'rgba(255,255,255,0.08)'
              : '#f0f7f5',
          color: props.colorMode === 'dark' ? '#e8f8f5' : '#08362E',
          borderRadius: 'xl',
          _hover: {
            bg:
              props.colorMode === 'dark'
                ? 'rgba(255,255,255,0.12)'
                : '#e6f4f1',
          },
          _focus: {
            bg: props.colorMode === 'dark' ? '#0a2e27' : '#ffffff',
            borderColor: '#03735F',
          },
          _placeholder: {
            color: props.colorMode === 'dark' ? '#5a9e95' : '#7ab8ae',
          },
        },
      }),
    },
  },
  Select: {
    variants: {
      filled: (props) => ({
        field: {
          bg:
            props.colorMode === 'dark'
              ? 'rgba(255,255,255,0.08)'
              : '#f0f7f5',
          color: props.colorMode === 'dark' ? '#e8f8f5' : '#08362E',
          borderRadius: 'xl',
          _hover: {
            bg:
              props.colorMode === 'dark'
                ? 'rgba(255,255,255,0.12)'
                : '#e6f4f1',
          },
        },
      }),
    },
  },
  Textarea: {
    variants: {
      filled: (props) => ({
        bg:
          props.colorMode === 'dark' ? 'rgba(255,255,255,0.08)' : '#f0f7f5',
        color: props.colorMode === 'dark' ? '#e8f8f5' : '#08362E',
        _hover: {
          bg:
            props.colorMode === 'dark'
              ? 'rgba(255,255,255,0.12)'
              : '#e6f4f1',
        },
        _focus: {
          bg: props.colorMode === 'dark' ? '#0a2e27' : '#ffffff',
          borderColor: '#03735F',
        },
        _placeholder: {
          color: props.colorMode === 'dark' ? '#5a9e95' : '#7ab8ae',
        },
      }),
    },
  },
  Tabs: {
    variants: {
      line: (props) => ({
        tablist: {
          borderColor: props.colorMode === 'dark' ? '#0d3d34' : '#d4ede8',
        },
        tab: {
          color: props.colorMode === 'dark' ? '#7ab8ae' : '#4a9085',
          _selected: {
            color: props.colorMode === 'dark' ? '#5ddbbb' : '#03735F',
            borderColor: props.colorMode === 'dark' ? '#5ddbbb' : '#03735F',
          },
          _hover: {
            color: props.colorMode === 'dark' ? '#5ddbbb' : '#03735F',
          },
        },
      }),
      'soft-rounded': (props) => ({
        tab: {
          color: props.colorMode === 'dark' ? '#7ab8ae' : '#4a9085',
          _selected: {
            bg: '#03735F',
            color: 'white',
          },
        },
      }),
    },
  },
  Menu: {
    baseStyle: (props) => ({
      list: {
        bg: props.colorMode === 'dark' ? '#0a2e27' : '#ffffff',
        borderColor: props.colorMode === 'dark' ? '#0d3d34' : '#d4ede8',
        boxShadow:
          props.colorMode === 'dark'
            ? '0 8px 32px rgba(0,0,0,0.5)'
            : '0 8px 24px rgba(3,115,95,0.12)',
      },
      item: {
        bg: 'transparent',
        color: props.colorMode === 'dark' ? '#c8e8e2' : '#1a5045',
        _hover: {
          bg:
            props.colorMode === 'dark'
              ? 'rgba(93,219,187,0.1)'
              : 'rgba(3,115,95,0.06)',
          color: props.colorMode === 'dark' ? '#5ddbbb' : '#03735F',
        },
      },
    }),
  },
  Popover: {
    baseStyle: (props) => ({
      content: {
        bg: props.colorMode === 'dark' ? '#0a2e27' : '#ffffff',
        borderColor: props.colorMode === 'dark' ? '#0d3d34' : '#d4ede8',
      },
    }),
  },
  Drawer: {
    baseStyle: (props) => ({
      dialog: {
        bg: props.colorMode === 'dark' ? '#0a2e27' : '#ffffff',
      },
    }),
  },
  Badge: {
    baseStyle: (props) => ({
      textTransform: 'capitalize',
      fontWeight: '600',
    }),
  },
  Divider: {
    baseStyle: (props) => ({
      borderColor: props.colorMode === 'dark' ? '#0d3d34' : '#d4ede8',
      opacity: 1,
    }),
  },
  Checkbox: {
    baseStyle: (props) => ({
      control: {
        borderColor: props.colorMode === 'dark' ? '#5a9e95' : '#4a9085',
        _checked: {
          bg: '#03735F',
          borderColor: '#03735F',
        },
      },
      label: {
        color: props.colorMode === 'dark' ? '#c8e8e2' : '#1a5045',
      },
    }),
  },
};

const semanticTokens = {
  colors: {
    'bg.page': { default: '#f0f7f5', _dark: '#071f1a' },
    'bg.card': { default: '#ffffff', _dark: '#0a2e27' },
    'bg.subtle': { default: '#f0f7f5', _dark: 'rgba(255,255,255,0.05)' },
    'border.default': { default: '#d4ede8', _dark: '#0d3d34' },
    'text.title': { default: '#08362E', _dark: '#e8f8f5' },
    'text.body': { default: '#1a5045', _dark: '#c8e8e2' },
    'text.muted': { default: '#4a9085', _dark: '#7ab8ae' },
    'accent.primary': { default: '#03735F', _dark: '#5ddbbb' },
    'accent.gold': { default: '#FFC108', _dark: '#FFC108' },
  },
};

const theme = extendTheme({
  config,
  colors,
  fonts,
  styles,
  components,
  semanticTokens,
});

export default theme;
