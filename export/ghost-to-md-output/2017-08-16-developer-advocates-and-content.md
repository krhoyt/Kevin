---
title: Developer Advocates and Content
slug: developer-advocates-and-content
date_published: 2017-08-16T10:38:54.000Z
date_updated: 2019-01-17T00:35:29.000Z
tags: developer, relations, advocacy
---

Congratulations! Your first presentation as a Developer Advocate lay just ahead. You have put in the hours to build a really cool demonstration. It is a masterpiece of elegant code. Now comes the rest of the job.

Being a developer advocate means a lot more than showing up with a shiny demo. Of course we want to educate. Yes, you want to share the problems you encountered. Always be learning from others. There is however an aspect of the role that is often overlooked - everything (all the work) that goes with it.

#### Presentation

There are books on building and giving presentations. You should read them. In the interest of brevity however, here is how I generally go about it.

First, I build an outline. It does not have to have every little detail in it, but it should be decently thorough. Do not forget a slide about who you are, and why we should listen. Also consider the "tell them what you are going to tell them, tell them, then tell them what you told them" adage.

Moving to the slides, I like to put one bullet on every slide to start. Then I head to the speaker notes and start writing the narrative of the story I want to tell. Three or four sentences will work fine here, but if the speaker notes scroll, then I am getting too wordy.

Along the way I might consolidate slides. I might change some of my original assumptions. I might cut pieces that distract from my narrative. The result is that you could effectively read the speaker notes and give the presentation (not that you should do that - **reading your slides is bad**).

Now I will go back and actually build the slides. This might lead to more consolidation, or more expansion. I tend to try for a presentation wherein the slides can speak for themselves without me presenting them, but at the same time, not loaded with bullets to read from. Getting this balance takes time and experience.

Think you have got it? Well, remember, you are a developer, so it is time to refactor. Divide the minutes in your presentation (leaving time for Q&A), by the number of slides in your deck. If you have 40 minutes, and 20 slides, that is 2 minutes per slide. Is that time-to-slides ratio realistic? Depends on your content. Change the narrative and slide content respectively to fit.

