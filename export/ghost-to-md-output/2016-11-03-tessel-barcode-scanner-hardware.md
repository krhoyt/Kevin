---
title: "Tessel Barcode Scanner: Hardware"
slug: tessel-barcode-scanner-hardware
date_published: 2016-11-03T15:46:04.000Z
date_updated: 2019-01-17T00:46:14.000Z
tags: tessel, barcode, iot
---

In addition to the two module ports on the [Tessel](https://tessel.io/), there are also two USB ports. USB, while big and bulky in many IoT projects, can provide a useful access point to hardware. One example used by Tessel is a [web camera](https://github.com/tessel/tessel-av). Many POS (point of sale) devices are also designed to work with USB. In this post we will take a look at using a barcode scanner.

### Barcode Scanner

I got the barcode scanner I use from [SparkFun](https://www.sparkfun.com/products/9166). This scanner is tough and rubbery, like you would expect to find at a POS system in a grocery store. It supports a wide range of barcodes, and can be used as a keyboard HID (human interface device). While this is useful for GUI applications, an IoT project rarely has that luxury.

![USB Barcode Scanner](https://cdn.sparkfun.com//assets/parts/2/5/9/2/09166-03-L.jpg)

Lucky for us, this barcode scanner also supports a serial interface. This is a common communication method for USB devices (and other hardware). For example, if you debug an [Arduino](http://arduino.cc), you are using the serial interface.

To configure the barcode scanner to use the serial port, we have to reference the provided "user manual". While there is not much of a manual needed to plug in a USB device, also included is an array of barcodes used to configure the scanner.

> While I have managed to keep my manual intact for several years, I am always worried about losing it. I have scanned the manual, and you can [download](http://images.kevinhoyt.com/barcode.scanner.user.manual.pdf) it should you (or I) need it.

To configure the scanner, with it attached to any USB port (for power), scan the "PROGRAM" barcode at the top of any page, then scan the "RS-232C" barcode, and then the "END" barcode at the bottom of any page. If you are working on platforms where you need more control (stop bits, baud, etc.) then you repeat the process accordingly with the associated barcodes.

### Finding the Scanner

The Tessel documentation on using the USB ports quickly gets into all variety of native code, which is way deeper than we need to get for this application. Finding the scanner however, did take me some trial and error.

The way I went about finding the scanner is first in knowing that the Tessel runs [OpenWRT](https://openwrt.org/). OpenWRT is a Linux-based operating system. Linux systems mount serial devices as a directory inside "/dev" and usually appear as "tty" with some additional labeling.

The Node.js "fs" package allows us to get a directory listing. Without the barcode scanner attached to the Tessel, a directory listing of "/dev" will yield two "tty" endpoints - "ttyS0" and "ttyS1". Being that there are two endpoints, and two USB ports, I figured that it must be one of them.

    var dirs = fs.readdirSync( '/dev' );
    
    for( var d = 0; d < dirs.length; d++ ) {
      if( dirs[d] == 'ttyACM0' ) {
        console.log( 'Found barcode scanner.' );
        break;
      }
    }
    

While I was able to connect to both endpoints from Node.js on the Tessel, neither provided any output. Then I connected the barcode scanner and ran the directory listing again. This time a "ttyACM0" appeared. When I tested that endpoint, I was able to get data from the scanner. We are in business!

### Serial Ports

The go-to package for serial port communication with Node.js is [Node Serialport](https://github.com/EmergingTechnologyAdvisors/node-serialport). Because some compilation is generally needed for Node Serialport, I was concerned at first that it would not work on the Tessel. To my delight, it just worked.

    // Open barcode scanner serial port
    // Use carriage return for terminator
    var port = new SerialPort( '/dev/ttyACM0', {
      parser: SerialPort.parsers.readline( '\r' )
    } );
    
    port.on( 'open', function() {
      // Debug
      console.log( 'Port connected.' );
    } );
    
    // Barcode scanned
    port.on( 'data', function( data ) {
      // Buffer to string
      var barcode = data.toString().trim();
        
      // Debug
      console.log( barcode );
    } );
    

The first step to using Node Serialport is to open a connection to the port. The barcode scanner will provide a carriage return when a barcode value has been read, so we additionally tell Serialport to look for that signal.

When a barcode is read (or really any serial communication with a carriage return), the "data" event will be emitted. Not all serial systems speak character data, so the "data" property is a [Buffer](https://nodejs.org/dist/latest-v4.x/docs/api/buffer.html) object. In this case, we want the string value without the carriage return.

### Next Steps

That is it! Now you have a Tessel that can scan barcodes. While I have my scanner looking for one barcode per trigger pull, you can even configure the scanner for continuous scanning. This might be useful in a production setting for fast, repeated, scanning.

Other POS devices that speak serial over USB includes magnetic card readers. The reader on SparkFun does not have a USB port, but you can find various options around the Internet. With a little more work, you could build your very own, custom, POS system using a Tessel.

Getting the barcode value is useful, but it would be even better to find the product that barcode belongs to an take some action such as manage inventory in a database. I will cover barcode lookup, and communication to other services, in my next post.
