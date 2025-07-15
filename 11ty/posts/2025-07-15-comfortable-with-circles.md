---
feature_image: /img/covers/circles.jpg
unsplash_author: Luís Eusébio
unsplash_author_url: https://unsplash.com/@lceusebio
unsplash_photo_url: https://unsplash.com/photos/man-stainding-on-black-concrete-floor-casting-shadow-5SUt9q8jQrQ
title: Getting Comfortable with Circles
description: In this post, we put aside the charting libraries, dive into some circle math, and discover that building lightweight custom charts is easier than you think.
permalink: /2025/07/15/comfort-w-circles/
tags:
  - visualization
  - tutorial
  - posts
---

When is the last time you installed a module or library because you thought the task was too hard (or time consuming) to tackle yourself? On the front end, this scenario can quickly lead to a resulting application that is considerably larger than it needs to be. You might be surprised to discover that some of the tasks that you might think of as hard, such as charts, animation, and date handling, can actually be pretty straightforward - and have a big impact on the size and performance of your application.

> This post is the first in a series that delves into some of those areas that cause most developers to reach for a third-party library.

Take for example the humble circle. Sure, you took trigonometry at some point in the past, but who remembers the implications of all those sine, cosine, tangent, and hypotenuse calculations? I mean, where in my brain am I going to put the Marvel Cinematic Universe story arcs if I do not make some space up there? And then along comes a radar chart. 

![Radar chart](/img/assets/radar.jpg)

Over the course of the rest of this post, we will tackle building this radar chart from scratch. Along the way you will pick up a handful of lines of math that make it all possible; opening the door to building your own custom charts that are light-weight and blazing fast.

## Radar Chart Deconstructed

Before we jump into the code, let us take a moment to look at the radar chart above. Calm down. Center yourself. What are the parts that make up the chart? There are clearly some labels around the outside of the chart. The chart itself is a circle, which means a specific radius. This chart has nested circles. There are five circles in total, and five labels (though the number of circles and labels are unrelated). It also looks like there are two datasets being plotted, each with a different color.

That is where we will start.

``` js
const COLORS = ['#1f78b4', '#46a040'];
const LABELS = [
  'Power tools', 
  'Electrical supplies', 
  'Plumbing items', 
  'Garden tools', 
  'Plants'
];
const LEVELS = 5;    
const RADIUS = 150;
const STEPS = RADIUS / LEVELS;
const SVGNS = 'http://www.w3.org/2000/svg';    

const data = [
  [900, 900, 500, 900, 900],
  [600, 600, 650, 500, 600]
];

// Find maximum value
let maximum = 0;
for( let d = 0; d < data.length; d++ ) {
  for( let v = 0; v < data[d].length; v++ ) {
    maximum = data[d][v] > maximum ? data[d][v] : maximum;
  }
}

// SVG elements
const svg = document.querySelector( 'svg' );
const chart = document.querySelector( 'g' );
```

I have manually extrapolated the data represented in the chart - an `Array` with one `Array` each for the data being plotted. Each of those `Array` have five data points. There are five elements in the `Array` because there are five labels, not because there are five circles. I have also found the maximum value in the dataset. Sometimes you may also need to find the minimum, but it is clear from the picture that zero is the minimum in this case. 

You might have also noticed the `SVGNS` variable with a URL as the value. We will be using SVG to render our chart, and some SVG DOM operations require the SVG namespace, so this variable is there simply for brevity.

``` html
<svg width="300" height="300">
  <g></g>
</svg>
```

The SVG element gets a default size in the DOM, and we will be playing with that a little later. For now, I set a `width` and `height` of `300` just to give us some space while we are working. The `g` or "group" element is what will hold all the elements we generate to create our chart. The group element is your friend when working with SVG. It opens the door for more targetted transformations, which again, we will get to later. While we are here, the last two lines of the JavaScript code snippet above, grabs references to each of the two main SVG element from the DOM. We will use these both pretty extensively moving forward.

## Circles Everywhere

Now that we have a good description of our radar chart, let us get to the drawing. We will start with those five nested circles.

