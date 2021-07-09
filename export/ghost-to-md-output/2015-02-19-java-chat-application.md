---
title: Java Chat Application
slug: java-chat-application
date_published: 2015-02-19T17:00:00.000Z
date_updated: 2015-04-21T15:33:34.000Z
tags: kaazing, cross, chat, java
---

*If you look around the Kaazing open source web site, you will see a lot of information about delivering real-time solutions on the Web. This is not by accident - we a strong believers in the future of web standards. You can also use Kaazing Gateway with other platforms as well, including Java, Android, and iOS. In this post, we will take a quick look at building a chat application using Java.*

---

This is reposted on the Kaazing Open Source [blog](http://kaazing.org/blog/java-chat-application/).

### Desktop

As a cross-platform technology, Java can run in many places. Indeed, Kaazing Gateway itself is built on Java and intended to run on the server. Since we are talking about a chat application here, we will be focusing on the client side library usage. To avoid the complexity of mobile deployment, we will be developing a desktop Java application.

The goal of this Java desktop chat application is to integrate with the web standards chat application from a previous blog post. You can [read the article](http://kaazing.org/blog/building-a-chat-application/) and even use the [live application](http://kaazing.org/demos/chat.chat/run/) (desktop or mobile). This means that Kaazing Gateway brings real-time cross-platform communication to your projects. I will be following this post up by bringing the chat application over to Android, and eventually iOS.

### Libraries

As an open source project, you have access to all the client library code you could want. Many of the repositories include build instructions as well. However, if you are just getting started exploring Kaazing Gateway features by building this chat client, then I am guessing that you are not ready to commit code to the project. Our first step then is to get the libraries we need in a form that is ready to drop into our IDE.

As it turns out, the build processes of the open source repositories use [Apache Maven](http://maven.apache.org/) for project management. This means that we can head on over to [The Central Repository](http://search.maven.org/#search%7Cga%7C1%7Cg:%22org.kaazing%22) and pick up the ready-to-use JAR files for our chat client. There are four different libraries that we will need.

The first library we will need is [Gateway client](http://search.maven.org/#search%7Cga%7C1%7Ca:%22gateway.client.java%22) ([GitHub](https://github.com/kaazing/gateway.client.java)). This effectively implements a WebSocket client, which is the baseline for communication to Kaazing Gateway. You will also need [Gateway client transport](http://search.maven.org/#search%7Cga%7C1%7Ca:%22gateway.client.java.transport%22) ([GitHub](https://github.com/kaazing/gateway.client.java.transport)). This library implements the transport layer for Kaazing Gateway WebSocket Java client library. Next up is an [AMQP client](http://search.maven.org/#search%7Cga%7C1%7Ca:%22amqp.client.java%22) ([GitHub](https://github.com/kaazing/amqp.client.java)) implementation. I wrote extensively [about AMQP](http://kaazing.org/blog/amqp-breakdown/) in an earlier post.

Since the Web client from the previous post uses JSON (JavaScript Object Notation) to communication messages, we also need the ability to handle JSON in Java. The [Glassfish JSON library](http://search.maven.org/#search%7Cga%7C1%7Ca:%22javax.json%22) is an open source implementation of [JSR-353](https://json-processing-spec.java.net/), which provides a Java API for JSON processing. Paired with the Kaazing libraries, we have everything we need for our chat client.

### User Interface

Building Java desktop user interfaces is something that most people remember either as a painful part of learning Java, or as an empowering art form. I actually fall into the later group, and as such have made the Java desktop client look and behave exactly like the Web client. In the interest of brevity, and perhaps sanity, I will not be covering all the details of JList and custom cell renderers, or other fun Swing internals.

You might now be breathing a sigh of relief, but if you really want to take a look under the covers, the entire project (minus the libraries) is available on my [Kaazing GitHub repository](https://github.com/krhoyt/Kaazing/tree/master/chat).

### Connecting

The first thing we need to do, is to establish a connection to Kaazing Gateway. Do not worry if you do not have a build running locally, or on some server in your DMZ, we have a publicly available instance for you to use.

    // Establish connection
    private void initConnection()
    {
      // Factory
      factory = AmqpClientFactory.createAmqpClientFactory();
            
      try {
        // Client
        client = factory.createAmqpClient();
                
        // Connection listeners
        client.addConnectionListener( new ConnectionListener() {
                
          // Connecting
          public void onConnecting( ConnectionEvent ce ) 
          {
            EventQueue.invokeLater( new Runnable() {
              public void run()
              {
                System.out.println( "Connecting..." );
              }
             } );
           }
                    
          // Error
          public void onConnectionError( ConnectionEvent ce ) 
          {
            EventQueue.invokeLater( new Runnable() {
              public void run()
              {
                System.out.println( "Connection error." );
              }
            } );
          }                              
                    
          // Open
          public void onConnectionOpen( ConnectionEvent ce ) 
          {
            EventQueue.invokeLater( new Runnable() {
              public void run()
              {
                System.out.println( "Connection open." );
                                
                // Setup publisher
                doClientOpen();
              }
            } );
          }
                    
          // Close
          public void onConnectionClose( ConnectionEvent ce ) 
          {
            EventQueue.invokeLater( new Runnable() {
              public void run()
              {
                System.out.println( "Connection closed." );
              }
            } );
          }
        } );
                
        // Connect to server
        client.connect(
          "wss://sandbox.kaazing.net/amqp091", 
          "/", 
          "guest", 
          "guest"
        );
      } catch( Exception e ) {
        e.printStackTrace();
      }
    }
    

In connecting, there are many event listeners you can use. For example, you might use the open and close event listeners to show a visual indicator in the user interface. Right now, all we are interested in knowing is when the connection is ready to use which is handled in the "onConnectionOpen" event.

### Channels

To publish and consume messages, we will create an AMQP channel for each operation. Similar to opening the connection, there are many event listeners that you can have. We are going to start with the publish channel, which effectively boils down to declaring the exchange. An exchange sits on the message broker (server), and acts as a bucket for incoming messages.

    private void doClientOpen()
    {
      // Send messages
      publish = client.openChannel();
            
      // Channel listeners
      publish.addChannelListener( new ChannelAdapter() {
        // Close
        public void onClose( ChannelEvent ce ) 
        {
          EventQueue.invokeLater( new Runnable() {
            public void run()
            {
              System.out.println( "Publish closed." );
            }
          } );
        }
                
        // Error
        public void onError( ChannelEvent ce ) 
        {
          EventQueue.invokeLater( new Runnable() {
            public void run()
            {
              System.out.println( "Publish error." );
            }
          } );
        }            
                
        // Declare exchange
        public void onDeclareExchange( ChannelEvent ce ) 
        {
          EventQueue.invokeLater( new Runnable() {
            public void run()
            {
              System.out.println( "Exchange declared." );
                            
              // Setup consumer
              doPublishReady();
            }
          } );
        }            
                
        // Open
        public void onOpen( ChannelEvent ce ) 
        {
          EventQueue.invokeLater( new Runnable() {
            public void run()
            {
              System.out.println( "Publish open." );
                            
              // Declare exchange
              publish.declareExchange( 
                "exchange_WLRNhKKM7d", 
                "direct", 
                false, 
                false, 
                false, 
                null 
              );
            }
          } );
        }            
      } );
    }
    

With a publish exchange created, we can now move onto creating a consumer queue and binding it to the exchange. The consume channel is the first place your message will arrive in the Java client. AMQP is a binary protocol, so we get the bytes first. Since we are working with JSON from the Web client, we will want the String equivalent of the message payload. We can then process the content however we feel best fit - more on that in the next section.

    private void doPublishReady()
    {
      // Consume
      consume = client.openChannel();
            
      // Channel listeners
      consume.addChannelListener( new ChannelAdapter() {
        // Bind queue
        public void onBindQueue( ChannelEvent ce )
        {
          EventQueue.invokeLater( new Runnable() {
            public void run()
            {
              System.out.println( "Queue bound." );
            }
          } );
        }
                
        // Close
        public void onClose( ChannelEvent ce )
        {
          EventQueue.invokeLater( new Runnable() {
            public void run()
            {
              System.out.println( "Consume closed." );
            }
          } );
        }            
                
        // Consume
        public void onConsumeBasic( ChannelEvent ce )
        {
          EventQueue.invokeLater( new Runnable() {
            public void run()
            {
              System.out.println( "Consuming..." );
                            
              // Open user interface for sending messages
              doConsumeReady();
            }
          } );
        }            
                
        // Declare queue
        public void onDeclareQueue( ChannelEvent ce )
        {
          EventQueue.invokeLater( new Runnable() {
            public void run()
            {
              System.out.println( "Queue declared." );
            }
          } );
        }            
                
        // Flow
        public void onFlow( ChannelEvent ce )
        {
          try {
            final boolean isActive = ce.isFlowActive();
                        
            EventQueue.invokeLater( new Runnable() {
              public void run()
              {
                System.out.println( "Flow is " + ( isActive ? "on" : "off" ) + "." );
              }
            } );                  
          } catch( Exception e ) {
            e.printStackTrace();
          }
        }            
                
        // Message
        public void onMessage( ChannelEvent ce )
        {
          byte[] bytes;
                    
          bytes = new byte[ce.getBody().remaining()];
          ce.getBody().get( bytes );
                    
          final Long    tag = ( Long )ce.getArgument( "deliveryTag" );
          final String  value = new String( bytes, Charset.forName( "UTF-8" ) );
                    
          EventQueue.invokeLater( new Runnable() {
            public void run()
            {
              AmqpChannel channel = null;
                            
              System.out.println( "Message: " + value );
                            
              // Place in user interface
              doMessageArrived( value );
                            
              // Acknowledge
              channel = ce.getChannel();
              channel.ackBasic( tag.longValue(), true );
            }
          } );
        }            
                
        // Open
        public void onOpen( ChannelEvent ce )
        {
          EventQueue.invokeLater( new Runnable() {
            public void run()
            {
              System.out.println( "Consume open." );
                            
              // Declare queue
              // Bind queue to exchange
              // Start consuming
              consume.declareQueue( 
                "queue_AND_123", 
                false, 
                false, 
                false, 
                false, 
                false, 
                null 
              ).bindQueue( 
                "queue_AND_123", 
                "exchange_WLRNhKKM7d", 
                "chat_topic", 
                false, 
                null 
              ).consumeBasic( 
                "queue_AND_123", 
                "start_tag", 
                false, 
                false, 
                false, 
                false, 
                null 
              );
            }
          } );
        }                        
      } );
    }
    

Because of the way we have setup our connection, messages must be acknowledged. This is the last bit of code in the message event handler. Without this, the exchange on the broker will effectively hold onto the messages. This is actually a desired behavior for the purposes of message persistence and guaranteed delivery. Long-term however this can mean that your server fills up and runs out of memory. If you are not interested in persistence and guaranteed delivery, you can configure the exchange to not require message acknowledgement.

### Parsing JSON

As previously mentioned, messages from the Web client are in JSON format. This means we need to parse the message content into an equivalent Java data type. Parsing JSON in Java reminds me of parsing XML in Java using SAX. The parser effectively rips through the content, while your code looks for specific elements that you are interested in further processing.

    private void doMessageArrived( String body )
    {
      ChatMessage message = null;
      Event        e = null;
      InputStream stream = null;
      JsonParser  parser = null;
            
      // String to InputStream
      stream = new ByteArrayInputStream( 
        body.getBytes( StandardCharsets.UTF_8 ) 
      );
      parser = Json.createParser( stream );
            
      // New chat message
      message = new ChatMessage();
      message.raw = body;
            
      // Parse JSON
      while( parser.hasNext() )
      {
        e = parser.next();
                
        if( e == Event.KEY_NAME )
        {
          switch( parser.getString() )
          {
            case "color":
              parser.next();
              message.color = parseRgb( parser.getString() );
              break;
                            
            case "message":
              parser.next();
              message.content = parser.getString();
              break;
                            
            case "user":
              parser.next();
              message.user = parser.getString();
              break;
          }
        }
      }
            
      history.addElement( message );
    }
    

In order to hold the message content, and render it in a JList, I have created a custom data type called ChatMessage. It simply has a few public properties on it to hold the specific pieces of data. Color from the Web client is in CSS format of "rgb( 255, 255, 255 )". This is further parsed into a Java Color object. The JList in turn has a custom cell renderer to show the message in the color provided by the sending client.

### Publish

Publishing a message that can be consumed by a Web client effectively means encoding our Java data types into their corresponding JSON format. Again, the process is very similar to SAX. The JSR provides for a builder object. Properties are added to the builder. To get the String format of the JSON data, we use the JSR-provided writer object.

    public void keyReleased( KeyEvent ke ) 
    {
      AmqpProperties     properties = null;
      ByteBuffer         buffer = null;
      JsonObject         result = null;
      JsonObjectBuilder      builder = null;
      StringWriter           sw = null;
      Timestamp              stamp = null;
            
      // There is a message to send
      if( ke.getKeyCode() == 10 && field.getText().trim().length() > 0 )
      {
        // Build JSON object
        // Interacting with the web
        builder = Json.createObjectBuilder();
        builder.add( "message", field.getText().trim() );
        builder.add( 
          "color", 
          "rgb( " + style.getRed() + 
          ", " + style.getGreen() + 
          ", " + style.getBlue() + 
          " )" 
        );
        builder.add( "user", "user_" + now );
                
        result = builder.build();
                
        // Java JSON object to String
        sw = new StringWriter();
                
        try( JsonWriter writer = Json.createWriter( sw ) ) {
          writer.writeObject( result );
        }
                
        // Here is what we are going to send
        System.out.println( "Sending: " + sw.toString() );
                
        // Encode for AMQP
        buffer = ByteBuffer.allocate( 512 );
        buffer.put( sw.toString().getBytes( Charset.forName( "UTF-8" ) ) );
        buffer.flip();
                
        stamp = new Timestamp( System.currentTimeMillis() );
                
        // Publish parameters
        properties = new AmqpProperties();
        properties.setMessageId( "1" );
        properties.setCorrelationId( "4" );
        properties.setAppId( "java_chat" );
        properties.setUserId( "user_" + now );
        properties.setContentType( "text/plain" );
        properties.setContentEncoding( "UTF-8" );
        properties.setPriority( 6 );
        properties.setDeliveryMode( 1 );
        properties.setTimestamp( stamp );
                
        // Send
        publish.publishBasic( 
          buffer, 
          properties, 
          "exchange_WLRNhKKM7d", 
          "chat_topic", 
          false, 
          false 
        );
                
        // Clear text just sent
        field.setText( "" );
      }
    }
    

Once we have the JSON representation of the outgoing chat message, we create the AMQP message proper. This largely consists of setting various properties the correspond to how the broker should handle the message. After that, we use our previous instantiated publish channel and send the message itself, and the properties, to the exchange on the broker.

### Next Steps

The event handlers in the code can seem overwhelming at first - there are so many of them. Remember however that they are predominantly a convenience to provide a better behaving application. Do not let them get in your way of opening your favorite Java IDE and giving the chat client a try.

![Screenshot of the Java application and Web application.](http://images.kevinhoyt.com/java.chat.screenshot.jpg)

Once you have the Java client running, you can head over to the Kaazing open source web site and run the [live chat demonstration](http://kaazing.org/demos/chat.chat/run/). The two clients will be able to communicate with one another in real-time. The cross-platform goodness does not stop there either. I will write more in the future on using Kaazing Gateway with Android, iOS, and IoT.
