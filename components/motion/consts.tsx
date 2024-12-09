import { Text } from "@radix-ui/themes";
import { m, SpringOptions } from "framer-motion";
import { ComponentProps } from "react";

const MText = m(Text);

export type DigitSpinnerProps = ComponentProps<typeof m.div> & {
  textProps?: ComponentProps<typeof MText>;
  digit: number;
  direction?: DIRECTION;
  springOptions?: SpringOptions;
  endLoadingCallback?: () => void;
};

export enum DIRECTION {
  UP = -1,
  DOWN = 1,
}
