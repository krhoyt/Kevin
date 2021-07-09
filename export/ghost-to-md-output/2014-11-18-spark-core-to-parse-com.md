---
title: Spark Core to Parse.com
slug: spark-core-to-parse-com
date_published: 2014-11-18T15:00:00.000Z
date_updated: 2015-04-21T13:47:13.000Z
tags: parse, spark, core
---

*Compared to the [Electric Imp](http://kevinhoyt.com/blog/2014/11/18/electric-imp-to-parse-dot-com.html), the [Spark Core](https://www.spark.io/) is a relative newcomer. It launched via [Kickstarter](https://www.kickstarter.com/projects/sparkdevices/spark-core-wi-fi-for-everything-arduino-compatible), picking up almost viral momentum early, due mostly to the use of the Texas Instruments [CC3000](http://www.ti.com/product/cc3000) wireless stack. Just last week Spark announced an upgrade to the Core, called the Photon, which ditches the CC3000 and is due in March 2015. While I am really excited about the Photon, let us take a look at what the Core offers us today.*

---

Before getting too far, I would like to talk a little about the brand. The name of the company is Spark, and the name of the device is the Core. Put them together and you get the Spark Core. This is one area I think the Photon will help Spark from a marketing perspective. With the arrival of its second device, Spark will really start to emerge as an IoT-enabler as opposed to a one-trick pony.

### TI CC3000

Second, some details about the CC3000. This innovative chip picked up a lot of interest mostly because wirelessly linking hardware to the Web is actually a really challenging problem. With no keyboard or screen, setting SSID becomes a real feat of engineering. If you are just a hobbyist, you can hard-code these credentials, but in production, consumers are not going to update your code with their SSID, recompile, and flash new firmware.

The CC3000 series chipset uses a little loophole in 802.11 b/g networking, that allows you to set the SSID from another device on the target network. Notice the catch there - 802.11 b/g. If you are running an 802.11 n network, as I was when I received my Spark Core, then you will be out of luck. Not to mention the now growing list of 802.11 ac implementations.

To address this, the Spark Photon moves to a [Broadcom](http://www.broadcom.com/products/wiced/wifi/) chipset that provides "soft access point" (Soft AP). Soft AP allows the device to setup its own wireless network when it does not have an SSID specified, or cannot attach to the one that has been specified. Once the Soft AP wireless has been established, you connect your smartphone (or other device) to that network. You can then set the SSID information on the device, usually using a custom application, or web page.

For somebody looking to move from prototype to production, where the consumer's wireless network is unpredictable, this represents a big step forward. And the Spark Photon is not alone here, as the [Google Nest](https://nest.com/) (among others) also uses the same chipset. Oh, and the Broadcom chipset supports 802.11 n networks as well.

### Spark Core

Outside of the innovative CC3000, the Spark Core uses an ARM Cortex M3. Unlike the Electric Imp however, the Core is Arduino compatible. This means that if you are already familiar with the the Wiring framework used by the Arduino, then you will feel pretty comfortable with the Spark Core. And of course, you can use C/C++ to further extend your capabilities.

![The Spark Core](http://images.kevinhoyt.com/spark.core.jpg)

This does not mean however that all your favorite Arduino libraries can be used. It also does not mean that the Arduino tooling workflow can be used. In fact, neither is true. To address this, the folks at Spark make many libraries available in their cloud IDE. Many, but not all. You will have to import and migrate any libraries not already supported.

As for the IDE, this was originally cloud-based only - just like the Electric Imp. Unlike the Imp however, there is no debugging console for the cloud IDE. With the Spark Photon announcement came the release of Spark Dev - a desktop IDE that promotes Arduino-like development workflow. There is also a command-line tool chain available for working with your Spark Core.

**Pro Tip:***If you struggle with setting the SSID on your Spark Core using the Spark application, you can also set it over USB. I actually used the Arduino Serial Monitor for this. You send the Core a "w" with no line feed, and it will prompt you for SSID and password. Enter each followed by a newline.*

Updating the firmware on the Spark Core happens wirelessly, which is great. You click a button in the cloud IDE, it finds your Core, and uploads new firmware. Unfortunately, this process is not always reliable, sometimes requiring multiple attempts, or resetting of the Core entirely. I do love the RGB LED included on the board however, as I could easily tell when problems arose, or when everything was going smoothly.

### Circuit Diagram

There is not much difference in this circuit than wiring it up with any other controller. You send it 3.3V, of which the Core has two sources, run through a 10k resistor to ground, and take analog samples off the same thermistor/resistor junction. The Spark Core has a 12-bit DAC, which means 4,096 steps of resolution.

![The Spark Core is so small that it fits entirely on a mini breadboard.](http://images.kevinhoyt.com/spark.core.fritzing.thermistor.png)

### Device Code

Since the Spark Core is Arduino compatible, the code from the perspective of interacting with the sensor is similar to the [Circuit Friday](http://kevinhoyt.com/blog/2014/11/07/circuit-friday-thermistor.html) example, with a few constant changes for working with 3.3V and 12-bit DAC. I will skip over posting that code here again, and instead move onto the meat of communicating with the Parse.com system.

Spark provides a number of value-add classes that you can leverage from the Core. There are classes to expose variables through a REST-based API. There are classes to publish/subscribe to data from other Core devices. There are classes to learn all about the wireless environment. But for our purposes we are interested in the TCPClient class (there is also TCPServer and even UDP support).

    TCPClient client;
    
    ...
    
    // Loop
    void loop() 
    {
        double temperature = 0.0;
        int    analog = 0;
    
        // Analog reading
        analog = analogRead( THERMISTOR );
    
        // Thermistor reading as celcius
        temperature = thermistor( analog );
    
        // Store data in cloud
        if( client.connect( KRHOYT_URL, KRHOYT_PORT ) )
        {
            request( temperature );
            wait();
            response();
        }
    
        // Wait for next sample
        delay( UPDATE_RATE );
    } 
    

The TCPClient is pretty similar to any other networking library you may have used on the Arduino. In this case a call to TCPClient.connect() will start a TCP connection to a desired endpoint. The call is blocking, and returns a true/false upon completing. Once we know that the call has been completed successfully, we can go about logging the data.

Notice that I am using my own proxy server here, as opposed to going directly to [Parse.com](https://parse.com/). The reason for this is that the Spark Core does not have the horsepower to handle HTTPS connections. By offloading networking requests to the cloud, Electric Imp overcomes this challenge, but introduces dependency on their cloud. By comparison the Spark Core makes network requests directly, but is then limited by the capabilities of the controller.

    void request( double value )
    {
        // Buffers for string conversion
        char celcius[10];
        char farenheit[10];
      
        // Farenheit as character string
        sprintf( celcius, "%2.2f", value );
      
        // Convert to celcius as character string
        sprintf( farenheit, "%2.2f", value * 1.80 + 32 );
    
        // Action - PARSE
        // APP_ID
        // Celcius
        // Farenheit
        // Data type - Temperature
        // Operation - create
        // REST key
        // Unit - object
        // Version - 1
    
        sprintf( 
            buffer, 
            "{\"action\":\"%s\",\"details\":{\"app_id\":\"%s\",\"data\":{\"celcius\":%s,\"farenheit\":%s},\"data_type\":\"%s\",\"operation\":\"%s\",\"rest_key\":\"%s\",\"unit\":\"%s\",\"version\":%s}}", 
            KRHOYT_ACTION,
            PARSE_APP,
            celcius,
            farenheit,
            PARSE_TYPE,
            KRHOYT_OPERATION,
            PARSE_KEY,
            KRHOYT_UNIT,
            PARSE_VERSION
        );
    
        client.println( "POST / HTTP/1.1" );
        client.println( "Host: proxy.kevinhoyt.com" );
        client.print( "Content-Length: " );
        client.println( strlen( buffer ) );
        client.println( "User-Agent: Spark Core" );
        client.println( "Content-Type: text/plain;charset=UTF-8" );
        client.println();        
        client.print( buffer );
    }
    

My custom-designed proxy has evolved over time to allow me to communicate with all my favorite cloud-based systems. To handle these variations, clients must POST a JSON structure that provides instructions as to handling the destination. My proxy system aside, you may have a non-HTTPS endpoint that needs JSON, so the approach would be similar if you were going directly from the Spark Core to any other API endpoint.

On the Arduino, I have become a big fan of the sprintf() function to format data. While the string here is really long (character array actually), I can pop values into the JSON structure with ease. The sprintf() function also allows me to convert the temperature readings from double to character arrays.

At this point, what we have is a TCP connection. We are connected to a server, and ready to send data to it. To make this into an HTTP connection, we need to send the appropriate values, in the correct form, across the wire. You can add headers here, or improvise on them, as I have with the User-Agent header.

    // Wait for a response from proxy
    void wait()
    {
        // Periodically check curl process
        while( !client.available() ) 
        {
            Serial.println( "Waiting ..." );
            delay( 100 );
        }
    }
    

Once the request bits have been sent, the server may take some time to respond. To handle this we will sit in a loop, checking for available data. When data arrives, execution will go back to the main loop, which will them move onto handling the response. One might also use a finite state machine to handle this in the main loop, but I feel my code reads a bit cleaner with the secondary loop approach.

    // Response from proxy
    void response()
    {
        char c;
      
        // While there is data to read
        while( client.available() ) 
        {
            // Get character
            c = client.read();
            Serial.print( c );
        }
      
        client.stop();
    }
    

And finally comes the response! So long as the server, in this case my proxy server, is sending data back to the Spark Core, we will read those characters in and echo them to the serial port (USB). Once all the data has arrived, we will close off the client connection by called client.stop().

In the case of Parse.com, the data coming back is in JSON format. We could further parse this data, change settings on the device. We would have to do this however, using our own implementation. We would also need to be aware of the memory (or lack thereof) available to us. By comparison, the Electric Imp gives us a class to handle JSON out of the box.

### Next Steps

Most of the shortcomings of the Spark Core can be overcome with software updates, and it looks like the Spark team is hard at work doing exactly that. Those shortcomings that require hardware updates should be taken care of by the upcoming Spark Photon in March 2015.

There are many things to love about the Spark Core however including an attractive price, compact footprint, and the adorable RGB LED indicator. The developer kit even comes with a battery and charging circuit shaped as a mustache. Because, why not!

As for going from prototype to production, I think the Spark Core (and Photon) hold a lot of promise, but they are just not there yet. However, if you are familiar with Arduino, and looking at a comfortable way to start playing with IoT, then it will be hard to beat the Spark Core. You could get a [CC3000 shield](https://www.sparkfun.com/products/12071), but you would sacrifice size, considerable features, and cost.
