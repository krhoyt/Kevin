---
title: Particle and Google Maps Integration
slug: particle-and-google-maps-integration
date_published: 2017-05-28T18:47:00.000Z
date_updated: 2019-01-17T00:40:22.000Z
tags: particle, iot, google, location, map
---

At Google IO 2017 just a few weeks ago, Particle announced an integration with Google Maps. This integration allowed you to get the location of a Photon without the need for a GPS. Instead location is achieved by referencing the wireless access points in the vicinity (a less scary way of saying all your IPs are belong to us). I thought this was pretty slick and wanted to give it a test drive.

#### It Works

It took me all of fifteen minutes to get the integration working. While Particle has [documentation](https://docs.particle.io/tutorials/integrations/google-maps/) on the feature, I actually landed on [this tutorial](https://particle.hackster.io/gusgonnet/map-your-particles-e34878?ref=channel&amp;ref_id=286_trending___&amp;offset=0) by [Gustavo Gonnet](https://github.com/gusgonnet), first. Accuracy for my Photon, tested on different wireless networks in different parts of town, might as well have been using GPS - it was that accurate. Bravo!

#### Ch-Ch-Ch-Ch-Changes

In Gustavo's tutorial, you eventually get to a point where you clone a Google repository with an example Node.js application for mapping your Photons in the the browser. You start the Node.js application, head to the browser, log into the application using your Particle account, and then you get to see the location of your Photons.

I felt the whole logging into the web page to be kind of out of place. I am guessing that they were going for broad use. So the first thing I did was to migrate the login to the server using a configuration file that original application was already using.

    var Particle = require( 'particle-api-js' );
    
    // Particle
    var particle = new Particle();
    
    // Login
    particle.login( {
      username: config.particle_username, 
      password: config.particle_password 
    } ).then(
      function( data ) {
        // Listen to event stream
        // Specific to my devices
        // Can use device ID if known
        particle.getEventStream( { 
          auth: data.body.access_token,
          deviceId: 'mine',
        } ).then( function( stream ) {
          // Stream event arrived
          stream.on( 'event', function( evt ) {
            // Look for location-specific event
            if( evt.name.startsWith( 'hook-response/' + config.event_name ) ) {
              // Parse out location details
              var parts = evt.data.split( ',' );
              
              // Assemble message
              var msg = JSON.stringify( {
                id: evt.name.split( '/' )[2],
                published: evt.published_at,
                position: {
                  lat: parseFloat( parts[0] ),
                  lng: parseFloat( parts[1] ),
                },
                accuracy: parseInt( parts[2] )
              } );          
    
              // Send to clients
              io.emit( 'location', msg );
            }       
          } );
        } );    
      },
      function( err ) {
        console.log( err );
      }
    );
    

That original application was also using Express templates for the client map view. There is only one page, and the use of templating is very limited, so next I separated out the client and server completely. Given that the original application used WebSockets to push the latest location information, this transition was pretty easy.

    // Socket
    var io = require( 'socket.io' )( server );
    
    ...
    
    // Send to clients
    io.emit( 'location', msg );
    

Moving away from the views, separating out client and server, and pulling the Particle login to the server, let me strip out a lot of overhead around session management, etc. from the original application. I also moved to Socket IO which has robust client connection fallback, with cleaner integration at the server.

    class Location {
      constructor() {
        // Create the map instance
        // Set default location
        // Set default zoom level
        this._map = new google.maps.Map( document.querySelector( '#map' ), {
          center: {lat: 41.1106266, lng: -73.7248718},
          zoom: 14
        } );
        
        // Marker showing location
        // Wait for first location event
        this._marker = null;
        
        // Socket
        // Listen for location events
        this._socket = io();
        this._socket.on( 'location', evt => this.doLocation( evt ) );
      }
        
      // Location event
      // Position marker and map
      doLocation( evt ) {
        // Parse JSON
        var data = JSON.parse( evt );
        console.log( data );
        
        // First location event
        // Instantiate marker
        if( this._marker == null ) {
          this._marker = new google.maps.Marker( {
            map: this._map
          } );                
        }
        
        // Position marker
        // Center map
        this._marker.setPosition( data.position );
        this._map.setCenter( data.position );         
      }
    };
    
    // Here we go!
    let app = new Location();
    

#### Next Steps

When I was originally testing the Particle stream monitoring at the server (Node.js), I was shocked at how many stream events are published across the entire Particle Cloud. If you leave out the "mine" parameter, you will see everything not otherwise locked down.

The sheer scale of the data makes me wonder if I could feed it all into Watson, and see what machine learning could make of it all. The full stream is totally "dark data" varying widely in structure. That is a perfect Watson application. Maybe some aspect of Watson in general would make for a good next Particle integration.

I also posted my code into a [GitHub Gist](https://gist.github.com/krhoyt/b1ef78a6cacbd79ea103351bb4aa979c) if you want to check it out for yourself.
