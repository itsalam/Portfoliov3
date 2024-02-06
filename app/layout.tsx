import Backdrop from "@/components/Backdrop";
import Overlay from "@/components/Overlay";
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
            <main className="relative flex flex-col w-screen h-screen overflow-hidden">
              <Overlay />
              <Backdrop />
              {children}
            </main>
          </Theme>
        </Providers>
      </body>
    </html>
  );
}
