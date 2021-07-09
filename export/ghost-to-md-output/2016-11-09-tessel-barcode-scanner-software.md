---
title: "Tessel Barcode Scanner: Software"
slug: tessel-barcode-scanner-software
date_published: 2016-11-09T18:24:56.000Z
date_updated: 2019-01-17T00:45:16.000Z
tags: tessel, watson, iot, barcode
---

In my previous post, I show how you can connect a barcode scanner to a USB port on the Tessel, and read the scanned values. While that is interesting, what is more interesting is in doing something with that value. In this post we will take a look at finding a related product, and then communicating that information over Watson IoT.

### The Barcode Wild West

Barcodes are one of those addictive pieces of technology. Simple stripes, printed on a piece of paper, become digits. Amazing! And barcodes are everywhere. Once your scanner is connected to your Tessel, if you are like me, you will find yourself running around your house looking for things to scan.

In some cases, such as a barcode on Netflix DVD envelope, there is not much to do with this information. It is likely some internal routing number. Most commercial products, like things you buy at the grocery store, also have barcodes, and these uniquely identify the item in a database.

What is more is that these barcodes are often unique for that product on a global (or at least national) scale. The barcode on a bag of Cheetos for example, needs to tell the POS (point of sale) system that it is a bag of Cheetos regardless as to where you are shopping. This means that there must be a universal database of these codes and their product mappings.

Not so fast, cowboy!

Databases like this do exist, but they are generally expensive - mainly because they are expensive to maintain. Companies like Amazon, who you know has an extensive database of barcode mappings, provide lookup services, but they put tight restrictions around their usage. You did not expect them to let that costly database go for free did you?

Over the years, many a crowd-sourced database has come and gone. It turns out it is really hard to make a business on barcode mappings. Which is yet another reason why the databases tend to be so expensive. Some databases also only cater to specific categories like electronics, or music CDs (what is that?).

