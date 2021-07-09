---
title: Tessel to Parse.com
slug: tessel-to-parse-com
date_published: 2014-11-19T15:00:00.000Z
date_updated: 2015-04-21T13:33:50.000Z
tags: parse, tessel
---

The [Electric Imp](http://kevinhoyt.com/blog/2014/11/17/electric-imp-to-parse-dot-com.html) has Squirrel. The [Spark Core](http://kevinhoyt.com/blog/2014/11/18/spark-core-to-parse-dot-com.html) has Wiring/C/C++. Today I give you the [Tessel](https://tessel.io/), which has JavaScript. At $75 the Tessel is not exactly your cost-effective choice for prototype to production. If however you are a Web Developer looking to get started down the road of the Internet of Things, then the Tessel could not have provided an easier on-ramp.

---

The Tessel is an interesting board. For wireless, it has the same Texas Instruments chipset that the Spark Core has in it - the CC3000. This means it has the same 802.11 b/g limitations. Technical Machines, the maker of the Tessel, have not implemented an application for setting the SSID either - it has to be done via the command line.

I could go on about how there is no cloud IDE, or remote firmware update support. I could talk about how big it is compared to a Spark Core, with headers coming off at right angles (though it is still roughly the same size as an Arduino). Of course there is the cost issue. But in the end … it is programmed in JavaScript!

Seriously though, comparing the Tessel to the Electric Imp and Spark Core boards would not be an apples to apples comparison. These guys are for different markets. As an IoT enabler goes however, if you are a Web Developer that has ever had so much as a passing interest in IoT, then this guy will get you hooked in no time flat.

### Tooling and Workflow

The first piece of kit you will need to work with Tessel is Node.js. After that, a little NPM action will get you the Tessel tooling. With that tooling you have all sorts of fun control over the hardware, for example updating the firmware. And I have put two firmware updates on it in the last week alone, so the staff over at Technical Machines is hard at work.

Like any other hardware kit, the first project you are likely to do with the Tessel is blink and LED. Their tutorial will take you through blinking the on-board LEDs, but there is a bank of GPIO headers along one side of the board. These give you analog, digital, SPI, I2C, and UART capabilities. In short, you can control most every sensor you might otherwise control with an Arduino.

In addition to the GPIO pins, there are also four dedicated "ports" for Tessel Modules. Modules are pieces of kit designed specifically for the Tessel, and they support a wide variety of functionality including GPS, audio, camera, GPRS, relays, servos and on and on. Modules have their own Tessel libraries already wrapped up and ready to go, so you can easily and quickly add functionality.

> Put simply, this thing is a blast to use!

With your JavaScript code written, another trip to the command line will upload the script and required libraries to the Tessel. If your script uses access to the Internet, you will want to tell the Tessel your network SSID and password - again through the command line. You can alternatively use a JavaScript library to control the network connection.

When your program is running on the Tessel, it is just like any other running Node.js program. The various output streams will send information to the command line window. If something breaks, you will see the error logged in the window as well. While there is no need for a clunky serial monitor, normal syntax errors that Node.js would catch right off the bat, go unnoticed until trying to run.

### Climate Module

Throughout this tour of IoT enablers, we have been using a thermistor as our sensor data point. The Tessel however has a climate module that will report the temperature and humidity without any tricky extra math. You can place the modules into one of the dedicated ports, code to the module library, and be up and running in no time flat.

    // Libraries
    var climate = require( 'climate-si7020' );
    var tessel = require( 'tessel' );
    
    // Use port
    var port = climate.use( tessel.port['A'] );
    
    // Port is ready
    port.on( 'ready', function () {
        console.log( 'Connected to si7020.' );
    
        // Queue execution of port access
        setImmediate( function loop() {
            // Read Fahrenheit temperature
            port.readTemperature( 'f', function( err, temperature ) {
                // Read relative humidity
                port.readHumidity( function( err, humidity ) {
                    console.log(
                        'Degrees: ', temperature.toFixed( 4 ) + 'F ',    
                        'Humidity: ', humidity.toFixed( 4 ) + '%RH'
                    );                
                
                    // Wait and do it again
                    setTimeout( loop, 1000 );                
                } );
            } );
        } );
    } );
    
    // Error accessing port
    port.on( 'error', function( err ) {
        console.log( 'error connecting module', err );
    } ); 
    

This was so easy, especially with the provided documentation, that it almost felt like I was cheating. No C/C++ libraries? No character buffers to maintain? No pointers? Surely I am cheating! It dawned on me however that this really represents an opportunity. Everything about the modules is documented, so you could build your own modules as well.

Printed Circuit Board (PCB) design is pretty tricky, especially if you are dealing with a complex set of chips. Designing for one chip as a module however seems totally approachable. So not only has the Tessel set you up to learn IoT development, it also really sets you up to take the next step to the PCB. Once you have IoT and PCB under your belt, you are well on your way to bringing your own product to market.

### Climate Module with Parse Library

Since Tessel is all about JavaScript, there is a good chance that most of your favorite libraries will work right out of the box. Parse.com makes a JavaScript library for accessing its services, so another trip to NPM and I was ready to store my data in the cloud … Well, almost.

As it turns out, while you are writing JavaScript, it is actually Lua that is working behind the scenes. This means there is some translation that happens. It also means that not all translation will work exactly right. Such is the case for the Parse.com library. A trip to the Tessel forums revealed a change to the Parse.com JavaScript files to get everything running smoothly.

To their credit, the Technical Machines staff are all over making sure this translation process is perfected.

    // Libraries
    var climate = require( 'climate-si7020' );
    var parse = require( 'parse' ).Parse;
    var tessel = require( 'tessel' );
    var wifi = require( 'wifi-cc3000' );
    
    // Constants
    var PARSE_APP = '_YOUR_APP_KEY_';
    var PARSE_KEY = '_YOUR_JAVASCRIPT_KEY_';
    
    // Parse objects
    var Temperature = parse.Object.extend( 'Temperature' );                    
    
    // Use port
    var port = climate.use( tessel.port['A'] );
    
    // Initialize Parse library
    // Note Tessel bug requiring change to Parse module
    // https://github.com/tessel/runtime/issues/429
    parse.initialize( PARSE_APP, PARSE_KEY );    
    
    // Port is ready
    port.on( 'ready', function () {
        console.log( 'Connected to si7020.' );
    
        // Queue execution of port access
        setImmediate( function loop() {
            // Read Fahrenheit temperature
            port.readTemperature( 'f', function( err, temperature ) {
                var storage = null;
    
                // Store in cloud if wireless
                if( wifi.isConnected() ) 
                {    
                    // New Parse object
                    // Values
                    // Save
                    storage = new Temperature();
                    storage.set( 'fahrenheit', temperature );
                    storage.set( 'celcius', ( temperature - 32 ) / 1.8 );
                    storage.save( null, {
                        success: function( result ) {
                            console.log( 'Saved: ' + result.id );
                        },
                        error: function( result, error ) {
                            console.log( error.message );
                        }
                    } );
                }
    
                // Log to console
                console.log( 'Temperature: ' + temperature.toFixed( 4 ) + 'F' );
            
                // Wait and do it again
                setTimeout( loop, 1000 );
            } );
        } );
    } );
    
    // Error accessing port
    port.on( 'error', function( err ) {
        console.log( 'error connecting module', err );
    } ); 
    

This program starts off by turning on one of the Tessel's four ports. An event is fired when the port is ready, and then we set up a loop to same the climate data. If the Tessel is connected to wireless, then we go ahead and use the Parse.com JavaScript library to store the temperature reading in the cloud. The program waits for a second, and then does it again.

### Climate Module with Parse REST API

Again, this is so easy, it almost feels like cheating. My other examples to this point have used the Parse.com REST API, and in some cases, we have had to do some proxy gymnastics to make things work. Maybe moving to the REST API would make this problem more complex.

    // Store in cloud if wireless
    if( wifi.isConnected() ) 
    {    
        options = {
            headers: {
                'Content-Type': 'application/json',
                'X-Parse-Application-Id': PARSE_APP,
                'X-Parse-REST-API-Key': PARSE_KEY  
            },
            hostname: 'api.parse.com',
            method: 'POST',                    
            path: '/1/classes/Temperature',                    
            port: 443
        };
                
        // Make request
        request = https.request( options, function( response ) {                
            // Got a response
            response.on( 'data', function( data ) {
                console.log( data.toString().trim() );
            } );
        } );
        request.write( JSON.stringify( {
            fahrenheit: temperature,
            celcius: ( temperature - 32 ) / 1.8
        } ) );
        request.end();
                
        // Handle HTTPS error
        request.on( 'error', function( err ) {
            console.error( err );
        } );
    }
    

Everything around accessing the port and reading the temperature is exactly the same. What is listed above is the only part that changes, which is the script inside the wireless connectivity check.

To get the Tessel to communicate with the Parse.com REST API, we setup an options object, and then use the HTTPS library to make a request. The Parse.com REST API expect JSON content, so we format our request data accordingly and send it along. When the response comes back from the API, we can access the data and do with it as we please.

The difference here however is that Node.js, being JavaScript, provides great JSON handling. We can parse and serialize JSON data all day long on the Tessel without any crazy string manipulation. In fact, I found the REST API to be more responsive than the formal Parse.com JavaScript library. It just does not get any easier than this.

### Thermistor with Parse Library

Maybe I am getting away with something here because I am not using a thermistor. Grabbing ye olde thermistor and assorted components, I wired from pin 3 on the Tessel (3.3V) to the thermistor. From the thermistor I went across a 10k resistor. From the resistor I went to pin 1 on the Tessel (Ground), and also pin 6 (10-bit DAC).

Using the same calculations as the other examples, I was able to same temperature using the thermistor as well.

    // GPIO access
    var gpio = tessel.port['GPIO'];
    
    // Thermistor
    var thermistor = gpio.pin['A5'];
    
    ...
    
    // Analog reading
    // Resulting range is zero to one
    analog = thermistor.read();
    
    // Voltage to temperature values
    // Multiply by 10-bit steps
    celcius = temperature( analog * ANALOG_STEPS );
    fahrenheit = celcius * 1.80 + 32.0;
    
    ...
    
    // Calculate celcius temperature
    function temperature( analog ) 
    {
        var kelvin = 0.0;
        var l_therm = 0.0;
        var r_therm = 0.0;    
        var v_out = 0.0;
    
        // Thermistor calculations
        v_out = VOLTAGE * analog / ANALOG_STEPS;
        r_therm = ( RESISTOR * VOLTAGE / v_out ) - RESISTOR;
      
        l_therm = Math.log( THERMISTOR_OHM / r_therm );
        kelvin = ( T_THERM * B_THERM ) / ( B_THERM - T_THERM * l_therm );    
    
        // Celcius value
        return kelvin - 273.15;
    }
    

The code here is almost identical to the Parse.com example using the climate module. The difference is that I first get a reference to the GPIO pins. From there I get a reference to the "A5" pin (pin 6). In my loop, I use that reference to read the analog value. The reading that comes back is between zero and one, so I multiply that value times the 10-bit resolution (1023 steps).

Everything else is the same as using the Parse.com JavaScript library with the Climate Module.

### Thermistor with Parse REST API

At this point I had no other choice but to finish this game of comparisons by using a thermistor, and communicating with the Parse.com REST API. This is about as apples to apples as a comparison as we can get to the Spark Core and Electric Imp examples. And as you might have guessed at this point, the Tessel performed brilliantly.

If you want to view the complete code for this example (or any of the examples from this post), you can find them in my [GitHub](https://gist.github.com/krhoyt/3ce601ecb520229d87bf) repository. So far as posting thermistor readings to Parse.com via the REST API, it is effectively a combination of two previous example. Pull the REST API access from the Climate Module example, and the thermistor code from the previous example using the Parse.com JavaScript library.

When you put it all together, including my comments, GPIO access, HTTPS POST, and the temperature calculation, it comes in at just over 100 lines of JavaScript. Pretty lean.

### Next Steps

If you get a sense that I was able to crank out these four examples relatively easily, you would be absolutely right. I actually broke down several other atomic examples along the way. I found that I could just keep going all day long because the JavaScript was so familiar, and the Tessel just so eager to perform. Put simply, this thing is a blast to use!

From here I think I would really like to design my own module, though I am not sure around what exactly. Perhaps an RGB LED matrix using WS2812 modules. I have taken classes on PCB design using Eagle, but have never quite found the right project to commit to printing. The Tessel has been so much fun, but our march of IoT enablers continues tomorrow.
