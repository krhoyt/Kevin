export default class HoytLabel extends HTMLElement {
  constructor() {
    super();

    const template = document.createElement( 'template' );
    template.innerHTML = /* template */ `
      <style>
        :host {
          box-sizing: border-box;
          display: inline-block;
          position: relative;
        }

        p {
          color: var( --label-color, #161616 );
          font-family: 'Open Sans', sans-serif;
          font-size: var( --label-font-size, 16px );
          font-weight: var( --label-font-weight, 400 );
          letter-spacing: var( --label-letter-spacing, 0.10px );
          line-height: var( --label-line-height, 24px );
          margin: var( --label-margin, 0 );
          padding: var( --label-padding, 0 );
          width: var( --label-width, 100% );
        }
      </style>
      <p part="label">
        <slot></slot>
      </p>
    `;
    
    // Root
    this.attachShadow( {mode: 'open'} );
    this.shadowRoot.appendChild( template.content.cloneNode( true ) );
  }
}

window.customElements.define( 'kh-label', HoytLabel );
