---
feature_image: /img/covers/paper.list.jpg
unsplash_author: Glenn Carstens-Peters
unsplash_author_url: https://unsplash.com/@glenncarstenspeters
unsplash_photo_url: https://unsplash.com/photos/RLw-UC03Gwc
title: Items and Renderers
description: Consider for a moment the humble list control. In this article we take a closer look at building a list control, and the different ways to render content.
permalink: /2021/07/20/items-and-renderers/
tags:
  - components
  - stencil  
  - web
  - posts
---

Consider for a moment the humble list control. It is everywhere. From the social media feed you check in the morning, to your email inbox on the train to work, to the search results for that old western movie you wanted to stream tonight. The pattern of the list control is instantly recognizable, yet it can have so many variations of what it displays. 

In this article we will take a closer look at building a list component and the different ways we can render content.

### The Humble List

The basic list control has three parts. The first is the data to render. This usually takes the form of an array. The second is a place to display that data; usually in the form of a rectangular space on the screen that can be scrolled. The third piece what form that data will take when presented to the person using the application.

``` jsx
export class List {
  render() {
    return (
      <div>
        {this.data.map( ( value: string ) =>
          <p>{value}</p>
        )}
      </div>
    );
  }

  @Prop() data: Array<string> = [];
}
```
In the example above, the data is an array of string values. The display area is a `div` (content division) tag with a CSS `overflow` property set to `auto` or setting that allows for scrolling. The string values are rendered as individual `p` (paragraph) tags, which can be styled in whatever manner you like.

> In terms of web components, I like to think of the paragraph tag as a "label" component. 

### Inline Items

This is all good for an array of strings, but what happens when our data is more complex? Take for example your email inbox. Depending on the state of a message, there are a number of pieces of information displayed to us in a single glance - who the message is from, the subject, perhaps a snippet of the content, the date it was sent, etc.

An array of strings is not going to hold the data we need. In this case we will use an array of objects. If you are particularly object-oriented, it might be an array of `Email` instances, but let us keep with `object` for now so we can focus on the nuances of the behavior.

When it comes to rendering your list of email messages, you may be initially inclined to update your markup so that you have a place to display all the various pieces of information.

``` jsx
export class List {
  render() {
    return (
      <div>
        {this.data.map( ( value: object ) =>
          <p class="avatar">{this.initialsFormat( value['from'] )}</p>,
          <div>
            <div class="one">
              <p class="from">{value['from']}</p>
              <p class="date">
                {this.dateFormat( new Date( value['date'] ) )}
              </p>
            </div>
            <p class="subject">{value['subject']}</p>
            <p class="content">{value['content']}</p>
          </div>
        )}
      </div>
    );
  }

  @Prop() data: Array<object> = [];
}
```

This is a perfectly acceptable approach, if perhaps a little unwieldy. We could however clean up the markup a bit, by putting it into its own component.

``` jsx
export class List {
  render() {
    return (
      <div>
        {this.data.map( ( value: object ) =>
          <ionx-email-item value={value}></ionx-email-item>
        )}
      </div>
    );
  }

  @Prop() data: Array<object> = [];
}
```

Again, keep in mind that if you are more inclined to use strict data types, the attribute on the `ionx-email-item` tag would likely be `email` and it would accept an instance of an `Email` class. Effectively, wherever you see `object` in the above code, would be `Email`.

### Item Renderer

The thing about `object` though, is that it can be whatever you want it to be. This can help us think about our list component in new ways.

You see, what we have created here is not so much a list component, but rather an email-list component. When you think of the content division (`div`) tag or that paragraph (`p`) tag, they can be used in myriad of ways. This list component can only be used to display email.

In order to make our list into a generic list - a list that can list rows of a variety of items - we need to think about abstracting the content that gets rendered. To account for this, we can add a property that lets the developer using our component specify what tag should be used to render the data.

``` jsx
export class List {
  render() {
    const Tag = `${this.itemRenderer === undefined ? 'ionx-label-item' : this.itemRenderer}`

    return (
      <div>
        {this.data.map( ( value: object ) =>
          <Tag value={value}></Tag>
        )}
      </div>
    );
  }

  @Prop( {reflect: true} ) itemRenderer: string;
  @Prop() data: Array<object> = [];
}
``` 

`Tag` is special in JSX, and yes, it must be an uppercase `T`. The `Tag` variable gets assigned to it a string representing a tag to be used in the render. Then inside the render, wherever you might use `p` or `div` you use `Tag`.  Now, the tag that will be rendered is whatever tag name is supplied to the `itemRenderer` property.

``` html
<ionx-list item-renderer="ionx-email-item"></ionx-list>
```

> While this example uses the `Tag` feature of JSX in a list, the approach is useful wherever you do not know what tag the component will be rendering. For example, I have used `Tag` in dynamic forms that vary based on location.

What you have now is a truly generic list component. This approach does come with a couple caveats.

**Object**

The first and most notable side effect of this approach is that it really likes `object`. It almost relies on the typeless nature of JavaScript. With this comes potential challenges in debugging and maintenance.

**Label Item**

While the `itemRenderer` can be specified from outside of our implementation, we should not assume a value will be provided. In that instance we might be inclined to fall back to a `p` tag. 

The problem with using a `p` tag is that we have an array of object instances. When you render something declared as an object, as a string, the `Object.toString()` method is called, and you get something like `[Object]` displayed.

In order to address this problem, a default item renderer component must be created. In the above example, if no `itemRenderer` is defined, then `ionx-label-item` will be used as the tag. The `ionx-label-item` component is really just a `p` tag, where the `value` property is declared as a `string`.

``` jsx
export class LabelItem {
  render() {
    return (
      <p>{this.value}</p>
    );
  }

  @Prop() value: string;
}
```

While it is not a substantial amount of work to create this "label" component, it is more work, and an additional step to remember. 

We can now pass an array of objects to our list, or an array of strings depending on if we have provided an item renderer. 

Here is an example without an item renderer...

``` html
<ionx-list></ionx-list>
```

``` js
const list = document.querySelector( 'ionx-list' );
list.data = ['Stencil', 'Appflow'];
```

Here is an example that specifies an item renderer for a product list...

``` html
<ionx-list item-renderer="ionx-product-item"></ionx-list>
```

``` js
const list = document.querySelector( 'ionx-list' );
list.data = [{
  company: 'Ionic',
  product: 'Stencil'
}, {
  company: 'Ionic',
  product: 'Appflow'
}];
```

### Next Steps

The validity of this approach could be argued within the context of a list component. Is this too much overhead work just to abstract how the list displays its contents? Maybe. Knowing how to create dynamic tags in JSX however, comes in pretty handy once you know it exists.

I have already mentioned how I have used this approach before on dynamic form content. Another area where I have used it is in a "table" component where the columns - and how they are to be displayed - are defined by the developer using the component [in the markup].

The next time you look at a list, you will never think of it the same way. If you want to look at the complete code for this example, it is available on GitHub. There is also a [live demonstration](http://temp.kevinhoyt.com/ionic/list/) of the list component in action.
