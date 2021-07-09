---
description: Recently Apache OpenWhisk (IBM Cloud Functions) released a beta feature around triggers for Cloud Object Storage, and I figured I would take it for a spin.
feature_image: /img/covers/whisk.jpg
title: Functions, Storage, Watson ... Oh, My!
permalink: /2019/04/06/storage-function-watson-oh-my/
tags:
  - serverless
  - storage  
  - watson
  - posts
---

I have a love-hate relationship with serverless. My style of development definitely trends towards dropping a function in the cloud and calling it done. But the tooling, integration, and best practices are still maturing. It is however, fun to watch the technology evolve. Recently [Apache OpenWhisk](https://openwhisk.apache.org/) ([IBM Cloud Functions](https://www.ibm.com/cloud/functions)) released a beta feature around triggers for [Cloud Object Storage](https://www.ibm.com/cloud/object-storage), and I figured I would take it for a spin.

> Some IBM Cloud Functions commands can get very lengthy - especially if you have several parameters you need to set. Shell scripts are your friend. I tend to have a few scattered around every function for creating and updating the associated actions, sequences, etc. Do not forget to "chmod +x create-action.sh". Here is an example of what using the CLI looks like from a shell script. This is a single command. I have seen scripts from other developers that are respectable applications unto themselves.

``` bash
ibmcloud fn trigger create store.this \
  --feed /whisk.system/cos-experimental/changes \
  --param apikey "_YOUR_API_KEY_" \
  --param bucket "show-and-tell" \
  --param endpoint "s3.us-east.cloud-object-storage.appdomain.cloud"
```

## Trigger

Triggers allow Cloud Functions to be invoked when something happens on an external system. Cloud Functions provides built-in triggers for Cloudant ([CouchDB](http://couchdb.apache.org/)), [MessageHub](https://www.ibm.com/cloud/message-hub) ([Apache Kafka](https://kafka.apache.org/)), GitHub, and more. Did a document just get added to your database? Invoke an action. Did a message just get placed in a queue? Invoke an action. New code committed? Invoke an action.

And now, did a file get uploaded to storage? Invoke an action!

## Storage

My [recent](__GHOST_URL__/2019/01/23/upload-files-to/)[blog](__GHOST_URL__/2019/01/30/serverless-download-from-object-storage/)[posts](__GHOST_URL__/2019/02/06/serverless-storage-redux/) have been around Cloud Object Storage and Cloud Functions, so this particular trigger definitely piqued my interest. As soon as I heard about the feature, a use-case came to mind. I want to upload a file to storage, have a Cloud Function take the file and send it to [Watson Visual Recognition](https://www.ibm.com/watson/services/visual-recognition) for classification, and finally put the results in a Cloudant database.

## Function

The [documentation](https://cloud.ibm.com/docs/openwhisk?topic=cloud-functions-cloud_object_storage#cloud_object_storage) for this feature walks through setting up all the necessary parts. The first step is to create the trigger. The documentation walks you through some additional "binding" steps, but I just went straight to the source. After all, it is not that often you need to adjust the actual trigger itself.

``` bash
ibmcloud fn trigger create store.this 
  --feed /whisk.system/cos-experimental/changes 
  --param apikey _MY_API_KEY_ 
  --param bucket u-betta-recognize 
  --param endpoint s3.us-east.cloud-object-storage.appdomain.cloud
```  

Next up is to create the action/function that will get invoked when the trigger runs. The trigger is invoke for a variety of reasons - you added a file is the one I am interested in, but it could also be for being deleted. When the function gets called, various details about the Cloud Object Storage are passed as parameters, such as the key (object name) of the resource that changed, and the bucket in which that object resides.

``` js
function main( params ) {
  if( params.status !== 'added' ) {
    return;
  }
  
  // Here we go
}
```
    
Cloud Functions has an Object Storage library that comes with it, but as I have written about before, I rather prefer the HTTP/REST interface. The first step in interacting with the REST interface is in getting an authorization token. Where parameters are not provided by the trigger, I prefer to define them using the web-based tooling, and label them in uppercase.

``` js
rp( {
  url: 'https://iam.ng.bluemix.net/oidc/token',
  method: 'POST',
  form: {
    apikey: params.COS_API_KEY,
    response_type: 'cloud_iam',
    grant_type: 'urn:ibm:params:oauth:grant-type:apikey'
  },
  json: true
} );
```    

With the token retrieved, I can now go for the file itself. There is a choice to make here. Theoretically, you should be able to get a public URL to a resource on Cloud Object Storage. This is one of the ways we can call Watson - with a URL. However, in this case, I am going to download the file itself to the running function - and keep it in memory.

``` js
rp( {
  url: `https://${params.endpoint}/${params.bucket}/${params.key}`,
  method: 'GET',
  headers: {
    Authorization: `${authorization.token_type} ${authorization.access_token}`,
    'ibm-service-instance-id': params.COS_SERVICE_INSTANCE
  },
  encoding: null
} );
```

From there I am going to send the file bytes to Watson for classification. If you are using JavaScript and request/request-promise as I am, then pay particular attention about how the file gets passed. The request documentation shows putting a Buffer, which is the result of downloading the file, directly onto the form. However, you have to use the method that specifies a file name, otherwise the file contents will not be passed.

``` js
rp( {
  url: 'https://gateway.watsonplatform.net/visual-recognition/api/v3/classify',
  method: 'POST',
  auth: {
    user: params.WATSON_USERNAME,
    pass: params.WATSON_PASSWORD
  },
  formData: {
    images_file: {
      value: contents,
      options: {
        filename: params.key
      }
    }
  },
  qs: {
    version: '2018-03-19'
  },
  json: true
} );
```

Last but not least, take the results of the Visual Recognition classification, and put it into a Cloudant database. Of course any database could be used, but Cloudant lends itself to this type of scenario. Being REST-based itself, there are no additional dependencies. Cloudant views are also well suited to taking a bunch of specific, nested, data, like what is returned from Watson, and distill it down to something else.

``` js
classification.bucket = params.bucket;
classification.key = params.key;
classification.endpoint = params.endpoint;
      
rp( {
  url: `https://${params.CLOUDANT_ACCOUNT}.cloudant.com/${params.CLOUDANT_DATABASE}`,
  method: 'POST',
  auth: {
    user: params.CLOUDANT_USERNAME,
    pass: params.CLOUDANT_PASSWORD
  },
  json: true,
  body: classification
} );
``` 

Before I put the classification results into the database, I also put some additional information about the Object Storage changes. Mostly, details I thought might be helpful in creating views down the road. "What are the top classifications for a given bucket?" type of questions. Creating a document in Cloudant returns with an ID, which you can return at the end of your function if you want.

``` bash
ibmcloud fn action create recognize recognize.js
```    

## Rule

We create the trigger (store.this). We created the action to be called by the trigger (recognize). Now we just need to glue the two together using a rule. With the trigger and the rule defined, you can iterate on the function as often as you need, without have to touch either the trigger or the rule.

``` bash
ibmcloud fn rule create store.recognize store.this recognize
```    

If you change the bucket you want to watch, the storage location, or the frequency of how often the trigger looks for changes (default of once per minute), then you will need to update your trigger. However, the rule and the action can be left untouched.

## Next Steps

In days of old, this type of chain of events in JavaScript would be callback hell. However, with request-promise being included as part of Cloud Functions, it becomes a chain of "then" statements, making the code easier to maintain. If you want to specify a modern version of Node.js for Cloud Functions to use, then you can even use async/await. I implemented both, and have put them in a [GitHub Gist](https://gist.github.com/krhoyt/50709e6c7322df57f744ecc3bee475ce).

What is more interesting is the function calls made within this Cloud Function/action. Each of the various steps above could be Cloud Functions themselves, and then a sequence could be made that ties them all together. How granular is too granular? I view all the function calls made to be a part of a single body of work, and in that sense consider it a single action. Do you have an opinion on the matter?

And that brings us full circle to the as of yet maturing best practices. Exciting times ahead.

https://www.youtube.com/watch?v=d_YpimHwHeM
