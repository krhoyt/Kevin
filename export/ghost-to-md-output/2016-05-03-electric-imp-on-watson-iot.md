---
title: Electric Imp on Watson IoT
slug: electric-imp-on-watson-iot
date_published: 2016-05-03T17:37:59.000Z
date_updated: 2016-05-03T17:37:59.000Z
tags: watson, iot, electric, imp
---

I recently posted about connecting a [Particle Photon](http://www.kevinhoyt.com/2016/04/27/particle-photon-on-watson-iot/) and your [browser](http://www.kevinhoyt.com/2016/04/28/your-browser-on-watson-iot/) to the [Watson IoT Platform](http://www.ibm.com/internet-of-things/).  Both of these systems easily supports publish/subscribe using MQTT.  What happens when you have a device that does not support MQTT, yet still needs to communicate with Watson IoT?  In this post we will take a look at connecting an [Electric Imp](https://electricimp.com/) to Watson IoT.

### Electric Imp

![Electric Imp Developer Edition courtesy SparkFun.](https://cdn.sparkfun.com//assets/parts/7/1/7/2/11395-03.jpg)

I got my first Electric Imp around 2011-2012 timeframe.  At the time, the hardest part of IoT was in easily setting the SSID/password on a device with no screen or keyboard.  Sure as a developer, you could code it, but that does not work so well in a commercial setting - you are not going to visit every customers house personally and configure their shiny new IoT device.

Electric Imp is a wireless platform with an ARM Cortex M3 at it's heart.  The developer edition comes in an [SD card](https://www.sparkfun.com/products/11395) form factor, and SparkFun makes a [breakout board](https://www.sparkfun.com/products/12886) for prototyping.  This innovative packaging allows you to use SMD SD card products to hold and power the Imp.

![Electric Imp breakout board sold by SparkFun (image courtesy of SparkFun).](https://cdn.sparkfun.com//assets/parts/9/7/7/6/12886-00.jpg)

Perhaps the most innovative feature of the Imp is the (patent pending) BlinkUp.  You can think of BlinkUp like Morse code, where your smartphone flashes the screen from black to white, at a very rapid pace, to communicate the SSID/password to a photocell receiver on the Imp.

Unfortunately, in my (pretty extensive) testing across devices, the BlinkUp is unreliable, or just flat out unsupported.  I was working on a product for a while where my very first tester was using a Windows Phone ... Windows Phone is not supported by Electric Imp.  It did not take me long to figure out that this was not going to work in production.

However, if you have a controlled environment, or know that your end user will have a supported device, then the Electric Imp makes for a fantastic wireless platform on a number of fronts.

### Device and Agent

When developing on the Imp, there are two parts to consider.  The first is the "device" where you interact with any electrical components.  This is code running locally on the Imp.  The second part is the "agent" which is code running in the Electric Imp cloud.  Devices can only communicate with their agents.

This may seem tedious at first - if you want to make an HTTP request, your device needs to tell the agent to do the work, and then pass the response back to the device.  With any other device you would make the request directly from the wireless chip.  In practice, this configuration, and separation of responsibility, provide a thorough layer of security for your IoT device.

It does however put a damper on any publish/subscribe pattern implementations.  For example, at the time of this writing, WebSocket was being considered for future releases, and an MQTT implementation was not available.  Robust, secure request/response?  You bet!  Event-driven publish/subscribe?  Nope.

### Watson IoT

Recently added to the Watson IoT Platform is the ability to communicate via HTTPS from devices and applications.  The Imp agent is already very good at HTTPS, so this works out perfectly.  We will treat the Imp as a Watson IoT device, and then follow the general pattern of making an HTTP POST request to your Watson IoT instance.

    https://${orgid}.internetofthings.ibmcloud.com/api/v0002/device/types/${typeId}/devices/${deviceId} 
    

The request requires two headers.  The first the the "Authentication" header, which as a device we will specify "use-token-auth" as the user name, and your device token as the password.  For more on what a device token is, and where to obtain it, view the first post in the series on using a [Particle Photon](http://www.kevinhoyt.com/2016/04/27/particle-photon-on-watson-iot/).

The second header is "Content-Type" which we will set to "application/json".  If you recall from my previous Watson IoT posts, the message format is usually on the topic string.  Note that in the URL above, there is no "fmt/json" at the end.

**Imp Device**

The Electric Imp is programmed using [Squirrel](https://electricimp.com/docs/squirrel/).  Squirrel is a loosely-typed language very similar in nature to JavaScript.  In my experience, Squirrel has a bit more focus on data structures, which comes in handy.  Translating our Watson IoT requirements to the Imp device looks like the following code.

    // Track count
    // Will reset if Imp is reset
    local count = 0;
    
    // Called to count
    // Increments, sends, sleeps
    function counting() {
      // Increment
      count = count + 1;
      
      // Send to Imp agent  
      agent.send( "count", {
        "count": count
      } );
    
      // Sleep for one second
      // Call this function again upon waking
      imp.wakeup( 1.0, counting );    
    }
    
    // Start counting
    counting();
    

You can see how the data structure for counting, which effectively looks like JSON (or a hash), is sent to the Imp agent.  There is a lookup for the function to call at the Imp agent, but no destination URL is given, or any other type of authorization/authentication credentials.  The call to the Imp agent, living in the Electric Imp cloud, is secure.

> Compare this to the Particle Photon, where we outright embedded our credentials in the code, and had no robust HTTPS class to otherwise secure our communication/credentials.

**Imp Agent**

The Imp agent side of things is where the magic happens - where we actually reach out to Watson IoT.  The trickiest part of this exchange is in making sure the URL is correct.  Like the MQTT topic string, the URL is lengthy, and generally flows from device type, to device ID, to event type.

    // Registered agent function
    device.on( "count", function( data ) {
      // URL for HTTP POST
      // Maps to specific device type
      // Specific device instance
      // Specific event
      local url = "https://" +
        "ts200f" + 
        ".internetofthings.ibmcloud.com" +
        "/api/v0002/device/types/" +
        "Imp" + 
        "/devices/" +
        "WebVisions" +
        "/events/" +
        "count";
        
      // Make the request
      // Headers for authorization and format
      // JSON-encoded data
      local watson = http.post(
        url,
        {
          "Authorization": "Basic " + http.base64encode( 
            "use-auth-token:_YOUR_TOKEN_HERE_" 
          ),
          "Content-Type": "application/json"
        },
        http.jsonencode( data )
      ).sendasync(
        // No response body from Watson IoT
        // Log request as finished
        function( response ) {
          server.log( "Counted." );
        }
      );
    } );
    

One thing that bothered me about the response from Watson IoT was that there is no body content.  It would be nice to at least get some fashion of acknowledgement - similar in nature to what would happen with MQTT.  In this case, I just log the end of the request/response exchange to the server log, and move on.

You could also send data back from the agent to the device.

### Next Steps

As you may have been able to tell, I have a love/hate relationship with the Imp.  I love the packaging and form factor, as well as the CPU inside.  I hate the BlinkUp - having tested it across hundreds of technology savvy end-users and failed repeatedly.  I love the security of the separation between device and agent.  I hate the limitations that places on me for real-time data applications.

Being able to merge the Imp's tendency towards request/response with the real-time implementation of Watson IoT is a big step forward.  While the device may still be request/response, my applications can handle that data in real-time as it arrives from Watson IoT.  Now if we could just solve that BlinkUp dependency.
