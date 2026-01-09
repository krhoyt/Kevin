---
feature_image: /img/covers/template.jpg
unsplash_author: Joanna Kosinska
unsplash_author_url: https://unsplash.com/@joannakosinska
unsplash_photo_url: https://unsplash.com/photos/two-gray-pencils-on-yellow-surface-1_CMoFsPfso
title: Web Component Template
description: A pragmatic Web Component template based on how I actually ship components, with clear patterns for structure, attributes, properties, events, and rendering.
permalink: /blog/2026/01/09/component-template/
tags: 
 - Web
rating: 1
---

Web Components get a bad rap. They are often described as too long, too verbose, or burdened with boilerplate. I recently had ChatGPT migrate the “label” component from the previous [post](https://kevinhoyt.com/blog/2026/01/05/label-component/) to React. The result was less readable and nearly twice as long. Between recurring React security issues and the latest "Tailwind is dead" discourse, the ecosystem feels noisier than ever.

While there are a number of different ways to leverage the various standards that make up Web Components, I like a Shadow DOM implementation that leans on composability wherever possible - especially via slots, parts, and predictable APIs. My component template is pretty dialed in. I have built hundreds of components this way, and it is the approach I keep coming back to.

> I have implemented applications with Light DOM as well, and never quite developed a workflow I liked. Perhaps as somebody that has built applications with technologies like Java Swing and Visual Basic, the Shadow DOM approach just resonates more with me.

## Top and Bottom

The opening line of the template extends the `HTMLElement` class. This is standard for Web Components. For the name of the subclass, I like to use the prefix I intend to use for the component, followed by a name that describes the component. For example, a button component with the `kh-` prefix would become `KhButton`. In this post, we will use `KhTemplate` as a generic example.

``` js
export default class KhTemplate extends HTMLElement {
  ...
}

window.customElements.define( 'kh-template', KhTemplate );
```

The last line of the template wires up the subclass to the element name. The prefix must be present. The most common prefix is generally two or three letters, but I have seen complete words, and even multiple words used as a prefix (for example `solar-system-sun`, `solar-system-earth`). My guidance would be to use whatever makes resulting code most readable. Consistency is key.

## Constructor

The first part of the constructor defines the styles and markup that make up the component. I generally include a `:host` CSS block that contains at least `box-sizing: border-box`, `display: inline-block`, and `position: relative`. 

The `box-sizing` model helps make the layout more predictable. The `display` can be whatever you need, I prefer to specify it for consistency and maintainability. The relative `position` comes in handy when you need to absolutely position something inside the component like a tooltip or `::after` content.

``` js
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
    </style>
    <p part="label">Hello world!</p>
  `;

  ...
}
```

I also like to include the `part` attribute whenever I think the element may need to be styled by the developer. I find that if I am reaching for `id` or `class` to be able to reference the element, then I should probably just use a `part` name. This makes the part stylable, and easy to reference with `querySelector()`.

The second part of the constructor is declaring everything the component needs. I start with properties, and have specific default values I like to use. I also use the underscore (`_`) character to denote that these are "private".

``` js
// Properties
this._anArray = [];
this._aDate = null;
this._anObject = null;
    
// Events
this.onComponentClick = this.onComponentClick.bind( this );

// Root
this.attachShadow( {mode: 'open'} );
this.shadowRoot.appendChild( template.content.cloneNode( true ) );

