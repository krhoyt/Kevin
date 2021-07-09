---
title: Web Chat Application
slug: building-a-chat-application
date_published: 2015-01-23T17:00:00.000Z
date_updated: 2015-04-21T15:57:23.000Z
tags: web, kaazing, cross, chat
---

*In any given programming language "Hello World" is likely the first thing you will learn to do. The "Hello World" for real-time architectures is a chat application. In this post you will build your very own Web-based chat application. Alternatively, you might also want to check out the Quick Start guide to get a little background.*

---

This is reposted on the [Kaazing Open Source Blog](http://kaazing.org/blog/building-a-chat-application/).

### Connecting

The first thing we need to do to get real-time communication for our chat application is to connect to a server. As outlined in the Quick Start Guide, in a publish/subscribe architecture, the server is called a "broker". The broker manages connecting incoming messages, with those wanting to receive messages. More on that later.

    var kaazing = Gateway.connect( null, doConnected );
    

While this may look like a simple call, there is a lot that goes on in the background. Brokers speak various enterprise protocols such as AMQP, XMPP, and MQTT. The browser does not speak broker, or protocols. It does speak WebSocket. And if your browser does not speak WebSocket, it does speak HTTP. Managing that connection, and securely communicating via standard protocols, are among the tasks handled for you.

### Subscribing

This call will connect to the broker and establish outgoing and incoming message buckets on the server. At this point, the outgoing bucket (called an exchange) will send messages on to any incoming message buckets (called queues) it has been told about. However, our outgoing bucket has not yet been told about the incoming bucket. To do this, we must subscribe for messages.

    function doConnected()
    {
      kaazing.on( Gateway.EVENT_MESSAGE, doMessage );
      kaazing.subscribe( CHAT_TOPIC );
    }
    

Once our incoming bucket is subscribed to the outgoing bucket, we will begin to receive messages. The underlying protocol we are using for this example is AMQP, which refers to this process as "binding". When the two buckets are bound, messages that match a specific "routing key" are forwarded on from the exchange (outgoing) to the queue (incoming). If you are familiar with other messaging protocols, you can think of the routing key as roughly analogous to a "topic" in this configuration.

If you have an enterprise software background, you may be familiar with these concepts from enterprise messaging.

Keep in mind that the routing happens on the server - and that is a good thing. You do not want every message regardless of routing to be sent to the client, for it to figure out how to deal with the content. At scale, the browser would simply be overloaded. Having a broker on the server also gives us features such as guaranteed delivery, flow control (pause/resume), and durable messaging (persistence between restarts).

### Publishing

When somebody in a chat wants to send a message, that is called "publishing". To publish a message, and have it arrive to all the interested parties, you send the content using a specific routing key. Again, you may also think of the routing key as a topic in other messaging protocols.

    kaazing.publish( CHAT_TOPIC, message );
    

While AMQP actually sends messages in binary, it is far more commonplace with JavaScript to work with String data types. String content is the expected message content. The AMQP library takes care of resolving the actual binary message. If you want to send complex data structures, you can use JSON.stringify() to get a String representation first. Do not forget to use JSON.parse() with the message arrives.

### Shortcut

Knowing that chat is the "Hello World" of real-time communication, we have made getting started as easy as possible - there is a shortcut to building your first chat application. To use this, first put "gateway.js" into your HTML document. This loads all the necessary dependencies, and gives you the hooks for chat.

In your HTML document, you will also need two DIV elements. These elements should have CSS class names of "history" and "message". The "history" element will show the chat history. The "message" element is where you type a message to send. Styling these elements is left entirely to your CSS.

If you want some default styling, you can include our example CSS. This is also a good jumping off point to make your own design changes.

Last but not least, we need to layer on the chat functionality via the aforementioned hooks. We do not want to do this until the "gateway.js" script is loaded. To wait for the script to load, we can catch the "load" event on the window object. Once we are sure that everything is loaded, we can invoke the chat functionality via a convenience method.

![Behold a chat application.](http://images.kevinhoyt.com/hello.chat.screenshot.png)

Behold, a [complete chat application](http://kaazing.org/demos/chat/run/)! No, [really](http://kaazing.org/demos/chat/run/)! Copy and paste the following code into your own HTML document to see it in action on your machine - no install required, no registration required, just free flowing real-time goodness.

    <html>
    <head>
    
    <title>My Chat Application</title>
    
    <link
      href="http://kaazing.org/demos/chat.chat/run/chat.css"
      rel="stylesheet"
      type="text/css">
    
    <script
      src="http://kaazing.org/demos/chat.chat/run/gateway.js"
      type="text/javascript">
    </script>
    
    <script type="text/javascript">
    window.addEventListener( "load", function() {
      Gateway.chat(
        null,
        document.querySelector( ".message" ),
        document.querySelector( ".history" )
      );
    } );
    </script>
    
    </head>
    <body>
    
    <div class="history"></div>
    <div class="message">
      Press &lt;Enter&gt; to send
    </div>
    
    </body>
    </html>
    

### Next Steps

There are so many features to enterprise messaging, and we are barely even scratching the surface with this example. If you are new to event-driven applications, then you might want to take a look at an [AMQP overview](https://www.rabbitmq.com/tutorials/amqp-concepts.html). If you are coming from a Java Messaging Service (JMS) background, then you might want to see how [AMQP compares](http://www.wmrichards.com/amqp.pdf). And of course Gateway is leveraging [WebSocket](http://www.amazon.com/Definitive-Guide-HTML5-WebSocket-ebook/dp/B00ACC6AZA/ref=sr_1_4?ie=UTF8&amp;qid=1421948356&amp;sr=8-4&amp;keywords=moskovits) where applicable, which is also worth reading up on.
