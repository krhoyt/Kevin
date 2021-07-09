---
title: Cloudant Continuous Feed
slug: iot-with-cloudant-follow
date_published: 2015-08-20T18:54:27.000Z
date_updated: 2015-08-20T18:58:26.000Z
tags: iot, pubsub, weather
---

Over the [past](http://blog.kevinhoyt.com/2015/08/13/weather-on-android/)[several](http://blog.kevinhoyt.com/2015/08/13/weather-on-android/)[examples](http://blog.kevinhoyt.com/2015/08/18/iot-weather-on-android/), new documents in [IBM Cloudant](http://cloudant.com) have been discovered by continuously polling the database.  This is not only inefficient at scale, but creates a tight coupling between our clients and the server.  With a little tweaking to our existing code, Cloudant can tell us when changes have taken place, which can then be pushed to the interested clients.

### Server

Before we go jumping into new features, let us set the baseline of what our code looks like.  I will be using the IBM Cloudant Node.js package to connect to a Cloudant database.  Interaction with the database (CRUD) is done using Express routing.

    // Database
    var ibmdb = null;
    
    // Connect
    Cloudant( {
      account: configuration.cloudant.username,
      password: configuration.cloudant.password
    }, function( error, cloudant ) {
      if( error ) {
        console.log( 'Could not connect to Cloudant.' );
        console.log( 'Message: ' + error.message );
      }	
    	
      // Debug
      console.log( 'Connected to database.' );
    
      // Use database
      // Assumes the database exists
      console.log( 'Using database.' );
      ibmdb = cloudant.db.use( CLOUDANT_DATABASE );
    }
    

I make a lot of assumptions here about the existence of the database, whether we have access to write to the database, etc.  You will want to adjust this boilerplate to match your specific requirements.

### Feed Me

Now that we are connected to IBM Cloudant, we want to tell the database to notify our client (in this case Node.js) when changes have occurred.  One of the parameters you need to consider then is "changes since when?"  You may also want to know what the changes were, not only that there was a change.

    stream = ibmdb.follow( {
      include_docs: true, 
      since: 'now'
    } );
    

Yup!  That is all it takes!  Add this code snippet to the bottom of the previous one, and your Node.js application will get updates about changes to the database ... Kind of.

> Note that I use the "include_docs" parameter to get the content of the changes to the database.  This may impact IBM Cloudant performance, so consider if you really need it, or if you can just get away with the document ID and revision.

The variable "stream" here is declared on the module scope in order to keep it around.  This is because we need to add an event listener to it if we actually want to see the changes that have been made to the database.

    // Database change
    stream.on( 'change', function( change ) {
      console.log( 'Change: ' + change.doc );
    } );
    

Now not only does our Node.js client get notifications, but we can actually see them in the log (smile).  What about getting those changes to the browser?

### Publish-Subscribe

Earlier I mentioned that access to IBM Cloudant was done through Express routing.  This leads us to a pattern of request-response.  If you have never done any other type of pattern, it may seem like the only one available.  The result is that everything becomes a REST endpoint.

A fantastic alternative worth learning more about is publish-subscribe.  The publish-subscribe pattern has been around for ages in IT, but with the addition of WebSocket to the browser, is really only finding its way there more recently.  Using publish-subscribe gives you a very loosely coupled architecture.

There are many ways to get started with publish-subscribe, but perhaps my favorite is a service called, [PubNub](http://pubnub.com).  PubNub is also an IBM partner, and you can find them in the IBM Marketplace, and soon the IBM Bluemix catalog of services.  Simply put, PubNub provides libraries for many different platforms that allow you to tap into their real-time network.

    // Declared on the module scope
    var pubnub = require( 'pubnub' )( configuration.pubnub );
    
    ...
    
    // Added just after the log code above
    pubnub.publish( { 
      channel: PUBNUB_CHANNEL,
      message: change.doc,
      callback : function( results ) {
        console.log( results[1] + ': ' + results[2] );  
      },
      error: function( error ) {
        console.log( 'Failed to publish message.' );
        console.log( error );  
      }
    } );
    

With this addition, your Node.js process is now not only getting notified of changes to IBM Cloudant, but also pushing notifications to any interested parties - on any interested platform - PubNub is not just WebSocket, and can be used in many other ways, on many other clients.

### Browser

Speaking of clients, let us take a jump over to the browser.  This is where we really want database changes to show up - at least for the weather application we have been working through over the past several posts.

If you recall, we have a Particle Photon sending data to our Node.js infrastructure on IBM Bluemix.  We then have a browser application polling the Node.js infrastructure for the latest updates.  What we really want to happen is that new weather readings arriving from the Photon are pushed to the browser.

    <!-- PubNub library -->
    <script src="https://cdn.pubnub.com/pubnub-3.7.13.min.js" type="text/javascript"></script>
    
    ...
    
    // Initialize
    var pubnub = PUBNUB( configuration.pubnub );
    	
    // Subscribe	
    pubnub.subscribe( {
      channel: PUBNUB_CHANNEL,
      message: update	
    } );
    
    ...
    
    // A new update has arrived
    // Show the related document
    function update( data )
    {
      console.log( data );
    }
    

That is all there is to it.  We include the PubNub library, initialize it, and then subscribe to messages.  Messages are delivered on a specific channel - the same channel we defined in our Node.js/IBM Cloudant configuration.  In this case, the log at the browser will show the same document that we log from Node.js.

### Next Steps

What is really going to bake your noodle is that the Photon sensor, could also communicate with PubNub directly.  This shifts our development paradigm considerably.  The sensor publishes data to PubNub, then the Node.js server, as well as the browser, are both subscribed (listening) for those messages.  None of them know anything about the other, yet the same results are possible - and more scalable.

> It is entirely possible under this architecture, that you might not even need the IBM Cloudant continuous feed feature.

Want an Android device to take part in the conversation?  Just have it subscribe as well.  Maybe you want to report weather data from the sensors on the Android phone?  Just have it publish the data.  The device does not need to worry about IBM Cloudant at all - or the browser, or Node.js, or anything else.

Loosely decoupled architectures is something I will be exploring in greater detail in a future series of posts.  If you have any questions in the meantime, please feel free to post a comment below.  You can also get the complete code for my IoT-enabled weather application on [GitHub](https://github.com/krhoyt/IBM/tree/master/iotweather).
