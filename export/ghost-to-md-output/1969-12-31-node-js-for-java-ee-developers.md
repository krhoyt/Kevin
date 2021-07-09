---
title: Node.js for Java EE Developers
slug: node-js-for-java-ee-developers
date_published: 1970-01-01T00:00:00.000Z
date_updated: 2015-09-24T01:06:09.000Z
draft: true
---

[http://www.oracle.com/technetwork/java/javaee/tech/index.html](http://www.oracle.com/technetwork/java/javaee/tech/index.html)

As a Developer Advocate for IBM, I spend a lot of time at conferences.  In this role, you do not even have to attend the sessions to see where the technology landscape is shifting (to be clear, I thoroughly enjoy attending sessions as well).  Of late, sessions around Node.js are bursting at the seams.

One can speculate on why this is, but it led me to thinking of the Java EE development I have done in the past.  Jumping stacks can be intimidating, especially when your stack is as thorough as Java EE, or as community-driven as Node.js.  With that in mind, I put together the following thoughts on where Java EE developers might look for Node.js equivalents.

*Before I even start, let me be clear that this list is not all-inclusive.  I am calling out the most prominent parts that I recall from my days of Java EE.  If you have additions or corrections, please leave a comment below, and I will update the post accordingly.*

### Web Application Technologies

Given that Node.js is JavaScript, and JavaScript originated in the browser, it should be no surprise that it does pretty much anything Web related particularly well.

**WebSocket**

Just like JavaScript, WebSocket is born of the Web, and there are many WebSocket implementations available for Node.js.  Probably the most popular is [Socket.IO](http://socket.io), which layers robust functionality on top of plain WebSocket.  If WebSocket is all you want however, then I personally like "[ws](https://einaros.github.io/ws/)".

**JSON Processing**

The "JS" part of "JSON" stands for JavaScript, so it should be no surprise that JSON is natively supported in Node.js.  You will use JSON.parse() and JSON.stringify() to achieve this task.  The result is a JavaScript "Object" instance.  Properties are publicly exposed on that object, so there is no JSONObject marshaling.

**Servlet**

Java Servlets functionally take an incoming HTTP request, process it, and return some data.  Often a servlet will function as a controller, assembling data before passing it along to a JSP (JavaServer Page) for rendering.  The most direct equivalent in Node.js would likely be something along the lines of [routes](http://expressjs.com/guide/routing.html) in [Express](http://expressjs.com).

**JavaServer Faces**

The Web brings with it an inherent statelessness, which JavaServer Faces aims to abstract away from the developer.  At the same time, JSF provides a bundling of more complex component types not generally provided for by Web standards.

> I once heard JSF referred to as a "Flash killer".  Turns out that the true undoing of Flash was Apple.  Not that JSF is without its [critics](https://assets.thoughtworks.com/assets/technology-radar-jan-2014-en.pdf) and [champions](http://blog.primefaces.org/?p=3035).

Solving these two problems with Node.js would tend more towards the client side (browser).  Application frameworks such as [AngularJS](https://angularjs.org), and [React](https://facebook.github.io/react/) (from Facebook), seek to manage the statelessness, while modern standards such as [Shadow DOM](http://www.w3.org/TR/shadow-dom/) offer encapsulation of more complex interactions which surface in frameworks such as [Polymer](https://www.polymer-project.org/1.0/).

**JavaServer Pages**

Assuming that a Node.js Express route has been run, and data assembled, the terminology for JavaServer Pages would be a "template".  The most common equivalent then of JavaServer Pages in Node.js would be [Jade](http://jade-lang.com).  Everything from conditionals and includes, to iteration and inline code can be found in Jade.

**JSP Tag Library**

SCRIPT tag?  Components?

### Enterprise Application Technologies

Without the enterprise, Java EE would just be Java SE (har, har).  It is in the enterprise that Java EE currently reigns supreme.  However, as Node.js continues to mature with offerings such as [StrongLoop](https://strongloop.com), and Oracle continues to [lay off Java Evangelists](http://www.infoq.com/news/2015/09/oracle-purges-java-evangelists), the future of the enterprise is up for grabs.

***Enterprise JavaBeans***

EJB (Enterprise JavaBeans) are one of those technologies most Java EE developers love to hate.  The complexity of the early versions of the specification made it all but impractical for most applications.  To be sure, where it fit however, it fit great.

Essentially an approach to distributed components, like [DCOM](https://en.wikipedia.org/wiki/Distributed_Component_Object_Model) before it, or [CORBA](https://en.wikipedia.org/wiki/Common_Object_Request_Broker_Architecture) before that, in Node.js this architectural approach most closely maps to the modern trend of [microservices](http://martinfowler.com/articles/microservices.html) - specifically containerization of services using technologies such as [Docker](https://www.docker.com).

***Java Message Service***

JMS (Java Message Service) is a bit of a misnomer, as it is really more of a protocol, than a true messaging service.  In Node.js the preferred equivalent technology would be to integrate to a message broker using open standard protocols.

> Node.js is actually capable of implementing a message broker, in addition to a client, however specialized open source brokers are generally preferred.

The closest mapping between the functionality of JMS and an open standard would probably be [AMQP](https://en.wikipedia.org/wiki/Advanced_Message_Queuing_Protocol) (Advanced Message Queueing Protocol).  There are a number of brokers (both open and closed) that support AMQP, such as [RabbitMQ](http://www.rabbitmq.com).

Once free of JMS proper, you will find protocols designed for specific applications such as chat ([XMPP](https://en.wikipedia.org/wiki/XMPP)) or IoT ([MQTT](https://en.wikipedia.org/wiki/MQTT)).  Brokers also generally speak more than one protocol, and can even integrate with other open standards such as WebSocket.

### Web Services Technologies

One might postulate that bringing JavaScript to the server was born out of the need to deliver web services, and the desire to do it with the same language that was used on the client.  With its asynchronous nature, Node.js makes a great fit.

**JAX-RS**

At a basic level, JAX-RS would be similar to Express routing done in a more formal manner.  This might include breaking the routes out to their own subclasses, and perhaps even breaking out model classes for each data type being represented.  Many of the JAX-RS annotations will map very closely to Express routing.

### Java EE-related Specifications in Java SE

Not everything that exists in Java EE is solely Java EE.  Many Java SE applications need to parse XML, so you find that capability in the SE side of the house.  Today, Node.js does not make a differentiation between enterprise and non-enterprise use-cases, but you will still find support for XML and more.

**XML Binding (JAXB)**

Binding an XML tree to a JavaScript Object instance can be done using "[xml2js](https://github.com/Leonidas-from-XIV/node-xml2js)".  This package is particularly useful for Windows developers as it does not depend on "node-gyp" and therefore will not require you to install Visual Studio.

It is worth noting that "xml2js" uses "[xmlbuilder](https://github.com/oozcitak/xmlbuilder-js/)" for building an XML document from a JavaScript Object instance.  The "xmlbuilder" package is a useful utility in and of its own right, should you want to use it alone.

**XML Processing (JAXP)**

Java SE provides two main ways to process XML - SAX and DOM.

The SAX approach iterates through an XML document, firing off events of various types as certain matches are found.  This results is far less memory consumption, but more tedious marshaling.

The DOM approach by comparison, takes the entire XML document, and loads it into memory.  It then gives you an API by which you can query the document nodes, regardless of where they may be in the document.

In Node.js the equivalent of SAX and DOM would be "[sax js](https://github.com/isaacs/sax-js/)" and "[jsdom](https://github.com/isaacs/sax-js/)".

**Database Connectivity**

Database connectivity in Node.js is not standardized.  There is also no common delineation of driver "types".  To most Node.js developers, a database package is chosen for the functionality that it provides on top of accessing the database proper, not by the means through which the database is accessed.

- Type 1: JDBC-ODBC Bridge
- Type 2: JDBC-Native API
- Type 3: JDBC-Pure Net Java
- Type 4: 100% Pure Java

Implementation varies widely from Type 1 (JDBC-ODBC Bridge) to Type 4 (100% Pure Java).

In the interest of mapping to known Java SE terminology, what follows is a variety of database access packages grouped by their approach to connectivity.

***Type 1: JDBC-ODBC Bridge***

I was shocked (not judging), but somebody had actually created an ODBC package for Node.js called "[node-odbc](https://github.com/wankdanker/node-odbc)".

***Type 2: JDBC-Native API***

This is where most Node.js database drivers fall in my experience.

- 
[ODBC](https://github.com/wankdanker/node-odbc)

- 
[MS SQL](https://github.com/patriksimek/node-mssql)

- 
[MySQL](https://github.com/felixge/node-mysql)

- 
[Oracle](https://github.com/oracle/node-oracledb)

- 
[Postgres](https://github.com/brianc/node-postgres)

- 
[MongoDB](https://github.com/mongodb/node-mongodb-native)

- 
[Redis](https://github.com/NodeRedis/node_redis)

- 
Type 3: JDBC-Net Pure Java

- 
Type 4: 100% Pure Java

- 
Web Application Technologies

- 
WebSocket (JSR 356)

- 
JSON Processing (JSR 353)

- 
Servlet (JSR 340)

- 
JavaServer Faces (JSR 344)

- 
JavaServer Pages (JSR 245)

- 
JSP Tag Library (JSR 52)

- 
Enterprise Application Technologies

- 
Batch Applications (JSR 352)

- 
Concurrency Utilities (JSR 236)

- 
Dependency Injection (JSR 346)

- 
Bean Validation (JSR 349)

- 
Enterprise JavaBeans (JSR 345)

- 
Interceptors (JSR 318)

- 
Connector Architecture (JSR 322)

- 
Persistence (JSR 338)

- 
Common Annotations (JSR 250)

- 
Java Message Service (JSR 343)

- 
Java Transaction API (JSR 907)

- 
JavaMail (JSR 919)

- 
Web Services Technologies

- 
JAX-RS (JSR 339)

- 
Enterprise Web Services (JSR 109)

- 
Web Services Metadata (JSR 161)

- 
JAX-RPC (JSR 101)

- 
XML Messaging (JSR 67)

- 
XML Registries - JAXR (JSR 93)

- 
Management and Security Technologies

- 
Authentication Service Providers (JSR 196)

- 
Authorization Contract for Containers (JSR 115)

- 
Application Deployment (JSR 88)

- 
J2EE Management (JSR 77)

- 
Debugging Other Languages (JSR 45)

- 
Java EE-related Specifications in Java SE

- 
XML Binding - JAXB (JSR 222)

- 
XML Processing - JAXP (JSR 206)

- 
Database Connectivity (JSR 221)

- 
Management Extensions - JMX (JSR 003)

- 
JavaBean Activation Framework (JSR 925)

- 
Streaming API for XML (JSR 173)
