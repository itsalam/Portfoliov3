import useStore from '@src/store';
import { RGBtoHex, isWideListener } from '@src/etc/helper';
import { Leva, useControls } from 'leva';
import { useMemo } from 'react';

export default function SettingsButton(props: { darkMode: boolean, setDarkMode: (arg: boolean) => void }) {

    const { vechaiTheme, setBgOpacity, setActiveTheme, themeIds } = useStore.getState();
    const { activeTheme } = useStore();
    const isWide = isWideListener();

    useControls({
        darkMode: {
            label: 'Dark Mode',
            value: localStorage.theme == 'dark',
            onChange: (v) => {
                props.setDarkMode(v)
            }
        },
        Theme: {
            options: themeIds,
            value: activeTheme,
            onChange: (v) => {
                setActiveTheme(v)
            },
            transient: true
        }, "Opacity": {
            value: 1,
            min: 0,
            max: 1,
            step: .1,
            onChange: (v) => {
                setBgOpacity(v)
            }
        }
    });

    const vechaiThemeToLeva = useMemo(() => {
        const colorSchemeId = `${activeTheme}${props.darkMode ? 'Dark' : 'Light'}`;
        const scheme = vechaiTheme.colorSchemes[colorSchemeId].colors;
        return {
            colors: {
                elevation1: RGBtoHex([...scheme.bg.base.split(","), "200"]),
                elevation2: RGBtoHex([...scheme.bg.base.split(","), "0"]),
                elevation3: RGBtoHex([...scheme.bg.fill.split(","), "55"]),
                accent1: RGBtoHex([...scheme.neutral[900].split(","), "255"]),
                accent2: RGBtoHex([...scheme.neutral[900].split(","), "255"]),
                accent3: RGBtoHex([...scheme.neutral[900].split(","), "255"]),
                highlight1: RGBtoHex([...scheme.text.foreground.split(","), "255"]),
                highlight2: RGBtoHex([...scheme.text.foreground.split(","), "255"]),
                highlight3: RGBtoHex([...scheme.text.foreground.split(","), "255"]),
            },
            space: {
                sm: "4px",
                md: "8px",
                rowGap: "5px",
                colGap: "5px",
            },
            fonts: {
                mono: "Source Code Pro",
                sans: 'Source Sans Pro'
            },
            fontSizes: {
                root: "0.75rem",
                toolTip: '0.5rem'
            },
            sizes: {
                rootWidth: "15rem",
                controlWidth: "7rem",
                scrubberWidth: "20px",
            }
        }
    }, [vechaiTheme, activeTheme, props.darkMode]);

    return <Leva
        titleBar={{
            title: "Theme Options",
            position: { x: 0, y: isWide ? 0 : 65 }
        }
        }
        collapsed={true}
        theme={vechaiThemeToLeva}
    />
}
