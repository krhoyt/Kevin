---
title: Android Chat Application
slug: android-chat-application
date_published: 2015-03-04T17:00:00.000Z
date_updated: 2015-04-21T15:45:16.000Z
tags: kaazing, cross, chat, java, android
---

*In a [previous post](http://kaazing.org/blog/java-chat-application/) I discussed using the open source Kaazing Gateway AMQP Java client library. This approach allows us to build a Java desktop chat client running against our free "sandbox" environment. You might be inclined to think that this lets us build the chat client on Android as well. While the Kaazing libraries do not change, the way we use them on Android does. In this post we will take a look at porting our chat application to Android.*

---

This is reposted from the Kaazing Open Source [blog](http://kaazing.org/blog/android-chat-application/).=

### A Note on Android

I have seen it said before that Android is Java, but that Java is not Android. I think this sums up the Android workflow nicely. Android forgoes many of the tools found in the standard JDK (Java Development Kit). For example, while Android has a user interface to present, it does not use Swing or AWT, but rather it's own layout system, and UI components.

In the case of porting our desktop Java chat client to Android, we will have to migrate the user interface off of Swing, and into the Android workflow. In order to preserve performance, Android then decouples much of the UI operation and rendering into separate threads. It also puts network operations on a separate thread. Putting theses various threads together then requires additional consideration.

Finally, there is the tooling. For this post I am using [Android Studio](http://developer.android.com/tools/studio/index.html). Android Studio is produced by IntelliJ, and is a massive leap forward from the Eclipse tooling for Android of old. That being said, it is still Android development, and uses many of the same tooling under the covers. In my experience, this can create unpredictability throughout the development process. When in doubt, restart the emulator and/or Studio processes.

It should be noted that this is not intended to be a tutorial on building Android applications. The focus of this post is predominantly the touch points between Kaazing Gateway libraries and Android development.

### Be an Android Maven

Before you get too far into your project, you will want to link in the libraries we will be using. I talk about the libraries in the Java chat application post, and they are the same here, however Android Studio provides direct integration to Maven. You can find the dialog for managing the Maven modules for the project by right-clicking on the project root, and then selecting "Open Module Settings".

![Android Studio module settings.](http://images.kevinhoyt.com/android.studio.module.settings.jpg)

Once you have the module dialog window open, you will want to select the "Dependencies" tab. You can then add modules by using the "+" icon at the bottom of the module listing (not the "+" above the "SDK Location" list item). Select the "Library dependency" option from the presented menu. The resulting dialog window will allow you to search the Maven repository for the required libraries.

The libraries you will need for this project are:

- amqp.client.java
- gateway.client.java
- gateway.client.java.transport
- javax.json (Glassfish)

You can enter these package names in the provided dialog and click the search icon (magnifying glass) to find them in the Maven repository. The first three on the list are Kaazing Gateway specific. The last one is a JSON (JavaScript Object Notation) library since we will be integrating with a web client as well. That is right, all your clients are belong to us!

![Android Studio module dependencies.](http://images.kevinhoyt.com/android.studio.module.dependencies.jpg)

Once you have all of these dependencies added, you can click the "Apply" button at the bottom of the modules dialog. This will kick off a Gradle build process, which may take some time. Once the process is completed, you are ready to start fleshing out the user interface, and wire in some real-time behaviors.

### User Interface

While the process of building an Adroid user interface is beyond the scope of this blog post, there are some differences from the Swing client. The most notable difference is that all Gateway communication has been extracted into its own class. While this makes for cleaner code, it also means that we will need to be able to communicate to and from the user interface.

    // Build message
    chat = new ChatMessage();
    chat.content = message.getText().toString();
    chat.user = "user_" + now;
    chat.color = style;
    
    // Publish to other clients
    gateway.send( chat );
    

Sending a message is a matter of building a ChatMessage object, and using the "send()" method on the Gateway class. The Gateway class will handle translating the properties of the ChatMessage object into JSON prior to sending. When messages arrive however, I decided to use Java callbacks.

    // Consume
    public void onConsumeBasic( ChannelEvent ce ) {
      dispatch.dispatchAsync(new Runnable() {
        public void run() {
          System.out.println( "Consuming..." );
    
          callback.onAllClear();
        }
      } );
    }
    
    ...
    
    // doMessageArrived
    callback.onMessage( message );
    

The "Gateway" class uses the "ChatCallback" interface, and can emit two calls - onAllClear and onMessage. The "onAllClear" is called when the connection to the server has been established, and both the publish and consume channels have been opened. The "onMessage" is called when a message has arrived - this includes not only other clients, but also the messages sent from this application itself. It sends along with it a "ChatMessage" object.

    // Gateway
    gateway = new Gateway();
    gateway.callback = new ChatCallback() {
      @Override
      public void onAllClear() {
        Log.i( "Gateway", "Ready for publish and consume." );
      }
    
      @Override
      public void onMessage( ChatMessage message ) {
        // Add to collection
        items.add( message );
    
        // Update list
        history.post( new Runnable() {
          @Override
          public void run() {
            adapter.notifyDataSetChanged();
          }
        } );
      }
    };
    

There are a half-dozen different ways to do this type of notification on Android. You might choose to implement a classic Observer pattern along the lines of the Swing EventListener approach. You might choose to use a runnable Handler implementation to post message around the application system. You can use whatever approach you like, but the key here is in keeping the network access on a separate thread from the user interface.

### The Missing EventQueue

In the desktop Java application, we kept the network access separate from the user interface using threading using the "EventQueue" class. You might be wondering why I did not use that class here as well? The answer is that "EventQueue" is a Java Swing class, and Android does not include the Swing features of the JDK. Android has it's own solution to managing thread communication - the "HandlerThread" class.

    import android.os.Handler;
    import android.os.HandlerThread;
    
    public class DispatchQueue extends HandlerThread {
      private Handler handler;
    
      public DispatchQueue( String name ) {
        super( name );
      }
    
      // Ensure thread ready
      public void waitUntilReady() {
        handler = new Handler( getLooper() );
      }
    
      // Add to message queue
      public void dispatchAsync( Runnable task ) {
        handler.post( task );
      }
    
      public void removePendingJobs() {
        handler.removeCallbacksAndMessages( null );
      }
    }
    
    ...
    
    // Channel listeners
    publish.addChannelListener( new ChannelAdapter() {
      // Close
      public void onClose( ChannelEvent ce ) {
        dispatch.dispatchAsync( new Runnable() {
          public void run() {
            System.out.println( "Publish closed." );
          }
        } );
      }
      
      ...
    }
    

The "Gateway" class, which implements all the chat network communication, uses this technique extensively. While the "Gateway" class uses other classes such as "AmqpChannel" which have their own callback routines, those callbacks are not exposed to the "ChatActivity" in this application. This is an implementation detail you may choose to add in your own project. The "AmqpChannel" and "AmqpClient" classes expose a variety of callbacks around network state. For now, I just dump those calls to the log.

### Next Steps

So long as you know where the Android workflow differs from desktop Java, implementing a real-time, cross-platform/device chat using Kaazing Gateway could not be easier. Make sure you leverage the Maven repositories, keep your threads separate, and manage network connectivity efficiently, and you will have no problems. Of course this project is available on [my personal GitHub repository](https://github.com/krhoyt/Kaazing/tree/master/chat/android) as well should you want to download it and have a try yourself.

![Android, Java Swing, and Web on iOS chatting together.](http://images.kevinhoyt.com/chatting.it.up.jpg)

As this point you have real-time communication across web standards (desktop and mobile), Java on the desktop, and Android devices. You do not even have to build and manage your own server to get it going thanks to the free "sandbox" server. From here maybe you want an IoT (Internet of Things) example? Maybe all this AMQP talk is a little more than you need for your project, and WebSocket alone will work? If you have specific use-cases you would like to see discussed, please let us know!
