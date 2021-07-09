---
title: Custom Tessel Module
slug: custom-tessel-module
date_published: 2016-09-07T21:35:41.000Z
date_updated: 2016-09-07T21:35:41.000Z
tags: tessel, watson, iot
---

Not too long ago now, I presented at Windy City Things 2016 in Chicago. Among the IoT boards I showed there was the Tessel. I have written about the [Tessel](http://www.kevinhoyt.com/2014/11/19/tessel-to-parse-com/)[before](http://www.kevinhoyt.com/2016/09/01/tessel-on-watson-iot/), and how approachable it is for a JavaScript developer. Do not let the approachability fool you though, there are still plenty of ways to get your hands dirty with electrical engineering.

### Ports and Pins

The Tessel has two module ports - labeled A and B. These are generally intended to be used by the module add-ons that Tessel sells. Nothing says that you have to use those module port pins for modules. They are, after all, just pins - like pins you would find on the Arduino or Raspberry Pi.

In the case of [Windy City Things](http://windycitythings.com), I had a group of components I wanted to use in my demonstration. One was a button, to trigger an event and show digital input. Another was an LED, for an example of digital output. And the last was a photocell for an example of analog input.

I did not want to have to run all those wires and manage them while I was on stage presenting, so I decided to make a module of my own.

Each port has ten pins, which includes ground and power (3V3). The remainder of the pins can be used for digital, analog, I2C, etc. Together with a little perfboard and 90-degree header pins, I was able to mount all the components in a compact space. One that did not mean I would have to worry about loose wires.

![Custom Tessel Module](http://images.kevinhoyt.com/tessel.custom.module.jpg)

### LED Control

To control the LED, I connected the Tessel to Watson IoT (MQTT). This allowed me to subscribe for commands at the Tessel from any device or interface that supported MQTT. For this demonstration, that meant the Web. When a panel was clicked in the user interface, a command would be published. The Tessel would then in turn pick that up, read the command, and take action with the LED (setting digital high or low).

    // LED on pin 1
    // Treat as digital output
    // Turn off initially
    led = tessel.port.B.pin[1];
    led.output( 0 );
    
    // ...
    
    // Handle messages
    // LED command
    client.on( 'message', function( topic, message, packet ) {
      var data = null;
    
      // Object from JSON
      data = JSON.parse( message );
    
      // Set LED state
      led.output( parseInt( data.value ) );
    
      // Debug
      console.log( 'Message: ' + parseInt( data.value ) );
    } );
    

### Photocell Reporting

The photocell then is effectively the inverse. At the Tessel, I would sample the photocell analog value, and store that for reference. Then in at a separate interval, the Tessel would publish that value to Watson IoT.

    // Photocell on pin 3
    // Treat as analog input
    photocell = tessel.port.B.pin[3];
    
    bright = setInterval( function() {
      photocell.analogRead( function( err, value ) {
        light = value;
      } );
    }, 100 );
    

I like to keep the sensor interaction as isolated as possible in my designs. This means I do not have to worry about blocking, or race conditions, etc.

    // Send light value to clients
    // Decoupled from reading	
    interval = setInterval( function() {
      client.publish( 'iot-2/evt/light/fmt/json', JSON.stringify( {
        light: map( light, 0, 3.3, 0, 100 )
      } ) );
    
      console.log( 'Light: ' + light );
    }, 1000 );
    

### Button Trigger

I probably went overkill for my button implementation and accounted for debouncing. A "debounce" is a situation where a component causes multiple signals when it opens or closes - effectively reporting twice. To solve this you ignore any additional signals for a period of time (microseconds) after you get the first change in signal.

I do not know if it is really necessary for the Tessel, but I put it in there anyways.

    // Work with button on pin 5
    button = tessel.port.B.pin[5];
    pressed = false;
    
    // Monitor button pin
    bounce = setInterval( function() {
      // Asynchromouns button reading
      // Digital signal (on or off)
      button.read( function( err, value ) {
        // Up (off)
        if( value === 0 ) {
          pressed = false;
        // Down (on)
        } else if( value === 1 ) {
          // Only fire press once
          if( !pressed ) {
            pressed = true;
    			
            // Publish value to Watson IoT
            client.publish( 'iot-2/evt/button/fmt/json', JSON.stringify( {
              pressed: pressed
            } ) );					
    			
            console.log( 'Pressed.' );
          }
        }
      } );	
    }, 100 );
    

When the button is pressed, the Tessel publishes a message to Watson IoT. The web page picks this up and can reflect the button press by changing the user interface. In my case, I showed a white flash. With five different devices going at once, this proved to be pretty fun to watch.

### Next Steps

Creating a custom Tessel module is not that hard if you know your way around a breadboard. If you can wire up a circuit in a breadboard, then you can build your own custom Tessel module. And I have really only started getting into what else can be done. In a future post I will talk about using I2C.

By the way, if you want to watch the video of my presentation at Windy City Things, it is [online](https://windycitythings.com/videos/2016/#kevin-hoyt). It is a 35-minute walkthrough of five different IoT boards and some of the details about how each of them works. The code for all of it is on [GitHub](https://github.com/krhoyt/WindyCityThings2016).
