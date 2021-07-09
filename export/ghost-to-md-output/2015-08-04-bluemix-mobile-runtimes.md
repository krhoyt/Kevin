---
title: Bluemix Mobile Runtimes
slug: bluemix-mobile-runtimes
date_published: 2015-08-04T15:38:26.000Z
date_updated: 2015-08-04T15:38:26.000Z
tags: ibm, bluemix, runtime, mobile, cloud
---

In a [previous post](http://blog.kevinhoyt.com/2015/07/28/bluemix-crawl-runtimes/), I talked about IBM Bluemix web runtimes features.  Along the way, I showed how to create your first application on the web runtimes.  We took a fork in the road however, and never returned to close the loop.  In this post I will introduce the concept of Bluemix mobile runtimes.

### Closing the Loop

After logging into [IBM Bluemix](http://ibm.com/bluemix), the fork in the road we took was in choosing between creating a "Web" application or a "Mobile" application.  Last time we chose to create a "Web" application.  This time we will focus on the "Mobile" application side.

![Picking up where we left off.](http://images.kevinhoyt.com/bluemix-dashboard-create.png)

After selecting "Mobile" you will be presented with the option to choose from "Mobile" or "iOS".  I agree that it is a strange labeling considering iOS is a mobile platform.  For now however, the term "Mobile" refers to applications created for iOS version prior to iOS8, Android, and hybrid applications with Apache Cordova.

![Mobile or iOS](http://images.kevinhoyt.com/bluemix-mobile-runtimes.png)

> Regardless of which mobile operating system you choose, the IBM Bluemix features are nearly identical.  If you are entirely new to these features, you may find this walkthrough beneficial as an overview.

If you are looking for more in-depth usage of iOS with IBM Bluemix, I suggest checking out my colleague, Andy Trice, [blog](http://www.tricedesigns.com).  For this tutorial, I am going to be focused on Android.  For hybrid applications check out the [blog](http://www.raymondcamden.com) of my colleague, Ray Camden.  As for this tutorial, we will be focused on the Android workflow, so click the "Mobile" option.

![Get more information and continue to application creation.](http://images.kevinhoyt.com/bluemix-mobile-runtimes-platform.png)

### Pieces Parts

Once you click on the "Mobile" option, you will be presented with a panel containing some important information and links.  More than just informational, I strongly suggest you take a deeper look at all the details.  Several core features of IBM Bluemix mobile runtimes are presented.  They are as follows:

**SDK for Node.js**

IBM Bluemix mobile runtimes allow you to do pretty much everything right from the mobile client.  There are times however when you will want additional functionality.  As an example, you may want to integrate with existing infrastructure.  To do this you can add Node.js server infrastructure to your Bluemix application.

**Push**

Push notifications for both iOS and Android are available as part of your IBM Bluemix mobile runtime.  Integrating with these services is beyond the scope of this tutorial.  What this boils down to however is a convenient dashboard by which you can control your push services integration with the providers (Apple, Google), as well as have a consistent API to use across both platforms.

**Mobile Quality Assurance**

Is your application getting good reviews?  Are you sure?  Do you manually crawl the application stores to find out?  The quality assurance feature of IBM Bluemix mobile runtimes gives you access to sentiment analysis.  Why do your customers feel that way?  Find out with deep access to crash reports, logs, and more.

**Mobile Application Security**

In this day and age, deploying your application without security in mind is just asking for trouble.  The application security feature allows you to build a framework with which you can control access from the device to your cloud services.

**Mobile Data**

Perhaps my favorite feature of IBM Bluemix mobile runtimes, is the close integration with Cloudant (NoSQL).  This feature allows you to integrate directly from a mobile client (Node.js SDK as well), to [Cloudant](https://cloudant.com).  Connectivity flows through Bluemix, and hooks into the quality assurance, and application security features.  You also get a handy dashboard for viewing your data, and access metrics.

> If you put all these parts and pieces together, your get the foundation of what IBM broadly refers to as MobileFirst.

Another feature of [MobileFirst](http://www.ibm.com/cloud-computing/bluemix/solutions/mobilefirst/) is called Presence Insights.  You will hear me talking more about this feature in future posts.  In short however [Presence Insights](https://console.ng.bluemix.net/catalog/presence-insights/) helps you to incorporate location data such as BTLE beacons to build a more personalized customer experience.

Please do make sure you come back and check out all those capabilities.  In the meantime however, simply click on the button labeled "Continue" to ... um ... continue!

### Registration Credentials

Keeping the theme or a weather application, we will call this application "Android Weather" and then click the "Finish" button.

![Name your application and click the finish button.](http://images.kevinhoyt.com/bluemix-mobile-runtimes-name.png)

At this point, you will be presented with links for various boilerplate code.  This includes the Node.js SDK, as well a examples for the various mobile development approaches.  There is even a complete "to-do" list application for you to learn from.

![Registration credentials.](http://images.kevinhoyt.com/bluemix-mobile-runtimes-credentials.png)

Before you skim over the rest of the details on the page however, and just click the "Continue" button, note that there are three distinct pieces of information at the bottom of the page - route, application key, and application secret.  You can access these pieces of information from the IBM Bluemix dashboard for your application at any time, but it might be worth copying them down now, and placing them in a secure location.

These credentials are what the mobile cloud services (MobileFirst) uses to identify and manage how the APIs interaction with your services.  It may be hard to see at this point, but there is also a lot of work done for you in managing versions of your deployed application.  These credentials also play a key role in that aspect of your mobile cloud.

### Service Catalog

When you are ready, click the "Continue" button to finish creating your application.  This will take you to the dashboard page for your newly created application.  You will see your registration credentials, be able to stop/start your application, and more from this screen.  Clicking the "Mobile Options" link will toggle the display of the credentials.

![IBM Bluemix mobile application with services.](http://images.kevinhoyt.com/bluemix-mobile-runtimes-landing.png)

Also worth noting on the dashboard page for your mobile application is the "Services" menu on the left side of the screen.  These are the services I mentioned - and each had their own dashboard screen for your mobile application.

> Services in IBM Bluemix are functionally complete offerings, with their own set of features, not just a set of APIs.  There are ~120 services at the time of this writing.

You can also see the services for mobile applications listed below the "Add a Service or API" and "Bind a Service or API" buttons.  You can manage the services by clicking on them here as well.  Want to have IBM Watson work on your application?  You can add that as a service.  Message broker?  Workflow?  Add the service!

*Really want to blow your mind with the robust capabilities of IBM Bluemix?  Head to the "Catalog" button in the top menu bar, to see a more complete listing of Bluemix services you can use.*

### Next Steps

At this point, you hopefully have a better understanding of the IBM Bluemix mobile runtimes.  You may see it written as "Mobile Cloud Services" as well as "MobileFirst".  This all depends on the services and deployment scenario.  Bottom line is that you get a robust suite of offerings that can be run in the cloud or on-premis.

![Weather application on Android.](http://images.kevinhoyt.com/bluemix-mobile-android-weather.png)

In my next post, I will detail bringing the weather application from the web runtimes over to Android using the mobile runtimes features.  I will talk about using the Node.js SDK, as well as the Android mobile runtimes features (namely geolocation and Cloud Code integration).  Building a mobile application has never been so robust.
