---
title: Async OpenWhisk Web Action with CORS
slug: async-openwhisk-web-action-with-cors
date_published: 2017-06-15T20:39:41.000Z
date_updated: 2019-01-17T00:29:54.000Z
tags: openwhisk, web
---

[Apache OpenWhisk](http://openwhisk.org/) is a serverless (functions as a service) cloud platform, originated at IBM. It has broad language support, robust tooling, and fine-grained consumption (saves money). As a champion of the Web, here are a few patterns that I use repeatedly.

#### OpenWhisk

There is a growing community, and great documentation for OpenWhisk, so I will not cover getting started here. There are however a couple of important concepts it will be helpful to cover. An OpenWhisk function entry point is a function named "main".

    function main( args ) {
      return {payload: 'Hello ' + args.name};
    }
    

To deploy the function, you can use the CLI tooling (my preference), or the web-based IDE.

    wsk action create hello hello.js
    

At this point, you can invoke your function using a REST API provided by OpenWhisk (or the CLI, or the web-based IDE).

#### Arguments

You can pass arguments into your function using a couple different approaches - along with the request, and/or during deployment. You can even use both. Often times, my OpenWhisk functions will invoke another API, say Watson Language Translation. That API however has its own credentials. I do not want to have to pass those in the open with every invocation.

    WATSON_USERNAME="2af6421f-adcd-43e6-9a4b-e7c161f92c39"
    WATSON_PASSWORD="41inTtGsgiYc"
    
    

To solve this problem, a good approach is to use a "local.env" file containing name/value pairs with the credentials for any APIs you want to invoke. You can then run "source local.env" at the command line to add these variables to your terminal session. Now we can pull them into the deployment of our OpenWhisk function.

    ~/wsk action create 
      translation 
      translation.js 
      --param WATSON_USERNAME "$WATSON_USERNAME" 
      --param WATSON_PASSWORD "$WATSON_PASSWORD"
    

Now these parameters will be merged with any other arguments being provided, and made available to your OpenWhisk function.

#### Web Actions

While our OpenWhisk function is exposed via a REST API, that API is for OpenWhisk itself, telling it which function to invoke with what parameters. The function itself is not exposed to REST calls. To expose an OpenWhisk function directly to REST calls, we can tap a feature called "[Web Actions](https://console.ng.bluemix.net/docs/openwhisk/openwhisk_webactions.html#openwhisk_webactions)".

Web Actions are enabled by adding a parameter to our deployment. The function will then be given a public URL you can call directly (say via [Paw](https://paw.cloud/), or just the browser).

    ~/wsk action create 
      translation
      translation.js 
      --web true 
      --param WATSON_USERNAME "$WATSON_USERNAME" 
      --param WATSON_PASSWORD "$WATSON_PASSWORD"
    

#### CORS

While we now have a URL endpoint we could point our browser-based JavaScript at, we will run into security problems - namely no CORS support. The URL for OpenWhisk is likely going to be a different domain, so the browser will block the call. We can enable CORS within our OpenWhisk function, by telling it to return the necessary header.

    function main( args ) {
      return {
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        statusCode: 200,
        body: new Buffer( JSON.stringify( {
          greeting: 'Hello ' + arg.name
        } ) ).toString( 'base64' )
      };
    }
    

Note that enabling CORS, and dealing with a JSON return in this fashion, changes how OpenWhisk expects functions to interact. If you are making OpenWhisk sequences, you will want to wrap the call in another OpenWhisk function.

#### Asynchronous Calls

At this point we can include third-party API credentials in our OpenWhisk function, make it available to the Web, and enable CORS for access in the browser. The last step is to make that third-party API call.

The problem we will run into here is that OpenWhisk is itself an asynchronous call. So to call a third-party API, you have an asynchronous call inside an asynchronous call. We need to orchestrate these two.

    var request = require( 'request-promise' );
    
    function main( args ) {
      // Make API call
      // Return promise
      return request( {
        url: url,
        method: 'POST',
        auth: {
          // Deploy arguments
          user: args.WATSON_USERNAME,
          pass: args.WATSON_PASSWORD
        },
        json: {
          input: {
            // Arguments in call
            text: 'Hello ' + args.name
          }
        }
      } ).then( function( result ) {
        // CORS
        // JSON
        return {
          headers: {
            'Access-Control-Allow-Origin': '*',        
            'Content-Type': 'application/json'
          },
          statusCode: 200,
          body: new Buffer( JSON.stringify( 
            result 
          ) ).toString( 'base64' )
        };
      } );
    }
    

Where you might use the NPM "[request](https://github.com/request/request)" package in a Node.js application, we will use "[request-promise](https://github.com/request/request-promise)". This pulls together everything I have talked about up to this point. We are now ready to invoke this OpenWhisk function directly from a web page.

    let xhr = new XMLHttpRequest();
    xhr.addEventListener( 
      'load', 
      (evt) => {
        console.log( xhr.responseText );
      }
    );
    xhr.open( 'POST', url, true );
    xhr.send( JSON.stringify( {
      name: 'Kevin'
    } );
    

#### Quick Recap

- Keep a "local.env" file to hold API credentials
- Add the environment variables using "source local.env"
- Use "--PARAM" when deploying the function
- Enable Web Actions using "--web true" when deploying the function
- Support CORS in the return of your function
- Promisify third-party API requests using "request-promise"

#### Next Steps

Web Actions have a huge variety of options. You can use an extension such as "json" on the URL to specify the return content for example, and even drill down into the return from the request itself. If the Web is your thing, and Web Actions appeal to you, it is worth spending an afternoon playing with all the various options.

To be sure, this example is a little contrived. It turns out that if you are using OpenWhisk on Bluemix, Watson integration is provided for you. The patterns hold true though regardless of the endpoints you want to use. Are there other API integrations that should ship with OpenWhisk? Let us know in the comments below!
