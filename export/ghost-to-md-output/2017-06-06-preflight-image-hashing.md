---
title: Preflight Image Hashing
slug: preflight-image-hashing
date_published: 2017-06-06T10:13:00.000Z
date_updated: 2019-01-17T00:39:21.000Z
tags: web, image, javascript
---

Sometime earlier this year, I became enamored with image hashing. The idea is to read an image, perform various maths on the RGB color model, and output a unique string. Effectively, an image fingerprint. It turns out there are a lot of ways to do approach this task, usually trading off speed and accuracy - images can be rotated, resized, recolored, etc. and potentially get the same fingerprint.

#### Update

Shortly after writing this post, it occurred to me that I could speed up the perceived performance by leaning on Web Workers - using a background thread for the math-heavy image analysis. The following example does not use that approach, however if that is something you are interested in, please let me know and I will do a more complete updated post.

#### The Problem

I was recently working on a project that allowed people to upload images to be analyzed in various ways. Along the way, that person may forget what images they have already uploaded. In those cases, the application did not need to do the upload at all. This seemed like a perfect fit for image hashing.

With image hashing, I could get the fingerprint of the file locally before uploading it, check the server to see if that fingerprint had already been uploaded, and then upload the image if necessary, or retrieve the previous analysis results. [FileReader](https://developer.mozilla.org/en-US/docs/Web/API/FileReader) would allow me to access the file locally, and I could get the RGB color model from putting the image on a [canvas element](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/getImageData).

#### Blockhash.IO

I originally started off performing this hash check on the server using the "[imghash](https://github.com/pwlmaciejewski/imghash)" package. The "imghash" package uses a module called "[blockhash-js](https://github.com/commonsmachinery/blockhash-js)" which is run from [Blockhash.IO](http://blockhash.io/). Blockhash IO can supposedly work in the browser as well, but I encountered two problems.

The first problem, like so many other JavaScript libraries, is that nobody had updated the code in over three years, and there were bugs in getting it running in the browser.  The second, is that the library used XHR to load the images to be hashed from the server. Avoiding moving the image over the wire was the whole point of the effort.

There were issues filed, and even pull requests that would have made substantial improvements, but the project organizers disagreed on the changes, which ended in no forward progress. In the end, I decided to combine a number of the snippets provided in the issues, with other snippets of improvements from the pull requests, and throw in a dash of my own local file access knowledge. I also ported it, loosely, over to ES6 along the way.

#### Behold the Hash

The first step to image hashing in the browser is to get a file reference. There are a few ways to manage this, but I used drag and drop from outside the browser.

    // File dropped
    // Perform hash
    doDragDrop( evt ) {
      evt.preventDefault();
      console.log( 'File drop.' );
    
      this.file = evt.dataTransfer.files[0];
      this.blockhash.blockhash( 
        this.file, 
        8, 
        2, 
        hash => this.doHash( hash ) 
      );
    }
    

Since the image may need to be uploaded if no matching hash/fingerprint is found, we will store a reference to the file. The main method in the Blockhash library is "blockhash( file, bits, method, callback )". The "bits" and "method" parameters allows for tuning for speed depending on your needs. When it is hashing the image, the provided callback will be called with the resulting hash value.

> It is worth noting that on fairly sizable images hashing will take some time. In my case 4,300 x 2,900 pixel images, weighing in at 1.5 Mb took about one second to hash. Smaller images were demonstrably faster.

After all the processing that goes on behind the scenes, the final fingerprint looks something like "033e1c3c34b4343c". That is the unique fingerprint for this picture of my daughter in the cockpit of a helicopter. It does not matter the size or coloring of the image, that fingerprint will always be the result.

![Paige in a helicopter.](http://images.kevinhoyt.com/helicopter.paige.jpg)

#### Ground Control to Major Tom

Next up is to check at the server for the existence of this hash. You can do this in whatever language you want. I exposed a simple API endpoint in Node.js that checked the file system for an image with a name matching the hash.

    // Image hashed
    // See if it exists on the server
    doHash( hash ) {
      console.log( 'Hash: ' + hash );
    
      this.xhr.addEventListener( 'load', this.doPreflightLoad );
      this.xhr.open( 'POST', '/api/image/preflight', true );
      this.xhr.setRequestHeader( 'Content-Type', 'application/json' );    
      this.xhr.send( JSON.stringify( {
        hash: hash
      } ) );
    }
    

In this case, since image hashes are unique fingerprints, I chose to store the uploaded image using the hash at the name. Another way to go about this would be to use a dynamically generated name, and then store the mapping to the hash in a data store.

#### Commencing Countdown

When the server responds, you will know if this file has been uploaded before or not. If it has been uploaded, and you want to display the image, you can either read the local file again, or load the image from the server. In my case, I chose to load the image from the server.

    // File check completed
    // Populate if exists
    // Upload file if it does not
    doPreflightLoad( evt ) {
      let data = JSON.parse( this.xhr.responseText );
      console.log( data );
    
      // Clean up
      this.xhr.removeEventListener( 'load', this.doPreflightLoad );
    
      // Exists
      // Populate image element
      if( data.exists ) {
        console.log( 'Found.' );
        this.show( data.hash );
      } else {
        // Does not exist
        // Upload file to server
        console.log( 'Not found.' );      
    
        // Form
        let data = new FormData();
        data.append( 'image', this.file );
    
        // Upload
        this.xhr.addEventListener( 'load', this.doUpload );
        this.xhr.open( 'POST', '/api/image/original', true );
        this.xhr.send( data );
      }
    }
    

If the file does not exist, then it will need to be uploaded. For this I use a [FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData) instance, the file reference we stored at the beginning of the process, and a POST to another Node.js API endpoint. When the file is uploaded, the response contains the same hash, which I then specify as a path in an image element, and load it from the server.

#### Engines On

There are some trade-offs I am making by taking this approach. Most notably is that there is a considerable amount of processing that happens on the client, and that may slow down the user interaction. Would it have been faster to simply uploaded the file and manage the hashing at the server? In my tests, doing the work on the client, and uploading only when necessary, was at least a little faster than the "always upload route" - demonstrably faster for smaller images.

If reducing duplicate image uploads is a concern for your project, then image hashing on the client is certainly worth consideration. Given that the fingerprint comes in handy for other uses, certainly makes it worth using liberally on the server, and in the data store.

I have placed the pertinent parts of the application, including my port of Blockhash.IO to the browser using FileReader, in a [GitHub Gist](https://gist.github.com/krhoyt/cf9de4eed5f406de044fd1851fb0f5dc) should you find it useful for your project.
