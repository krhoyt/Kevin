---
title: Slap Robin with the ZX Gesture Sensor
slug: slap-robin-with-the-zx-gesture-sensor
date_published: 2017-07-11T12:25:00.000Z
date_updated: 2019-01-17T00:36:12.000Z
tags: watson, iot, pubsub
---

Every now and again, I run across a sensor that just sounds like fun. Such is the case when I read about the ZX Gesture Sensor from Sparkfun and XYZ Interactive. Put it together with the Internet, and I just may have gotten a little slap-happy.

#### The Sensor

The [ZX Gesture Sensor](ZX Gesture Sensor) measures about 2.5" long and about 1" deep. It consists of two IR emitters - one on either end, and an IR sensor in the middle. When you move your hand in front of the sensor, IR light bounces off of it, which is in turn picked up by the sensor.

![Image courtesy of Sparkfun.](http://images.kevinhoyt.com/zx.gesture.sensor.jpg)

You can get detailed data over the I2C interface, or just ask the sensor to give you data when it detects a gesture. There is Arduino code provided, but I wanted to connect this bad boy to the Internet. I reached into my kit, grabbed a [Particle Photon](https://www.particle.io/), and migrated the Arduino code to a Photon library.

#### The Photon

Copy and paste from the Arduino library into the Particle IDE, met with successful compilation on the first pass. I did eventually go back and pull out parts I knew were not needed, such as the "Arduino.h" header reference, but nothing else was really required of me.

    #include "ZX_Sensor.h"
    
    GestureType gesture;
    uint8_t     speed;
    ZX_Sensor   sensor = ZX_Sensor( 0x10 );
    
    void setup() {
      // Initialize sensor
      sensor.init();
    }
    
    void loop() {
      char content[255];
    
      // Data available
      if( sensor.gestureAvailable() ) {
    
        // Read
        gesture = sensor.readGesture();
        speed = sensor.readGestureSpeed();
    
        // What just happened
        switch( gesture ) {
          case NO_GESTURE:
            sprintf( content, "-1,%u", speed );
            break;
    
          case RIGHT_SWIPE:
            sprintf( content, "0,%u", speed );
            break;
    
          case LEFT_SWIPE:
            sprintf( content, "1,%u", speed );
            break;
    
          case UP_SWIPE:
            sprintf( content, "3,%u", speed );
            break;
    
        }
    
        // Publish event
        Particle.publish( "slap", content, PRIVATE );
      }
    }
    
    

While you can connect a Photon directly to an MQTT broker, or even make HTTP requests, I find both of these to be particularly problematic from a security perspective. I prefer to use the [Particle WebHooks](https://docs.particle.io/guide/tools-and-features/webhooks/) because data from the Photon, to the Particle servers, is secured with TLS. This also allows me to keep my endpoint credentials tucked away from the client.

    curl -X "POST" 
      "https://YOUR_ORG.messaging.internetofthings.ibmcloud.com:8883/api/v0002/application/types/YOUR_TYPE/devices/YOUR_DEVICE/events/swipe" \
         -H "Content-Type: application/json; charset=utf-8" \
         -u a-YOUR_ORG-YOUR_USERNAME:YOUR_PASSWORD \
         -d $'{
      "speed": 10,
      "direction": "left"
    }'
    

The WebHook integration then makes an HTTPS request to the [Watson IoT](https://www.ibm.com/internet-of-things/) MQTT broker. Yup, you can POST messages to the broker using HTTPS! Messages are in turn broadcast out over the specified MQTT topics. To get this to the Web, I had a Node.js server running on IBM Bluemix.

#### The Server

The Node.js server has two main parts. The first part is that it subscribes to Watson IoT message via an MQTT client library. Again, keeping my connectivity credentials on the server, away from any clients, helps me to sleep well at night.

    // Connect to Watson IoT
    var client  = mqtt.connect( 
      config.iot_host, 
      {
        clientId: config.iot_client + '_' + Math.round( ( Math.random() * 10000 ) ),
        username: config.iot_username,
        password: config.iot_password,
        port: 1883
      }
    );
    
    ...
    
    // Connected to Watson
    // Subscribe for sensor data
    client.on( 'connect', function() {
      console.log( 'Broker connected.' );
    
      client.subscribe( config.iot_topic, function( error, granted ) {
        console.log( 'Subscribed.' );
      } );
    } );
    
    // New message arrived
    client.on( 'message', function( topic, message ) {
      console.log( message.toString() );
    
      // Send to client screen
      io.emit( 'slap', message.toString() );
    } );
    
    

When the gesture message arrives, it is pushed to the connected clients via [Socket IO](https://socket.io/). Socket IO is a nice fit here because it adds some smarts to the connection to the browser. The ability to reconnect is one of my favorite features, but it also simplifies managing destinations over straight WebSocket.

> I tend to be a bit of a purist when it comes to WebSocket, so giving an endorsement to Socket IO is a big step for me.

    // Application
    var app = express();
    
    // Static for main files
    app.use( '/', express.static( 'public' ) );
    
    // Bluemix
    var env = cfenv.getAppEnv();
    
    // Listen
    var server = app.listen( env.port, env.bind, function() {
      // Debug
      console.log( 'Started on: ' + env.port );
    } );
    
    ...
    
    // Socket
    var io = require( 'socket.io' )( server );
    
    // New socket connection
    io.on( 'connection', function( socket ) {
      console.log( 'Client connected.' );
    } );
    

#### The Meme

As I was gesturing away, I kept thinking to myself "Now what?" It was around this time when the original Batman, [Adam West](https://en.wikipedia.org/wiki/Adam_West), passed away. I was reminded of the meme of Batman slapping Robin in the comic books, and a demo was born.

![The original reason that Batman slaps Robin.](http://images.kevinhoyt.com/batman.slap.robin.jpg)

#### The Browser

I figured that if I was making a gesture of swiping left, that Batman should be slapping Robin using his left hand. If I was making a gesture of swiping right, then Batman should use his right hand. That would be as easy as displaying the image flipped horizontally based on the data.

    // Connect to server
    // Listen for slap event
    this.socket = io();
    this.socket.on( 'slap', evt => this.doMessage( evt ) );
    
    ...
    
    doMessage( evt ) {
      // Parse
      let message = JSON.parse( evt );
      let parts = message.data.split( ',' );
      let direction = parseInt( parts[0] );
    
      // Show image for direction of gesture
      switch( direction ) {
        case 0:
          this.slap.style.backgroundImage = 'url( img/slap.right.png )';
          break;
    
        case 1:
          this.slap.style.backgroundImage = 'url( img/slap.left.png )';
          break;      
      }
    
      // Display for a limited time
      this.interval = setInterval( () => {
        this.slap.style.backgroundImage = '';
        clearInterval( this.interval );
        this.interval = null;
      }, 2000 );
    
      // Debug
      console.log( message );
    }
    

The image of Batman slapping Robin stays around for two seconds, and then disappears.

*Note: While I love the Particle Photon, the single biggest complaint I have with it, surfaced during the recording of this video - no 5GHz support. In a noisy environment like my home, this means that the Photon is regularly disconnecting.*

#### Next Steps

While this may seem like a trivial application, it is actually a solid boilerplate for connecting any type of sensor data, securely, to any infrastructure. Credentials are kept on servers, away from prying eyes, while the sockets cleanly deliver the data from the sensor to any connected client. Security is critical with IoT, and this is a great way to start off your next application.
