import { ColorScheme, colors } from '@vechaiui/react';
import { BgColorScheme } from '..';

const SmileyDark: ColorScheme & BgColorScheme = {
  id: 'SmileyDark',
  type: 'dark',
  colors: {
    bg: {
      base: colors.trueGray['900'],
      fill: colors.trueGray['700']
    },
    text: {
      foreground: colors.fuchsia['300'],
      muted: colors.yellow['100']
    },
    primary: colors.indigo,
    neutral: colors.yellow,
    hightlight1: '#ffef1f',
    hightlight2: '#ff10f0'
  }
};

const SmileyLight: ColorScheme & BgColorScheme = {
  id: 'SmileyLight',
  type: 'light',
  colors: {
    bg: {
      base: colors.white,
      fill: colors.warmGray['400']
    },
    text: {
      foreground: colors.fuchsia['800'],
      muted: colors.yellow['800']
    },
    primary: colors.fuchsia,
    neutral: colors.fuchsia,
    hightlight1: '#ffef1f',
    hightlight2: '#ff10f0'
  }
};

export default { SmileyLight, SmileyDark };
