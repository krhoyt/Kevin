---
title: Transferable ImageData
slug: transferable-imagedata
date_published: 2018-10-31T18:00:00.000Z
date_updated: 2018-10-31T17:59:59.000Z
tags: image, processing, web
---

In a [previous post](https://www.kevinhoyt.com/2018/10/23/image-processing-in-a-web-worker/), I covered sending ImageData from a canvas element, to a Web Worker. This allows for threaded image processing without impacting rendering performance of the browser ... mostly.

## By Value

There is still a performance hit, af around 20 milliseconds in my *very* informal testing. This has to do with how data is passed from the main page to the worker - effectively by value. This means that a complete copy of the data is made. This may be fine when dealing with smaller datasets, but when a 640x480 image has 307,200 pixels, it takes a bit more processing.

## By Reference

Shortly after workers were introduced, the concept of "[transferable objects](https://developers.google.com/web/updates/2011/12/Transferable-Objects-Lightning-Fast)" was introduced. The cited work does a good job of introducing the technical reasoning and function. Effectively, when passed as a transferable object (versus structured clone), the reference to the place in memory where the object resides is being handed of to the receiving thread.

> Note the side effect that the object being transfered is no longer available to the main page.

## Sending ImageData

In order to be transferable, the object being passed to the worker must be ArrayBuffer, MessagePort, or ImageBitmap. MessagePort does not really help us in the case of working on the raw image data. ImageBitmap would be great, but still lacks consistent [support](https://caniuse.com/#search=bitmap) (Nov 2018). This leaves us with ArrayBuffer.

Using into the code from the previous post in this series, we are going to look at the "process()" method. Originally, using ImageData, and passing by value, it looked like the following snippet of code.

    process() {
      this.input.context.drawImage( this.video, 0, 0 );
      
      const pixels = this.input.context.getImageData(
        this.input.canvas.clientWidth / 2,
        0,
        this.input.canvas.clientWidth / 2,
        this.input.canvas.clientHeight
      );
      
      this.worker.postMessage( pixels );
    }
    

The ImageData object has a "data" property which is of Uint8ClampedArray type. The data property, or "Uint8ClampedArray" instance, has a "buffer" property on it that results in an ArrayBuffer. And since ArrayBuffer is transferable, we are in business. Our process method updated for passing by reference, look as follows.

    process() {
      this.input.context.drawImage( this.video, 0, 0 );
      
      const pixels = this.input.context.getImageData(
        this.input.canvas.clientWidth / 2,
        0,
        this.input.canvas.clientWidth / 2,
        this.input.canvas.clientHeight
      );
      
      this.worker.postMessage( {
        pixels: pixels.data.buffer,
        width: this.input.canvas.clientWidth / 2,
        height: this.input.canvas.clientHeight,
        channels: 4
      }, [pixels.data.buffer] );      
    }
    

Since we will be passing an ArrayBuffer, we will lose some of the information about the ImageData along the way. Specifically, the width and height properties which will be needed on the worker side to reconstruct the ImageData object from the ArrayBuffer. To remedy this problem, we pass an Object instance with the width and height properties - and of course the pixels.

In order to mark the pixels as transferable, we pass an additional argument to the "Worker.postMessage()" method that indicates the data we want to send. Note that this is an array, and that you can provide many different bits of data as needed. Also keep in mind that once the data is sent to the worker, it is no longer available to the sending thread. This is still an ideal setup for image processing, as we want something entirely different back in most cases.

## Receiving ImageData

The call to "postMessage()" looks the same wether you are sending ImageData pixels to a worker, or back from a worker to the main thread. Effectively "pixels.data.buffer" with enough additional information to handle reconstructing the ImageData object. On either side of the call, the next challenge is in getting the ImageData back from the ArrayBuffer instance.

    let pixels = new ImageData( 
      new Uint8ClampedArray( evt.data.pixels ),
      evt.data.width,
      evt.data.height 
    );
    

The ImageData class has two constructors. The first takes a width and height, and creates a black retangle. The second takes an Uint8ClampedArray, width, and height. The Uint8ClampedArray has four different constructors, one of which takes an ArrayBuffer. Since we passed in an ArrayBuffer (by reference), we can use that to create the Uint8ClampedArray as needed by the ImageData, in addition to the width and height properties we passed along.

## The Results

From an image processing perspective, we are back in business, now with an extra 10 milliseconds. That right, this techniques cut an already pretty light 20 milliseconds in half (50%). The impact on frame rate is still beyond the human eye, but this leaves 10 milliseconds for us to perform other image processing. I will start leaning into those specifics in my next post.
