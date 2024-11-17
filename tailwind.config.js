import flattenColorPalette from "tailwindcss/lib/util/flattenColorPalette";

const generateGridUtils = () => ({
  ...(() => {
    let newPaddingUtilities = {};
    for (let i = 1; i <= 12; i++) {
      newPaddingUtilities[`g-${i}`] = `calc(var(--cell-size) * ${i})`;
      for (let j = 1; j < 8; j++) {
        newPaddingUtilities[`g-${i}-${j}/8`] =
          `calc(var(--cell-size) * ${(i + j / 8).toFixed(3)})`;
      }
    }
    for (let j = 1; j < 8; j++) {
      newPaddingUtilities[`g-${j}/8`] =
        `calc(var(--cell-size) * ${(j / 8).toFixed(3)})`;
    }
    return newPaddingUtilities;
  })(),
  gap: "var(--x-padding) var(--y-padding)",
  gapx: "var(--x-padding)",
  gapy: "var(--y-padding)",
});

const propertyUtilities = (properties) =>
  properties.reduce((acc, property) => {
    acc[property] = generateGridUtils();
    return acc;
  }, {});

/** @type {import('tailwindcss').Config} */
export const darkMode = ["class"];
export const content = [
  "./pages/**/*.{js,ts,jsx,tsx,mdx}",
  "./components/**/*.{js,ts,jsx,tsx,mdx}",
  "./app/**/*.{js,ts,jsx,tsx,mdx}",
];
export const theme = {
  container: {
    center: true,
    screens: {
      "2xl": "1400px",
    },
  },
  fontFamily: {
    overlay: ["var(--font-favorit)"],
    sans: ["var(--font-danh-da)"],
    display: ["NeueMontreal"],
    favorit: ["var(--font-favorit)"],
  },
  extend: {
    screens: {
      xs: "480px",
    },
    backgroundImage: {
      "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      "gradient-conic":
        "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
    },
    colors: {
      border: "hsl(var(--border))",
      input: "hsl(var(--input))",
      ring: "hsl(var(--ring))",
      background: "hsl(var(--background))",
      foreground: "hsl(var(--foreground))",
      primary: {
        DEFAULT: "hsl(var(--primary))",
        foreground: "hsl(var(--primary-foreground))",
      },
      secondary: {
        DEFAULT: "hsl(var(--secondary))",
        foreground: "hsl(var(--secondary-foreground))",
      },
      destructive: {
        DEFAULT: "hsl(var(--destructive))",
        foreground: "hsl(var(--destructive-foreground))",
      },
      muted: {
        DEFAULT: "hsl(var(--muted))",
        foreground: "hsl(var(--muted-foreground))",
      },
      accent: {
        DEFAULT: "hsl(var(--accent))",
        foreground: "hsl(var(--accent-foreground))",
      },
      popover: {
        DEFAULT: "hsl(var(--popover))",
        foreground: "hsl(var(--popover-foreground))",
      },
      card: {
        DEFAULT: "hsl(var(--card))",
        foreground: "hsl(var(--card-foreground))",
      },
    },
    borderRadius: {
      lg: "var(--radius)",
      md: "calc(var(--radius) - 2px)",
      sm: "calc(var(--radius) - 4px)",
    },
    gridTemplateRows: {
      18: "repeat(18, minmax(0, 1fr))",
    },
    gridTemplateColumns: {
      24: "repeat(24, minmax(0, 1fr))",
    },
    keyframes: {
      "accordion-down": {
        from: { height: 0 },
        to: { height: "var(--radix-accordion-content-height)" },
      },
      "accordion-up": {
        from: { height: "var(--radix-accordion-content-height)" },
        to: { height: 0 },
      },
      aurora: {
        from: {
          backgroundPosition: "50% 50%, 50% 50%",
        },
        to: {
          backgroundPosition: "350% 50%, 350% 50%",
        },
      },
    },
    animation: {
      aurora: "aurora 60s linear infinite",
      "accordion-down": "accordion-down 0.2s ease-out",
      "accordion-up": "accordion-up 0.2s ease-out",
    },
    fontSize: {
      grid: ["var(--cell-size)", "var(--cell-size)"],
    },
    transitionProperty: {
      "bg": "background, background-color",
    },
    ...propertyUtilities([
      "padding",
      "margin",
      "height",
      "width",
      "spacing",
      "min-height",
      "min-width",
    ]),
  },
};
export const plugins = [require("tailwindcss-animate"), addVariablesForColors];

function addVariablesForColors({ addBase, theme }: any) {
  let allColors = flattenColorPalette(theme("colors"));
  let newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
  );
 
  addBase({
    ":root": newVars,
  });
}