---
title: WidgetY and the New Web
slug: widgety-and-the-new-web
date_published: 2014-11-06T16:00:00.000Z
date_updated: 2015-04-21T14:20:34.000Z
tags: arduino, photocell, websocket
---

*My how time flies! The Widget Company has gone on to make many new friends with the revolutionary WidgetX device. Connected to the Internet, you have the power to control an LED through a simple web page. Magnificent! Sales are at an all-time high, and customers love it.*

*With that kind of success comes new demands in the form of feature requests. The Widget Company has listened, and today is proud to introduce the world to WidgetY. WidgetY is a marvel of modern technology, allowing you to remote monitor the amount of light in a room.*

---

While the press is amazed with how The Widget Company has managed to pull off yet another disruptive product, the developer audience is wondering how it is done. Luckily, there is a session at the launch event, and a seat with our name on it (after waiting in line for two days). How does one remotely monitor light levels?

### Circuit Diagram

Okay, so the workhorse under the hood in WidgetY is a light-dependent resistor (LDR), also commonly known as a photocell. The leads (wires) on the photocell are connected to a thin piece of silicon in the center. Silicon reacts to light. The more light, the more electricity it will let pass through. The less light, the more resistance it gets, slowing down the flow of electricity.

![5V to photocell. Out through 10K resistor to ground. Analog pin 0 to same row as ground.](http://images.kevinhoyt.com/fritzing.photocell.png)

Probably the trickiest part of this circuit is the pull-down resistor. If the pull-down resistor is too small, even the slightest light will cause the photocell readings to spike. We want a nice range of readings for our given light source (a room in a house). To achieve this range of readings, we will use a 10K resistor.

> A pull-down resistor holds the logic signal near zero volts when no other active device is connected.

### Arduino Yun

Certainly we could have treated this device the same as the LED from the previous post on WidgetX. We could poll from the web page using XMLHttpRequest (XHR) in the background, updating the web page over time, but at updating every few seconds it would have been horrendously slow.

Why every few seconds? The 16 MHz processor on the Arduino is simply not going to handle much more. Even for our LED, there was a second or two lag while the HTTP request was parsed.

Why does that matter? Recall from the first post in this series that consumers have come to expect immediate gratification. While a few seconds delay between updates may have worked, our consumers would have seen this as half-baked. Our competitors would have seen it as opportunity. In this end, this will very much be the way vertical IoT battles will be won - not on hardware per se, as much as the experience provided to the consumer.

> If you are not going to wait but seconds for your HD streaming video to load, you are sure as heck not going to wait five seconds for a dedicated IoT device to respond.

Effectively what WidgetY needs to deliver that experience is the ability to push data from the device to a web page as fast as it possibly can. In a perfect world, it would be faster than the human eye could read it, but then we would throttle (analytics) it as necessary at the client. It turns out that in the New Web, there is a standard that can do exactly this - WebSocket.

### Enter WebSocket

WebSocket was introduced to the web stack in February 2010, and has been stabilized in the form of [RFC 6455](http://tools.ietf.org/html/rfc6455) as of December 2011. WebSocket has been in all major browsers, both desktop and mobile, for some time now. WebSocket allows us to open a socket connection to a remote server, and keep it open. Data can then travel in either direction across the wire at any time.

Not only is [WebSocket](http://caniuse.com/#feat=websockets) in your favorite browser, on your favorite device, but it is also available, in the form of various libraries, for Arduino (and many other boards/chipsets). As WebSocket emerged in 2010, I partnered with Branden Hall to build an Arduino implementation. He did some amazing work on supporting the [Roving Network's WiFly](https://www.sparkfun.com/products/9954) chipset as well. You can grab this library from [Branden's GitHub repository](https://github.com/brandenhall/Arduino-Websocket).

How the WebSocket works on the Arduino is generic to the means of communication. This means that while it can work on the WiFly, it can also work using ethernet, or in our case, the Arduino Yun.

    // Libraries
    #include <Bridge.h>
    #include <WebSocketServer.h>
    #include <YunClient.h>
    #include <YunServer.h>
    
    // Literals
    #define CALLBACK_FUNCTIONS 0
    #define DEBUGGING
    #define MAX_FRAME_LENGTH   64
    #define SOCKET_PORT        8383
    
    // Constants
    const int PHOTOCELL = 0;
    
    // Server
    YunServer server( SOCKET_PORT );
    
    // WebSocket protocol
    WebSocketServer socket;
    
    // Setup
    void setup() 
    {  
      // Analog input
      pinMode( PHOTOCELL, INPUT );
      
      // Leveraging the SoC libraries
      // Not using port 80
      Bridge.begin();
      server.noListenOnLocalhost();
      server.begin();
    }
    
    // Loop
    void loop() 
    {
      int       light;
      String    data;
      YunClient client;
     
      // Accept incoming client request
      client = server.accept();
      
      // If tehre is a client
      if( client ) 
      {
        // If connected as WebSocket
        if( client.connected() && 
            socket.handshake( client ) ) 
        {  
          // As long as the client is connected
          while( client.connected() ) 
          {
            // Read the analog light value
            // Send as string to client
            light = analogRead( PHOTOCELL );
            socket.sendData( String( light ) );      
          }
        }
      }
      
      // Fully disconnect before loop
      delay( 100 );
    }
    

### Web Client

![Charting brought to you by the letters S, V, and G. Woot!](http://images.kevinhoyt.com/iota.web.photocell.jpg)

Leveraging WebSockets in JavaScript is pretty straightforward work. First, you create an instance of WebSocket. As an argument, WebSocket expects a string pointing it to the server. This could be a URL, an IP address, or other routing, but will be prefixed with "ws" where you might generally use "http". Attach some event listeners, are you are on your way.

    // Global
    var socket = null;
    
    // Instantiate the WebSocket
    // Attach event handlers
    socket = new WebSocket( SOCKET_URL );
    socket.addEventListener( "open", doSocketOpen );
    socket.addEventListener( "message", doSocketMessage );	
    socket.addEventListener( "error", doSocketError );
    

When the data arrives, as I mentioned, it can pretty much come in faster than your user can perceive it. The best way to handle this is to decouple the data collection from WebSocket from the actual rendering. This means we will only collect the data as it arrives in our event handler.

    // Called when a message has arrived on the socket
    // Pushes latest value into array for display
    function doSocketMessage( mess )
    {
      light.push( parseInt( mess.data ) );
      light.splice( 0, 1 );
    }
    

With our incoming data safely tucked away in an array in memory, we are free to render the data however, and whenever we want. What is important is that user experience. To make sure rendering is buttery smooth, we will use requestAnimationFrame. To make sure it can render cleanly across devices, we will map the light data to an SVG path.

The result is an impressively fast display of WidgetY data. It catches you off guard at first because you do not expect the web to move that fast. And yet there it is! That same shock and awe will drive your customers wild on social media. Perfect!

### Next Steps

You may have already figured out that we could also use WebSocket to control the LED, and likely with a much faster response time. WebSocket does, after all, offer bi-directional communication. Perhaps more interesting however is having the data read from the photocell impact the brightness of the LED.

Orchestrating two IoT devices, without either of them knowing about each other, is where The Widget Company is headed next. This is also where the real power of IoT lies - having things communicate to one another without any interaction from humans. In the next post we go from the "intranet" of things to the Internet of Things.
