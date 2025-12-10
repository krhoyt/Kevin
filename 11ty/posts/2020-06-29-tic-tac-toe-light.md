---
feature_image: /img/covers/tic-tac-toe.jpg
unsplash_author: Matthew Davis
unsplash_author_url: https://unsplash.com/@treatzone
unsplash_photo_url: https://unsplash.com/photos/white-and-green-box-on-table-iCp8p7wVXS0
title: Tic-Tac-Toe Light
description: WebSockets and IoT are a performant and efficient pairing, and I asked the audience at HTML5 Developer Conference to prove. A tiny Arduino vs. an audience of well over 100 developers just waiting to break things.
permalink: /blog/2020/06/29/tic-tac-toe/
tags:
  - Web
  - IoT
rating: 1
---

*I had the great privilege of being a speaker at [HTML5 Developer Conference](http://html5devconf.com/) in San Francisco recently.  It was the second HTML5 Dev Conf I have presented at, with the first one being October 2013.  This time, I paired with [Frank Greco](https://twitter.com/frankgreco) to present a session entitled "[WebSockets: Past, Present and Future](http://html5devconf.com/speakers/frank_greco.html#session)".  Frank took the stage for the first half of the session, and I followed up with some hands-on Internet of Things (IoT) demonstrations that were integrated with [Kaazing Gateway](http://kaazing.com/).*

This is reposted on the Kaazing corporate [blog](http://blog.kaazing.com/2014/06/04/real-time-tic-tac-toe-light/).

### Introducing the Tic Tac Toe Light

My personal favorite demonstration was a project I called the "Tic Tac Toe Light".  I called it this because the custom-built enclosure houses nine (9) [Adafuit NeoPixels](http://www.adafruit.com/products/1312) in a three-by-three (3×3) grid.  The enclosure, made using [foam core board](https://flic.kr/p/nNeFJz) and a hot knife, also contained an Arduino Yun.  I have grown to be a big fan of the [Arduino Yun](http://arduino.cc/en/Main/ArduinoBoardYun) for real-time IoT/web projects.  The board is the same profile as an Arduino Uno, but includes integrated wireless (802.11 b/g/n), an ATmega32u4 (similar to the Arduino Leonardo), and a Linux system on a chip (SoC).

![Tic Tac Toe Light in action](/img/assets/tic.tac.toe.action.jpg)

![Inner-workings of the Tic Tac Toe Light](/img/assets/tic.tac.toe.guts.jpg)

![Tic Tac Toe Light on the Web](/img/assets/tic.tac.toe.web.png)

Using a [web-based user interface](http://tictactoe.kevinhoyt.com/), attendees of the HTM5 Dev Conf session could use their laptop, tablet or smartphone to control each NeoPixel (RGB LED) in the enclosure.  At the same time, the web user interface kept in sync with all the attendees selections – across all screens.  The Arduino Yun was also listening on a real-time connection for color change messages, which is how it knew what lights to change to what colors.

### Why Kaazing Gateway

I think the bigger question here is "Why real-time?"  Although I do not know the exact count, I would say that the session had nearly 200 attendees.  The ATmega32u4 has a clock speed of 16 MHz with 32 KB of RAM.  If all those attendees were selecting light colors at anywhere near the same time using HTTP, the Arduino would be crushed under the load.  In a real-time scenario however, there is but one connection, and about twenty (20) bytes of data for each color change.  The end result was a far more scalable solution.

![Tic Tac Toe Light live on stage.](/img/assets/tic.tac.toe.live.png)

And it had to scale too!  The lights on the Tic Tac Toe box were [blinking wildly](https://vine.co/v/MwaYH6EqUBL) for the duration of the time I had it plugged in (before I had to move on to my next demonstration).

Can you imagine the user experience over HTTP, even if the 16 MHz chip could handle the load?  You would select a color, and at some interval later, the color would be set.  That lag however would leave you wondering "Was that my color selection?"  This as compared to an instant response using Kaazing Gateway, even over conference wireless.  Not to mention keeping all the other connected users in sync.  The additional HTTP polling load for that would make the whole project come to a crawl (or just crash).

### Next Steps

The 3×3 grid was actually happenstance – I happened to have ten (10) NeoPixels on hand in my component drawer.  I wanted a square, so 3×3 it was.  This led to the name of Tic Tac Toe.  But then I started to wonder.  What if this was the physical manifestation of two players in an actual game of tic-tac-toe?  Or even better yet, maybe [artificial intelligence](http://www.zdnet.com/ibm-to-open-up-watson-to-third-party-developers-7000023194/) (AI) on the server was playing the other side in real-time!

This is where I would like to take the project next.  If you want to see the code for the project, you can hop on over to my [GitHub account](https://github.com/krhoyt/Kaazing/tree/master/tictactoe) where I have posted more details, as well as code itself for the Arduino Yun and the web client.  The fabrication plans are also posted there should you want to take on a project like this yourself.  If you have any questions, feel free to hit me up on [Twitter](https://twitter.com/krhoyt), or drop a comment below.

### Credits

Thanks [Matthias Schroeder](https://twitter.com/IxDesigner) for the [Vine video](https://vine.co/v/MwaYH6EqUBL) of Tic Tac Toe in action during the session.
