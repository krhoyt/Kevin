---
title: Weather in Three Flavors
slug: weather-in-three-flavors
date_published: 2015-07-29T14:04:00.000Z
date_updated: 2015-07-30T15:25:46.000Z
tags: web, java, php, ibm, bluemix, runtime, weather, nodejs
---

In my [last post](http://blog.kevinhoyt.com/2015/07/28/bluemix-crawl-runtimes/), I gave an overview of IBM Bluemix, and walked through the process of deploying your web first application.  For this post, I will walk through a simple weather application I used to test out some of the Bluemix web runtimes.  The flavors for this application comes in PHP, Node.js, and Java.

### Quick Recap

Just as a quick reminder, IBM Bluemix is a PaaS (Platform as a Service) offering from IBM.  It consists of ~120 different components at the time of this writing.  The ability to run your own server code is called "Runtimes" in Bluemix vernacular, and is just one of the available components.

As IBM Bluemix is based on the open source [Cloud Foundry](https://www.cloudfoundry.org) project, you use the Cloud Foundry tooling to deploy your applications - most notably a CLI (command line interface).  A "manifest.yml" is required to identify your application, and to supply the runtime options to Bluemix.

### Make It Rain

This sample weather application consists of a few different pieces - none of them particularly complex.  We will start off by taking a look at the client-side code, and the general behavior of the application.

![IBM Bluemix weather application.](http://images.kevinhoyt.com/bluemix-crawl-weather-php.png)

When the weather application is loaded in the browser, the first thing it does is use XHR (XMLHttpRequest) to load the "weather.txt" file in the background.  This file tells the client where to get the weather data - the URI of the service.  I externalized this piece of information to make the client side more portable across different languages and configurations.

    // Geolocation
    if( navigator.geolocation ) 
    {
      navigator.geolocation.getCurrentPosition( 
        doLocationSuccess, 
        doLocationError 
      );
    } else {
      doLocationError( 'Geolocation not supported.' );
    }
    
    ...
    
    // Lookup weather data
    function doLocationSuccess( position )
    {
        // Debug
        console.log(
            position.coords.latitude + 
            ', ' +
            position.coords.longitude
        );
     
        // Get weather
        weather( position );
    }       
    

With the service endpoint URI obtained, the JavaScript will then use the browser [Geolocation API](http://caniuse.com/#feat=geolocation) to get the latitude and longitude of your computer/device.  Once obtained, the latitude and longitude are sent to the server for processing (the loaded URI), using XHR.

The called server resource will load a file called "forecast.io" which contains an API (application program interface) key for the Forecast service.  [Forecast](http://forecast.io) is a weather service that I am using for this application.  The API is simple yet powerful, and there is a free tier for development and testing purposes.  Perfect for this sample application.

> For security reasons, my Forecast API key is not included in the GitHub repository.  You will need to sign up for [your own Forecast account](https://developer.forecast.io), get your own key, and put it in a file named "forecast.io" in the same directory as the rest of the application files.

With latitude, longitude, and API key in hand, the code then makes a server-side HTTP request against the Forecast API.  Current weather details are parsed from the JSON (JavaScript Object Notation) response.  The proper name of the location (city, state) is not included in the response, so a subsequent call is made against a Google API for reverse geocoding (address lookup).

The results of all the pertinent data is sent back to the browser as a JSON-encoded string.  The browser gets that information, populates the various UI elements, and the weather is presented to the user.  This happens once per minute so long as the web page is front and center in the browser.

### PHP

My biggest concern for using PHP on IBM Bluemix was file IO.  Not that file IO is a particularly tough task for PHP, but that I have had my share of unsupported file IO features on cloud servers in the past.  I have also seen cloud service providers lock down file IO as a security risk, then provide their own, less than ideal, library wrapper for you to use.

    // Get API key
    $forecast_key = trim( file_get_contents( $KEY_FILE ) );
    

Much to my surprise, IBM Bluemix actually lets you pick the [version of PHP](https://www.ng.bluemix.net/docs/starters/php/index.html#phpversions) that you want to run.  Version 5.5.23 is the default, but you can also specify versions in the 5.4.x range and 5.6.x range.  Once my development version (minor) was matched with the Bluemix version, I encountered no problems, or limits, at all.

> All things being equal, PHP was probably the easiest of the three to deploy and use on IBM Bluemix.  Drop some files in a directory, add a "manifest.yml", push to the cloud, and done.

### Node.js

When it comes to Node.js, [Express](http://expressjs.com) is the de facto standard web framework.  When you download the starter code from IBM Bluemix, you will find an Express template already waiting for you.  In fact, Node.js and Express are widely used in other areas of Bluemix as well.

    var cfenv = require( 'cfenv' );
    var bluemix = cfenv.getAppEnv();
    
    // Start server
    app.listen( bluemix.port, bluemix.bind, function() {
      console.log( 'Server starting on: ' + bluemix.url );
    } );
    

When running Node.js in the cloud however, you may not know anything about the deployment directory, port, or other environment variables.  This means you need to abstract them from your code.  IBM Bluemix helps you out here with the "cfenv" library.  This handy library lets your application know how Bluemix has deployed it.  There is even access to custom environment variables you can set in the Bluemix dashboard.

> You can also use a "package.json" file to have Bluemix load dependencies for you during deployment - and there is no limitation on which libraries you can use.

### Java

If we are comparing PHP, Node.js, and Java, then Java is a whole different animal.  But if you are a Java developer, then you probably already know that.  When you download the starter code for Java from IBM Bluemix, you get the boilerplate for a full Java EE deployment.  Indeed, when you run a Java application on Bluemix, it runs no the [WebSphere Application Server Liberty Profile](https://developer.ibm.com/wasdev/websphere-liberty/) (full Java EE 7).

If you know your way around a Java EE application, then you should feel right at home in the starter code.  There is an [Apache Ant](http://ant.apache.org) build file already included.  Import this project into Eclipse for Java EE, and you will be off to the races in no time.

    @Path( "/weather" )
    public class WeatherService 
    {
      // Get request for weather data
      @GET	
      public String doWeather( 
        @QueryParam( "latitude" ) String latitude, 
        @QueryParam( "longitude" ) String longitude ) {
    
        // Service code here
    
      }
    }
    

> When I settled into this project, I completely expected to build a servlet for my web service handling.  What tickled me pink however, was the support for JAX-RS on IBM Bluemix!

If you have not worked with JAX-RS for your REST-based web services before, you really owe it to yourself to check it out.  You do not even have to crack open the configuration files.  You make a class with some annotations, compile, and you have a web service.  Brilliant!

### Next Steps

What I find most interesting about these three different overviews is the subtle difference in approach.  Not that one is better or worse than the other, but that they all clearly come at the market in their own ways.

Out of the box PHP development excels at being drop-dead simple.  Since you have immediate control over the web framework, Node.js is amazingly nimble, but requires a bit more consideration up front.  Java EE really makes you think, but pays off in robustness (JMS, EJB, etc.).

What is great from the IBM Bluemix perspective is how similar it is to deploy these web runtimes.  Even better yet is that there are several other options beyond these three.  I would encourage you to take a couple hours to try one out for yourself.  If you have questions, you can find me on [Twitter](http://www.twitter.com/krhoyt).  If you want code to compare against, all my work is on [GitHub](https://github.com/krhoyt/IBM/tree/master/crawl/runtimes).
