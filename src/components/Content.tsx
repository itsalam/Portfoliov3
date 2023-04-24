import { cx } from '@vechaiui/react';
import Home from '../pages/Home';
import Contact from '../pages/Contact';
import Projects from '../pages/Projects';
import Work from '../pages/Work';
import Menu from './Menu';
import {
  isWideListener,
  isMobileListener,
  updateScrollProgress
} from '@src/etc/Helpers';

function Content() {
  const isWide = isWideListener();
  const isMobile = isMobileListener();
  const { containerCallback } = updateScrollProgress();

  return (
    <div
      className="z-10 flex items-start justify-center"
      ref={containerCallback}
    >
      <div
        className={cx(
          'flex gap-10  w-full transition-[width] max-w-screen-xl',
          'flex-col',
          'sm:w-11/12 xl:w-9/12 xl:px-10 2xl:w-7/12'
        )}
      >
        {(isWide || isMobile) && <Menu />}
        <div className="flex w-full flex-col gap-[20vh] px-4 ">
          <Home />
          <Projects />
          <Work />
          <Contact />
        </div>
      </div>
    </div>
  );
}

export default Content;
