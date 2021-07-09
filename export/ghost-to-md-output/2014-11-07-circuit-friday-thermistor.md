---
title: "Circuit Friday: Thermistor"
slug: circuit-friday-thermistor
date_published: 2014-11-07T22:00:00.000Z
date_updated: 2015-04-21T14:16:35.000Z
tags: arduino, thermistor, circuit
---

*My family has recently moved into a new home, and we are struggling to fine tune the thermostat in this Colorado Fall, where daytime temperatures hit 70°F and drop to 30°F at night. This means temperature sensing applications are fresh in my mind. For today's Circuit Friday then, I present for your reading pleasure, the humble thermistor.*

---

Blinking an LED is the "Hello World" of physical computing. It shows you how to put all the pieces in place, make sure they are working, and not blow anything up (except maybe an inexpensive LED). You are also working with low enough voltage that there is no concern of physically harming yourself. Woot!

Functionally, blinking an LED is an example of digital input/output (IO). Digital IO means exactly what you might expect - there is either a signal on the line, or there is not. The opposite of a digital signal is an analog signal, in which the amount of signal on the wire can increase and decrease in any variation of steps.

> Think of digital IO as a square wave form, with analog IO being more of a sine wave.

Analog signals are very useful in sensing the physical world. You can run a current through some material, and get a varying degree of response based on environmental characteristics. Many packages will in turn wrap this in a digital signal for communication standards such as Inter-Integrated Circuit (I2C).

One such environmental characteristic that we think about almost daily is temperature. Certain materials will change their resistance based on the ambient temperature. While the study of sensing temperature can be a whole discipline unto itself, we can get started at normal room temperatures using a simple resistor called a thermistor.

![Inexpensive, durable, temperature sensing for $0.75 at SparkFun (photo source).](http://images.kevinhoyt.com/thermistor.jpg)

### Circuit Diagram

As this is an analog circuit, we will be connecting to the analog side of an Arduino Uno. We will run 5V through the thermistor, then a 10K pull-down resistor, and into ground. That really completes the circuit, but to measure the temperature we will pull a line off the junction of the thermistor and the resistor, and into an analog pin (A0 here).

![5V into the thermistor, through a pull-down resistor, and back to ground.](http://images.kevinhoyt.com/fritzing.thermistor.png)

### Arduino Uno

The readings we are going to get from the thermistor are going to be voltage levels. The Arduino Uno will give us an analog reading range of 0 to 1023, which equates to 0.0049V to 5V respectively. How do we make a voltage into a temperature? The answer is a resounding RTFM! The [data sheet](http://dlnmh9ip6v2uc.cloudfront.net/datasheets/Sensors/Temp/ntcle100.pdf) actually gives us copious numbers of formulas to use based on various situations.

Or, you know, you can copy and paste the formula like I did! But seriously, before asking questions about your hardware in an online web forum, please make an effort to read the manual. When it comes to electronics, you can learn a ton by just asserting yourself and tackling the data sheet head on.

    // http://arduino.cc/playground/ComponentLib/Thermistor2
    // Math used for formula temperature calculation
    #include <math.h>
    
    // Thermistor pin
    const int THERMISTOR = 0;
    
    // Setup serial communication
    void setup() 
    {
      Serial.begin( 9600 );
    }
    
    // Infinite loop
    void loop() 
    {
      double temperature = 0;
      
      // Get temperature using custom function
      // Send value to the serial port
      temperature = thermister( 
        analogRead( THERMISTOR ) 
      );
      Serial.println( temperature );
    
      // Wait for next sample
      delay( 500 );
    }
    
    // Called to calculate temperature
    double thermister( int analog ) 
    {
      double temp = 0;
     
      temp = log( ( ( 10240000 / analog ) - 10000 ) );
      temp = 1 / ( 0.001129148 + ( 0.000234125 + 
        ( 0.0000000876741 * temp * temp ) ) * temp );
      temp = temp - 273.15;
      temp = ( temp * 9.0 ) / 5 + 32.0;
     
      return temp;
    }
    

Load this bad boy into your Arduino, open up the serial monitor, and you will be off to the races with temperature sensing.

### Next Steps

During this post I have tried to delve a little deeper into some of the mechanics behind electronics that we can often take for granted. Analog versus digital. Using a pull-down resistor. Knowing how these things work at a lower level, as with most technology, will help you truly become proficient in electronics.

From there you can start to explore bigger questions. For example, does the thermistor heat up because of the current running through it, and does that impact the readings? How about the ambient heat from the Arduino processor? This thermistor will give you an accuracy of about +/- 3°F but what happens if you need to measure within a degree? Sub-degree? What about handing extreme temperatures?

The world of electronics is something you never truly master. There are countless questions to explore … and countless data sheets with answers.
