export default class KHTyping extends HTMLElement {
  constructor() {
    super();

    const template = document.createElement( 'template' );
    template.innerHTML = /* template */ `
      <style>
        :host {
          box-sizing: border-box;
          display: inline;
          position: relative;
        }

        :host( [hidden] ) { display: none; }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0; }
        }

        span[part=cursor] {
          animation: blink 1.05s step-end infinite;
          font-weight: 300;
          margin-left: 1px;
          opacity: 1;
        }

        span { display: inline; }
      </style>
      <span part="typing"></span>
      <span part="cursor">|</span>
    `;

    // Timings (ms)
    this.TYPING_MS = 35;
    this.DELETING_MS = 75;
    this.PAUSE_FULL = 2000;
    this.PAUSE_EMPTY = 350;

    // State
    this._messages = [];
    this._index = 0;
    this._character = 0;

    // Phase machine: TYPING | PAUSE_FULL | DELETING | PAUSE_EMPTY
    this._phase = 'TYPING';

    // rAF control
    this._rafId = null;
    this._running = false;
    this._nextAt = 0;

    // Root
    this.attachShadow( { mode: 'open' } );
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    // Elements
    this.$cursor = this.shadowRoot.querySelector( 'span[part=cursor]' );
    this.$span = this.shadowRoot.querySelector( 'span[part=typing]' );

    // Bind tick once (no bind-per-frame allocations)
    this._tick = this._tick.bind( this );
  }

  // Setup
  connectedCallback() {
    this._upgrade( 'data' );
    this._upgrade( 'hidden' );
    this._upgrade( 'messages' );
    this._render();

    // If messages were set before connect, start now.
    if( this._messages.length ) this._start();
  }

  // Set down
  disconnectedCallback() {
    this._stop();
  }

  static get observedAttributes() {
    return [
      'hidden'
    ];
  }

  attributeChangedCallback() {
    // Pause animation when hidden
    if( this.hidden ) this._stop();
    else if (this._messages.length) this._start();

    this._render();
  }

  // ---- Animation control
  _start() {
    if( this._running ) return;
    this._running = true;
    this._nextAt = performance.now(); // run first step immediately
    this._rafId = requestAnimationFrame( this._tick );
  }

  _stop() {
    this._running = false;
    if( this._rafId !== null ) cancelAnimationFrame( this._rafId );
    this._rafId = null;
  }

  _resetLoop() {
    this._index = 0;
    this._character = 0;
    this._phase = 'TYPING';
    this.$span.textContent = '';
    this._nextAt = performance.now();
  }

  _tick( now ) {
    if( !this._running ) return;

    // If hidden, don't keep spinning
    if( this.hidden ) {
      this._stop();
      return;
    }

    if( now >= this._nextAt ) {
      this._step( now );
    }

    this._rafId = requestAnimationFrame( this._tick );
  }

  _step( now ) {
    if( !this._messages.length ) return;

    const word = String( this._messages[this._index] ?? '' );

    switch( this._phase ) {
      case 'TYPING': {
        if( this._character < word.length ) {
          this._character += 1;
          this.$span.textContent = word.slice( 0, this._character );
          this._nextAt = now + this.TYPING_MS;
        } else {
          this._phase = 'PAUSE_FULL';
          this._nextAt = now + this.PAUSE_FULL;
        }
        break;
      }

      case 'PAUSE_FULL': {
        this._phase = 'DELETING';
        this._nextAt = now + this.DELETING_MS;
        break;
      }

      case 'DELETING': {
        if( this._character > 0 ) {
          this._character -= 1;
          this.$span.textContent = word.slice( 0, this._character );
          this._nextAt = now + this.DELETING_MS;
        } else {
          this._phase = 'PAUSE_EMPTY';
          this._nextAt = now + this.PAUSE_EMPTY;
        }
        break;
      }

      case 'PAUSE_EMPTY': {
        this._index = ( this._index + 1 ) % this._messages.length;
        this._phase = 'TYPING';
        this._nextAt = now + this.TYPING_MS;
        break;
      }
    }
  }

  // ---- Rendering (keep yours; no-op is fine)
  _render() { /* optional */ }

  _upgrade( property ) {
    if( this.hasOwnProperty( property ) ) {
      const value = this[property];
      delete this[property];
      this[property] = value;
    }
  }

  // ---- Properties
  get data() {
    return this._data;
  }

  set data( value ) {
    this._data = value === null ? null : structuredClone( value );
  }

  get messages() {
    return this._messages.length === 0 ? null : this._messages;
  }

  set messages( value ) {
    this._messages = value === null ? [] : [...value];

    // Reset animation state for new message set
    this._resetLoop();

    // Only start if connected & not hidden
    if( this.isConnected && !this.hidden && this._messages.length ) {
      this._start();
    } else {
      this._stop();
    }
  }

  // ---- Reflected attribute
  get hidden() {
    return this.hasAttribute( 'hidden' );
  }

  set hidden( value ) {
    if( value !== null ) {
      if( typeof value === 'boolean' ) value = value.toString();
      if( value === 'false' ) this.removeAttribute( 'hidden' );
      else this.setAttribute( 'hidden', '' );
    } else {
      this.removeAttribute( 'hidden' );
    }
  }
}

window.customElements.define( 'kh-typing', KHTyping );