// Elements
this.$label = this.shadowRoot.querySelector( 'p[part=label]' );
```

Most components handle some form of events internally. Here is where we declare those events. I use `bind()` so that they are also easily removed. Events get wired up later in the `connectedCallback()` method. 

Next, we stamp out the template by attaching it to the component’s `shadowRoot`.

Finally, any element references you will need during the life of the component. I like to use `$` to indicate that this property refers to an element. This allows me to have a property `this._label` align with an element `this.$label` to make things more readable.

## Event Handlers

After the constructor, I will define any of the events I referenced inside the constructor. 

``` js
onComponentClick( evt ) {
  this.dispatchEvent( new CustomEvent( 'kh-event', {
    bubbles: true,
    cancelable: false,
    composed: true,
    detail: {
      'abc': 123
    }
  } ) );
}
```

I do not generally like to rely on bubbling - either of native events or events that my components dispatch. If there is a `button` element inside my component, I will attach a click handler inside the component and in turn have the component dispatch something more relevant - even if it is just an `kh-click`. Whenever I use my components then, I always listen for the component specific event.

> I like to think that this makes the event handling easier to follow, and that it avoids any collision with other components I may be using (especially in a composable manner). In practice, I have never encountered any problems getting the right event from the right component.

## Rendering Content

The `_render()` method is where I update the elements within the component based on changes to attributes or properties. If the changes come from attribute changes, I will reference those access methods directly. If the changes are coming from property changes, then I will reference the internal property such as `this._value` directly.

**Never set an attribute or property of the component itself from inside the `_render()` method. This will result in an infinite loop.**

``` js
// When attributes change
_render() {
  this.$label.textContent = this.aString === null ? '' : this.aString;
}
```

In the case of something like a calendar component, where there are ~50 elements inside the component, this method definition can get pretty lengthy. Think of this as working with a scalpel, not a virtual DOM. You can set the `textContent` of the `this.$label` instance repeatedly without a performance impact.

## The Upgrade

Depending on how your component is used, property values may be assigned before the component has had a chance to initialize. If this happens, any property values that were assigned will become `undefined`. To get around this, as part of the initialization, I leverage a method named `_upgrade()`. We will see this more in a moment.

``` js
// Promote properties
// Values may be set before module load
_upgrade( property ) {
  if( this.hasOwnProperty( property ) ) {
    const value = this[property];
    delete this[property];
    this[property] = value;
  }
}
```

The `_upgrade()` method checks for the existence of a property value. If it exists, that property is referenced to a local value. The property value itself is then deleted, and then immediately set with the local value. This ensures that any properties assigned before upgrade are properly re-applied once the component is fully initialized.

## Connect and Disconnect

When a component is attached to the DOM, it calls the `connectedCallback()` method. This is where you can wire up your events, and perform an initial render. When the component is removed from the DOM, it calls the `disconnectedCallback()` method. This is where you want to remove any event handlers.

``` js
// Setup
connectedCallback() {
  this.$label.addEventListener( 'click', this.onComponentClick );
    
  this._upgrade( 'anArray' );      
  this._upgrade( 'aBoolean' );
  this._upgrade( 'aDate' );    
  this._upgrade( 'aFloat' );      
  this._upgrade( 'anInteger' );            
  this._upgrade( 'anObject' );    
  this._upgrade( 'aString' ); 
  
  this._render();
}

// Set down
disconnectedCallback() {
  this.$label.removeEventListener( 'click', this.onComponentClick );
}
```

Here is where the `_upgrade()` method shows up. You should apply the upgrade to all attribute and property values that are exposed externally. Now that we are sure the state of the component is what the developer expected, we can call `_render()` to place all the values in the component DOM.

## Attributes

We are almost done implementing our web component. We have attributes and properties remaining. 

The `observedAttributes()` method is part of the specification that tells the component what attributes might change at runtime. This means that if you set a `data-id` attribute on the element at runtime, and the `data-id` attribute is not declared in `observedAttributes()`, then no updates will happen to the component - the attribute is not registered - and that may be what is desired. 

A "label" component on the other hand will likely have a `text` attribute. We expect the internal DOM of the component to be updated when that attribute is added, changed, or removed. For this change to happen, we need to tell the component about the attribute. 

> We do not need to list properties here - they are handled directly via their setters.

``` js
// Watched attributes
static get observedAttributes() {
  return [
    'a-boolean',
    'a-float',    
    'an-integer',    
    'a-string'
  ];
}

