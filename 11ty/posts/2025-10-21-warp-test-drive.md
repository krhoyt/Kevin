---
description: AI is coming for your terminal. I spent an afternoon testing Warp's Agentic Development. The results were surprising, humbling, and kind of inspiring.
feature_image: /img/covers/black.hole.jpg
unsplash_author: Bolivia Inteligente
unsplash_author_url: https://unsplash.com/@boliviainteligente
unsplash_photo_url: https://unsplash.com/photos/a-blue-and-white-object-floating-in-the-air-GH6uTRKPK0Q
title: Warp Test Drive
permalink: /blog/2025/10/21/warp-test-drive/
tags:
  - AI/ML
  - App Dev
  - Enablement
rating: 1
---

Is it vibe coding or vibe debugging? Is AI assisting you or making you lazy? Is the industry shutting out junior developers or making them more productive more quickly? These are hard, often philosophical questions. Once thing is sure however - AI is here to stay. Refusing to acknowledge AI, and to learn how to use it for your workflow(s), is putting your head in the sand and ignoring the inevitable. 

That is where my experiment with Warp began - somewhere between curiosity and skepticism.

## Some Background

I first got to work with AI back in 2017 while at IBM. Back then we did not really refer to it as AI as much as machine learning (ML, or AI/ML at best). IBM Watson provided various ML-oriented services, and we developer advocates were first on the ground to teach other developers how to use those services. This included everything from transcription and sentiment analysis to image recognition, and even building custom models.