``` js
// Circles
for( let c = 1; c <= LEVELS; c++ ) {
  const circle = document.createElementNS( SVGNS, 'circle' );
  circle.setAttributeNS( null, 'r', steps * c );
  chart.appendChild( circle );
}
```

The `for` loop here is setup to start at one, and then iterate five times (`LEVELS === 5`). Why not set the iterator to zero, and then go until `c < LEVELS` like most loops? That would give us five circles, but the first circle would have a radius of zero. The result would appear to be only four circles. We want five circles, with the zero radius circle at the center implied. That means we need to shift our loop by one.

You will notice that we are not worrying about the positioning of the circles. We create the circles and put them into the DOM. The default center will be zero on both the X and Y axes. This is the top-left corner of the SVG element, and makes the math easier moving forward. 

## The View Box

If you run this code now, you will see only the bottom-right quadrant of the circles. We could calculate the center position, and set the coordinates of the circles, but SVG offers us a way to independantly control what part of the SVG content is visible. This parameter is called `viewBox` and is set on the SVG element itself.

``` html
<svg width="300" height="300" viewBox="-150 -150 300 300">
  <g></g>
</svg>
```

The outside circle has a radius of 150 pixels. That is a diameter of 300 pixels. If the center of the circle is at `0, 0` then 150 pixels of that circle are off the view of the SVG element, effectively placing the left-most pixel at -150 pixels. We can tell the SVG element about this with `viewBox`. The `viewBox` attribute takes four arguments - the left, top, width, and height of the viewport we would like to designate. By telling the `viewBox` that the left and top are -150, and that there is a width and height of 300, then we will see the full set of circles, not just the bottom-right quadrant.

> In advanced manipulations of `viewBox` you may need to calculate ratios of the content to be displayed relative to the dimensions of the SVG element itself. This is beyond the scope of this tutorial, but I will pick it up in a future post.

## Radians and Degrees

The five spokes on the radar chart are set at an equal number of degrees apart. There are fives spokes (one for each label). Each spoke starts at 0, 0 and goes to a point on the outer circle some number of degrees separated from the previous spoke. We need to know what the X and Y coordinates are for those points. Okay, here comes the circle math. 

``` js
// Radians
function degreesToRadians( degrees ) {
  return degrees * Math.PI / 180;
}
```

Degrees make sense to you and I. For example, we can think of 360 degrees in a circle. The trigonometric functions we will work with do not want degrees as an argument, they want radians. Why radians? What exactly is a radian? In drawing circles and lines, we do not really care. Sure, there is a perfectly reasonable maths explaination, but we do not care. All we care about is that we convert our degrees to the radian unit desired when working with these functions.

``` js
// Spokes
for( let s = 0; s < LABELS.length; s++ ) {
  const angle = degreesToRadians( ( ( 360 / LABELS.length ) * s ) - 90 );
  const x = RADIUS * Math.cos( angle );
  const y = RADIUS * Math.sin( angle );

  const path = document.createElementNS( SVGNS, 'path' );
  path.classList.add( 'spoke' );
  path.setAttributeNS( null, 'd', `M 0 0 L ${x} ${y}` );
  chart.appendChild( path );
}
```

Now for each of the labels we will draw a "spoke". The angle of that spoke is based on the index of the iteration. To get the X-coordinate we use `Math.cos( angle )` of the angle we are interested in getting. We multiply by the `RADIUS` of the outer circle to project out along that angle to the point where the line will intercept the circle. To get the Y-coordinate we do the same thing, but use `Math.sin( angle )`.

That is it. That is all the circle math you need to know - use radians, `Math.cos()` is the X-coordinate, and `Math.sin()` is the Y-coordinate. If you have those three rules in your head, you can have all kinds of fun with circle math.

In SVG, a spoke will be represented as a `path` element. The `path` element takes a series of numbers and letters that indicate a description (`d` attribute) of what is to be drawn. You can go down a rabbit hole with this, but we will stick to `M` for "move to" and `L` for "line to". Each value is followed by an X and Y-coordinate respectively. To draw a spoke, we describe the line as "move to 0, 0 and then draw a line to X and Y" and determined by the circle math we just performed.

