---
title: IBM MobileFirst 7.1 with Android
slug: ibm-mobilefirst-7-1-with-android
date_published: 2015-08-25T18:36:49.000Z
date_updated: 2015-08-25T18:36:49.000Z
tags: android, ibm, mobilefirst
---

Branching off Ray Camden's [excellent post](http://www.raymondcamden.com/2015/08/17/getting-started-with-mobile-development-and-ibm-mobilefirst-7-1) on getting started with [IBM MobileFirst 7.1](http://www.raymondcamden.com/2015/08/17/getting-started-with-mobile-development-and-ibm-mobilefirst-7-1), this post will focus on the continuing workflow from an Android perspective.  It is assumed that you have followed Ray's tutorial on installing the IBM MobileFirst 7.1 CLI (if you have an earlier version, you should upgrade), and have [Android Studio](http://developer.android.com/tools/studio/index.html) at the ready.

### The Projects

When working with IBM MobileFirst, there is almost always two projects - the client and the server.  The client in this case is an Android application.  The server is functionally a Java EE 7 application, and with MobileFirst Foundation, it is deployed on [IBM WebSphere Liberty](https://developer.ibm.com/wasdev/websphere-liberty/).  Starting on the server side then, let us create a project.

    mfp create HelloProject
    

At the command prompt, you will want to move to directory that you want to work with for this walkthrough.  The above command will create a directory called "HelloProject", which will hold a baseline MobileFirst directory setup.

> I generally run the above command from a directory named for the application I am building.  That directory then has a folder for the client and the server parts.

Now change into that newly created MobileFirst project directory.  Here we will create an "adapter" or effectively expose a REST API for application data and resources.  You can actually create adapters written in JavaScript (not Node.js), but as developers working with Android, you might find it more robust to simply use Java throughout.

    mfp add adapter HelloAdapter —type java —package com.ibm.us.krhoyt
    mfp start
    mfp push
    

These three commands will create a Java adapter for you in the "adapter" folder, start the IBM MobileFirst server if it is not already started, and then deploy (push) the project, including the newly created adapter, onto the server.  We will come back to that adapter code in a moment, but if you want to test it out, it is populated with some boilerplate code.

    mfp adapter call HelloAdapter/users/Kevin
    

### Android Studio

Start up Android Studio and create a new project with a blank activity.  In order to tell Android Studio about the IBM MobileFirst dependencies, we will need to make a few changes.  With your project created, go to **Project -> Gradle -> build.gradle (Module: app)** and add the following snippets.

    // Below "apply plugin: ‘com.android.application’"
    repositories {
      jcenter()
    }
    
    // Inside “android"
    packagingOptions {
      pickFirst 'META-INF/ASL2.0'
      pickFirst 'META-INF/LICENSE'
      pickFirst 'META-INF/NOTICE'
    }
    
    // Inside “dependencies"
    compile group: 'com.ibm.mobile.foundation',
      name: 'ibmmobilefirstplatformfoundation',
      version: '7.1.0.0',
      ext: 'aar',
      transitive: true
    

With these changes, Gradle will want to rebuild the project.  Let Gradle complete that task before moving on to the next step.  When Gradle is done, head to your "ApplicationManifest.xml" file and make the following changes.

    // After the opening manifest tag
    <uses-permission android:name="android.permission.INTERNET"/>
    <uses-permission android:name="android.permission.ACCESS_WIFI_STATE"/>
    <uses-permission android:name="android.permission.REAL_GET_TASKS" />
    
    // After the closing activity tag
    <activity android:name="com.worklight.wlclient.ui.UIActivity" />
    

The permissions give your Android application the ability to call IBM MobileFirst services.  The additional activity is a background service used by some of the MobileFirst features.  Head back to the command line, make sure you are in the Android Studio project directory, and run the following command to tell MobileFirst about your Android application.

    mfp push
    

> Notice how the "mfp" command performs different actions depending on what directory structure you are in.  If you are in a server, it deploys your code.  In an Android project, it tells the server about your application.

Now you are ready to leverage the IBM MobileFirst server from your Android application.  Add the following code to your main activity source file, inside the "onCreate" method.

    final WLClient client = WLClient.createInstance(this);
    
    client.connect(new WLResponseListener() {
      @Override
      public void onSuccess(WLResponse response) {
        URI                path;                    
        WLResourceRequest  request;
    
        try {
          path = new URI("/adapters/HelloAdapter/users/Kevin");
          request = new WLResourceRequest(path, WLResourceRequest.GET);
          request.send(new WLResponseListener() {
            @Override
            public void onSuccess(WLResponse response) {
              Log.d(“MOBILEFIRST”, “Success: “ + response.getResponseText());
            }
    
            @Override
            public void onFailure(WLFailResponse response) {
              Log.d(“MOBILEFIRST”, “Fail: “ + response.getErrorMsg());
            }
          });
        } catch(URISyntaxException urise) {
          Log.d(“MOBILEFIRST”, “URI: “ + urise.getMessage());
        }
      }
    });
    

The first thing that happens here is a client used to call IBM MobileFirst services.  The URI is the "adapters" functionality of MobileFirst, using the "HelloAdapter" we created in the previous step.  We are calling the "users" REST endpoint using an HTTP GET, and sending the parameter "Kevin".  Once executed, we log out the response.

### Extra Credit

What exactly is going on in that Java adapter?  This is one of my favorite parts.  Java adapters are JAX-RS, which effectively means they are plain old Java objects, with some annotations to tell the server how to expose them.  JAX-RS is beyond the scope of this post, but here is a glimpse of a "hello world" adapter.

    package com.ibm.us.krhoyt;
    
    import javax.ws.rs.GET;
    import javax.ws.rs.Path;
    import javax.ws.rs.PathParam;
    
    @Path("/users")
    public class HelloAdapterResource 
    {
      @GET
      @Path("/{name}")
      public String hello(@PathParam("name") String name) {		
        return "Hello " + name.trim() + "!";
      }
    }
    

It does not get much easier than that folks!  The "Path" annotations tell the server where to expose this REST service.  The "GET" annotation says to route to this method for an HTTP GET.  The "PathParam" annotation maps the URL parameter to a method instance for us to use.  JAX-RS goes much deep than this, and I would encourage you to explore the awesomeness if you have not already.

### Next Steps

Like most "hello world" examples, this really does not do MobileFirst justice.  For example, if you try accessing the REST endpoint directly in the browser (or via [Postman](https://www.getpostman.com), [Paw](https://luckymarmot.com/paw), or other client), you will get an message that access is denied.  At this point, only the Android application is permitted to access the endpoint.

> Put another way, you get application security right out of the box.

Another cool feature is reporting for our application usage.  You can actually see how many devices are accessing your APIs, and with a little work, monitor what APIs they use most frequently, their performance, and so on.  That all takes place in the IBM MobileFirst console.  You can access it by running the following command from within a MobileFirst project folder (server or client).

    mfp console
    

If you are accessing an XML resource from your adapter, MobileFirst will even let you easily specify an XSL transform to run on the data before returning it to the client.  Even further, you can access a database directly from your Android clients, and still keep the security and reporting features.

The list goes on and on.  If you are building mobile applications (and who is not these days), then IBM MobileFirst gives you a vast suite of tools.

If you want to check out my sample source code for a "hello world" (slightly improved from this boilerplate), you can find it in my [GitHub](http://github.com/krhoyt) repository.  Have questions?  Leave a comment below, or send me a message on [Twitter](http://twitter.com/krhoyt).

*Header [photo](https://www.flickr.com/photos/-heinecke-/4406341989) is "IBM Logo" by Flickr user "heinecke"*
