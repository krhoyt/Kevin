---
title: First Steps with Intel Edison
slug: first-steps-with-intel-edison
date_published: 2015-05-12T22:26:15.000Z
date_updated: 2015-06-05T16:34:49.000Z
tags: iot, kaazing, cross, barcode, intel, edison
---

*There are a lot of SoC (System on a Chip) devices out there these days.  I have written about the Arduino Yun in the past.  Today I would like to introduce you to the Intel Edison.  At about the quarter of the size of a credit card (35.5mm x 25mm), this little piece of kit packs a lot of punch in a low power footprint.*

---

This is reposted on the [Kaazing Open Source Blog](http://kaazing.org/blog/first-steps-with-intel-edison/).

As the name implies, the Intel Edison includes a dual-core Intel Atom processor, as well as both Wi-Fi and Bluetooth LE radios.  It has a tiny 70-pin connector, which is designed to be mated with other Intel Edison "blocks".  Much in the same fashion as you would stack "shields" on an Arduino.

![Intel Edison - photo courtesy SparkFun](http://images.kevinhoyt.com/sparkfun.intel.edison.jpg)

Having mentioned Arduino, many of the Intel Edison tutorials talk about using a "breakout kit", which makes it more compatible with Arduino.  The first steps outlined in this post assume you have the Intel Edison board, and the [SparkFun Base Block](https://www.sparkfun.com/products/13045).  No Arduino compatibility needed here.  We are going to tap directly into the Yocto Linux image on the Intel Edison.

![SparkFun Base Block - photo courtesy SparkFun](http://images.kevinhoyt.com/sparkfun.edison.base.block.jpg)

What follows is an explanation of the commands I use to configure and use the Intel Edison in my projects.  The commands have been taught to others as well, which has led to further refinements.

While labeled **"First Steps"** a better title might be **"Build a Real-Time Internet-Connected Barcode Scanner."**  That is the first project I set out to implement on the Intel Edison, so the vast majority of these notes come from that discovery process.  I will refer to that project throughout, but will not spend much time talking about the code proper.

> As with most of my blog posts, you can get the code for an Internet-connected barcode scanner (and much more) from my personal [GitHub repository](https://github.com/krhoyt/Kaazing/tree/master/iot/stores).

### Getting to Know You

The main parts to know about the Intel Edison at this point are the two USB-mini ports mounted at the edge.  One is labeled "console" while the other is labeled "OTG".  We will talk more about what that means in a moment, but as you might have guessed, you will in turn need two USB-mini cables to make the most of this tutorial.

The "console" USB port is a TTY port.  This port effectively powers the Intel Edison.  While getting started, this gives you a way to log into Yocto Linux.  Once you have your Edison configured however, you will likely just use this port for power, and SSH into the Edison.

> If you want the Edison to run on its own, without a cable for power, SparkFun makes a [Battery Block](https://www.sparkfun.com/products/13037) as well.

The other USB port is labeled "OTG".  This stands for USB "on the go" which is a formal part of USB.  For the purposes of my barcode scanner project, this effectively translates into "A USB port I can plug devices into, and have them exposed to the Linux OS."  There is more to OTG, most notably that it can be a hub as well, but that is beyond the scope of first steps.

### House Cleaning

Plug your two USB micro cables into to two ports on the Intel Edison.  Then plug the cable in the "console" port into the USB port on your computer.  You should see the Edison turn on a blue LED.  Now connect the other cable into another USB port on your computer.  You should see the Edison mount itself as a drive on your system.

The first step here is to get rid of the existing content on the Intel Edison, and the latest Yocto image.  You can download the latest from the [Intel web site](https://software.intel.com/en-us/iot/hardware/edison/downloads).  You will be looking for the "Intel Edison Board Firmware Software" section, and downloading the "Yocto Complete Image".  At the time of this writing, that was Release 2.1.

At first run, you probably will not have any files on the Edison when mounted as a USB drive.  I still like to check, and even run the following commands just to be sure there are no hidden files lying around.  We want this area to be nice and tidy for our next step.

    cd /Volumes/Edison
    rm -rf *
    rm -rf \.*
    

Now unzip the the Yocto image you downloaded from the Intel web site into a folder.  Copy the contents of that folder into the root directory of the Intel Edison USB drive.  When we reboot the Intel Edison in a moment, it will then look into that space for a new Yocto image, and use those files.

To reboot the Intel Edison, we first have to connect to the existing Yocto image.  We can do this using the TTY USB cable.  First we need to know how to address the Edison.  Then we will use the "screen" command to log into the Edison.  Then we will tell the Edison to reboot - and we get to watch the screen fill up with information as it goes along.

    ls /dev/tty.*
    <My Edison is DA01G6Q8 - yours may be different>
    screen /dev/tty.usbserial-DA01G6Q8 115200 -L
    <Enter again>
    <Login: root>
    <There is no password>
    reboot ota
    

When all the updating is finished, with Release 2.1 you should have a Yocto 1.6.1 image, which should be told to you when you are prompted to log back into the device.  If you see something less, then the process did not complete successfully.  This has randomly happened to me before when not all the image files were copied.  Try the commands again from the top, making sure that everything is copied (or downloaded in the first place).

### Configuration

Before disconnecting anything, and while still logged in via the "screen" command from the previous step, you will want to run the Intel Edison configuration utility.  This utility will put a password on the device, give it a host name, a get the board connected to wi-fi among other things.  Complete all the steps.  It is the "other things" you do not see or get prompted for that are important - such as enabling SSH.

    configure_edison --setup
    

If your computer and your Intel Edison are on the same network, you can now check to see that your Edison is ready by loading the hostname in a browser.  For example:

    http://kedison.local/
    

Where I named my Intel Edison "Kedison".  Some browsers are more finicky than others about hostname access, so I suggest entering the full "http" qualifier and the trailing "/" until you know how your browser will react.  If everything has gone correctly, then you will see a web page with information about your Intel Edison.

![Intel Edison device information page.](http://images.kevinhoyt.com/intel.edison.device.information.jpg)

You can now type "exit" into your Intel Edison to logout.  Then to exit the screen program type Ctrl+A and then D.  From here on out we will SSH into our Edison.  If you have already accessed your Edison via SSH, then you will need to edit ~/.ssh/known_hosts and remove the Edison line first.

    <Remove previous if needed>
    nano ~/.ssh/known_hosts
    

    ssh root@kedison.local
    <Password you used during configuration>
    

You may also want to head back over the the Edison mounted as a USB drive and remove the image files.  You can do this via a GUI or command line as above.  If you are doing this from a GUI, then do not forget to empty your trash to actually remove the files from the USB drive storage space.

As you may have noticed from the commands above, I like to use Nano as my editor.  If you have that preference as well, you can use the following command to install Nano on your Intel Edison.

    wget http://www.nano-editor.org/dist/v2.2/nano-2.2.6.tar.gz && tar xvf nano-2.2.6.tar.gz && cd nano-2.2.6 && ./configure && make && make install
    

Finally, to communicate with Kaazing Gateway, I will be using the Java client libraries.  I will also be using Java to access the USB serial port of the Intel Edison, and interact with the barcode scanner.  That means I need to have Java installed.  If you prefer something else, Python is already installed, as is Node.JS version 0.10.35.

To get a JRE (Java Runtime Environment) installed, first head on over to the [Oracle website](http://www.oracle.com/technetwork/java/javase/downloads/index.html) and download the appropriate JRE build.  Note that you are specifically looking for a JRE here, not a JDK (Java Development Kit).  You are looking for Linux x86 in a gzip format.  I downloaded "jre-8u45-linux-i586.tar.gz".  Unfortunately, I cannot provide a direct link since a license agreement must first be accepted.

To copy the compressed JRE from my Mac to the Intel Edison I used SCP.  If you have another tool you prefer, you can use that as well.  This is not the USB drive (as with the Yocto image), but rather moving a file over to a place on the OS.  The "/home/root" is the root users home directory.  Then logged back into the Edison, we can use "tar" to unpack the JRE.

    scp ~/Desktop/jre-8u45-linux-i586.gz 
      root@kedison.local:/home/root/jre-8u45.gz
    tar xvf jre-8u45.gz
    ln -s jre1.8.0_45/bin/java java
    

The last command there creates a symbolic link to the Java binary.  It is not necessary, but makes life a little easier when you are running Java commands from various places on the OS.  From here you might remove the compressed JRE file, as well as the compressed Nano file if you have not already.  Again, not necessary, but keeping a clean house make life easier.

### Barcode Scanning

At this point, your Intel Edison is ready to go.  We have the latest image, connected to the Internet, and put some basic tooling in place.  You can now start building the IoT (Internet of Things) project of your dreams.  While not the project of my dreams, I have had a barcode scanner I have been wanting to use in a project for some time.

The [barcode scanner](https://www.sparkfun.com/products/9166) I picked up from SparkFun has a USB cable attached to it.  The scanner also comes with a User's Manual guide which has barcodes all over it.  These barcodes can be scanned using the scanner to configure how it operates.  There are many changes you can make, but I just set it to RS-232, which allows me to access the scanner as a serial port.

![Barcode scanner - photo courtesy SparkFun](http://images.kevinhoyt.com/sparkfun.barcode.scanner.jpg)

To configure the scanner, plug it into your computer (not the Intel Edison).  This gives the scanner power.  Then scan the "PROGRAM" barcode at the top of any page.  Next scan the "RS-232C" barcode.  It may take some practice to get your aim down.  On the page labeled "RS-232C interface" scan the "Baud rate" setting to 9600.  Then to finish, scan the barcode labeled "END" at the bottom of any page.

[![Download the user manual](http://images.kevinhoyt.com/barcode.scanner.user.manual.jpg)](http://images.kevinhoyt.com/barcode.scanner.user.manual.pdf)

With your scanner configured, remove it from your computer.  Since the OTG port on the Intel Edison is of the micro variety, we need an adapter.  I picked up an [USB OTG Cable](https://www.sparkfun.com/products/11604) from SparkFun for this purpose.  Connect the USB-A end of the scanner cable to the matching end of the USB OTG cable.  Then plug the micro end of the USB OTG cable into the OTG port on the Intel Edison.

![SparkFun OTG Cable](http://images.kevinhoyt.com/sparkfun.usb.otg.jpg)

Yocto has a number of mappings for serial ports, but the USB OTG will surface as "/dev/ttyACMO".  You can use the "cat" command to see if the barcode scanner is attached in RS-232 mode and working correctly.  Pick up a DVD or CD nearby and scan away.  You will see the barcode appear in the Intel Edison console.

    cat /dev/ttyACM0 9600
    

With my Java-based barcode scanning application bundled up as a JAR file, I copied it over to the Intel Edison using the SCP command from above.  Then using the Java binary I can run the program on the Edison.  This program runs the barcode against Amazon to get a price and image for the item scanned.  That information is then passed to Kaazing Gateway, where any client listening for those messages can pick them up and process them.

![Mobile browser shopping cart.](http://images.kevinhoyt.com/kaazing.iot.stores.ios.png)

I built a simple web client using the JavaScript library from the Kaazing Open Source blog.  The web client shows the price and image in a shopping cart on the device.  The web client works on the desktop, but also on mobile browsers.  In a future post, I will detail how Java connects to the scanner, retrieves information from Amazon, and sends messages, as well as how the web client works.

### Next Steps

The Intel Edison is a really powerful little computer.  It lends itself to many applications where a SoC is preferred (e.g. running applications on an OS).  This post gives you all the details you need to get started and talks about using a barcode scanner.  There are many other USB possibilities to be had though.  I would encourage you to explore the Edison using your own USB device and language of choice.
