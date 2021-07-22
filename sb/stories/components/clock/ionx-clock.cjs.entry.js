'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const index = require('./index-2180555e.js');

const clockCss = ":host{box-sizing:border-box;display:block;height:var( --clock-size, 150px );position:relative;width:var( --clock-size, 150px )}svg{height:100%;width:100%}";

const Clock = class {
  constructor(hostRef) {
    index.registerInstance(this, hostRef);
  }
  render() {
    return (index.h("svg", null, index.h("g", { ref: (el) => this.clock_face = el }, index.h("image", { height: "300", href: index.getAssetPath('./assets/watch.svg'), width: "300", x: "-150", y: "-150" }), index.h("use", { href: `${index.getAssetPath('./assets/hands.svg')}#second`, ref: (el) => this.second_hand = el }), index.h("use", { href: `${index.getAssetPath('./assets/hands.svg')}#hour`, ref: (el) => this.hour_hand = el }), index.h("use", { href: `${index.getAssetPath('./assets/hands.svg')}#minute`, ref: (el) => this.minute_hand = el }))));
  }
  componentWillLoad() {
    this.tick();
  }
  tick() {
    if (this.clock_face) {
      const height = this.host.clientHeight;
      const width = this.host.clientWidth;
      const scale = Math.min(height, width) / 300;
      this.clock_face.setAttribute('transform', `translate( ${width / 2} ${height / 2} ) scale( ${scale} )`);
    }
    if (this.second_hand) {
      const today = new Date();
      const decimal = today.getHours() +
        (today.getMinutes() / 60) +
        (today.getSeconds() / 3600);
      const hour = Math.floor(decimal);
      const minute = (decimal - hour) % 1;
      const millis = today.getMilliseconds() / 1000;
      const second = (today.getSeconds() + millis) / 60;
      this.hour_hand.setAttribute('transform', `rotate( ${(360 / 12) * decimal} )`);
      this.minute_hand.setAttribute('transform', `rotate( ${360 * minute} )`);
      this.second_hand.setAttribute('transform', `
        translate( 0 70 )
        rotate( ${360 * second} )
      `);
    }
    requestAnimationFrame(this.tick.bind(this));
  }
  static get assetsDirs() { return ["assets"]; }
  get host() { return index.getElement(this); }
};
Clock.style = clockCss;

exports.ionx_clock = Clock;