// Observed attribute has changed
// Update render
attributeChangedCallback( name, old, value ) {
  this._render();
} 
```

When an attribute is changed, the `_render()` method is called to update the DOM. This may look different than some other component implementations you may have seen. This is because in this implementation, some property changes may change the DOM as well. Rather than have that code in multiple places, it gets centralized in the `_render()` method.

## Properties

Technically attributes can only be strings. We will add some syntactic sugar in a moment to be able to handle basic types such as integers, floats, and booleans. There are times however when you really need to pass an object to the component. That is where properties come into play. 

> I have specific signatures I like to use for my properties. I will declare them in the constructor with a default value, and assign them there for any runtime changes.

``` js
// Properties
// Not reflected
// Array, Date, Object, null
get anArray() {
  return this._anArray.length === 0 ? null : this._anArray;
}

set anArray( value ) {
  this._anArray = value === null ? [] : [... value];
}

get aDate() {
  return this._aDate;
}

set aDate( value ) {
  this._aDate = value === null ? null : new Date( value.getTime() );
}

get anObject() {
  return this._anObject;
}

set anObject( value ) {
  this._anObject = value === null ? null : structuredClone( value );
}    
```

Properties are defined using access methods. When working with them at runtime, they take on the same look at when working with attributes (`label.text = 'Hello world.'`). Regardless of properties or attributes, I force the default to `null` for consistency (with the exception of boolean attributes). I also assign by value, and return by reference by convention across all of my components. These conventions keep everything consistent.

In order to keep the consistency for attributes, and in order to add that syntactic sugar to handle specific data types, we also implement access methods for attributes.

``` js
// Attributes
// Reflected
// Boolean, Float, Integer, String, null
get aBoolean() {
  return this.hasAttribute( 'a-boolean' );
}

set aBoolean( value ) {
  if( value !== null ) {
    if( typeof value === 'boolean' ) {
      value = value.toString();
    }

    if( value === 'false' ) {
      this.removeAttribute( 'a-boolean' );
    } else {
      this.setAttribute( 'a-boolean', '' );
    }
  } else {
    this.removeAttribute( 'a-boolean' );
  }
}

get aFloat() {
  if( this.hasAttribute( 'a-float' ) ) {
    return parseFloat( this.getAttribute( 'a-float' ) );
  }

  return null;
}

set aFloat( value ) {
  if( value !== null ) {
    this.setAttribute( 'a-float', value );
  } else {
    this.removeAttribute( 'a-float' );
  }
}

get anInteger() {
  if( this.hasAttribute( 'an-integer' ) ) {
    return parseInt( this.getAttribute( 'an-integer' ) );
  }

  return null;
}

set anInteger( value ) {
  if( value !== null ) {
    this.setAttribute( 'an-integer', value );
  } else {
    this.removeAttribute( 'an-integer' );
  }
}

get aString() {
  if( this.hasAttribute( 'a-string' ) ) {
    return this.getAttribute( 'a-string' );
  }

  return null;
}

set aString( value ) {
  if( value !== null ) {
    this.setAttribute( 'a-string', value );
  } else {
    this.removeAttribute( 'a-string' );
  }
}        
```

These attribute access methods handle the updates to the attributes themselves (a technique commonly called "attribute reflection"). When the attribute access methods are invoked, they will in turn trigger the `attributeChangedCallback()` method, which will in turn call the `_render()` function to update the internal DOM as necessary.

> Note that the naming convention used in these code snippets is designed to indicate a specific data type. You will want to update/use these snippets to map to your specific API surface. For example, if you have `text` attribute, then you would implement the `aString()` access methods, but name the methods `text()`.

## Next Steps

I will place the entire template below for reference. You can also find it as a [GitHub Gist](https://gist.github.com/krhoyt/c0fbb7ad1fbb1bdf8e808115e6d62487). I have implemented hundreds of components using this approach, and deployed them in production applications such as [Anno Awesome](https://annoawesome.com/) and [Flavor Awesome](https://flavorawesome.com/). If you are looking for more examples, check out my Vanilla JS implementations of [Amazon Cloudscape](https://github.com/krhoyt/Rainforest) and [IBM Carbon](https://github.com/krhoyt/Graphene) for more examples.

``` js
export default class KhTemplate extends HTMLElement {
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

