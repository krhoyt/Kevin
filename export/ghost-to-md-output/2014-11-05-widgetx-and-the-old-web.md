---
title: WidgetX and the Old Web
slug: widgetx-and-the-old-web
date_published: 2014-11-05T16:00:00.000Z
date_updated: 2015-04-21T14:23:39.000Z
tags: web, arduino, yun, led
---

*In my last article on "[IoT and the New Web](http://kevinhoyt.com/blog/2014/11/04/iot-and-the-new-web.html)" I talked about how consumer expectations are trending towards instant gratification. I went on to talk about how that experience impacts the Web and the Internet of Things (IoT). I closed by introducing "The Widget Company" (fictional) which will be launching brand new, life-changing (not really) products in the IoT space.*

*Well, the day has finally arrived. The press has gathered. We have dawned our black turtleneck sweaters. Live-blogging is keeping the Interwebs informed. Suddenly, in a surprise "one more thing" moment, The Widget Company CEO introduces "WidgetX!" Now we can all gather around a glass enclosure to finally get our first glimpse of the future.*

---

Okay, so WidgetX is really just a Light Emitting Diode (LED). Not really a life-changing product, but not too dissimilar from other commercial products on the market, such as the [Philips Hue](http://www2.meethue.com/en-us/). Let us sit in on one of the launch event sessions that talks about how this device is connected to the Internet.

### Circuit Diagram

Making an LED blink is the "Hello World" of the physical computing space. It effectively demonstrates basic programming, electronics, and digital input/output (IO). Wiring up an LED requires that you know a little about the LED itself, and a little about Ohm's Law.

> Resistance (Ohms) = Voltage (Volts) / Current (Amps)

Effectively, I will be using an LED with a 2.0V forward voltage and a forward current of 20mA. We also know that voltage provided by the Arduino digital pins is 5.0V. If all of that sounds Greek to you, that is totally fine at this point. It did to me too at one point.

After the voltage passes through the LED, it should go from 5.0V to 3.0V (5.0V - 2.0V). The current needed is 20mA, which gives us a resistance value of 150 Ohms (3.0V / 20mA). So then electricity will come out of a digital pin on the Arduino, through a 150 Ohm resistor, across the LED, and then to ground to make a complete circuit. This looks something like the following diagram.

![Digital pin 12 to 150 Ohm resistor. Resistor to LED anode. LED cathode to ground.](http://images.kevinhoyt.com/fritzing.led.png)

### Arduino Yun

The [Arduino Yun](http://arduino.cc/en/Main/ArduinoBoardYun) is one of my favorite hobbyist platforms for the Internet of Things. Besides being an Arduino Leonardo, it has a Linux System on a Chip (SoC), micro SD slot, ethernet jack, USB Type-A, and even 802.11 b/g/n wireless. The wireless even supports ad hoc mode, which will let us configure SSID and password details from a browser on a different machine.

*The details on configuring an Arduino Yun are beyond the scope of this post.*

The Arduino Yun SoC gives us handy server and client libraries to use in our Arduino code. You can use these libraries to create servers and clients not only for the web, but for any other TCP/IP protocols.

Rather than write our own HTTP handling however, the SoC will serve content uploaded with our sketch. To get this going, create an "/arduino/www" directory structure on the Yun SD, and then create a "www" folder inside your sketch folder. That content will be uploaded for you automatically.

Another reason that the Yun is so great for prototyping is that it can automatically serve up a REST interface for your sketch. Anything after "[http://arduino.local/arduino/](http://arduino.local/arduino/)" can be easily read through the aforementioned client library as a stream. You can then parse the incoming string, and even write content back to the requesting client.

> Woah! That is a lot of functionality provided out of the box that we would otherwise have to figure out all ourselves.

Woah! That is a lot of functionality provided out of the box that we would otherwise have to figure out ourselves. To recap, the Arduino Yun gives us all the following for the purposes of building the IoT device, WidgetX:

1. Arduino Leonardo (16 MHz MCU)
2. Wireless (802.11 b/g/n)
3. Hostname (no IP hunting)
4. Configuration Panel (SSID)
5. Micro SD (disk space)
6. HTTP Server (for static assets)
7. REST API (passthrough to our sketch)
8. TCP Server
9. TCP Client

This is almost more a really lightweight computer like the Raspberry Pi, than it is an Arduino. And that is an important observation. Using our request/response hammer, this project really looks like a nail, and we load up accordingly. That seems like a lot of pieces to put into every little IoT device we want to bring to market. While you consider the long-term implications of that hammer, here is the Arduino code WidgetX uses.

    // Libraries
    #include <Bridge.h>
    #include <YunClient.h> 
    #include <YunServer.h>
    
    // Literals
    #define LED_OFF          "OFF"
    #define LED_ON           "ON"
    #define MESSAGE_LED      "LED"
    #define TERMINATOR_SLASH '/'
    
    // Constants
    const int LED = 13;
    
    // Server
    YunServer server;
     
    // Setup
    void setup() 
    {
      // Digital output
      // Set low (off) initially
      pinMode( LED, OUTPUT ); 
      digitalWrite( LED, LOW );
      
      // Leverage the SoC libraries
      // Start listening for clients
      Bridge.begin();
      server.begin();
    }
     
    void loop() 
    {
      String    command;
      String    message;
      YunClient client;
      
      // Accept incoming client request
      client = server.accept();
     
      // If there is a client
      if( client ) 
      {
         // Parse the command from the URL
        command = client.readStringUntil( 
          TERMINATOR_SLASH 
        );
        command.toUpperCase();
    
        // Message for the LED
        // Could have multiple controls
        if( command == MESSAGE_LED ) 
        {
          // Parse the message from the URL
          // Trim - invisible - newline from end
          message = client.readString();
          message.toUpperCase();
          message.trim();
      
          if( message == LED_ON )
          {
            // Turn the LED on
            // Tell the client something happened
            digitalWrite( LED, HIGH );
            server.println( message );                      
          } else if( message == LED_OFF ) {
            // Turn the LED on
            // Tell the client something happened        
            digitalWrite( LED, LOW );        
            server.println( message );                      
          } else {
            // What did you want me to do?
            server.print( "Unknonwn: " );
            server.println( message );        
          }
        }
      
        // Close connection with client
        client.stop();
      }
    }
    

### Web Client

![A little CSS magic helps us toggle the appearance of the button.](http://images.kevinhoyt.com/iota.web.led.png)

For the Web stack, we will have a single HTML page with a button in the center. When you press the button, an XMLHttpRequest (XHR) instance will be used to make the GET request with the appropriate command to turn on the LED. When you release the button, the XHR instance will send the command to turn off the LED.

Here is what our JavaScript will look like:

    var xhr = null;
    
    function doButtonDown()
    {
      xhr = new XMLHttpRequest();
      xhr.addEventListener( "load", doButtonLoad );
      xhr.open( 
        "GET", 
        "http://arduino.local/arduino/led/on" 
      );
      xhr.send( null );
    }
    

Because our Arduino Yun is serving all the static content, including the JavaScript, we do not have to worry about cross-domain security. This seems fine for a single IoT device, but will really introduce problems as we add more IoT to our product line-up. How will these devices communicate across one another? How about devices that we did not make? How will they even be aware of one another? When we start swinging hammers around, we can quickly arrive at an "intranet" of things, as opposed to the far more powerful "internet" of things.

For the button, I am using an old CSS trick. Both the up and down states of the button are loaded as one image. The element that shows the button does not show overflow content which hides the state we are not showing at the moment. To change states, we can adjust the style of the "background-position" property.

    .button {
      background-image: url( 'button.png' );
      background-position: 0;
      background-repeat: no-repeat;
      height: 283px;
      outline: none;
      overflow: hidden;
      width: 298px;
    }
    
    .button:active {
      background-position: -298px;
    }
    

*Note that I am using a DIV element for my button to make styling a little easier across screens - I am looking at you iOS!*

If you are a web developer, all of these web stack pieces probably feel pretty comfortable. That is a good thing because the hardest part of IoT is actually the Internet. As a Web Developer you have a much shorter way to go to master IoT than an Electrical Engineer. On the hardware side, patterns start to emerge pretty quickly. On the Web side, there is a never ending permutation of screens and technologies to support.

### Next Steps

Like any other technology, there are a myriad of ways to architect the Yun into our web stack. We could for example, run PHP on the Yun itself (on the Linux SoC side), and even Apache or Nginx. We could run PHP on a central server (EC2) and then proxy communication to and from our devices. The list goes on and on.

> What happens when the device needs to notify us of state changes?

If you have put this particular code in place, one thing you will notice is that the LED is particularly slow to respond. Clicking the button in the browser takes a second or two to actually light the LED. While this seems like an acceptable margin, we are only issuing commands right now. What happens when the device needs to notify us of state changes?

This is exactly the challenge that The Widget Company is going to have to face as it introduces yet another game-changing IoT device. We will take a look at how they solved that problem in the next post.
