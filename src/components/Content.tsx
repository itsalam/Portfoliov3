import cn from 'classnames';
import Home from '../pages/Home';
import Contact from '../pages/Contact';
import Projects from '../pages/Projects';
import Work from '../pages/Work';
import Menu from './Menu';
import { isMobileListener, isWideListener } from '@src/etc/helper';

function Content() {
    const isWide = isWideListener();
    const isMobile = isMobileListener();

    return (
        <div className="z-10 flex items-start justify-center pb-96">
            <div
                className={cn(
                    'flex gap-10  w-full transition-[width] max-w-screen-xl',
                    'flex-col',
                    'sm:w-11/12 xl:w-9/12 xl:px-10 2xl:w-7/12'
                )}
            >
                {(isWide || isMobile) && <Menu />}
                <div className="flex w-full flex-col gap-[20vh] px-4">
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
