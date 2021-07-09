---
title: Upload a Web Camera Image
slug: webcam-to-php-upload
date_published: 2015-06-18T15:07:58.000Z
date_updated: 2015-06-18T15:10:23.000Z
tags: canvas, camera, image, php
---

*Long ago, in a galaxy far, far away, Flash Player gave developers access to the user's web camera.  This 2002 feature is [just starting](http://caniuse.com/#search=getUserMedia) to become available to the Web.  At the same time, HTML5 Canvas brings pixel level manipulation of content to the table.  Throw in a dash of server processing (in this case PHP), and you have the ability to upload, save, and retrieve images from a web camera.*

---

### Video Element

Before we get into scripting web camera access, we will need a place to display the video feed.  This happens using the video element in your HTML.  You can give it an ID or class to query it later, or if you are only going to have one video element, just leave it be and query by the tag name.

    <!-- Video stream -->
    <video>Video stream not available.</video>  
    

You will notice that there is no size specified.  There are many variables to consider here, not the least of which is the resolution of the web camera itself, and the browser support for those resolutions.  In my experience, 640x480 was the most common resulting resolution.

Rather than specify the dimensions now, we will come back to how to detect and size the video element in a moment.  For now, wire up a global reference to the video element in JavaScript.  In the following code, the reference I use is called "video".

    var video = document.querySelector( 'video' );
    

### Access the Web Camera

The main approach to accessing a web camera from JavaScript is through a method named getUserMedia().  Depending on the browser, this may be on the Navigator object (old), or the MediaDevices object.  Regardless, you probably want a little polyfill work to get started.

For my testing, I went with:

    // Polyfill browser differences
    navigator.getMedia = ( 
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia ||
      navigator.msGetUserMedia 
    );  
      
    // Start video stream  
    navigator.getMedia( 
      {
        video: true,
        audio: false
      },
      doMediaStream,
      doMediaError
    );
    

In my code, the method doMediaStream() is called when the user has given access to the web camera.  That means we can get a reference to the video stream, and start playing it.

    // Called when media stream is successful
    // Starts watch for video element sizing
    // Starts stream to video element
    function doMediaStream( stream )
    {  
      var url = null;
    
      // Debug
      console.log( 'Media stream linked.' );  
      
      // Watch for video dimensions to be set
      interval = setInterval( doMediaPlay, 100 );
      
      // Polyfill browser differences
      if( navigator.mozGetUserMedia ) 
      {
        video.mozSrcObject = stream;
      } else {
        url = window.URL || window.webkitURL;
        video.src = url.createObjectURL( stream );
      }
      
      // Start the stream
      video.play();  
    }
    

Most of this should be pretty logical, but one line should stick out - the call to setInterval().

While there are a myriad of events for handling streaming video playback, it appears that the browsers disagree as to when the video actually starts, and what events to raise.  This means display dimensions are equally scattered.  To get around this, we start an interval that watches for the video.videoWidth and video.videoHeight properties to be a value other than zero (0).

    // Called when the video starts
    // Size image processing canvas
    function doMediaPlay()
    {
      // Video stream playing and sized by browser
      if( video.videoWidth > 0 && video.videoHeight > 0 )
      {
        clearInterval( interval );  
        interval = null;
      } else {
        return;
      }
      
      // Debug
      console.log( 'Video stream playing.' );
      
      // Size image processing canvas
      // Match original video stream size
      // Use attributes for sizing over styles
      // Attributes do not stretch canvas like styles
      canvas.setAttribute( 
        'width', 
        video.videoWidth 
      );
      canvas.setAttribute( 
        'height', 
        video.videoHeight 
      );
    } 
    

You might have noticed that the last lines from the above code snippet reference a canvas object.  While the video element displays the web camera, the canvas element will be responsible for accessing the pixels of that feed, and turning them into an image.

### Adding a Canvas

Canvas (specifically the canvas context) has an interesting method called drawImage().  Typically you see this when you want to draw images into a canvas.  The places you can pull those images from however include portions of the canvas itself, images from the HTML or loaded via JavaScript, and even the video element.

> There was a time when drawImage could actually draw from any HTML element - even the document body.  This was considered a security risk, and pared down to a few select elements.

This means that you will need a canvas element in your HTML.  You can hide it with CSS using the visibility property.  Do not use display: none; as in some browsers this means nothing will get drawn to the canvas.

    var canvas = document.querySelector( 'canvas' );
    var context = canvas.getContext( '2d' );
    

