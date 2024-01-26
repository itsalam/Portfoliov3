import Backdrop from "@/components/Backdrop";
import NavBar from "@/components/NavBar";
import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import Hero from "./hero";

export default function Home() {
  return (
    <Theme>
      <main className="relative w-screen h-screen overflow-x-hidden">
        <NavBar />
        <Backdrop />
        <Hero />
      </main>
    </Theme>
  );
}
