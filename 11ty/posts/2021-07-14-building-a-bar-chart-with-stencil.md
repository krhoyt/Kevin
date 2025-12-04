---
feature_image: /img/covers/light.bars.jpg
unsplash_author: Gavin Biesheuvel
unsplash_author_url: https://unsplash.com/@gavinbiesheuvel
unsplash_photo_url: https://unsplash.com/photos/KfzZYS51x20
title: Building a Bar Chart with Stencil
description: Every once in a while you need to roll your own. With a splash of SVG and helping hand from Stencil, you can create a custom chart as a web component.
permalink: /blog/2021/07/14/building-a-bar-chart-with-stencil/
tags:
  - Web
  - Data
rating: 99
---

There are a number of very robust charting libraries on the market. Some are commercial. Some are free. You should use them. Every once in a while though, you need to roll your own. Not to worry! With a splash of SVG and helping hand from Stencil, you can create a chart as a web component for all to use.

### The Array of Data

Most charting libraries can get pretty complex. Most of that has to do with abstracting how data is represented. Those abstractions are what make the library so useful in so many cases. In this case however, we are not building a library for all the cases, we are building a bar chart to meet our specific case. This can simplify our work dramatically.

According to Wikipedia, in a bar chart "One axis of the chart shows the specific categories being compared, and the other axis represents a measured value." According to me, a bar chart is an array of numbers. Let us start there, with some SVG and an array of numbers.

``` jsx
import { Component, h, Prop } from '@stencil/core';

@Component( {
  tag: 'ionx-chart',
  styleUrl: 'chart.css',
  shadow: true
} )
export class Chart {
  render() {
    return (
      <svg width="320" height="240"></svg>
    );
  }

  // Values to use in the chart
  @Prop() data: Array<number> = [];  
}
```

Each `number` in the `Array` is going to take up the same amount of space along one of the axes. For this example, we will use the horizontal axis. The horizontal axis is `320` pixels across. If we get ten (10) values in the `Array`, each bar will take up `32` pixels.

### The Maximum Ratio

Believe it or not, we are almost there. The last piece of information we need to know before we can render the chart, is the largest (maximum) value (number) in the `Array`. We need to know the maximum because we are looking to establish a ratio. We want the maximum value in the `Array` to equal the available number of pixels we have along the vertical axis.

``` ts
private ratio: number = 1;
```

For example, if the values in the array are all larger than the `240` pixels we have along the vertical axis, how do we render the bar? Let us say the maximum value in the `Array` is `1,000`. The available space we have `240` divided by the maximum value of `1,000` gives us a ratio of `240:1,000` or `0.24`. Now we can multiply any `number` in the `Array` by `0.24`, and we will know the height of the bar **and** that bar will fit in our viewable area.

> Do not believe me? Let us say that the next `number` in the `Array` is `500`. The value of `500` is half of `1,000`. If `1,000` equals all our vertical pixels (`240`),  then `500` should equal half our vertical pixels, or `120`. Ready for this? `500 * 0.24 = 120`

### The Will Render

Before we render the `data` we will need a place to figure out that maximum value and corresponding ratio. The best place for that from a Stencil perspective is in `componentWillRender()`, which is called before each render.

``` ts
componentWillRender() {
  let maximum: number = 0;
  
  // Find the largest value
  for( let d: number = 0; d < this.data.length; d++ )
    maximum = Math.max( maximum, this.data[d] );
  
  // Round up to nearest whole number
  // Assign the ratio
  maximum.= Math.ceil( maximum );
  this.ratio = 240 / maximum;
}
```

It should become pretty clear, pretty quickly, that the limiting factor of our chart, and indeed any chart, is the amount of data to render. Not because rendering takes a long time, but because figuring out the edges of our data does. This is why supercomputers have to be used for weather maps, when all you see is some colored splotches.

A bar chart however, is not a weather map. We can do all this processing (and a considerable amount more) right here in the browser.

### The Render

Now we have all the pertinent pieces of information, we need to put those bars on the screen! A bar in SVG is a `rect`. The `rect` needs to know where it is positioned (`x`, `y`)  and its dimensions (`width`, `height`). 

The `height` we already know will be the value (number) in this iteration of the `data` multiplied by the `ratio` we calculated earlier. We also talked about how the `width` of each bar is the amount of space we have along the horizontal axis (`320`) divided by the number of values in the `data`. We do not know how many values that will be, so we calculate it inline.

The `x` position is almost identical, except we multiply the `width` by the `index` of the iteration. If the `width` is `50` pixels, the first iteration (`index === 0`) will result in `x` being zero (0). Yes, please! The next iteration (`index === 1`) multiplied by a `width` of `50` places `x` at `50`. Exactly!

``` jsx
render() {
  return (
    <svg width="320" height="240">
      {this.data.map( ( value: number, index: number ) =>
        <rect 
          fill={`rgb( 
            ${Math.floor( Math.random() * 255)}, 
            ${Math.floor( Math.random() * 255)},
            ${Math.floor( Math.random() * 255)} 
          )`}
          x={( 320 / this.data.length )  * index}
          y={240 - ( value * this.ratio )}
          width={320 / this.data.length}
          height={value * this.ratio} />
      ) }
    </svg>
  );
}
```

The only one that is a little tricky in SVG-land is the `y` position. When we think of the Web, we generally think of the top-left of the screen as being (`0, 0`) on the coordinate system.  In the case of SVG however (`0, 0`) is at the bottom left. 

This means that if we placed `y` at `240` and then said the `height` of the `rect` was `100`, the resulting `rect` would actually be drawn off the SVG viewport (from `240` to `340`). In order to offset this, we subtract the calculated `height` using our `ratio`, from the `height` of the viewable area of the SVG.

In order to see each bar, the `fill` is a randomly generated CSS `rgb()` value. This kind of begs the question "Maybe the bar should be abstracted into a class that includes fill color?" Yup! And congratulations on coming full circle - that is exactly what the charting libraries do; abstract all the things. How far you go with it is up to you.

### ✋ But What About ... 

There are two examples included in the running [demonstration](http://temp.kevinhoyt.com/ionic/chart/), and the GitHub [repository](https://github.com/krhoyt/Ionic/tree/master/chart). One example is the chart that we have just created. The other example is a chart that includes many of the typical considerations you might find in a chart. 

- Chart title
- Axis labels
- Value labels
- Dynamic fill
- Rounded corners
- Flexible sizing
- CSS properties

The code is not abstracted to the point of a library, but it should give you a starting place to consider more sophisticated rendering situations for your own chart component.

### Next Steps

All of these options definitely add complexity to the math and rendering, but it all follows the same pattern. First, figure out the structure of the data. Second, figure out the edges of the data. Third, consider any information you might need to calculate for layout. Finally, iterate over the data to render your output. 

Now the next time you need a custom chart, you will know where to start - with Stencil and web components.

