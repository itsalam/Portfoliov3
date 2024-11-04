import { m } from "framer-motion";
import {
  Link as BaseLink,
  MoveDownLeft as BaseMoveDownLeft,
} from "lucide-react";
import { ComponentProps, FC } from "react";
import { BaseRolloutButton } from "./BaseRolloutButton";

const Link = m(BaseLink);
const MoveDownLeft = m(BaseMoveDownLeft);

export const LinkButton: FC<
  ComponentProps<typeof m.a> & Partial<ComponentProps<typeof BaseRolloutButton>>
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
