---
feature_image: /img/covers/colored.tabs.jpg
unsplash_author: Chiara F
unsplash_author_url: https://unsplash.com/@quasichiara
unsplash_photo_url: https://unsplash.com/photos/MI8He1NWPWg
title: The Secret Life of Tabs
description: As user interfaces (UI) go, tabs are a particularly useful pattern. In this example we will look at the mechanics of building a tab component using Stencil.
permalink: /blog/2021/07/07/the-secret-life-of-tabs/
tags:
  - Web
  - App Dev
rating: 1
---

As user interfaces (UI) go, tabs are a particularly useful pattern. The word "tab" invokes images of beige manila file folders. Early UI mimicked this physical property by placing buttons along the top of a dedicated space. Mobile devices, with their confined spaces, finds the tab pattern in accordions, bottom button bars, and more.

In this example we will look at the mechanics of building a tab component using [Stencil](https://stenciljs.com/).

### Composition

Let us talk for a moment about composition. How does a component magically grow a tab? In Web Components parlance, composition refers to the idea that a component can have other HTML elements, including components, inside of the opening and closing tags. What the parent component does with that content is up to it.

``` html
<ionx-tabs>
  <p>Content 1</p>
  <p>Content 2</p>
  <p>Content 3</p>
</ionx-tabs>
```

Given the above HTML snippet, in the case of a tab component, we would expect to have something like three buttons, each controlling the visibility of one child element at a time. Believe it or not, there is almost enough information here to make that happen. The only piece of information missing is what to label the buttons.

### Data Attributes

One of the great features of HTML is how extensible it can be. One of the ways that HTML accomplishes this is through the use of data attributes. Data attributes have this name because you can use the word "data" followed by a hyphen, and then whatever word you want to use. As an attribute, like many other defined HTML element attributes, a data attribute can also be assigned a value.

``` html
<ionx-tabs>
  <p data-label="One">Content 1</p>
  <p data-label="Two">Content 2</p>
  <p data-label="Three">Content 3</p>    
</ionx-tabs>
```

> A data attribute does not have to be assigned a value, in which case, it will be treated as a `boolean` value. CSS can also be applied using the CSS attribute selector such as `input[type=text] { ... }`. We will circle back to both of these concepts later in this example.

To work with data attributes from JavaScript, we have a few functions at our disposal. If the data attribute contains a value, we can use `getAttribute()` to get that value. Conversely, we can use `setAttribute()` to set that value. If we do not want the data attribute to be present, we can use `removeAttribute()`. In the case of a `boolean` value, we want to check if the attribute is present (true) or not (false). For this we can use `hasAttribute()`.

From a markup perspective, this is enough to generate, and label, the buttons that control the visible content. 

### What Is A Tab?

In the above markup, we are considering any child element to be representative of a piece of content whose visibility is controlled by a button, which is called a "tab" by convention. We have already decided that a tab has a label, but there are other properties to consider as well.

The first additional property would be if the tab is selected or not. This is important not only internally, to hide content that is not selected, but also for the purposes of styling. A selected tab should have a different appearance than a tab that is not selected. 

A selected tab should also look different from a disabled tab... Disabled... There is another property! Depending on the state of the application using the tabs, we may also want to disable specific tabs. 

``` ts
export default class Tab {
  disabled: boolean = false;
  label: string;
  selected: boolean;

  constructor( 
    label: string, 
    selected: boolean = false, 
    disabled: boolean = false
  ) {
    this.label = label;
    this.selected = selected;
    this.disabled = disabled;
  }
}
```

Closely related to disabled is visibility, which we can consider another property of a tab. Your tabs might have icons, which could be considered another property of the tab. Maybe you want the ability to "pin" tabs. Whatever properties you find relevant to your tab implementation, bundle them up into a class. This class will allow us to refer logically to each tab and its related properties.

### Component Properties

Now we have a good grasp on the markup that should represent our tab component, and we even have a logical representation of the individual tabs. Now we will turn to the implementation itself, starting with the component properties.

In order to get access to the child elements (composed content), we will need a reference to the web component element itself. This is called the "host element" in Stencil. From a web component standards perspective `this` is the same as the host element. To get a reference to this host element in Stencil, the `@Element()` decorator is used. You can name the property whatever you want, but convention is "host".

``` ts
@Element() host: HTMLElement;
```

We will also want the component to keep track of the state of the tabs, which means an `Array` of `Tabs`.

``` ts
@State() tabs: Array<Tab> = [];
```

> From an object-oriented programming perspective `tabs` is a property of the component class. From a component perspective, it represents the state of the tabs, and is decorated appropriately. This is not to be confused with the properties decorated with `@Prop()`. These are properties, too, but are decorated to control how the component manifests itself to the developer.

Our component will also need to keep track of the selected tab. To keep things easy, we can use a zero-based index to represent selection.

``` ts
@Prop( {mutable: true, reflected: true} ) selectedIndex: number = 0;
```

The selected index will change when a tab is clicked. When a component modifies one of its properties directly, it must be marked as `mutable`. We will also want to let the developer programmatically control the selected tab, as well as determine which tab is selected. Both of these purposes are served by marking a property as `reflected`.

### Slots

Inside of a web component template, the `slot` tag allows us to specify where child content should go within the context of the overall layout of the component itself. If you need to specify more than one designated area for child content, you can name the slots, and then use those names on the child elements. If you choose not to have a `slot` tag at all, then the child content will not be shown.

``` html
<!-- In a component template -->
<button>My Button</button>
<slot name="label"></slot>
<div>
  <slot name="content"></slot>
</div>

<!-- In your HTML -->
<my-component>
  <p slot="label">My Label</p>
  <img slot="content" src="/img/stencil.svg" />
</my-component>
```

### Slot Change

When the elements inside of a web component slot are changed, the component emits an internal `slotchange` event. Capturing this event allows a web component to take any special actions it needs to address the change. In the case of a tab control, we can leverage this event to know the component needs to evaluate the child content, and may in turn need to update the buttons representing the tabs.

### Template

Within the tab component template, we need two distinct areas - one to hold the buttons which represent the tabs themselves, and one to hold the desired content to be rendered.

``` ts
render() {
  return ( [
    <div>
      {this.tabs.map( ( tab: Tab, index: number ) =>
        <button
          onClick={() => this.selectedIndex = index}
          {... {
            'data-selected': tab.selected,
            'disabled': tab.disabled
          }}
          title={tab.label}>
          {tab.label}
        </button>
      ) }
    </div>,
    <div>
      <slot onSlotchange={() => this.doSlotChange()}></slot>
    </div>        
  ] );
}
``` 

When a tab button is clicked, the index of the selected button is assigned to the `selectedIndex` property. This will invoke a render. True to form, and in sticking with the data attributes, if a tab is selected, it will have the `data-selected` attribute. This is then picked up in the CSS to style the button accordingly. The same is true for any disabled tab, in which case the button gets a `disabled` attribute.

``` css
button[data-selected] {
  background-color: #f4f4f4;
  border-left: solid 1px transparent;
  border-top: solid 2px #0f62fe;
  color: #161616;
  font-weight: 600;
}

button[disabled] {
  background-color: #c6c6c6;
  color: #8d8d8d;
  cursor: not-allowed;
}
```

As for the `div` holding the content (via a `slot`), when the `slotchange` event is fired, the `doSlotChange()` handler is called. The `doSlotChange()` handler evaluates the child elements, and populates the `tabs` property accordingly. When the `tabs` property is changed, a render is invoked.

``` ts
doSlotChange() {
  this.tabs = [];

  for( let c: number = 0; c < this.host.children.length; c++ ) {
    const label: string = this.host.children[c].getAttribute( 'data-label' );
    const selected: boolean = this.selectedIndex === c ? true : false;
    const disabled: boolean = this.host.children[c].hasAttribute( 'data-disabled' );
    this.tabs.push( new Tab( label, selected, disabled ) );      
  }
}
```

### Render

Up to this point we have put a lot of focus on the buttons that represent the tabs of our component. We still have one last concern - the visibility of the content within our tab component. We want to make sure that the visible content stays in sync with the buttons that control that visibility. The best place to do this is a quick check in the `componentWillRender()` lifecycle function.

``` ts
componentWillRender() {
  for( let t: number = 0; t < this.tabs.length; t++ ) {
    if( t === this.selectedIndex ) {
      this.host.children[t].setAttribute( 'data-selected', '' );
      this.tabs[t].selected = true;
    } else {
      this.host.children[t].removeAttribute( 'data-selected' );
      this.tabs[t].selected = false;
    }
  }
}
```

It might seem odd that assigning or removing a `data-selected` attribute on the children elements is what controls their visibility. This happens because within the context of web components, CSS has the `::slotted()` selector which allows you to target specific elements within a `slot`. In this case, any child element that does not have the `data-selected` attribute is hidden.

``` css
::slotted( :not( [data-selected] ) ) {
  display: none;
}
```

And with that, our tab component is complete! 🎉

The component itself is not that complex, but it does involve taking into account just about every aspect of building web components. You need to understand composable content, how that translates into slots inside of components, and then how that can be managed in CSS. You need to understand the lifecycle of a web component with `slotchange` and `componentWillRender()`. And you need to understand how we can extend HTML using data attributes, and they can be used in CSS. And now? You do!

### ✋ But What About ... 

**Unordered List**

I display the tab buttons as `button` elements inside of a `div` container element. Since the tabs represent a list of options, the `ul` element may seem like a better fit. If you had no other function in your tabs save to label content, then the `ul` element would certainly be a good choice.

In this case, I am taking advantage of a special behavior of the `button` element in that it already has a `disabled` attribute. When the `disabled` attribute is present, the button does not emit a click event. Using the `button` element means I do not have to write additional code to manage the event listener.

You might then in turn suggest putting a `button` element inside the `li` element as part of a `ul` element. At this point I would suggest we are splitting semantic hairs on content that is hidden in the shadow DOM in the first place.

**Logical Tabs**

In this example, we used a `Tab` class to hold the properties that are related to what a tab should represent. If I were using plain JavaScript, and not TypeScript, then I would not even bother making the class in the first place, and just keep an `Array` of `Object`.

However, a case can be made for going the other way as well - formalizing a `Tab` component, perhaps using it as the container. 

``` html
<my-tabs>
  <my-tab label="One">
    <p>Content 1</p>
  </my-tab>
  <my-tab label="Two">
    <p>Content 2</p>
  </my-tab>
  <my-tab label="Three" disabled>
    <p>Content 3</p>
  </my-tab>    
</my-tabs>
```

[Ionic Framework](https://ionicframework.com/docs/api/tabs) takes this approach. In fact, because of the myriad situations in which a truly generic tab component may be used, Ionic Framework actually breaks the structure down even further. 

This is good for Ionic Framework, but this example is not teaching how to use Ionic Framework tabs. Rather this example is about how to implement the baseline tab UI pattern for your own components. For this reason, I kept this example as spartan as possible.

### Next Steps

Now that you have an understanding of all the moving parts of this pattern, maybe you will want to layer in some abstractions of your own. Maybe you will go the declarative route and add in specific components for the tab buttons. Or perhaps you might decide to allow the developer to specify a renderer to use for those buttons. Maybe you will add animation between the tab contents. Maybe you will implement an accordion rather than tabs. 

Once you get the hang of the pattern, you will find uses for it in many places. The complete code for this example is in [GitHub](https://github.com/krhoyt/Ionic/tree/master/tabs), and there is a [live demo](http://temp.kevinhoyt.com/ionic/tabs/) you can view as well.
