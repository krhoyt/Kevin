export default class HoytFollow extends HTMLElement {
  constructor() {
    super();

    const template = document.createElement( 'template' );
    template.innerHTML = /* template */ `
      <style>
        :host {
          box-sizing: border-box;
          display: inline-block;
          position: relative;
          transform-origin: center center;
          transition: rotate 150ms ease;
        }
      </style>
      <slot></slot>
    `;

    // Events
    this.onMouseMove = this.onMouseMove.bind( this );

    // Root
    this.attachShadow( {mode: 'open'} );
    this.shadowRoot.appendChild( template.content.cloneNode( true ) );
  }

  // When attributes change
  _render() {;}

  // Track mouse movement
  onMouseMove( evt ) {
    // Position relative to viewport
    const bounds = this.getBoundingClientRect();
    const centerX = bounds.left + bounds.width / 2;
    const centerY = bounds.top + bounds.height / 2;

    // Calculate angle
    const deltaX = evt.clientX - centerX;
    const deltaY = evt.clientY - centerY;
    const angle = Math.atan2( deltaY, deltaX ) * ( 180 / Math.PI );

    // Apply rotation
    this.style.transform = `rotate( ${angle}deg )`;
  }

  // Promote properties
  // Values may be set before module load
  _upgrade( property ) {
    if( this.hasOwnProperty( property ) ) {
      const value = this[property];
      delete this[property];
      this[property] = value;
    }
  }

  // Setup
  connectedCallback() {
    document.addEventListener( 'mousemove', this.onMouseMove );
    this._render();
  }

  // Set down
  disconnectedCallback() {
    document.removeEventListener( 'mousemove', this.onMouseMove );
  }
  
  // Watched attributes
  static get observedAttributes() {
    return [];
  }

  // Observed attribute has changed
  // Update render
  attributeChangedCallback( name, old, value ) {
    this._render();
  }
}

window.customElements.define( 'kh-follow', HoytFollow );
