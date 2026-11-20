import type { ViewStyle } from 'react-native';

export function getResponsiveModalContentStyle(
  viewportWidth: number,
  viewportHeight: number,
  maxWidth: number
): ViewStyle {
  return {
    width: Math.min(Math.max(viewportWidth - 32, 0), maxWidth),
    maxHeight: Math.max(viewportHeight - 48, 0),
    alignSelf: 'center',
    marginVertical: 16,
  };
}
