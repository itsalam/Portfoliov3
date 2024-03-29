import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import "mapbox-gl/dist/mapbox-gl.css";
import React from "react";
import "./globals.css";
import { Providers } from "./providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Theme>
            <main
              id="main"
              className="container flex h-screen flex-col overflow-hidden"
            >
              {children}
            </main>
          </Theme>
        </Providers>
      </body>
    </html>
  );
}
