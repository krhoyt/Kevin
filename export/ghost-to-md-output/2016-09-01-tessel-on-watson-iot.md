---
title: Tessel on Watson IoT
slug: tessel-on-watson-iot
date_published: 2016-09-01T21:36:25.000Z
date_updated: 2016-09-01T21:36:25.000Z
tags: tessel, iot, watson, mqtt
---

Do you know JavaScript?  Do you like IoT?  Lean towards open standards?  Then the Tessel should be right up your alley!  Tessel is a hardware development platform.  It has both Ethernet and 802.11 b/g/n support (and more), and you develop for it using Node.js (or Rust, Python).  Based on OpenWRT, it is open source, and open governance.

### Moar Details

![Tessel 2 courtesy Makezine](http://images.kevinhoyt.com/tessel.2.jpg)

The Tessel team has made interesting hardware choices along the way.  On top of the connectivity I already mentioned, the Tessel includes two USB ports, and two module ports.  With a 580MHz CPU, 64Mb of RAM, and 32Mb of flash, this thing was made to deliver on your IoT dreams.

Wait, what is a module port?

If you are a JavaScript developer, chances are good that you are not an Electrical Engineer.  To ease that learning curve, Tessel produces a line of "modules" that plug into the Tessel module ports.  These include climate sensors, relay, accelerometer, and more.  There are even USB modules designed specifically for the Tessel, that let you add BLE, camera, and more.

![Tessel climate module.](https://s3.amazonaws.com/technicalmachine-assets/product+pics/2014+05+15+production+modules/climate.jpg)

Each of the Tessel-developed modules have been tested, and include a Node.js library for easy control of the hardware.  You run "npm" to get the packages, require them in your code, and use them just like any other Node.js program.  You can even hook your own sensor up to the modules ports, and control GPIO, talk SPI and I2C, and more.

> One of my first projects with the Tessel had me wiring up a standard 5mm LED to the pins on a modules port.  From there I controlled the GPIO from Node.js.

### Tessel Configuration

There is Node.js support for MQTT, so does that mean you can just load that module and connect to Watson IoT?  Exactly!  I covered getting started with Watson IoT in [another post](http://www.kevinhoyt.com/2016/04/27/particle-photon-on-watson-iot/).  In this post I will focus on the code and workflow of developing for the Tessel.

The Tessel CLI is the way you will configure and program the device (at least initially).  If you have Node.js installed on your development machine, you can use "npm" to get the CLI installed.

    npm install -g t2-cli
    

With the Tessel connected to your machine, and the CLI installed, you can setup wireless information on the device.

    t2 wifi -n <network-name> -p <password>
    

Working on the same LAN as your Tessel, and want to push code to it wirelessly?  Or maybe you need to free up a USB port on your development machine?

    t2 provision
    

It all really is that easy.  Do not forget to update the firmware on the Tessel before we get going with Watson IoT.

    t2 update
    

### First Project

Just like you might use "npm init" to initialize a workspace for a Node.js project, you can use the CLI to help you out there with the Tessel.

    t2 init
    

This creates a basic "index.js" file which will act as the entry point for your application, as well as a "package.json" file.  If you add Node.js modules to your project, do not forget to make sure they get into the "package.json".  Installing something like MQTT would then look like this:

    npm install --save mqtt
    

Wait!  That looks just like Node.js!  Yes.  Yes it does.  That is because to use Node.js modules, you use the normal Node.js development workflow.  Pretty cool, right?

### Start Counting

To make a counter in Node.js is easy enough - setInterval() takes care of that.  And that is exactly what we will use here.

    var count = 0;
    var interval = setInterval( function() {
      count = count + 1;
      console.log( 'Count: ' + count );
    }, 1000 );
    

Note the use of "console.log()" in this code.  When you run it on the Tessel, you will get output to the terminal - just like you would expect when using Node.js for a server application.

    t2 run index.js
    

One more command to get our code over to the Tessel and running.  This is a "tethered" mode good for development.  When you are ready to have the Tessel run by itself, you use the "push" command.

    t2 push index.js
    

### Watson IoT

Okay, remember earlier when I told you how to install an MQTT Node.js module?  Yeah, do that.  MQTT is the protocol that Watson IoT speaks best, and since there are already Node.js modules for MQTT, we can turn to them for connectivity.

    // MQTT for Watson IoT
    var mqtt = require( 'mqtt' );
    
    // Connect to Watson IoT
    var client = mqtt.connect(
      'mqtt://_ORG_.messaging.internetofthings.ibmcloud.com', {
      clientId: 'd:_ORG_:_TYPE_:_ID_',
      password: '_TOKEN_',
      username: 'use-token-auth'
    } );
    var count = 0;
    var interval;
    
    // Connected
    client.on( 'connect', function() {
      console.log( 'Connected.' );
    	
      // Start counting
      interval = setInterval( function() {
        count = count + 1;
    		
        // Publish value to Watson IoT
        client.publish( 
          'iot-2/evt/count/fmt/json', 
          JSON.stringify( {
            count: count
          } ) 
        );
    		
        console.log( 'Count: ' + count );
      }, 
        // Wait a second
        1000 
      );
    } );
    

Frankly, this would look exactly the same if you were running it on a Node.js server.  There is nothing distinctly Tessel here.  We use the MQTT library, connect to Watson IoT, start counting once we are connected, and publish the count value on each iteration.

> While there is no difference from what this would look like on a Node.js server, there is a healthy amount of Watson IoT specifics.  You will need your "organization" ID, the device type and device name you setup in the management console, and the token for that device.

### Next Steps

There is a wealth of extras to explore with the Tessel.  Blinking the on-board LEDs is a common "Hello World" for hardware.  To do that you would include the Tessel hardware library in your code.  You do not need to load it via "npm" into your "package.json" as it will already be waiting for you on the Tessel.

    var tessel = require( 'tessel' );
    

There are two things that bother me about the Tessel ...

The first is that it is a pretty chunky board.  Not compared to an Arduino Uno or Raspberry Pi, but certainly compared to an Electric Imp or Particle Photon.  Even the original Tessel, with the module ports hanging off both sides, fit perfectly in an Altoids tin.

![Original Tessel in Altoids tin.](http://images.kevinhoyt.com/tessel.altoids.jpg)

The other thing that bothers me is the price - at $45.00 USD, the Tessel is not the cheapest board on the market by a long shot.  Does it have enough feature differentiation being all JavaScript-y from a Raspberry Pi to be worth the extra cash?  I am not sure.  How would that price point work at scale?  There is a *big* difference between $12,000 USD for 10,000 units (Photon P1), and $450,000 USD (Tessel).

As far as development goes however, and the pile of hobbyist projects I have stacking up, the Tessel is a great fit with just about the easiest, most comfortable, workflow out there.
