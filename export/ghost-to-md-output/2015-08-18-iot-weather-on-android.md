---
title: IoT Weather on Cloudant
slug: iot-weather-on-android
date_published: 2015-08-18T15:30:05.000Z
date_updated: 2015-08-18T15:30:05.000Z
tags: iot, photon, ibm, bluemix, weather
---

Getting weather data from a [service](http://blog.kevinhoyt.com/2015/07/29/weather-in-three-flavors/) is all fine and dandy, but in this day and age of IoT (Internet of Things), it almost seems more likely that you will be getting data from sensor in and around your home.  In this post I will take you through connecting a Particle Photon to IBM Bluemix, including storing data in IBM Cloudant.

### Particle Photon

I got hooked on IoT circa 2007 when I built an RFID-controlled beer keg using [Phidgets](http://www.phidgets.com).  Phidgets are a great place to start with IoT if you have a project in mind, but know nothing about electronics.  The downside is that they are expensive.  They are also designed to be controlled by your computer, which is cool, but not so much IoT.

From there I moved into the now obligatory world of [Arduino](http://arduino.cc).  If you feel like you can tackle at least some electronics, or have the thirst to learn, the Arduino, and associated community, will take you very far.  Getting wireless Internet access on an Ardiuno however comes with its own hurdles - not the least of which is size and battery consumption.

These days, when I start an IoT project, my go-to board is the [Particle Photon](http://particle.io).  These little gems are tiny, include wireless on-board, and are Arduino compatible.  You can also program them wireless using the Particle Build tool - a web-based IDE.  You also can not beat the price.  The Photon will run you $19 USD.  Everything is open source, and there is a very active, and growing, community.

### Server

Before we get into programming our Photon, let us take a look at the server infrastructure.  Like most things IBM Bluemix, this will start with a splash of Node.js.  I will be using Express, and creating a route for an HTTP POST to create a new reading from the Photon sensor.

    // Create a new reading
    router.post( '/reading', function( req, res ) {
      req.data.insert( req.body, function( error, body ) {
        if( error ) {
          req.logger.info( 'Problem creating document.' );
          req.logger.info( 'Message: ' + error.message );												
        }
    		
        res.json( body );					
      } );	
    } );
    

### Cloudant

In the above code snippet, there are a few extra objects on the Express "req" (request) object.  The "logger" object is a logger that integrates with IBM Bluemix logging.  You can use [Winston](https://github.com/winstonjs/winston) or other logging tools for the output as well.

The other object is named "data".  The "data" object is a reference to a [Cloudant](https://cloudant.com)NoSQL database.  This uses the Node.js Cloudant [package](https://github.com/cloudant/nodejs-cloudant).  There are other libraries for other platforms as well.  Both the logging and data access are configured in the "app.js" setup for the application.

    // Bluemix
    ibmbluemix.initialize( configuration.bluemix );
    
    // Environment
    var ibmconfig = ibmbluemix.getConfig();
    
    // Logging
    var ibmlogger = ibmbluemix.getLogger();
    
    // Database
    var ibmdb = null;
    
    // Connect
    Cloudant( {
      account: configuration.cloudant.username,
      password: configuration.cloudant.password
    }, function( error, cloudant ) {
      if( error ) {
        ibmlogger.info( 'Could not connect to Cloudant.' );
        ibmlogger.info( 'Message: ' + error.message );
      }	
    
      // Use database
      ibmlogger.info( 'Using database.' );
      ibmdb = cloudant.db.use( CLOUDANT_DATABASE );
    }
    
    // Add functionality to request
    app.use( function( req, res, next ) {
      req.data = ibmdb;
      req.logger = ibmlogger;
      next();
    } );
    

The "insert" method call places a JSON document into the Cloudant database, and returns whatever document results from the insert operation.  This is usually a document containing the ID of the document, and the revision (rev) number.  I do not use revisions here, but they are a helpful feature of the online/offline[replication](https://docs.cloudant.com/replication.html) (sync) of Cloudant.

### Microcontroller

Back on the Particle Photon, we need to add some logic to send a JSON document with the data over to our Node.js infrastructure.  Getting started with the Photon is beyond the scope of this post.  The [documentation](https://docs.particle.io/guide/getting-started/start/photon/) for the Photon is extremely robust, and a post to the [forum](http://community.particle.io) is generally answered within 24-hours.

![HIH-6130 Temperature and Humidity](http://images.kevinhoyt.com/sparkfun-hih-6130.jpg)

*Photo courtesy of SparkFun.**

We will be using an [HIH-6130](https://www.sparkfun.com/products/11295)temperature and humidity sensor for this project.  Although the HIH-6130 is a bit on the pricey side, if find the reliability to be unparalleled.  There is a Particle library for working with the HIH-6130 (like most other sensors), so getting started is just a matter of dropping the library into your Build project.

    // HIH library
    #include "HIH61XX/HIH61XX.h"
    
    // Sensor
    HIH61XX   hih( 0x27, D3 );
    
    // Setup
    void setup()
    {
      long reset;
    
      // Wait for clock to update
      do {
        reset = Time.now();
        delay( 10 );
      } while ( reset < 1000000 && millis() < 20000 );
    
      // I2C
      Wire.begin();
    }
    

The Particle can use the local wireless to determine the current time, which will be valuable as a timestamp in Cloudant that we can index, and sort.

While the Particle would be capable of dumping data into Cloudant quite rapidly (~1 update/second), I will be using an interval of once per minute.

    // Loop
    void loop()
    {
      // Device identification
      device = System.deviceID();
    
      // Start HIH
      hih.start();
      
      // Update HIH
      hih.update();
    
      // Sensor values
      celcius = hih.temperature();
      fahrenheit = ( celcius * 1.8 ) + 32;
      humidity = hih.humidity() * 100;
    
      // Connect to server
      // Send sensor data
      if( client.connect( BLUEMIX_URL, BLUEMIX_PORT ) )
      {
         request();
         wait();
         response();
      }
    
      // Delay
      delay( UPDATE_RATE );
    }
    

The magic here happens with the "client.connect()" call, and the subsequent "request()" call.  This effectively translates into "if we can make a connection to IBM Bluemix, then send the HIH-6130 data as JSON."  Temperature and humidity are stored as global variables for ease of access from the "request()" function.

    // Request
    void request()
    {
      char    content[255];
      char    photon[50];
    
      char    c[6];
      char    f[6];
      char    h[6];  
    
      // Get values as character arrays
      device.toCharArray( photon, 50 );
      String( celcius, 2 ).toCharArray( c, 6 );
      String( fahrenheit, 2 ).toCharArray( f, 6 );
      String( humidity, 2 ).toCharArray( h, 6 );
    
      // Format JSON request body
      sprintf(
        content,
        "{ \"sensor\": \"%s\", \"celcius\": %s, \"fahrenheit\": %s, \"humidity\": %s, \"timestamp\": %lu, \"version\": \"%s\" }",
        photon,
        c,
        f,
        h,
        Time.now(),
        SENSOR_VERSION
      );
    
      // Make request to server
      // Send sensor data as JSON
      client.print( "POST " );
      client.print( BLUEMIX_PATH );
      client.println( " HTTP/1.1" );
      client.println( "User-Agent: Particle Photon" );
      client.print( "Host: " );
      client.println( BLUEMIX_URL );
      client.println( "Content-Type: application/json" );
      client.print( "Content-Length: " );
      client.println( strlen( content ) );
      client.println( "Cache-Control: no-cache" );
      client.println();
      client.print( content );
    }
    

Here I use the "sprintf()" function to make the JSON document that we will be sending.  With that complete, the Particle then sends the raw HTTP headers, and JSON document, across the connection to IBM Bluemix.  The values arrive at Bluemix, enter our Node.js POST handler, and then directly inserts the JSON document into the Cloudant database.

### Web

Where would our project be without some way to visualize the data?  To get the data back out of the database, we will need to add an HTTP GET handler to our Express routing.

    // Get all readings
    // Get latest reading
    // Get readings within a page
    router.get( '/reading', function( req, res ) {
      var params = null;
    
      // Query parameters		
      params = {
        selector: {
          timestamp: {'$gt': 0}
        },
        sort: [
          {timestamp: 'desc'}
        ]
      };
    	
      // Support getting only latest reading
      // Also supports paging
      if( req.query.limit != undefined ) {
        params.limit = parseInt( req.query.limit );	
      }
    	
      // More support for paging
      // Arguments supplied via query string
      if( req.query.skip != undefined ) {
        params.skip = parseInt( req.query.skip );	
      }		
    	
      // Find using selector
      // Returns documents
      // Not the list function
      req.data.find( params, function( error, body ) {
        if( error ) {
          req.logger.info( 'Problem reading documents.' );
          req.logger.info( 'Message: ' + error.message );												
        }
    		
        res.json( body );
      } );
    } );
    

This implementation of a GET request will return all the readings by default.  This is useful if you want to chart all the data.  If you just want a chunk of the data, I have added handling for "limit" and "skip" query string parameters.  Using these, you can get a specific page of data, or in this case, the single most recent document.

> The Cloudant database has an index setup on the "timestamp" attribute.  This in turn allows us to sort the results using the "param" object.

On the client (the browser) we can then use "setInterval()" to periodically call the GET handler, and then display the most result document.  You might chose to use XHR directly, or the more robust and convenient [Cloud Code](http://blog.kevinhoyt.com/2015/08/13/weather-on-android/) library.

![The temperature and humidity in my office.](http://images.kevinhoyt.com/bluemix-iot-weather.jpg)

### Next Steps

While polling from the client is certainly one way to approach getting the latest data, it is certainly far from the most efficient.  At scale, random requests to check for data that may not have yet updated, will eventually start to tax your infrastructure.  You may also poll at a point in the update that your data could be stale.

The better approach to this problem would be to push new weather data to the client as it arrives in the database.  Cloudant supports this type of operation using a functionality called a "continuous feed".  In my next post, I will exploring moving from a request/response weather checking algorithm, to a publish-subscribe approach.

Until then, if you want to get a jump on all the code, take a look at this project in my [GitHub](http://github.com/krhoyt) repository.  If you have questions, please feel free to leave a comment below, or ask me on [Twitter](http://twitter.com/krhoyt).
