---
title: Messaging and the New Web
slug: messaging-and-the-new-web
date_published: 2014-11-11T22:00:00.000Z
date_updated: 2015-04-21T14:14:31.000Z
tags: iot, arduino, pubsub
---

*The Widget Company now has two successful devices on the market. WidgetX (LED) has a web server built into it, and is expecting REST operations for control. WidgetY (photocell) has a WebSocket server built into it, and can push sensor data to the web in real-time. But does this represent the Intranet of Things, or the Internet of Things?*

*Neither device knows about the other. Both are based on architectures that would require them being specifically told about the other in order to communicate. Any third-party devices, or even future devices from the same vendor, are oblivious to the features offered by existing devices.*

---

We came to these projects with our request/response hammer, and everything looked like a nail. What we need is an architecture that allows for event-driven communication (turn on a light), but that is decentralized. We need an architecture scalable enough to handle high volumes of device chatter in real-time. We need an architecture that allows those devices to be decoupled. What we need is an architecture called "publish and subscribe."

### Messaging

The "web server" is actually two pieces of functionality. The first, and primary objective is to route HTTP traffic. The second, and actually quite separate objective, is to process the data on that HTTP traffic. Now take these two pieces and decouple them. Replace the HTTP server with middleware capable of handling various number of protocols (not just HTTP), and you are starting to get to the idea of messaging.

