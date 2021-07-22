import './clock.css';

export const createClock = () => {
  const clock = document.createElement( 'ionx-clock' );
  clock.type = 'ionx-clock';

  // btn.className = ['storybook-button', `storybook-button--${size}`, mode].join(' ');

  return clock;
};
