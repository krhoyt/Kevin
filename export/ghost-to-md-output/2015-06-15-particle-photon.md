---
title: Particle Photon
slug: particle-photon
date_published: 2015-06-15T22:28:55.000Z
date_updated: 2015-06-15T22:31:02.000Z
tags: iot, particle, photon
---

*The company Spark, which became popular with their Core product, has recently changed the name of their company to Particle.  The successor to the Spark Core then is the [Particle Photon](https://www.particle.io/prototype#photon).  I have received two Photon units and have been putting them through their paces over the past week.*

---

![Particle Photon unboxing](http://images.kevinhoyt.com/particle.photon.unboxing.jpg)

The biggest change from the Core to the Photon, for most practical purposes, is the move to a new wireless chip - the Broadcom BCM43362.  That may seem like an insignificant change, but if you consider that the whole purpose of the Photon is to connect to the Web, then this is effectively open heart surgery.

I had two main complaints about the Spark Core.

- The CC3000 wireless chip came with numerous limitations, not the least of which was no 802.11n support.
- The mechanism for pairing was a clumsy back door on the 802.11b/g  which is unlike most other devices.

### Wireless Support

The new Particle Photon supports 802.11b/g/n networks.  Since I run my home on 802.11n, this means that I do not have to switch over to older standards to put the Photon on my network.

I have also found that connecting to the network happens much faster.  This is a big deal when you are developing a project.

New firmware is delivered to the Photon via the Particle Cloud (just like the Core before it).  The Photon receives the new firmware, flashes it, and then reboots.  That reboot process takes the device off the network (true for both the Photon and the Core).  The device then needs to reconnect to the network.

If you are compiling new code frequently, the time it takes to reboot and reconnect can really hamper your momentum.  With the Photon however, the process of uploading new firmware, and reconnecting to the Internet, is is almost as fast as uploading locally to an Arduino.

### Pairing

This is easily my favorite new feature of the Photon.  It seems like a simple thing, but when your device has no screen or keyboard, making sure this goes right is of the utmost importance for customer success.  If your customer cannot get their fancy new device on the Internet, and they have just bought a brick, you are not going to hear the end of it.

When you first plug in the Photon, it creates its own wireless network.  This is a technique known as Soft AP for soft access point.    From here you connect to the Photon's network using your smartphone.  Using the Particle application, you can then tell the Photon about your network.  From there, the Photon will connect to your network, and you can access it in the Build tool.

> You can also tell the Photon about the network settings using the Particle CLI.

This is the type of configuration that the Google Nest uses.  Or even if you have used an Arduino Yun.  The broad precedent helps to ensure that your customer knows how to connect their shiny new device, or can easily find support to get there.

The one drawback to this approach right now, for Particle, is the lack of production SDKs.

That is to say that you do not want to tell your end customer to use the Particle application to configure their network settings - you want your end customer to use your own application.  This means embedding an SDK to configure your Photon device, into your application.  Right now the only option is iOS, which is beta at that.

![Particle Tinker application](http://images.kevinhoyt.com/particle.tinker.application.png)

Theoretically, any computing device with a browser should be enough to configure network settings if Soft AP was done thoroughly.  Being able to use a browser desktop for example would give your customers a much greater rate of success.  You could embed videos, detailed image stills, and more textual descriptions with the extra screen realty.

To be fair, the Spark Core did not do this either.

### Moving Forward

At this point, I would pretty much always recommend starting new Arduino-esque projects with the Particle Photon.  The horsepower is there.  The connectivity the Arduino never had properly done.  SparkFun even offers shields for the Photon ranging from [weather](https://www.sparkfun.com/products/13630), to [battery](https://www.sparkfun.com/products/13626), to [micro LED](https://www.sparkfun.com/products/13628), and more.

> The Photon has also been shrunk down into SMD form-factors called the [P0 and the P1](https://www.particle.io/prototype#p0-and-p1).  This makes it very easy to move from project to product.

At $19.00 for a Photon with headers, you are actually $5.00 less than the Arduino Uno right out of the gate.  On top of that you get wireless, which could run you as little as $8.00 or as much as $75.00 depending on the amount of work you want to put into it.  Pile on cloud deployment, a rich firmware API, as extensive library for sensors, and more, and there is just no beating the Photon for getting started with IoT.
