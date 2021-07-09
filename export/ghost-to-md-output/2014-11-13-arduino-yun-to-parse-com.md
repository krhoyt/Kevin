---
title: Arduino Yun to Parse.com
slug: arduino-yun-to-parse-com
date_published: 2014-11-13T16:11:00.000Z
date_updated: 2015-04-21T14:11:23.000Z
tags: arduino, yun, parse
---

*There are no shortage of cloud-based solutions, and this is a very good thing. What used to require substantial investment of skill, time and money, can effectively be outsourced for pennies on the gigabyte. As an application developer, this represents the opening of a door to a vast world of opportunity. Opportunity that is yours for the taking.*

*For some years now, I have been using [Parse.com](http://parse.com/) for application data storage. The good folks at Parse.com provide many other feature, but it is the beautiful console and thorough documentation of the data storage that got me hooked. Among many API options is a REST offering, which one can use from an Arduino Yun.*

---

I want to be clear here that when I say "application data storage" I am talking about the types of data we developers usually put into a relational database. In the case of Parse.com, this is more of a NoSQL approach. Without a clear label however, I will just call it data storage for the purposes of this post.

### A Word on Security

There is a specific reason this post uses an [Arduino Yun](http://arduino.cc/en/Main/ArduinoBoardYun), and that is security. Not security of the Yun, but the security requirements of using the Parse.com APIs - all traffic uses HTTPS. The cryptography requirements of HTTPS make it difficult to handle for most embedded systems. This would be the case even for any other Arduino.

The Yun however has a Linux System On a Chip (SoC) that has cURL available to it, including support for SSL. From our Arduino code, using the Yun's innovative bridge, we can invoke that cURL process to send data to the Parse.com REST API.

> The approach I am about to show you originally comes from an [article](http://hypernephelist.com/2014/08/19/https_on_arduino_yun.html) about posting data from Arduino Yun to Microsoft Azure. The blog has no social media or other contact information, so while I would love to give full attribution, I can only point you to that [article](http://hypernephelist.com/2014/08/19/https_on_arduino_yun.html) for more information.

### Parse.com

If you do not already have a Parse.com account, you should create one. Not just to use this tutorial, but to take in all the Parse.com awesomeness. Once you have an account created, you will be asked to create an application. Once you have an application, you can create a data table to hold the data coming from our Yun.

![The Core section for one of my applications, showing the Temperature table.](http://images.kevinhoyt.com/parse.temperature.png)

As you can see, I use Parse.com to power several facets of this site - namely the scrolling header on the landing page. That is another story, but for now, I have created a "table" called "Temperature" with two columns - fahrenheit and celcius. Each of those columns expect numerical data. Note that Parse.com tables have some default columns, but we do not need to worry ourselves with them at this stage in the game. Just leave them alone.

Your Parse.com application will have several security keys associated with it for you to use from the Parse.com APIs. You can find these by putting your mouse over your avatar in the upper right hand corner of the screen, selecting your application, clicking on the "Settings" tab at the top, and then the "Keys" option along the left side of the screen.

### Arduino Yun

In the setup function of our Arduino code, we will setup communication with the Linux side of the Yun by called "Bridge.begin()". In the loop function, we will get the temperature reading, send the value to Parse.com, and then wait before doing it again. Parse.com charges based on frequency of usage, and I have had the Arduino post fast enough to eat up my (reasonably high) free-tier allotment in just minutes. Do not forget the delay.

*Note that I am using a thermistor for sensor data in this example, since I covered it in last week's [Circuit Friday](http://kevinhoyt.com/blog/2014/11/07/circuit-friday-thermistor.html). You can read all about the thermistor, how to wire it, and more in that [post](http://kevinhoyt.com/blog/2014/11/07/circuit-friday-thermistor.html).*

    // Libraries
    #include <math.h>
    #include <Process.h>
    
    // Constants
    const char *PARSE_API = "api.parse.com";
    const char *PARSE_APP = "_YOUR_APP_KEY_";
    const char *PARSE_CLASS = "Temperature";
    const char *PARSE_KEY = "_YOUR_REST_KEY_";
    const char *PARSE_VERSION = "1";
    const int  THERMISTOR = 0;
    const int  UPDATE_RATE = 5000;
    
    // Leverage Yun Linux (curl)
    Process process;
    
    // Buffer for parameters
    char buffer[80];
    
    // Setup
    void setup() 
    {
      // Bridge communication
      Bridge.begin();
    }
    
    // Loop
    void loop() 
    {
      double temperature;
      int    analog;    
    
      // Get temperature
      analog = analogRead( THERMISTOR );
      temperature = thermister( analog );  
      
      // Put value in data store
      request( temperature );
      wait();
      response();    
    
      delay( UPDATE_RATE );
    }
    
    // Send the data to Parse.com
    void request( double value )
    {
      // Buffers for string conversion
      // The sprintf function does not like doubles
      char celcius[10];
      char farenheit[10];
      
      // Farenheit as character string
      dtostrf( value, 3, 2, farenheit );
      
      // Convert to celcius as character string
      dtostrf( ( value - 32 ) / 1.80, 3, 2, celcius );
      
      // Build curl command line
      // Includes HTTPS support
      // POST
      // JSON
      process.begin( "curl" );
      process.addParameter( "-k" );
      process.addParameter( "-X" );
      process.addParameter( "POST" );
      process.addParameter( "-H" );
      process.addParameter( 
        "Content-Type:application/json" 
      );
     
      // Parse.com application
      process.addParameter( "-H" );
      sprintf( 
        buffer, 
        "X-Parse-Application-Id: %s", 
        PARSE_APP 
      );
      process.addParameter( buffer );
      
      // Parse.com key
      process.addParameter( "-H" );
      sprintf( 
        buffer, 
        "X-Parse-REST-API-Key: %s", 
        PARSE_KEY 
      );
      process.addParameter( buffer );  
     
      // JSON body
      process.addParameter( "-d" );
      sprintf( 
        buffer, 
        "{\"farenheit\": %s, \"celcius\": %s}", 
        farenheit, 
        celcius 
      );
      process.addParameter( buffer );
     
      // URI
      sprintf( 
        buffer, 
        "https://%s/%s/classes/%s", 
        PARSE_API, 
        PARSE_VERSION, 
        PARSE_CLASS 
      );
      process.addParameter( buffer );  
    
      // Run the command 
      // Synchronous
      process.run();
    }
    
    // Response from Parse.com
    void response()
    {
      bool print = true;
      char c;
      
      // While there is data to read
      while( process.available() ) 
      {
        // Get character
        c = process.read();
      }
    }
    
    // Calculate temperature
    double thermister( int analog ) 
    {
      double temp = 0;
     
      temp = log( ( ( 10240000 / analog ) - 10000 ) );
      temp = 1 / ( 0.001129148 + ( 0.000234125 + ( 0.0000000876741 * temp * temp ) ) * temp );
      temp = temp - 273.15;
      temp = ( temp * 9.0 ) / 5 + 32.0;
     
      return temp;
    }
    
    // Wait for a response from Parse.com
    void wait()
    {
      // Periodically check curl process
      while( !process.available() ) 
      {
        delay( 100 );
      }
    }
    

From the loop, there are three functions called to send data to Parse.com. The first is request, which formulates the cURL request and sends it off. The second is to wait for the cURL response to return before moving on to other processing. And finally, the third function handles the response data.

The most interesting of these three is the request function. The Parse.com documentation will give you the code necessary to use their APIs. In this case the cURL code to store a value in the Parse.com system look like the following command.

    curl -X POST \
      -H "X-Parse-Application-Id: APPLICATION_ID" \
      -H "X-Parse-REST-API-Key: REST_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{"reading":123}' \
      https://api.parse.com/1/classes/Temperature 
    

Using the Arduino Yun "Process" library, we effectively build out this exact cURL command on the Linux SoC. We use "dtostrf" to convert float values to their character representation. We do this because we leverage "sprintf" to format the cURL parameters, and "sprintf" does not work with float values. Once we feel we have the cURL command built correctly, we call "process.run()" to kick off cURL.

In this case, I do not want to do anything else until I know that the data has been stored in the Parse.com system - or at the very least that the request has completed. That is the nature of the "wait" function, which periodically checks the process for return data.

Once return data has arrived, it is our job to parse it (no pun intended) into something useful. The Parse.com response will be a JSON string. No doubt that this presents its own challenges for an Arduino. The response is short however, and you can parse the JSON should you need some of the response data for a subsequent call (foreign key). In this example, we just accept that data and keep moving.

### Next Steps

That is it! The Arduino Yun will now merrily POST sensor data over the Parse.com REST API until it is told otherwise.

Despite the ease of issuing a single rest like this, there are some technical challenges to consider for more robust application. One consideration might be for what happens if the network is down. Do you cache failed requests on the Arduino? How long can you do that before running out of space? What if the a client wants the data for the same time the network is down? Perhaps you interpolate (fill in the blanks) the data at some later point (on the client)?

It is these use-cases beyond the basics that should tap you on the shoulder like a child begging for your attention. These are all solvable problems. Do not let them discourage you. And remember that rapid iteration is an acceptable solution. You do not have to solve all these problems in your first project.
