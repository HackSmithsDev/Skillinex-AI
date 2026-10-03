import { useUnstableNativeVariable } from 'nativewind';

// Tokens (declared in global.css) that must be handed to JS-only props
// such as React Navigation options or Picker colours.
const TOKENS = [
  'primary', 'primary-foreground', 'card', 'subtle', 'success', 'highlight', 'muted-foreground', 'inverse',
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
