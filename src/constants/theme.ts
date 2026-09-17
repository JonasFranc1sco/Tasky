import { MD3LightTheme } from 'react-native-paper';

// taskyTheme sincroniza o Paper com o design de tailwind.config.js

export const taskyTheme = {
    ...MD3LightTheme,
    colors: {
        ...MD3LightTheme.colors,
        primary: '#0F2042',
        onPrimary: '#FFFFFF',
        secondary: '#4B5E89',
        surface: '#F7F9FB',
        onSurface: '#191C1E',
        onSurfaceVariant: '#45464E',
        surfaceVariant: '#E0E3E5',
        error: '#BA1A1A',
        outline: '#75777F',
    },
};