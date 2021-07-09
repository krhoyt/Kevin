---
title: Your Browser on Watson IoT
slug: your-browser-on-watson-iot
date_published: 2016-04-28T20:27:20.000Z
date_updated: 2016-04-28T20:27:20.000Z
tags: watson, iot, pubsub, browser, web, websocket
---

In my [previous](http://www.kevinhoyt.com/2016/04/27/particle-photon-on-watson-iot/) blog post, I connected a [Particle Photon](https://www.particle.io/) to [Watson IoT](https://console.ng.bluemix.net/catalog/services/internet-of-things-platform/).  At several points during that post I mentioned the subtleties of device connectivity versus application connectivity, but I did not really show the application side.  In this post, I will pick up the messages from the Photon in the browser, as an application, and as delivered by Watson IoT.

### Particle Photon

Just to review, I have a Particle Photon connected to Watson IoT as a device.  The Photon does not do anything more than increment an integer once per second - counting.  As it increments that value, it also publishes the value to Watson IoT on the topic "iot-2/evt/count/fmt/json".

    {count: 1}
    

The Photon device is of type "Particle" with an ID of "Photon".  It uses a "WebVisions" seed for the client ID.  The organization, as provided by the Watson IoT instance on Bluemix is "ts200f".  That is a lot of details to track, but they will be needed on the application side in the browser.

### API Key

Unlike connecting as a device, where only a token specific to that device is needed, connecting as an application requires an API key and token pair.  To get an API key, we need to head to our Watson IoT Platform instance on Bluemix, then click on the "Access" icon.

![Get an API key and authentication token from Watson IoT.](http://images.kevinhoyt.com/watson.iot.api.key.png)

Once you are on that screen, click on the "api keys" link just below the screen title.  From there you will see a button to "Generate an API Key".  Unlike configuring a device type or instance, you will only get one screen to capture the token value - it will not be presented again.  You want to record both the API key and authentication token.

### Browser

To be able to connect from the browser, which we will treat as an application, to Watson IoT, we will need a JavaScript library that can connect using MQTT.  The Eclipse Paho project has just such a [client](https://www.eclipse.org/paho/clients/js/), based on WebSocket.

    <script 
      src="mqttws31.js" 
      type="text/javascript">
    </script>        
    
    ...
    
    var client;
    
    window.addEventListener( 'load', function() {
      try {
        client = new Paho.MQTT.Client(
          'ts200f.messaging.internetofthings.ibmcloud.com', 
          1883, 
          'Counter' + Math.round( Math.random() * 1000 )
        );
      } catch( error ) {
        console.log( 'Error: ' + error );
      }    
    
      client.connect( {
        userName: 'a-ts200f-lp7shitt3q',
        password: 'ghTN2UIV48aUEyjj1s',
        onSuccess: doClientConnect,
        onFailure: doClientFailure
      } );
    
    } );
    

Because you will want the client to be long lived, you will want to make sure to declare it at an appropriate scope (global).  Then when you are ready, in this case the page load event, we can instantiate the client instance.  Note that the host is "ts200f.messaging.internetofthings.ibmcloud.com" where "ts200f" is the Watson IoT organization name.

With the client instantiated, we can now connect to Watson IoT.  The username is the API key from the previous step.  The password is the authentication token from the previous step.  Optionally, I have specified listeners to know when the client connects (or does not).  The failure event is especially useful when learning Watson IoT.

    function doClientConnect( context ) {
      console.log( 'Connected.' );
    
      client.onMessageArrived = doMessageArrived;
      client.subscribe( 'iot-2/type/Particle/id/Photon/evt/count/fmt/json' );    
    }    
    
    function doMessageArrived( message ) {
      var data = null;
        
      data = JSON.parse( message.payloadString );    
      console.log( 'Count: ' + data.count );
    }
    

When the client has connected we add an event listener for message handling.  From there we subscribe to the topic that will surface the count event created on the Particle Photon.

The topic name always starts with "iot-2/".  From there we specify the device type with "type/Particle".  Then the device ID we are interested in with "id/Photon".  Next up is the event we are interested in using "evt/count".  And finally is the message format type of "fmt/json".

> An asterisk (*) can be used for device type, device ID, and event type as a wildcard.  For example, if the Photon creates a "temperature" and "humidity" event, then you might use "evt/*".

When a message arrives, the data will be the "payloadString" on the message object.  To get at the data then we will need to parse the JSON to a JavaScript object.  What you do with the data from there is up to you.  Keep in mind that MQTT is really optimized for devices, so you should not be passing large volumes of data in your messages.

### Next Steps

In this situation we have connected the browser to Watson IoT as an application.

Keep in mind that the differentiation between devices and applications on Watson IoT is really a matter of the client ID, and the method used to authenticate.  In this sense, there is nothing stopping you from connecting another Photon as an application.  Perhaps it displays the count on a 7-segment LED display.

You are now well on your way to building a Watson IoT application using real-time messaging.

For a handful of Photons this works great.  At scale, say thousands of deployed devices, the data is going to come so fast that visualizing it could prove a challenge.  From here you might roll in [Apache Spark](https://console.ng.bluemix.net/catalog/services/apache-spark/) at the edge to process messages, and raise exceptions or perform analytics.
