---
title: Tetris with Virtual Controller
slug: tetris-with-virtual-controller
date_published: 2015-06-09T15:54:47.000Z
date_updated: 2020-06-29T17:40:47.000Z
tags: kaazing, cross, game
---

*As somebody educated in Information Technology, I have always had an admiration of game developers.  Despite the interactive experience and immersive graphics, there is just some black magic in the architecture that leaves me in awe.  While I have had my hand at small games in the past, I decided that I would have a crack at [Tetris](http://en.wikipedia.org/wiki/Tetris), using a real-time virtual controller.*

---

This is reposted on the [Kaazing Open Source Blog](http://kaazing.org/blog/tetris-with-virtual-controller/).

### Research

While I wanted to solve the algorithms on my own, it never hurts to take a look at see what has been done already.  The first port I found with reasonably compact code, was done in [Python](http://inventwithpython.com/pygame/chapter7.html).  A little more searching led me to one ported to [JavaScript](http://codeincomplete.com/posts/2011/10/10/javascript_tetris/).

The problem (for me) with both of these is that they used traditional graphics routines for the drawing.  While I suspect this is how the original Tetris is written, I wanted to make the game using the DOM for crisp rendering across platforms.

> Covering in detail how Tetris works is beyond the scope of this blog post.  Instead I will focus predominantly on tips I learned along the way, and implementing a virtual controller.

I also felt that using the DOM would provide me with a game that was easier to style (using CSS, SVG).  This is important for my game because I wanted to be able to easily change the graphics to reflect holidays, conferences, and other special events.  Imagine animated GIFs for the color fills of the falling blocks.

All the ports I found (without too much digging) also used the keyboard to control the game.  This would be fine if you are sitting at the same machine, but decoupling the game from the controller would bring new possibilities to the game.  I could for example use an Arduino or other hardware for my own custom controller.

### Game Board

My approach resulted in two parts - the game board, and the game controller.  The game board would display all the visuals you might normally encounter when playing Tetris.  The game controller would be the buttons on a traditional physical controller that you might push to move the visual pieces around.

The traditional game board is ~20 cells high and ~10 cells wide (depending on who you ask).  For my game board, I decided to stick with the 20 cells tall, but make the entire screen width the width of the game board.  Depending on your device, this could be upwards of 1,000 individual DOM elements to represent the board.

At first I tried using querySelector() to get the cells as they needed rendering.  This turned out to be far too slow.  Instead, I stored references to the cells as I created them to fit the device display.  The result is most certainly a high memory requirement, but also a much faster access to drawing the board (by styling the cells).

I also originally went with setInterval() for my game clock.  In order to keep a reasonable frame rate during game play, I set a very low interval rate.  This really put a load on the CPU (fans spinning).  In the end, I went with requestAnimationFrame() which kept frame rates high and CPU usage much lower (no more spinning fans).

The game board itself has two representations.  There is the visual one you see while playing, but also a logical one that tracks where blocks have been placed.  Rather than create another 1,000 element array, I use data attributes on the cell reference array I already had.  Using getAttribute() and setAttribute() had no noticeable impact on game performance.

![Tetris game board in action.](http://images.kevinhoyt.com/tetris.game.board.jpg)

### Game Controller

The hardest part of building the game controller was in managing the device orientation.  I was using my iPhone during development.  Full screen support for Web applications is flat out [not supported on iOS](http://caniuse.com/#search=full) - **way to be Web-friendly Apple**.  Also on Safari iOS8 the toolbars appear and disappear at what seems like their own timing.

In the end, I decided on a height-to-width ratio that would fit regardless of the toolbars being present or not.  This still left me with plenty of room for game controls.  I did not put too much effort into styling, and instead played the game repeatedly until I had sizing that felt reliable and comfortable for my hands.

> Having some tactile feedback would really help with Web-based games.

The game controller is designed such that it does not have to be a separate device.  The game can be played with two desktop browsers for example.  This means I need to listen for touch events, and react accordingly.  The controller also cares about when a button is pressed, and when it is released.

![Tetris virtual controller with and without Safari interference.](http://images.kevinhoyt.com/tetris.virtual.controller.jpg)

### Linking Board and Controller

Once I had performance of the game board ironed out, and a placement of the game controller dialed in, the next part was to link the two devices.  This would normally be pretty tricky.  In fact, many native iOS games only allow for this over local wireless or Bluetooth - where the devices can search each other out.

Thanks to the power of Kaazing Gateway, and the publish/subscribe pattern, the only thing the two devices need to communicate is a common messaging topic.

When the game board loads, a [QR code](http://davidshimjs.github.io/qrcodejs/) is presented.  The contents of that QR code is a URL to the game controller.  That URL also has a query string appended to it that uniquely identifies that specific game.  This query string effectively represents the messaging topic.

If the game controller device is a smartphone, a QR code scanner application can retrieve the URL (including the query string) from the game board.  This will in turn launch a browser on that device, and load that URL.  The game controller picks off the query string, and is then ready to publish to that specific message topic.

In fact, once the controller has loaded, a message is sent to the game board to tell it to hide the QR code, and start the game.  As buttons are pressed and released, those events are passed as messages to Kaazing Gateway, which are in turn sent to that specific game board.  [Game on!](http://tetris.kevinhoyt.com)

### Next Steps

It still very much surprises me how many native games (iOS or otherwise) still use local lookup mechanisms to establish a connection between two devices, and to communicate game state.  The **Real-Time Web** is here, and Kaazing Gateway would allow these games to securely use the open Internet without sacrificing communication performance.

> Kaazing Gateway also works across platforms, so you get a similar API across whatever technology stack you might choose to use.

There are two directions I would like to take this project:

- 
Introduce a network of decoupled hardware sensors, placed on various points on the body.  Want to move a piece left? Lift your left leg.  Want to rotate the piece clockwise?  Spin your left arm around.

- 
Another fun development would be head-to-head play.  Show two boards on the same screen at the same time.  Then let two virtual controllers join.  Rows removed from one player's board, end up on the other player's board.

I have posted the source code for the game to my [personal GitHub account](https://github.com/krhoyt/Kaazing/tree/master/tetris).  Because Kaazing offers a free "Sandbox" instance for you to get started using, you can also have your hand at my port of Tetris [right now](http://tetris.kevinhoyt.com).  Do not let request/response keep your applications limited, join the Real-Time Web today by checking out the [getting started guide](http://kaazing.org/demos/quick-start/).
