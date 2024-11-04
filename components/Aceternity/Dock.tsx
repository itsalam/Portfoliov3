/**
 * Note: Use position fixed according to your needs
 * Desktop navbar is better positioned at the bottom
 * Mobile navbar is better positioned at bottom right.
 **/

import { isWebGLSupported } from "@/lib/clientUtils";
import { cn } from "@/lib/utils";
import {
  AnimatePresence,
  CustomDomComponent,
  MotionValue,
  m,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { LucideProps, PanelTopClose } from "lucide-react";
import Link from "next/link";
import {
  ComponentProps,
  ComponentPropsWithoutRef,
  Fragment,
  MouseEventHandler,
  useRef,
  useState,
} from "react";

export type DockItem = {
  title: string;
  Icon: CustomDomComponent<LucideProps>;
  href?: string;
  onClick?: MouseEventHandler<HTMLDivElement>;
  motionProps?: Omit<
    ComponentProps<CustomDomComponent<LucideProps>>,
    "key" | "ref"
  >;
};

export const Dock = ({
  items,
  desktopClassName,
  mobileClassName,
}: {
  items: DockItem[];
  desktopClassName?: string;
  mobileClassName?: string;
}) => {
  return (
    <>
      <FloatingDockDesktop items={items} className={cn(desktopClassName, isWebGLSupported() ? "md:flex" : "hidden")} />
      <FloatingDockSimple
        items={items}
        className={cn(
          isWebGLSupported() ? "md:hidden" : "",
          mobileClassName
        )}
      />
    </>
  );
};

const FloatingDockSimple = ({
  items,
  className,
  orientation = "vertical",
  showTitle = false,
}: {
  items: DockItem[];
  className?: string;
  orientation?: "vertical" | "horizontal";
  showTitle?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <m.div
      className={cn(
        "fixed md:-translate-x-1/2 block h-fit w-auto md:w-fit md:h-auto flex md:flex-row flex-col-reverse rounded-full bg-gray-50 dark:bg-neutral-800 p-1 md:bottom-2 md:left-1/2 bottom-3",
        className
      )}
    // style={{ x: "-50%", y: "-50%" }}
    >
      <m.button
        layout="position"
        onClick={() => setOpen(!open)}
        className={cn(
          "flex h-10 w-10 z-20", // sizing
          "items-center justify-center rounded-full", // layout, border
          "bg-gray-50 dark:bg-neutral-800" // background
        )}
      >
        <PanelTopClose
          className={cn(
            "h-5 w-5 text-neutral-500 dark:text-neutral-400 rotate-0 md:rotate-90"
          )}
        />
      </m.button>
      {open && (
        <>
          <div
            className="bg-[--gray-a6] md:h-auto md:w-px w-auto h-px"
          />
          <m.div
            layoutId="nav"
            className={cn(
              "overflow-hidden relative flex flex-1 md:flex-row flex-col mb-2 md:mb-0 ml-0 md:ml-2 z-10",
            )}
            initial={{ maxWidth: "0px", maxHeight: "0px", opacity: 0 }}
            animate={{
              maxWidth: [null, `${48 * items.length}px`, `${48 * items.length}px`],
              maxHeight: [null, `${48 * items.length}px`, `${48 * items.length}px`],
              opacity: [0, 0.3, 1],
              overflow: ["hidden", "hidden", "visible"],
              transition: { delayChildren: 0.05 },
            }}
          >
            {items.map((item, idx) => (
              <IconContainerSimple
                orientation={orientation}
                showTitle
                className="mx-0 md:mx-1 md:my-0 my-1"
                {...item}
              />
            ))}
          </m.div>

        </>
      )}
    </m.div>
  );
};

const FloatingDockDesktop = ({
  items,
  className,
}: {
  items: DockItem[];
  className?: string;
}) => {
  const mouseX = useMotionValue(Infinity);
  return (
    <m.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn(
        "-translate-x-1/2 -translate-y-1/2 glass",
        "bottom-[-8px] left-1/2 mx-auto h-16", // positioning, margin, sizing
        "items-end gap-4 hidden rounded-2xl", // layout, border
        "dark:bg-[--black-a10] bg-[--white-a10] pb-3 px-4", // background, padding
        className
      )}
    >
      {items.map((item) => (
        <IconContainerFull mouseX={mouseX} key={item.title} item={item} />
      ))}
    </m.div>
  )
};

