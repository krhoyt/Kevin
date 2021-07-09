---
title: Tips for IoT in the Cloud(ant)
slug: tip-for-iot-in-the-cloud-ant
date_published: 1970-01-01T00:00:00.000Z
date_updated: 2018-05-08T20:10:41.000Z
tags: iot, cloudant
draft: true
---

Most IoT platforms support HTTP. Cloudant (IBMs hosted CouchDB environment) is a data store that speaks HTTP. It is in fact the only way to interact with the data store. At first glance, this makes Cloudant/CouchDB an easy choice for IoT applications. But how do you manage IoT-scale data in a document data store? Here are some tips I have learned along the way.

#### The Document Problem

It makes sense that there are so many document storage options from which to choose, given that we view so many documents every day. A social media post. A news article. A screen of an application.

As a guide, a document should contain the data to present a discreet view. If you have a view that lets you see the current status of an IoT sensor, that document will likely have properties along the lines of device, current value, date updated, etc.

What do you do if that view also contains a historical chart of the sensor readings?

You might consider adding an array property to the document containing a history of past readings. If you are keeping a small number of historical readings, say one per day, then this might work out. Though bear in mind that five (5) years of daily readings is 1,825 data points. That is a lot to load for a single view. What if the chart in that view is only weekly (0.004% of the data), monthly (0.02%), or even yearly (still, only 20%)?

Do you really want to load all 1,825 data points if you just want 31 of them?

Of course, many IoT sensors update far more frequently. Every minute gives you 1,440 readings per day. Every second gives you 86,400 readings per day. The cost (data, time) to load that view is going to become immense by the time the same five years pass. It goes without saying that you cannot easily view that many data points on a single screen in most cases - certainly not a mobile device.

#### Tip #1 - One Document Per Reading

If you are coming from using document data stores to populate web pages in a blog, news web site, etc. it is easy to make the mistake of putting the view of the screen first. The best way to scale, and manage access to, your IoT sensor data however is to create a document for each reading. This is still a document per view, but it is the view of the sensor at a moment in time, not the view of the mobile application presenting that data.

> Note that I am glossing over many hardware considerations to focus on data storage/access in this post. The hardware aspect is another topic entirely.

The "one document per reading" approach also saves you from write collisions. Let us say for example that the screen view of the data contains multiple sensors. If we put the screen view of the data first, we might then have multiple array properties - one for each sensor we want to display.

In Cloudant/CouchDB, you have to read (at least part of) a document in order to update it. If two sensors read the same original document, and then try to update it, one of them is going to fail because the revision string will be out of order. When you put the view of the IoT device first, you avoid this problem entirely.

#### Tip #2 - Design Documents are Your Friend

Often an IoT device will have more than one sensor - or at least more than one value to present. In the case of an environmental sensor, this could be as simple as temperature and battery level. More realistically however, you will also have humidity, light, CO2, air particulates, and other data points.

Putting all of these values in a single document that represents the view of the IoT device is still great for storage. It is the function of design documents to take that bulk data and place it into a screen-oriented view. I will generally have a design view for the sensor on the whole, but also for each of the individual properties. As an example, this gives me easy access to a history of just temperature readings.

    function( doc ) {
      if( doc.type && doc.type == 'sensor' ) {
        emit( doc.device, doc.temperature );
      }
    }
    

#### Tip #3 - Emit Arrays for Querying

As previously mentioned, a sensor that updates once per second will give you 86,400 documents per day - per sensor. How do you query the documents (readings) for 9 AM - 10 AM for a given sensor? The answer here is to lean into the features that the "emit( key, value )" function provides.

The first parameter that gets passed to the "emit()" function is a "key" value. While you will often see this as a single value, you can also pass an array of values.

    function( doc ) {
      if( doc.type && doc.type == 'sensor' ) {
        var created = new Date( doc.created_at );
      
        emit( [
          doc.device,
          created.getFullYear(),
          created.getMonth(),
          created.getDate(),
          created.getHours(),
          created.getMinutes()
        ], doc.temperature );
      }
    }
    

