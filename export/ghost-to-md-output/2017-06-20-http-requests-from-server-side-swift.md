---
title: HTTP Requests from Server-Side Swift
slug: http-requests-from-server-side-swift
date_published: 2017-06-20T20:52:00.000Z
date_updated: 2019-01-17T00:37:06.000Z
tags: swift, kitura, http
---

As with any server environment, there are numerous (countless?) ways to make an HTTP request from a server-side Swift project. Most frameworks have their preferred approach. When it comes to Kitura, an approach that mirrors many of the requests libraries from other server environments, is KituraNet.

#### Swift on the Server?

When Apple open sourced Swift, among the first places it landed was on the server. This makes sense. Java is showing its age. Other mainstream options tend to lack features desired by many enterprise developers (strong data types, much). And iOS developers can build full-stack applications - an important consideration for a mobile-first world where iOS owns a large portion of the market. The IBM approach to server-side Swift is an open source project called, [Kitura](http://www.kitura.io/) - also open source.

#### KituraNet

[KituraNet](http://ibm-swift.github.io/Kitura-net/) is designed to make HTTP requests from Kitura. It is included with the Kitura package, so it makes for an easy place to start as well. The following example provides a route to translate content against [Watson Language Translator](https://www.ibm.com/watson/developercloud/language-translator.html).

#### Input

In order to translate content, Watson needs to know what language the source material is in currently, the desired target destination of the translation, and the content (text) to translate. As a bare minimum then, the input to the Kitura route will be a JSON string in the following format.

    {
      "source": "en",
      "target": "es",
      "text": "Hello"
    }
    

This is exactly what [Watson Translator API](https://www.ibm.com/watson/developercloud/language-translator/api/v2/#translate) expects, and can be simply passed along as the body of the HTTP call. Watson credentials are needed to access the Language Translator API. These can be safely stored in a server resource of your choosing. I will be putting them into the code directly for the purposes of this demonstration (changed from their original values).

#### Request

To get the body of an HTTP request in Kitura, we use call "BodyParser.readBodyData(with:)". The result of the call is a [Data](https://developer.apple.com/documentation/foundation/data) object, which we pass along with the request in a moment. You can also choose to parse the string into JSON if you need to further manipulate the content.

    let body = try BodyParser.readBodyData(with: req)
    

Next we will set any headers that we need for the Watson Translator API call. In this case, we need to let Watson know that we are working with a JSON string.

    var headers = [String:String]()
    headers["Accept"] = "application/json"
    headers["Content-Type"] = "application/json"
    

The [ClientRequest.Options](http://ibm-swift.github.io/Kitura-net/Classes/ClientRequest/Options.html) class gives us a place to store all the relevant information for the request. This includes not only the URL endpoint, but also a username and password for HTTP Basic authentication, which is what Watson uses for almost all of its API.

    var options: [ClientRequest.Options] = []
    options.append(.username("b45dad35-e93c-4737-8604-edc0d8b2bfdf"))
    options.append(.password("4fk38dYMCUeL"))
    options.append(.schema("https://"))
    options.append(.method("POST"))
    options.append(.port(443))
    options.append(.hostname("gateway.watsonplatform.net"))
    options.append(.path("/language-translator/api/v2/translate"))
    options.append(.headers(headers))
    

KituraNet exposes an "[HTTP.request(_:callback:)](http://ibm-swift.github.io/Kitura-net/Classes/HTTP.html)" method with a callback for when the request has completed. We will use the callback notation of the Swift language here to handle the response.

    _ = HTTP.request(options) { response in
      do {
        var data = Data()
        try response?.readAllData(into: &data)
        let body = String.init(data: data, encoding: .utf8)
                
        res.send(body!)
      } catch {
        // Error
      }
    }.end(body)
    

Similar to the handling of the incoming request from the client, we use the [ClientResponse](http://ibm-swift.github.io/Kitura-net/Classes/ClientResponse.html) object to read all the response data from the HTTP call. In this case, the return from Watson Translator is a JSON string. We do not care about that JSON here, just the string. Once we have that, we can use the [router response object](http://ibm-swift.github.io/Kitura/Classes/RouterResponse.html) of the initial call to return the string.

To actually send the client-provided content, a JSON string, you provide that data in the "ClientRequest.end(_ data: Data, close: Bool = false)" call as a Data object instance.

#### Next Steps

It may seem silly to write an explanation of this process. It looks pretty similar to "[request](https://github.com/request/request)" package one might use from a Node.js project. And it is. However it took me the better part of a day to track down all the parts and pieces of how this process works. Hopefully it will save time on your next Kitura project.

If you have not already taken a look at Kitura, and you are a Swift developer looking to go full stack with your skills, or a Java developer looking for your next server environment, but are not sure JavaScript is the right direction, then check out Kitura. You can even run Kitura on the IBM Bluemix cloud.
