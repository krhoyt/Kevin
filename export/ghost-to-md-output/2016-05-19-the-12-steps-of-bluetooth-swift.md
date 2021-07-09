---
title: The 12 Steps of Bluetooth (Swift)
slug: the-12-steps-of-bluetooth-swift
date_published: 2016-05-20T00:59:14.000Z
date_updated: 2017-10-12T18:05:26.000Z
tags: swift, ble, bluetooth
---

There are a lot of tutorials out there for using Bluetooth (Low Energy) on iOS.  Many of those are written using Swift.  Some of them cover the mechanics of Bluetooth, while others focus on just the code.  This post will definitely be of the later variety.

Why this post if it is already thoroughly covered in other areas?  Mostly because I recently ran across I project on which I needed BLE, had to really get my head around it, and now want to write it down in case I need it again.  And, hey, maybe it will be valuable to others.

> While the process is the same, the interface to the CoreBluetooth API changes with pretty much every new version of Swift. As of Oct 2017, a version using Swift 3 can be found on my IBM GitHub [repository](https://github.com/krhoyt/IBM/blob/master/iot/bluetooth/cloud/ios/Bean/Bean.swift).

### (1) Import

Unlike beacons, which use Core Location, if you are communicating to a BLE device, you will use CoreBluetooth.

    import CoreBluetooth
    

### (2) Delegates

Eventually you are going to want to get callbacks from some functionality.  There are two delegates to implement: CBCentralManagerDelegate, and CBPeripheralDelegate.

    class ViewController: 
      UIViewController, 
      CBCentralManagerDelegate, 
      CBPeripheralDelegate {
    
      // Moar code
    
    }
    

### (3) Declare Manager and Peripheral

The CBCentralManager install will be what you use to find, connect, and manage BLE devices.  Once you are connected, and are working with a specific service, the peripheral will help you iterate characteristics and interacting with them.

    var manager:CBCentralManager!
    var peripheral:CBPeripheral!
    

### (4) UUID and Service Name

You will need UUID for the BLE service, and a UUID for the specific characteristic.  In some cases, you will need additional UUIDs.  They get used repeatedly throughout the code, so having constants for them will keep the code cleaner, and easier to maintain.  There are also many service/characteristic pairs called out in the [specification](https://developer.bluetooth.org/gatt/services/Pages/ServicesHome.aspx).

    let BEAN_NAME = "Robu"
    let BEAN_SCRATCH_UUID = 
      CBUUID(string: "a495ff21-c5b1-4b44-b512-1370f02d74de")
    let BEAN_SERVICE_UUID = 
      CBUUID(string: "a495ff20-c5b1-4b44-b512-1370f02d74de")
    

### (5) Instantiate Manager

One-liner to create an instance of CBCentralManager.  It takes the delegate as an argument, and options, which in most cases are not needed.  This is also the jumping off point for what effectively becomes a chain of the remaining seven waterfall steps.

    override func viewDidLoad() {
      super.viewDidLoad()        
      manager = CBCentralManager(delegate: self, queue: nil)
    }
    

### (6) Scan for Devices

Once the CBCentralManager instance is finished creating, it will call centralManagerDidUpdateState on the delegate class.  From there, if Bluetooth is available (as in "turned on"), you can start scanning for devices.

    func centralManagerDidUpdateState(central: CBCentralManager) {
      if central.state == CBCentralManagerState.PoweredOn {
        central.scanForPeripheralsWithServices(nil, options: nil)
      } else {
        print("Bluetooth not available.")
      }
    }
    

### (7) Connect to a Device

When you find the device you are interested in interacting with, you will want to connect to it.  This is the only place where the device name shows up in the code, but I still like to declare it as a constant with the UUIDs.

    func centralManager(
      central: CBCentralManager, 
      didDiscoverPeripheral peripheral: CBPeripheral, 
      advertisementData: [String : AnyObject], 
      RSSI: NSNumber) {
      let device = (advertisementData as NSDictionary)
        .objectForKey(CBAdvertisementDataLocalNameKey) 
        as? NSString
            
      if device?.containsString(BEAN_NAME) == true {
        self.manager.stopScan()
                
        self.peripheral = peripheral
        self.peripheral.delegate = self
                
        manager.connectPeripheral(peripheral, options: nil)
      }
    }
    

### (8) Get Services

Once you are connected to a device, you can get a list of services on that device.

    func centralManager(
      central: CBCentralManager, 
      didConnectPeripheral peripheral: CBPeripheral) {
      peripheral.discoverServices(nil)
    }
    

### (9) Get Characteristics

Once you get a list of the services offered by the device, you will want to get a list of the characteristics.  You can get crazy here, or limit listing of characteristics to just a specific service.  If you go crazy watch for threading issues.

    func peripheral(
      peripheral: CBPeripheral, 
      didDiscoverServices error: NSError?) {
      for service in peripheral.services! {
        let thisService = service as CBService
    
        if service.UUID == BEAN_SERVICE_UUID {
          peripheral.discoverCharacteristics(
            nil, 
            forService: thisService
          )
        }
      }
    }
    

### (10) Setup Notifications

There are different ways to approach getting data from the BLE device.  One approach would be to read changes incrementally.  Another approach, the approach I used in my application, would be to have the BLE device notify you whenever a characteristic value has changed.

    func peripheral(
      peripheral: CBPeripheral, 
      didDiscoverCharacteristicsForService service: CBService, 
      error: NSError?) {
      for characteristic in service.characteristics! {
        let thisCharacteristic = characteristic as CBCharacteristic
    
        if thisCharacteristic.UUID == BEAN_SCRATCH_UUID {
          self.peripheral.setNotifyValue(
            true, 
            forCharacteristic: thisCharacteristic
          )
        }
      }
    }
    

### (11) Changes Are Coming

Any characteristic changes you have setup to receive notifications for will call this delegate method.  You will want to be sure and filter them out to take the appropriate action for the specific change.

    func peripheral(
      peripheral: CBPeripheral, 
      didUpdateValueForCharacteristic characteristic: CBCharacteristic, 
      error: NSError?) {
      var count:UInt32 = 0;
    
      if characteristic.UUID == BEAN_SCRATCH_UUID {
        characteristic.value!.getBytes(&count, length: sizeof(UInt32))
        labelCount.text = 
          NSString(format: "%llu", count) as String
      }
    }
    

### (12) Disconnect and Try Again

This is an optional step, but hey, let us be good programmers and clean up after ourselves.  Also a good place to start scanning all over again.

    func centralManager(
      central: CBCentralManager, 
      didDisconnectPeripheral peripheral: CBPeripheral, 
      error: NSError?) {
      central.scanForPeripheralsWithServices(nil, options: nil)
    }
    

### Next Steps

Yes, twelve, count them, twelve steps to working with BLE devices - and this is just a single service and single characteristic.  What makes them particularly tricky is that they cascade.  After step #5 the everything is one long chain.  Watch your ... step (ha!).
