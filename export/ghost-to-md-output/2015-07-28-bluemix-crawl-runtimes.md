---
title: Bluemix Web Runtimes
slug: bluemix-crawl-runtimes
date_published: 2015-07-28T17:22:38.000Z
date_updated: 2015-07-28T23:22:58.000Z
tags: ibm, bluemix, runtime, dashboard
---

Did you know that IBM has a PaaS (Platform as a Service) offering?  We do!  It is called [IBM Bluemix](http://www.ibm.com/bluemix), and it consists of some ~120 different components, each with their own array of features.  From Docker containers, to message brokers, from databases, to IoT (Internet of Things) integration - everything an enterprise needs is at your fingertips.  Over the next several weeks, I will be crawling these components and features.  Up first will be finding your way around.

### Web Runtimes Overview

When it comes to services, two different aspects are likely to come to mind.  The first is a service (perhaps RESTful) that you can use in your application.  IBM Bluemix offers no shortage of those types of services.  The second is running your own code in the cloud to provide either services of your own, or a complete application.  The later of these two in Bluemix vernacular is called "runtimes".

> At the time of this writing, IBM Bluemix supports Java EE applications, Node.js, Go, PHP, Python, ASP.NET, and Ruby.

All of these have a similar approach to deploying your code in the cloud.  I am going to cover the three I use most often - PHP, Node.js, and Java EE.  From there you will see a pattern emerge and be able to easily deploy an application on one of the other runtimes.  If there is another runtime you want to see covered, please [let me know](http://www.twitter.com/krhoyt).

### Bluemix Dashboard

The first step in getting started with IBM Bluemix is to create your own account.  This is easy enough, and costs you nothing to get started.  Head on over to the Bluemix web site, and click on the button labeled "Sign Up".  Once you have completed the sign up process, you will be presented with the Bluemix Dashboard.

![Bluemix Dashboard](http://images.kevinhoyt.com/bluemix-dashboard.png)

### Creating Your Application

The IBM Bluemix Dashboard is regularly updated with new features.  The screenshot above may change over time.  What you are looking for is something along the lines of "Create App" or "Cloud Foundry Apps".  In the above image, it is the upper-lefthand box in the grid of four boxes presented at the top of the page.  Click "Create App" to start the process.

![Create an application.](http://images.kevinhoyt.com/bluemix-dashboard-create.png)

Next you will be prompted to create a "Web" or "Mobile" application.  The "Web" option refers to the language runtimes, while the "Mobile" option includes all that and more for creating iOS or Android applications.  Since we are interested using language runtimes, click on the "Web" option.

![Selecting a Bluemix runtime.](http://images.kevinhoyt.com/bluemix-dashboard-web.png)

Here you will see all the runtimes you can choose from for your application.  Note that not only are various runtimes presented for you to choose from, you can also browse existing code samples (called "Buildpacks"), and even just jump straight to uploading you own code if you know what you are doing.  Select the a runtime option.  For this tutorial, I selected the PHP runtime.

When you click on a runtime option, you will get more details about what is provided.  This will include limits on the free version, and links for more details and documentation.  Click on the button labeled "Continue".

![Name your application.](http://images.kevinhoyt.com/bluemix-dashboard-name.png)

Next up is giving your application a name.  In the interest of giving you something to work with, I will be covering a basic weather application in all my runtime tutorials.  The weather application is the same client logic across all runtime examples.  Since I selected a PHP runtime, I will enter "PHP Weather" and click the "Finish" button.

![IBM Bluemix will start your application](http://images.kevinhoyt.com/bluemix-dashboard-start.png)

From here, IBM Bluemix goes to work.  It will create the application, and start it.  A link to the running application will also be presented.  What is there initially, is some static files welcoming you to Bluemix.  What follows is a list of next steps to deploy your own application.

### Command Line Interface

The next step is to download and install the "CF Command Line Interface".  The "CF" here stands for "Cloud Foundry".  Clicking on the download button will take you to the Cloud Foundry GitHub repository where you can download the installer for your platform.  Supported platforms for the CLI (Command Line Interface) include Debian, Red Hat, Mac OS X, and Windows.

> Once installed you can open a command line window and type "cf -v" to make sure the installation was successful.

The CLI gives us tooling for working with Bluemix.  If you prefer a Git workflow, that option is also available to you.  For the runtime tutorials, I will be covering the CLI approach to deployment.

### Download Starter Code

Back in the IBM Bluemix Dashboard, the next step is to "Download Starter Code".  Expanding the downloaded archive will give you everything you need to get started with your own Bluemix application.  The most important file for Bluemix here is the "manifest.yml" file.

    applications:
    - disk_quota: 1024M
      buildpack: php_buildpack
      host: php-weather
      name: PHP Weather
      path: .
      domain: mybluemix.net
      instances: 1
      memory: 128M
    

The manifest file tells IBM Bluemix how to deploy your application.  Depending on the runtime you selected, you will find other files in a familiar project structure.  For example, with the selected PHP runtime, there is a "composer.json" dependency management file.  For Node.js there will be a "package.json" file.  For Java, a "build.xml" for use with Ant.

Just so we can see something interesting, you may want to modify one of the visible HTML files by changing a few characters.  If you are just interested in the mechanics for now, we can move along to using the CF CLI to deploy our starter code to IBM Bluemix.

### Deploy to IBM Bluemix

In a terminal window, change to the directory containing the downloaded starter code.

    cd ~/Desktop/PHP+Weather
    

Next we will want to tell the CLI to connect to IBM Bluemix.  Why do we have to tell the CLI, which we downloaded from Bluemix, to connect to Bluemix?  As it turns out, Cloud Foundry is open source, so it is entirely possible that you will use the same CLI tool for different environments.

    cf api https://api.ng.bluemix.net
    

Now that the CLI knows where the Cloud Foundry instance is that we will be using, we will want to login to IBM Bluemix.

    cf login -u your_email@server.com -o your_email@server.com -s Development
    

Notice that the last argument to the CLI is the word "Development".  This is the name I have given to the "space" created when I setup my IBM Bluemix account.  A "space" is a logical collection of your Bluemix components.  I also have a "Production" space as an example.  Be sure to change the value of the last argument to the space you will be using on your account.

The final step is to push the code to IBM Bluemix.  How this happens will differ slightly based on the runtime you selected.  Ultimately however, Bluemix will stop the currently running instance, examine your code to assemble dependencies, and then actually deploy and start an instance with your new code.

    cf push "PHP Weather"
    

Not all of the CLI commands are necessary each and every time you want to deploy new code to IBM Bluemix.  If you are actively developing, then you will likely just use "cf push" to upload your latest stable build.

It is also worth noting that the project structure in the starter code will give you a working application that you can run locally for quicker development.  For example, when using PHP, after changing to the starter code directory, I ran "php -S localhost:8000" to provide a basic web server with PHP features to test against.  From there, I only used "cf push" when I felt a had a stable build.

Your application is now live on IBM Bluemix!  The CLI will tell you the URL to find you application, as will the dashboard.  In the case of "PHP Weather" I was able to point my browser at "[http://php-weather.mybluemix.net](http://php-weather.mybluemix.net)".

### Next Steps

Now that you are familiar with the basic of using the IBM Bluemix dashboard, and associated runtime tooling, the next step is to move on to deploying our own code.

As mentioned, I have built a simple weather application for the purposes of testing out the various runtime options on IBM Bluemix.  In my next post, I will take a look at the server-side code for powering the application using PHP, Node.js, and Java.

![IBM Bluemix and PHP weather application.](http://images.kevinhoyt.com/bluemix-crawl-weather-php.png)

If you want to get a sneak peak at the code, you can download the source for all three projects on [my GitHub repository](https://github.com/krhoyt/IBM/tree/master/crawl/runtimes).  Until then, have fun exploring the vast catalog of features IBM Bluemix offers developers.