> Another business model around barcode databases is APIs around helping you manage your own inventory, taxes, shipping, etc. The [Google Content API for Shopping](https://developers.google.com/shopping-content/v2/quickstart) is an example of this approach.

The option I will be using for this demonstration is a crowdsourced offering from [ProductLayer](https://developer.productlayer.com/documentation?version=0.5). ProductLayer has a commercial side called [Prod.ly](https://prod.ly/home). I like to think of Prod.ly as a social network for people that geek out about scanning barcodes. While the database is not as extensive as Amazon, it is an easy-to-use starting point.

### Using ProductLayer

To use the barcode database from ProductLayer, you first have to create a free account. From there you can create an application, which will result in an API key. This API key is used in the HTTP header when making requests against the ProductLayer services.

    // Look up product detail
    request( {
      uri: config.prodly_url + '?gtin=' + barcode,
      headers: {
        'API-KEY': config.prodly_key
      }
    }, function( error, response, body ) {
      var data = null;
      var message = null;
    
      // Parse
      data = JSON.parse( body );
    
      // Debug
      console.log( data[0]['pl-prod-name'];
    } );
    

The ProductLayer service provides a GET endpoint to query their barcode database. When you run the query you can get multiple responses (JSON array) as sometimes barcodes map to multiple items. For this application I am going to take the first item returned and pass that to Watson IoT.

> I do the product lookup on the Tessel because that is where it feels most natural. The Tessel has fast and stable wireless access, plenty of memory and CPU, and is where the physical action is taking place.

### Watson IoT

I have covered using the Tessel with Watson IoT in a [previous post](http://www.kevinhoyt.com/2016/09/01/tessel-on-watson-iot/), so I will not belabor the point here other than a high level review. You can get access to [Watson IoT](https://console.ng.bluemix.net/catalog/services/internet-of-things-platform/) from [IBM Bluemix](https://console.ng.bluemix.net/).

Watson IoT, at its core is an [MQTT](https://en.wikipedia.org/wiki/MQTT) broker. Created at IBM, MQTT is a common pub-sub protocol for IoT devices. There are several Node.js implementations of MQTT in both client and broker form. I will use "[MQTT.js](https://github.com/mqttjs/MQTT.js)" for this project.

    var mqtt = require( 'mqtt' );
    
    // Connect to Watson IoT
    var client = mqtt.connect( 
      config.iot_host, 
      {
        clientId: config.iot_client,
        username: config.iot_user,
        password: config.iot_password,
        port: config.iot_port
      }
    );    
        
    client.on( 'connect', function() {
      // Debug
      console.log( 'IoT connected.' );
    } );
    

The first step is to connect the Tessel to Watson IoT. Once connected, we will simply let it sit there waiting to be used. MQTT.js is robust enough to handle reconnecting should there be a network problem or client conflict.

    var data = null;
    var message = null;
    
    // Parse
    data = JSON.parse( body );
    
    // Default message
    message = {
      barcode: barcode
    };
    
    // Look for match
    if( data.length > 0 ) {
      message.product = data[0]['pl-prod-name'];
    }
    
    // Debug
    // Product
    console.log( message.product );
    
    // Publish to Watson IoT
    client.publish( 
      config.iot_topic, 
      JSON.stringify( message ) 
    );  
    

When a barcode value is read by Node Seriaport, and the lookup against ProductLayer is complete, I check to see if there was any match. If there was a match, then I return the first element in the resulting array, as well as the barcode itself. If there was no match, then I simply return the barcode.

These details are then published to Watson IoT.

### Node.js on IBM Bluemix

You may or may not have heard of [Cloud Foundry](https://www.cloudfoundry.org/). Cloud Foundry is an open architecture for cloud applications. IBM is a Cloud Foundry provider (via Bluemix), and you can quickly and easily deploy applications running everything from Java, to ASP.NET, and Node.js.

I created a Node.js application instance in Bluemix for this example. The Node.js application serves several purposes.

First, it listens for barcode messages from Watson IoT. There is a [browser implementation](http://www.eclipse.org/paho/) of MQTT in JavaScript, but then I would have to provide credentials in the open.

    // Watson IoT
    var iot = mqtt.connect( config.iot_host, {
      clientId: config.iot_client,
      username: config.iot_user,
      password: config.iot_password
    } );
    
    // Connected to broker
    iot.on( 'connect', function() {
      // Debug
      console.log( 'Connected to Watson.' );
    
      // Subscribe to barcode scans
      iot.subscribe( config.iot_topic );  
    } );    
    
    // Message from broker
    iot.on( 'message', function( topic, message ) {
      var data = null;
    
      // Buffer to String
      data = message.toString();
    
      // Debug
      console.log( data );
    
      // Send to clients
      for( var c = 0; c < socket.clients.length; c++ ) {
        if( socket.clients[c] != this ) {
          socket.clients[c].send( data );
        }
      }
    } );
    

To get around this, the Node.js application also hosts a [WebSocket](http://caniuse.com/#feat=websockets) server. This means that any platform that can communicate over WebSocket (which include iOS, Android, and many others), can securely listen for barcode messages.

    // Sockets
    var server = http.createServer();
    var socket = new ws.Server( {
      server: server
    } );
    
    // Client connected
    socket.on( 'connection', function( client ) {
      // Debug
      console.log( 'WebSocket connection.' );
    } );
    

> I use the same MQTT package on the Tessel as I use for the server application - JavaScript FTW!

Finally, the Node.js application runs [Express](http://expressjs.com/) for a web server.

    // Web
    var app = express();
    
    // Static for main files
    app.use( '/', express.static( 'public' ) );
    
    // Cloud Foundry support
    // Bluemix
    var env = cfenv.getAppEnv();
    
    // Listen
    server.on( 'request', app );
    server.listen( env.port, '0.0.0.0', function() {
      // Debug
      console.log( 'Started on: ' + env.port );
    } );
    

### Browser Display

The last part of this project then is to display the barcode, and product name if any, in the browser. When the browser application starts, it connects to the Node.js application via WebSocket. When a message arrives at the server, and is passed to the client (browser), the details are displayed.

    var Barcode = ( function() {
    
      var display = null;
      var socket = null;
    
      var doSocketMessage = function( evt ) {
        var data = null;
    
        // Parse
        data = JSON.parse( evt.data );
    
        // Debug    
        console.log( data );
    
        // Populate display
        // Name or raw barcode
        if( data.product ) {
          display.innerHTML = data.product;
        } else {
          display.innerHTML = data.barcode;
        }
      };
    
      // Connected
      var doSocketOpen = function() {
        console.log( 'Socket open.' );
      };
    
      // **
      // Initialize
      // **
      
      // References
      display = document.querySelector( '.display' );
    
      // Socket
      socket = new WebSocket( 'ws://' + window.location.host );
      socket.addEventListener( 'open', doSocketOpen );
      socket.addEventListener( 'message', doSocketMessage );
    
      // Reveal
      return {
    
      };
      
    } )();
    

> I like to use the "reveal pattern" in my JavaScript to keep my application properties from polluting the global namespace.

This code will execute as soon as loaded, and will immediately create a WebSocket connection from the browser, back to the originating server (not a requirement for WebSocket, BTW). It then adds an event listener for any messages coming from the server. When a message arrives, it is parsed, and the content is displayed on the screen.

### Next Steps

Now we can scan a barcode using our Tessel, lookup any product specifics from a third-party database, pass that information to a Node.js server, and then push that information to a connected client via WebSocket. All the parts are decoupled from one another thanks to the publish-subscribe pattern, and the whole process executes in a fraction of a second.

From here you might establish routes in the Node.js server application to handle additional shopping cart actions - perhaps mapping to the the Google Content API for Shopping. You can even reuse the WebSocket for removing items from the client, and propagating that back into an order database.
