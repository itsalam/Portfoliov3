import { Button, createStyles } from '@mantine/core';
import { Resume } from '@src/store/types';
import { HTMLProps } from 'react';

const useStyles = createStyles(() => ({}));

const DownloadButton = (
  props: HTMLProps<HTMLButtonElement> & { resume: Resume; svgSrc: string }
) => {
  const { cx } = useStyles();
  return (
    <Button
      component="a"
      href={props.resume.url}
      download={props.resume.title}
      variant="default"
      className={cx(
        props.className,
        'transition-all primary-color'
      )
      }
    >
      <span className="flex h-full flex-col items-center justify-center">
        <svg
          className="icon group-hover:text-background h-10 w-10"
          data-src={props.svgSrc}
          {...{ fill: 'currentColor' }}
        />
        Resume
      </span>
    </Button>
  );
};

export default DownloadButton;