You also do not want to size the canvas element using CSS.  Sizing using CSS will actually cause the contents of the canvas to be stretched.  By using setAttribute() we can control the physical size of the canvas.

In the code snippet above, I size the canvas to match the dimensions of the video feed.

The video element will default to whatever size the browser wants to display the feed.  If you have other plans, I suggest using setAttribute() there as well.  How the video displays, and what is considered the video's bounding box, are two different topics you will have to explore to get right.

### Drawing to Canvas

I will assume that you are wiring up some button or other event to trigger when an image is captured from the video feed.  When that event is triggered, you are now set to draw the video feed onto the canvas.

    // Draw video to canvas
    context.drawImage( 
      video, 
      0, 
      0, 
      canvas.clientWidth, 
      canvas.clientHeight 
    );
    

There is that drawImage() method we talked about earlier.  We are telling the canvas context to capture the pixels from the video feed, and place them at the upper left corner.  Along the way we want context to fit the pixels of the video into the canvas (which should be the same size).

> You might alternatively consider video.pause() when you take a picture to let the user see what it is that was captured.

You can technically tell context to size the image being drawn to whatever dimensions you want.  Context will in turn scale or stretch the image being drawn to match.  This is a technique to consider if you want to generate a thumbnail of the image you captured.

### Uploading the Image

To upload the image to the server, we will use the XMLHttpRequest object.  While I will be using PHP on the server for this example, the same concept apply to whatever language it is you prefer to use on the server.

> It is interesting to note that Web standards are almost mature enough to where you do not have to upload to a server at all, but could actually save the image directly to the user's disk.  Check out the [FileWriter](http://caniuse.com/#search=FileWriter) API.

When we send an image to the server, we will be sending a lot of data.  The HTTP POST method lends itself to uploading this quantity of data.  If you have other data you want to send along, you can tack it onto the image, or in this case, I send a custom header that uniquely identifies the client session.

    // Send image data to server
    xhr = new XMLHttpRequest();
    xhr.addEventListener( 'load', doPhotoLoad );
    xhr.open( 'POST', SERVER_PATH, true );
    xhr.setRequestHeader( 'X-Client-ID', uuid );    
    xhr.send( canvas.toDataURL( 'image/png' ) );
    

The magic here is really the toDataURL() method.  This method takes the pixels from the canvas, and encodes them for a given image type (image/png) using Base64.  The result is a really long string, that we can send as the raw HTTP POST content.

### Saving the Image

Our work on the client is pretty much complete at this point.  Now we turn our focus to the server, and handing the incoming HTTP POST of image data.  Again, I will be using PHP here, but the concepts should translate across to your preferred language easily enough.

    // Get raw HTTP content
    $body = file_get_contents( 'php://input' );
    
    // Trim off encoding string
    $prefix = strpos( $body, ',' ) + strlen( ',' );
    $data = substr( $body, $prefix );
    
    // Decode into binary image
    $image = base64_decode( $data );
    
    // Write image to file
    file_put_contents( $PATH . $filename, $image );
    
    // Tell the client where to find the file
    echo $filename;
    

The first step here is to get the HTTP POST content.  If you are familiar with the HTTP specification, this is effectively a long block of content that follows the HTTP headers.  The HTTP headers themselves state the length of the actual content.  This is different from form fields you may have posted in other applications.  It is just raw content.

When canvas turns the pixels into an image, and Base64 encodes the result into a string, it will prefix that string with information about the image type (JPG, PNG), and also the method used to encode the pixels.  That little string looks like this:

    data:image/png;base64,
    

This string is helpful information, but it is not part of the image data itself.  This means that before we decode the image back into a binary representation of an image format, that we first need to remove this string.  I do this by looking for that comma and grabbing everything after it.

Now that we have the Base64 encoded representation of an image file, we need to turn it from text, back into binary before saving the image to disk.  In this code snippet I use base64_decode() to get the binary representation of the file.  Then I use file_put_contents() to write the file to disk.

Depending on your needs, you may want to tell the client where it can find the image on the server.  Of course, the client already has the pixels on a canvas, and can put them into an Image element directly by setting the src attribute.  I will leave the decision of what to return to you.

### Next Steps

Once you have the image on the server, there is a lot of processing that you can do.  Maybe you want to keep a pointer to that file in a database.  Maybe you want to perform some additional image processing on it, and send it in an MMS message or email.  Up next for me was applying face recognition.

I have posted the complete version of this application (face recognition and all) on my [GitHub](https://github.com/krhoyt/Personal/tree/master/Alchemy) account.  Feel free to comment below with questions, or send me a [tweet](http://twitter.com/krhoyt).
