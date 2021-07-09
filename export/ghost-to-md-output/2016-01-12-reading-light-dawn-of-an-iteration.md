---
title: "Reading Light: Dawn of an Iteration"
slug: reading-light-dawn-of-an-iteration
date_published: 2016-01-12T15:26:09.000Z
date_updated: 2016-01-12T15:26:09.000Z
tags: reading, light, maker
---

In my last blog [post](http://www.kevinhoyt.com/2016/01/04/project-reading-light/), I talked about the origins of a handmade reading light my 11 year-old daughter has been using for years.  At the end of that post, there was some "customer feedback" which has now turned into the inspiration for the next iteration.  In this post I will look at how I intend to implement those features in the next version.

### Too Bright

The original reading light used one 10mm super bright white LED.  Since I am powering it at full strength however, the 16,000 mcd was actually too much for reading.  Clearly I need to change the light source.

My first thought was that an array of smallish surface mount LEDs would do the trick.  Unfortunately, most of them come in at just hundreds of milli-candela.  Would that be bright enough?  I also looked at diffused white LEDs, but they too were only in the hundreds range.

The jump in LED packages seems to skip over the lower range, and the next stop is 8,000 mcd to 10,000 mcd.

### Constant

The original reading light had two states - on and off.  The feedback was to make the brightness adjustable.  A wide variety of options danced through my head.

A potentiometer (dial to the layman) mounted to the side of the box seemed like it would be a fix.  But if I was going to do one for brightness, maybe I should stick an RGB LED in the box, and offer three more dials to control the color.

Okay, wait, this is a reading light.  White is good.  I was letting my penchant for the electronics get in the way of solving the problem.

### Placement

The original reading light is often placed on the pillow next to my daughters head.  When she travels, the box gets tossed in her backpack and frequently bumped around.  There is potential here for a brightness dial to get bumped.  I need to be more clever about how I overcome this problem.

### Pieces Parts

If clear white LED packages go from the hundreds, and jump to around 8,000 mcd, that is still half of the 16,000 mcd that the 10mm package the reading light currently creates.  I think that will work, but I will need to buy some to test.

![Accelerometer](http://images.kevinhoyt.com/adxl362.accelerometer.jpg)

Brightness may not even be a factor if I can solve the "constant" problem.  To do that I am going to introduce an accelerometer to the reading light.  This also means that I will need an MCU to interact with it.  That MCU needs to be small enough to keep the reading light compact.

![Arduino Pro Mini 3.3V](http://images.kevinhoyt.com/arduino.pro.mini.3.3v.jpg)

There are all variety of accelerometer out there, including very expensive options for drones and robots.  I just need basic tilt sensitivity, so I picked the cheapest from the SparkFun catalog, the [ADXL362](https://www.sparkfun.com/products/11446).

The accelerometer runs in the range of 1.6V to 3.5V, so it would be easiest to have an MCU that ran at the same levels.  Keeping in mind the need for compactness, I chose the [Arduino Pro Mini 3.3V](https://www.sparkfun.com/products/11114).

### Power Source

While my daughter had no complaints, I wanted to trim up the power supply from a giant 4xAA cube, to something a little more sleek.  With an MCU that runs at 3.3V introduced to the mix, a polymer lithium (LiPo) battery, which generally run at around 3.7V, seemed like it would be ideal.

![Polymer Lithium battery.](http://images.kevinhoyt.com/lipo.2000.mah.jpg)

At 2,000 mAh and about 2" wide by 2" long, this particular battery makes an ideal fit.  It will power the MCU, and the LED, for a long period of time.  At 0.25" inches thick, it also maps well to a custom enclosure made from slices of 1/4" acrylic.

### Enclosure

Desktop fabrication (laser cutting, CNC, 3D printing) has become a favorite hobby of mine.  I was never very good at power tools, but computer controlled tools fit me perfectly.  While I usually ship my projects to [Ponoko](http://www.ponoko.com), I got a [laser cutter](https://glowforge.com) for Christmas this year!

![Glowforge](http://images.kevinhoyt.com/glowforge.jpg)

Given that the battery is a quarter-inch, and the electronics will be about the same, I think I will use two sheets of clear acrylic, sandwiched between two 3mm sheets of birch plywood.  I thought the birch plywood would be a nice touch, as it would allow me to engrave custom art personalized to my daughter.

### Next Steps

The use of a polymer lithium battery introduces one really big challenge - it has be be recharged.  Ideally, this needs to happen without opening the case.

While both Adafruit and SparkFun make battery chargers, they both place the USB connector flush with the edge of circuit board.  Like a product you might buy from a commercial vendor, I want to expose only the USB port for charging.

In the end, this means that I am going to have to create a custom circuit board - my first.
