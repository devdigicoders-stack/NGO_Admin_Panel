import { extendTheme } from '@chakra-ui/react';

const config = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

// ── Website maroon/red palette ──────────────────────────────
const colors = {
  brand: {
    50:  '#fdf0ee',
    100: '#f7ccc5',
    200: '#f0a89d',
    300: '#e88475',
    400: '#d85a47',
    500: '#821905',  // primary maroon — website main color
    600: '#6e1504',
    700: '#5c1204',
    800: '#470e03',
    900: '#2e0902',
  },
  gold: {
    50:  '#fff9e6',
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
  body:    `'Inter', 'Outfit', -apple-system, sans-serif`,
};

const styles = {
  global: (props) => ({
    body: {
      bg:    props.colorMode === 'dark' ? '#1a0804' : '#fdf4f2',
      color: props.colorMode === 'dark' ? '#f0d8d4' : '#2e0d09',
      transition: 'background-color 0.25s ease, color 0.25s ease',
    },
    'html, #root': { height: '100%' },
  }),
};

const components = {
  Card: {
    baseStyle: (props) => ({
      container: {
        bg: props.colorMode === 'dark' ? '#2a0c06' : '#ffffff',
        border: '1px solid',
        borderColor: props.colorMode === 'dark' ? '#4a1208' : '#f0c4bb',
        borderRadius: '2xl',
        boxShadow:
          props.colorMode === 'dark'
            ? '0 4px 24px -4px rgba(0,0,0,0.6)'
            : '0 2px 16px -4px rgba(130,25,5,0.08)',
        transition: 'all 0.2s ease',
      },
    }),
  },

  Button: {
    baseStyle: { borderRadius: 'xl', fontWeight: '600' },
    variants: {
      solid: (props) =>
        props.colorScheme === 'brand'
          ? {
              bg: '#821905',
              color: 'white',
              _hover: { bg: '#6e1504' },
              _active: { bg: '#5c1204' },
            }
          : {},
    },
  },

  Table: {
    variants: {
      simple: (props) => ({
        th: {
          borderColor: props.colorMode === 'dark' ? 'rgba(255,255,255,0.08)' : '#f0c4bb',
          color: props.colorMode === 'dark' ? '#e8907a' : '#821905',
          fontSize: 'xs',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: 'wider',
          py: 4,
        },
        td: {
          borderColor: props.colorMode === 'dark' ? 'rgba(255,255,255,0.06)' : '#faeae7',
          py: 3,
          color: props.colorMode === 'dark' ? '#f0d8d4' : undefined,
        },
        tr: {
          _hover: {
            bg:
              props.colorMode === 'dark'
                ? 'rgba(232,144,122,0.06)'
                : 'rgba(130,25,5,0.03)',
          },
        },
      }),
    },
  },

  Input: {
    variants: {
      filled: (props) => ({
        field: {
          bg:   props.colorMode === 'dark' ? 'rgba(255,255,255,0.08)' : '#fdf4f2',
          color: props.colorMode === 'dark' ? '#f5e0dc' : '#2e0d09',
          borderRadius: 'xl',
          _hover: { bg: props.colorMode === 'dark' ? 'rgba(255,255,255,0.12)' : '#f9e8e4' },
          _focus: {
            bg: props.colorMode === 'dark' ? '#2a0c06' : '#ffffff',
            borderColor: '#821905',
          },
          _placeholder: {
            color: props.colorMode === 'dark' ? '#a06050' : '#b08080',
          },
        },
      }),
    },
  },

  Select: {
    variants: {
      filled: (props) => ({
        field: {
          bg:   props.colorMode === 'dark' ? 'rgba(255,255,255,0.08)' : '#fdf4f2',
          color: props.colorMode === 'dark' ? '#f5e0dc' : '#2e0d09',
          borderRadius: 'xl',
          _hover: { bg: props.colorMode === 'dark' ? 'rgba(255,255,255,0.12)' : '#f9e8e4' },
        },
      }),
    },
  },

  Textarea: {
    variants: {
      filled: (props) => ({
        bg:   props.colorMode === 'dark' ? 'rgba(255,255,255,0.08)' : '#fdf4f2',
        color: props.colorMode === 'dark' ? '#f5e0dc' : '#2e0d09',
        _hover: { bg: props.colorMode === 'dark' ? 'rgba(255,255,255,0.12)' : '#f9e8e4' },
        _focus: {
          bg: props.colorMode === 'dark' ? '#2a0c06' : '#ffffff',
          borderColor: '#821905',
        },
        _placeholder: {
          color: props.colorMode === 'dark' ? '#a06050' : '#b08080',
        },
      }),
    },
  },

  Tabs: {
    variants: {
      line: (props) => ({
        tablist: {
          borderColor: props.colorMode === 'dark' ? '#4a1208' : '#f0c4bb',
        },
        tab: {
          color: props.colorMode === 'dark' ? '#c08070' : '#a05040',
          _selected: {
            color:       props.colorMode === 'dark' ? '#e8907a' : '#821905',
            borderColor: props.colorMode === 'dark' ? '#e8907a' : '#821905',
          },
          _hover: {
            color: props.colorMode === 'dark' ? '#e8907a' : '#821905',
          },
        },
      }),
      'soft-rounded': (props) => ({
        tab: {
          color: props.colorMode === 'dark' ? '#c08070' : '#a05040',
          _selected: { bg: '#821905', color: 'white' },
        },
      }),
    },
  },

  Menu: {
    baseStyle: (props) => ({
      list: {
        bg: props.colorMode === 'dark' ? '#2a0c06' : '#ffffff',
        borderColor: props.colorMode === 'dark' ? '#4a1208' : '#f0c4bb',
        boxShadow:
          props.colorMode === 'dark'
            ? '0 8px 32px rgba(0,0,0,0.5)'
            : '0 8px 24px rgba(130,25,5,0.12)',
      },
      item: {
        bg: 'transparent',
        color: props.colorMode === 'dark' ? '#f0d8d4' : '#5c1204',
        _hover: {
          bg:    props.colorMode === 'dark' ? 'rgba(232,144,122,0.12)' : 'rgba(130,25,5,0.06)',
          color: props.colorMode === 'dark' ? '#e8907a' : '#821905',
        },
      },
    }),
  },

  Popover: {
    baseStyle: (props) => ({
      content: {
        bg: props.colorMode === 'dark' ? '#2a0c06' : '#ffffff',
        borderColor: props.colorMode === 'dark' ? '#4a1208' : '#f0c4bb',
      },
    }),
  },

  Drawer: {
    baseStyle: (props) => ({
      dialog: {
        bg: props.colorMode === 'dark' ? '#2a0c06' : '#ffffff',
      },
    }),
  },

  Badge: {
    baseStyle: { textTransform: 'capitalize', fontWeight: '600' },
  },

  Divider: {
    baseStyle: (props) => ({
      borderColor: props.colorMode === 'dark' ? '#4a1208' : '#f0c4bb',
      opacity: 1,
    }),
  },

  Checkbox: {
    baseStyle: (props) => ({
      control: {
        borderColor: props.colorMode === 'dark' ? '#c08070' : '#a05040',
        _checked: {
          bg: '#821905',
          borderColor: '#821905',
        },
      },
      label: {
        color: props.colorMode === 'dark' ? '#f0d8d4' : '#5c1204',
      },
    }),
  },
};

const semanticTokens = {
  colors: {
    'bg.page':         { default: '#fdf4f2',  _dark: '#1a0804' },
    'bg.card':         { default: '#ffffff',   _dark: '#2a0c06' },
    'bg.subtle':       { default: '#fdf4f2',   _dark: 'rgba(255,255,255,0.05)' },
    'border.default':  { default: '#f0c4bb',   _dark: '#4a1208' },
    'text.title':      { default: '#2e0d09',   _dark: '#f5e0dc' },
    'text.body':       { default: '#5c1204',   _dark: '#f0d8d4' },
    'text.muted':      { default: '#a05040',   _dark: '#c08070' },
    'accent.primary':  { default: '#821905',   _dark: '#e8907a' },
    'accent.gold':     { default: '#FFC108',   _dark: '#FFC108' },
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
