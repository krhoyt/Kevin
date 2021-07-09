---
title: Discovering Beacons (Swift)
slug: discovering-beacons-swift
date_published: 2016-05-23T15:56:17.000Z
date_updated: 2016-05-23T15:56:17.000Z
tags: swift, ble, bluetooth, beacon
---

When it comes to Bluetooth Smart (often called Bluetooth Low Energy, Bluetooth LE, or just BLE), there is a lot for a developer to like.  Long battery life, connectivity without crazy pairing processes, and of course the beacon profile.  This is a quick overview of how your iOS application can detect beacons.

### Profiles and Modes

When it comes to Bluetooth LE, devices will be in one of two different states.  The first state is called "connected" or "normal".  This is a one-to-one communication state between the BLE device, and your smartphone (or other device).  This mode is commonly found in consumer BLE devices such as heart rate monitors.

The other mode is called "advertising" mode, and is generally the backbone of how beacons work.  In advertising mode, a BLE device sends out three key pieces of information for your application to leverage.  This is a many-to-many mode of operation.  The pieces of information are:

- **UUID** - This is how you look for and get notifications in your application, for your specific beacon.  The most common way to think about UUID in a beacon setting is that it is roughly analogous to your brand.
- **Major** - This is a number consisting of two bytes, and is roughly analogous to a store for a specific brand.
- **Minor** - Another number with two bytes will specify a specific shelf or location within a store.

The analogies made here of brand, store, shelf, are just a way to think about how to choose and assign these pieces of information.  There is no hard rule that says you have to use them in this fashion.  UUID will generally be consistent within a set of set of BLE devices used for a specific application.  After that, you can use major and minor to describe whatever is appropriate for your application.

### (1) Core Location

When you connect to a BLE device in the "connected" mode, you use Core Blueooth.  Beacons are considering an extension of location - indoors.  As such, beacons fall under Core Location on iOS.

    import CoreLocation
    

### (2) Delegate

You will want your application to be notified when a beacon is discovered.  Like most event-driven APIs in iOS, this means you will need to implement a delegate.  For beacons, as a location service, you will need to implement CLlocationManagerDelegate.

    class ViewController: UIViewController, CLLocationManagerDelegate {
    
      // Teh codez
    
    }
    

### (3) Brand and UUID

Most beacons will allow you to set the UUID you want to use, that works for your application, in some fashion of management console.  Your iOS application will want to know this value.  You will also define a "brand identifier" which I have never used outside of the fact that Core Location seems to want one.

    let BRAND_IDENTIFIER = "com.ibm"
    let BRAND_UUID: String = "A495DE30-C5B1-4B44-B512-1370F02D74DF"
    

### (4) Region and Manager

Specifying what beacons to look for is called a "region" in iOS.  You create a beacon region, and assign it to a Location Manager instance.  These are values we will want to have around, so declare them with a broad scope visibility.

    var beaconRegion: CLBeaconRegion!
    var locationManager: CLLocationManager!
    

### (5) Create the Manager

I generally instantiate my Location Manager instance in "viewDidLoad".  It does not take any arguments at this point, you just instantiate the instance.  We will strap on additional details in a moment.

    override func viewDidLoad() {
      locationManager = CLLocationManager()
      locationManager.delegate = self  
    }
    

Note that the delegate is assigned to "self" which is why we have implemented the CLLocationManagerDelegate on the view controller.

### (6) Request Authorization

In order to use location features of iOS, you must first ask the user for permission.  This is one of those steps that can really trip you up if you are not careful.  You will run your application, and it will run without a problem, but beacon ranging simply will not do anything.  You will scratch you head, set breakpoints everywhere, look hard, and find nothing.

    override func viewDidLoad() {
      locationManager = CLLocationManager()
      locationManager.delegate = self
    
      locationManager.requestWhenInUseAuthorization()
    }
    

You can also check to see if the application already has been given access, or if the user has declined access, and prompt again.  For brevity, I use the one-liner above, but it is worth spending some time here to make sure you check/catch authorization.

