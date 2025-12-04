---
feature_image: /img/covers/python.jpg
unsplash_author: David Clode
unsplash_author_url: https://unsplash.com/@davidclode
unsplash_photo_url: https://unsplash.com/photos/5uU8HSpfwkI
title: AWS Transcribe with Python
description: Upload an audio file to S3, manage the details of an AWS Transcribe job, and download the results. Include code to clean up after yourself if you are so inclined.
permalink: /blog/2022/12/02/transcribe-with-python/
tags:
  - App Dev
  - AI/ML
rating: 98
---

Amazon Web Services (AWS) has so many services. A stroll through the catalog will likely yield something useful for just about any project. Sometimes our projects pick us. This week a customer asked for an example of using [AWS Transcribe](https://aws.amazon.com/transcribe/) with Python. Having used other transcription services, I could not pass up the challenge. What follows is my approach to implementing a solution.

## Prerequisites

There is a little setup required to get all this going. I have tried to stick to the absolute minimum amount of setup. While walking through each of these setup steps is beyond the scope of this post, I will give you some pointers along the way.

### Access and Identity

To use AWS, you will obviously need an account. With your account in hand, you can get the credentials you will need to access the AWS services. The danger with doing this is that if you are using the root account credentials, then those credentials have access to everything in your account. If you let those credentials slip into malicious hands - say, by accidentally committing them to a public GitHub account - then those hands can really cause you a lot of pain.

Rather than use the root account credentials directly, I recommend heading over to the Identity Management (IAM) service and creating a group with specific permissions for the services you will be using. In this case, those permissions are "Transcribe" and "S3". Then create a user and generate credentials for that user. Finally, assign that user to the group that has the appropriate permissions. Now should those credentials fall into malicious hands, the only access they have is to those services specified for the group. If you suspect malicious activity, you can log into the root account and disable the user and/or group with a few clicks.

### S3

In order to provide the audio file for Transcribe to use, you will need a place in AWS to put that file; namely an S3 bucket. If you already have an S3 Bucket setup, you can use that, or even create a folder inside of that bucket if you do not want your Transcribe content to co-mingle with other content you may have in the bucket. However you go about it, note the region in which the bucket resides. You will need this piece of information to use both Transcribe and S3.

### Python

There are a few moving pieces on the Python side of this solution. The first is a file to put your environment variables. What environment variables? Namely, those all so precious access keys. You want to avoid putting those access keys directly into your Python code (or any language you may be using). There are also some other variables that are used throughout this solution that go nicely into that environment file. In a file named `transcribe.env` I have placed the following variable details.

``` bash
AWS_ACCESS_KEY=_YOUR_ACCESS_KEY_
AWS_SECRET_KEY=_YOUR_SECRET_KEY_
AWS_REGION=_S3_REGION_
LOCAL_AUDIO=hello-world.m4a
S3_BUCKET=_S3_BUCKET_NAME_
S3_OBJECT=_PATH_TO_AUDIO_IN_BUCKET_
SLEEP_TIME=5
TRANSCRIPTION_JOB=hello-world
```

I will talk about these environment variables in more detail as we get into the specific Python code.

Secondly, you will need to install two Python libraries. Again, I have tried to keep this pretty minimal.

* **[Boto3](https://boto3.amazonaws.com/v1/documentation/api/latest/index.html)**: This is the AWS library for Python. While AWS is mostly REST under the covers, trying to manage the headers and structure of the requests yourself can be very overwhelming. While I am not a fan of adding libraries for the sake of adding libraries, this is one case where it absolutely makes sense.

* **[DotEnv](https://pypi.org/project/python-dotenv/)**: You have externalized key pieces of data into an environment variable file. That is great! Now we need a way to pull them into our main logic, parse them, and make use of them. Like anything Python, there are a dozen ways to do this, but I find this little helper worth the value to have along for the ride.

> Installing libraries will look something like `pip install boto3`.

Everything else used in this solution is a part of the standard Python runtime. Oh, and it is worth mentioning that this is all Python 3 code.

## Ready, Set...

This solution uses a variety of libraries, both third-party as mentioned above, and from the Python runtime.

``` python
import boto3
import io
import json
import os
import sys
import time

from dotenv import load_dotenv
from pathlib import Path
```

* **boto3**: As previously mentioned, this is the Python AWS library.
* **io**: Allows reading the Transcribe results directly into memory.
* **json**: Provides a means to parse and read the JSON data that often results from interacting with AWS.
* **os**: Used for access the environment variables once read and parsed by the supporting `dotenv` library.
* **sys**: Access to command-line arguments.
* **time**: Can pause execution while we poll the Transcribe service to see if it has completed its work.
* **from dotenv import load_dotenv**: Reads and parses the environment variable file.
* **from pathlib import Path**: Helps specify where the environment variable file lives on the local file system.

## Go!

Our first lines of code should be to read and parse the environment variables file so they can be used throughout the solution.

``` python
dotenv_path = Path( "transcribe.env" )
load_dotenv( dotenv_path = Path( "transcribe.env" ) )
```

## Clients

To access an AWS service, we must for instantiate a "client" for services we want to access. Client instantiation includes parameters specific to that service. We will need two clients since we are accessing two different services.

``` python
storage = boto3.client( 
  "s3",
  aws_access_key_id = os.getenv( "AWS_ACCESS_KEY" ),
  aws_secret_access_key = os.getenv( "AWS_SECRET_KEY" ),
  region_name = os.getenv( "AWS_REGION" )
)

transcribe = boto3.client(
  "transcribe",
  aws_access_key_id = os.getenv( "AWS_ACCESS_KEY" ),
  aws_secret_access_key = os.getenv( "AWS_SECRET_KEY" ),
  region_name = os.getenv( "AWS_REGION" )
)
```

Here you can see those environment variables in action as referenced by `os.getenv( "variable_name" )`.

## Audio File

AWS Transcribe works from an audio file placed on S3. Here we will check S3 to see if our desired audio file already exists. If it does not, we will upload an audio file from the local file system to S3 for later use by Transcribe.

``` python
try:
  response = storage.get_object_attributes(
    Bucket = os.getenv( "S3_BUCKET" ),
    Key = os.getenv( "S3_OBJECT" ),
    ObjectAttributes = ["ETag"]
  )
  print( response )

except: 
  storage.upload_file( 
    Filename = os.getenv( "LOCAL_AUDIO" ), 
    Bucket = os.getenv( "S3_BUCKET" ), 
    Key = os.getenv( "S3_OBJECT" )
  )
```

## Transcribe

In order to tell AWS Transcribe to work on a specific audio file, we create a "job". That job is asynchronous. That is to say that when we make the call to create a job, that call will kick off the job and return. It will not hold up execution of the logic while waiting for the job to complete. In order to find out if the job has completed, we will need to repeatedly ask Transcribe about the status of the job (polling).

> Many parts of `Boto3` include `waiters`. `Waiters` are a means of *waiting* for the work on AWS to complete. Transcribe does not support `waiters` at this time, so polling it is.

``` python
completed = False

try: 
  response = transcribe.get_transcription_job(
    TranscriptionJobName = os.getenv( "TRANSCRIPTION_JOB" )
  )
  print( response )      
  
except:
  response = transcribe.start_transcription_job(
    TranscriptionJobName = os.getenv( "TRANSCRIPTION_JOB" ),
    LanguageCode = "en-US",
    OutputBucketName = os.getenv( "S3_BUCKET" ),
    OutputKey = os.getenv( "S3_OBJECT" ) + ".json",
    Media = {
      "MediaFileUri": "s3://" + os.getenv( "S3_BUCKET" ) + "/" + os.getenv( "S3_OBJECT" )
    }
  )
  print( response )    
  
if response["TranscriptionJob"]["TranscriptionJobStatus"] != "IN_PROGRESS":
  completed = True  
  
# Job status
while completed == False:
  response = transcribe.get_transcription_job(
    TranscriptionJobName = os.getenv( "TRANSCRIPTION_JOB" )
  )
  print( response )
  
  if response["TranscriptionJob"]["TranscriptionJobStatus"] != "IN_PROGRESS":
    completed = True
    break
    
  time.sleep( int( os.getenv( "SLEEP_TIME" ) ) )
```

That is a lot to take in at once. Let us review what is going on in the above snippet. First, we create a variable to track if the job is complete. Since it is not complete when we first create the job, the value of `completed` is `False`.

Second, we ask Transcribe for the status of the job. The job may not exist yet. If the job does not exist, we start a new job using the `start_transcription_job()` function call. Among the parameters passed to the `start_transcription_job()` includes the path to our audio file sitting on S3. Also specified is the path where Transcribe should place the results.

Third, after either of those calls are made, we check the progress in the resulting JSON dictionary. There are different values that might come back from checking on the job status. One of those might be an error. Another might be a failure to transcribe the content. In either of those cases, as well as in the case of the status being `COMPLETE` we want to stop polling and move on to the next phase.

Fourth, is to continue checking on the job status - polling. We do not want to poll too aggressively here (DDoS), so we pause execution of the logic for a few seconds before checking again. The time that Transcribe will take to complete the job depends on the size of the audio file. Eventually the job will complete. Transcribe will then place the JSON formatted results in the bucket we specified when we started the job.

## Results

In the case of this solution, we want to download the Transcribe results JSON file, and place it on the local file system so we can open it up with a text editor and learn about the various pieces of data that are included with the results.

``` python
dir_index = os.getenv( "S3_OBJECT" ).index( "/" )
file_name = "./" + os.getenv( "S3_OBJECT" )[dir_index:] + ".json"
storage.download_file(
  Filename = file_name,
  Bucket = os.getenv( "S3_BUCKET" ),
  Key = os.getenv( "S3_OBJECT" ) + ".json"      
)

with open( file_name, "r" ) as local_file:
  response = json.load( local_file )
  print( response["results"]["transcripts"][0]["transcript"] )  
  local_file.close()
```

Our `S3_OBJECT` environment variable includes some path information ("transcribe"). If we keep this as-is, then the download from S3 will try to put the results into a "transcribe" folder in our project on the local file system. I just want to put the results in the same folder as the Python program itself, so I take a few steps to parse out the file name from the rest of the path.

Heading over to our S3 client instance, we then download the file. We can then open the file, and read the contents as JSON data, yielding a Python dictionary. 

> In the Gist, I also include a version of downloading the results file from S3, directly into memory.

For any given transcription, there may be multiple results. I good next step might be to dig deeper into the results to determine the confidence of the various transcriptions, and then select a specific result. In this case, I am getting, and displaying, the first result only.

## Cleanup

This solution takes into account that you may want to reuse the audio file on S3, or just plain keep it around for archival purposes. If you have no intention of reusing any of the associated parts and pieces of the process, it is a good idea to clean up after ourselves.

``` python
if "-c" in sys.argv:
  transcribe.delete_transcription_job(
    TranscriptionJobName = os.getenv( "TRANSCRIPTION_JOB" )
  )
  
  response = storage.delete_object(
    Bucket = os.getenv( "S3_BUCKET" ),
    Key = os.getenv( "S3_OBJECT" )
  )
```

To account for this, you can add a command-line argument of `-c` when you run the Python program. There is no significance to the `-c`. It is made up by me. The "c" stands for "cleanup". If the `-c` argument is included, we delete the Transcribe job, and then delete the audio file from S3.

## Next Steps

All said and done, this solution is a little over 100 lines of code. Depending on how you fit this solution into your project, those lines of code could be much less or much more. This really all depends on how robust you need the code to be. Thanks to judicious use of the `boto3` library however, you are on your way to using AWS Transcribe.

I absolutely appreciate these types of questions from AWS customers, and hope this example serves to answer questions around using AWS Transcribe with Python. For reference, I have placed the environment variable file (with security-specific values redacted), and the entirety of the Python program in a [GitHub Gist](https://gist.github.com/krhoyt/46a8fac60cb25c44eaad9447e4c4685a) for your reference. Or copy and paste. Whatever. Enjoy!
