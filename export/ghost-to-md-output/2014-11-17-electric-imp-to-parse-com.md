---
title: Electric Imp to Parse.com
slug: electric-imp-to-parse-com
date_published: 2014-11-17T15:00:00.000Z
date_updated: 2015-04-21T13:57:41.000Z
tags: parse, electric, imp
---

*There are boards a plenty these days for connecting your custom hardware to the Internet. When it comes to development however, like many things, some are better tools for certain jobs than others. Every day this week I will post some details around boards that I have used, along with code on how to accomplish the same task for each. Today's IoT-enabler will be the [Electric Imp](http://electricimp.com/).*

---

Building off a recent [Circuit Friday](http://kevinhoyt.com/blog/2014/11/07/circuit-friday-thermistor.html) project, I will be using a thermistor as my example. I like the thermistor for testing because we get a general sense of data input, enough logic to see how the program looks, and it is a cheap and easy first project. By calculating both celcius and farenheit temperatures, we can also send more than one value to our data storage.

### Parse.com

All this week, I will be using [Parse.com](https://parse.com/) as my data storage solution. Why Parse? Perhaps my favorite feature for Parse is a relatively easy to use REST API. They have wrappers for all your assorted needs too. Then, the dashboard for viewing our data is polished and capable, including filtering, access control lists, etc. And finally is the plethora of additional services that Parse offers for growing your business.

### Electric Imp

For a long time, the Electric Imp was my favorite IoT-enabler. I have even taught a few workshops on how to use it. The Imp is an ARM Cortex M3 processor, running at 3.3V, and it includes wireless connectivity (802.11 b/g/n) using the same chip you will find in an iPhone. The [breakout board from SparkFun](https://www.sparkfun.com/products/12886) will give you hookups for battery and USB power, and six (6) GPIO pins.

> The GPIO pins can be used in a variety of ways, from simple analog/digital IO to SPI and I2C.

As if the chipset was not robust enough, it is the infrastructure that really shines. The Electric Imp cloud-based IDE lets you develop for your board, and see messages from it in real time. When it comes time to move to production, you can easily update all your deployed units. You can do it all at once, or even a phased roll out. Being able to solve these complex types of problems is one of the big hurdles in going from prototype to production, and the Imp lets you take off a rocket speed.

Another problem that you will have to solve when deploying a production device is how to set the wireless SSID and password for your user's network. The Imp uses an innovative "BlinkUp" process to accomplish this task. There are two parts to this system. First there is a phototransistor on the Imp. Second is an application for your phone that produces precisely time flashes of light. This effectively establishes a means of communication to the Imp, allowing you to set the SSID of your network.

### A Few Caveats

For all the power and versatility that the Imp brings to the table, you will have make some trade-offs.

The first trade-off is that the programming language is [Squirrel](http://www.squirrel-lang.org/), which is not exactly a mainstream choice. This means there will be some learning curve in addition to the Imp API. Luckily the language is very similar to JavaScript, which makes it easy to pick up, and the Imp team does a great job on documentation as well.

Another trade-off might be in having to use the Imp cloud. All your lovely Internet traffic from your devices, will go through the Imp cloud before it ever gets to your servers. This can be a touch subject for some - and an outright show stopper for others. The flip side of the coin however is that awesome roll-out and production unit management feature.

Then there is the BlinkUp. At the hands-on workshops where I have taught getting started with IoT using the Imp, this was easily the biggest hurdle. If you are using iOS, and can have very tightly controlled screen refreshes, then BlinkUp will be a snap. Android however, was far less likely to complete successfully. As for the Window Phone gang - they were just flat out of luck.

> We did eventually find a skunkworks, native desktop Windows application that worked for most devices.

### Circuit Diagram

There is not much difference here than from the Circuit Friday exercise using an Arduino. Since the Imp can assign different behaviors to different pins, I chose a Imp pin pretty much arbitrarily, and then set it in software. Also note that the Imp is running at 3.3V where the Arduino Uno is going to run at 3.3V or 5V depending on which pin you chose.

![I like using the breadboard gap, but this can be far more compact.](http://images.kevinhoyt.com/imp.fritzing.thermistor.png)

### Device Code

When it comes to programming the Imp, there are two sides of the house you need to develop. The first is the code that runs on the Imp itself. I will start off by declaring constants for some of the temperature calculation math that needs to happen along the way.

    // Constants
    const ANALOG_STEPS = 65534.0;
    const B_THERM = 3977.0;
    const T_THERM = 298.15;
    const RESISTOR = 10000.0;
    const THERMISTOR_OHM = 10000.0;
    

Up next I define a constant for what I call events. Events are how the Imp device code communicates with the Imp server code (called agents). You do not need to make constants, but I am picky like that.

    // Events
    const EVENT_TEMPERATURE = "temperature";
    

Up next comes the pin assignment - in this case, pin 8 on the breakout will be used for analog input. While I could refer to "hardware.pin8" every time I wanted to access the pin, I have a created a little shortcut and assigned that value to another value called "thermistor". This lets me change pins without having to crawl my code. I also think it makes things a little easier to read.

    // Configure hardware pin
    thermistor <- hardware.pin8;
    thermistor.configure( ANALOG_IN );
    

Temperature calculation is up next, and this is pretty much the exact same calculation as used on the Arduino with a couple significant tweaks. First is that since we are using 3.3V, some of the math will change. Also, the Imp gives us 16-bit readings on the analog input, so we have far more steps. And finally, the Imp will actually tell us the real voltage being used, which will make the math more accurate.

    // Calculate celcius temperature
    function temperature( analog ) 
    {
        local kelvin = 0.0;
        local l_therm = 0.0;
        local r_therm = 0.0;    
        local v_in = 0.0;
        local v_out = 0.0;
    
        // Imp voltage
        v_in = hardware.voltage();
    
        // Thermistor calculations
        v_out = v_in * analog / ANALOG_STEPS;
        r_therm = ( RESISTOR * v_in / v_out ) - RESISTOR;
      
        l_therm = math.log( THERMISTOR_OHM / r_therm );
        kelvin = ( T_THERM * B_THERM ) / ( B_THERM - T_THERM * l_therm );    
    
        // Celcius value
        return kelvin - 273.15;
    }
    

The Imp does not have an infinite loop like the Arduino - and this is a good thing. In the long run, Imp gives you very fine-grained control over power consumption. I have had an Imp wake up every five minutes, same temperature, log it on the Internet, and then go back to sleep, and last for more than six months on a single 2,500 mAh battery.

If you do not tell the Imp to loop, it will not - it will execute the code from top to bottom, and then terminate. Since I want to report the temperature every few seconds in this example, the "poll" function will act as the entry point. When put together with the imp.wakeup() function, a loop gets created, but one that only really executes at the pace we want. No faster, no slower, saving us power.

    // Called to poll temperature
    // Sends results to agent for storage
    function poll() 
    {
        local analog = 0;
        local celcius = 0.0;
        local farenheit = 0.0;
    
        // Analog reading
        analog = thermistor.read();
    
        // Voltage to temperature values
        celcius = temperature( analog );
        farenheit = celcius * 9.0 / 5.0 + 32.0;
    
    	// Log to server
    	// Send to agent for data storage
    	server.log( farenheit );
    	agent.send( "temperature", {
            "celcius": celcius,
            "farenheit": farenheit
    	} );
    	
        // Do it again
    	imp.wakeup( 5.0, poll );
    }
    

The poll() function will not get called automatically, so the very last line is to call poll() directly. Once inside the function, the imp.wakeup() call will tell the Imp to come back to the poll() function at some interval in the future (centi-second resolution). You can think of this as a setTimeout() call in JavaScript.

    poll();
    

### Agent Code

Throughout the device code you will see calls to the "agent" object. The agent represents work that happens on the Electric Imp servers in the cloud. They can do all fashion of robust actions that would otherwise drain your Imp. For example, agents can store persistent, per device, preferences. Agents are where the communication to the Internet actually takes place.

To get from the device to the agent, the device will send the agent an event with some data attached to it. Names for events can be arbitrary, and the value passed along can be as simple as an integer, or as complex as nested data structures. The event my agent will expect from the device for temperature reporting is defined in a constant.

    // Events
    // Parse.com constants removed for blog post
    const EVENT_TEMPERATURE = "temperature";
    

Listening for events at the agent takes the form of “device.on()” calls. As you can tell from the device code, the device invokes an event on the agent using the “agent.send()” call. The inverse for both exists as well. The agent can send an event to the device, and the device can listen to events from the server.

    // Listener for thermistor sensor events
    device.on( EVENT_TEMPERATURE, function( tableData ) {
        ...
    }
    

The Imp API gives you HTTP objects to work with for talking to the Internet. To store an object using the Parse.com REST API, we send an HTTP POST. The POST needs some headers, and some body content encoded as JSON. This is easily accomplished using the Imp API.

    // POST data to server
    // Using Parse.com
    local parse = http.post( 
        PARSE_COM,
        {
            "X-Parse-Application-Id": PARSE_APP,
            "X-Parse-REST-API-Key": PARSE_KEY,
            "Content-Type": "application/json"
        },
        http.jsonencode( tableData ) 
    ).sendasync(
        // Log server response
        function( response ) {
            server.log( response.body );
        } 
    );   
    

The HTTP POST is made asynchronously, and when the response comes in, another function is invoked. The Parse.com REST API returns JSON in most cases, and this is no different. The Imp API would allow us to parse that JSON, and take additional action based on the result. In this case, I am just logging the response to the Imp IDE so we can see that something actually happened.

I want to reiterate the dual nature of the Imp cloud. The agent here can make asynchronous calls, and then more calls based on the response. When dealing with JSON, this would be downright prohibitive to do on many embedded systems. Not to mention the battery drain of processing all those strings. Depending on the size of the response, you would likely also run out of memory. By offloading these functions to the Imp cloud, you dramatically simplify your approach. And we haven't even talked out handing offline scenarios, which you would also have to effectively write yourself without the Imp cloud.

### Next Steps

If you are just getting started with IoT, the Imp is a great place to start, but it may be overkill. It is really designed for those heading to full-scale production. The Imp solves many of the very complex problems you have to solve to bring a device to market. As for production, my only nit-pick would be the reliability of the BlinkUp technology.

I have really only started to touch upon the abilities of the Imp in this post. I wanted to give you an overview of the system, and some sample code to get going, but there is a lot more you can do with an Imp. You can explore low power modes, setup long-term persistent storage, handle offline operation, send commands from outside the Imp cloud to the Imp agent, and so much more.
