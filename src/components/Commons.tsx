import { Progress } from '@mantine/core';
import { HTMLProps } from 'react';

export const Title = (props: HTMLProps<HTMLHeadingElement> & { scrollProgress?: number }) => (
  <h1 className="title relative left-0 flex w-full items-center gap-4">
    {props.children}
    <Progress radius="xs" size="xs" value={props.scrollProgress ?? 0} styles={{ bar: { transitionDuration: '0ms' } }} className="top-2 basis-1/3" />
  </h1>
);
