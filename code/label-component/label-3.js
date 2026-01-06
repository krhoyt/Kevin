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

        :host( [concealed] ) {
          visibility: hidden;
        }

        :host( [hidden] ) {
          display: none;
        }

        :host( [truncate] ) p {
          overflow: hidden;
          text-overflow: ellipsis;          
          white-space: nowrap;
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
        }

        :host( [disabled] ) p, :host( [color=disabled] ) p {color: #656871;}
        :host( [color=error] ) p {color: #db0000;}
        :host( [color=info] ) p {color: #006ce0;}
        :host( [color=success] ) p {color: #00802f;}
        :host( [color=warning] ) p {color: #855900;}
        
        :host( [size='body-xs'] ) p {font-size: 12px; line-height: 16px;}
        :host( [size='body-sm'] ) p {font-size: 14px; line-height: 20px;}
        :host( [size='heading-xs'] ) p {font-size: 16px; line-height: 20px;}
        :host( [size='heading-sm'] ) p {font-size: 18px; line-height: 22px;}

        :host( [weight=light] ) p {font-weight: 300;}
        :host( [weight=bold] ) p {font-weight: 600;}        
        :host( [weight=heavy] ) p {font-weight: 700;}        
      </style>
      <p part="label">
        <slot></slot>
      </p>
    `;
    
    // Root
    this.attachShadow( {mode: 'open'} );
    this.shadowRoot.appendChild( template.content.cloneNode( true ) );
  }

  get weight() {
    if( this.hasAttribute( 'weight' ) ) {
      return this.getAttribute( 'weight' );
    }

    return null;
  }

  set weight( value ) {
    if( value !== null ) {
      this.setAttribute( 'weight', value );
    } else {
      this.removeAttribute( 'weight' );
    }
  }  
}

window.customElements.define( 'kh-label', HoytLabel );
