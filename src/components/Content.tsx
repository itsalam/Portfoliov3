import { Flex } from '@mantine/core';
import useStore from '@src/store';
import { useControls } from 'leva';
import {
  HTMLProps,
  ReactNode,
  useEffect,
  useRef,
} from 'react';
import 'swiper/css';
import 'swiper/css/pagination';

function Content(props: HTMLProps<HTMLDivElement> & { children?: ReactNode }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const { hideForeground } = useStore.getState();

  useEffect(() => {
    if (contentRef.current) {
      if (!hideForeground) { contentRef.current.style.setProperty('display', 'flex'); }
      const animate = contentRef.current.animate(
        { opacity: hideForeground ? 0 : 1 },
        { duration: 350, fill: 'forwards' }
      );
      if (hideForeground) {
        animate.onfinish = () => {
          contentRef.current?.style.setProperty(
            'display',
            hideForeground ? 'none' : 'flex'
          );
        };
      }
    }
  }, [hideForeground]);

  useControls({
    hideForeground: {
      value: false,
      label: 'Hide Content',
    },
  });

  return (
    <Flex
      className="sm:align-self-center gap-12 sm:px-0"
    >
      <Flex
        px="1rem"
        direction="column"
        className="align-start w-full gap-4"
      >
        {props.children}
      </Flex>
    </Flex>
  );
}

export default Content;
