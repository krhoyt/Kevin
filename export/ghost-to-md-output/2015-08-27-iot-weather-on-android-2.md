---
title: IoT Weather on Android
slug: iot-weather-on-android-2
date_published: 2015-08-27T16:43:18.000Z
date_updated: 2015-08-27T16:43:18.000Z
tags: iot, pubsub, android, weather, rest
---

In a [previous post](http://blog.kevinhoyt.com/2015/08/20/iot-with-cloudant-follow/) I talked about moving from request-response to using the publish-subscribe pattern.  This pattern allows our application parts to listen for changes in a decoupled fashion.  This works great with the continuous feed feature of [IBM Cloudant](http://cloudant.com).  In this iteration I will bring the data to Android, and cover a couple great utilities.

### Volley

On the surface, there is not much new or exciting in this Android iteration of the weather data we have been working with over the last several posts.  The application starts and loads data via a REST exchange with the same server infrastructure we have been using.

In making that request for the initial data however, I am using a library from Google called "Volley".  [Volley](https://android.googlesource.com/platform/frameworks/volley/) is a high performance library for managing network communications.  It even caches the data on the client for the all too common "destroy" event that comes with device rotation.

    JsonObjectRequest   request;
    
    request = new JsonObjectRequest(
      Request.Method.GET,
      getString(R.string.cloud_code),
      null,
      new Response.Listener<JSONObject>() {
        @Override
        public void onResponse(JSONObject response) {
          // Process server response
        }
      },
      new Response.ErrorListener() {
        @Override
        public void onErrorResponse(VolleyError error) {
          Log.d("VOLLEY", error.getMessage());
        }
      }
    );
    
    Volley.newRequestQueue(this).add(request);
    

Notice that last line.  In this case, I am using a static method to initiate the request.  You can also create an instance variable, and then queue up multiple requests.  You can then in turn cancel requests based on responses you might get, etc.  The callbacks also seem to land on the UI thread, so it is easy to update the user interface.

I have commented out the details of "onResponse" for brevity.  What happens in there is that the JSON data is marshaled into a domain object called "Weather".  A populated instance of the "Weather" class is then sent to an "update()" method to update the user interface.

You might be wondering why I do not just update the user interface right from the response handler - especially seeing as it has easy access to the UI-thread?  I extracted that code into a separate method because it will get reused as new data arrives.

### PubNub

If you remember, IBM Cloudant has a feature called "continuous feed" which allows us to be notified when changes happen at the database.  We catch these changes in our Node.js infrastructure, and then use PubNub to push a message to interested clients.

In this case, our Android device is also an interested client.  We use the PubNub Android library in our application to handle new messages - messages that represent that new weather data is available.

    pubnub = new Pubnub(
      getString(R.string.pubnub_publish),
      getString(R.string.pubnub_subscribe)
    );
    
    try {
      pubnub.subscribe(
      getString(R.string.pubnub_channel),
      new Callback() {
        @Override
        public void successCallback(String channel, Object data) {
          // Process incoming message
        }
      }
    );
    

What is interesting here is that the Android client knows nothing about the Node.js server or IBM Cloudant database.  Just like the browser-based client in our previous example, the parts and pieces are decoupled thanks to the use of the publish-subscribe pattern.

### Weak Reference

The PubNub communication however happens on a separate thread from the UI-thread.  That means that it cannot populate the user interface directly.  The handler has to get the data over to the UI-thread.  This is traditionally done using the Android "Handler" [class](http://developer.android.com/reference/android/os/Handler.html).

    // Get key data
    bundle = new Bundle();
    bundle.putDouble(KEY_CELCIUS, document.getDouble(KEY_CELCIUS));
    bundle.putDouble(KEY_FAHRENHEIT, document.getDouble(KEY_FAHRENHEIT));
    bundle.putDouble(KEY_HUMIDITY, document.getDouble(KEY_HUMIDITY));
    bundle.putLong(KEY_TIMESTAMP, document.getLong(KEY_TIMESTAMP));
    
    // Assemble message
    // Cross-thead communication
    message = new Message();
    message.setData(bundle);
    
    // Send message
    handler.sendMessage(message);
    

Much like publish-subscribe on client and server, handlers in Android allow decoupled thread to communicate with one another, without knowing about one another.  In the PubNub success callback, I place the pertinent data on an instance of the "Bundle" [class](http://developer.android.com/reference/android/os/Bundle.html).  That bundle is put into an instance of the "Message" [class](http://developer.android.com/reference/android/os/Message.html).  The message is then sent via the handler to the UI-thread.

The problem with handlers is that they are [known](http://www.androiddesignpatterns.com/2013/01/inner-class-handler-memory-leak.html) to leak memory if not use properly - and using them properly requires a whole bunch of sophisticated overhead code.  The overhead must be written correctly as well in order to prevent leaking memory.  This is a lot of work for a simple message that wants to update the user interface.

> Android Studio specifically will warn you extensively that you have potentially entered a memory leak zone when you start using the Android "Handler" class.

To make this magic much easier, I use a library from [Badoo](https://techblog.badoo.com/blog/2014/08/28/android-handler-memory-leaks) called "WeakReference".  This class encapsulates all the handler nuances for us.  We still use it as a typical handler, and it provides the same interface.

    handler = new WeakHandler(new Handler.Callback() {
      @Override
      public boolean handleMessage(Message message) {
        Bundle  bundle;
        Weather weather;
    
        // Get pertinent data
        bundle = message.getData();
    
        // Marshall to domain
        weather = new Weather();
        weather.celcius = bundle.getDouble(KEY_CELCIUS);
    
        ... More marshaling ...
    
        // Update user interface
        update(weather);
    
        return false;
      }
    } );
    

So in this case, the message data arrives into the Android client via PubNub subscribe handler, the pertinent data is marshaled into a bundle, and then sent as a message to the handler.  The handler marshals the data from a bundle to an instance of the "Weather" class.  The handler is also on the UI-thread, so it has permission to call the "update()" method with the pertinent data.

Long story short then, the "update()" method is extracted for reuse, and that reuse happens from a REST response on the UI-thread, but also a message push from PubNub on a separate thread.  Since the REST handler gets a JSONObject, and the subscribe handler (on the UI-thread side), gets a Bundle instance, data must be marshaled to a common domain class.

### Next Steps

Including the ~30 or so lines used for import statements, this entire Android application comes in at under 250 lines of code thanks to the use of some very powerful helper libraries.  Volley makes REST communication a snap, and WeakReference helps keep your threads talking without leaking memory.

You now have several examples of using IoT data from a Particle Photon on IBM Bluemix to include Node.js, IBM Cloudant, a browser client, and an Android client.  There is just one problem - all of these are one-way communication.  From here what we really want is to be able to communicate back to the sensor as well; perhaps to take some physical action at the installation.