In the above example, I parse a millisecond since the epoch timestamp, and break down each date part as an individual element of an array provided as the key (along with the device identifier). For the "value" parameter, I pass the recorded temperature value. This allows me to query readings for a specific sensor, in a given date range.

    https://krhoyt.cloudant.com/mydb/_design/environment/_view/readings?startkey=["device_1",2017,10,10,9,0]&endkey=["device_1",2017,10,10,9,59]
    

Using the above HTTP GET, I can access all the temperature readings for "device_1" between 9 AM and 10 AM. Each element of the array effectively becomes a query parameter - the device ID, year, month, date, hour, and minute. The results will even tell you where you are in the entire dataset, which can be useful for paging in the screen view.

The "value" of the "emit()" function can be a JavaScript object as well. We could emit temperature and humidity as an example. One of the way I like to use this is to provide a celcius and fahrenheit value rather than just the temperature in a specific unit of measure (internationalization).

> Depending on your needs, you might defer this calculation to the client; trading a few bytes on the wire for CPU cycles on the client.

By leaning into design documents to define our views, we have a robust means of getting just the specific data we are interested in viewing - in this case, getting 3,600 readings (one hour of once per second readings) from the 86,400 that make up a day (0.04% of the readings for the day).

#### Tip #4 - Flip the Design

I have used dates in the previous design document, because that is a common need - especially for charting. What if you wanted to see sensors reporting values outside of a given range? For this, you could flip the design. Instead of emitting an array of date values, emit an array of reading values.

    function( doc ) {
      if( doc.type && doc.type == 'sensor' ) {
        emit( [
          doc.device,
          doc.temperature,
          doc.humidity,
          doc.light
        ], doc.created );
      }
    }
    

Using this approach you can query all the readings and to find temperatures in a given range. Or even temperatures in a given range, when humidity is in another given range. Having more design documents views may seem counterintuitive for somebody coming from a relational database. The result however is a powerful means to view your data however you need it, for whatever purpose.

#### Tip #5 - Indexes Y'All

Maybe the "startkey" and "endkey" formation on the URL gives you the heebie jeebies. Maybe you prefer to POST your search criteria similar to how you might submit a SQL statement over a given database driver. Cloudant/CouchDB provides a functional equivalent of design document view called, indexes.

    {
      "_id": "_design/by_sensor_in_range",
      "_rev": "3-8467bf107ce1d12950f3e1517a93f974",
      "language": "query",
      "views": {
        "by_sensor_in_range": {
          "map": {
            "fields": {
              "created_at": "asc"
            }
          },
          "reduce": "_count",
          "options": {
            "def": {
              "fields": [
                "created_at"
              ]
            }
          }
        }
      }
    }
    

Back to querying date ranges, this design document allows me to POST a query to Cloudant/CouchDB. The results are the documents that meet the query criteria.

    {
      "fields": [
        "_id",
        "_rev",
        "device",
        "created_at",
        "temperature",
        "humidity",
        "light"
      ],
      "sort": [
        {
          "created_at": "asc"
        }
      ],
      "selector": {
        "created_at": {
          "$gt": 1507615200000,
          "$lt": 1507682065701
        },
        "device": "device_1"
      }
    }
    

In this query, I am telling Cloudant/CouchDB to get me a specific set of fields from the resulting documents, perform an ascending sort on the index (date), between a given date range (in milliseconds), for a specific device. That is a whole lot of granularity, made easily accessible. The documentation for indexes covers the other criteria you can use to query the store (and there are a lot of them).

Let me translate that for you relational folks:

    SELECT device, created_at, temperature, humidity, light
    FROM  readings
    WHERE created_at > 1507615200000
    AND   created_at < 1507682065701
    AND   device = 'device_1'
    

#### Tip #6 - Reduce the Noise

TBD

#### Tip #7 - Use the Update Document

Often times the document you want to store for an individual sensor reading has properties that may differ from the data that is presented from the IoT device.

For example, when using the Particle WebHook integration, you are going to get a JSON document with a "coreid" property. That property represents the unique device identifier. That is an essential piece of information to have, but I would rather it be reflected as "device" in my documents.

