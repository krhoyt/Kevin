---
title: WebSocket on IBM Bluemix
slug: websockets-on-ibm-bluemix
date_published: 2015-09-02T00:25:21.000Z
date_updated: 2015-09-02T00:25:21.000Z
tags: websocket, bluemix
---

As IBM Bluemix can host a variety of language runtimes (PHP, Node.js, Python, Ruby, ASP.NET, to name a few), and most languages have a WebSocket server implementation, you can then in turn run a WebSocket server on IBM Bluemix.  In this post I will take a look at building and deploying a chat application on Node.js using WebSocket.

### IBM Bluemix

If you do not already have an account on [IBM Bluemix](http://bluemix.net), then you will want to create one, and familiarize yourself with deploying applications.  The code used by the default application instance (inclusive of any flavor) is provided for download when you start said instance.  The process of getting started with IBM Bluemix is beyond the scope of this post.  Please look back at some of my earlier posts to [learn](http://blog.kevinhoyt.com/2015/08/04/bluemix-mobile-runtimes)[more](http://blog.kevinhoyt.com/2015/07/28/bluemix-crawl-runtimes/).

### Server

For this implementation, I will be using [Node.js](http://nodejs.org).  Because of the vast breadth of packages available, Node.js tends to be my server implementation of choice these days.  When it comes to WebSocket, there are several Node.js implementations.  I will get into what differentiates them in a little bit, but for this server I will be using "[ws](https://github.com/websockets/ws)".

    var cfenv = require( 'cfenv' );
    var express = require( 'express' );
    var http = require( 'http' );
    var ws = require( 'ws' );
    
    // Environment
    var environment = cfenv.getAppEnv();
    
    // Web
    var app = express();
    
    // Static
    app.use( '/', express.static( 'public' ) );
    
    // Sockets
    var server = http.createServer();
    var sockets = new ws.Server( {
      server: server
    } );
    
    // Listeners
    sockets.on( 'connection', function( client ) {
      // Debug
      console.log( 'Connection.' );
    
      // Echo messages to all clients
      client.on( 'message', function( message ) {
        for( var c = 0; c < sockets.clients.length; c++ ) {
          sockets.clients[c].send( message );   
        }
      } );
    } );
    
    // Start
    server.on( 'request', app );
    server.listen( environment.port, function() {
      console.log( environment.url );
    } );
    

That is the entirety of a chat server using WebSocket.

**Environment**

After including the necessary packages, we use the "cfenv" ([Cloud Foundry](https://www.cloudfoundry.org) environment) functionality to get information about the environment in which our application is running.  This is key for assigning ports.

WebSocket connections initially start life as normal HTTP requests on port 80 or 443.  Along the way however the connection is "upgraded" at which point it becomes an open socket for you to send any data type your application needs (even binary data).

> Aside from the HTTP handshake and upgrade, a WebSocket is a TCP socket.  If you had a [VNC server](http://www.tightvnc.com) that supported that handshake, you could run a remote connection client directly in the browser.

**Web**

While it is probably a bit overkill for this application, I am using [Express](http://expressjs.com) for the web server.  Keep in mind that a WebSocket is (generally) initiated from a web page in a browser.  This means you need to deliver the web page to the browser in the first place, and that means you need a web server in addition to the WebSocket server.

In a slightly more well-rounded application, I actually use Express routing to expose a REST API to control the features of the chat server.  It also uses [Mongoose](http://mongoosejs.com) with [IBM Compose](http://compose.io) (MongoDB) to record the chat history.  There is even custom avatar support, geolocation, and inline images in the chat.  This is where using Express really shines.

**Sockets**

As mentioned, WebSockets start their lives as normal HTTP requests.  This is why we use the "http" package to create a server.  We then tell the WebSocket server, to latch onto the HTTP server instance.  I am not sure what happens under the covers here, but I would guess that the "ws" package is configuring the HTTP server to get access to the raw incoming request, so it can look for a WebSocket request, and handle the upgrade, connections, etc.

**Listeners**

When a connection comes in, we can take a number of roads.  As a chat server, we want to get any incoming messages, and route them back to any of the connected clients.  The WebSocket server keeps track of the connected clients, which we can iterate over and echo the incoming message.

You might notice that there is no differentiation between clients - including the client sending the original message.  As a matter of preference, for most of my applications, I do not take action in the user interface of the sending client, until the message has been received.  This has saved me countless times while debugging real-time applications.

    // Not back to sender
    if( sockets.clients[c] != this ) {
      sockets.clients[c].send( message );                                    
    } 
    

The above snippet will not send the incoming message back to the original sender of that message.  This is where the aforementioned Express routing can come in handy.  You could setup a REST API to set a flag on the server that says whether or not it should echo the message back to the sender.  [IBM Redis](https://console.ng.bluemix.net/catalog/redis-by-compose/) makes a great solution for these types of flags.

**Start**

Last but not least, we need to start our server.  Because we want to use Express for the routing, we need to tell the server about our Express settings.  Then we need to start the server, but we need to be considerate of the IBM Bluemix Cloud Foundry environment.

You can run this locally, and a port will be assigned to your application.  You can also detect if the application is running locally, and then assign your own port.  I am not picky about port assignments when developing locally, so I just let it assign whatever it wants, and then tell me at the console.

### Browser

The [WebSocket API](http://www.w3.org/TR/websockets/) in the browser is well documented.  I would encourage you to look around the WebSocket documentation to learn more.  In the interest of completeness however, here is the basics of a chat application for our server.

    var input = null;
    var socket = null;
    
    // Input
    input = document.querySelector( 'input[type=\'text\']' ); 
    input.addEventListener( 'keypress', doInputKey );    
    
    // WebSocket
    socket = new WebSocket( 'ws://' + window.location.host );
    socket.addEventListener( 'message', doSocketMessage );
    
    // Keyboard
    function doInputKey( event ) {
      var message = null;
    
      if( event.keyCode == 13 && this.value.trim().length > 0 ) {
        message = {
          content: this.value.trim(),
        };
        
        // Send message
        socket.send( JSON.stringify( message ) );  
      }     
    }
    
    // Message
    function doSocketMessage( message ) {
      var data = null;
      var element = null;
    
      // Parse
      data = JSON.parse( message.data );
    
      // Build and append
      element = document.createElement( 'p' );
      element.innerHTML = data.content;
      document.body.appendChild( element );
    }
    

Given an HTML document, with an INPUT element inside it, this is functionally all you need for a chat application on the client side.  As I mentioned earlier, you could certainly get far more ambitious by adding custom avatars, inline images, etc.

**Input**

In order to have a chat client, we need a place for the user to enter some content.  That is the INPUT element, though you could certainly use an editable DIV element as well.  In fact, if you were building a game, the "input" might be an [HTML5 Canvas](https://html.spec.whatwg.org/multipage/scripting.html#the-canvas-element) with a thumb control and buttons.

**WebSocket**

There are polyfills for WebSocket, but it has been around now for some time, and is [broadly available](http://caniuse.com/#feat=websockets) across desktops and devices.  Notice that rather than "http://" we tell the socket to connect to "ws://" - this is part of how the handshake works.  Just as there is "https://" there is also "wss://" in the WebSocket world.

Because I am often developing locally, pushing to IBM Bluemix, testing, and then making changes locally again before pushing a finished build, I use "window.location.host" to abstract the server for me.  However, WebSocket connections can be made cross-domain.  This is an implementation detail of the server and handshake.

**Keyboard**

Rather than provide a button to send a message, most chat applications these days (from [Google Hangouts](https://www.google.com/search?client=safari&amp;rls=en&amp;q=google+hangouts&amp;ie=UTF-8&amp;oe=UTF-8) to [iOS Messages](http://www.apple.com/ios/whats-new/messages)) use the return key to trigger sending a message.  This is easy enough to do, but I also check to make sure there is at least some content to send (where this would otherwise be an dis/enabled button).

The data I am sending across the WebSocket is a JSON object.  The format of that JSON object - that is to say the properties it has - are completely up to you.  I would suggest that many smaller message generally work better than fewer longer ones, but the problem you are trying to solve may differ.

You could for example, store an update to the entire application model in a database, and then send a WebSocket message to tell the other applications to pull the latest model.  The number of interesting techniques you can employ as a developer expands considerably when you leverage WebSocket.

**Message**

When a message arrives from a WebSocket server, the data itself is actually on a "data" property.  There are other properties on the event itself, that are injected along the way.  In this case, the "message" object from the previous step is now found at "message.data".  We parse that string and populate the DOM.

### Next Steps

WebSocket brings with it a vast array of new options.  It is not however without problems.  Problems that can be solved, to be sure, but problems that take real consideration up front to make sure that you have a system that will last as long as you want it to.  Some of those considerations might include:

- Given that the "message" object in our application can take on any form we desire, this could quickly lead to a brittle dependency between systems.
- We also have no guarantee that the message we sent actually made it to the server - or the other clients.
- We have no presence awareness here either - clients can come and go, and your application would never know the difference.  If you want to show who is in a chat room, this presents a real challenge.
- What if the server goes down while delivering a message?  What about all those abandoned disconnected clients that do not know the server went down?

As it turns out, using WebSocket introduces a pattern that has long since been around in enterprise system design known as,  publish-subscribe (message brokers).  All of these problems can be solved by leveraging a more robust server and message protocol (format of the data).  There are even cloud offerings for this pattern, such as the IBM Partner, [PubNub](http://pubnub.com).

*Image courtesy of [Wikipedia](https://en.wikipedia.org/wiki/Tap_and_die).*