Fast forward to 2022 while at Amazon where I managed the documentation team focused on [SageMaker](https://aws.amazon.com/sagemaker/) (custom ML models). Of course ChatGPT launched in 2022 as well, and generative AI in general began its explosive adoption rate. Technical writers generate text, too, so we were very interested in what these new tools could do for us. We were not about to send documentation for unreleased product to a public API, but when [Amazon Bedrock](https://aws.amazon.com/bedrock) was released, providing data protections, we jumped at the opportunity.

With collaboration and input from a team of technical writers, I built tooling that leveraged generative AI from the ground up to see what we could do. Ownership was eventually handed off to an engineering team who scaled the project across the 200+ organization of writers.

More recently, in a freelance capacity, I have gone deeper into generative AI for my customers. This work has included vector and graph databases against custom datasets, as well as agentic tooling such as [n8n](https://n8n.io). Along the way, I have used ChatGPT and Claude Code extensively to help me with complex algorithms, and even to scaffold projects and features.

I have a lot of opinions on my exposure to all these technologies, but that is not the point of all this background. The point is that I have a broad experience with both generative AI as well as ML, both from a user and implementation perspective. I recently had the opportunity to bring that significant practical experience to kick the tires on [Warp’s Agentic Development Environment](https://www.warp.dev/).

> Full disclosure, I am actively seeking new work. If you find any of this background inline with what you need for your organization, then feel free to reach out on [LinkedIn](https://www.linkedin.com/in/parkerkrhoyt/).

## Moving at Warp Speed

Warp calls itself an ‘agentic development environment’ - which means it does not just execute your commands, it helps you decide what to do next.   

Warp surfaces as a replacement for your terminal. Warp allows you to interact with the command line like you would with any other terminal. When Warp detects natural language it switches out to a generative mode. The default settings choose a model and approach that is most efficient, but you can choose your own adventure as well for those times you need more reasoning from the model. Features and settings abound to let you customize how Warp interacts with both you the developer, and the underpinning models.

## Hiring Challenge

To get started, I used the Warp "[hiring challenge](https://github.com/warpdotdev/hiring-challenge)". The hiring challenge presents you with a data file of space missions. The data file weighs in at over 9 Mb, and contains over 100,000 missions. The columns for each data row are separated by a pipe `|` symbol, but there are comments and other labels in there to keep things interesting. The objective, as outlined in the [challenge description](https://github.com/warpdotdev/hiring-challenge/blob/main/mission_challenge.md) is to use Warp to generate an AWK command to parse the data file and determine the security code of the longest successful Mars mission.

Here is the thing though... The description reads like a product requirements document (PRD). My first instinct then was to clone the repository and tell Warp to deliver on the PRD. This worked out well because when you first install and run Warp, and head off to start a new project, you will be given the opportunity to do just that - import a repository. Warp automatically read the PRD, and got to work on generating the AWK command. Along the way, it checked itself too, which is reassuring. A few minutes later, I had the command and the desired output.

Well, um, that was easy. Suspiciously easy.

## Going Deeper

While I have run across AWK before, I would never claim to be an expert in its syntax, so I asked Warp to generate a Node.js file that would complete the challenge. Again, a few minutes later, I had what I wanted in a language/syntax with which I was familiar. 

In reviewing the code, I found it to be complete and comprehensive. It was not quite what I would have written myself, but I appreciated the nod to async/callback processing given the size of the data file. I ran the script and was presented with the same answer as the AWK command.

At this point, I had clicked a few buttons, and run a few commands - easily toggling between natural language and classic CLI along the way. I had spent about thirty minutes (including the install and sign up), and had set aside an afternoon. Time to ratchet things up a notch.

## More Complexity

If I really wanted the answer presented by the PRD, then I would import the data file into a database, and use the magic of SQL to dial in an answer. Okay, Warp, generate a Node.js file to put the missions into a SQLite database. And it did. It even installed a modern library to work with SQLite. I ran the script, and moments later had myself a nice little SQLite file. I opened up [TablePlus](https://tableplus.com/), and ran some SQL. Yup, same answer. All systems go.

> I do not know why, but I chose to write the SQL by hand myself. Old habits die hard? Scared of being confronted with the reality that the tool was killing what took me decades of experience to learn? Denial?

I had not hit a roadblock yet with Warp. It had even gone above and beyond in some cases. It is not a real test until you have broken something, so time to get back at it. If I had a database, I figured I might as well take the next step and turn it into an REST API. I wanted to dial up the specificity a bit so I asked Warp to generate a serverless function to be deployed on [Netlify](https://www.netlify.com/). 

Warp did deliver a serverless function, and that function worked, but it was an older, non-ESM, implementation. It also did not take into consideration any CORS and/or bot handling. I did not ask Warp to do that, so not really a big miss, but it opened the door to push the edge a bit more. Rather than iterate through these changes, I pointed Warp to an example Netlify serverless function I had from another project. Warp adapted seamlessly.

Okay. This is just too fun.

Since I am ultimately looking for a specific answer, not just a data dump, we are going to need some sorting and filtering URL parameters. What say you, Warp? Yeah, no problem. I deployed and hit the API through the browser, added my sort and filter requirements, and just like that I had the same answer staring at me from the first row of the JSON results. Well, I guess the only thing left is a UI.

## Home Sweet UI

Having spent 15 years at Adobe, most of that time spent teaching developers to implement cutting edge user interfaces (with Flash, Flex, and ultimately web standards across devices), user interface development and design is a bit of a sweet spot for me. It feels comfortable. It is the basis of what enabled me to build the generative AI tooling at Amazon. My first role at IBM was actually testing developer SDKs for completeness and idiomatic usage across Android (Java) and iOS (Swift).

Svelte 5 makes for an interesting test for generative AI solutions. Svelte 5 was released just around the time of some of the major cut lines LLMs. Features have been added since then some LLMs simply do not know about. Also, I wanted to play with some of those new features myself, so I headed down the Svelte 5 path for this project.

I implemented the UI myself, again wanting to experience these new features first hand, but I now found myself confidently asking Warp for code snippets whenever needed. Warp had become an ally. The assistance I asked Warp for ranged from building the REST URL dynamically from user interactions, to one-liners around media queries and other markup that I was too lazy to research myself.

When I went to build the Svelte project, I needed to change the adapter for my static SPA approach. Warp handled that for me without a problem. [Check out](https://hire-me-warp.netlify.app/) the final results. The application is responsive, supports mobile, and includes sorting on columns, as well as status filtering.

[![Space Missions](/img/assets/warp.test.drive.png)](https://hire-me-warp.netlify.app/)

## What Was Missing

I know that I barely touched the full capabilities of Warp. I will be honest, I was expecting it to bomb. It just kept getting better. Hindsight, if I had expected Warp to be this good, I probably would have just written PRDs for the various features I ended up building, and then had it generate the implementation. My experience with other generative AI tooling for developers had taught me that was a bad idea, so I went at the challenge piecemeal. I still got across the finish line, and in record time with a code base I trusted, but it would be an interesting experiment to try PRD-driven development.

The feature I found that I wanted but that was not there is the ability to use local LLMs. There is a lot of really innovative work going on outside the big players. There are features provided by open source LLMs, such as image generation, that I think would really round out the experience. For enterprise or privacy-conscious workflows, such as the generative tooling I made at Amazon, local LLM support would be a game changer.

## Final Thoughts

In the end, I did not really use the "agentic" aspect of Warp. Warp was fast enough, and complete enough, and accurate enough, and this project was small enough that it never really surfaced as a need. That being said, when I think of agentic workflows as presented by tooling such as n8n, I think there is a lot of room for Warp to expand. Warp sees the input to an agentic workflow as a prompt. There is no reason it could not watch files, directories, support tickets, etc. and get to work without me needing to prompt. Put together with local LLMs and I could see tasks like product image resizing, icon generation, etc. without additional token costs.

All in all, Warp is a fantastic improvement to my experience with other generative AI tooling. If you are looking to pull your head out of the sand and get acclimated to this new AI-powered future of development, you do not need to look any further than Warp. Personally, I came expecting a terminal replacement with some AI bells and whistles. I left convinced that the future of development is not about AI replacing us - it is about AI working *with* us. Warp gets that balance right.  
