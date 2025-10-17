export default class Slider extends HTMLElement {
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

        button {
          appearance: none;
          background: #999999;
          border: none;
          border-radius: 20px;
          box-sizing: border-box;
          cursor: pointer;
          height: 40px;
          left: 0;
          margin: 0;
          outline: none;
          padding: 0;
          position: absolute;
          top: 0;
          width: 40px;
        }

        div[part=fill] {
          background: #999999;
          box-sizing: border-box;
          height: 100%;
        }

        div[part=slider] {
          box-sizing: border-box;
          height: 40px;
          margin: 0 0 8px 0;
          padding: 12px 0 0 0;
          position: relative;
        }

        div[part=track] {
          border: solid 1px #ffffff;
          border-radius: 8px;
          box-sizing: border-box;
          height: 16px;
          margin: 0 20px 0 20px;    
          overflow: hidden;      
        }

        p {
          color: #000000;
          cursor: default;
          font-family: 'Roboto', sans-serif;
          font-size: 14px;
          font-weight: 500;
          margin: 0;
          padding: 0;
        }
      </style>
      <div part="slider">
        <div part="track">
          <div part="fill"></div>
        </div>
        <button part="handle" type="button"></button>
      </div>
      <p part="value"></p>
    `;

    // Properties
    this._bounds = null;
    this._offset = null;

    // Events
    this.onDocumentMove = this.onDocumentMove.bind( this );
    this.onDocumentUp = this.onDocumentUp.bind( this );    

    // Root
    this.attachShadow( {mode: 'open'} );
    this.shadowRoot.appendChild( template.content.cloneNode( true ) );

    // Elements
    this.$fill = this.shadowRoot.querySelector( 'div[part=fill]' );
    this.$handle = this.shadowRoot.querySelector( 'button' );
    this.$handle.addEventListener( 'mousedown', ( evt ) => {
      const bounds = evt.currentTarget.getBoundingClientRect();
      this._offset = {
        x: evt.clientX - bounds.left,
        width: bounds.width / 2
      };
      
      this._bounds = this.$slider.getBoundingClientRect();
      
      document.addEventListener( 'mousemove', this.onDocumentMove );
      document.addEventListener( 'mouseup', this.onDocumentUp );      
    } );
    this.$slider = this.shadowRoot.querySelector( 'div[part=slider]' );
    this.$value = this.shadowRoot.querySelector( 'p[part=value]' );
  }

  map( value, in_min, in_max, out_min, out_max ) {
    const ratio = ( value - in_min ) / ( in_max - in_min );
    return out_min + ( ratio * ( out_max - out_min ) );      
  }   

  onDocumentMove( evt ) {
    evt.preventDefault();

    let position = this.map( evt.clientX, this._bounds.left, this._bounds.left + this._bounds.width, 0, this._bounds.width );

    if( evt.clientX < ( this._bounds.left + this._offset.width  ) ) 
      position = 0;

    if( evt.clientX > ( this._bounds.left + this._bounds.width ) ) 
      position = this._bounds.width - this._offset.width;

    if( evt.clientX > this._bounds.left && evt.clientX < ( this._bounds.left + this._bounds.width ) ) 
      position = evt.clientX - this._bounds.left - this._offset.x;
    
    this.$handle.style.left = `${position}px`;    
  }

  onDocumentUp( evt ) {
    document.removeEventListener( 'mousemove', this.onDocumentMove );
    document.removeEventListener( 'mouseup', this.onDocumentUp );

    this._bounds = null;
    this._offset = null;
  }

  // When attributes change
  _render() {
    const maximum = this.maximum === null ? 100 : this.maximum;        
    const minimum = this.minimum === null ? 0 : this.minimum;    
    const units = this.units === null ? 'px' : this.units;        
    const value = this.value === null ? 0 : this.value;

    const width = this.map( value, minimum, maximum, 0, 100 );

    this.$fill.style.width = `${width}%`
    this.$value.innerText = `${value}${units}`;
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
    this._upgrade( 'maximum' );        
    this._upgrade( 'minimum' );    
    this._upgrade( 'units' );    
    this._upgrade( 'value' );
    this._render();
  }

  // Watched attributes
  static get observedAttributes() {
    return [
      'maximum',
      'minimum',
      'units',
      'value'
    ];
  }

  // Observed attribute has changed
  // Update render
  attributeChangedCallback( name, old, value ) {
    this._render();
  } 

  // Attributes
  // Reflected
  // Boolean, Number, String, null
  get maximum() {
    if( this.hasAttribute( 'maximum' ) ) {
      return parseInt( this.getAttribute( 'maximum' ) );
    }

    return null;
  }

  set maximum( value ) {
    if( value !== null ) {
      this.setAttribute( 'maximum', value );
    } else {
      this.removeAttribute( 'maximum' );
    }
  }
  
  get minimum() {
    if( this.hasAttribute( 'minimum' ) ) {
      return parseInt( this.getAttribute( 'minimum' ) );
    }

    return null;
  }

  set minimum( value ) {
    if( value !== null ) {
      this.setAttribute( 'minimum', value );
    } else {
      this.removeAttribute( 'minimum' );
    }
  }  

  get units() {
    if( this.hasAttribute( 'units' ) ) {
      return this.getAttribute( 'units' );
    }

    return null;
  }

  set units( value ) {
    if( value !== null ) {
      this.setAttribute( 'units', value );
    } else {
      this.removeAttribute( 'units' );
    }
  }        

  get value() {
    if( this.hasAttribute( 'value' ) ) {
      return parseInt( this.getAttribute( 'value' ) );
    }

    return null;
  }

  set value( value ) {
    if( value !== null ) {
      this.setAttribute( 'value', value );
    } else {
      this.removeAttribute( 'value' );
    }
  }    
}

window.customElements.define( 'pix-slider', Slider );