## Plotting the Data

To plot the data, we use the exact same rules as the spokes - radians, `Math.cos()`, and `Math.sin()`. Indeed the iteration of the dataset starts off with pretty much the same code as from the spokes. The only subtle difference is that we are not going to multiply by `RADIUS` because that would always be 150 pixels. We want the plot of the data to reflect the values in the dataset.

``` js
// Map range
function map( value, in_min, in_max, out_min, out_max ) {
  const ratio = ( value - in_min ) / ( in_max - in_min );
  return out_min + ( ratio * ( out_max - out_min ) );      
}   
```

Earlier, when we setup the description of the radar chart, we determined the maximum value in the dataset. In this case, that is 900. The radius of the circle is only 150 pixels. Drawing a plot line at 900 pixels would not even show up on our 300x300 SVG element. We need to map the dataset value relative to the radius of the circle. The map function here takes a value, the range in which that value falls, and target range to which we want to relate. In this case, 900 becomes 150. A value of 450 would become 75, and so on.

> I actually picked up this algorithm when working with microcontrollers.

``` js
// Data 
for( let d = 0; d < data.length; d++ ) {
  let plot = '';

  for( let v = 0; v < data[d].length; v++ ) {
    const angle = degreesToRadians( ( ( 360 / LABELS.length ) * v ) - 90 );
    const radius = map( data[d][v], 0, maximum, 0, RADIUS );
    const x = radius * Math.cos( angle );
    const y = radius * Math.sin( angle );

    if( v === 0 ) {
      plot = `M ${x} ${y} `;
    } else {
      plot = plot + `L ${x} ${y} `;
    }
  }

  plot = plot + 'Z';

  const path = document.createElementNS( SVGNS, 'path' );
  path.classList.add( 'plot' );
  path.setAttributeNS( null, 'stroke', COLORS[d] );
  path.setAttributeNS( null, 'fill', COLORS[d] + '40' );      
  path.setAttributeNS( null, 'd', plot );
  chart.appendChild( path );
}
```

On the first iteration of each of the two datasets, we do not want to move to 0, 0 before drawing. We want to move to the first coordinate of the relative/mapped value. We only want that move to happen on the first iteration (index of zero). After that we want to draw a line to the relative/mapped coordinate. When we have finished a set of iterations for a dataset, we want to close the plot. We could calculate this and draw another line, but SVG gives us the `Z` command which tells the path to close itself.

We set the `stroke` and `fill` of the `path` representing the dataset on the element directly as the colors change. For the `fill` specifically, I take the six-digit hexadecimal value, and append `40` to it, representing an alpha channel value (opacity).

## Label the Values

We are in the home stretch now! The radar chart example that we are referencing, displays values on the vertical axis. You might be inclined to reach for our three rules again - radians, `Math.cos()`, and `Math.sin()` - but we already know the X-coordinate is zero (plus some pixels for spacing). All we need is the Y-coordinate where each of the circles intersects the vertical axis line, and the relative value that represents within the dataset.

``` js
// Values
for( let v = 0; v < ( LEVELS + 1 ); v++ ) {
  const value = ( maximum / LEVELS ) * v;
  const y = 0 - ( ( RADIUS / LEVELS ) * v );

  const text = document.createElementNS( SVGNS, 'text' );
  text.classList.add( 'value' );
  text.textContent = `$${value}`;
  text.setAttributeNS( null, 'x', 4 );
  text.setAttributeNS( null, 'y', y );
  chart.appendChild( text );
}
```

We use the SVG `text` element to display the values. Note that the `textContent` property is where we assign the text to be displayed (not `innerText`). 

## Label the Labels

Now for those labels along the outside of the chart itself. Here we will use our three rules again - radians, `Math.cos()`, and `Math.sin()`.

