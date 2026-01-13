/*
- Size
  - default, medium
  - sm, small
  - lg, large
  - icon, circle
  - icon-sm
  - icon-lg

- Variant
  - default
  - outline
  - ghost, text
  - destructive, danger
  - secondary
  - link
  
- Color
  - primary
  - success
  - neutral
  - warning

- href
- target
- rel
- download

- Disabled

- Spinner, loading

- Rounded, pill

- Type
- Name
- Value

- Slots
  - Prefix
  - Suffix  

- Full width

- Wrap text
*/

export default class TcButton extends HTMLElement {
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

        :host( [concealed] ) { visibility: hidden; }
        :host( [hidden] ) { display: none; }        

        button {
          align-items: var( --button-align-items );
          appearance: none;
          background: var( --button-background );
          border: var( --button-border );
          border-radius: var( --button-border-radius );
          box-sizing: border-box;
          color: var( --button-color );          
          cursor: var( --button-cursor );
          display: flex;
          flex-direction: row;
          font-family: var( --button-font-family );
          font-size: var( --button-font-size );
          font-weight: var( --button-font-weight );
          height: var( --button-height );
          justify-content: var( --button-justify-content );
          letter-spacing: var( --button-letter-spacing );
          line-height: var( --button-line-height );
          margin: var( --button-margin );
          min-width: 0;
          outline: none;
          overflow: var( --button-overflow );
          padding: var( --button-padding );
          text-align: var( --button-text-align );
          text-overflow: var( --button-text-overflow );
          text-rendering: optimizeLegibility;
          text-transform: var( --button-text-transform );
          transition: all 0.15s cubic-bezier( 0.40, 0, 0.20, 1 );
          white-space: var( --button-white-space );
          width: var( --button-width );
          -moz-osx-font-smoothing: grayscale;          
        }

        button:hover {
          background: var( --button-hover-background );
          color: var( --button-hover-color );
        }

        button span {
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          width: 100%;
        }

        :host( [grow] ) {
          flex-basis: 0; 
          flex-grow: 1; 
          width: 100%;
        }

        :host( :not( [label] ) ) span {
          display: none;
        }

        :host( [size=sm] ) button,
        :host( [size=small] ) button {
          height: 32px;
          padding: 0 12px 0 12px;
        }
        
        :host( [size=lg] ) button,
        :host( [size=large] ) button {
          height: 40px;
          padding: 0 24px 0 24px;
        }        
      </style>
      <button part="button" type="button">
        <slot name="prefix"></slot>
        <span part="label"></span>
        <slot></slot>
        <slot name="suffix"></slot>
      </button>
    `;
    
    // Properties
    this._data = null;
    
    // Consider for mobile
    this._touch = ( 'ontouchstart' in document.documentElement ) ? 'touchstart' : 'click';

    // Events
    this.onButtonClick = this.onButtonClick.bind( this );

    // Root
    this.attachShadow( {mode: 'open'} );
    this.shadowRoot.appendChild( template.content.cloneNode( true ) );

    // Elements
    this.$button = this.shadowRoot.querySelector( 'button' );
    this.$label = this.shadowRoot.querySelector( 'span' );    
  }
  
  onButtonClick() {
    this.dispatchEvent( new CustomEvent( 'tc-click' ) );
  }

  // When attributes change
  _render() {
    const type = this.type === null ? 'button' : this.type;
    this.$button.type = type;
    this.$label.textContent = this.label === null ? '' : this.label;
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
    this.$button.addEventListener( this._touch, this.onButtonClick );
      
    this._upgrade( 'concealed' );      
    this._upgrade( 'data' );
    this._upgrade( 'grow' );    
    this._upgrade( 'hidden' );    
    this._upgrade( 'type' );      
    this._upgrade( 'label' );            
    this._upgrade( 'size' );                
    
    this._render();
  }
  
  // Set down
  diconnectedCallback() {
    this.$button.removeEventListener( this._touch, this.onButtonClick );
  }

  // Watched attributes
  static get observedAttributes() {
    return [
      'concealed',
      'grow',
      'hidden',    
      'type',    
      'label',
      'size'
    ];
  }

  // Observed attribute has changed
  // Update render
  attributeChangedCallback( name, old, value ) {
    this._render();
  } 
  
  // Properties
  // Not reflected
  // Array, Date, Object, null
  get data() {
    return this._data;
  }
  
  set data( value ) {
    this._data = value === null ? null : structuredClone( value );
  }    

  // Attributes
  // Reflected
  // Boolean, Float, Integer, String, null
  get concealed() {
    return this.hasAttribute( 'concealed' );
  }

  set concealed( value ) {
    if( value !== null ) {
      if( typeof value === 'boolean' ) {
        value = value.toString();
      }

      if( value === 'false' ) {
        this.removeAttribute( 'concealed' );
      } else {
        this.setAttribute( 'concealed', '' );
      }
    } else {
      this.removeAttribute( 'concealed' );
    }
  }

  get grow() {
    return this.hasAttribute( 'grow' );
  }

  set grow( value ) {
    if( value !== null ) {
      if( typeof value === 'boolean' ) {
        value = value.toString();
      }

      if( value === 'false' ) {
        this.removeAttribute( 'grow' );
      } else {
        this.setAttribute( 'grow', '' );
      }
    } else {
      this.removeAttribute( 'grow' );
    }
  }

  get hidden() {
    return this.hasAttribute( 'hidden' );
  }

  set hidden( value ) {
    if( value !== null ) {
      if( typeof value === 'boolean' ) {
        value = value.toString();
      }

      if( value === 'false' ) {
        this.removeAttribute( 'hidden' );
      } else {
        this.setAttribute( 'hidden', '' );
      }
    } else {
      this.removeAttribute( 'hidden' );
    }
  }  
  
  get label() {
    if( this.hasAttribute( 'label' ) ) {
      return this.getAttribute( 'label' );
    }

    return null;
  }

  set label( value ) {
    if( value !== null ) {
      this.setAttribute( 'label', value );
    } else {
      this.removeAttribute( 'label' );
    }
  }        

  get size() {
    if( this.hasAttribute( 'size' ) ) {
      return this.getAttribute( 'size' );
    }

    return null;
  }

  set size( value ) {
    if( value !== null ) {
      this.setAttribute( 'size', value );
    } else {
      this.removeAttribute( 'size' );
    }
  }  

  get type() {
    if( this.hasAttribute( 'type' ) ) {
      return this.getAttribute( 'type' );
    }

    return null;
  }

  set type( value ) {
    if( value !== null ) {
      this.setAttribute( 'type', value );
    } else {
      this.removeAttribute( 'type' );
    }
  }          
}

window.customElements.define( 'tc-button', TcButton );
