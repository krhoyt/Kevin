---
description: In previous posts you can read about uploading and download a file with IBM Cloud Functions. In those posts I use an SDK. This time we look at the REST API.
feature_image: /img/covers/whisk.jpg
title: Serverless Storage Redux
permalink: /blog/2019/02/06/serverless-storage-redux/
tags:
  - App Dev
  - Data
rating: 1
---

In my previous two posts I wrote about upload a file to [IBM Cloud Functions](https://console.bluemix.net/openwhisk/) (serverless), and then how to download a file from [IBM Cloud Object Storage](https://www.ibm.com/cloud/object-storage) (COS) using serverless. Both of these posts used the the provided [IBM COS SDK for Node.js](https://github.com/ibm/ibm-cos-sdk-js). In this post I will rehash the upload and download process, but using the COS REST API.

## Et tu, SDK?

The IBM COS SDK for Node.js is a fork of the AWS S3 SDK for Node.js. As an IBM developer advocate, this has always felt a bit ... dirty. It is important that the interface to S3 is a de facto standard used by numerous storage providers. This comes with most of the benefits that would come with any other standardization. 

That "de facto" bit, though. The S3 interface is not a standard in the full sense - Amazon could change the interface at any point, and the entire industry would have to shift. True standards help developers avoid these types of risks through structured feedback and oversight.

## Liberally Layered Libraries

Let me just come out and say this right up front - I am not a fan of frameworks, and generally try to leverage libraries a sparingly as possible. To be sure, frameworks have their place (large development teams), and libraries keep us from reinventing the wheel. I am not saying that developers should not use these tools, but that they should use them appropriately.

In this case, I just went right for the library (slaps self on wrist). I did not even stop to think about how the underlying transaction takes place, and whether or not I actually needed the library. Once I had wrapped up the previous posts, I went back to revisit those transactions. The interface to IBM COS is an easy-to-use, token-based, REST-based API. HTTP is a standard ... I am game!

## The Lion Sleeps Tonight

To get a token, you will need your API key from the IBM Cloud Object Storage dashboard as covered in my [previous post](/2019/01/23/upload-files-to). Plug that into an HTTP request against the authentication endpoint, and you have yourself a token.

``` js
rp( {
  url: 'https://iam.ng.bluemix.net/oidc/token',
  method: 'POST',
  form: {
    apikey: _YOUR_API_KEY_,
    response_type: 'cloud_iam',
    grant_type: 'urn:ibm:params:oauth:grant-type:apikey'
  },
  json: true
} )  
.then( ( data ) => {
  console.log( data.access_token );
} )
.catch( ( e ) => {
  console.log( 'Error getting token.' );
} );
```    

I am using `request-promise` here because functions operating on callbacks will terminate before the callback is ever reached. We need to return a promise that lets the system know that we are still executing code, and will get back to it with some data to return.

## Put An Object (Upload)

With our token in hand, we need one more request to upload the file to Cloud Object Storage. I talk about the "instance ID" in a previous post. You will find the ID you need in the credentials section of the Cloud Object Storage dashboard. Also before you can make the upload, you will need to read the file you want to upload.

``` js
// Endpoints vary per region as well as public/private
// Check the documentation for the URL for your storage
const COS_ENDPOINT = 's3.us-east.cloud-object-storage.appdomain.cloud';
const FILE_TO_UPLOAD = fs.readFileSync( parts.file );

rp( {
  url: `https://${COS_ENDPOINT}/${bucket}/${object}`,
  method: 'PUT',
  headers: {
    'ibm-service-instance-id': _YOUR_INSTANCE_ID_
  },
  auth: {
    bearer: _TOKEN_FROM_PREVIOUS_
  },
  body: FILE_TO_UPLOAD,
  resolveWithFullResponse: true      
} )
.then( ( response ) => {
  // ETag comes with nested quotes
  // Remove quotes
  let etag = response.headers['etag'].replace( /"/g,"" );

  console.log( etag );
} )
.catch( ( e ) => {
  console.log( 'Error uploading object.' );
} )
```    

The HTTP request will return with no body. An "ETag" will be provided in the headers. The "ETag" is a hash of the file provided to allow you to verify that the contents of the file in the cloud match those of the files you have locally. Strangely, it comes wrapped in quotes, which we can remove with a splash of regular expressions. 

To get access to the headers when using `request-promise` we need to include the `resolveWithFullResponse` property on the outgoing call. Otherwise the result of the promise is just the body of the request.

## Get an Object (Download)

The request to get a file from COS is almost identical. The only difference being that this is a `GET` request and as such has no body. We also do not want `request-promise` to be overly aggressive with our file contents, so we set `encoding` to `null` on the request.

``` js
// Endpoints vary per region as well as public/private
// Check the documentation for the URL for your storage
const COS_ENDPOINT = 's3.us-east.cloud-object-storage.appdomain.cloud';

rp( {
  url: `https://${COS_ENDPOINT}/${bucket}/${object}`,
  method: 'GET',
  headers: {
    'ibm-service-instance-id': _YOUR_INSTANCE_ID_
  },
  auth: {
    bearer: _TOKEN_FROM_PREVIOUS_
  },
  resolveWithFullResponse: true,
  encoding: null
} )
.then( ( response ) => {
  console.log( response.headers['content-type'] );
  console.log( response.body.toString( 'base64' );
} )
.catch( ( e ) => {
  console.log( 'Error getting object.' );
} );
```

The `resolveWithFullResponse` property is useful here as well - we want both the headers and the body of the response. The headers are useful to get the content type of the file, and the body for the file itself. In the above example, I apply a Base-64 encoding to the file contents, which is needed for the HTTP response.

## Bonus: Delete All Teh Thingz

Gaining more insight into the underlying HTTP interface, I quickly started wrapping various operations in their own functions. And because I used `request-promise` everything surfaced as a promise. This then let me string what would otherwise be complex calls to COS together with "async/await".

The COS REST API provides a means to delete an object. Great! It also provides a means to delete a bucket. Great! ... If that bucket is empty ... Oh.

This means that you will first need to get a listing of objects in the given bucket. Then you will need to iterate over them - calling the REST API repeatedly to delete each object - using promises. If you have never had to do this before, then it may not seem like a big deal.  Trust me that the firing off of any quantity of asynchronous requests in a loop, that then must be completed in turn, is a real nightmare. Until `async/await`. In fact, it is situations like this where `async/await` really shines.

``` js
const token = await cos.getToken( 
  COS_AUTH_ENDPOINT, 
  COS_API_KEY 
);

const objects = await cos.getObjectList( 
  token, 
  COS_ENDPOINT, 
  COS_SERVICE_INSTANCE, 
  bucket 
);

// Mind blowing magic
for( let f = 0; f < objects.length; f++ ) {
  await cos.deleteObject( 
    token, 
    COS_ENDPOINT, 
    COS_SERVICE_INSTANCE, 
    bucket, 
    objects[f].name 
  );
}
    
await cos.deleteBucket( 
  token, 
  COS_ENDPOINT, 
  COS_SERVICE_INSTANCE, 
  bucket 
); 
```    

First, get your token. Next, the object list. With the object list in hand, iterate over them, deleting each in turn. Finally, delete the bucket itself. 

You might notice that all you see here are the functions I have used to wrap the COS REST API. And you might otherwise call this a library. And then you might suggest that I said to beware of libraries just a few paragraphs ago. And, on the surface, you would be right.

What has changed here is that I now know why and how I am making each of the calls. I understand the transactions, and know that I do not need a whole separate wrapper. A wrapper that does some magic behind the scenes that I am otherwise oblivious to understanding.

In the previous post, you will see calls along the lines of `COS_SDK.doSomething().promise().then()`. Where does that `promise()` bit come from? Why do I have to make another method call to get it? Should not the function just return a promise? Does the `promise()` call keep me from using `async/await` in the proper sense to solve complex, chained calls like deleting an entire bucket? Since it is not standard, and not an actual `Promise` object, I do not know how it will behave. This increases risk - effectively increased my dependency on the SDK - and makes me nervous about leveraging the SDK.

In short, I have distilled it down to the standards level, which gives me peace of mind and fine grained control.

## Next Steps

If you want to take a look at the functions I implemented to access the REST SDK, it is available in a GitHub [repository](https://github.com/krhoyt/ServerlessStorage) for this series of posts. You will also find a complete mobile UI (web standards) for managing your IBM Cloud Object Storage instance using IBM Cloud Functions.

There are two next steps I would like to pursue if I had more time. The first is to handle chunked file upload. Effectively upload a very large file by reading it in, breaking it apart at a specific point, and then treating each part as its own distinct file on the upload, then reassemble those back on the server. The COS REST API supports this, I just did not need it for my application.

The second step would be to handle paging of object lists. The COS REST API will only return 1,000 records at a time. If the bucket contains more than 1,000 items, you will have to page through them. This can be explicit or implicit, but currently it is something I do not account for at all.

Finally, I think it would be cool to use a bucket as a root, and use naming conventions to designate folders. Buckets can only be one layer deep. S3 gets around this by using names like `my_folder/my_object.jpg` and then logically display folders in the user interface. This would allow me to create a bucket for workshop attendees using their email address, and keep each students files/work separate from the others - all while using a single instance of IBM Cloud Object Storage.
