---
title: WebSocket on Android
slug: websocket-on-android
date_published: 2015-09-16T15:02:04.000Z
date_updated: 2017-09-27T17:58:20.000Z
tags: ibm, bluemix, android, websocket
---

In a previous post, I talked about hosting a WebSocket server on IBM Bluemix.  With the help of a little Node.js on the server, and a browser in hand, we were able to create a functional chat program.  Since WebSocket is an open standard however, we can talk to more than just the browser (despite the name).  In this post, I will show you how to create a native Android application that uses the same WebSocket server to participate in a chat with the browser.

### Handshake

WebSocket is an interesting topic not only because of the real-time capabilities is can bring to your application, but also because of how it functions.  When opening a WebSocket from the browser, the initial contact with the server is an HTTP request.  Assuming the web server knows what to do with that request, it is then "upgraded" to a WebSocket.  This is called the "handshake".

At that point, the WebSocket connection stays open (as opposed to a traditional HTTP request that is closed after the response).  WebSocket can handle not only textual content, but also binary content.  One could effectively build a telnet client using WebSocket, if the target server knew WebSocket.

An interesting aspect of this is that since WebSocket is a standard, there is nothing prohibiting a server from implementing that handshake.  In fact, many server applications do (message brokers for example), and more regularly add support.  But this does not have to happen just at the server, it can also happen from other clients that implement WebSocket.

### Android

