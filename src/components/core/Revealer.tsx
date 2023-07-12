import { createStyles } from '@mantine/core';
import { HTMLProps, ReactNode } from 'react';

const useStyles = createStyles(() => ({
    revealer: {
        display: 'relative',
        width: '100%',
        overflowX: 'clip',
        overflowY: 'hidden',
    },
}));

export default function Revealer(props: HTMLProps<HTMLDivElement> & { children?: ReactNode }) {
    const { classes, cx } = useStyles();

    return (
        <div className={cx(classes.revealer, props.className)}>
            {props.children}
        </div>

    );
}
