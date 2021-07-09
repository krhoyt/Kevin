---
title: LightBlue Bean to IBM Cloud
slug: light-blue-bean-to-ibm-cloud
date_published: 2017-10-13T15:07:05.000Z
date_updated: 2019-01-17T00:33:45.000Z
tags: watson, iot, bluetooth, bean, cloud
---

The LightBlue [Bean](https://punchthrough.com/bean), by Punch Through, is one of my favorite IoT development platforms. The Bean has many parts, including an iOS application called the [LightBlue Explorer](https://itunes.apple.com/us/app/lightblue-explorer-bluetooth-low-energy/id557428110?mt=8), that lets you view and control nearby Beans. The gang over at Punch Through recently added the ability for the Explorer application to send Bean data to [cloud services](https://punchthrough.com/blog/posts/introducing-cloud-connect-for-lightblue-explorer). Unfortunately, IBM was not included, so what follows is how to do Bean to IBM Cloud connectivity via iOS.

#### Bean

The Bean is a [BLE](https://en.wikipedia.org/wiki/Bluetooth_Low_Energy) development platform. As such it sports a BLE stack. You program the Bean via an [Arduino](https://www.arduino.cc/)-compatible workflow. Various features of the BLE stack are exposed to your Arduino program via an [API](https://punchthrough.com/bean/reference). As the Bean also has an accelerometer, temperature sensor, and RGB LED, the API also exposes those details to your Arduino program.

    // Reporting rate
    unsigned long last = 0;
    int rate = 1000;
    
    // Setup
    void setup() {
      // Make sure LED is off
      // Save battery
      Bean.setLed( 0, 0, 0 );
    
      // Deep sleep until needed
      Bean.enableWakeOnConnect( true );
    }
    

As we look at the "setup" function, we can see that there really is not much going on. I use the Bean API to turn off the LED. Then I tell the Bean wake up when a device is connected.

We will be reporting data on a regular basis. I do not want to put the Bean to sleep during that, nor do I want the Arduino to block execution of BLE communication, so I am using the tried and true method of counting ticks from the clock.

    // Loop
    void loop() {
      unsigned long now = 0;
      uint8_t scratch[20];
      
      // Connected to a device
      if( Bean.getConnectionState() ) {
        // Show connection
        Bean.setLed( 0, 255, 0 );    
        
        // Get clock
        now = millis();
        
        // Check timer
        if( ( now - last ) >= rate ) {
          // Update clock
          last = now;
          
          // Set sensor values
          output();      
        }
      } else {
        // Nobody connected
        // Turn off LED
        Bean.setLed( 0, 0, 0 );    
        
        // Deep sleep
        Bean.sleep( 0xFFFFFFFF );   
      }
    }
    

As the Bean enters the "loop" function, a call to "Bean.getConnectionState()" reveals that no devices are currently connected, so "Bean.sleep( 0xFFFFFFFF )" is called to power down the ATmega until a device connects. The "Bean.sleep()" call takes a number of milliseconds, but if you pass "0xFFFFFFFF" the Bean will sleep indefinitely - in this case, until a device connects.

Once a device, like the iPhone, connects, the Bean springs to life. To show connectivity, I set the on-board RGB LED to green. Next, we start watching ticks from the clock to report sensor data at a one second interval (1000 ms). Then we call an "output()" function to actually report the data.

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
    
      // Put string into scratch format
      for( int i = 0; i < strlen( content ); i++ ) {
        scratch[i] = content[i];
      }
    
      // Set scratch data for various sensors
      Bean.setScratchData( 1, scratch, strlen( content ) );
    }
    

The Bean API exposes "scratch" data areas - also known as characteristic data. You can put a finite amount of data into these areas - 20 whole bytes. In this case, that is enough room. The side effect is that the connected device (iPhone for example) can ask to be notified when scratch data changes.

There are a few different ways to shove four numbers into bytes, but I like "sprintf()" to make a CSV string. That makes it easy to deal when it gets to the device. There are multiple scratch data areas on the Bean, but it all fits in one, so one will do here.

> Architecturally, I suppose putting each of the four values we want to have reported to the connected device, into their own scratch areas would be more sound. But that makes for more code on the device, and as a lazy programmer, why do four times, what you could do once?

That is all the code for the Bean. From here, we power up the Bean, connect to it using the "[Bean Loader](https://punchthrough.com/bean/docs/guides/getting-started/os-x/)" tool, compile the Arduino code, and upload it to the Bean. Once there, the Bean will go to sleep, and wait for a device to connect.

#### iOS (Swift 3)

The semantics of connecting a BLE device to iOS is easily, far and away, the single most popular [post](http://www.kevinhoyt.com/2016/05/20/the-12-steps-of-bluetooth-swift/) on my blog. There are a lot of little nuances to BLE, and it does not help that Apple keeps changing the CoreBluetooth interface. I will not repeat all of that information here, just the pertinent bits.

    // Data arrived from peripheral
    func peripheral(
      _ peripheral: CBPeripheral, 
      didUpdateValueFor characteristic: 
      CBCharacteristic, error: Error?) {
        
      // Make sure it is the characteristic we want
      if characteristic.uuid == BEAN_SCRATCH_UUID {
        // Get bytes into string
        let content = String(
          data: characteristic.value!, 
          encoding: String.Encoding.utf8
        )
          
        // Formalize
        let reading = Reading(raw: content!)
    
        // Delegate
        delegate?.didGet(reading: reading)
      }
    }
    

When the Arduino code on the Bean updates the specified characteristic data (scratch), the iPhone is notified. The data comes across as bytes, which I format back into the CSV string that was sent over. Then I pass the CSV string onto a value object where it is parsed, and various convenience methods are exposed (temperature in fahrenheit or celcius as an example).

> To keep the nightmare of interfaces that need to be implemented for "CBCentralManagerDelegate" and "CBPeripheralDelegate" out of my view controller, I have wrapped all the pertinent BLE bits into a class all their own, with a single, concise delegate method.

#### Cloudant

[Cloudant](http://cloudant.com), [CouchDB](http://couchdb.apache.org/) on IBM Cloud, is a document store. It conveniently aligns CRUD operations with HTTP verbs. This means that there is no "driver" or special protocol that your application needs to know. If you are working on a device that supports HTTP, then you can store data in the cloud. iOS speaks HTTP.

    func save(reading:Reading) {
        
      // Authentication
      let user_pass = "\(self.key):\(self.password)".data(using: .utf8)
      let encoded = user_pass!.base64EncodedString(options: Data.Base64EncodingOptions.init(rawValue: 0))
      let authorization = "Basic \(encoded)"
    
      // Build request
      let url = URL(string: "https://\(account).cloudant.com/\(database)")
      var request = URLRequest(url: url!)
      request.httpMethod = "POST"
      request.addValue("application/json", forHTTPHeaderField: "Content-Type")
      request.addValue(authorization, forHTTPHeaderField: "Authorization")
      request.httpBody = reading.json();
        
      // Make request
      // Handle response
      URLSession.shared.dataTask(with: request) { (data, response, error) in
        if error != nil {
          debugPrint(error!)
        } else {
          do {
            let json = try JSONSerialization.jsonObject(with: data!) as! [String:Any]
          } catch {
            debugPrint(error)
          }
        }
      }.resume()
    }
    

Making an HTTP request to Cloudant using Swift take a few steps. The first step is to Base64 encode the username and password pair, and to send them as "Basic Auth". Creating a document is a POST operation, and we will be sending the document to store as a JSON string. Then we use URLSession to fire off the request. The response is a pretty slender JSON string that includes the "id" of the created document.

> Cloudant has a "Permissions" feature that allows you to generate additional key/token combinations for API access with various rights. Do not send your Cloudant administrator username/password.

Wait. What? Just an HTTP request to work with the database? Yup! that was easy, right? Perhaps we should go for a bonus round!

#### Watson IoT

Another common endpoint for IoT data on IBM Cloud is [Watson IoT](https://www.ibm.com/internet-of-things/platform/watson-iot-platform/). At its core, Watson IoT is an MQTT broker (MQTT being created, and largely [maintained](http://www.eclipse.org/paho/), by IBM). MQTT is now a nearly de facto standard for IoT devices. This particularly application however, is just publishing data. We do not really need to subscribe to any topics. As it turns out, Watson IoT also supports an HTTP interface to publish device events.

    func publish(reading:Reading) {
        
      // Authentication
      let user_pass = "\(self.username):\(self.password)".data(using: .utf8)
      let encoded = user_pass!.base64EncodedString(options: Data.Base64EncodingOptions.init(rawValue: 0))
      let authorization = "Basic \(encoded)"
        
      // Build request
      let url = URL(string:
        "https://\(organization).\(host):\(port)" +
        "/api/v0002/application/" +
        "types/\(device_type)" +
        "/devices/\(device_id)" +
        "/events/\(event)"
      )
      var request = URLRequest(url: url!)
      request.httpMethod = "POST"
      request.addValue("application/json", forHTTPHeaderField: "Content-Type")
      request.addValue(authorization, forHTTPHeaderField: "Authorization")
      request.httpBody = reading.json();
        
      // Make request
      // Handle response
      URLSession.shared.dataTask(with: request) { (data, response, error) in
        if error != nil {
          debugPrint(error!)
        }
      }.resume()
    }
    

This is almost identical to the Cloudant example, just with a few nuances in terminology.

- Within Watson IoT, you device categories of devices that will be connecting - this is the "device type".
- Each device in that category gets its own ID (as well as security token) - this is the "device ID".
- A device can trigger an "event" when it has something to report. This can be named whatever you want, and generally incorporated into the MQTT topic string.
- The "username" and "password" here are keys generated for applications to access Watson IoT as though they were devices.

Knowing the terminology, and where to put them, makes all the difference in using Watson IoT.

#### Next Steps

There are a lot of other services on IBM Cloud that support an HTTP interface, and that could be useful in this scenario. One example that comes to mind, and that is growing in relevance for IoT architectures, is [Kafka](https://kafka.apache.org/). Kafka on IBM Cloud is called "[Message Hub](http://www-03.ibm.com/software/products/en/ibm-message-hub)". I think that would make an interesting next step.

Connecting to Watson IoT over MQTT is possible of course, so I should probably update the application to provide for programmatic channel selection. If you want to see the code in its entirety, or just grab snippets for your own application, check out the [GitHub repository](https://github.com/krhoyt/IBM/tree/master/iot/bluetooth/cloud) for this project.
