---
feature_image: /img/covers/label.jpg
unsplash_author: personalgraphic.com
unsplash_author_url: https://unsplash.com/@personal_graphic
unsplash_photo_url: https://unsplash.com/photos/a-white-lamp-shade-R_A21r7ZiP4
title: "The Unsung UI Control: Label"
description: A practical walkthrough of building a flexible, design-system-friendly Label Web Component using modern Web Component patterns.
permalink: /blog/2026/01/05/label-component/
tags: 
 - Web
rating: 1
---

Whenever I start designing a new UI, inevitably, one of the first components I create is a `Label` component. You might think that the `Label` is unnecessary because that is what the paragraph element (`p`) does. And you would be partly correct. But then you have likely seen an `Input` element or a `Checkbox` element, and those are HTML native types as well (`input type="text"`, `input type="checkbox"`). Same with `Button`,  `TextArea`, and others.

When you think about wrapper components like `Input`, at a minimum they are adding functionality. In many cases component wrappers around native HTML elements will also be enforcing styling to the design system itself. With that in mind, let us take a look at how I approach building a `Label` component.

> The only design system I have seen do this implicitly is [Amazon Cloudscape](https://cloudscape.design/) with it's [Box](https://cloudscape.design/components/box/) component.

## Foundations

I think Web Components have gotten a bad rap for being especially verbose and/or complex. This can certainly be true when you have data binding in frameworks such as Svelte, but you still need the basics in both - the CSS and the root element. From there it is a matter of extending the `HTMLElement` class, and attaching the template to the DOM of the element.

> This is the Shadow DOM approach. The alternative Light DOM approach also needs the root element and the CSS, though they will appear in different places. This is not an article about which is better. Context is key. For this example however, I will be focused on the Shadow DOM approach.

``` js
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
```

I have included CSS variables for the paragraph element. Each of these set a default value for their respective style property. This is my approach. You might alternatively be inclined to use CSS `:root` in your main CSS file, and define these variables there. 

When I think of a Svelte component, as an example, the styles are included in the same `*.svelte` file. I like that the element and the styles are together, so I keep that approach in my components. I also like my styles to be closer to the component so that I do not have to go looking around to other files. I have also found that when using components, I want to nudge them slightly here or there. I like to do that nudging closer to the declaration to avoid inadvertant cascading.

> Some design systems lock down the styles that can be used to force consistency across a large organization (again, see Amazon Cloudscape). 

The component implementation here includes a `slot` element. Anything placed inside the component declaration will show up there - between the `p` tags. The component is used (at this point) as follows.

``` html
<kh-label>Hello world!</kh-label>
```

## Adding Functionality

For almost every component I implement, I include a `hidden` attribute. The `hidden` attribute already exists in HTML, but when you are building custom elements, you need to decide how (or if) it should be implemented. When I use `hidden`, I want the element to be removed from the DOM. In CSS terms, that is the `display: none` property.

``` js
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

        :host( [hidden] ) {
          display: none;
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
```

In the style block of the component, we use the `:host()` selector to apply styling when a `hidden` attribute is present in the component instance. We can then make the component hidden using:

``` html
<kh-label hidden>Hello world.</kh-label>
```

Easy enough. Another attribute I like to add is `concealed` which toggles the CSS `visibility` property for the times I do not want to remove the element from the DOM, but just make it invisible.

``` css
:host( [concealed] ) {
  visibility: hidden;
}
```

``` html
<kh-label concealed>Hello world.</kh-label>
```

Sometimes you want text to be truncated with an ellipsis (by default in this configuration text will wrap). For this, we can implement a `truncate` attribute, that gets applied to the contained paragraph element.

``` css
:host( [truncate] ) p {
  overflow: hidden;
  text-overflow: ellipsis;  
  white-space: nowrap;
}
```

``` html
<kh-label style="width: 150px;" truncate>Hello world, or some other really long greeting.</kh-label>
```

Nice! Now we are having some fun. Let us keep going.

While you can style the `Label` component using the CSS variables, some design systems may not want to leave the options that wide open. They still recognize that there will be different style choices in different contexts, but they do not want developers departing from the system (prescribed look and feel). A happy middle ground here is to supply attributes that style the element, but do so within a range of fixed possibilities.

Take the font color for example. Design systems will have already decided what the default color will be (usually slightly off-black). What if you want to use the `Label` component in an error situation? You will most likely want to change the font color to some variation of red. In a design system, that variation of red will already have been determined for you. In this fashion, any time an error is presented, across any of the applications using the design system, will show the same color of red. This means that rather than add a `color` attribute that takes any color value, that color reflects usage. It is that usage that is assigned to the `color` attribute - and by extension helps to describe the usage of the component instance in the code.

``` css
:host( [disabled] ) p, :host( [color=disabled] ) p {color: #656871;}
:host( [color=error] ) p {color: #db0000;}
:host( [color=info] ) p {color: #006ce0;}
:host( [color=success] ) p {color: #00802f;}
:host( [color=warning] ) p {color: #855900;}
```

``` html
<kh-label color="error">Hello world.</kh-label>
```

The same approach is often used for font sizing and font-weight.

``` css
:host( [size='body-xs'] ) p {font-size: 12px; line-height: 16px;}
:host( [size='body-sm'] ) p {font-size: 14px; line-height: 20px;}
:host( [size='heading-xs'] ) p {font-size: 16px; line-height: 20px;}
:host( [size='heading-sm'] ) p {font-size: 18px; line-height: 22px;}

:host( [weight=light] ) p {font-weight: 300;}
:host( [weight=bold] ) p {font-weight: 700;}
```

``` html
<kh-label color="error" size="body-xs" weight="bold">Hello world.</kh-label>
```

This is where having a `Label` component in your design system really starts to shine as compared to using a paragraph element. The API of the component can inform developers of the expected usage, while at the same time ensuring consistency. Think of the 200+ products offerred by Amazon Web Services. Each has it's own team of developers. Each has it's own UX/UI needs. Yet (like them or not) they all look the same.

## Extending Functionality

Up to this point we have been adding attributes and applying corresponding styles all with CSS - no additional JavaScript code needed. With this approach, if you want an attribute to be updated dynamically, you would have to use the `setAttribute()` method.

``` js
const label = document.querySelector( 'kh-label' );
label.setAttribute( 'weight', 'bold' );

// Or to remove
label.removeAttribute( 'weight' );
```

If you directly set `label.weight = 'bold'`, then no changes to the label will appear to take place. There is work being done - a property called `weight` is being set on the `Label` instance. Just like any JavaScript object, you can apply random properties all you want. They will not do anything, but you can apply them.

To get at the root cause of this behavior, we have to think a little more critically about what it is that we are trying to accomplish with the use of `label.weight = 'bold'`. What we really want to happen is for the attribute `weight` to be added to the component instance, and the value of `bold` to be assigned to that attribute. This will in turn trigger the CSS styles.

> Note the distinction here between setting a property and setting an attribute. 

When we want a Web Component property and attribute to have the same behavior, that is called reflection. To get basic reflection, we add access methods (get/set) to the component, and have those methods update the attributes accordingly.

``` js
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
```

It is not as slick as data binding with a Svelte rune, but it also does not add much complexity. One set of access methods per reflected property. You can also add a bit of syntactic sugar in these accessors to handle primitive types more gracefully.

``` js
// Boolean
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

// Float
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

// Integer
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
```

These also have the nice side effect of presenting a `null` value when the attribute/property is not set.

Web Component attributes cannot be complex objects, but that does not mean that properties cannot. If you want to handle a `Date` object for example, you can add access methods. The implementation of those methods will change the internal state, and update the component.

``` js
get aDate() {
  return this._aDate;
}

set aDate( value ) {
  this._aDate = value === null ? null : new Date( value.getTime() );
}
```

For now though, let us get back to our label. 

Web Components having slots is important for composition of content - just as most HTML elements can contain other markup. In the case of a `Label` the content might be a long form description. An actual paragraph would be hard to read as an attribute. There are times however when the content you want the label to display is relatively short - most application labels come to mind. 

If you are inclined to add an access method for a `text` attribute, then you are on the right path. 

We also need to observe the changes to that attribute using the Web Components API, and apply changes where we want. In the case of the paragraph element, that looks something like:

``` js
static get observedAttributes() {
  return [
    'text'
  ];
}

attributeChangedCallback( name, old, value ) {
  switch( name ) {
    case 'text':
      this.$label.textContent = value === null ? '' : value;        
      break;
  }
} 
```

You have to be careful here, though. If `this.$label` points to the `p` element, setting the `textContent` will remove the `slot` element. While that works, it is not particularly friendly. We want to allow developers to use `text` as an attribute and a property, but also compose the content should they so desire. 

What I like to do here is put a `span` inside the `p`, and have `this.$label` point to the `span`. If you want things really tidy, you can even add a splash more CSS to hide the `span` if there is no `text` property.

``` css
:host( :not( [text] ) ) span {display: none;}
```

Okay, but what does all of this have to do with a `Label` component in a design system? 

If I set the `text` property, I treat that as a signal that the component will be updated dynamically at runtime. If the text content is composed (inside the component markup), then that is a signal that the content will not change at runtime.

``` html
<!-- Will not change -->
<kh-label>Hello world.</kh-label>

<!-- Will change at runtime -->
<kh-label text="Hello world."></kh-label>
```
This becomes manifest in the code as well. I am never thinking "Should I be using `textContent` here?" Programmatically, it is always `label.text`.

``` js
const label = document.querySelector( 'kh-label' );
label.text = 'Hello, Kevin.';
```

I use this pattern throughout my components. I lean on composability where possible, but if an element is going to change at runtime, I provide a means to use a property (without damaging slotted content if I can help it). With a `Button` component as an example, I provide a `label` property that can be set dynamically at runtime. If I am reading the markup, and the `Button` component has text content between the opening and closing tags, then the label of that button will not be changing at runtime. When I am updating the label of a button at runtime, I always use `Button.label`.

## Next Steps

Where this really starts to get interesting is in more complex controls such as a list. Differentiating a `Button` from a `Link` and presenting an anchor element in place of the button element when an `href` attribute is present is another fun example. I will cover these in future posts. Until then, feel free to check out my complete Web Component template on [GitHub](https://gist.github.com/krhoyt/c0fbb7ad1fbb1bdf8e808115e6d62487).