Clearly, Android is capable of speaking raw sockets, HTTP, and much more.  It is then certainly capable of speaking WebSocket.  Indeed, a company called [Tavendo](http://tavendo.com), which focuses on real-time data, has an open source framework, called [Autobahn](http://autobahn.ws), which implements WebSocket on Android (and many others).  It is tested, reliable, and fast.

As much as [Gradle](http://gradle.org) has changed my Android development workflow (specifically, the integration with Android Studio), I am an old school Java guy at heart, and still very much enjoy a good old fashioned JAR to deploy into my project - and that is exactly what Autobahn provides.  You will first need to download that library, and add it to your Android project.

    private final WebSocketConnection   socket = new WebSocketConnection();
    
    ...
    
    try {
      socket.connect(BLUEMIX, new WebSocketHandler() {
        @Override
        public void onOpen() {
          // Debug
          Log.d("WEBSOCKETS", "Connected to server.");
        }
    
        @Override
        public void onTextMessage(String payload) {
          // Debug
          Log.d("WEBSOCKETS", payload);
        }
    
        @Override
        public void onClose(int code, String reason) {
          // Debug
          Log.d("WEBSOCKETS", "Connection lost.");
        }
      });
    } catch(WebSocketException wse) {
      Log.d("WEBSOCKETS", wse.getMessage());
    }
    

The declaration of the WebSocket client is declared "final" to avoid memory leaks.  After that, you can call the "connect()" method and pass it a "WebSocketHandler" instance to get going.  You can override those events you are interested in hearing about.

Since the WebSocket chat client (and server) I demonstrated earlier is JSON-based, we are going to be interested in textual content.  Since we already have that infrastructure in place, let us start there in inserting the rest of our Android chat client.

    @Override
    public void onTextMessage(String payload) {
      Bundle      bundle;
      Message     message;
    
      // Debug
      Log.d("WEBSOCKETS", payload);
    
      bundle = new Bundle();
      bundle.putString(KEY_PAYLOAD, payload);
    
      message = new Message();
      message.setData(bundle);
    
      handler.sendMessage(message);
    }
    
    ...
    
    try {
      // JSON object
      data = new JSONObject(bundle.getString(KEY_PAYLOAD));
    
      item = data.getJSONObject(KEY_DATA);
    
      chat = new ChatMessage();
      chat.client = item.getString(ChatMessage.KEY_CLIENT);
      chat.red = item.getInt(ChatMessage.KEY_RED);
      chat.green = item.getInt(ChatMessage.KEY_GREEN);
      chat.blue = item.getInt(ChatMessage.KEY_BLUE);
      chat.message = item.getString(ChatMessage.KEY_MESSAGE);
    
      items.add(chat);
    } catch(JSONException jsone) {
      jsone.printStackTrace();
    }
    
    // Update render
    adapter.notifyDataSetChanged();
    
    // Scroll to bottom
    // Most recent message
    lstHistory.smoothScrollToPosition(adapter.getCount() - 1);
    

Because the WebSocket client communication is not happening on the UI thread (a good thing), we need to send a message to interested "Handler" implementations.  This is how Android communicates across threads, and it is very reminiscent of the publish-subscribe pattern found in message brokers.  To do this we will simply take the unparsed JSON string, put it into a "Bundle" instance, place that in a "Message" instance, and send it along.

> In an [earlier post](http://blog.kevinhoyt.com/2015/08/27/iot-weather-on-android-2/) I mentioned how to use the WeakHandler library from Badoo to avoid memory leaks in your Android applications.

When the data arrives at the "Handler" instance, it is then parsed from JSON into a "JSONObject" and then marshaled into a Java object meant to hold chat details (POJO).  Once the chat object has been populated, it is placed into an "ArrayList" instance, which is in turn the source for a "ListView".  To make sure the new chat shows up on the screen, we notify the adapter of the changes.  Finally, we scroll the to bottom of the "ListView" to show the recent addition.

    txtContent.setOnKeyListener(new View.OnKeyListener() {
      @Override
      public boolean onKey(View v, int keyCode, KeyEvent event) {
        ChatMessage chat;
    
        // Send
        if((event.getAction() == KeyEvent.ACTION_DOWN) && (keyCode == KeyEvent.KEYCODE_ENTER)) {
          // Message present
          if(txtContent.getText().toString().trim().length() > 0) {
            // Build message
            chat = new ChatMessage();
            chat.action = ChatMessage.ACTION_CREATE;
            chat.client = client;
            chat.red = red;
            chat.green = green;
            chat.blue = blue;
            chat.message = txtContent.getText().toString();
            chat.css = "rgb( " + red + ", " + green + ", " + blue + " )";
    
            // Publish
            socket.sendTextMessage(chat.toJSON());
    
            // Clear field
            txtContent.setText(null);
          }
        }
    
        return false;
      }
    });
    

To send a message we will capture the "return" key on the Android keyboard.  I put all the pertinent data into an object reflecting the chat message - the same object I used to marshal incoming data.  I added to this object a "ChatMessage.toJSON()" method that serializes the data into a JSON string.

> It should be mentioned that there are many other great ways to marshal data between Java objects and JSON strings.  I use a manual approach to keep dependencies in my demos to a minimum.

The actual sending of the message happens with a call to "socket.sendTextMessage()".  From there the message field is cleared.  At this point, the Android client we just built, and the Web client from my previous posts will receive and render the message.  The user interface may look similar, but one is Web and the other native Android.

![Android and Web chat.](http://images.kevinhoyt.com/android.websocket.chat.jpg)

### Next Steps

Modernization always calls the enterprise developer.  Open standards, regardless of the stack in which they evolve, are immensely helpful in that process.  If your stack needs real-time data communication, then you can certainly look to the WebSocket standard to help.  Do not let the term "web" confuse you about the possibilities and/or options.

You may have noticed that I use a key in the chat object called "action".  In the code above there is no obvious use.  The action is used in the broader example (which you can find on my [GitHub](https://github.com/krhoyt/IBM/tree/master/cloud/websocket) repository), to differentiate what it is the client wants.  For example, the server, running on [IBM Bluemix](http://bluemix.net), stores chat history in [IBM Compose](http://compose.io).  A command issued over the WebSocket can invoke getting the chat history, but needs some key to differentiate it between creating a new chat message.

*Image courtesy of [Wikipedia](https://en.wikipedia.org/wiki/Tap_and_die).*
