---
feature_image: /img/covers/engine.jpg
unsplash_author: Chad Kirchoff
unsplash_author_url: https://unsplash.com/@cakirchoff
unsplash_photo_url: https://unsplash.com/photos/gray-and-black-engine-xe-e69j6-Ds
title: Real-Time Engine Telemetry
description: Wherein I use Java to connect to a Bluetooth OBD device attached to my car, and send the details in real-time to the web. Live camera feed and GPS coordinates show up on a map.
permalink: /2015/05/12/vehicle-engine-telemetry/
tags:
  - IoT
  - Web
rating: 1
---

*[Automatic](https://www.automatic.com/) is a great product passes data from your cars computer to your phone, and onto the servers for analysis.  Insurance companies like [Progressive](https://www.progressive.com/auto/snapshot/) and [eSurance](https://www.esurance.com/drivesense) have also picked up on this to offer their customers discounts for responsible driving.  The same technology has been used extensively in transportation and logistics by companies such as [FedEx](http://tv.adobe.com/watch/adobe-summit-2014/adobe-summit-2014-day-two-keynote-chapter-two/).*

This is reposted on the [Kaazing Open Source Blog](http://kaazing.org/blog/real-time-vehicle-telemetry/).

https://youtu.be/VephhH4buCI

On the insurance and smart driving fronts, these products tend to operate in a batch mode.  They give helpful analytics over the long-term, but are not particularly designed for real-time.  Real-time offerings exist for transportation and logistics, but these systems can be very costly.  With the advances in microcomputing, IoT (Internet of Things), and real-time connectivity, you can now deliver the same experiences on the cheap using off the shelf hardware.

### On-Board Diagnostics System

Pretty much every vehicle manufactured since 1995 has an on-board computer.  These computers offer a number of services to the vehicle itself, but can also be tapped into by third parties through a protocol referred to as OBD (on-board diagnostics).  If you take your car into the shop, they will likely use this interface to take a peek under the hood, without having to manually check every system.

![An OBD port in a 2005 Nissan Altima](/img/assets/nissan.altima.obd.jpg)

The OBD port is generally located under the driver-side dashboard.  It is a fairly blocky looking thing, that is more narrow on one side than the other.  As it turns out, there are a variety of adapters made to plug into these ports.  The one we chose to use was an ELM-327 unit that communicated via Bluetooth.  These units also come in wi-fi and USB flavors.

![ELM327 Bluetooth Mini](/img/assets/elm327.bluetooth.mini.jpg)

### OBD Protocol

Technically the OBD protocol is an [ISO standard](http://en.wikipedia.org/wiki/ISO_15765-4) but there are many other variations.  You effectively open the serial port to your OBD connector, and then issue a series of commands.  Many of these commands have been well [documented](https://en.wikipedia.org/wiki/OBD-II_PIDs) by the community, and you can find libraries for languages such as [Java](https://github.com/pires/obd-java-api) and [Node.js](https://github.com/EricSmekens/node-bluetooth-obd).  A typical exchange looks something like the following snippet.

``` text
atz                   // OBD protocol
> ELM327 v1.3a
    
atrv                  // Vehicle voltage
> 12.5V
    
atsp0                 // Protocol level
> OK
    
0100                  // Current data
> 41 00 BF 9F A8 93  
    
010c                  // Engine RPM
> 41 0C 0E 96
```

As [Kaazing Gateway](http://kaazing.com) provides a Java client, this was our stack for this project.  The Java OBD library expects an InputStream and OutputStream to work.  Serial Java communications is not yet standardized, but we like the [jSSC](https://github.com/scream3r/java-simple-serial-connector/releases) (Java Simple Serial Connector) project.  The problem with jSSC is that it does not expose InputStream or OutputStream projects, but rather works off an event-based approach.  In the end, we rolled our own lightweight, hardly complete, OBD protocol implementation on top of jSSC.

> You can find all the code for this project, including our jSSC-based implementation of OBD in my [Kaazing GitHub repository](https://github.com/krhoyt/Kaazing) under "iot/cars/java".

### Geolocation

Most ECUs (engine control units) have access to on-board GPS systems, but these are generally exposed under vendor-specific OBD commands that are not well documented (if at all).  To address this, we used a third-party [USB GPS module](http://www.amazon.com/gp/product/B000PKX2KA/ref=oh_aui_detailpage_o04_s00?ie=UTF8&amp;psc=1).  GPS units talk using [NMEA](http://www.gpsinformation.org/dale/nmea.htm) (National Marine Electronics Association) data, which is also well documented.  It is effectively a string of comma-separated values.

``` text
$GPGGA,123519,4807.038,N,01131.000,E,1,08,0.9,545.4,M,46.9,M,,*47
```
    
Which means:

- Fix taken at 12:35:19 UTC
- Latitude 48 deg 07.038' N
- Longitude 11 deg 31.000' E
- Fix quality: 1 = GPS fix
- 8 satellites being tracked
- 0.9 horizontal dilution of position
- 545.4,M altitude in meters above mean sea level
- 46.9,M height of mean sea level
- (empty field) time in seconds since last update
- (empty field) station ID number
- *47 checksum data
    
I was initially worried that jSSC would only allow access to a single USB port at a time, but it turns out that it can support multiple ports at once.  Our Java program then pulls OBD data and GPS data, and merges the information.  The merged information is stored locally for playback or batch processing, but also published through Kaazing Gateway using [AMQP](https://www.amqp.org/) (Advanced Message Queing Protocol).

Because we are using a publish-subscribe architecture, any number of systems could be listening for this telemetry data.  This might be an insurance company, the vehicle manufacturer, government highway safety, etc.  This decoupling of data from client is a big step forward over traditional request-response approaches.  For our project, we simply received the information in a web browser.

### Web Client

Kaazing Gateway also provides a JavaScript client for AMQP using WebSocket (pioneered at Kaazing).  This allows us to listen for vehicle data in real-time on the Web.  A splash of Google Maps shows where the vehicle is geographically located.  SVG (Scalable Vector Graphics) in turn, provide for crisp rendering of the engine data itself.  We went with the basic information provided on most vehicle dashboards - fuel level, speed, RPM, and engine coolant temperature.

The result is real-time vehicle telemetry across devices and clients - and at a total cost of about $100 USD.  In this case we used a MacBook Pro as our computer, which was then in turn wirelessly connected to a mobile hotspot from a smartphone.  A Raspberry Pi would be equally effective for this purpose, and provide a much small footprint.  If you are looking for something more industrial in nature, Intel makes an [IoT Gateway](http://www.intel.com/content/www/us/en/internet-of-things/gateway-solutions.html) product, which includes a GSM radio.

### Next Steps

With modern web standards, there is no reason that your IoT data should be delivered in a batch approach.  Most developers look to batch processing with request-response because that is what is most comfortable to them.  The information loss however, especially in industrial applications, can be significant.  Finding out that a refrigerated freight vehicle has blown it's compressor could mean valuable loss of cargo at an extreme cost to the vendor, customer, and freight companies.

If real-time seems intimidating, I would encourage you to take a look at my Kaazing [chat tutorial](http://blog.kevinhoyt.com/2015/01/23/building-a-chat-application/).
