---
title: AMQP Breakdown
slug: amqp-breakdown
date_published: 2015-02-02T17:00:00.000Z
date_updated: 2015-04-21T15:20:55.000Z
tags: kaazing, cross, amqp
---

*The open source Kaazing Gateway uses Advanced Message Queueing Protocol ([AMQP](http://www.amqp.org/)) to transport your messages from one point to the next. It does this by leveraging the [IETF WebSocket](https://tools.ietf.org/html/rfc6455) protocol. The connection from the browser may use the [W3C WebSocket API](http://www.w3.org/TR/websockets/) if available, but will also fall back to other means if necessary.*

*As with any protocol, using AMQP comes with its own set of concepts that you must understand before being able to get the most out of it. In this post we will take a look at an AMQP connection in depth, and understand how that manifests itself through Kaazing Gateway APIs.*

---

This is reposted on the Kaazing Open Source [Blog](http://kaazing.org/blog/amqp-breakdown/).

> Note that this article is all about AMQP 0.9.1. AMQP 1.0 is now available, and is a completely different protocol.

### A Word on Protocols

If you are new to messaging, or socket communications, then the concept of a protocol may also be new. Undoubtedly, you have run across protocols before, but never really given much thought to them. You type "HTTP" in your browser, and you are off to the races. You use Java Database Connectivity (JDBC) to query data, and never really think about the bytes that are needed to negotiate for your data.

At a high level, protocols are the convention that you are using to communicate between two points on the network. Just as different spoken languages have different semantics, so do protocols care about how the communication happens.

A web server for example, speaking/caring about HTTP, will take a series of strings until it finds a double carriage return. At that point it will parse those strings and decide what to do. If it finds the verb "GET" then it will fetch and return the desired document. The web server knows what document is desired because the protocol specifies where to look for the file name within that incoming series of strings.

AMQP is a standards-based protocol used by many enterprise systems. As the name implies, it is a protocol designed for routing messages between points on a network.

### Connecting

As you might guess, before we can send messages to another point on the network, we need to connect to the network itself. When using the Kaazing Gateway APIs, we establish a connection using the Factory pattern. The factory creates an instance of an AMQP client that we can then use to connect to the desired location on the network.

    var amqp_factory = new AmqpClientFactory();
    
    var amqp_client = amqp_factory.createAmqpClient();
    
    amqp_client.addEventListener(
      "close",
      doClientClose
    );
    
    amqp_client.connect( {
      url: "wss://sandbox.kaazing.net/amqp091",
      virtualHost: "/",
      credentials: {
        username: "guest",
        password: "guest"
      }
    }, doClientOpen );
    

In order to know where to connect, the AMQP client needs a URL. A virtual host path can also be included. The virtual host path allows you more flexibility on setting up and managing your AMQP broker/network - such as multiple tenancy support. You can even send query string variables. In the example above, we send the credentials to authenticate against the broker.

### Channels

Once we are connected to the desired AMQP broker, we can begin building our communication channels. Channels at this point do not differentiate what it is that they will be doing down the road - they are merely conduits for future broker API calls. What types of commands are issued once the channel is connected will in turn dictate what type of activity they will be doing.

    var amqp_publish = amqp_client.openChannel(
      doPublishOpen
    );
    

You might notice that the variable name I am giving this channel indicates that I intend to use it to publish messages. What about consuming messages? A message consumer is a second AMQP channel we will talk about momentarily. I am also choosing to cover publish first, because a consumer cannot bind to an exchange that does not exist, and it is the publish process that creates an exchange.

Binding? Exchange? Read on!

### Publish Exchange

If we decide that we want to use a channel for publishing messages, we declare an exchange. An exchange is a central point on the broker to which messages can be sent. Many clients may be sending messages to any given exchange, so you want the naming to be consistent and predictable.

    amqp_publish.declareExchange( {
      exchange: "my_exchange",
      type: "direct"
    } );
    

AMQP provides a few different ways to distribute messages from the exchange. If you are coming from a system such as Java Messaging Service (JMS), then you will probably be looking for either the "fanout" or "direct" type. These AMQP exchange types allow for one exchange to distribute messages to many queues.

In the AMQP "fanout" configuration, the name of the exchange dictates how the messages will be routed - effectively to any and all bound queues, regardless of any other qualifier. This leaves it to your code on the client to further review messages and then decide the appropriate course of action.

In the AMQP "direct" configuration, messages are routed by the exchange, based on qualifiers provided by the consumers. This puts the burden on the broker to be able to filter and pass along messages accordingly. For the purposes of this example, we will be using the "direct" exchange type.

### Publishing Messages

At this point, our code has not setup any consumers. However that does not mean that we cannot publish messages. There may be other consumers that are not under our control waiting to hear from us. The process of sending a message is called publishing.

    // Convert a String to binary
    function stringToArrayBuffer( value )
    {
      var buffer = null;
      var view = null;
    
      buffer = new ArrayBuffer( value.length );
      view = new Uint8Array( buffer );
    
      for( var i = 0; i < value.length; i++ )
      {
        view[i] = value.charCodeAt( i );
      }
    
      return buffer;
    }
    
    // Example message
    var message = {
      first_name: "Kevin",
      last_name: "Hoyt",
      twitter: "krhoyt"
    };
    
    // Binary payload
    var body = stringToArrayBuffer(
      JSON.stringify( message )
    );
    
    // Publish
    amqp_publish.publishBasic( {
      body: body,
      properties: null,
      exchange: "my_exchange",
      routingKey: "my_routing_key"
    } );
    

AMQP messages are binary in format. If you are going to be leveraging binary content, then you can publish your data without any further manipulation. In the case of the Web however, it is likely that we will want to leverage JavaScript Object Notation (JSON) to send out content. This means first converting our data structure to a String, and then into binary before sending.

You will also notice the introduction of the term "routing key". If you are familiar with enterprise messaging systems, you can think of the routing key as a topic. Technically, the topic may be the exchange name itself if you are using a "fanout" type, so this analogy is not 100% accurate.

Personally I like to think of the routing key as a hashtag like you might see in social media. Filtering status updates by their hashtag allows me to see all the content I am interested in reading. A hashtag is not a destination, but a means of identifying pieces of information. An exchange (social media network) may have any number of types of information. More on this later.

### Consumer Channel

When we want to subscribe to messages, we need to open a channel, and then use it to invoke broker APIs to differentiate it from a publish channel. Creating a consumer channel is exactly like creating a publish channel, and uses the same client API. It is only the calls we make on that channel that assign it's behavior.

    var amqp_consume = amqp_client.openChannel(
      doConsumeOpen
    );
    

For the purposes of differentiation in our code, we will name the consumer variable accordingly. We do however use the same AMQP client, created by the AMQP factory, to open the channel. Depending on your needs, you may have any number of channels open of various types.

### Consumer Queue

In AMQP, each consumer channel has a queue. Each queue should have its own unique name. At this point a queue is very similar to an exchange in that it is just a bucket. In this case a queue is a bucket for a specific consumer, whereas an exchange is a bucket for any number of publishers. The buckets know nothing about each other at this point.

    // Example events
    amqp_consume.addEventListener(
      "declarequeue",
      doConsumeDeclare
    );
    amqp_consume.addEventListener(
      "bindqueue",
      doConsumeBind
    );
    amqp_consume.addEventListener(
      "message",
      doConsumeMessage
    );
    
    // Keep track of the name
    var queue_name = "queue" + Date.now();
    
    // Declare the queue
    amqp_consume.declareQueue( {
      queue: queue_name
    } );
    

While there are a variety of events on any channel that you can listen for, a consumer channel will emit a "message" event when messages arrive.

### Consumer Binding

I have used the verb "bind" a few of times in this post. The term "binding" in AMQP is what links a queue (consumer) bucket to an exchange (publish) bucket.

    amqp_consume.bindQueue( {
      queue: queue_name,
      exchange: "my_exchange",
      routingKey: "my_routing_key"
    } );
    

Because we are using a "direct" exchange type here, we can also specify a "routing key". The routing key is effectively the filter by which the exchange (publish) will decide what messages to put in the bound queues (consumers). You can specify a routing key with a "fanout" exchange, but it will be ignored.

### Consuming Messages

Even though the exchange and the queue are now bound, and messages are being put into the right buckets, those messages are not necessarily being delivered to the client. In order to get messages delivered from our queue, we need to tell the AMQP broker that we want to receive them.

    amqp_consume.consumeBasic( {
      queue: queue_name,
      consumerTag: "my_consumer_tag",
      noAck: false
    } );
    

For the purposes of this example, we will be using "push" delivery. That is that we want the queue to deliver messages to the client when they arrive. We could alternatively elect to leave messages in the queue bucket, on the broker, until we check it at some point in the future. This is called "pull" delivery.

There is also a flag here for telling the broker that the client must/not acknowledge that messages have been received. Oddly, this flag is a double-negative, so be careful in setting the right value.

If we set "noAck" to "true" we are telling the broker that the client is not required to acknowledge that the messages have been received. Conversely, setting "noAck" to false means that the client must tell the broker that it has received each message. This obviously means more overhead, however it also means that you can be sure that the client will eventually get every message.

An interesting side effect of setting “noAck” to “false” is that the broker will continue to deliver those messages until they are acknowledged. So while the client may receive the messages, if it does not acknowledge them, the next client that connects will also receive those messages - even if it is the same client. The broker will continue this behavior until all the messages are acknowledged by the client This is called guaranteed delivery.

### Message Handling

Once our consumer channel was opened, we registered the "message" event handler. This event handler will be called when messages are delivered from the queue to the client. The message itself will be passed to the event handler. This message comes across in a binary form, so the first thing we need to do is convert it to a String.

    // Binary to String
    function arrayBufferToString( buffer )
    {
      return String.fromCharCode.apply(
        null,
        new Uint8Array( buffer )
      );
    }
    
    // Payload as String
    var body = arrayBufferToString(
      message.getBodyAsArrayBuffer()
    );
    
    // Object from JSON
    var data = JSON.parse( body );
    

The contents of the message, called the message body, might be any variety of format - that is up to your implementation. As this is a Web example, it makes sense to use JavaScript Object Notation (JSON) to serialize our body data. From there a decision can be made about how best to deal with the data itself.

### Message Acknowledgement

If you set "noAck" to "false" then you must additionally inform the broker that you have received the message.

    var config = {
      deliveryTag: message.args.deliveryTag,
      multiple: true
    };
    
    // Acknowledge is synchronous
    // Schedule independently
    setTimeout( function() {
      amqp_consume.ackBasic( config );
    }, 0 );
    

If you have "noAck" set to "false" but do not acknowledge the message, you will not get an error. However the broker will assume that the message from that queue has not been delivered. The next time that consumer declares that queue, it will be sent all the messages that we not acknowledged. If you are not careful with that double-negative, this can cause you a lot of debugging pain in the future.

To acknowledge that the client has received a message, it communicates back to the broker. As acknowledging a message is a synchronous behavior in AMQP, and we do not want to hang the browser thread, we can use a little trick with setTimeout() to schedule the response independently.

### Next Steps

The [Quick Start](http://kaazing.org/demos/quick-start/) example wraps all the intimate details of AMQP up into an easy to use wrapper library. Using this approach you have only to think about calling publish and subscribe. If you just want to build a [quick chat application](http://kaazing.org/blog/building-a-chat-application/), there is an [example for that](http://kaazing.org/blog/building-a-chat-application/) too.

There are also features of AMQP, supported by Gateway, that I have not covered in this post. Examples of these advanced topics would be flow control, and other exchange types. To get up close and personal with all your options when using AMQP, check out this [RabbitMQ breakdown](https://www.rabbitmq.com/tutorials/amqp-concepts.html).
