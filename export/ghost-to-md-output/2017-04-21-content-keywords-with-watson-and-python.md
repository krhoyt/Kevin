---
title: Content Keywords with Watson and Python
slug: content-keywords-with-watson-and-python
date_published: 2017-04-21T21:26:41.000Z
date_updated: 2019-01-17T00:42:56.000Z
tags: watson, python, nlp
---

I am always impressed by Python when I have to use it. The community always has great content, and the surface coverage of the language is immense. This allows you to do a whole lot in a very few lines of code. While I generally have to use Python on my Raspberry Pi projects, I recently needed it in aggregating content.

#### Natural Language Understanding

Watson has a couple Natural Language Processing (NLP) APIs. One is a [rote classifying](https://www.ibm.com/watson/developercloud/nl-classifier.html) designed to help you figure out the meaning of the content provided. This is useful in chatbot and other types of applications.

The other API, [Natural Language Understanding](https://www.ibm.com/watson/developercloud/natural-language-understanding.html) (NLU), gets more into the semantics of the content, giving you deep insight into how the language of the content is used. One of the abilities of this API is retrieving key words of the content - perfect for aggregating content.

#### Requests

As Watson exposes NLU as an HTTP-based API, this makes it very approachable for Python. The key library in Python for making HTTP requests is, as you might expect, [Requests](http://docs.python-requests.org/en/master/).

    # Assemble API parameters
    # Keywords only please
    params = {
      'version': '2017-02-27',
      'url': config['url'],
      'features': 'keywords',
      'keywords.emotion': 'false',
      'keywords.sentiment': 'false',
      'keywords.limit': config['limit']
    }
    
    # Call API
    # JSON results to Python dictionary
    req = requests.get( 
      config['api'], 
      auth = ( config['username'], config['password'] ), 
      params = params 
    )
    res = req.json()
    

The parameters can be provided to the API via a file upload, or a query string arguments. I will be using query string arguments for this example. Most of the parameters I am providing here tell Watson to narrow down how it processes the content. I do not need all the semantics for my application, just the keywords.

> The content for this API should live on the Web somewhere.

HTTP Basic Authentication is used widely by the Watson APIs, and the Requests library provides credentials using the "auth" parameter. The Watson username and password will be provided for you when you register the service in your [IBM Bluemix](https://console.ng.bluemix.net/) account.

The results from interacting with the NLU API is a JSON response. Now we have the keywords. Perfect!

#### Not So Fast

Perfect, except, the Watson NLU API keywords may include more than one word. I do not really want this for my application. I want a list of single words. A little Python parsing will make quick work of this for us.

    # Hold results
    results = []
    
    # Iterate found keywords
    for keyword in res['keywords']:
      # Over relevance threshold
      if keyword['relevance'] > config['threshold']:
        # Split keywords with more than one word
        # Single words into array of one element
        if keyword['text'].find( ' ' ) >= 0:
          words = keyword['text'].split( ' ' );
        else:
          words = [keyword['text']]
    
        # Words in this keyword
        for word in words:
          found = False
    
          # Discard known keywords
          for existing in results:
            if existing['text'] == word:
              found = True
              break
    
          # Place into cleaned results array
          if found == False:
            results.append( {
              'relevance': keyword['relevance'],
              'text': word
            } )
    

First, we need a place to store our new, optimized list, of keywords.

Next we start looking through what Watson provided. Watson gives keywords a "relevance" score. After about the seventy percentile, it gets kind of broad, so I have opted to limit my optimized list to matches above that range.

Then I split the Watson-provided keyword, if it has a space, into an array of isolated words. If there is only one word, then I just shove that into an array with a single element.

    From this:
    0.959446: blockchain
    0.769433: data
    0.735896: database
    0.735514: blockchain network nodes
    0.715231: problem
    0.700369: data storage tier
    
    To this:
    0.959446: blockchain
    0.769433: data
    0.735896: database
    0.735514: network
    0.735514: nodes
    0.715231: problem
    0.700369: storage
    0.700369: tier
    

Keywords given by Watson may show up repeatedly, and I do not want that - just unique entries, please. To account for that, I check the optimized list against the word in this specific iteration. If it is not found, then I add it to the optimized list.

    # Here you go
    for keyword in results:
      print '{0}: {1}'.format( keyword['relevance'], keyword['text'] )    
    

For demonstration purposes, we may want to see what our optimized list looks like. We can use the Python "format()" function to take care of that.

#### Next Steps

For my aggregator, turn this array of Python dictionary instances into JSON, and store them in [IBM Cloudant](https://cloudant.com/) along with other information. With that, I am able to build a fairly rigorous news feed aggregator, based on the actual language, and not arbitrary string processing. Pretty cool!

I have made a [GitHub Gist](https://gist.github.com/krhoyt/e3aa96650a7dfca4bdbc5ca776013c8a) available with the complete code if you find yourself in need of similar functionality. Happy cognitive processing!
