---
title: "Circuit Friday: DHT22"
slug: circuit-friday-dht22
date_published: 2014-11-14T16:00:00.000Z
date_updated: 2015-04-21T14:04:35.000Z
tags: arduino, circuit, dht
---

*Last week for [Circuit Friday](http://kevinhoyt.com/blog/2014/11/07/circuit-friday-thermistor.html) I introduced temperature sensing with a thermistor - effectively a resistor whose resistance changes based on temperature. We were then able to read the variation of current through the circuit, apply some math, and come up with a temperature. At a high level, this is analog input.*

*Today I thought I would keep with the temperature sensing theme, but introduce some new concepts. Coming at you this week is the DHT22 package which can measure both temperature and humidity. Along the way we will learn about 1-Wire communications.*

---

The DHT22 goes by several names. The other common name is the RHT22. Both are effectively the same, and will set you back $10 USD over at [SparkFun](https://www.sparkfun.com/products/10167). The data sheet says that it will run from 3.3V to 6V which makes it ideal for Arduino application. Temperature range is -40°C to 80°C with 0% to 100% relative humidity.

![DHT22 (photo courtesy SparkFun.)](http://images.kevinhoyt.com/dht22.jpg)

The DHT22 package has four (4) pins. One for power, one for ground, one for signal, and one that is effectively null. That signal pin will hook to a digital pin on the Arduino (or other). Wait a second! How can a digital (on/off) pin tell us the analog voltage for temperature readings? And would not there be a pin for humidity analog as well?

> 1-Wire communication was designed by Dallas Semiconductor, and can be found in the Java Ring and iButton.

This is where the concept of [1-Wire](http://en.wikipedia.org/wiki/1-Wire) communications comes into play. 1-Wire communication was designed by Dallas Semiconductor, and you can find it in many applications - usually where quick, unique identification is required. Notable products include the Java Ring and iButton, and it is widely used in smart ticket and public transportation applications.

You can think of 1-Wire communication like Morse Code. If you toggle a digital pin high and low at various rates, you can effectively create a system that represents instructions to the desired package (DHT22 in this case). Another analogy might be the letter "A" in a document, that is effectively stored as a series of bits - zero/ones for low/high digital signals.

The problem in the electrical engineering world around this type of communication is that it has effectively become a differentiator. If you can make one type of chip/sensor, you can make many other types. To keep people on your chips then, you tweak the digital communication protocol. In the end, there are several different types of this digital communication out there.

### Circuit Diagram

Surprisingly, I have seen the DHT22 package wired up in various ways. And to be sure, the resistor value will change depending on the voltage you are using to power the DHT22. At the lower voltage range (3.3V), I have read about people struggling more than with 5V. Sometimes this is because of unreliable sourcing, other times it is line noise from other components.

What follows is the way that works for me, using a third-party library that works for me. Your milage may vary should you decide to try something a little different.

![DHT22 connected to Arduino.](http://images.kevinhoyt.com/fritzing.dht.png)

The wiring is not too different from the thermistor of last week. The DHT22 gets power and ground through dedicated pins. The signal runs from another pin. A pull-down resistor is needed across the power pin and the signal pin to help draw the voltage to zero when set to low. This gives us a clean signal for the DHT22 communication.

### Arduino Uno

Earlier we talked about the 1-Wire protocol, and how there are various approaches on the market. When it comes to the DHT22, it does not even truly conform to the 1-Wire specification. This is a problem. The data sheet explains how the protocol works, and there are numerous libraries for Arduino that implement it. Some work better than others. For this exercise, I will be using the DHT library by [Rob Tillaart](https://github.com/RobTillaart/Arduino).

> If you have the Arduino IDE open, you will need to close it and start it again to get it to pick up new libraries.

To use third-party libraries with the Arduino IDE, you first need to download the code. The Arduino IDE will look in Documents -> Arduino -> libraries on Mac and My Documents -> Arduino -> libraries on Windows for third-party libraries. In this case, take the libraries -> DHTlib from the download, and place it in the appropriate folder for your operating system.

    // Third-party library
    // https://github.com/RobTillaart/Arduino
    #include <dht.h>
    
    // Literals
    #define DHT_PIN 5
    
    // DHT instance
    dht DHT;
    
    // Setup
    void setup()
    {
      // Serial communication
      Serial.begin( 9600 );
    }
    
    // Loop
    void loop()
    {
      int check;
    
      // Sensor for reference
      Serial.print( "DHT22," );
    
      // Library version for reference  
      Serial.print( DHT_LIB_VERSION );  
      Serial.print( "," );  
    
      // Read the DHT data
      // Return from call is checksum
      // Checks for correct communication
      check = DHT.read22( DHT_PIN );
    
      // Check for errors
      switch( check )
      {
        case DHTLIB_OK: 
          Serial.print( "OK," ); 
          break;
        case DHTLIB_ERROR_CHECKSUM: 
          Serial.print( "CHECKSUM," ); 
          break;
        case DHTLIB_ERROR_TIMEOUT: 
          Serial.print( "TIME_OUT" ); 
          break;
        default: 
          Serial.print( "UNKNOWN" ); 
          break;
      }
    
      // Display humidity, celcius, farenheit
      Serial.print( DHT.humidity, 1 );
      Serial.print( "," );
      Serial.print( DHT.temperature, 1 );
      Serial.print( "," );
      Serial.println( ( DHT.temperature * 1.8 ) + 32, 1 );    
    
      // Wait for next reading
      delay( 1000 );
    }
    

The first line of our Arduino code includes the DHT library. The name used corresponds to the name of the library code you placed in the Arduino IDE library folder. We need that one signal pin for use with the library, and then we set up a reference to the DHT object (from the library).

Our setup code simply sets up serial communication for the USB port.

In the loop, we use the DHT object to read a value from the DHT22 itself. Various messages can come back from the DHT22, so we need to evaluate what we got back. At this point the DHT instance has the temperature and humidity readings in properties. We can then display these values over the serial port (USB).

That is it! Load the program onto your Arduino, and open the serial monitor to see the temperature and humidity. If you get errors along the way, leave a comment, and I will try to help you out. Usually, problems will arise either from the placement of the library, or the wiring.

### Next Steps

Why 1-Wire or similar communication protocol? Eventually, as the complexity of your projects grow, you will likely run out of pins to use. At that point you will be thankful that such techniques actually exist. The approach can also make your circuit easier to wire in the first place. With some implementations you can string together many packages without having the need for additional pins.

The open source nature of Arduino has led to libraries for just about every device you might want to use. If you find problems, I would encourage you to get involved, contribute and keep the community rolling forward. If you implemented something new, then share it!
