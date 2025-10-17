export default class ButtonGroup extends HTMLElement {
  constructor() {
    super();

    const template = document.createElement( 'template' );
    template.innerHTML = /* template */ `
      <style>
        :host {
          box-sizing: border-box;
          display: block;
          position: relative;
        }

        div[part=buttons] {
          display: flex;
          flex-direction: row;
          gap: 16px;
          left: 0;
          position: absolute;
          top: 0;
          width: 100%;
        }        

        div[part=group] {
          background: #ffffff40;
          border: solid 1px #ffffff;
          border-radius: 20px;
          display: flex;
          flex-direction: row;
          height: 40px;          
          overflow: hidden;
          position: relative;          
        }

        div[part=selection] {
          background: #ffffff;
          border-radius: 20px;
          height: 40px;
          position: absolute;
          left: 0;
          top: 0;
          transition: left 0.30s ease-in-out;
        }

        ::slotted( button ) {
          align-items: center;
          appearance: none;
          background: none;
          border: none;
          color: #000000;
          cursor: pointer;
          display: flex;
          flex-basis: 0;
          flex-grow: 1;
          font-family: 'Roboto', sans-serif;
          font-size: 14px;
          font-weight: 500;
          gap: 8px;
          height: 40px;
          justify-content: center;
          padding: 0;
          outline: none;
          margin: 0;
        }
      </style>
      <div part="group">
        <div part="selection"></div>
        <div part="buttons">
          <slot></slot>              
        </div>
      </div>
    `;

    // Events
    this.onButtonClick = this.onButtonClick.bind( this );

    // Root
    this.attachShadow( {mode: 'open'} );
    this.shadowRoot.appendChild( template.content.cloneNode( true ) );

    // Elements
    this.$selection = this.shadowRoot.querySelector( 'div[part=selection]' );    
    this.$slot = this.shadowRoot.querySelector( 'slot' );
    this.$slot.addEventListener( 'slotchange', () => {
      for( let c = 0; c < this.children.length; c++ ) {
        this.children[c].setAttribute( 'data-index', c );
        this.children[c].removeEventListener( 'click', this.onButtonClick );
        this.children[c].addEventListener( 'click', this.onButtonClick );        
      }
    } );
  }

  onButtonClick( evt ) {
    const index = parseInt( evt.currentTarget.getAttribute( 'data-index' ) );
    this.selectedIndex = index;

    this.dispatchEvent( new CustomEvent( 'change', {
      detail: {
        selectedIndex: this.selectedIndex
      }
    } ) );
  }

  // When attributes change
  _render() {
    const index = this.selectedIndex === null ? 0 : this.selectedIndex;
    this.$selection.style.width = `${100 / this.children.length}%`;
    this.$selection.style.left = `${( 100 / this.children.length ) * index}%`;
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
    this._upgrade( 'selectedIndex' );    
    this._render();
  }

  // Watched attributes
  static get observedAttributes() {
    return [
      'selected-index'
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
  get selectedIndex() {
    if( this.hasAttribute( 'selected-index' ) ) {
      return parseInt( this.getAttribute( 'selected-index' ) );
    }

    return null;
  }

  set selectedIndex( value ) {
    if( value !== null ) {
      this.setAttribute( 'selected-index', value );
    } else {
      this.removeAttribute( 'selected-index' );
    }
  }  
}

window.customElements.define( 'pix-button-group', ButtonGroup );
