---
title: Watson Conversation System Entities
slug: watson-conversation-system-entities
date_published: 2017-06-08T10:45:00.000Z
date_updated: 2019-01-17T00:38:21.000Z
tags: watson, conversation, nlu
---

If you are building a chatbot, then Watson offers a product called Conversation. If you are wanting to get keywords from a body of text, Watson offers Natural Language Understanding. Sometimes however you are looking for something in-between. This is a post about that in-between.

#### Natural Language Understanding

The [Watson NLU](https://www.ibm.com/watson/developercloud/natural-language-understanding.html) API is great for getting a deep understanding (hence the "U") about a larger piece of content. The taxonomy of a blog post for example. The more content you throw at it, the better the results. So what happens when all you have is "I will be home tomorrow."?

There is not enough meat there for NLU to be very helpful - in fact, it may not be enough for it to figure out anything. It is a simple conversational phrase. Depending on your application however, the words "home" and "tomorrow" have real meaning and real impact to what actions come next.

#### Watson Conversation

[Watson Conversation](https://www.ibm.com/watson/developercloud/conversation.html) is a fantastic tool for building a chatbot solution. The web-based visual tooling, lets you design how the chat should take place. For every action in the tooling, there is a REST API to support it. Your application will generally integrate via this API.

One of the APIs that is exposed, and will mostly likely be the center point of most application integration, is posting a message. This is effectively the user telling the chatbot some piece of information. The content gets evaluated by Watson Conversation, run against the workflows you have described with the tooling, and returns some information for your application to pass along to the user.

In this flow, Watson Conversation certainly needs to understand "I will be home tomorrow." This is where system entities come into play.

#### System Entities

As humans, we know that "home" is a location, and that "tomorrow" refers to the next day. If we know the current day is "June 5" then we know that "tomorrow" refers to "June 6." Or specifically, for an application "06-06-2017".

Another example might be "I have three dollars." The word "three" there might be something specific that your application wants to know means "3" as a number. This is what system entities are all about. They are exposed in the Watson Conversation tooling as "@" directives, but we can view them, and work with them directly from our application code as well.

#### Post a Message

To post a message, and get system entities, it is expected that you have created a Watson Conversation instance in your [Bluemix](https://console.ng.bluemix.net/) console, and that you have create a workspace. The workspace does not even have to have a workflow designed - it just needs to exist. With our Watson Conversation username, password, and workspace ID in hand, we can then POST a message to the API.

    curl -X "POST" "https://gateway.watsonplatform.net/conversation/api/v1/workspaces/f9731df0-ff4b-4179-a7dd-57ffcffdd102/message?version=2017-05-26" \
         -H "Content-Type: application/json; charset=utf-8" \
         -u 2afd321f-e2bd-44e6-9d4b-e7c161b62d39:4finK0sGgiVc \
         -d $'{
      "input": {
        "text": "I will be home tomorrow."
      }
    }'
    

The response will be a JSON-formatted string. Among the details of the response will be an array of "entities". Each entity will have some type specified in the "entity" property. The "location" tells you where in the provided string Watson thinks that entity applies. The "value" will vary depending on the type of entity. For this example, one entity is a "sys-date" so the value is the respective date. Finally Watson will give you a "confidence" level between zero (0) and one (1).

    {
      "intents":[],
      "entities":[{
        "entity": "amenity",
        "location": [10,14],
        "value": "place",
        "confidence": 1
      },{
        "entity": "sys-date",
        "location": [15,23],
        "value": "2017-06-06",
        "confidence": 1,
        "metadata": {
          "calendar_type": "GREGORIAN",
          "timezone": "GMT"
        }
      }],
      "input":{
        "text": "I will be home tomorrow."
      },
      ...
    }
    

This turns out to be super helpful, even if our application is not involved in a conversation. Say for example, in a date picker that lets the user specify the timeline using natural language. Rather than have a date picker proper, they could simply type in "tomorrow" and Watson Conversation could then take care of the rest. What is the rest of the conversational output? For a date picker? Who cares! In the case of a date picker, we can use the service solely for that natural language feature.

#### Bonus Round

To help visualize Watson Conversation system entities, I have put together a [simple application](http://intense.mybluemix.net/). You enter the phrase you are interested in testing, and the application will list out the resulting system entities. I wrote the application using Node.js on a Cloud Foundry instance in Bluemix.

![Watson Conversation System Entities](http://images.kevinhoyt.com/watson.conversation.entities.png)

Since I have just one function, I later decided to go serverless with [OpenWhisk](https://developer.ibm.com/openwhisk/). You can find the Node.js code, the OpenWhisk function (in JavaScript), and even a Python version you can test from the CLI, in a [GitHub Gist](https://gist.github.com/krhoyt/242cf8f3e483365c30edc4c711c93ce0) I created. I will write more about the OpenWhisk implementation in a future post.

#### Next Steps

To be clear, system entities is still a beta feature. The [documentation](https://www.ibm.com/watson/developercloud/doc/conversation/system-entities.html#sys-datetime) calls out being able to find locations as well, but in my testing, that is not yet ready for production. For example "I will be in Boston tomorrow." will eventually be able to pick out not only the date, but "Boston" as a geographic location. Would this be useful to your application? Let me know in the comments below, and I will pass your specific feedback and use-case on to the product team.
