import { useThemeStore } from '@/store/themeStore';
import { COLORS, DARK_COLORS } from '@/constants';

export function useAppColors() {
  const { isDarkMode } = useThemeStore();
  return isDarkMode ? DARK_COLORS : COLORS;
}