function IconContainerFull({
  mouseX,
  item,
}: {
  mouseX: MotionValue;
  item: DockItem;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { title, Icon, href, onClick, motionProps } = item;

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };

    return val - bounds.x - bounds.width / 2;
  });

  const widthTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);
  const heightTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);

  const widthTransformIcon = useTransform(
    distance,
    [-150, 0, 150],
    [20, 40, 20]
  );
  const heightTransformIcon = useTransform(
    distance,
    [-150, 0, 150],
    [20, 40, 20]
  );

  const width = useSpring(widthTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  const height = useSpring(heightTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  const widthIcon = useSpring(widthTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  const heightIcon = useSpring(heightTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  const [hovered, setHovered] = useState(false);
  const innerDiv = (
    <m.div
      ref={ref}
      style={{ width, height }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      {...(onClick ? { onClick } : {})}
      className={cn(
        "relative hover:text-[--accent-9] hover:dark:text-[--accent-9]", // basicStyles
        "flex aspect-square items-center justify-center", // sizing, layout
        "rounded-full bg-gray-200 dark:bg-neutral-800" // border, background
      )}
    >
      <HoverTitle hovered={hovered} title={title} />
      <m.div
        style={{ width: widthIcon, height: heightIcon }}
        className="flex items-center justify-center"
      >
        <AnimatePresence mode="wait">
          <Icon
            className="m-auto h-full w-full"
            absoluteStrokeWidth
            strokeWidth={2}
            key={motionProps?.id}
            {...(motionProps ?? {})}
          />
        </AnimatePresence>
      </m.div>
    </m.div>
  );

  return href ? (
    <Link href={href}>{innerDiv}</Link>
  ) : (
    <Fragment>{innerDiv}</Fragment>
  );
}

const IconContainerSimple = ({
  href,
  title,
  onClick,
  Icon,
  motionProps,
  showTitle,
  orientation = "vertical",
  className,
  ...otherProps
}: { showTitle: boolean; orientation: "horizontal" | "vertical" } & DockItem &
  Omit<ComponentPropsWithoutRef<typeof Link>, "href" | "onClick">) => {
  const [hovered, setHovered] = useState<boolean>(false);

  return (
    <div
      className={cn("group relative dark:text-white text-[--gray-9] hover:text-[--accent-9] hover:dark:text-[--accent-11]", className)}
      onClick={onClick}
      key={title}
    >
      {hovered && (
        <div
          className={cn(
            "border md:-translate-x-1/2",
            "absolute md:-top-8 top-2 md:right-0 right-12 md:left-1/2  w-fit", // basicStyles, positioning, sizing
            "whitespace-pre", // textWrapping
            "rounded-md", // border
            "bg-gray-100 dark:bg-neutral-800 py-0.5 px-2", // background, padding
            "md:text-xs text-sm opacity-0", // textStyles, transparency
            "transition-all duration-300 border-current  transition-opacity ease-in duration-700 opacity-0 group-hover:opacity-100", // transitionsAnimations
            hovered &&
            "opacity-100"
          )}
        >
          {title}
        </div>
      )}
      <Link
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        href={href || ""}
        key={title}
        className={cn(
          "flex h-10 w-10", // sizing
          "items-center justify-center rounded-full", // layout, border
          "bg-gray-50 dark:bg-neutral-900 transition-all", // background
        )}
        {...otherProps}
      >
        <div className="h-4 w-4">
          <Icon
            className={cn(
              "m-auto h-full w-full"
            )}
            absoluteStrokeWidth
            strokeWidth={2}
          />
        </div>
      </Link>
    </div>
  );
};

const HoverTitle = ({
  title,
  hovered,
  className
}: {
  title: string;
  hovered: boolean;
  className?: string;
}) => (
  <AnimatePresence>
    {hovered && (
      <m.div
        initial={{ opacity: 0, y: 10, x: "-50%" }}
        animate={{ opacity: 1, y: 0, x: "-50%" }}
        exit={{ opacity: 0, y: 2, x: "-50%" }}
        className={cn(
          "border -translate-x-1/2",
          "absolute -top-8 left-1/2 w-fit", // basicStyles, positioning, sizing
          "whitespace-pre", // textWrapping
          "rounded-md", // border
          "bg-gray-100 dark:bg-neutral-800 py-0.5 px-2", // background, padding
          "text-xs border-current transition-all", // textStyles
          className
        )}
      >
        {title}
      </m.div>
    )}
  </AnimatePresence>
);
