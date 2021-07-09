---
title: Real-Time Smart Buildings
slug: real-time-smart-buildings
date_published: 2015-05-13T14:48:23.000Z
date_updated: 2015-05-27T14:35:09.000Z
tags: iot, kaazing, cross, buildings, hvac
---

*What is your favorite building?  The office?  The coffee shop down the street?  Your home?  Maybe a shed out back?  Whatever the case, there is no shortage of ways to augment your home with IoT (Internet of Things).  Google Nest, Philips Hue, or WeMo give you classic request/response control over your appliances.*

---

This is reposted on the [Kaazing Open Source Blog](http://kaazing.org/blog/real-time-smart-buildings/).

You might even get notifications when appliances fall outside a specific range.  Chances are that this will happen via request/response as well.  Somewhere in the background of the application there will be a routine that occasionally polls the appliance to find out the current conditions.

> Have you ever stopped to wonder why request/response is used in these scenarios?

I would propose that request/response seems to make sense because it is what we know from Web development.  We have gotten really good at request/response, and have countless frameworks to support it.  While "what I know" is certainly a valid answer, when it comes to IoT, especially on the industrial level, real-time may offer a better solution.

## Commercial HVAC

Most commercial buildings, whether they be your grocery store, or your office, have massive HVAC (Heating, Venting, Air Conditioning) systems installed.  These system have compressors that manage forcing air (hot or cold) through the building.  Many were installed when the building was built, and this is not equipment that you simply upgrade and replace because you want IoT features.

At the same time, IoT features bring some very real optimizations (read: money saving) to these systems.

### Manufacturer

From a manufacturer perspective, knowing how your equipment runs based on building demand and environmental factors such as the weather, can lead you to build more reliable units that better fit your customer needs (read: improved sales).

### Customer

The same type of information that is valuable to the manufacturer can be equally valuable to the customer, but for completely different reasons.  For example, why run the compressor at full capacity if the weekend load does not require it?  Optimizations to be had here save wear and tear, as well as electrical costs to power the compressors (read: savings).

### Maintenance

Compressors like this are usually sold by a manufacturer, installed by a partner, and maintained by whomever the customer wants to call to have repairs done.  Inevitably, since the customer is not an HVAC technician, the call for maintenance is vague at best.  The result then is that the repair technician will have to spend a lot of time to (a) figure out the problem (b) order the parts and (c) install the parts.  This can take several days; meanwhile building tenants become increasingly disgruntled.

> What if the system provided insight to the problem by itself, and was able to notify an HVAC technician with the specifics before they ever left the warehouse? (read: reduced operational costs).

### The Request/Response Problem

At first glance, again because it is comfortable, you may be inclined to solve these problems with request/response.  However a request/response solution only gives you a snapshot into the condition of the equipment.

Let us say for example, that we poll the compressor once every five (5) seconds.  The resulting sensor snapshots give us an indication that broken equipment is outside acceptable operational ranges, but it does not give us the whole picture.  In other words, the aforementioned three interested parties will only get glimpses of the data they actually want.

No worries.  We will do what comes naturally and poll more frequently - let us say we drop this to one (1) second intervals.  Now we may be getting more data, but consider the financial impact of this decision.  More frequent polling means more hardware will be needed.  This additional demand will need to be met not only by the web server, but also the database.  And ultimately, if we chose request/response for the compressor in the beginning, it may not even be capable of delivering the information at a faster rate.

### The Real-Time Solution

What if we simply went with a real-time solution from the start?  Sensor data can be continually streamed from the compressor.  To see this you need only fire up an Arduino and Serial.println( data ) as fast as the processor will let you.  Serial connections are how most deployed hardware like these compressors prefer to communicate.

> To address commercial IoT, we need to shift our thinking from getting data when we think we need it, to getting all the data all the time, and taking action as conditions exceed operational ranges.

This shift does require a change in how we think about our architecture.  Rather than request/response, a more appropriate solution here would be publish/subscribe.

In a publish/subscribe architecture, commercial equipment can stream data in real-time, all the time.  Secondary applications that are interested in that data then only need to subscribe for those messages.  For example, a database system could capture all the data as it comes in, and either selectively store data incrementally (every five seconds), discarding the information in-between, or batch update with all the captured data.

Now that we are operating in real-time, let us take a look at those aforementioned parties.

- 
The manufacturer can receive all sensor data from all deployed units, providing a clear picture as to the behavior of the systems.  Now they really know how to optimize future development.

- 
The customer, armed with real-time data, can now adjust the compressor output on-demand.  As soon as people leave the office to go home, the system can start to wind down - whatever time of day that might be.  *If only weather applications were built on real-time systems too.*

- 
The repair technician now sees how the system is behaving in real-time.  Patterns that indicate specific problems can now be visualized and interpreted for faster resolution.

## Real-Time HVAC Example

As the saying goes, seeing is believing.  Based on work Kaazing is doing with partners, we assembled a proof of concept to show the impact of real-time data visualization on a commercial HVAC system.

[![Real-time HVAC visualization.](http://images.kevinhoyt.com/kaazing.iot.buildings.web.jpg)](http://temp.kevinhoyt.com/kaazing/iot/buildings/local.html)

You can see the difference yourself, first hand.  When you load the example, the page will be operating the old fashioned request/response way.  To see the latest data, simply refresh the page.  Clicking on the button labeled "5" will move to polling the database every five seconds.  Data will update, but the snapshot is incomplete.  Clicking the button labeled "1" will up the polling rate to every one second.

Now click on the Kaazing logo.  Data that flows in real-time immediately surfaces a pattern that has been there all along - a sine wave.  Imagine the repair technician seeing this signal, looking it up in a manual, and showing up at your building before the problem becomes critical.  Additionally, the technician would have all the parts and tools necessary to resolve the situation.

### Next Steps

Exploring real-time IoT does not require that you invest in a commercial HVAC compressor.  Head on over to my [personal GitHub repository](https://github.com/krhoyt/Kaazing/tree/master/iot/buildings), and grab the "iot/buildings" folder.  There is Arduino code in that directory that you can test for yourself.  The accompanying Java code reads the serial data and taps into the open source Kaazing Gateway.  Even if you do not have Kaazing Gateway installed, you can test against our freely available "Sandbox" using that same Java code.

If you're used to using request/response, because it's the solution you know, then perhaps it's time to make the leap to publish/subscribe for your next IoT project.
