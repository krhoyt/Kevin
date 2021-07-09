---
title: OCR with Tesseract.JS
slug: ocr-with-tesseract-js
date_published: 2017-12-27T22:25:00.000Z
date_updated: 2019-01-17T00:32:55.000Z
tags: ocr, tesseract
---

I recently ran across a [DataTurks blog post](https://dataturks.com/blog/compare-image-text-recognition-apis.php) that did a high-level comparison of the OCR (optical character recognition) APIs offered by Google, Microsoft, and Amazon. At various points throughout the article, you are prompted to give them your email address in exchange for the test dataset; which I did. Now to see how the Web would perform.

#### Tesseract

Per the project README, the [Tesseract OCR tool](https://github.com/tesseract-ocr/tesseract), was originally by Hewlett-Packard circa 1985 - 1994. In 2005, Tesseract was released into open source. It has been maintained by Google since then, with the latest release at the time of this writing being June 2017.

[Tesseract.JS](https://github.com/naptha/tesseract.js#tesseractjs) is an [Emscripten](https://github.com/kripken/emscripten) port of the original project, making it available to the browser and other JavaScript runtimes. It is relatively full featured, including 60+ languages.

#### Annotations

The DataTurks dataset includes a CSV file with the various tests. It includes the paths to 958 images, which are included, and an uppercase output of the text in the images. Most of the images are relatively small in size (a few hundreds in either dimension).

    test/122_10.png,PAYLOADS
    test/2319_3.png,DONT
    test/414_1.png,7023083507
    test/5019_1.png,3D
    test/5115_3.png,TWILIGHT
    test/5116_3.png,BEN
    test/2155_1.png,30
    test/1021_3.png,THAT
    test/138_10.png,THE
    test/5013_1.png,THOR
    

![Sample test image, containing the word &quot;payloads&quot;.](http://images.kevinhoyt.com/payloads.ocr.png)

Loading the annotations, and parsing them, is relatively straightforward task. While I thought about putting some async/await goodness to the test on this type of asynchronous task, it turned out to be a little cleaner [for me] using callbacks.

    constructor() {
      // Test cases
      this.annotations = [];
    
      // Which test
      this.index = 0;
    
      // How many passed
      this.pass = 0;
    
      // Reference to test image
      this.image = document.querySelector( '#test' );
      this.image.addEventListener( 
        'load', 
        ( evt ) => this.doImageLoaded( evt ) 
      );
    
      // Load the annotations
      // Test cases
      this.xhr = new XMLHttpRequest();
      this.xhr.addEventListener( 
        'load', 
        ( evt ) => this.doAnnotationsLoaded( evt ) 
      );
      this.xhr.open( 
        'GET', 
        'dataset/annotations.txt', 
        true 
      );
      this.xhr.send( null );
    }
    
    ...
    
    doAnnotationsLoaded( evt ) {
      // Split off the rows
      let rows = this.xhr.responseText.split( '\n' );
    
      // Split test and result
      for( let r = 0; r < rows.length; r++ ) {
        let pair = rows[r].split( ',' );
    
        this.annotations.push( {
          source: pair[0],
          text: pair[1]
        } );
      }
    
      // Start analysis
      this.analyze();
    }
    

#### Analysis

Kicking off each round of analysis is the loading the test image. Once the image is loaded, Tesseract.recognize() is run using the default settings. The API is Promise-ified, which is what drove my temptation to use async/await. In this case, in the ".then()" handler, I compare what Tesseract.JS found against the annotation for the test case.

    // Load test image
    analyze() {
      this.image.src = 'dataset/' + this.annotations[this.index].source;
    }
    
    ...
    
    // Test image loaded
    doImageLoaded( evt ) {
      // Run recognition
      Tesseract.recognize( this.image )
        .then( ( result ) => {
          // Put results back into annotation
          this.annotations[this.index].found = result.text.trim();
          this.annotations[this.index].confidence = result.confidence;
    
          // Check for match
          if( this.annotations[this.index].text.toLowerCase() == result.text.trim().toLowerCase() ) {
            this.pass = this.pass + 1;
            this.annotations[this.index].pass = true;
          } else {
            this.annotations[this.index].pass = false;
          }
    
          // Keep going so long as there are test cases
          if( this.index < ( this.annotations.length - 1 ) ) {
            this.index = this.index + 1;
            this.analyze();
          } else {
            console.log( this.pass );
            console.log( this.annotations );
          }
        } );
    }
    

#### Results

Of the 958 images processed, without any additional training, Tesseract.JS landed 290 correct - about 30%. That turns out to be better than AWS Rekognition based on the DataTurks testing. Not too bad!

A couple caveats on my results ...

- 
The DataTurks dataset is actually 500 test cases. It is unclear as to what those 500 test cases are exactly, so my testing uses the entire 958. Would the results be better or worse using the same 500?

- 
It is also worth mentioning that there are cases where Tesseract.JS was actually correct, but marked wrong. For example, a result of "(702) 308-3507" did not match the annotation of "7023083507" though the Tesseract.JS result is clearly correct.

#### Next Steps

It would be interesting to refine the analysis code to exclude special characters. The DataTurks testing also counted where no result was indicated. This happens with Tesseract.JS as well, but I did not make any effort to record the count.

Additionally, I have to wonder how the code would be cleaned up using async/await. It is a new JavaScript language feature which I do not feel as comfortable yet compared to callbacks. On top of that then would be removing XHR, in place of the "fetch()" API, which also works on promises.

I put my code in a little [GitHub Gist](https://gist.github.com/krhoyt/573ee665a921e952c51863a761943266), and you are welcome to check it out, make changes, and let me know what you think.

*Header image from [DeviantArt](https://stak1073.deviantart.com/art/Loki-Tesseract-338237561).*
