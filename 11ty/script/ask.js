import HoytSpinner from "./spinner.js";

import { reduce } from "/script/reducer.js";
import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";

export default class HoytAsk extends HTMLElement {
  constructor() {
    super();

    const template = document.createElement( 'template' );
    template.innerHTML = /* template */ `
      <style>
        :host {
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          gap: 16px;
          min-width: 900px;
          max-width: 900px;
          padding: 0 72px 0 72px;
          position: relative;
        }

        div.chips {
          align-items: center;
          box-sizing: border-box;
          display: flex;
          flex-direction: row;
          flex-wrap: wrap;
          gap: 16px;
          justify-content: center;
        }

        div.chips button {
          background: #F3F4F6;
          border: 1px solid #e4e4e7;
          border-radius: 6px;
          box-sizing: border-box;
          display: inline-block;
          color: #6B7280;
          cursor: pointer;
          font-family: Roboto, sans-serif;
          font-size: 12px;
          font-weight: 500;
          line-height: 24px;
          margin: 0;
          padding: 3px 8px 3px 8px;
          text-rendering: optimizeLegibility;
          transition: 
            color 0.25s ease,          
            transform 0.25s ease;          
          -moz-osx-font-smoothing: grayscale;  
          -webkit-font-smoothing: antialiased;          
        }

        div.chips button:hover {
          color: #1a1a1a;
          transform: scale( 1.15 );
        }

        div.chips button[disabled] {
          background: #F3F4F6;
          color: #6B7280;
          cursor: not-allowed;
          transform: scale( 1.0 );
        }

        form {
          align-items: center;
          box-sizing: border-box;
          display: flex;
          flex-direction: row;
          gap: 16px;
        }

        form button {
          align-items: center;
          appearance: none;
          background: #3B82F6;
          border: none;
          border-radius: 6px;
          color: #ffffff;
          cursor: pointer;
          display: flex;
          font-family: Roboto, sans-serif;
          font-size: 16px;
          font-weight: 500;
          justify-content: center;
          line-height: 24px;
          margin: 0;
          min-width: 65px;
          padding: 8px 16px 8px 16px;
          text-align: center;
          text-rendering: optimizeLegibility;  
          -moz-osx-font-smoothing: grayscale;      
          -webkit-font-smoothing: antialiased;                   
        }

        form button:hover {
          background: #2563EB;
        }        

        form button[disabled] {
          background: #F3F4F6;
          border: 1px solid #E5E7EB;
          color: #6B7280;
          cursor: not-allowed;
        }

        input {
          appearance: none;
          background: #ffffff;
          border: solid 1px #e4e4e7;
          border-radius: 6px;
          box-sizing: border-box;
          color: #1a1a1a;
          flex-basis: 0;
          flex-grow: 1;
          font-family: Roboto, sans-serif;
          font-size: 16px;
          font-weight: 400;
          line-height: 24px;
          margin: 0;
          min-width: 0;
          outline: none;
          padding: 8px 16px 8px 16px;
          position: relative;
          resize: none;
          width: 100%;
          text-rendering: optimizeLegibility;  
          transition:
            background 0.25s ease,
            border 0.25s ease;
          -moz-osx-font-smoothing: grayscale;      
          -webkit-font-smoothing: antialiased;                        
        }

        input:focus {
          border: solid 1px #3B82F6;
          box-shadow: 0 0 0 3px #f4f4f4;  
        }

        input[disabled] {
          background: #F3F4F6;
          border: 1px solid #E5E7EB;          
          cursor: not-allowed;
        }

        kh-spinner {
          --spinner-indicator-color: #6B7280;
        }

        p.question {
          color: #1a1a1a; 
          cursor: default;
          font-family: Roboto, sans-serif;
          font-size: 16px;
          font-weight: 500;
          line-height: 24px;
          margin: 0;
          padding: 4px 16px 10px 16px;
          text-rendering: optimizeLegibility;
          -moz-osx-font-smoothing: grayscale;  
          -webkit-font-smoothing: antialiased;
        }        

        p.title {
          color: #1a1a1a; 
          cursor: default;
          font-family: Roboto, sans-serif;
          font-size: 14px;
          font-weight: 400;
          line-height: 24px;
          margin: 0;
          opacity: 0.60;
          padding: 10px 16px 0 16px;
          text-rendering: optimizeLegibility;
          text-transform: uppercase;
          -moz-osx-font-smoothing: grayscale;  
          -webkit-font-smoothing: antialiased;
        }

        div.answer {
          background: rgba( from #3B82F6 r g b / 0.04 );
          border-left: solid 3px #3B82F6;
          border-radius: 8px;
          box-shadow:
            0 1px 1px rgba(0, 0, 0, 0.04),
            0 2px 4px rgba(0, 0, 0, 0.05);
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          max-height: 450px;     
          position: relative;
          transition: opacity 0.25s ease;
        }

        div.answer button {
          align-items: center;
          appearance: none;
          background: #3B82F6;
          border: none;
          border-radius: 20px;
          bottom: -4px;
          color: #ffffff;
          display: flex;
          height: 40px;
          justify-content: center;
          left: calc( 50% - 20px );
          position: absolute;
          width: 40px;
        }

        /*
        div.response.scrollable::after {
          background: linear-gradient(
            to bottom,
          rgba( 248, 250, 252, 0 ),
          rgba( 248, 250, 252, 1 )
          );          
          bottom: 0;          
          content: '';
          display: block;          
          height: 32px;          
          position: sticky;
          pointer-events: none;   
          z-index: 100;       
        }
        */

        div.response {
          background: #ffffff;
          border-radius: 8px;
          box-shadow:
            0 1px 1px rgba( 0, 0, 0, 0.04 ),
            0 2px 4px rgba( 0, 0, 0, 0.05 );
          color: #1a1a1a;
          font-family: Roboto, sans-serif;
          font-size: 16px;
          font-weight: 400;
          line-height: 24px;            
          margin: 0 16px 16px 16px;
          overflow: auto;
          padding: 4px 16px 4px 16px;
          position: relative;
          text-rendering: optimizeLegibility;
          -moz-osx-font-smoothing: grayscale;  
          -webkit-font-smoothing: antialiased;          
        }

        div.answer[hidden] {
          display: none;
        }

        :host( [loading] ) div.answer {
          opacity: 0.60;
        }

        :host( [loading] ) form button {
          padding: 11px 16px 11px 16px;
        }

        :host( [loading] ) form button span {
          display: none;
        }

        :host( :not( [loading] ) ) form button kh-spinner {
          display: none;
        }        

        @media only screen and ( max-width: 860px ) {      
          :host {
            min-width: 600px;
            max-width: 600px;
            padding: 0;                        
          }
        }

        @media only screen and ( max-width: 640px ) {      
          :host {
            min-width: unset;
            max-width: unset;
            padding: 0 16px 0 16px;                        
          }
        }        

        @media only screen and ( max-width: 429px ) {      
          :host {
           padding: 0 16px 0 16px;
          }
        }        
      </style>
      <form>
        <input placeholder="Type your question here" type="text">
        <button disabled type="button">
          <span>Ask</span>
          <kh-spinner></kh-spinner>
        </button>
      </form>
      <div class="chips">
        <button data-index="0" type="button">Leadership experience</button>
        <button data-index="1" type="button">Key technical skills</button>        
        <button data-index="2" type="button">Notable achievements</button>        
        <button data-index="3" type="button">Ideal role for me</button>        
      </div>
      <div class="answer" hidden>
        <p class="title">AI generated response</p>
        <p class="question"></p>
        <div class="response">
          <p></p>
        </div>
      </div>
    `;

    this._conversation = {
      summary: ''
    };
    this._questions = [
      'What experience does Kevin have leading teams, mentoring engineers, and setting technical direction?',
      'What technologies does Kevin work with most, and in what contexts does he use them?',
      'What work is Kevin most proud of, and why?',
      'What kinds of roles should a hiring manager consider Kevin for, and why?',
      'How does Kevin approach technical and product tradeoffs when constraints or ambiguity are high?',
      'How does Kevin typically collaborate with product, design, and engineering partners?'
    ];
    
    // Events
    this.onChipClick = this.onChipClick.bind( this );
    
    // Root
    this.attachShadow( {mode: 'open'} );
    this.shadowRoot.appendChild( template.content.cloneNode( true ) );

    // Elements
    this.$answer = this.shadowRoot.querySelector( 'div.answer' );    
    this.$ask = this.shadowRoot.querySelector( 'form button' );
    this.$ask.addEventListener( 'click', async () => {
      this.generate( this.$input.value );
    } );
    this.$chips = this.shadowRoot.querySelectorAll( 'div.chips button' );
    this.$input = this.shadowRoot.querySelector( 'form input' );
    this.$input.addEventListener( 'keydown', ( evt ) => {
      if( evt.key === 'Enter' ) {
        evt.preventDefault(); 
        this.generate( this.$input.value );
      }
    } );    
    this.$input.addEventListener( 'input', () => {
      this.$ask.disabled = this.$input.value.trim().length === 0 ? true : false;
    } );
    this.$response = this.shadowRoot.querySelector( 'div.response' );        
    this.$question = this.shadowRoot.querySelector( 'div.answer p.question' );

    for( let c = 0; c < this.$chips.length; c++ ) {
      this.$chips[c].addEventListener( 'click', this.onChipClick );
    }
  }

