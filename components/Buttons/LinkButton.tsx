import { motion } from "framer-motion";
import {
  Link as BaseLink,
  MoveDownLeft as BaseMoveDownLeft,
} from "lucide-react";
import { ComponentProps, FC } from "react";
import { BaseRolloutButton } from "./BaseRolloutButton";

const Link = motion(BaseLink);
const MoveDownLeft = motion(BaseMoveDownLeft);

export const LinkButton: FC<
  ComponentProps<typeof motion.a> &
    Partial<ComponentProps<typeof BaseRolloutButton>>
> = (props) => {
  return (
    <BaseRolloutButton
      isLink
      ComponentA={(props) => <Link {...props} />}
      ComponentB={(props) => <MoveDownLeft {...props} />}
      text={"Link"}
      {...props}
    />
  );
};
