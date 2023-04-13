import { ColorScheme, colors } from '@vechaiui/react';

const smileyThemeDark: ColorScheme = {
  id: 'smileyThemeDark',
  type: 'dark',
  colors: {
    bg: {
      base: colors.trueGray['900'],
      fill: colors.trueGray['900']
    },
    text: {
      foreground: colors.indigo['200'],
      muted: colors.blue['300']
    },
    primary: colors.indigo,
    neutral: colors.indigo
  }
};

const smileyThemeLight: ColorScheme = {
  id: 'smileyThemeLight',
  type: 'light',
  colors: {
    bg: {
      base: colors.white,
      fill: colors.coolGray['100']
    },
    text: {
      foreground: colors.indigo['800'],
      muted: colors.violet['500']
    },
    primary: colors.indigo,
    neutral: colors.indigo
  }
};

export default { smileyThemeLight, smileyThemeDark };
