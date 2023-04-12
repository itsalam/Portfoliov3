import { ColorScheme, colors } from "@vechaiui/react";

const dwThemeLight: ColorScheme = {
    id: "dwThemeLight",
    type: "light",
    colors: {
      bg: {
        base: colors.trueGray["400"],
        fill: colors.trueGray["500"],
      },
      text: {
        foreground: colors.green["900"],
        muted: colors.emerald["700"],
      },
      primary: colors.emerald,
      neutral: colors.lime,
    },
}
  
const dwThemeDark: ColorScheme = {
  id: "dwThemeDark",
  type: "dark",
  colors: {
    bg: {
      base: colors.black,
      fill: colors.gray["600"],
    },
    text: {
      foreground: colors.green["300"],
      muted: colors.lime["200"],
    },
    primary: colors.emerald,
    neutral: colors.lime,
  },
}

export default {dwThemeLight, dwThemeDark};