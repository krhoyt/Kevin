---
title: Animated File Upload Button
slug: animated-file-upload-button
date_published: 2017-05-18T09:30:47.000Z
date_updated: 2019-01-17T00:42:12.000Z
tags: web, svg
---

Among the countless ways to perform a file upload from an web page, this will likely be nothing new. Progress bars are also nothing new. However, when I ran across a [post](https://tympanus.net/codrops/2015/09/15/styling-customizing-file-inputs-smart-way/) from [Osvaldas Valutis](https://twitter.com/osvaldas) on customizing the appearance of the file input type, I thought it would be fun to make the file upload the actual progress indicator with a splash of animated SVG (kinda).

#### The Server

Every uploaded file needs a place to go, and for this I am using Node.js with [Multer](https://github.com/expressjs/multer). I will not cover this extensively here, but for the record, my Express route looks something like the following snippet.

    var express = require( 'express' );
    var fs = require( 'fs' );
    var multer = require( 'multer' );
    var path = require( 'path' );
    var randomstring = require( 'randomstring' );
    
    // Router
    var router = express.Router();
    
    // Upload storage options
    // Unique name with extension
    var storage = multer.diskStorage( {
      destination: 'uploads',
        filename: function( req, file, cb ) {
          cb( null, randomstring.generate() + '.jpg' );
        }
    } );
    
    // Upload handler
    var upload = multer( {
      storage: storage
    } );
    
    // Image upload
    router.post( '/upload', upload.single( 'attachment' ), function( req, res ) {
      // Get name from path
      var parts = req.file.path.split( '/' );
      var file = parts[1].split( '.' )[0];
    
      // Respond with name
      res.json( {
        name: file
      } );
    } );
      
    // Export
    module.exports = router;
    

One thing to call out here is that I have a, not-so-thorough, unique naming function. Not so thorough because I should be checking the file system for the randomly determined name - which I also lazily assume to be a JPEG. I just needed somewhere to put the file to test the upload. YMMV.

#### The HTML

To summarize the post by Osvaldas, you can associate the label element with the file input, and hide the file input. When the label is clicked, the file input will present the selection dialog - no JavaScript needed. Since the label element can be a container for other HTML, I drop in some SVG.

    <!-- File upload -->
    <input id="upload" type="file">
    <label for="upload">
      <!-- SVG content in label -->
      <svg width="56" height="56">
        <!-- Background -->
        <circle cx="28" cy="28" r="28" fill="red"/>
    
        <!-- Icon -->
        <!-- From Material Design -->
        <path 
          class="icon" 
          d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z" 
          fill="white" 
          transform="translate( 15, 15 )"/>
    
        <!-- Animated completion indicator -->
        <!-- Pie slice -->
        <path 
          class="pie" 
          d="M 28 28 L 28 0 A 28 28 1 0 1 28 0 z" 
          fill="red" 
          opacity="0"/>
    
        <!-- Numeric completion indicator -->
        <text 
          x="28" 
          y="28" 
          text-anchor="middle" 
          fill="white" 
          font-size="14" 
          font-weight="700" 
          dominant-baseline="central" 
          opacity="0">0%</text>
      </svg>
    </label>
    

The SVG presents a colored circle with an upload icon inside of it. An element for drawing percentage upload complete is hidden, as is a numeric display for the same value. We will come around to those in a moment. The result looks something like the following image.

![Custom file upload button](http://images.kevinhoyt.com/file.upload.circle.png)

#### The Selection

There are two events we need to concern ourselves with initially - a click on the label surface, and a file selection. We can also go ahead and store references to the elements we will use repeatedly, and initialize any values. I do this in the constructor of an ES6 class I used to encapsulate all the upload functionality.

    constructor( path ) {
      this.root = document.querySelector( path );
      this.root.addEventListener( 'click', evt => this.doClick( evt ) );
    
      this.svg = this.root.querySelector( 'svg' );
    
      // Hidden file form field
      this.file = document.querySelector( '#' + this.root.getAttribute( 'for' ) );
      this.file.addEventListener( 'change', evt => this.doFile( evt ) );
    
      // Reference parts
      this.circle = this.svg.querySelector( 'circle' );
      this.complete = this.svg.querySelector( 'text' );
      this.icon = this.svg.querySelector( '.icon' );
      this.pie = this.svg.querySelector( '.pie' );
    
      // Complete (0 - 100)
      this.percent = 0;
    }
    

I said earlier that clicking on the label would trigger file selection automatically without JavaScript. I listen for it anyways because I want to be able to prevent selecting another file, during the upload process. If you have a separate form submit button, then you may have another way of approaching this requirement.

    doClick( evt ) {
      // Hold up on file selection
      evt.preventDefault();
    
      // Not currently uploading
      // Proceed
      if( this.icon.getAttributeNS( null, 'opacity' ) != '0' ) {
        this.file.click();          
      }
    }
    

Here I prevent the default behavior of the browser to present the file selection dialog. Then I check to see if one of the SVG elements used for indicating upload progress is visible. If it is not, then an upload is not taking place, and we can go ahead and show the file selection dialog anyways.

#### The Upload

I am performing the file upload as soon as the file is selected. No other UI is presented because the only thing I care about for my application in this instance is uploading of single image files in turn. This is for a facial recognition tool I am building that I will blog in the future.

    // File selected
    doFile( evt ) {
      // No file selected
      // Abort
      if( evt.target.files.length == 0 ) {
        return;
      }
    
      // Set state for upload reporting
      this.icon.setAttributeNS( null, 'opacity', 0 );
      this.circle.setAttributeNS( null, 'opacity', 0.50 );
      this.pie.setAttributeNS( null, 'opacity', 1 );
      this.complete.innerHTML = '0%';
      this.complete.setAttributeNS( null, 'opacity', 1 );
    
      // Instantiate
      // Hook events if needed
      if( this.xhr == null ) {
        this.xhr = new XMLHttpRequest();
        this.xhr.addEventListener( 'load', evt => this.doLoad( evt ) );
        this.xhr.upload.addEventListener( 'progress', evt => this.doProgress( evt ) );          
      }
    
      // File to upload
      let data = new FormData();
      data.append( 'attachment', evt.target.files[0] );
    
      // Send to API
      this.xhr.open( 'POST', '/api/image/upload', true );
      this.xhr.send( data );
    }
    

As the user may choose not to select a file at all, and present the old "Cancel" button on me, the first thing I do is check to see that a file has actually been selected. Hey! I am not always a lazy programmer!

From there, I hide the icon path in the SVG, put some opacity on the background circle, show the element to indicate progress and the related numeric display. This effectively swaps out state from waiting for selection to performing an upload.

I use a XHR instance to perform the file upload. I like this approach because it gives you a lot of control over the specifics.  To listen for the upload specifically, we will add a "progress" listener on the "xhr.upload" property.

> If you put the progress listener on the XHR instance directly, you will only get one event fired, and it will not be the event you want, nor will it contain the correct data.

A little splash of the FormData class allows us to associate the selected file with the XHR instance. We then POST the file to the server. Here come the progress events! Time to get animating!

#### The Animation

The key properties in a progress event are "loaded" and "total" which contain the bytes uploaded so far, and the number of bytes in the file. A little splash of division will let us know the percentage completed.

    // Upload in progress
    // Reflect values in visualization
    doProgress( evt ) {
      this.percent = ( evt.loaded / evt.total ) * 100;
      this.progress();
    }
    

If the file is completely uploaded, then I reset the appearance of the label, swapping the state back to a ready indicator.

I also reset the value of the file input. This allows the user to select the same file repeatedly. If you do not reset the value, then selecting the same file does not indicate a change, and no event will be triggered.

    // Animate to current completion
    progress() {
      // Completed
      // Reset to ready
      if( this.percent == 100 ) {
        this.circle.setAttributeNS( null, 'opacity', 1 );
        this.pie.setAttributeNS( null, 'opacity', 0 );
        this.complete.setAttributeNS( null, 'opacity', 0 );
        this.icon.setAttributeNS( null, 'opacity', 1 );
    
        this.percent = 0;
    
        // Allow selection of same file
        // Set value to blank
        // Same file will look like a change
        this.file.value = '';
      }
    
      // Completion arc calculator
      let angle = ( this.percent / 100 ) * 360;
      let radians = ( angle - 90 ) * Math.PI / 180;
      let arc = angle <= 180 ? '0' : '1';
      let slice = {
        x: 28 + ( 28 * Math.cos( radians ) ),
        y: 28 + ( 28 * Math.sin( radians ) )
      };
      let d = [
        'M', 28, 28, 
        'L', 28, 0,
        'A', 28, 28, 1, arc, 1, slice.x, slice.y, 
        'z'
      ].join( ' ' );
    
      // Update completion pie
      // Update numeric indicator
      this.pie.setAttributeNS( null, 'd', d );
      this.complete.innerHTML = Math.round( this.percent ) + '%';
    }
    

To indicate upload progress, I want to show a mini pie chart inside the button, which is already a circle. To correctly draw the pie takes some math.

We want the percent complete to reflect the part of the pie. If a whole pie is 360 degrees, we want the percentage of that for the angle of our slice. We also want that value in radians so we can bust out our mad trigonometry skills.

Arc sweep is one of the more obtuse, yet useful, parameters for drawing a path. It tells the rendering engine which way to draw the arc. You can get some really wild results if you mess around with these values. In the case of our pie slice, we want the smaller angle drawn until the angle is more than 180 degrees (fifty percent complete). At that point we want the larger angle drawn.

The arc for this animation will start at the top of the circle. That gives us a known starting point. The end point is along the outer edge of the circle reflecting the percentage complete. Great, so what is the X/Y coordinates for that? There is that splash of trigonometry.

> Shout out to [this](http://stackoverflow.com/questions/5736398/how-to-calculate-the-svg-path-for-an-arc-of-a-circle) StackOverflow answer on piecing together circle coordinates and arc.

Once we have all those parameters, we can put them together to represent the path, and populate the pie slice element. Not wanting to rely on just a pie, we can also put the numeric value on display.

#### The Yummy

When the file is completely uploaded, the "load" event fires on the XHR instance. I want to let any interested parties know that has happened, so I have the label element dispatch a custom event.

    // Upload completed
    // Response recieved
    doLoad( evt ) {
      let data = JSON.parse( this.xhr.responseText );
      console.log( data );
        
      let event = new CustomEvent( 'progress_complete', {detail: data} );
      this.root.dispatchEvent( event );
      }
    

You may have noticed that my server sends back the file name once the upload is complete. I go ahead and parse that JSON and send the data along with the custom event.

And the finished result is:

![Animated file upload button.](http://images.kevinhoyt.com/file.upload.circle.gif)

#### Next Steps

Well, first, do not be lazy, go back, and put additional validation on the file name at the server. Second would be to make sure that the image file is a JPEG (or other file type), if that sort of thing is important to your application. I actually intend to add that at the client with a little FileReader action.

I have created a [gist](https://gist.github.com/krhoyt/3b6d76af63194052b98e07d970c53d5f) for the files in this post.
