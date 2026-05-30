export default class HoytStatus extends HTMLElement {
  constructor() {
    super();

    const template = document.createElement( 'template' );
    template.innerHTML = /* template */ `
      <style>
        :host {
          background: rgba( 0, 0, 0, 0.45 );
          border: solid 1px rgba( 59, 130, 246, 0.35 );
          border-radius: 6px;
          box-shadow:
            0 0 0 1px rgba(59, 130, 246, 0.05),
            0 8px 32px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(12px);          
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          margin: 0 auto 0 auto;
          min-width: 540px;
          max-width: 540px;
          padding: 12px 16px;
          position: relative;
        }

        p {
          color: white;
          font-family: monospace;
          font-size: 14px;
          line-height: 22px;
          margin: 0;
          padding: 0;
          text-rendering: optimizeLegibility;
        }

        p[part=now] {
          color: #22c55e;
        }

        p[part=now] span {
          color: #3b82f6;
        }

        p[part=started] {
          opacity: 0.60;
        }

        p[part=status]::first-letter {
          text-transform: uppercase;
        }

        @media only screen and ( max-width: 860px ) {      
          :host {
            min-width: 500px;
            max-width: 500px;
          }
        }

        @media only screen and ( max-width: 640px ) {      
          :host {
            margin-bottom: 32px;
            min-width: 80vw;
            max-width: 80vw;
          }
        }        
      </style>
      <p part="now"><span>$</span> now</p>
      <p part="status">Building an AI orchestration prototype.</p>
      <p part="started">Started on May 29, 2026</p>
    `;

    // Properties
    this._history = [];
    this._index = 0;

    // Root
    this.attachShadow( {mode: 'open'} );
    this.shadowRoot.appendChild( template.content.cloneNode( true ) );

    // Elements
    this.$status = this.shadowRoot.querySelector( 'p[part=status]' );
    this.$started = this.shadowRoot.querySelector( 'p[part=started]' );

    fetch( 'https://ketnerlake.com/api/status' )
    .then( ( response ) => response.json() )
    .then( ( data ) => {
      data.map( ( value ) => {
        value.started = new Date( value.started );
        return value;
      } );
      data.sort( ( a, b ) => {
        if( a.getTime() < b.getTime() ) return -1;
        if( a.getTime() > b.getTime() ) return 1;        
        return 0;
      } );
      this._history = [... data];
      this._render();
    } );
  }

  article( phrase ) {
    if (!phrase) return '';

    const word = phrase.trim().split(/\s+/)[0].toLowerCase();

    // No article for acronyms/initialisms that sound vowel-led.
    // AI => "an AI prototype"
    if( /^[aeiou]/i.test( word ) ) {
      return "an";
    }

    // Common vowel-sound exceptions.
    if( /^(honest|hour|heir|honor)/.test( word ) ) {
      return "an";
    }

    // Common consonant-sound exceptions.
    if( /^(user|university|unique|unit|one|once)/.test( word ) ) {
      return "a";
    }

    return "a";
  }

  // When attributes change
  _render() {
    const formatter = new Intl.DateTimeFormat( navigator.language, {
      dateStyle: "full",
      timeStyle: "long"
    } );

    const activity = this._history[this._index].activity.toLowerCase();
    const subject = this._history[this._index].subject.toLowerCase();
    this.$status.textContent = `${activity} ${this.article( subject )} ${subject}.`;
    this.$started.textContent = formatter.format( this._history[this._index].started );
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
    // this._upgrade( 'loading' );
    this._render();
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

  // Attributes
  // Reflected
  // Boolean, Float, Integer, String, null
  get loading() {
    return this.hasAttribute( 'loading' );
  }

  set loading( value ) {
    if( value !== null ) {
      if( typeof value === 'boolean' ) {
        value = value.toString();
      }

      if( value === 'false' ) {
        this.removeAttribute( 'loading' );
      } else {
        this.setAttribute( 'loading', '' );
      }
    } else {
      this.removeAttribute( 'loading' );
    }
  }
}

window.customElements.define( 'kh-status', HoytStatus );
