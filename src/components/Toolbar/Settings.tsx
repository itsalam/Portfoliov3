import { createStyles, useMantineTheme } from '@mantine/core';
import { valToHex } from '@src/etc/Helpers';
import useStore from '@src/store';
import { Leva, useControls } from 'leva';
import { useMemo } from 'react';

const useStyles = createStyles((theme) => ({
  settings: {
    width: '100%',
    height: 'var(--leva-sizes-titleBarHeight)',
  },
}));

export default function Settings(props: {
  darkMode: boolean;
  setDarkMode: (arg: boolean) => void;
  hideThemeSwitch?: boolean;
}) {
  const { setBgOpacity, setActiveTheme, themes } =
    useStore.getState();
  const { activeTheme } = useStore();
  const theme = useMantineTheme();

  const { classes, cx } = useStyles();

  useControls({
    darkMode: {
      label: 'Dark Mode',
      value: localStorage.theme === 'dark',
      onChange: (v: boolean) => {
        props.setDarkMode(v);
      },
    },
    Theme: {
      options: Object.keys(themes),
      value: activeTheme,
      onChange: (v: string) => {
        setActiveTheme(v);
      },
      transient: true,
    },
    Opacity: {
      value: 1,
      min: 0,
      max: 1,
      step: 0.1,
      onChange: (v: number) => {
        setBgOpacity(v);
      },
    },
  });

  const mantineThemeToLeva = useMemo(() => {
    const bgColor = theme.colorScheme === 'dark' ? 'dark' : 'gray';
    const shade = theme.fn.primaryShade();
    const elavationShade = theme.colorScheme === 'dark' ? shade : 2;
    const hightlight = theme.colorScheme === 'dark' ? 2 : shade;
    document.documentElement.style.setProperty('--mantine-bg', theme.colors[bgColor][shade as number]);
    return {
      colors: {
        elevation1: theme.colors[bgColor][elavationShade as number] + valToHex('245'),
        elevation2: theme.colors[bgColor][elavationShade as number - 1] + valToHex(''),
        elevation3: theme.colors[bgColor][elavationShade as number - 2] + valToHex('200'),
        accent1: theme.colors[theme.primaryColor][shade as number] + valToHex('255'),
        accent2: theme.colors[theme.primaryColor][shade as number] + valToHex('255'),
        accent3: theme.colors[theme.primaryColor][shade as number] + valToHex('255'),
        highlight1: theme.colors[theme.primaryColor][hightlight] + valToHex('255'),
        highlight2: theme.colors[theme.primaryColor][hightlight] + valToHex('255'),
        highlight3: theme.colors[theme.primaryColor][hightlight] + valToHex('150'),
      },
      space: {
        sm: '8px',
        md: '12px',
        rowGap: '4px',
        colGap: '4px',
      },
      fonts: {
        mono: 'Source Code Pro',
        sans: 'Source Code Pro',
      },
      fontSizes: {
        root: '.8rem',
        toolTip: '1rem',
      },
      sizes: {
        rootWidth: '16rem',
        controlWidth: '8rem',
        scrubberWidth: '16px',
      },
    };
  }, [theme, props.darkMode]);

  return (
    <div className={cx(classes.settings, 'absolute hidden xl:block xl:relative')}>
      <Leva
        titleBar={{
          title: 'Theme Options',
        }}
        hidden={props.hideThemeSwitch}
        collapsed
        theme={mantineThemeToLeva}
        fill
      />
    </div>

  );
}
