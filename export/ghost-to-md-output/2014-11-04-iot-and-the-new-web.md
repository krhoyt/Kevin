---
title: IoT and the New Web
slug: iot-and-the-new-web
date_published: 2014-11-04T21:00:00.000Z
date_updated: 2015-04-21T14:25:31.000Z
tags: iot, web, architecture
---

*All too often, we as developers, focus on technology for what it can do for us - and usually in a particularly one-sided conversation. Every now and again however, there comes a time when we need not to look at technology for what it can do for us, but rather what we can do for it. Such is the case with the Internet of Things (IoT), which was the topic of my recent presentation (October 2014) at [IoTa Conference](http://www.iotaconf.com/kevin_hoyt.html) in San Francisco, California.*

---

Before we get too far in the technology weeds, let us take a moment to step back and talk about today's consumer.

### Consumer Expectations

I am an Army veteran (1991 - 1995). As a veteran, the United States government provides me with various benefits that I can opt to use. I have, from time to time, leveraged these benefits, as was the case recently. In order to secure said benefits, I was instructed to print a form from the Veterans Affairs (VA) website, fill it out, and then fax it to the St. Louis, Missouri office. At that point, my request would be put in a queue for completion, and it would be an estimated four weeks before I heard back.

If I filled out the form incorrectly, or was missing pertinent information, I would be required to go through the process again.

This is not a consumer experience we have come to expect from the rest of our daily interactions in a modern society. Sure, there was a day when the fax machine ruled supreme; when mobile phones were far and few between, and the Internet was still just a dream. In fact, the first photo facsimile was sent in 1924 (of then President Calvin Coolidge, from New York, New York to London, England). Nearly 100 years later, and I'm not sure most teenagers would even know what a fax machine does.

![The first photo facsimile was of Calvin Coolidge in 1924.](http://images.kevinhoyt.com/calvin.coolidge.jpg)

Conversely, business today thrives (some might say "chokes") on email. Near immediate responses are expected. And if email is not fast enough, you can lean on some fashion of instant messaging. You can even track your FedEx or UPS packages in near real-time. Amazon.com currently provides two-day delivery, and is working on delivery by drone in under thirty minutes.

Business today is driven on instant gratification - it is the very fabric of the current generation. While the long-term impact of such a mindset is being researched (building a personal savings is a long-term financial goal), the reality for business is that consumers expect real-time interactions.

### Enter the Web

It surprises me then that in a world driven by real-time expectations, so much of our technology is driven by the request/response technology of HTTP. A client makes a request, the server sends a response, and then the connection between the two is terminated.

From a physical computing perspective, this is effectively my fax experience with the VA.

I make a request for benefits by faxing a document. At some point in the future, an actual person picks that document up, and does something with it. Eventually, I get an email that the fax was received. And finally, the connection is severed. I have no idea what else is going on at the VA, nor does the VA understand the urgency of that benefit in my world. I can only hope that at some point in the future, my benefits come through.

On the Web, we have managed to gloss over this inconvenience by using approaches such as Ajax. Using Ajax we can effectively impact the user experience - specifically the perceived performance of the application. The time it takes for the user to move their mouse to a point on the screen and click, is valuable background processing time for our application.

> I suppose it is tempting, if the only tool you have is a hammer, to treat everything as if it were a nail. - Abraham Maslow

Of course we know that there are many dominoes stacked along the way, and that the connection may be slow, the server may be slow, or the client may be slow in processing the data. So long as we play our cards right though, some degree of instant gratification is achieved.

And so goes the technology trap. When we come to the world of IoT, we bring with us this set of tools. And as the old adage goes, if you have a hammer, everything looks like a nail (Law of Instrument, Maslow, 1966).

### The Arrival of IoT

When it comes to IoT, the first thing that most developers will do, is to take something like an Arduino, and put a web server on it. The reasoning behind this is that we can request a resource from the Arduino, it will gather some information about the hardware, and then send a response with the details. While this is certainly possible, the side effects are not without consequence.

> The scalability of a micro-controller-based web server, is certainly not equipped to handle anything more than one-off requests.

Running a web server on a microprocessor as limited as the Arduino, means that you are likely going to need to plug into a wall outlet for power before too long. The scalability of a micro-controller-based web server, is certainly not equipped to handle anything more than one-off requests (many are written this way intentionally). Good luck getting security features into that limited profile. And then there is the user experience, which is slow and intentional - far from the business demands of immediate gratification.

Through my next series of posts, I will introduce you to my brand new (fictional) startup called "The Widget Company". Each post will walk through introducing a brand new, life-changing (not really) product. We will take a look at how these devices are connected the Internet, and the resulting user experience. Along the way, we will fight to leave our technology toolset baggage behind, and broaden our horizons as to the possibilities that may have come before HTTP and request/response, that may be better suited to our IoT needs.