``` js
// Labels
for( let v = 0; v < LABELS.length; v++ ) {
  const angle = degreesToRadians( ( ( 360 / LABELS.length ) * v ) - 90 );
  const radius = v === 0 ? RADIUS + 16 : RADIUS + 8;
  const x = radius * Math.cos( angle );
  const y = radius * Math.sin( angle );

  const align = placement( v, LABELS.length );

  const text = document.createElementNS( SVGNS, 'text' );
  text.classList.add( 'label' );      
  text.textContent = LABELS[v];
  text.setAttributeNS( null, 'dominant-baseline', align.baseline );
  text.setAttributeNS( null, 'text-anchor', align.anchor );            
  text.setAttributeNS( null, 'x', x );
  text.setAttributeNS( null, 'y', y );
  chart.appendChild( text );      
}
```

> The `16` and `8` might seem like "magic numbers". These numbers are manually adjusted to keep the labels from bumping right up against the outer circle. Custom visual spacing tweak for the win!

The `text` element will render the content using the top-left corner by default. That is to say that if the placement coordinates are 160, 130, that is where the top-left corner of the text content will be located. The result is that the content will render out across the chart contents itself. Fortunately, you can tell `text` what to use as an origin with the `dominant-baseline` and `text-anchor` properties (representing vertical and horizontal respectively). 
 
As an example, for the first value, the label at the top of the chart, we want an origin of bottom-center. At 90 degrees along, we want an origin of center-left. When we get to the other side of the circle, say at 270 degrees, we want an origin of center-right. I have not found a clean, mathematical way to calculate this placement, so I use the degrees of the placement in an `if` statement.

 ``` js
// Label placement
function placement( index, count ) {
  const degrees = ( 360 / count ) * index;

  let anchor = 'middle'
  let baseline = 'auto';

  if( degrees === 0 ) {
    anchor = 'middle';
    baseline = 'auto';        
  } else if( degrees > 0 && degrees < 90 ) {
    anchor = 'start';
    baseline = 'auto';   
  } else if( degrees === 90 ) {
    anchor = 'start';
    baseline = 'middle';        
  } else if( degrees > 90 && degrees < 180 ) {
    anchor = 'start';
    baseline = 'hanging';        
  } else if( degrees === 180 ) {
    anchor = 'middle';
    baseline = 'hanging';                
  } else if( degrees > 180 && degrees < 270 ) {
    anchor = 'end';
    baseline = 'hanging';                        
  } else if( degrees === 270 ) {
    anchor = 'end';
    baseline = 'middle';                        
  } else {
    anchor = 'end';
    baseline = 'auto';                                
  }

  return {baseline, anchor};
} 
```

This `placement` function is like the `map` function in that it does not really change. It is a utility you can put aside and reference over and over again whenever you are build circle charts. If you have found a better approach, I would love to hear from you.

## One More Thing

All the hard parts of constructing and rendering our chart are complete. Unfortunately, some of the labels along the outside of the chart, especially the long one on the right, are being truncated by our SVG element dimensions. What we really want now is to take into consideration not just `RADIUS`, which is where we got our `viewBox` from initially, but also the new dimensions of the entire chart to include the labels; however long they may be. With those dimensions, we then want to adjust the `viewBox` to display all the content.

``` js
const bounds = chart.getBBox();
svg.setAttribute( 
  'viewBox', 
  `${bounds.x} ${bounds.y} ${bounds.width} ${bounds.height}` 
);
```

You might be familiar with `getBoundingClientRect()`. We could use that here as well, but SVG elements actually give us `getBBox()` which returns values designed to placed in the `viewBox`. We make a call to `getBBox()` on the `chart`, and then set the `viewBox` accordingly. Now the entire chart, including the labels, will be displayed in the viewport of the SVG element. This holds true even if you resize the SVG element - for example, if you had a `grid` or `flex` display.

## Next Steps

Whew! That seems like a lot, right? I mean, at this point you might be thinking "I will just use the library, thanks." And I get it. It is a lot... Of learning. The actual code is not even 200 lines of JavaScript. It is blazing fast, and because you wrote it, and understand the core principles, you can customize it to your heart's content. When a VP decides that they want a change on how things are displayed, you do not have to check and see if your library supports that customization. Now you can make the change directly yourself.

From here you might consider wrapping this up in a Web Component, and exposing some basic customization through CSS properties. Happy charting!