> I strongly suggest presenting in the [Ignite](https://en.wikipedia.org/wiki/Ignite_(event)) style at least once in your presentation career. There is nothing quite as effective to make you appreciate just how tight a presentation can be - or how sloppy yours is.

It is worth noting that you probably will talk for too long anyways. Or that the demo will take more time than you thought. Or that guy in the back keeps asking questions you were not ready to answer. Or the event organizer has "a few announcements" that take up a chunk of your presentation. Or there is an AV problem. Or ... rarely does a presentation go to plan.

#### You Did It!

Whew! You made it through! If you are an introvert like me, it is time to crawl into your quiet space and recharge your batteries. Alas, the work of a developer advocate is never done. In fact, the real work has not even begun yet. Let us get busy with the follow-through.

#### Share Your Slides

Chances are, somebody who attended your presentation will want your slides. If they do not, there is a good chance that somewhere down the line, somebody that did not see your presentation will want your slides. Neither will see anything if you do not publish them.

[Slideshare](https://www.slideshare.net/) (part of LinkedIn, part of Microsoft) is among the more common ways to accomplish this task. The more details you can give Slideshare when you publish your slides, the better. You are looking for cross-site search engine optimization (SEO), where discovery of a piece of content on one outlet, leads the consumer to your other pieces of related content on other outlets.

I use Google Slides almost exclusively, and if I have filled the speaker notes with the core narrative of my presentation, and built the slides to speak for themselves, then I will also likely just [share](https://github.com/krhoyt/Jfokus2017/blob/master/iot-chasm.pdf) the presentation openly. I also like to download the [PDF version](https://github.com/krhoyt/Jfokus2017/blob/master/iot-chasm.pdf) of the slides and put them in the GitHub repository with the source code for my demonstration. We will get to your code in a moment.

#### Technical Write-Up

You have been blogging all the problems you encountered when building your shiny demo, right? (Passive aggressive, much?) If not, you should have been. When you run into a problem, that is a blog post. Blog posts do not need to be enlightened masterpieces. I like to think of them as a personal diary and record, that I happen to share with the world. And I look back to [my own blog posts](http://www.kevinhoyt.com/2016/05/20/the-12-steps-of-bluetooth-swift/) frequently to remember how I solved a problem.

At this point however, you have a story to tell. You wrote a narrative for your presentation. You have developed an opinion. Now it is time for the blog post that pulls all those other posts about the problems you encountered along the way, into something more cohesive. It is time to let your opinion loose.

When you are writing this post, do not forget to include links to the [other](http://www.kevinhoyt.com/2017/06/13/conference-abstract-ideas/)[relative](http://www.kevinhoyt.com/2016/08/26/measuring-developer-relations/)[posts](http://www.kevinhoyt.com/2016/06/08/evangelist-advocate-community/), and a link to the GitHub repository. Perhaps embed the YouTube video. Wait. What? What YouTube video?

#### Video

Many conferences will record the video of your presentation. That is good. You should share that on Twitter. It is not uncommon for me however, to create a [YouTube](https://www.youtube.com/watch?v=-1IVtuCmQ9I&amp;t=42s) video of the shiny demonstration as well. Just the shiny parts. Something under ten minutes - ideally less than five minutes. This is what I will embed in my [related blog post](http://www.kevinhoyt.com/2017/02/24/web-bluetooth-bean/).

You might choose [Vimeo](https://vimeo.com/), or some other host. What is important here, as with Slideshare, is that the more details you can provide about the video, when submitting it, the better. For example, the video description might have a link to the blog post. Make sure that your profile is complete, and that it includes your social contact points (Twitter, GitHub, etc.).

It is worth it to put some energy into the production of your demonstration video. An opening title slide is nice. Something that includes your social contact points, the name of your employer, your name and email, and maybe even your photo.

When you record the video, be sure to say something. I cannot count the number of useful projects I have seen with videos of somebody pushing a button and something happening, without any narration. The frustration overwhelms! What looked useful, just became annoying. Talk about what it is that you are doing, and why you are doing it. Yes, you sound funny on video - just like everybody else. What is important is that you sound like you know what you are talking about. That is what will keep me listening.

Sometimes you will experience technical problems at conferences. Some problems are really common, such as getting reliable Internet access. This can of course cause havoc with your shiny demo. Having a recording of your hard work, before you ever set foot into the venue, can pay high dividends on the effort. No Internet? No problem.

#### Source Code

If you are a developer advocate, I am going to assume that you wrote some code for your shiny demo. You put a lot of "sweat equity" in getting the demo working. Do not let that go to waste. Sharing your code on a platform such as [GitHub](https://github.com/krhoyt) is critical.

When it comes to team projects, there are various schools of thoughts on comments in your code. To this I would say that your demo is not a team project - it is educational in nature. You may come back to the code in a year. Somebody else may not need the code for a year. Can you remember what you did and why you did it after a year of projects and presentations?

I prefer heavy commenting in the code I publish that goes along with conference presentations. Not every single line, but I do take the time to comment code that might otherwise seem redundant.

Even if you did comment everything, you still would not have the complete picture. That is where the README file comes into play. Be sure to flesh out the README to reflect the overall architecture of the demonstration. I like to link to the products I use, and describe what it is I used them to accomplish.

> For a workshop, I will actually make the README file the [courseware](https://github.com/krhoyt/WatsonWorkshop).

It is worth considering links to the venue web page, your overview blog post, and video, as well. Again, this is about maximizing your SEO footprint. Cross-linking is key, but you want to do it in a manner that is appropriate, not trashy.

I will also often put references to the presentation venue, the dates, the description, etc. It is always nice to give a bump to the people that gave you the stage, but it is also nice to look back when it comes time for your annual review.

I personally have a dedicated repository for many of the events at which I present. That repository will have all the code, PDF slides from the presentation(s), and the README will contain session titles, descriptions, and links to pertinent content (blog posts, video, slides, etc). Using this approach, you can put a single short link in all your materials for that given conference, and even get some view measurements on the side.

While I do not like repeating content across events, I sometimes get repeated requests for specific content. In those cases, I build a repository specifically for that content. I will strip off the conference specific hooks, and start to treat it as a proper project. The related assets will reflect that.

#### Social Channels

Last, but not least, is the use of your social channels. I have already mentioned tweeting the video recording of your presentation (if there was one) done by the venue organizers. You should also be sure to tweet your blog post overview. Something along the lines of "Video and write-up of my @venue presentation. Thanks for having me! [http://my.blog.com/presentation](http://my.blog.com/presentation)" will do nicely.

Twitter is currently the most dominant social channel for developers, so I have used it as an example throughout this post. It is not however, the only social network. If you feel that your Facebook community will be interested in your content, then you should certainly publish it there as well.

I actually consider [Medium](https://medium.com/@krhoyt) (at the time of this writing) to be another social channel. While your blog should be the center of the technical articles you write, it is not uncommon to re-post on Medium, or even a corporate blog. While these platforms come and go, and your employer may change, you want to be able to keep the legacy of your hard work intact. This means presenting your brand, in its entirety, on your own domain.

#### Next Steps

Wait a second. You expect ...

- Build the shiny demo
- Present the shiny demo
- Share the shiny demo code
- Share the presentation
- Video the shiny demo
- Write about the problems
- Write about the shiny demo
- Tweet the shiny demo
- Cross-link it all

All while I am ...

- Attending corporate meetings
- Submitting call for papers
- Booking travel
- Actually traveling
- Filing expenses from the travel
- Keeping email under control
- Attending meetups
- Running my own meetup
- Contributing to open source
- Monitoring the Twittersphere
- Helping people on Stack Overflow
- Helping organize corporate events
- Learn new technologies ... squirrel!
- And any other fire drills

Yes! I do! That really is the whole point of this post - being a developer advocate is a full-time job.

People (and by "people" I mean senior management) often see the jet-set, beer drinking, party attending, side of advocacy, and nothing else. And sure, advocacy is a cost center, and they approve the expenses every time. They are going to see that side of it.

The reality is that developer advocacy done right takes an immense amount of effort. The landscape is constantly shifting. There are deadlines looming everywhere. In my experience, if you cannot learn to manage all of this in three years, you will burn out, and leave developer advocacy as a career. It is that kind of a workload - people burn out in under three years.

> And by burnout, I do not mean take a holiday and feel better. I know advocates that burned out and now raise sheep on a farm (not kidding).

If you are senior management reading this, I would implore you to respect the load put upon developer advocacy (developer relations on the whole). The last thing advocates need is for you to start demanding justification for their existence - telling them about KPIs they need to hit. Some magical out-of-thin-air number of activations goal. Or to show up suddenly with new demands.

**Advocates have enough to do already, just to do the job properly for you.**

Rather than view developer advocates as a marketing/sales hybrid that you can screw tighter for better results, respect advocates as professionals in their own right. Advocates want to help their employers. They are going to operate in the best interests of the company. All you have to do is remove the occasional barrier, and stay out of the way, in order to reap the rewards.
