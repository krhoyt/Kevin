---
title: Publish-Subscribe Everywhere
slug: publish-subscribe-everywhere
date_published: 2015-06-12T14:05:35.000Z
date_updated: 2015-06-18T23:23:02.000Z
tags: pubsub, kaazing, cross
---

*Kaazing Gateway brings many awesome new superpowers to your stack.  Among those is the ever-sexy enterprise WebSocket (pioneered at Kaazing) feature.  This feature allows you to tap into enterprise messaging systems, and leverage the [publish-subscribe pattern](http://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern) in your applications.  Publish-subscribe is catching on everywhere these days.  Here are a few examples.*

---

This is reposted on the [Kaazing Open Source Blog](http://kaazing.org/blog/publish-subscribe-everywhere/).

### Android

I recently posted a series of articles around a [barcode scanner project](http://blog.kevinhoyt.com/2015/05/15/real-time-barcode-scanner/) I was working on.  I started off with an actual physical barcode scanner, like you would find at a grocery store.  Later in the series I used the camera on an Android phone.

When architecting the camera-based barcode scanner on Android, I found that Android really does not like you dealing with the network on the user interface thread.  It has a large stable of ways to help you decouple the UI thread from everything else.  This ranges from Tasks, Handlers, Intents and more.

For a long-running network operation - such as an always open WebSocket connection - the Android documentation suggests using the Handler class.  The question then becomes, how to get data from the Handler thread, back to the UI thread.  One of the answers is to use publish-subscribe in the form of the [Android MessageQueue](http://developer.android.com/reference/android/os/MessageQueue.html) class.

In short, publish-subscribe is the preferred means to communicate across processes in Android.

### Internet of Things

The Internet of Things is rapidly approaching in a big way.  You can read various [analyst reports](http://www.forbes.com/sites/gilpress/2014/08/22/internet-of-things-by-the-numbers-market-estimates-and-forecasts/) that suggest how many devices will be connected to the Internet in the next few years.  With SoC (system on a chip) controllers like the [Intel Edison](http://blog.kevinhoyt.com/2015/05/12/first-steps-with-intel-edison/) hitting the market, it is only a matter of time before we move on from simplistic applications such as thermostats, and move onto what is being called the Industrial Internet of Things.

At an industrial level, having silos of information in the form of single standalone devices, is simply unacceptable.  The possibilities only really start to open up when IoT devices can readily communicate with one another.  I [gave a talk](https://www.youtube.com/watch?v=wQ5r4iTNppw) along these lines at IoTa Conference in October of 2014.

How then are we supposed to let one device communicate with another?  Especially in a network topology where the devices do not know about one another?  Maybe even from different vendors?  The answer is to apply a pattern designed for decoupled communication - publish-subscribe.

Indeed, we see publish-subscribe starting to form the baseline for how IoT devices communicate with one another (over request/response) in the form of [MQTT](http://mqtt.org/).

### Containers

The complicated mess that is the current state of affairs around deploying an application has given rise to many new technologies.  One of the more projects to surface on this front is [Docker](https://www.docker.com/).  Docker allows you to encapsulate application functionality into what is termed "containers".

> If you have not played with Docker yet, it is definitely worth your time.  Might I suggest that you start with our very own [Kaazing Gateway on Docker](https://registry.hub.docker.com/u/kaazing/gateway/?utm_content=buffer03ffb&amp;utm_medium=social&amp;utm_source=twitter.com&amp;utm_campaign=buffer)?

Containers allow you to build isolated application functionality.  It is much like a virtual machine, without the machine dependency.  In order to be flexible, it is recommended that containers represent atomic functionality.  Two containers should know nothing about one another.

Decoupling application functionality in this manner offers amazing benefits, but sometimes you need two containers to talk to one another.  The answer here is to create a container with a message broker, and then to use publish-subscribe to communicate between the two.

### Microservices

A close cousin to containers is [microservices](http://en.wikipedia.org/wiki/Microservices).  Microservices are an application-level architecture that encourages the development of small, highly-focused, functionality.  Like containers, microservices should be designed completely independent of one-another, which communicate through language-agnostic APIs.

What exactly is a language-agnostic API for decoupling application functionality?  It is no surprise here the publish-subscribe is once again the best answer.

### Reactive

Not to be confused with [React.js](https://facebook.github.io/react/) (an excellent application framework), reactive application development means developing flexible, loosely-coupled, and scalable, applications.  There is a whole school of thought around how this can be, and should be, accomplished.  I would refer you to the [Reactive Manifesto](http://www.reactivemanifesto.org/) to get the entire picture.

It should come as no surprise however that reactive systems are suggested to be message driven.  Developing reactive systems depends on publish-subscribe.  Reactive systems are not just theory.  Companies like the [New York Times](http://www.techrepublic.com/article/how-the-new-york-times-uses-reactive-programming-tools-like-scala-to-scale/) use the approach to scale their infrastructure.

### Big Data

If you start pairing consumer and industry trends, it will not be long before you stumble across the problem of [big data](http://en.wikipedia.org/wiki/Big_data).  Industrial sensors are everywhere (planes, trains, and automobiles).  Modern phones are powerful computing platforms.  Vendors are lining up wearable computing offerings, and expansive verticals such a health care a lining up for a crack at the data.

Before long you reach a point where request-response simply does not scale.  Rather than dealing with some of the data some of the time, the most efficient solution actually means handling all the data, all the time, and then raising evens when something interesting happens.

Raising an event from one system, written on one technology stack, to be handled by another system, perhaps written on an entirely different technology stack means adopting the publish-subscribe pattern.  Your enterprise should never have to settle with an occasional snapshot of some of the data available to it.  Reconsidering the incumbent request-response for the more scalable and nimble publish-subscribe should be at the top of your list when tackling big data problems.

### Next Steps

When I joined Kaazing just over a year ago, it seemed that publish-subscribe was something that interested developers, but that few were actively embracing.  Fast-forward a year and we see publish-subscribe being adopted everywhere.  Kaazing Gateway provides enterprise-grade WebSocket built with publish-subscribe in mind.

> While the underpinning of Kaazing Gateway is WebSocket, that does not mean it is limited only to Web applications.  With Kaazing Gateway, you can use publish-subscribe everywhere to conquer all your needs from IoT to big data.

If you have not yet started digging into implementing a publish-subscribe system, you can take a look at our getting [started tutorial](http://kaazing.org/demos/quick-start/).  This will have you up and running with the basic concepts in no time at all.  From there, our awesome [developer documentation](http://developer.kaazing.com/documentation/5.0/index.html) will take you the rest of the way.  If you looking for examples, be sure to check out my [personal GitHub repository](https://github.com/krhoyt/Kaazing) as well.
