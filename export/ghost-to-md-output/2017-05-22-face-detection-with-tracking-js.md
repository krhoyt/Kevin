---
title: Face Detection with Tracking.JS
slug: face-detection-with-tracking-js
date_published: 2017-05-22T20:25:49.000Z
date_updated: 2019-01-17T00:41:18.000Z
tags: machine, vision, web
---

Tracking.JS is a JavaScript library that brings a few machine vision algorithms, and a splash of related utilities, to the browser. The [web site](https://trackingjs.com) has live examples with links to the source code for each, but I wanted to test it using my own images. Here is how I went about it, and how you can test using your own images without figuring out any code at all.

#### The Goal

![Test application in action.](http://images.kevinhoyt.com/trackingjs.local.png)

Rather than work with the project-provided, sized, image, I want to work with my own images - whatever their size. In order to allow others to do the same, I wanted to make this use local features where possible so there was no barrier to entry of forking, configuring, running, etc.

Where I ended was a small application that uses FileReader, drag/drop, and canvas, in conjunction with Tracking.JS to let anybody test face detection. Because it is all local, there is no upload/privacy concern. Just head to the web page, and [check it out](http://temp.kevinhoyt.com/ibm/trackingjs/people/).

#### The File

The first step is in getting the local file. We can use a standard file input to allow selection through the browser-provided dialog. Once a selection is made, we can use the FileReader class to read the file contents. Then we assign the resulting data URL to an image element for rendering.

    // In the ES6 class constructor
    this.uploader = document.querySelector( '#uploader' );
    this.uploader.addEventListener( 'change', evt => this.doUpload( evt ) );
    
    this.reader = new FileReader();
    this.reader.addEventListener( 'load', evt => this.doRead( evt ) );
    
    this.holder = document.querySelector( '#holder' );
    this.holder.addEventListener( 'load', evt => this.doImage( evt ) );
    
    ...
    
    // Called when a file is selected
    // Start analyzing
    doUpload( evt ) {
      this.process( evt.target.files[0] );
    }
    
    // Read file locally
    process( file ) {
      this.reader.readAsDataURL( file );
    }
    
    // Finished reading local file
    // Populate image element
    doRead( evt ) {
      this.holder.src = evt.target.result;
    }
    
    // Image element loaded
    // Scale respective canvas surface
    // Paint content
    doImage( evt ) {
      ...
    }
    

You might notice the "process()" method here which is separated from the event handler because it will also be used by drag-and-drop functionality.

To enable local drag/drop, you first need to ignore the default browser behavior and substitute your own when the file is dragged over the browser. Then you also need to ignore the default behavior on the drop event. At that point you will have a reference to the file, which is passed onto the "process()" method for local reading, and populating of the image element.

    // In the ES6 class constructor
    this.layout = document.querySelector( '#layout' );
    this.layout.addEventListener( 'dragover', evt => this.doDragOver( evt ) );
    this.layout.addEventListener( 'drop', evt => this.doDragDrop( evt ) );
    
    ...
    
    // File is dragged over viewport
    // Prevent default behavior (view)
    // Enable drop
    doDragOver( evt ) {
      evt.stopPropagation();
      evt.preventDefault();
      evt.dataTransfer.dropEffect = 'copy';    
    }
    
    // File dropped on viewport
    // Prevent default behavior (view)
    // Start analyzing
    doDragDrop( evt ) {
      evt.stopPropagation();
      evt.preventDefault();
      this.process( evt.dataTransfer.files[0] );
    }
    

#### The Render

Because the selected file may be very large, larger than the browser viewport, we will want to render it to fit. Canvas is a good way to do this, and also gives us an easy way to draw highlights on the detected faces.

    // Image element loaded
    // Scale respective canvas surface
    // Paint content
    doImage( evt ) {
      // Original image ratio
      // Used to keep dimensions consistent
      let ratio = this.holder.clientWidth / this.holder.clientHeight;
    
      // Landscape or portrait
      // Size canvas respectively
      if( this.holder.clientWidth > this.holder.clientHeight ) {
        this.surface.width = Math.round( window.innerWidth * People.LANDSCAPE_SCALE );
        this.surface.height = this.surface.width / ratio;
      } else {
        this.surface.height = Math.round( window.innerHeight * People.PORTRAIT_SCALE );
        this.surface.width = this.surface.height * ratio;      
      }
    
      // Get context
      // Draw scaled image on to canvas
      this.context = this.surface.getContext( '2d' );
      this.context.drawImage( this.holder, 0, 0, this.surface.width, this.surface.height );    
    
      // Find faces
      tracking.track( '#surface', this.tracker );    
    }
    

We want to make sure we keep the original dimensions of the file as we scale it down, and then account for landscape and portrait orientations. From there we can use the canvas context "drawImage()" method to draw from the image element, to the canvas, and scale the image to fit along the way.

#### The Analysis

With the image on the canvas, the next step is to call Tracking.JS to analyze the image. The "tracking.track()" static method takes an image or canvas element, and a reference to the type of tracking to perform. You can look for faces, mouths, and eyes, or any combination therein.

    // In the ES6 class constructor
    this.tracker = new tracking.ObjectTracker( 'face' );
    this.tracker.setStepSize( People.STEP_SIZE );
    this.tracker.addListener( 'track', evt => this.doTrack( evt ) );
    
    
    // Facial tracking completed
    // Highlight faces
    doTrack( evt ) {
      // Style
      this.context.beginPath();
      this.context.lineWidth = 6;
      this.context.strokeStyle = 'yellow';
    
      // Faces
      for( let face of evt.data ) {
        this.context.rect( face.x, face.y, face.width, face.height );
      }
    
      // Draw
      this.context.stroke();
    
      // Show
      this.surface.style.opacity = 1.0;
    
      // Reset for same file selection
      this.uploader.value = '';
    }
    

The result from the tracking is an array of found features - in this case, the faces that were detected. We can iterate through the results, and then use the canvas context to draw rectangles to highlight the faces.

#### Next Steps

You will notice that never does the file actually get uploaded to a server. There is no server needed beyond serving the web page and associated assets. This means there are also no privacy concerns. You can now see if Tracking.JS will work for you by testing your images locally.

I answered a few GitHub issues for the Tracking.JS project, and found that it seems to be largely abandoned. That does not make it any less useful. It would be great to see the library updated to ES6 or TypeScript (or the likes). Maybe some big company with loads of resources like IBM could pick up that work.

Project files are in a [gist](https://gist.github.com/krhoyt/5b19e64fc58276a7c2f55ded7fd93a99) if you want the whole source.
