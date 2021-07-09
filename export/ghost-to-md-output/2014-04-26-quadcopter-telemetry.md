---
title: Real-Time Quadcopter Telemetry
slug: quadcopter-telemetry
date_published: 2014-04-26T15:00:00.000Z
date_updated: 2015-05-14T18:29:37.000Z
tags: iot, arduino, websocket, kaazing, cross, telemetry
---

*Modern commercial aircraft have what is commonly referred to as a "black box".  The black box is a flight data recorder.  It captures numerous sensor data points across the aircraft, and records them for playback in the case of a catastrophe.*

*As we have seen lately however, the onboard data recorder can be turned off, destroyed beyond playback, or altogether lost.  What if all that data was streamed in real-time across a satellite connection and into a data center?  With a DJI Phantom 2, Arduino, a pile of sensors, and an Inmarsat modem, we set out to explore this possibility.*

---

This is reposted from the Kaazing [demo listing](http://developer.kaazing.com/portfolio/telemetry/).

### Pieces Parts

While we could not afford to expense a Boeing 737, we did manage to pick up a [DJI Phantom 2](http://www.dji.com/product/phantom-2).  The Phantom is an remote control quadcopter that is capable of carrying our sensor array.

The sensor array consists of a tupperware bowl filled with an Arduino and a stack of sensors.  The tupperware bowl was then strapped between the landing gear of the Phantom quadcopter.  What is that?  Oh, the actual sensors we used?  Sure, there was quite an array, but we largely attempted to emulate what pilots call the "six pack" - the core set of instruments necessary to fly a plane safely (per the FAA).

- Arduino Uno
- GPS module on a GPS Shield
- Compass
- Accelerometer (tilt)
- Temperature
- Humidity
- RGB LED (bi-directional communication)
- XBee module on an XBee Shield

![Quadcopter sensor array.](http://images.kevinhoyt.com/quadcopter.sensor.array.jpg)

While we did not have the time or resources to stream the video of the flight, we did mount a GoPro Hero 3 in the tupperware case as well.  It recorded the flights we made independently from the sensor data.  The sensor data was recorded, but also streamed across the web in real-time.  More on that in a moment.  For now, have a look at the project in action.

### Data Communication

Because the Phantom is not quite strong enough to carry a satellite modem, we needed a way to get the sensor data onto the web.  Of course we cannot exactly put a wire to the Phantom either, so the solution needed to be wireless.

We accomplished this using the aforementioned XBee module.  The XBee gave us a range of about one mile, which was plenty for our experiment.  The XBee on the Phantom had a receiver back on the ground, plugged into a computer USB port.  The computer was connected to an Inmarsat satellite modem.  A Java program on the computer, read the data coming from the XBee radion via the USB port, and then sent that data to a Kaazing Gateway as it arrived.

![Inmarsat Explorer.](http://images.kevinhoyt.com/quadcopter.inmarsat.jpg)

Keeping in mind that we had to go over XBee, wireless to an Inmarsat modem, up to a satellite in space, back down to a data center connected to the Internet, and then to the various devices through whatever means of connection they had, you might expect some serious lag.  In the end, we reliably measured a latency of **less than one** second from the sensor array, to a mobile device (on a cellular network) tracking the flight.  One second!

### Data Recording

Thanks to Kaazing Gateway, data from the Java program was sent using publish-subscribe.  This meant that data was pushed to any interested clients.  In most cases, this was a mobile phone or tablet monitoring the flight.  However, a Node.js process also listened for sensor messages, and recorded the data to a database.

![Web browser tracking the flight in real-time.](http://images.kevinhoyt.com/quadcopter.screenshot.png)

Because the data recording was decoupled from the sensor reporting, it could have been Node.js or any other technology on the other side.  While we as developers tend to think of this as platforms, with publish-subscribe, it could effectively be several entirely different entities.  The aircraft manufacturer could record the data.  The FAA could record the data.  The airline itself could record the data.  All using their own stacks, own database structures, etc. without needing to be a part of the actual telemetry broadcasting itself.

### Big Picture

Initially, we set out to show that flight data could be recorded in real-time to the cloud.  While our rig is nowhere near what is needed for deployment on actual aircraft, it proves the point that a black box in the cloud is feasible.  But then we started thinking about the downstream implications.

![Black box in the cloud.](http://images.kevinhoyt.com/quadcopter.cloud.jpg)

Think about how applications track flights today.  Maybe something like a TripIt or FlightTrack that let you know where your flight is, or how soon you can expect grandma to arrive for Christmas.  These application scrape data from various sources to try and give you a decent picture of what is going on.  But imagine if they could simply subscribe to specific flight data for a given client?

Leveraging real-time data, and decoupling the parts and pieces using publish-subscribe opens the door to entirely new ways to view and manage aircraft data.  This impacts not only manufacturers and aviation entities such as the FAA, but trickles right on down to you and me in the applications we use.  Modernizing just a fragment of the infrastructure could significantly travel in a positive way.