        :host( [a-boolean] ) {
          display: none;
        }
        
        hoyt-component::part( inner ) {
          --component-stylet: var( --my-component-style, #123456 );
        }
      </style>
      <hoyt-component exportparts="inner: outer" part="also-outer"></hoyt-component>
    `;
    
    // Properties
    this._anArray = [];
    this._aDate = null;
    this._anObject = null;
    
    // Consider for mobile
    this._touch = ( 'ontouchstart' in document.documentElement ) ? 'touchstart' : 'click';

    // Events
    this.onComponentClick = this.onComponentClick.bind( this );

    // Root
    this.attachShadow( {mode: 'open'} );
    this.shadowRoot.appendChild( template.content.cloneNode( true ) );

    // Elements
    this.$component = this.shadowRoot.querySelector( 'element-name' );
  }
  
  onComponentClick( evt ) {
    this.dispatchEvent( new CustomEvent( 'kh-event', {
      bubbles: true,
      cancelable: false,
      composed: true,
      detail: {
        'abc': 123
      }
    } ) );
  }

   // When attributes change
  _render() {
    this.$component.aBoolean = this.aInteger === null ? false : true;
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
    this.$component.addEventListener( 'click', this.onComponentClick );
      
    this._upgrade( 'anArray' );      
    this._upgrade( 'aBoolean' );
    this._upgrade( 'aDate' );    
    this._upgrade( 'aFloat' );      
    this._upgrade( 'anInteger' );            
    this._upgrade( 'anObject' );    
    this._upgrade( 'aString' ); 
    
    this._render();
  }
  
  // Set down
  diconnectedCallback() {
    this.$component.removeEventListener( 'click', this.onComponentClick );
  }

  // Watched attributes
  static get observedAttributes() {
    return [
      'a-boolean',
      'a-float',    
      'an-integer',    
      'a-string'
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
  get anArray() {
    return this._anArray.length === 0 ? null : this._anArray;
  }
  
  set anArray( value ) {
    this._anArray = value === null ? [] : [... value];
  }
  
  get aDate() {
    return this._aDate;
  }
  
  set aDate( value ) {
    this._aDate = value === null ? null : new Date( value.getTime() );
  }
  
  get anObject() {
    return this._anObject;
  }
  
  set anObject( value ) {
    this._anObject = value === null ? null : structuredClone( value );
  }    

  // Attributes
  // Reflected
  // Boolean, Float, Integer, String, null
  get aBoolean() {
    return this.hasAttribute( 'a-boolean' );
  }

  set aBoolean( value ) {
    if( value !== null ) {
      if( typeof value === 'boolean' ) {
        value = value.toString();
      }

      if( value === 'false' ) {
        this.removeAttribute( 'a-boolean' );
      } else {
        this.setAttribute( 'a-boolean', '' );
      }
    } else {
      this.removeAttribute( 'a-boolean' );
    }
  }
  
  get aFloat() {
    if( this.hasAttribute( 'a-float' ) ) {
      return parseFloat( this.getAttribute( 'a-float' ) );
    }

    return null;
  }

  set aFloat( value ) {
    if( value !== null ) {
      this.setAttribute( 'a-float', value );
    } else {
      this.removeAttribute( 'a-float' );
    }
  }
  
  get anInteger() {
    if( this.hasAttribute( 'an-integer' ) ) {
      return parseInt( this.getAttribute( 'an-integer' ) );
    }

    return null;
  }

  set anInteger( value ) {
    if( value !== null ) {
      this.setAttribute( 'an-integer', value );
    } else {
      this.removeAttribute( 'an-integer' );
    }
  }
  
  get aString() {
    if( this.hasAttribute( 'a-string' ) ) {
      return this.getAttribute( 'a-string' );
    }

    return null;
  }

  set aString( value ) {
    if( value !== null ) {
      this.setAttribute( 'a-string', value );
    } else {
      this.removeAttribute( 'a-string' );
    }
  }        
}

window.customElements.define( 'kh-template', KhTemplate );
```
