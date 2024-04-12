import { cn } from "@/lib/utils";
import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import "mapbox-gl/dist/mapbox-gl.css";
import { DM_Sans, Space_Grotesk } from "next/font/google";
import localFont from "next/font/local";
import React from "react";
import { Providers } from "./providers";

// If loading a variable font, you don't need to specify the font weight
const inter = DM_Sans({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const grotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
  display: "swap",
});

const Favorit = localFont({
  variable: "--font-favorit",
  src: "/fonts/Favorit.ttf",
  display: "swap",
});

const Vercetti = localFont({
  variable: "--font-vercetti",
  src: "/fonts/Vercetti-Regular.ttf",
  display: "swap",
});

const DanhDa = localFont({
  variable: "--font-danh-da",
  src: "/fonts/DanhDa-Bold.otf",
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn(
        grotesk.variable,
        inter.variable,
        Favorit.variable,
        Vercetti.variable,
        DanhDa.variable
      )}
    >
      <body>
        <Providers>
          <Theme grayColor="sage" accentColor="teal">
            <main
              id="main"
              className="container flex h-screen max-h-[100dvh] flex-col overflow-hidden"
            >
              {children}
            </main>
          </Theme>
        </Providers>
      </body>
    </html>
  );
}
