---
title: "Reading Light: Origins"
slug: project-reading-light
date_published: 2016-01-04T17:36:59.000Z
date_updated: 2016-01-04T17:36:59.000Z
tags: maker, reading, light
---

Some time ago (more than a year), my then 9 year-old daughter asked for a reading light.  She likes to read before bed, but prefers paper books over digital.  You can pick up reading lights in all forms on the cheap, but I saw this as a teachable opportunity.  So we broke out the soldering iron, and went to work.

### Electronics

Reading lights are basic circuits.  There is a power source, that is hooked up to a switch.  When the switch is closed, the current runs through a suitable resistor, into an LED, and then to ground.  When the switch is open, no current flows, and the reading light is effectively "off".

The project needed enough light to read by, and I was not sure that a standard 5mm white LED would be enough.  I had [10mm diffused white LEDs](https://www.sparkfun.com/products/11121) lying around, but again, I was concerned about the brightness (or lack thereof).  In the end, I went with a [10mm super bright white LED](https://www.sparkfun.com/products/11118).

![10mm super bright white LED.](http://images.kevinhoyt.com/led.super.bright.10mm.jpg)

For power, I had a [4xAA battery cube](https://www.sparkfun.com/products/retired/550) from an old robot project that I figured would provide enough power for extended reading.  The batteries provide 6V, while the LED has a forward voltage of 3.4V and a forward current of 80mA.  Pop those values into [Ohm's Law](https://en.wikipedia.org/wiki/Ohm%27s_law) (or an [LED calculator](http://led.linear1.org/1led.wiz)), and we need a 33 Ohm resistor.  Rounding up to what I had on hand, landed me with a 47 Ohm resistor.

![LED calculator results.](http://images.kevinhoyt.com/reading.light.original.led.png)

### Enclosure

The reading light will also need an enclosure.  It needed to be big enough to hold the electrical components, but small enough to be easily portable.  It also had to be relatively easy to modify to be able to mount the switch and LED.  As I order parts from [SparkFun](http://sparkfun.com) all the time, I had one of their small cardboard boxes on hand, which fit all my criteria.

![Behold the original reading light.](http://images.kevinhoyt.com/reading.light.original.box.jpg)

I placed the LED in the top third of the lid of box, using an [Xacto knife](http://www.amazon.com/gp/product/B00004Z2UB?keywords=xacto%20knife&amp;qid=1451925544&amp;ref_=sr_1_1&amp;sr=8-1) to make small holes for the leads.  On the underside of the lid, I used glue to hold the LED in place.  I placed the [switch](https://www.radioshack.com/products/spst-neon-rocker-switch?variant=5717521541) in the lid, by cutting the recommended hole size of 3/4 of an inch.  With the outer components in place, I soldered the necessary wires in place.  A flip of the switch, and we were in business.

### Problems

Well, really just one problem.  The battery cube was free floating inside the box.  This meant that as the box/reading light itself was transported around, that the battery cube would move.  This is not a problem for the battery, but over time, as we found out, it is a problem for the wires - namely the thin leads for the resistor.  Enough back and forth, and the connections would break, rendering the light useless.

![Inside the box.](http://images.kevinhoyt.com/reading.light.original.inside.jpg)

I figured this would be coming ahead of time, and [shrink-wrapped](https://www.sparkfun.com/products/9353) the entire resistor, including wire connections.  Unfortunately, the movement of the battery was still too much.  To remedy this problem, I taped the battery cube to the inside of the box, as well as the resistor.  No more movement.

The reading light has powered the LED for quite some time now.  The reading light has made its way, along with my daughter of course, to several countries.  It is so well traveled in fact that the box is beginning to deteriorate, and will need replacement soon.

### Customer Feedback

As I look forward to the next generation of the reading light, it makes sense to leverage the software development lifecycle ([SDLC](https://en.wikipedia.org/wiki/Systems_development_life_cycle), really just a software-specific [Scientific Method](https://en.wikipedia.org/wiki/Scientific_method)), and gather some feedback.  After discussing possible improvements to the reading light with my now 11 year-old daughter, here is what I learned.

- **Too bright** - It turns out that the 10mm super bright white LED, that produces 16,000 mcd is just too bright under most circumstances.
- **Constant** - I say under "most" circumstances, because there are conditions under which she needs all the light the LED can produce.
- **Placement** - Because there is no clip, the reading light generally gets placed on her pillow, next to her head.  Also, the light is used as a flashlight in unfamiliar surroundings (camping, hotel).

To this list, I have my own upgrades that I would like to make for the next iteration.

- **Power source** - It turns out that the 4xAA cube has lasted a lot longer than I expected.  I could probably go with a bit more refined source such as a LiPo battery.  This of course means I will need a charging circuit as well.
- **Enclosure** - I am a stickler for custom enclosures.  Anybody can show you a bunch of wires soldered together, it is the enclosure that makes the project.  A smaller, more rugged package would be a good improvement.

### Next Steps

With feedback collected, I am ready to embark on the next generation of my daughter's reading light.  The five points of feedback actually represent a pretty sizable leap forward.  Over the next several blog posts, I will document the process en route to the second version.