> Even without checking, this one-liner will only prompt the user one, regardless of how often it is executed.  iOS will just check the system to see if it has authorization.  If it does, it will just move on.

The other part of this, that does not show up in code, is an additional property that must be specified in your "Info.plist" file.  The property is "" which is a string, and you can set it to whatever you want.  That string will be presented to the user when they are prompted for authorization.  You will want to use verbiage here that encourages the user to agree to access to location.

### (7) Region

Up next we will instantiate the beacon region we are interested in monitoring.  This is where that UUID and brand identifier come into play.

    override func viewDidLoad() {
      locationManager = CLLocationManager()
      locationManager.delegate = self
    
      locationManager.requestWhenInUseAuthorization()
    
      let uuid = NSUUID(UUIDString: BRAND_UUID)
      beaconRegion = CLBeaconRegion(
        proximityUUID: uuid!, 
        identifier: BRAND_IDENTIFIER
      )
      beaconRegion.notifyOnEntry = true
      beaconRegion.notifyOnExit = true
    }
    

Core Location gives you methods to implement for notifications when the phone enters or leaves a specific region.  In my experience, these methods are called sporadically, so I generally do not implement them.  You need to specify "true" for the notifications, but you do not need to implement the respective methods.

### (8) Monitoring

Up next we tell the iOS to start looking for beacons.  If you have done everything correctly up to this point, iOS will start the magic of finding beacons.

    override func viewDidLoad() {
      locationManager = CLLocationManager()
      locationManager.delegate = self
    
      locationManager.requestWhenInUseAuthorization()
    
      let uuid = NSUUID(UUIDString: BRAND_UUID)
      beaconRegion = CLBeaconRegion(
        proximityUUID: uuid!, 
        identifier: BRAND_IDENTIFIER
      )
      beaconRegion.notifyOnEntry = true
      beaconRegion.notifyOnExit = true
    
      locationManager.startMonitoringForRegion(beaconRegion)
      locationManager.startRangingBeaconsInRegion(beaconRegion)
    }
    

### (9) Did Range Beacons

When beacons with the specified UUID are discovered, the "didRangeBeacons" method will be called by iOS.  Keep in mind that more than one beacon may be present, and reported.

    func locationManager(
      manager: CLLocationManager, 
      didRangeBeacons beacons: [CLBeacon], 
      inRegion region: CLBeaconRegion) {
    
      if beacons.count > 0 {
        // Beacons found
      } else {
        // No beacons found
      }
    }
    

When the iOS device leaves the beacon range, the "didRangeBeacons" method will be called as well.  It is important then to catch that situation, and adjust the user interface as needed.

### (10) How Close?

While beacons do not give you specific distances, they do present a value called RSSI (Relative Signal Strength Indicator).  iOS abstracts this value into a series of constants on the CLPromitity class.  You can then in turn determine which beacons are closest and take whatever action your application requires.

    func locationManager(
      manager: CLLocationManager, 
      didRangeBeacons beacons: [CLBeacon], 
      inRegion region: CLBeaconRegion) {
    
      if beacons.count > 0 {
        for beacon:CLBeacon in beacons {
          if beacon.proximity == CLProximity.Far {
            // Far away, whatever than means
          } else if beacon.proximity == CLProximity.Near {
            // Getting closer
          } else if beacon.proximity == CLProximity.Immediate {
            // Right on top of the beacon
          }
        }
      } else {
        // No beacons found
      }
    }
    

The values of "Far", "Near", and "Immediate" are pretty arbitrary.  In my testing, "Far" is about the last couple of feet of the beacon range (which may vary depending on how the radio is set on your beacon).  "Near" seems to be a broad range somewhere between a foot away from the iOS device, up to around three feet away.  "Immediate" seems to match when the iOS device is literally right next to the beacon - within inches.  YMMV.

### Next Steps

That is all there is to it.  While it looks like a lot of work, once you put it into your code, you will find that you can get going very quickly.  From here you might want to invoke a REST call to a service to store the fact that the device encountered the beacon.  Or you might track the time a device spent near the beacon.  The possibilities are endless.