What about handling the data? Where does your application server go? In a message-oriented middleware architecture, your application server is just another loosely decoupled part of a larger system. In fact, you could have several application server technologies (C#, PHP, Java, etc.) in the system - all completely unaware of the internals of the others.

![A basic publish-subscribe architecture in action.](http://images.kevinhoyt.com/iot.www.messaging.png)

An event occurs on some subsystem, is routed to a message broker (the HTTP server with more protocols), which in turns broadcasts (publishes) that event to all the subsystems that care about it. Those systems that care about the event (subscribe) take the data and perform some processing on it. Subsystems may or may not in turn generate events of their own.

> In a publish/subscribe architecture, It does not matter if the subsystem handing the data is an IoT device or a quantum computer.

Along the way, our HTTP server, now called a message broker, is going to get a lot more functionality. You can, for example, keep connections open, and still grow to web scale. That means you can push data to clients in real-time. The broker can handle queuing data (messages) for systems that are not online at the moment. It can handle disaster recovery for that data should the server crash. And of course, it can handle a lot more than just HTTP.

### Publish

Many message brokers can speak several different protocols. Protocols you may have heard of in the past include XMPP and AMQP. If you are a Java developer, you might look at JMS as a protocol (though it is not technically). For IoT, where we may not have the memory or CPU to handle complex protocols, there are other options. One such option is the [Simple Text Oriented Messaging Protocol](http://stomp.github.io/) (STOMP).

> If you take a look at the STOMP web site, chances are you will find an implementation for your favorite technology. If not, there is a good chance you can write your own implementation in an afternoon.

I have written a basic STOMP implementation for the Arduino Yun, which we are going to apply to WidgetY (photocell) to allow it to generate events (publish) around the light levels is senses. Who handles this event, where they are on the system, what technology they are using, and what they intend to do with it are completely irrelevant to WidgetY.

    // Libraries
    #include <Bridge.h>
    #include <Console.h>
    #include <YunClient.h>
    
    // Literals
    #define ENDPOINT  "kaazing.kevinhoyt.com"
    #define LOGIN     " "
    #define PASSCODE  " "
    #define PORT      61613
    #define TOPIC     "/topic/iota.photocell"
    
    // Constants
    const int PHOTOCELL = 0;
    
    // Connectivity
    String    response;
    String    session;
    YunClient client;
    
    // Setup
    void setup() 
    {
      // Yun network connectivity
      Bridge.begin();
    
      // Start client
      if( connect() ) {;}
    }
    
    // Loop
    void loop() 
    {
      // Process STOMP data
      stomp();
      
      // Get analog pin reading
      light = analogRead( PHOTOCELL );
    
      // Publish to clients
      publish( TOPIC, String( light ) );  
    
      // Wait to send next
      delay( 100 );
    }
    

There are a few things going on here. In the setup routine, you will notice that we connect from the Arduino to the message broker. Then in the loop, we check for any incoming STOMP data (generally, events). We read the light value from the photocell, and the publish the data to the message broker. You can think of a "topic" as the name of this event.

### Subscribe

What happens next? As far as WidgetY is concerned, it does not care. Notice that the message broker is on the public Internet. This means that any system can participate in the conversation - listen for events.

In this case, there are two systems listening for events. The first system is WidgetX (LED). We previously looked at WidgetX as an on or off scenario, but we could alternatively control the brightness of the LED as well. The less light in the room (an event now published by WidgetY), the brighter our LED should be.

    // Libraries
    #include <Bridge.h>
    #include <Console.h>
    #include <YunClient.h>
    
    // Literals
    #define ENDPOINT  "kaazing.kevinhoyt.com"
    #define LOGIN     " "
    #define PASSCODE  " "
    #define PORT      61613
    #define TOPIC     "/topic/iota.photocell"
    
    // Constants
    const int LED = 9;
    
    // Connectivity
    String    response;
    String    session;
    YunClient client;
    
    // Setup
    void setup() 
    {
      // Use designated pin as an output
      // Set to off initially
      pinMode( LED, OUTPUT );
      analogWrite( LED, 0 );    
      
      // Yun network connectivity
      Bridge.begin();
      
      // Start client
      if( connect() ) 
      {
        subscribe( TOPIC );
      }
    }
    
    // Loop
    void loop() 
    {
      // Process STOMP data
      stomp();
      
      // Wait for next bits
      delay( 100 );
    }
    
    // Callback when messages arrive
    void callback() 
    {
      int value;
      
      // Frame data  
      String frame;
      String message;
      
      // Get header
      frame = getValue( response, 0, "\n" );
      
      // Receipt messages
      if( frame == "MESSAGE" ) 
      {
        // Message arrived
        message = getValue( response, 1, "\n\n" );
    
        // Map photocell to PWM
        value = message.toInt();
        value = map( value, 0, 1100, 0, 255 );
    
        // Control LED
        analogWrite( LED, value );
      }
    }
    

Because the LED is interested in knowing about external light events, it subscribes to those events. When messages for that event arrive, the data is parsed, mapped to a Pulse-Width Modulation (PWM) range, and then applied to the LED.

A few changes could be made to further decouple the LED from the photocell. For example, rather than listening for a "iota.photocell" event, the LED might just listen for a "light" event. Or it might just listen for an "iota" event, where the event data contains the type of operation to be performed.

Likewise, we could publish percentage values from the photocell in place of a concrete range. This would allow for a broader range of applications, without having to additionally send range minimum and maximum values. In this example, the range is hard-coded.

### Web Client

The second system listening for WidgetY (photocell) events is the browser, which would like to display and chart the light values coming from the photocell. Real-time display of data in the browser is going to take place using WebSockets. Once we have a WebSocket connection to the message broker, is it up to use to manage the data (protocol) coming across the wire.

There are a growing number of message brokers that support WebSockets. For this example, I am going to use Kaazing Web Gateway to efficiently handle Web communications.

    <script src="http://kaazing.kevinhoyt.com/demo/jms/javascript/WebSocket.js" type="text/javascript"></script>
    <script src="http://kaazing.kevinhoyt.com/demo/jms/javascript/JmsClient.js" type="text/javascript"></script>
    <script type="text/javascript" src="kaazing.js"></script>
    
    ...
    
    var kzng = new Kaazing();
    
    // New Kaazing connection
    kzng = new Kaazing();
    
    // Connect to Gateway
    kzng.connect( KAAZING_ID, null, {
        success: doConnectSuccess,
        error: doConnectError
    } );
    
    // Listen for messages
    kzng.on( "message", doMessage );
    
    ...
    
    // Problem connecting to broker
    function doConnectError()
    {
        console.log( "Error connecting." );
    }
    
    // Connected to message broker
    function doConnectSuccess()
    {
        // Listen for photocell values
        kzng.subscribe( TOPIC );
    }
    
    // Called when a message has arrived on the socket
    // Pushes latest value into array for display
    function doMessage( topic, message )
    {
        light.push( parseInt( message ) );
    	light.splice( 0, 1 );
    }
    

The overall approach here is not considerably different from straight WebSocket. The underlying differences however, are considerable. You think of WebSocket as a means to connect, but messaging is more like adding an event listener to DOM. It just happens that in this case, your events are occurring somewhere else, on a device you know nothing about.

### The New Web Unlocked

This decoupling allows WidgetX and WidgetY to communicate with one another, without knowing anything about one another. The light sensor could be from a completely different vendor altogether. The hardware requirements on the devices is much smaller, and the scalability and features for the Web is much greater.

> As disparate devices communicate freely with one another, we start to unlock the true potential of the Internet of Things.

At this point we start getting into the semantics that devices should use to communicate - and there is progress on this front ([AllJoyn](https://www.alljoyn.org/) as an example).

A little closer home, you might consider if you need to be using HTTP for your data exchange (outside of assets) at all. Rather than reach for XMLHttpRequest (Ajax) next time, consider reaching for the publish-subscribe architecture using WebSocket. Doing so will move the Web forward, and at the same time encourage IoT device vendors to move forward as well.

If you are a device vendor, consider defaulting to publish-subscribe for your API. A real-time configuration makes for a compelling differentiator. Consumers used to instant gratification will gravitate towards your product, hackers will be choose your product over less robust solutions, and the long-term effect will be to drive the Web forward.

Ask not what the Internet can do for your Thing, but what your Thing can do for the Internet.
