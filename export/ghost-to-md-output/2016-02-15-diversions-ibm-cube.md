---
title: "IBM Cube: Hardware"
slug: diversions-ibm-cube
date_published: 2016-02-15T18:09:53.000Z
date_updated: 2019-07-03T20:54:00.000Z
tags: ibm, maker, photon, ponoko
---

IBM has a distinctly "executive" feel to it.  Long gone are the mandatory ties and corporate theme song (yes, seriously), but that culture is still very much alive and well.  While I work remote most of the time, I wanted something with that executive feel on my desk.  The IBM Cube project was born.

![IBM Chicago Office](http://images.kevinhoyt.com/ibm-logo-chicago.jpg)

As I looked around the web for IBM logos, I ran across this marker for the Chicago, IL office.  It seemed like the perfect fit, so I pulled the initial dimensions (obviously at a much smaller scale) from that design.  The white that lights up at night could be cut out to reveal the RGB LED lights, and of course I would put a wireless micro-controller inside to control the lighting remotely.

### Fabrication

Desktop fabrication has come a long way in recent years.  Where before, a laser cutter would cost you $16,000 at an entry level, today you can upload a vector file to a service like [Ponoko](https://www.ponoko.com/), and have the results a few days later.  Cannot afford a 3D printer?  Upload to [Shapeways](http://www.shapeways.com/), and pick from numerous materials (including metal).

Coming from Adobe, I am pretty fluent in Illustrator, especially as it pertains to fabrication, so that was my tool of choice.  I chose a high quality walnut veneer product at 3.5mm thick for that executive look.  I also baked in a little "P" for my daughter, Paige, as a material test.

![Laser Cutter Plan](http://images.kevinhoyt.com/cube-laser-cutter.png)

I have learned over the years of working with a laser cutter to etch guides on the faces that do not show, which is why the IBM logo is backwards in the design.  You can see the outline of the [WS2812 LEDs](https://www.sparkfun.com/products/13282), as well as the [Photon](https://www.particle.io/prototype) wireless controller from Particle.

Trying something new this time, I etched the entire area where the the [USB Micro-B](https://www.sparkfun.com/products/12035) breakout board would go.  The hope here was to shave a little thickness off the wood to provide more wiggle room for the breakout board.  The idea did not work.

![Laser Cutter Results](http://images.kevinhoyt.com/cube-laser-result.jpg)

I was worried that the cutouts for the IBM logo would be too tight for the laser kerf (material lost in the cut of the laser itself), but the results came out great.  In the picture above, Ponoko uses a sheet of masking tape to keep the hot flame from scorching the surrounding material.  The sheet of material measures in at 12" x 24", with the IBM Cube being 100mm cubed.

![Without masking tape, somewhat assembled.](http://images.kevinhoyt.com/cube-no-tape.jpg)

After pulling off the masking tape comes the part that makes me the most nervous with every project - test assembly.  You are just never quite sure if you missed a cut or measurement in translating from the 3D concept from your head to the 2D vector design.  This time around, at first glance, it looks like I got everything right.

### Assembly

After researching SparkFun breakout board thickness, and reviewing the data sheet for the USB Micro-B adapter used in the breakout board, I calculated that the total height of the assembled breakout board would be about 4.5mm.  Since I am working with a 3.5mm wood sheet product, that leaves me with a 1mm problem.

As mentioned earlier, my hope was that a heavy etching of the breakout board area, on the actual wood, would give me that extra 1mm.  It did not, and I had to use a rotary tool to trim things up.  For a future iteration, or future designs that use the USB Micro-B breakout board, I think I will design a 3D printed enclosure for it to fit cleanly in the project.

![Particle Photon and WS2812B RGB LEDs.](http://images.kevinhoyt.com/cube-photon-led.jpg)

After gluing together the base of the project using Elmer's Glue-All, running wires from the USB Micro-B up the center support, and glueing the support together, it was time to get to the meat of the project - the micro-controller and WS2812B RGB LEDs.

If you have ever worked with RGB LEDs before, you know that the wiring, and individual addressing can become a nightmare very quickly.  The WS2812 series of RGB LED have a micro-controller baked into them.  The LED controller needs in/out for 5V, GND, and a signal wire.  That signal wire gets hooked to your project micro-controller.  The result is addressable RGB LEDs that can be easily strung together in a series.

> The downside of WS2812 RGB LEDs is that they cost more than an RGB LED of the common cathode variety, and that they draw a lot more current - up to 60mA per LED.

For projects like this, I really enjoy using the [wire wrapping](http://www.digikey.com/product-detail/en/WSU-30M/K105-ND/5986) technique.  This allows you to assemble the project and test it out without soldering anything.  If you make a mistake, you can simply unwrap that terminal.  Once everything is in place and verified to be working, I go back and solder over the wires to make sure they stay where I want them.

![IBM Cube assembled, testing, and waiting to dry.](http://images.kevinhoyt.com/cube-powered-tested.jpg)

When I originally assembled the cube/top part of the project, without glue, but with the hardware working, I noticed that the light was not diffused enough.  A common approach I have used for this before is a thin sheet of [vellum](http://www.hobbylobby.com/Scrapbook-Paper-Crafts/Paper-Cardstock/Vellum/12%22-x-12%22---10-Sheets-Clear-Vellum-Paper-Pack/p/111222).  The diffused light illuminates the IBM logo crisply and clearly.

I also used rubber bands to hold the cube together while the glue dried.  I have used clamps before, but they tend to be a bit heavy handed in how they hold a project together.  Rubber bands provide stability for the glue to dry, without applying too much pressure.  You can also position them more easily than clamps.

### Next Steps

When I designed the IBM Cube project, I wanted it to be more than just a box with IBM carved into it.  The center support lifts the top part of the cube 3.5mm off the base of the cube.  The result is almost a hovering effect, which is exactly what I was trying to achieve.

The two main changes I would make for future iterations, would be to (a) 3D print an enclosure for the USB Micro-B breakout and (b) use an already assembled strip of WS2812 RGB LEDs.  I would also look into doubling the width and depth of the internal support to allow for more/thicker wires (from 3.5mm to 7.0mm would be plenty).

With the hardware in place, the next step is to design and build a user interface.  Since the Photon can be easily controlled over REST, or even MQTT, there is no shortage of options.  We will take a look at the code in a future post.
