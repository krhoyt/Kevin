---
title: Android Barcode Scanner
slug: android-barcode-scanner
date_published: 2015-06-05T16:31:48.000Z
date_updated: 2015-06-09T23:15:27.000Z
---

*In previous posts I talked about a barcode scanner project.  The first post was from a [hardware perspective](http://blog.kevinhoyt.com/2015/05/12/first-steps-with-intel-edison/), looking at the Intel Edison.  The second post was centered around the [software](http://blog.kevinhoyt.com/2015/05/15/real-time-barcode-scanner/) for integrating with the hardware, and presenting a Web-based interface.  In this post, we continue with the concept, but using an Android camera, and native barcode scanning.*

---

This is reposted on the [Kaazing Open Source Blog](http://kaazing.org/blog/android-barcode-scanner/).

### Pieces Parts

To dive into that a little bit more, here is a run-down of the architecture for this project.

In place of a dedicated barcode scanner that uses a laser, we will use an image processing technique using a smartphone camera.  In this case, the smartphone is an Android device.  Barcode scanning through image processing is pretty common these days, and there are many libraries available (both commercial and open source).  This project will use the [Zebra Crossing](https://github.com/zxing/zxing) project from Google.

> Note that the Zebra Crossing project is licensed under [Apache 2.0](https://github.com/zxing/zxing/blob/master/COPYING).  Embedding in commercial software should be reviewed prior to deployment.

Since this is not a commercial project, I will be embedding the Zebra Crossing (ZXing) scanner directly into my application.  The alternative is to use the Android Intent model, and defer the work of scanning to another (licensed) application.  For embedding the scanner, I am using the excellent [ZXing wrapper](https://github.com/journeyapps/zxing-android-embedded) from [Journey Apps](http://journeyapps.com/).

Once a UPC value has been obtained from the scanner, it is run through the [Amazon Associates](https://affiliate-program.amazon.com/) Product API.  While I have seen many tutorials that do this type of processing on the UI thread, I have written a Task subclass to handle the lookup on a separate thread.

With all the product details in hand, a message is constructed, and sent to a [Kaazing Gateway](http://kaazing.org) instance in the cloud we refer to as Sandbox.  Sandbox is a free instance of Kaazing Gateway for developers to use prior to deployment.  The message is in turn routed to whatever clients may be interested.

In this case, both the web client from the previous post, and this native client are interested in the message - and the content will show up in both places.  In fact, the two have functional parity, and will remain in sync throughout the shopping experience.  The power of publish/subscribe!

> Imagine walking up to a point of sale system that already knows what you have in your cart.  Just select your method of payment on your device and walk out.

### Embedding ZXing

There are good instructions on the GitHub repository for this embeddable version of ZXing, but I am going to cover it here again for good measure.

If you are using [Android Studio](http://developer.android.com/tools/studio/index.html) for Android development (and you should be), your first stop will be the [Gradle](https://gradle.org/) files for your application - specifically for your application, not the top-level project.  You will be able to tell the difference because the comments in the file will tell you "not this file" and also because the tab in Android Studio will be labeled "app" not "android".

You will want to add three lines to your Gradle file.  The first goes in the "repositories" section, and the other two go in the "dependencies" section.  All said and done, it should look something like the following.  Note that you may have other entries here.  These are just the lines for the barcode scanner.

    repositories {
        jcenter()
    }
    
    dependencies {
        compile 'com.journeyapps:zxing-android-embedded:3.0.0@aar'
        compile 'com.google.zxing:core:3.2.0'
    }
    

To use the barcode scanner, you will generally have some user interface in your application that triggers the scanning operation.  In my case, this manifests itself on the ActionBar menu.  A button would work fine as well.  Once the UI event has been triggered, you launch the barcode scanner as follows.  This will turn on the camera, and present the scanning Activity (user interface).

    integrator = new IntentIntegrator( StoresActivity.this );
    integrator.initiateScan();
    

That is all there is to it - two lines of code.  From here the user may scan a barcode, or cancel the operation.  When completed, the scanning Activity will be dismissed, and your application UI will be presented again.

    // Scan complete
    // Lookup details from Amazon
    // Send message over Kaazing Gateway
    public void onActivityResult( int requestCode, int resultCode, Intent intent ) {
      AmazonTask      amazonTask;
      IntentResult    scanResult;
      String          resultContents;
    
      // Results
      scanResult = IntentIntegrator.parseActivityResult( requestCode, resultCode, intent );
    
      // Make sure something was scanned
      if( scanResult != null ) {
    
        // Get the UPC from the scan results
        resultContents = scanResult.getContents();
    
        if( resultContents == null ) {
          Log.i( "SCAN", "Scanning cancelled." );
        } else {
          Log.i( "SCAN", resultContents );
        }
      }
    }
    

If you think about all the image processing that goes behind the scene to get you a UPC value, this is an amazingly small amount of code.  You do not have to think about camera focus (or lack thereof), the angle of the camera, or decoding the lines.  Having written a barcode scanner [from scratch](https://github.com/krhoyt/ActionScript/tree/master/Barcode) before (ActionScript), I can tell you that this is no small feat.

### Amazon Product Lookup

As mentioned earlier, network request for data should happen in their own thread.  It is poor practice to put network processing on the UI thread.  Threading in Android surfaces in a variety of forms, but for this type of action, a Task subclass will handle the lookup.

> If you are interested in how my Task subclass actually works, you can find the code on my [personal GitHub repository](https://github.com/krhoyt/Kaazing/blob/master/iot/stores/amazon/app/src/main/java/org/kaazing/amazon/AmazonTask.java).

Most of the code in my Task subclass (called AmazonTask) is actually lifted from the [Amazon Product Advertising API](http://docs.aws.amazon.com/AWSECommerceService/latest/DG/AuthJavaSampleSig2.html).  Rather than focus on how that code works, I will cover how to use my AmazonTask wrapper.

    // Asynchronous Amazon search
    amazonTask = new AmazonTask();
    amazonTask.callback = new AmazonListener() {
    
      // Called with Amazon search result
      // Process and send to Kaazing Gateway
      @Override
      public void onSearchResult( AmazonResult result ) {
        process( result );
      }
    
    };
    amazonTask.execute( resultContents );
    

Creation of the Task (a thread) starts by simply instantiating an instance of the class.  The class contains a public "callback" property.  That callback property is a reference to an "AmazonListener" interface.  You must then provide your own implementation and assign it to the callback.

The interface is simple, containing only one method to be implemented.  The "onSearchResult" method will get a String of the response from Amazon.  That String is in JSON (JavaScript Object Notation) format, and will need to be parsed.  There is a lot of data returned, but I pick off a few key fields for display in the shopping cart.

Once the Task is complete, the thread is killed and the memory returned the operating system.  To do another lookup, simply instantiate the Task again, and execute it by passing the UPC value returned from the scanner.  Trying to use the same Task instance again will result in an exception.

### Kaazing Gateway

At this point I certainly could just push the results into a List for display, but I want to keep the Web client (or any other client for that matter) in sync with the native application.  To accomplish this, I turn to the power of publish/subscribe as exposed by Kaazing Gateway.

Because a persistent connection is established from my native application to Kaazing Gateway, it is again important to not run this functionality on the UI thread.  We cannot use a Task here because this is a long-running process, which will be used throughout the life of the application.  The Android documentation suggests using a Handler subclass (also a Thread) for this type of operation.

Using threads in this fashion leads to some interesting challenges.  The main consideration here is how to get data from the network thread to the UI thread.  As it turns out, the Android documentation suggests using a publish/subscribe pattern.

When the network thread has information it wants to pass onto other application threads it uses the operating system MessageQueue.  You can send a message to the queue, and the UI thread can pick that message up, and put the data into the respective user interface.

> As a Kaazing employee, somebody who champions the use of publish/subscribe, having the Android documentation recommend the same pattern was an awesome discovery.  I will cover this in more detail in a future post.

There is a lot going on in communicating to Kaazing Gateway, so to make this process easier, I wrote a Handler subclass to wrap the functionality.  To use this subclass you must in turn subclass it in your application, and implement the "handleMessage" method.

    // Kaazing Gateway for messaging
    gateway = new GatewayHandler();
    gateway.setVerbose( true );
    gateway.connect( KAAZING_ID );
    
    // Publish message
    // May not be connected yet
    if( gateway.isConnected() ) {
      gateway.publish( TOPIC, sw.toString() );
    }
    
    // Inner class for Kaazing Gateway thread
    private class GatewayHandler extends Gateway {
    
      // Override message handler
      // Evaluate inter-processes message
      public void handleMessage( Message message ) {
        Bundle  bundle;
        String  body;
    
        // Get message content
        bundle = message.getData();
    
        // Do something with the resulting data
        // Evaluate action key in message data
        switch( bundle.getString( KEY_ACTION ) ) {
    
          // Your code here
    
        }
    }
    

The first step is to instantiate the Handler subclass, which I have called "Gateway".  To facilitate getting the data to the UI components, I use an inner class that subclasses the "Gateway" thread.  That inner class is called "GatewayHandler" here.  To send a message to Kaazing Gateway, simply call the "publish" method, passing the topic name you want to use, and the data to send (a JSON string in this case).

When events happen from the Kaazing Gateway, the "Gateway" super class will send a message to the Android operating system.  To handle the message, implement the "handleMessage" method.  From there you can decide what actions you want to take.  In the case of this shopping cart application, I populate the user interface with the data.

### Next Steps

It is important to note that this application sends the data to Kaazing Gateway (and other interested clients) before populating the shopping cart list.  This means that the Web client also receives this message, and populates the Web-based shopping cart at the same time.

Because the two applications, running on completely different technology stacks, are kept in sync, whatever happens to one, happens to the other.  If you remove a shopping cart item from the Web-based application, the item will also be removed from the native application.

*The two applications (Web and native) are completely decoupled, and know nothing about one another.  They can be developed completely independent of one another, yet at the same time, take advantage of the data regardless of where it originates.  This is the power of the publish/subscribe pattern and Kaazing Gateway.*

It occurred to me while developing this application, that there could in turn be yet another application, written on yet another completely different technology stack, to manage product pricing.

As an example, a back-office application, managing the supply chain logistics, might see a spike in the purchase of a certain product, and raise a notification.  At that point, the vendor may choose to lower the price of an in-demand product.  This would send another message, and all the shopping cart applications, native or otherwise, would change instantly to show the new price.

When we stop thinking in terms of the request/response pattern, and move to a publish/subscribe pattern, a whole new world of possibilities emerge.  I like to think of this as why have some of the data some of the time, when you can have all the data, all of the time?
