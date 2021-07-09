---
title: Particle Photon on Watson IoT
slug: particle-photon-on-watson-iot
date_published: 2016-04-27T17:25:25.000Z
date_updated: 2016-04-27T17:25:25.000Z
tags: iot, photon, pubsub, watson, mqtt
---

IBM has had an IoT platform offering for a while now in various forms.  The most recent evolution falls under the Watson brand, and includes device management, and authentication.  Marketed as the [Watson IoT Platform](https://console.ng.bluemix.net/catalog/services/internet-of-things-platform/), the messaging layer is MQTT supported by [IBM MessageSight](http://www-03.ibm.com/software/products/en/messagesight).

MQTT is an [ISO standard](http://docs.oasis-open.org/mqtt/mqtt/v3.1.1/mqtt-v3.1.1.html) largely conceived at IBM, and you can find implementations of it for just about any platform or language.  There is even support for MQTT over WebSocket via the Eclipse Paho JavaScript [library](https://www.eclipse.org/paho/clients/js/).

On the device side, there are MQTT implementations for [Electric Imp](https://electricimp.com/) and [Arduino](http://pubsubclient.knolleary.net/), as well as Linux-based systems such as [Raspberry Pi](https://www.npmjs.com/package/mqtt) and the [Intel Edison](https://www.eclipse.org/paho/clients/java/).  Today I will take a look at connecting a [Particle Photon](https://www.particle.io/) to Watson IoT.

### Watson IoT Setup

Watson IoT runs on IBM Bluemix.  The details of setting up a Bluemix account, and creating an IoT instance are beyond the scope of this blog post - mostly because the Bluemix user interface is constantly changing, and any pictures posted here would likely be out of date in just a months time.

![IoT Platform inside the Bluemix dashboard.](http://images.kevinhoyt.com/watson.iot.dashboard.png)

At a high level however, once you have a Bluemix account, you can search the "Catalog" for "iot" and find the "Internet of Things Platform" service.  Create an instance of that service, which you can leave unbound.  Bringing it up in the Bluemix dashboard will reveal an option to "Launch Dashboard" which is where we will pick up.

**Device Type**

Once you have reached the Watson IoT Platform management console, you will find a series of icons down the lefthand side of the screen.  You are looking for one labeled "Devices" which as of this writing is the second icon down.

![Watson IoT Plaform overview screen](http://images.kevinhoyt.com/watson.iot.overview.png)

Because (a) we do not want just random devices connecting to our service and (b) we want to be able to interact with specific devices, it is here where we can define devices types, and then specific instances.  Click on the "Add Device" button to define your first device.

![Creating a device type.](http://images.kevinhoyt.com/watson.iot.create.type.png)

When prompted for a name, enter "Photon" as we will define additional attributes in subsequent steps.

Initially you will have no device types defined, so select "Create a device type".  You will then be walked through a series of steps to setup information about this device type.  You can even define attributes common to this device type to help you find deployed devices later.

![Specify a Watson IoT manufacturer](http://images.kevinhoyt.com/watson.iot.manufacturer.png)

Select "Manufacturer" here, and supply "Particle" for demonstration purposes.

If you have any additional information about this device type that is not already captured, you can enter that in the metadata.  We will leave this blank.

**Device Instance**

This completes the creation of the device type.  Now it is time to create an instance of the device.  You will now find "Photon" in the device type list.  Select it and click the "Next" button.

The second screen will ask you for the device ID.  How you use this field is pretty open.  When I present at conferences, I like to use the conference name as the device ID.  In an industrial setting, you might use building numbers, warehouse sections, or other data.

> Note that the device ID will come up again, as will the device type.  These are key pieces of information that will be used in publish/subscribe topic configuration.  You will want them to be simple, yet descriptive.

After adding any additional metadata for this device instance, you will be asked about security.    Clicking "Next" here will automatically generate a security token, which is what I usually do.  You will not get another chance to view the token, so you will want to store it somewhere safe - it will come up again as we program the Photon to connect over MQTT.

![Watson IoT device instance security settings.](http://images.kevinhoyt.com/watson.iot.device.security.png)

Now you have an instance of the Particle Photon device type created.  At the end of the creation process, you will be presented with a summary screen.  You can also access this screen by clicking on a device instance in the device listing.  Notice the "Recent Events" and "Sensor Information" are currently blank.  Once we connect our Photon, these will come to life.

### Particle Photon

Just as this blog post does not cover using Bluemix, this blog post assumes that you know how to configure your Photon, and use Particle tooling.  I will be using the online editor, but a similar workflow can be applied should you be using the desktop IDE.

Along the lefthand side of the IDE screen, one of the icons represents the available libraries for the Particle platform.  If you search for "MQTT" you will find an MQTT implementation, which you can add to your application.  There is even an "mqtttest.ino" example file to use.  We only need to tweak the settings to point to our Watson IoT instance.

    #include "MQTT/MQTT.h"
    
    char *IOT_CLIENT = "d:ts200f:Photon:WebVisions";
    char *IOT_HOST = "_your_organization_here_.messaging.internetofthings.ibmcloud.com";
    char *IOT_PASSWORD = "_device_token_here_";
    char *IOT_PUBLISH = "iot-2/evt/count/fmt/json";
    char *IOT_USERNAME = "use-token-auth";
    
    int count = 0;
    
    MQTT client( IOT_HOST, 1883, callback );
    
    void setup() {
      Serial.begin( 9600 );
    
      while( !Serial.available() ) {
        Particle.process();
      }   
    
      client.connect( 
        IOT_CLIENT, 
        IOT_USERNAME, 
        IOT_PASSWORD 
      );
    
      if( client.isConnected() ) {
        Serial.println( "Connected." );
        // client.subscribe( IOT_SUBSCRIBE );
      }
    }
    
    void loop() {
      count = count + 1;
    
      client.publish( 
        IOT_PUBLISH, 
        "{\"count\": " + count + "}" 
      );            
      client.loop();
    
      Serial.print( "Count: " );
      Serial.println( count );
      delay( 1000 );
    }
    
    void callback( char* topic, byte* payload, unsigned int length ) {
      char p[length + 1];
        
      memcpy( p, payload, length );
      p[length] = NULL;
        
      String message( p );
    }
    
    

**Client ID**

Each device will need to have a unique client ID when communicating to Watson IoT.  In the code above, I use "d:ts200f:Photon:WebVisions".  The format of this string is very specific (and specified in the documentation).  If you get part of it wrong, you will be immediately disconnected from Watson IoT.

The "d" part of the client ID string indicates that this is a device that is connecting.  Applications can also connect to Watson IoT, in which case this part of the client ID would be "a".

The "ts200f" is the automatically generated organization name given to my instance of Watson IoT.  The easiest place to find the organization name of your instance, is to look in the address bar of your browser.  Your organization name will be the first part of the domain.

The "Photon" part of the client ID is the device type (not the instance).  This is the device type we created earlier.

The "WebVisions" part of the client ID is the device ID.  In deployment, you would want to have the "WebVisions" part of the string be unique across all possible device instances for this device type.  You might accomplish this with a random number, UUID, MAC address, serial number, timestamp, or any other approach.

**Host**

The host in the code above is "*your_organization_here*.messaging.internetofthings.ibmcloud.com".  I talked about where to get the organization name of your Watson IoT instance in the previous section.  Just in case, you can find it as the first part of the domain in the address bar of your browser.

**Password**

Remember that token we generated when we created an instance of a device type?  The token I warned you that you would need again, and only be able to see that once?  Yeah, that token is your password when connecting with devices.  When connecting as an application, you will use an API key and token from "Access" screen of Watson IoT.

**Publish Topic**

Just as the client ID is very specific, so is the topic naming when it comes to Watson IoT.  In the above code, I use "iot-2/evt/count/fmt/json".

> Watson IoT devices have the option of publishing events, or subscribing to commands (e.g. update).  Applications by contrast can publish and subscribe to events and commands (and more).

What is the difference between an application and a device?  Largely the format of the client ID, and the username/password provided.  A Particle Photon could just as effectively behave as an application.  We are treating it as a device for the example, which is why the "subscribe" line is commented out.

Since we are treating this Photon as a device, it can only publish events, so the first two parts of our topic name will always be "iot-2/evt/".  The next part is an event name, which you can name to match your specific needs.  And then finally, we will be publishing JSON formatted messages, so the last part of the topic name is "/fmt/json".

You do not have to use JSON, and can find other options in the documentation, but JSON messages can be stored directly by Watson IoT (optional).

**Username**

When connecting as a "device" the username will always be "use-token-auth".  Combined with the specific client ID, and the token used for the password, this allows Watson IoT to authenticate your specific device.

When authenticating as an application, an API key and additional token value will be used as username and password.  This is useful if for example you are using [Node-RED](http://nodered.org/) to handle messages, or have a browser-based application using the Eclipse Paho MQTT library for JavaScript.

**Instantiate Client**

The remainder of the code should be self explanatory.  We will create an instance of the MQTT client, connect to Watson IoT, and publish a message once every second.

The client instantiation requires a callback function for when messages arrive from a subscribed topic.  Since "devices" cannot subscribe to topics within the context of Watson IoT, the callback is never used.  If you were treating this Photon as an "application" then you would be able to subscribe to events and callback handler would be used.

### Next Steps

With the Photon code flashed to the physical device, and connected to Watson IoT, head back to the management console.  If you still have the "Photon" instance selected, you will now see messages start showing up under the "Recent Events" and "Sensor Information" sections.  If there was an error connecting, you can scroll down and check out the connection log.

From here you would likely connect some other client to Watson IoT - probably as an application.  The client ID, username, and password connection strings would need to be changed, and then you could event connect the Photon to Watson IoT.  Anything that can connect to an MQTT broker can participate in the conversation.

Using a publish/subscribe pattern is an immensely powerful foundation for high-performance, event-driven application - IoT or otherwise.  The pattern allows you full decoupling of microservices, and can take you down the path of reactive programming.  Skills that once mastered make testable, Web-scale applications, a snap.
