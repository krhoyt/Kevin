---
title: Mobile Cloud Weather on Android
slug: weather-on-android
date_published: 2015-08-13T19:51:45.000Z
date_updated: 2015-08-13T19:51:45.000Z
tags: android, bluemix, weather, mobile, cloud
---

With an overview of IBM Bluemix mobile runtimes [established](http://blog.kevinhoyt.com/2015/08/04/bluemix-mobile-runtimes/), the next question is how to use those runtimes - Android and iOS.  In this post we will take a closer look at building and using an application that uses third-party weather data.  We will start at the server, then move our way onto the client with a native Android application.

### Server

When it comes to mobile runtimes, the server code is written using Node.js.  You are free to use whatever packages you may already be using, but there is also a package for IBM Bluemix.  You can install the Node.js SDK and add it to your "package.json" file using "npm install ibmbluemix --save".

    // Package
    var ibmbluemix = require( 'ibmbluemix' );
    
    // Bluemix
    ibmbluemix.initialize( {
      applicationId: '_YOUR_APP_KEY_',
      applicationRoute: '_YOUR_APP_ROUTE_',
      applicationSecret: '_YOUR_APP_SECRET_'
    } );
    
    // Environment
    var ibmconfig = ibmbluemix.getConfig();
    
    // Logging
    var ibmlogger = ibmbluemix.getLogger();
    

The first thing we will need to do is to initialize the IBM Bluemix communication.  This uses the key, route, and secret which can be obtained from the Bluemix dashboard under "Mobile Options".

From there, we cannot make assumptions about the environment that IBM Bluemix will use to deploy our application.  An example of this might be the port, certainly the directory structure, and even other services in use by your application such as IBM Cloudant.

You may also want to do some logging along the way.  This can be as basic or as robust as you would like.  In this example, I am just logging out to the console.  You can also use Winston or other logging utilities.  Again however, keep in mind that the path you place your logs for local development, may not be the same path on IBM Bluemix.

> As with my web runtime examples, I will be using the Forecast service for weather data.  If you need more information on using that service, please see my [earlier post](http://blog.kevinhoyt.com/2015/07/29/weather-in-three-flavors/).

    app.get( ibmconfig.getContextRoot() + '/weather', function( req, res ) {
      latitude = req.query.latitude;
      longitude = req.query.longitude;
    
      // Call to Forecast
      // Call to Google reverse gelocation lookup
    
      res.json( weather );
    } );
    
    app.listen( ibmconfig.getPort() );
    ibmlogger.info( 'Server started on port: ' + ibmconfig.getPort() );
    

The Android client will access the location of the device, and provide that to the "weather" service.  More on that in a moment.  Note that I am using the "ibmconfig.getContextRoot()" function to map Express to the IBM Bluemix environment for the service.  I am also using "ibmconfig.getPort()" to map the port to my Express instance.

As it is, we can use this as a REST service.  In the browser, we might access this service from a URL relative to the page that was loaded.  On a native mobile application however, we have no root context for a loaded page.  Let us take a look at the Android side of things.

### Android

The first task on Android is to know where the device is located.  This will allow us to get accurate conditions.  This is accomplished using a feature of the Mobile Cloud SDK called, aptly enough called "Location".  This location feature is roughly the same across multiple platforms, speeding up the development process.

    // Get location
    IBMLocation.getService().acquireGeoPosition(
      IBMGeoAcquisitionPolicy.getLiveTrackingProfile() ).continueWith( 
      new Continuation<IBMPosition, Void>() {
        // Async off UI thread
        @Override
        public Void then( Task<IBMPosition> task ) throws Exception {
          Exception   faulted;
          IBMPosition position;
    
          // Problem
          if( task.isFaulted() ) {
            faulted = task.getError();
            Log.e( "LOCATION", faulted.getMessage() );
          } else {
            // Get position from results
            position = task.getResult();
    
            // Debug
           Log.i( 
             "LOCATION", 
             position.getLocation().getLatitude() + ", " +       
             position.getLocation().getLongitude() 
           );
    
           // Call Cloud Code
          forecast(                              
            position.getLocation().getLatitude(),
            position.getLocation().getLongitude()
          );
        }
    
        return null;
      }
    } );
    

Once we have located the device geographically, we can then make a call to get the weather conditions.

To help us locate and interoperate with our weather service, we will use a part of the Mobile Cloud SDK called Cloud Code.  Cloud Code knows how to access our application by the initialization parameters we provide.  It then exposes methods for REST access to those endpoints.

> There is a Mobile Cloud SDK for multiple platforms, and working with it on each platform is nearly identical.  Check out the [documentation](http://mbaas-gettingstarted.ng.bluemix.net/index.html) for your platform, including the [API](https://mobile.ng.bluemix.net/mbaas-api/docs/Android/index.html).

    protected void forecast( 
      double latitude, 
      double longitude ) {
      String  lat;
      String  lng;
      String  url;
    
      // String representation of coordinates
      lat = Double.toString( latitude );
      lng = Double.toString( longitude );
    
      // Assemble Cloud Code URL
      url = 
        WEATHER_ROOT + 
        "?" + 
        LATITUDE + 
        "=" + 
        lat + 
        "&" + 
        LONGITUDE + 
        "=" + 
        lng;
    
      // Call Cloud Code
      // Separate thread
      ibmcloud.get( url ).continueWith( 
        new Continuation<IBMHttpResponse, Void>() {
    
          @Override
          public Void then( Task<IBMHttpResponse> task ) throws Exception {
            Exception       faulted;
            IBMHttpResponse response;
            String          content;
    
            // Problem
            if( task.isFaulted() ) {
              faulted = task.getError();
              Log.e( "CLOUDCODE", faulted.getMessage() );
            } else {
              // Get results
              response = task.getResult();
    
              // OK
              if( response.getHttpResponseCode() == 200 )
              {
                // Get String content from response
                content = stringFromResponse( 
                  response.getInputStream() 
                );
    
                // Debug
                Log.i( "CLOUDCODE", content );
    
                // Parse resulting JSON
                parseAndPopulate( content );
              }
            }
    
            return null;
          }
        } );
      }
    

Note that the Cloud Code object is calling this method via "GET" or "get( url )" in the code.  The "url" here is assembled the line before.  That URL uses a constant called "WEATHER_ROOT" whose value is "/weather".  Notice that there is no domain as part of the URL.  Cloud Code know how to talk to IBM Bluemix, and to your weather service without you having to worry about the details.

All that is left from here is to parse the JSON response created by our Node.js weather service, and populate the user interface accordingly.

![Android weather application.](http://images.kevinhoyt.com/bluemix-mobile-android-weather.png)

### One More Thing

To show how Cloud Code is nearly identical across platforms, I took one more step and created a web version of the user interface as well.  The location classes are strangely absent on in the JavaScript SDK, so I use the browser geolocation API.

    // Geolocation
    // Timeout clears stack
    // Avoids Safari implementation bug
    setTimeout( function() {
      if( navigator.geolocation ) {
        navigator.geolocation.getCurrentPosition( 
          doLocationSuccess, 
          doLocationError 
        );
      } else {
        doLocationError( 'Geolocation not supported.' );
      }            		
    }, 1000 );
    

Once I have location information, I store if globally, so I can continue to poll the server for weather conditions.  Polling using Cloud Code looks almost identical to the Android version.  You will even see the "WEATHER_ROOT" constant, which once again, simply points to "/weather" without having to think about the underlying details.

    // Mobile Cloud Services
    IBMBluemix.initialize( {
      applicationId: APPLICATION_ID,
      applicationRoute: APPLICATION_ROUTE,
      applicationSecret: APPLICATION_SECRET
    } );
    	
    // Cloud Code
    cloud = IBMCloudCode.initializeService();
    
    ...
    
    // URL for service
    url = 
      WEATHER_ROOT + 
      "?" + 
      LATITUDE + 
      "=" + 
      latitude + 
      "&" + 
      LONGITUDE + 
      "=" + 
      longitude;
    	
    // Call service
    cloud.get( url ).then( 
      doWeatherLoad, 
      doWeatherError 
    );
    

![Weather application in the browser.](http://images.kevinhoyt.com/bluemix-iot-weather.jpg)

### Next Steps

Getting access to weather conditions from a service is fine and dandy.  Forecast is a joy to work with.  In this day and age of IoT however, it seems like we could up our game by using sensors in and around our physical location - your home for example.  Up next we will take a look at getting IoT data into IBM Bluemix.  This is where things start getting interesting.

The complete code for this example, and much more, is in my [GitHub repository](http://github.com/krhoyt).  If you have any questions, feel free to leave a comment below, or send me a message on [Twitter](http://twitter.com/krhoyt).
