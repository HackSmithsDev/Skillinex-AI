import { useUnstableNativeVariable } from 'nativewind';

export const nativeTheme = {
  navigation: {
    tabBar: {
      height: 90,
      paddingBottom: 30,
      paddingTop: 12,
      borderTopWidth: 4,
    },
    tabBarLabel: {
      fontSize: 10,
      fontWeight: '900',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
  },
  controls: {
    compilerPicker: {
      width: 140,
      transform: [{ scale: 0.8 }],
    },
    multilineInput: {
      textAlignVertical: 'top',
    },
    sectionChevron: {
      collapsed: [{ rotate: '0deg' }],
      expanded: [{ rotate: '90deg' }],
    },
  },
  media: {
    videoAspectRatio: 0.56,
  },
  statusBarStyle: 'dark-content',
};

// Tokens (declared in global.css) that must be handed to JS-only props
// such as React Navigation options or Picker colours.
const TOKENS = [
  'background', 'foreground', 'primary', 'primary-foreground', 'card', 'subtle', 'success', 'highlight',
  'muted-foreground', 'inverse',
];

const toRgb = (value) => {
  if (value == null) return undefined;
  const parts = Array.isArray(value) ? value : String(value).trim().split(/[\s,]+/);
  const nums = parts.map(Number);
  return nums.length >= 3 && nums.every((n) => !Number.isNaN(n))
    ? `rgb(${nums[0]}, ${nums[1]}, ${nums[2]})`
    : undefined;
};

export function useThemeColors() {
  const colors = {};
  for (const token of TOKENS) {
    // eslint-disable-next-line react-hooks/rules-of-hooks -- TOKENS is a constant list
    colors[token] = toRgb(useUnstableNativeVariable(`--${token}`));
  }
  return colors;
}

export default useThemeColors;
