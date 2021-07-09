---
title: Tessel I2C Climate
slug: tessel-i2c-climate
date_published: 2016-09-12T17:52:57.000Z
date_updated: 2016-09-12T17:52:57.000Z
tags: tessel, i2c, climate
---

The Tessel is expandable in several ways. One of those ways is pre-built modules. And one of those modules is called the "climate" module. This is effectively the Silicon Labs Si7020 temperature and humidity sensor. And for whatever reason, on the Tessel, it is horribly inaccurate.

### Heat

The general explanation found around the community is that the proximity to the processors on the Tessel generates enough heat to throw off the temperature of the climate module (Si7020). Some folks have had slightly better results by wiring the module to be several inches away from the Tessel.

![Tessel Climate Module wired to be away from the Tessel itself.](http://images.kevinhoyt.com/tessel.climate.wires.jpg)

Now I will admit that there is always heat from processors to be considered, but we are talking an error in the range of ten degrees fahrenheit. I have even run a small fan over the Tessel to try and balance out the temperature reading, with little reproducible success.

At some point you start suspecting the implementation itself. Wether there is a component on the PCB that should be at a different value, or perhaps the parsing of data from the sensor is wrong. To put this to the test, I used one of my favorite climate sensors - HIH6130 - on the Tessel. I even placed right next to the Tessel, the results were every bit as accurate as I had come to expect - within a single degree of the surrounding area (tested via IR).

![HIH6130 from SparkFun](https://cdn.sparkfun.com//assets/parts/6/9/6/9/11295-01.jpg)

### I2C

This post is not all rant though. I actually thoroughly enjoyed the process of testing everything. What is more, is that I learned how to implement a custom I2C sensor on the Tessel!

I2C is a communication protocol for microcontrollers. Each controller on the bus can be individually addressed, saving you valuable pins. A series of bits will be sent on the bus, to a specific sensor, and will generally be interpreted as a command.  The sensor will then perform some operation, and respond with a series of bits.

While the communication between controller and device is standardized, the formats of the commands and messages are not. You will often find vendors that claim I2C, only to be ever so slightly different. The good news is that the HIH6130 is I2C, so we just need to know how to send a command, and parse the response.

### Command

I2C implementations will need four pins. There is the power and ground connections, and then a data line and a clock line. Since we are working in at very low levels, and extremely fast, the clock line keeps everything in sync. The commands and messages flow on the data line.

The Tessel has the data (SDA) and clock (SCL) lines clearly marked on the breadboard.  With everything connected, we are looking at (BOB to Tessel):

- GND to GND
- VDD to 3V3
- SCL to SCL 0
- SDA to SDA 1

In our JavaScript code for the Tessel, we first need to get a reference to the I2C system. The default address of the HIH6130 (per the documentation) is 0x27, and the sensor is wired up on Port B of the Tessel.

    // Sensor
    // Default address
    hih = tessel.port['B'].I2C( 0x27 );
    

The Tessel takes care of the low-level I2C implementation, but the format of the data is up to us. This means getting really comfortable with several areas. The first is the documentation for the sensor you are using. The next is understanding bits and bytes (such as LSB/MSB, endianness). Finally, you have to shift those bits around in JavaScript to actually get some data.

When it comes to the HIH6130, there are several commands we can send to the sensor. [Peter Anderson](http://www.phanderson.com/arduino/I2CCommunications.pdf) has the data sheet on his web site, which is the resource I found most useful in this experiment. The command to read the temperature and humidity breaks down something like this:

- Two bytes (eight bits)
- Address of 0x27 (seven bits, 0010 0111)
- Read command of 1 in last bit
- 1010 1111 becomes 0x4F in hex

To issue the command to read the climate values then, we want to send 0x4F using a Buffer object, which will keep our bits intact. We also tell it how many bytes we are expecting in return, and supply a function to parse that data.

    hih.transfer( 
      new Buffer( 0x4F ), 
      4, 
      function( error, data ) { ... } 
    );
    

That all sounds great, and technically impressive. The reality of the matter is that it did not seem to matter what I sent the sensor, it always replied with the climate readings. The difference is lost in the ether between the Tessel JavaScript commands, and how the Tessel actually maps that to I2C.

### Response

If you thought the value we are sending over to the HIH6130 as a command was black magic, it does not get much better on the response.

Temperature and humidity are crammed into 14 bits each, for a total of 28 bits, or 3.5 bytes. We are not going to deal with half a byte here, so we request a full four bytes. Then, get this, we throw away last two bits of the response. That is what the documentation actually says to do. Why 14 bits for each value? Could they not just make it easy, and have 16 bits each?

> Welcome to the land of I2C.

This means that for each value, temperature and humidity, we are working with seven bits of the first byte, then the whole byte for the second. Then we have to cram them together to get a float value.

That is not all either. Once we have the values, they are not representative of any actual temperature scale (celsius, fahrenheit). From there we get to perform math with seemingly totally random values. For example, the temperature value needs to be multiplied by 165, and then 40 needs to be subtracted from the result. What?!

    var raw_humidity = null;
    var raw_temperature = null;
    
    if( !error ) {
      // First two bytes for humidity
      // In the range ( 2^14 - 1 )
      raw_humidity = ( ( data[0] & 0x3f ) << 8 ) | data[1];
      humidity = raw_humidity / 16382;
    
      // Second two bytes for temperature
      // In the range ( 2^14 - 1 )
      // Multiply by 165 and subtract 40
      // Because that is what the documentation says
      raw_temperature = ( ( data[2] << 8 ) | data[3] ) >> 2;
      temperature = ( raw_temperature / 16382 ) * 165 - 40;            
            
      console.log( temperature );
      console.log( humidity );
    } else {
      console.log( error );
    }
    

I would love to tell you that this is where I stuck it out. Where everything came together. That the documentation was so clear that I was on my way in no time. The reality is that I banged bits around for hours, referencing various Arduino implementations along the way (most of which worked completely different from one another, or the documentation). So goes adventures in managing low-level I2C communication.

### Next Steps

I am generally a very mellow person, open to spending numerous hours pushing through experiments like this. If my tone comes across as bitter at times for this project, I suppose, it is a little. Black magic in programming is the worst.

In the end, I have a highly accurate climate sensor, and I am very excited by that. I have since gone on to experiment with sampling rates against the HIH6130, and sending the results to Watson IoT for storage and analytics. Next up is to put the sensor on a custom module.
