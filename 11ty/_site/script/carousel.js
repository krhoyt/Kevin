export default class HoytCarousel extends HTMLElement {
  constructor() {
    super();

    const template = document.createElement( 'template' );
    template.innerHTML = /* template */ `
      <style>
        :host {
          align-items: center;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          gap: 32px;
          position: relative;
        }

        section {
          align-items: center;
          display: flex;
          flex-direction: row;
          gap: 32px;
          width: 100%;
        }

        section button {
          align-items: center;
          appearance: none;
          backdrop-filter: blur( 6px );
          background: rgba( 255, 255, 255, 0.90 );
          border: solid 1px #E4E4E7;
          border-radius: 40px;
          box-shadow: 0 2px 6px rgba( 0, 0, 0, 0.04 );    
          color: #1a1a1a;
          cursor: pointer;
          display: flex;
          height: 40px;
          justify-content: center;
          margin: 0;
          padding: 0;
          transition: 
            box-shadow 200ms ease, 
            color 200ms ease,     
            transform 200ms ease;
          width: 40px;
        }

        section button:hover {
          border-color: #3B82F6;
          color: #3B82F6;  
          box-shadow: 0 6px 16px rgba( 0, 0, 0, 0.08 );  
          transform: translateY( -2px );
        }

        article {
          background: #ffffff;
          backdrop-filter: blur( 6px );  
          border: solid 1px #E4E4E7;  
          border-radius: 16px;
          box-shadow: 0 2px 6px rgba( 0, 0, 0, 0.04 );    
          flex-basis: 0;
          flex-grow: 1;
          overflow: hidden;
        }

        footer {
          display: flex;
          flex-direction: row;
          gap: 8px;  
          justify-content: center;
        }

        footer button {
          appearance: none;
          background: #E4E4E7;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          height: 10px;
          transition: 
            background 200ms ease, 
            transform 200ms ease;  
          width: 10px;
        }

        footer button.active {
          background: #3B82F6;
          transform: scale( 1.2 );
        }
      </style>
      <section>
        <button>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
            <path fill="currentColor" d="m10.8 12l3.9 3.9q.275.275.275.7t-.275.7t-.7.275t-.7-.275l-4.6-4.6q-.15-.15-.212-.325T8.425 12t.063-.375t.212-.325l4.6-4.6q.275-.275.7-.275t.7.275t.275.7t-.275.7z"/>
          </svg>      
        </button>
        <article> 
          <slot></slot>
        </article>
        <button>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12.6 12L8.7 8.1q-.275-.275-.275-.7t.275-.7t.7-.275t.7.275l4.6 4.6q.15.15.213.325t.062.375t-.062.375t-.213.325l-4.6 4.6q-.275.275-.7.275t-.7-.275t-.275-.7t.275-.7z"/>
          </svg>      
        </button>
      </section>      
      <footer></footer>
    `;
    
    // Events
    this.onDotClick = this.onDotClick.bind( this );
    
    // Root
    this.attachShadow( {mode: 'open'} );
    this.shadowRoot.appendChild( template.content.cloneNode( true ) );

    // Elements
    this.$footer = this.shadowRoot.querySelector( 'footer' );
    this.$next = this.shadowRoot.querySelector( 'section button:last-of-type' );
    this.$next.addEventListener( 'click', () => {
      const index = this.selectedIndex === null ? 0 : this.selectedIndex;
      if( index === this.children.length - 1 ) {
        this.selectedIndex = 0;
      } else {
        this.selectedIndex = index + 1;
      }
    } );    
    this.$previous = this.shadowRoot.querySelector( 'section button:first-of-type' );
    this.$previous.addEventListener( 'click', () => {
      const index = this.selectedIndex === null ? 0 : this.selectedIndex;
      if( index === 0 ) {
        this.selectedIndex = this.children.length - 1;
      } else {
        this.selectedIndex = index - 1;
      }
    } );
    this.$slot = this.shadowRoot.querySelector( 'slot' );
    this.$slot.addEventListener( 'slotchange', () => {
      const index = this.selectedIndex === null ? 0 : this.selectedIndex;
      for( let c = 0; c < this.children.length; c++ ) {
        this.children[c].hidden = index === c ? false : true;
      }

      while( this.$footer.children.length > this.children.length ) {
        this.$footer.children[0].removeEventListener( 'click', this.onDotClick );
        this.$footer.children[0].remove();
      }

      while( this.$footer.children.length < this.children.length ) {
        const button = document.createElement( 'button' );
        button.addEventListener( 'click', this.onDotClick );
        button.type = 'button';
        this.$footer.appendChild( button );
      }

      for( let c = 0; c < this.$footer.children.length; c++ ) {
        this.$footer.children[c].setAttribute( 'data-index', c );

        if( c === index ) {
          this.$footer.children[c].classList.add( 'active' );
        } else {
          this.$footer.children[c].classList.remove( 'active' );
        }
      }
    } );
  }

  onDotClick( evt ) {
    const index = parseInt( evt.currentTarget.getAttribute( 'data-index' ) );
    console.log( 'Dot: ' + index );
    if( index !== this.selectedIndex ) {
      this.selectedIndex = index;
    }
  }

  // When attributes change
  _render() {
    const index = this.selectedIndex === null ? 0 : this.selectedIndex;
    for( let c = 0; c < this.children.length; c++ ) {
      this.children[c].hidden = index === c ? false : true;
    }

    for( let c = 0; c < this.$footer.children.length; c++ ) {
      this.$footer.children[c].setAttribute( 'data-index', c );

      if( c === index ) {
        this.$footer.children[c].classList.add( 'active' );
      } else {
        this.$footer.children[c].classList.remove( 'active' );
      }
    }
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
  // Boolean, Float, Integer, String, null
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

window.customElements.define( 'kh-carousel', HoytCarousel );