  async generate( question = null ) {
    this.loading = true;
    this.$input.disabled = true;
    this.$input.value = question;          
    this.$ask.disabled = true;
    this.$chips.forEach( ( button ) => button.disabled = true );

    const response = await fetch( 'https://ketnerlake.com/api/about', {
      method: 'POST',
      body: JSON.stringify( {
        question,
        summary: this._conversation.summary
      } )
    } );

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let text = '';

    while ( true ) {
      const { done, value } = await reader.read();

      if ( done ) break;

      text += decoder.decode( value, { stream: true } );

      this.$question.textContent = question;      
      this.$response.innerHTML = marked.parse( text );
      this.$answer.hidden = false;

      /*
      const scrollable = this.$response.scrollHeight > this.$response.clientHeight;
      if( scrollable ) {
        this.$response.classList.add( 'scrollable' );
      } else {
        this.$response.classList.remove( 'scrollable' );        
      }
      */
    }

    this.loading = false;
    this.$input.value = null;
    this.$input.disabled = false;
    this.$input.focus();
    this.$ask.disabled = false;
    this.$chips.forEach( ( button ) => button.disabled = false );    

    this._conversation = reduce(
      this._conversation,
      question,
      text
    );    
  }

  onChipClick( evt ) {
    const index = parseInt( evt.currentTarget.getAttribute( 'data-index' ) );
    this.generate( this._questions[index] );
  }

  // When attributes change
  _render() {;}

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
    this._upgrade( 'loading' );
    this._render();
  }
  
  // Watched attributes
  static get observedAttributes() {
    return [
      'loading'
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

window.customElements.define( 'kh-ask', HoytAsk );
