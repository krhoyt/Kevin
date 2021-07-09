---
title: "IBM Cube: Software"
slug: ibm-cube-software
date_published: 2016-02-29T18:54:38.000Z
date_updated: 2019-07-03T20:55:24.000Z
tags: ibm, maker, bluemix, nodejs
---

When I originally designed the IBM Cube, I really wanted to have Qi wireless charging in the top.  The concept was that I could lay my phone on the top of the cube when it needed a charge - utility.  When I dropped that feature, the IBM Cube became largely a wood box with lights.  That means it is up to the software to breath utility back into the IBM Cube.

There are three parts of software to consider for the IBM Cube - the firmware, the server, and the user interface.  I am going to start at the user interface.

### User Interface

The UI for the IBM Cube is particularly important since the project itself has no screen, no buttons ... no way to directly interact with it.  The functionality of the UI is also where the utility of the project will live until I revise it and add wireless charging.  When looking for inspiration, I settled on a circular interface.  The design currently has four "modes".

**Finance**

In the financial mode, the UI gives an assortment of stocks that I can choose to monitor.  I went with some general technology stocks to start.  In this mode, the IBM Cube will look up the stock price change, and show red, green, or blue for decrease in price, increase in price, or no change in price, respectively.

![Financial Mode](http://images.kevinhoyt.com/cube-financial-mode.png)

**Color**

In the color mode, I am presented with an arrangement of colors from which to choose.  Selecting a color will turn the IBM Cube to that color.  I like to think of the utility of this mode as mood lighting.  My daughter likes the pink mood light the best.

![Color Mode](http://images.kevinhoyt.com/cube-color-mode.png)

**Alarm Mode**

There is not an actual speaker in the IBM Cube, so this is not an alarm in the typical sense.  In this mode, the IBM Cube will start lighting up at 30-minutes prior to the set alarm time.  The UI then allows me to pick the time I want to set as the alarm.

![Alarm Mode](http://images.kevinhoyt.com/cube-alarm-mode.png)

**Power Mode**

This was originally going to be a "weather mode" in which the color of the IBM Cube would change based on the outside temperature.  I could never decide on a color palette however, so this ended up being "power mode".  In power mode, I can turn the IBM Cube off, full brightness, or some measure in-between.

![Power Mode](http://images.kevinhoyt.com/cube-power-mode.png)

The user interface was implemented for the browser, allowing me to quickly and easy change settings from any device I may be holding.  SVG plays a pretty important part throughout the design, as well as rotation with CSS transforms.

### Server

All the changes in the user interface interact with a server.  The reason for this is mostly the size of the data from related services such as stock prices (and originally weather).  While these services could be access by the IBM Cube directly, managing memory with the large amount of returned data would have proved quite challenging (if not impossible).

The other reason for the server is to be able to save settings.

When the IBM Cube is unplugged, it  loses whatever settings it had.  I could have solved this by putting the settings into non-volatile memory, but then that means the user interface would have to poll the device directly for the settings whenever it was loaded.  This is possible, but it just seemed easier to put the settings on the server and share them across whatever device (IBM Cube or browser) would be accessing them.

You might think I need a server to talk from the browser to the IBM Cube, but that is not actually the case thanks to the [Particle JS SDK](https://docs.particle.io/reference/javascript/).  It is entirely possible to talk directly from the browser, to the Particle Cloud, and into the IBM Cube.  This requires loading of security credentials (not an API key, but your full-on account username and password) onto the client, which was something I did not want to do.

When a mode is selected, or a setting within a mode is changed (from the browser), the server stores those changes, and then uses the Particle Cloud API to communicate the changes to the IBM Cube.  The data presented to the IBM Cube is a greatly simplified, CSV format of the settings which takes up minimal memory, and is easy to parse.

### Firmware

The firmware has two primary functions - listen for incoming setting changes, and change the state of the IBM Cube.  Settings changes can trigger changing the state, but the state of the IBM Cube also needs to change by itself over time.  For example, when a stock price changes.

**Settings Changes**

Settings changes are handled by a function that is exposed to the [Particle Cloud API](https://docs.particle.io/reference/api/).  This effectively allows the server to call into the IBM Cube in a secure manner.  Settings are then parsed into volatile memory, and a routine is called to take action on those settings.  Here is an example of what the settings string looks like before it is parsed.

`F,158,31,99,IBM,8:30,255,255,255`

This is the "financial mode" watching the IBM stock price.  Which as of this writing is up, so the color of the IBM Cube is green.  In "color mode" the IBM Cube would be showing rgb( 158, 31, 99 ).  In "alarm mode" the IBM Cube will start to light up at 8:00 AM, and be completely lit up at 8:30 AM.  And finally, in "power mode" the IBM Cube will be full brightness with a white color.

> All said and done, it cost me a maximum of 36 bytes to communicate all that information.

**Automatic Changes**

For all the given modes, an interval of about one update per minute seemed more than acceptable.  Among the thirty levels of brightness in the "alarm mode", I am not sure my eye would notice anything more.  In the "financial mode" I am not trading based on the color of the IBM Cube, just glancing at it once in a while to see if the selected stock is up or down.  One minute worked fine here.

    void loop() {
      long now;
        
      // Seconds since epoch
      now = Time.now();
        
      // Non-blocking delay
      if( ( now - last ) > UPDATE_RATE ) {
        // Next timer
        last = now;
    
        // Request settings from server
        request.hostname = CUBE_HOSTNAME;
        request.port = CUBE_PORT;
        request.path = CUBE_SETTINGS;        
            
        http.get( request, response, headers );
                    
        // Parse settings
        settings_parse( response.body );
    
        // Update cube
        refresh();
      }
    }
    

The main loop of the firmware, uses a non-blocking approach to the one minute timer.  I could have used delay() or even sleep() but then I would have been unable to handle incoming requests from the user interface.  I did not want to make a change in the UI, only to have to wait up to a minute for the change to take effect.

I use the HTTPClient library on the Particle Photon to make REST requests from the firmware.  When requests are made from the IBM Cube, they go back to the same server where the settings are stored first, are then proxied out to the respective services as needed.

As mentioned earlier, the reason for this is in keeping tight control over the amount of data that needs to be handled by the firmware.  Using the stock price service as an example, there is a wide variety of data returned that is likely pertinent to most applications.  All the IBM Cube wants to know however is if the price is up, down, or no change has occurred.  The resulting response to the IBM Cube then is boiled down to "+" for a price increase.  A single byte.

### Next Steps

The first iteration is now complete, and sits on the night stand next to my bed.  I have already started on the next version, which will include a 3D printed USB micro port for power, and Qi wireless charging.  There will also be some optimization of the circuitry inside the IBM Cube, which should keep the wire clutter inside the cube to a minimum.

If you have any questions about the IBM Cube, or would fancy a similar item for your business, with your logo, then please feel free to email me directly, or reach out to me on [Twitter](http://twitter.com/krhoyt).
