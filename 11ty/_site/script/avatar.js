import {hashCode, getUnit, getRandomColor} from "/script/colors.js";

export default class HoytAvatar extends HTMLElement {
  constructor() {
    super();

    const template = document.createElement( 'template' );
    template.innerHTML = /* template */ `
      <style>
        :host {
          align-items: center;
          box-sizing: border-box;
          display: inline-flex;
          justify-content: center;
          margin: 0;
          padding: 0;
          position: relative;
        }
      </style>
      <svg
        fill="none"
        role="img"
        xmlns="http://www.w3.org/2000/svg">
        <title></title>
        <mask maskUnits="userSpaceOnUse" x="0" y="0">
          <rect fill="#FFFFFF" />
        </mask>   
        <g>
          <rect />        
          <path
            d="M32.414 59.35L50.376 70.5H72.5v-71H33.728L26.5 13.381l19.057 27.08L32.414 59.35z"
          />
          <path
            style="mix-blend-mode: overlay"
            d="M22.216 24L0 46.75l14.108 38.129L78 86l-3.081-59.276-22.378 4.005 12.972 20.186-23.35 27.395L22.215 24z"
          />          
        </g>     
        <defs>
          <filter
            filterUnits="userSpaceOnUse"
            color-interpolation-filters="sRGB">
            <feFlood flood-opacity="0" result="BackgroundImageFix" />
            <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
            <feGaussianBlur stdDeviation="7" result="effect1_foregroundBlur" />
          </filter>
        </defs>        
      </svg>
    `;

    // Properties 
    this._colors = [
      '#3B82F6',
      '#F59E0B',
      '#14B8A6',
      '#060606',
      '#F97373'      
    ];
    this._mask = crypto.randomUUID();

    /* From Boring Avatars 
      '#0a0310',
      '#49007e',
      '#ff005b',
      '#ff7d10',
      '#ffb238'
    */    

    // Root
    this.attachShadow( {mode: 'open'} );
    this.shadowRoot.appendChild( template.content.cloneNode( true ) );

    // Elements
    this.$filter = this.shadowRoot.querySelector( 'filter' );
    this.$group = this.shadowRoot.querySelector( 'g' );
    this.$mask = this.shadowRoot.querySelector( 'mask' );
    this.$mask_rect = this.shadowRoot.querySelector( 'mask rect' );
    this.$path_one = this.shadowRoot.querySelector( 'path:first-of-type' );
    this.$path_two = this.shadowRoot.querySelector( 'path:last-of-type' );
    this.$rect = this.shadowRoot.querySelector( 'g rect' );
    this.$svg = this.shadowRoot.querySelector( 'svg' );
    this.$title = this.shadowRoot.querySelector( 'title' );
  }

  // When attributes change
  _render() {
    const size = this.size === null ? 32 : this.size;
    const name = this.name === null ? '' : this.name;

    const properties = this.generateColors( name, this._colors );

    this.$svg.setAttributeNS( null, 'width', size );
    this.$svg.setAttributeNS( null, 'height', size );
    this.$svg.setAttributeNS( null, 'viewBox', `0 0 80 80` );

    if( this.title ) {
      this.$title.textContent = name;
    } else {
      this.$title.textContent = '';
    }

    this.$mask.setAttributeNS( null, 'id', this._mask );
    this.$mask.setAttributeNS( null, 'width', 80 );
    this.$mask.setAttributeNS( null, 'height', 80 );

    this.$mask_rect.setAttributeNS( null, 'width', 80 );
    this.$mask_rect.setAttributeNS( null, 'height', 80 );
    this.$mask_rect.setAttributeNS( null, 'rx', 80 * 2 );

    this.$group.setAttributeNS( null, 'mask', `url(#${this._mask})` );

    this.$rect.setAttributeNS( null, 'width', 80 );
    this.$rect.setAttributeNS( null, 'height', 80 );
    this.$rect.setAttributeNS( null, 'fill', properties[0].color );

    this.$path_one.setAttributeNS( null, 'filter', `url(#filter_${this._mask})` );
    this.$path_one.setAttributeNS( null, 'fill', properties[1].color );
    this.$path_one.setAttributeNS( null, 'transform', `translate(${properties[1].translateX} ${properties[1].translateY}) rotate(${properties[1].rotate} ${80 / 2} ${80 / 2}) scale(${properties[2].scale})` );

    this.$path_two.setAttributeNS( null, 'filter', `url(#filter_${this._mask})` );
    this.$path_two.setAttributeNS( null, 'fill', properties[2].color );
    this.$path_two.setAttributeNS( null, 'transform', `translate(${properties[2].translateX} ${properties[2].translateY}) rotate(${properties[2].rotate} ${80 / 2} ${80 / 2}) scale(${properties[2].scale})` );

    this.$filter.setAttributeNS( null, 'id', `filter_${this._mask}` );
  }

  generateColors( name, colors ) {
    const numFromName = hashCode( name );
    const range = colors && colors.length;

    const elementsProperties = Array.from( {length: 3}, ( _, i ) => ( {
      color: getRandomColor( numFromName + i, colors, range ),
      translateX: getUnit( numFromName * ( i + 1 ), 80 / 10, 1 ),
      translateY: getUnit( numFromName * ( i + 1 ), 80 / 10, 2 ),
      scale: 1.2 + getUnit( numFromName * ( i + 1 ), 80 / 20 ) / 10,
      rotate: getUnit( numFromName * ( i + 1 ), 360, 1 )
    } ) );

    return elementsProperties;
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
    this._upgrade( 'colors' );
    this._upgrade( 'name' );
    this._upgrade( 'size' );
    this._upgrade( 'title' );
    this._render();
  }

  // Watched attributes
  static get observedAttributes() {
    return [
      'name',
      'size',
      'title'
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
  get colors() {
    return this._colors.length === 0 ? null : this._colors;
  }
  
  set colors( value ) {
    this._colors = value === null ? [] : [... value];
  }  

  // Attributes
  // Reflected
  // Boolean, Float, Integer, String, null
  get name() {
    if( this.hasAttribute( 'name' ) ) {
      return this.getAttribute( 'name' );
    }

    return null;
  }

  set name( value ) {
    if( value !== null ) {
      this.setAttribute( 'name', value );
    } else {
      this.removeAttribute( 'name' );
    }
  }  

  get size() {
    if( this.hasAttribute( 'size' ) ) {
      return parseInt( this.getAttribute( 'size' ) );
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

  get title() {
    return this.hasAttribute( 'title' );
  }

  set title( value ) {
    if( value ) {
      this.setAttribute( 'title', '' );
    } else {
      this.removeAttribute( 'title' );
    }
  }
}

window.customElements.define( 'kh-avatar', HoytAvatar );
