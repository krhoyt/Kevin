import { createClock } from './Clock';
import './components/clock/clock.cjs.js';

export default {
  title: 'Example/Clock'
};

const Template = ({ label, ...args }) => {
  // You can either use a function to create DOM elements or use a plain html string!
  // return `<div>${label}</div>`;
  return createClock({ label, ...args });
};

export const Primary = Template.bind({});