The data that I send in a Particle Function call is often in CSV format. This saves me he headache of trying to manage JSON on the MCU. Because "sprintf()" on Particle devices can be a struggle  with float values (read: not supported), I will also often multiply floats by 100 to get an integer value. I then in turn need to do the division before putting the document for the reading into the store.

    {
      "coreid": "1234567890",
      "name": "environment",
      "data": "12,34,56",
      "published_at": "2017-10-12T22:47:59Z"
    }
    

This is an example of what I might get out of a Particle Function call with a WebHook. You might think that you will have to send this to a server (Node.js, Java, etc.) for further processing. Cloudant/CouchDB however has a special type of design document called the "update" document.

    {
      "_id": "_design/create_sensor_reading",
      "_rev": "23-cffe42b0a0cb75fda6edbf4744c1e946",
      "updates": {
        "create_sensor_reading": "function( doc, req ) { ... }
      }
    }
    

If you POST (create) to the update document, you can take additional processing actions before actually saving the reading document to the data store. The function you provide takes a document to update (null in the case of POST for document creation), and details about the HTTP request. The request will contain the body of the POST along with other details (such as a convenient UUID for your new document).

Now I can customize how I want the reading document to actually be stored.

    function( doc, req ) { 
      var data = JSON.parse( req.body );
      var parts = data.data.split( ',' );
    	
      doc = {
        _id: req.uuid,
        device: data.coreid,
        type: 'sensor',
        event: data.name,
        raw: data.data,
        temperature: parseFloat( parts[0] ) / 100,
        humidity: parseFloat( parts[1] ),
        light: parseFloat( parts[2] ),
        created_at: Date.parse( data.published_at )
      };	
    
      return [doc, JSON.stringify( doc )];
    }
    

Using this approach I parse the JSON data from the request body, and then make my own document to be stored. I can do the division to get the float back out of the integer, parse an ISO-8601 date string into a timestamp, and change the "coreid" to "device" as per my liking.

The return of this function is an array with two elements. The first is the document to be saved, and the second is the body of the HTTP response. I like to turn my document back into a JSON string for the response for the purposes of debugging, but you can return any value you would like.

#### Tip #8 - Get Permission

When you create a Cloudant account, wether via the IBM Cloud console, or directly with the Cloudant service, you will have an account username and password. You can use these credentials to access every database and document within your account - including deletion, or even changing the access credentials. Do not put your account credentials on an IoT device.

![Permissions view in Cloudant.](http://images.kevinhoyt.com/cloudant.permissions.png)

Each database has its own permissions, which you can access via the "Permissions" menu option. Use this feature to create two API keys - one for read, and one for write. Put the write credentials on your IoT device, and put the read credentials into your application. Should your credentials become compromised, you can disable that key with one click.

Some devices and applications require both read and write permissions. Depending on how your architecture, you might choose to deploy both a read and a write credential, and have the device/application use the appropriate key for the appropriate operation. This can create challenges architecturally, and can potentially increase your attack surface.

In these situations, I generally create an API key with read/write for the given database. Disabling the credentials is still a click away, damage will be limited to a single database, and your account credentials are still protected.

#### Next Steps

Getting your head around storing IoT data using documents can take time and practice. Hopefully these five tips will put you in a good position to hit the ground running. Keep in mind that these are "tips" not "rules". Your reporting needs may vary, but I am confident that Cloudant/CouchDB can make an ideal storage solution for your IoT needs.

One interesting aspect of all this is that I do not need any special database drivers. As I mentioned earlier, everything about Cloudant/CouchDB is HTTP-based. This means that I no point have I needed to rely on running a Node.js (or Java, or whatever) server. In fact, as I once heard somebody so eloquently put it "the database is the server!"

If you run into a situation where you do need additional server processing, you should definitely check out the emerging serverless offerings such as IBM Cloud Functions. Serverless, or functions as a service (FaaS), give you server processing when you need it, but you only pay for the time your function is actually running (versus paying for a cluster of servers running 24 x 7).

When paired, these two solutions (IBM Cloud Functions, Cloudant) give you immensely powerful infrastructure, at an extremely low cost of entry for even the most demanding IoT needs.
