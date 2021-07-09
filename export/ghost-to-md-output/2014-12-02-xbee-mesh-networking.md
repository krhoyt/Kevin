---
title: XBee Mesh Networking
slug: xbee-mesh-networking
date_published: 2014-12-02T15:00:00.000Z
date_updated: 2015-04-21T13:24:52.000Z
tags: xbee, mesh, networking
---

*As you start working with the Internet of Things, one of the patterns that will emerge pretty early is the concept of serial communication. Initially this takes the form of using something like the Serial Monitor with an Arduino. While this communication happens over a wire, a more practical for IoT would be wireless. This is exactly what [XBee](http://en.wikipedia.org/wiki/XBee) modules provide.*

---

### XBee Overview

XBee is a commercial kin of the [802.15 protocol](http://en.wikipedia.org/wiki/IEEE_802.15.4) - not to be confused with 802.11, which is the ubiquitous wi-fi we know and love today. The 802.15 protocol was designed to be less power hungry than 802.11, predominantly by sacrificing speed. It does however gain an amazing potential in distance between points.

XBee comes in a wide variety of [flavors](https://www.sparkfun.com/pages/xbee_guide?_ga=1.233870046.199580068.1415136666). My favorite is the Series 1, which gives me a simple, dumb pipe between my remote sensors, and my master device. It requires no additional configuration out of the box. Strap an XBee modules on your Arduino, and you are wireless.

I have also worked with the Series 2 modules. These can be extensively configured - and almost seem to require it. Why would you want to configure an serial pipe? An example might be running two different meshes. Naming the modules network would keep them separate. Be warned however that the configuration does not come without a substantial degree of complexity.

XBee modules also come in a variety of distances they can span. A 1mW module will get you 300 feet, while a 100mW module will get you 15 miles. Earlier this year, I strapped a 60mW module (1 mile range) to a [DJI Phantom](http://www.dji.com/product/phantom-2) to get [real-time data telemetry](http://vimeo.com/93023138) onto the Web. Try that with traditional wireless (802.11)!

### XBee Advantage

Mesh networks are interesting beasts. You see, not everything IoT needs to be on the Internet. In fact, a 802.11 endpoint may be far out of range. That is perfectly acceptable in a mesh environment. Mesh networks do not need to go directly to a single point.

Data can be passed from one module to another so long as it is in range. If the destination module is out of range of the initiating module, that too is acceptable. The message can be transmitted from unit to unit until the destination is within reach.

Imagine then trying to cover the vast oil fields in Texas with IoT sensors. Clearly there is important data to be had, but the Internet is nowhere to be found. Yet with XBee, these pumps can create a mesh network hundreds of miles in size. Only one module need have access to the Internet.

The communication can go both ways as well. A control center somewhere on the Internet, can in turn, tell a pump in the middle of nowhere to stop for maintenance.

XBee is not the only means of this type of communication. I used to have an [Oregon Scientific](http://www.oregonscientific.com/us/en/Silver-Advanced-Weather-Station-with-Atomic-Time-Weather-500-BAR208S-P) weather station with various sensors placed around the house. Those devices used a proprietary 433MHz frequency signal to communicate. I have since replaced the gear with my own custom weather station ... Because I can!

### Arduino Walkthrough

So now you have gone out and purchased two [XBee Series 1](https://www.sparkfun.com/products/11216) modules, an [XBee Shield](https://www.sparkfun.com/products/12847) for your Arduino, and an [XBee Explorer](https://www.sparkfun.com/products/11697). How do you get all this working?

Well, let us start with the Arduino. Let us give it a little code to just increment a counter. Then we will tell it to send that value over the serial port. If you have worked with the Arduino for a while, this should not look like anything new.

    // Counter
    int counter = 0;
    
    // Setup
    void setup()
    {
        Serial.begin( 9600 );
    }
    
    // Loop
    void loop()
    {
        // Increment the counter
        counter = counter + 1;
        
        // Display the current value
        Serial.println( counter );
        
        // Wait a second and repeat
        delay( 1000 );
    }
    

Notice that there is no XBee library to include. When the XBee is strapped onto the shield, and placed on the Arduino, it will effectively take the Serial output, and send it across to the other XBee module(s).

> You cannot program the Arduino with the XBee attached.

You cannot program the Arduino with the XBee attached. The IDE will use that serial access to load your program. If the XBee is sitting there, the Arduino will never be reached. Functionally, this is not a big deal for development, because you can debug against the serial port the same without the XBee as with it.

Okay, so now put one XBee module on the shield, and then onto your Arduino. Detach the Arduino from the computer, and give it a power source all its own. This guy is now merrily sitting out there, counting numbers, sending them across the air.

Put the other XBee module on the Explorer, and plug it into your computer. Using the Arduino IDE, set the port to the XBee Explorer. Since we are not loading code, we do not need to worry about the board type. Open the Serial Monitor from the IDE, and you should start seeing numbers come across from the Arduino.

### Next Steps

Now that you can talk wirelessly between a remote Arduino and your serial port, there is no shortage of new adventures. You can sense environmental conditions throughout your entire neighborhood, and collect them on a Raspberry Pi dashboard. You can remotely control servos and motors, and more.
