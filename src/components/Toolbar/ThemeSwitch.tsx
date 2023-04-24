import { useRef } from 'react';
import useStore from '@src/store';
import { debounce } from 'lodash';

export default function ThemeSwitch(props: {
  darkMode: boolean;
  setDarkMode: (arg: boolean) => void;
}) {
  const { setActiveTheme, themeIds } = useStore.getState();
  const { activeTheme } = useStore.getState();
  const { darkMode, setDarkMode } = props;
  const toggleRef = useRef<HTMLDivElement>(null);

  const sunIcon = (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
    />
  );

  const moonIcon = (
    <path
      d="M20.8667 15.3164C20.9187 15.1983 20.8006 15.0785 20.6792 15.1223V15.1223C17.3165 16.3368 13.4497 15.6201 10.9124 13.0837C8.38689 10.5592 7.66861 6.7169 8.86147 3.36559V3.36559C8.91069 3.22729 8.77418 3.09296 8.64021 3.15299C8.63117 3.15704 8.62214 3.16111 8.61311 3.16518C6.75765 4.00313 5.10654 5.4166 4.13683 7.19736C3.1002 9.10101 2.75831 11.3058 3.16975 13.4339C3.58119 15.5619 4.72034 17.4806 6.39193 18.861C8.06352 20.2414 10.1634 20.9977 12.3317 21C14.1962 21.0001 16.0181 20.4424 17.5629 19.3987C18.9891 18.4352 20.1189 16.9756 20.8311 15.3962C20.8431 15.3697 20.8549 15.343 20.8667 15.3164Z"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );

  const sunClasses = ['bg-foreground', 'text-white'];
  const moonClasses = [
    'bg-foreground/.5',
    'text-white-400',
    'translate-x-full'
  ];

  const toggleLightDark = debounce(
    () => {
      setTimeout(() => {
        setDarkMode(!darkMode);
      }, 250);
      const currElem = toggleRef.current;
      if (currElem) {
        currElem.classList.remove(...(darkMode ? moonClasses : sunClasses));
        currElem.classList.add(...(darkMode ? sunClasses : moonClasses));
      }
    },
    500,
    { leading: true, trailing: false }
  );

  const toggleThemes = debounce(
    () => {
      const themeIdx = themeIds.findIndex((id: string) => id === activeTheme);
      setActiveTheme(themeIds[(themeIdx + 1) % themeIds.length]);
    },
    500,
    { leading: true, trailing: false }
  );

  return (
    <>
      <button
        onClick={() => toggleThemes()}
        className={`flex h-7 w-7 items-center rounded-full p-1 shadow transition duration-150 focus:outline-none ${
          darkMode
            ? 'bg-slate-600/15 hover:bg-primary-300/20'
            : 'bg-slate-300/15 hover:bg-slate-300/40'
        }`}
      >
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10 4C10 7.31371 7.31371 10 4 10C7.31371 10 10 12.6863 10 16C10 12.6863 12.6863 10 16 10C12.6863 10 10 7.31371 10 4Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />{' '}
          <path
            d="M17.5 15C17.5 16.3807 16.3807 17.5 15 17.5C16.3807 17.5 17.5 18.6193 17.5 20C17.5 18.6193 18.6193 17.5 20 17.5C18.6193 17.5 17.5 16.3807 17.5 15Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <button
        className={`flex h-7 w-12 items-center rounded-full p-1 shadow transition duration-150 focus:outline-none ${
          darkMode
            ? 'bg-slate-600/15 hover:bg-primary-300/20'
            : 'bg-slate-300/15 hover:bg-slate-300/40'
        }`}
        onClick={() => toggleLightDark()}
      >
        <div
          ref={toggleRef}
          id="switch-toggle"
          className={
            'w-5 h-5 relative rounded-full transition duration-500 transform p-0.5 ' +
            (darkMode ? moonClasses : sunClasses).join(' ')
          }
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1}
            stroke="currentColor"
            className="h-4 w-4"
          >
            {darkMode ? moonIcon : sunIcon}
          </svg>
        </div>
      </button>
    </>
  );
}
