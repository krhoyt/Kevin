---
title: Decoupling IoT Rendering
slug: decoupling-iot-rendering
date_published: 2015-09-09T00:33:38.000Z
date_updated: 2015-09-09T00:33:38.000Z
tags: iot, websocket
---

I recently received a comment from a visitor using one of my Arduino-to-WebSocket examples.  They had a requirement for a specific charting library.  The problem is that the library could not handle the data rates coming from the Arduino.  In this post I break down why that is, and give you a couple possible solutions.

### Arduino

Just so we are all on the same page, the Arduino code that this visitor was using looks something like the following snippet.

    const int PHOTOCELL = 0;
    
    void setup() 
    {
      Serial.begin( 9600 );
      pinMode( PHOTOCELL, INPUT );
    }
    
    void loop() 
    {
      int light = 0;
    
      light = analogRead( PHOTOCELL );  
      Serial.println( light );
      delay( 10 );
     }
    

The key thing to notice here is that the data is being sent at a rate of ever 10 milliseconds.

You might also notice that there is no WebSocket in this code.  While you can put a wireless shield on an Arduino, and connect it directly to a WebSocket server, in this case, the Arduino is standalone, and only providing serial output of the data.

### WebSocket

On the other side of the serial port is a Node.js-based WebSocket solution.  The person who sent me this question was using a WebSocket server, with a splash of HTTP for serving of web assets such as the page that would render the data.  You could also just use a WebSocket server from Node.js that connected to a WebSocket server elsewhere (perhaps even running on Node.js).

> When I am connected to devices from Node.js over the serial port, I use the excellent [Node.js Serial Port](https://github.com/voodootikigod/node-serialport) package.

In this case, the serial port code looks for the newline character injected by the Arduino Serial.println() function.  It then splits that off as a line, and sends the line across the serial port.  The WebSocket implementation gets that line, does some formatting into JSON, and then sends it as a message to all the connected clients.

The code for the WebSocket implementation is not particularly important for this discussion.  If you are interested, you can check it out in my [GitHub repository](https://github.com/krhoyt/Arduino/blob/master/photocell/photocell.js).  The code is a bit older, and I would do things slightly different today, but this is the basis of the code that this person was using.

### Charting

The requirement that this individual had was to use the [JustGage](http://justgage.com) library.  This library presents a simple gauge chart with title and value.  It is rendered using SVG, which is definitely my preference for clean charts across platforms.

![JustGage library screenshot.](http://images.kevinhoyt.com/justgage.jpg)

In looking at the source, the library uses Rafael for SVG rendering.  It also exposes a number of configuration properties.  One of those properties is the time used for animation.  Even with this set to zero, the library will stutter with a sub-second data rate.

    var gauge = new JustGage( {
      id: 'gauge',
      value: 67,
      min: 0,
      max: 100,
      title: 'Visitors'
    } );
    

### Rendering Problems

In this configuration, the Arduino does what it needs to without any problem.  Serial port access also has no problem getting the data at a sub-second rate.  The WebSocket in turn, also has nearly no lag in getting the data to the client.  The client WebSocket gets the data with minimal lag beyond that.

*Put another way, the data delivery is happening without any latency problems.*

The problem surfaces when the library goes to render the changes.  To be clear, this is not specific to this charting library.  I have seen numerous chart libraries crumble under the weight of real-time data rendering.  In fact, most are not even designed to handle refreshing the chart without a page refresh.

The chart is configured by default to animate updates over one second.  Since the data hits it ten times that rate, the animation goes nuts.  It does still render, but it does so with what I would call "stuttering artifacts".

The developer kindly made the refresh animation rate available as a configuration parameter.  I turned this down to zero to tell the library not to render the changes at all.  The result was better rendering, but still with noticeable stuttering.

Now what?!

### Rendering Solutions

I want to be clear here that this particular library is not at fault.  This is common, in my experience, across charting libraries.  When data arrives at a rate that is faster than rendering, this problem will surface.

I have used two different solutions over the years to get around this problem.

**Decouple Rendering**

The first approach to get around this problem is to decouple the arrival of data, with the rendering of the chart.  In the case of WebSocket then, you would get a message, and then put the data in a variable for later reference.  Then separate from the WebSocket messaging, you set up an interval (with either setInterval or requestAnaimationFrame).

With a setInterval approach, you might set the interval to be the same amount of time that an animated rendering is set to take.  The default for the aforementioned chart was one second.  So an interval rate of one second would give the chart time to update, and then immediately update it again.  The result is clean animation.

    // Global
    // Update in separate workflow
    var value = 0;
    
    // Set interval
    setInterval( function() {
      gauge.refresh( value, 100 );
    }, 1000 );
    

The problem with the approach of decoupling is that your data is no longer real-time.  It is certainly more real-time than making a background HTTP request (XHR), but the latency has dramatically increased to be sure.  If your requirements allow for a refresh rate of a second or more, than this is a great way to still get low-latency updates, that do not bring the rendering pipeline to its knees.

**Do Not Use a Library**

The other approach I have used is not to leverage a charting library at all.  Managing the vast number of options that come with being a library lends itself to rendering overhead.  In the case of JustGage, there is even a dependency on Rafael for further abstraction.

*The further away you get from the rendering pipeline, the slower rendering will be.*

In this case, the gauge could be rendered with just a handful of SVG elements.  Transforms could be applied to one or two of them at most.  In fact, a similar effect could be achieve in CSS alone if you had the option of leveraging the latest browser implementations.

While there is no doubt a lot more work in rolling your own, the result is often much faster rendering.  I have been able to achieve charting with my own SVG that is more than capable of handling sub-second updates - even at a rate of 10x such as in this case.

### Next Steps

Decoupling rendering is one solution to managing the rendering pipeline.  However, it is possible to decouple the data delivery pipeline as well.  You could remove the delay entirely from the Arduino side, and cache the values in a variable on the other side of the serial port.  Then the WebSocket, set on an interval of its own, could incrementally send out the data.

> Further, you may have an array of devices sending data.  If you have this requirement, then multiplexing the data is even one more step of optimization.

Where you do this, or if you decide to do both, is all about your requirements.  Most of the modern web is not designed with volumes of real-time data coming from an Internet of Things.  It still lives very much in a legacy world of request-response.  As the number of devices connected to the Internet continues to grow exponentially, I have no doubt that changes will come, but for now, hopefully these solutions will give your users the best possible experience.

*Circuit board photo courtesy [Wikipedia](https://en.wikipedia.org/wiki/Printed_circuit_board).*
