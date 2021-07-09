---
title: Web Bluetooth Bean
slug: web-bluetooth-bean
date_published: 2017-02-24T19:47:28.000Z
date_updated: 2019-01-17T00:44:18.000Z
tags: web, bluetooth, iot, ibm, bean
---

Bluetooth has been around for a while now, but it has always been a feature for native applications. The Web Bluetooth specification has been brewing for a while, lived under a flag for some time, and is now starting to land in desktop browsers. I figured it was time to give this feature a trial run.

### The Magical Fruit

My favorite Bluetooth device is the [Light Blue Bean](https://punchthrough.com/bean) (and Bean+) from Punch Through. The original Bean runs off a coin cell, and has a breadboard directly integrated into the PCB. The Bean+ gets a bit larger, but has a rechargeable LiPo battery, and female headers for prototyping right out of the box.

![The Light Blue Bean by Punch Through](http://images.kevinhoyt.com/punch.through.beans.png)

Both Beans feature not only a Bluetooth module, but also an ATmega328 - in other words, an Arduino. They are programmable over the air, use (mostly) the Arduino workflow, and can even run as iBeacon devices for indoor location and other applications.

### Sketchy

The Bean workflow adds to the Arduino tooling to provide Bean-specific functionality. You can leverage the built-in accelerometer, temperature sensor, fuel gauge, and RGB LED from the Bean API. The Bean API also abstracts all the low-level complexities of working with Bluetooth devices.

One of the operating modes for BLE allows devices to pair without any of the wonkiness of Bluetooth from earlier versions. To do this, the BLE stack arranges a pretty sophisticated contract. If you have seen my earlier post on BLE and iOS, you know there are a lot of steps. The Bean simplifies this down to Bean.setScratchData( slot, uint_array, length ).

    // Setup
    void setup() {
      // Debug
      Serial.begin( 9600 );
    
      // Deep sleep until needed
      Bean.enableWakeOnConnect( true );
    }
    
    // Loop
    void loop() {
      // Connected to a device
      if( Bean.getConnectionState() ) {
        // Set sensor values
        // Read LED color
        output();
        input();
        
        // Any desired delay (ms)
        // Bean.sleep( 1000 );    
      } else {
        // Nobody connected
        // Turn of LED
        // Deep sleep
        Bean.setLed( 0, 0, 0 );
        Bean.sleep( 0xFFFFFFFF );   
      }
    }
    

In this sketch we use the Bean.enableWakeOnConnect( true ) method to tell the Bean to sit in a deep sleep if no device is connected. From there the sketch checks to see if anything is connected, and if so, will read sensor values, and make them available do BLE devices, and then check to see if a new RGB LED color is desired. If no device is connected, the Bean will go back to sleep.

    // Sensor values on characteristic
    void output() {
      AccelerationReading acceleration;
      char content[20];
      uint8_t scratch[20];
    
      // Read accelerometer
      acceleration = Bean.getAcceleration();
    
      // Format values as string
      sprintf(
        content,
        "%d,%d,%d,%d",
        acceleration.xAxis,
        acceleration.yAxis,
        acceleration.zAxis,
        Bean.getTemperature()
      );
    
      // Debug
      Serial.println( content );
    
      // Put string into scratch format
      for( int i = 0; i < strlen( content ); i++ ) {
        scratch[i] = content[i];
      }
    
      // Set scratch data for various sensors
      Bean.setScratchData( 1, scratch, strlen( content ) );
    }
    

Scratch data is limited (by BLE, not the Bean) to 20 bytes. In this case, X, Y, and Z, axis will be a maximum of 4-bytes each, and two commas for a CSV format. That is 14-bytes so far. One more comma, and up to two bytes for the temperature reading (in Celcius). That adds up to 17-bytes. Any more data, and we would have to use additional scratch data slots.

> I am formatting this data in CSV because accelerometer data is a signed integer, and the scratch data is unsigned. I could shift the bits, but dealing with the string (character array) is easier for me.

    // Desired LED color
    void input() {
      ScratchData scratch;
      String content;
      int comma;
    
      // Get scratch data for LED
      scratch = Bean.readScratchData( 2 );
    
      // Set respective values
      // Easy inside uint range
      Bean.setLed(
        scratch.data[0],
        scratch.data[1],
        scratch.data[2]
      );
    }
    

I also read the scratch data to see if there is a desired change to the color of the on-board RGB LED. Technically, I set the color with every loop iteration. If no new scratch data has been set, then we just read what was there and set the color again. Conveniently, the Bean.setLed( red, green, blue ) method uses unsigned integer values, so getting from the scratch data to the RGB values is as easy as reading elements from an array.

### Web Bluetooth

Because there is such a large number of steps necessary to connect to a BLE device, trying to do this with callbacks would be a nightmare. To remedy this, the Web Bluetooth specification leans heavily on Promises. If you are not used to Promises, then this will take some getting used to using.

    // Start the connection process
    // Look for my specific Bean+
    navigator.bluetooth.requestDevice( { 
      filters: [
        {name: Bean.NAME}
      ],
      optionalServices: [Bean.SERVICE] 
    } )
    .then( device => {
      // Found device
      // User selected to pair with device
      // Browser now paired with device
      // Connect to attribute server
      this.bluetooth = device;
      this.bluetooth.addEventListener(
        'gattserverdisconnected', 
        evt => this.doDisconnected( evt ) 
      );
      return this.bluetooth.gatt.connect() 
    } )
    .then( server => server.getPrimaryService( Bean.SERVICE ) )
    .then( service => {
      this.service = service;
      return this.service.getCharacteristic( Bean.SENSORS );
    } )
    .then( characteristic => {
      // Connected to server
      // Connected to specific service
      // Retrieved a list of characteristics
    
      // This is a good place to update UI
    
      // Listen for characteristic changes
      return characteristic.startNotifications();
    } )
    .then( characteristic => {
      // Characteristic change listener
      characteristic.addEventListener(
        'characteristicvaluechanged',
        evt => this.doCharacteristicChanged( evt )
      );
    } )
    .then( service => {
      return this.service.getCharacteristic( Bean.RGB_LED );
    } )
    .then( characteristic => {
      this.rgbled = characteristic;
    } )
    .catch( error => { 
      console.log( error ); 
    } ); 
    

Believe it or not, that is almost entirely boilerplate code. At the very start, I tell the Web Bluetooth API to look for my specific Bean, by name, and having a specific service UUID. About two-thirds of the way through, once we have started listening for characteristic data changes (new data in the specified scratch slot), we register a listener to process the data. I also keep track of the GATT service itself because I want to write to it later.

    // Scratch characteristic changed
    // Parse content
    // Store relevant accelerometer values
    doCharacteristicChanged( evt ) {
      let scratch = null;
      let content = null;
      let parts = null;
    
      // Parse to CSV
      // Then to array of strings
      scratch = new Uint8Array( 
        evt.target.value.buffer 
      );
      content = String.fromCharCode.apply( 
        String, 
        scratch 
      );
      parts = content.split( ',' );
    
      // Get integer value for x-axis
      // Map to 180-degree total range
      this.angleX = parseInt( parts[0] );
      this.angleX = this.map( 
        this.angleX, 
        -270, 
        270, 
        -90, 
        90 
      );
    
      // Get integer value for y-axis
      // Map to 180-degree total range
      this.angleY = parseInt( parts[1] );
      this.angleY = this.map( 
        this.angleY, 
        -270, 
        270, 
        -90, 
        90 
      );    
    
      // Temperature in centigrade
      this.temperature = parseInt( parts[3] );
    }
    

The inverse of what happens in the sketch - turning a character array into an unsigned integer array - happens here, then I split the data and parse as needed. For my application, I run a linear transform to take the data from an accelerometer-specific value, to a range I can use in my application.

    doSwatch( evt ) {
      let color = null;
      let index = null;
    
      // Get index from selected color
      index = evt.target.getAttribute( 'data-index' );
    
      // Map index to color options
      color = new Uint8Array( 3 );
      color[0] = this.rainbow[index].red;
      color[1] = this.rainbow[index].green;
      color[2] = this.rainbow[index].blue;
    
      // Write to characteristic
      this.rgbled.writeValue( color );
    
      // Show selected color
      // Hide swatches
      this.current.children[0].style.backgroundColor = evt.target.style.backgroundColor;
    }
    

Again, using unsigned integers for the RGB colors, and the scratch data makes things easy. I then tell that specific Bluetooth service to write the new scratch data. That is what gets picked up in the sketch, and then the Bean API is called to set the color of the RGB LED.

### What's Next

One problem I have repeatedly encountered is that my Web application will stop receiving notifications. This seems to happen most often when I write new RGB characteristic data. The problem existed before I added that feature however. It also seems worse if I sleep less (or not at all in this case) on the Arduino.

Because of all the sandboxing that happens both at the Web Bluetooth level, and the Bean API level, I cannot tell which one is causing the problem. My guess is the Web Bluetooth API as this works without problems on a native iOS application. But I am honestly just guessing there, and would love to have the working group take a look. But would that involve shipping them a Bean? Weird problems in IoT land.
