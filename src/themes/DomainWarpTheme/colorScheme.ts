import { ColorScheme, colors } from '@vechaiui/react';
import { BgColorScheme } from '..';

const DomainWarpLight: ColorScheme & BgColorScheme = {
  id: 'DomainWarpLight',
  type: 'light',
  colors: {
    bg: {
      base: colors.trueGray['200'],
      fill: colors.trueGray['500']
    },
    text: {
      foreground: colors.green['900'],
      muted: colors.emerald['800']
    },
    primary: colors.emerald,
    neutral: colors.lime,
    hightlight1: '#00cc69',
    hightlight2: '#e3aa00'
  }
};

const DomainWarpDark: ColorScheme & BgColorScheme = {
  id: 'DomainWarpDark',
  type: 'dark',
  colors: {
    bg: {
      base: colors.gray['900'],
      fill: colors.gray['600']
    },
    text: {
      foreground: colors.green['200'],
      muted: colors.lime['200']
    },
    primary: colors.emerald,
    neutral: colors.lime,
    hightlight1: '#00cc69',
    hightlight2: '#e3aa00'
  }
};

export default { DomainWarpLight, DomainWarpDark };
