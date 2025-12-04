---
feature_image: /img/covers/teaching.jpg
unsplash_author: Element5 Digital
unsplash_author_url: https://unsplash.com/@element5digital
unsplash_photo_url: https://unsplash.com/photos/red-apple-fruit-on-four-pyle-books-OyCl7Y4y0Bk
title: Teaching Watson to See My Garage
description: A Raspberry Pi camera and custom-trained Watson model detect whether a garage door is open or closed. Combines ML, image processing, and IoT.
permalink: /blog/2019/01/17/watson-garage/
tags:
  - AI/ML
  - IoT
rating: 100
---

After a long day of work, I like to head out to my garage and tinker, binge the latest series, listen to a podcast, or settle in with a book. If the weather is right, I will open the garage door. Eventually I will head to bed. Then it hits me - did I close the garage door?

The last thing I want to do is get up, put on some clothes, head downstairs to the garage, and check it. By the time I get back to bed, I have to settle back down before drifting off to sleep. If only Watson could watch the garage for me.

### Teaching Watson

[Watson Visual Recognition](https://www.ibm.com/watson/services/visual-recognition/) can "see" a lot of things right out of the box - including some brand logos, and celebrities. The real power of Visual Recognition however surfaces when you train Watson to see what it is that you want it to see. This feature is called "Custom Classifiers". Creating a custom classifier has a few steps.

1. **Capture** or assemble a set of images that contain the content you want to teach (train) Watson to see.
2. **Manipulate** the images to best represent your content (optional). There is a lot of content in some images, and you want to pare down to your specific content.
3. **Bundle and train** Watson on your images. The creates the classifier, and will be available only to your account.
4. **Send** Watson an image you want to classify. This may require additional image tuning en route.

### Capture

To capture images of my garage I needed a camera, so I stuck a [Raspberry Pi Zero](https://www.sparkfun.com/products/14329) with camera module on the wall of my garage. I wrote a Python script to take a picture once every five (5) minutes for an entire day, and upload it to [IBM Cloud Object Storage](https://www.ibm.com/cloud/object-storage) (S3-compatible).

![The whole garage.](/img/assets/garagepi.whole.jpg)

Why one image every five minutes for an entire day? The garage does not change that much over time. The Watson documentation on custom classifiers suggest that a training sample will yield the best results at around 300 images. There are **24 hours** in a day, or **1,440 minutes**. Divided by **300**, that gives us **4.8** - so once every five minutes should yield enough images.

I also wanted to capture the garage door open and closed, during both the day time and during the night time. To get this I needed at least a full day to start. All said and done, I got enough images to yield an accurate training model. If I needed more, I could run the script again, until I had all the images I needed.

### Manipulate

In the case of the above photo of my garage, there is a lot to "see". There are two cars. There is a wall with a bunch of objects on and near it. The ceiling with the actual garage door opener. And somewhere, in the distance is the actual garage door. What is it that we want to actually teach Watson?

> To the human eye, it is easy to see that the garage door is open, but Watson needs little more direction.

To solve this problem, I wrote a Python script to download the images from IBM Cloud Object Storage, and further process them.

The documentation states that a good image is 200x200 pixels. It turns out that you do not need the full resolution of the camera image. The first step then is to resize the entire image down to 640x480 pixels. The second step then extracts only a specific portion of the image - the area behind the cars, where the human eye can see the garage door as open or closed.

![The part of the image we are interested in using.](/img/assets/garagepi.crop.jpg)

I arrived at 640x480 through trial and error. I tried 1024x768, and then looked at the cropped area. It was still really big - far larger than the 200-ish the documentation recommends. Then 800x600. Still a big on the large side. When I got down to 640x480, the portion of the image which shows the state of the garage door was about 350x85. Close enough.

![Just the garage, please.](/img/assets/garagepi.garage.jpg)

I should mention that [Pillow](https://pillow.readthedocs.io/en/5.1.x/), a fork of the [Python Image Library](http://www.pythonware.com/products/pil/) (PIL) made the work of sizing and cropping just a few lines of code.

### Bundle and Train

Once I had all the samples sized and cropped, I pulled them (manually) into folders for "open day", "open night", "closed day", and "closed night". From there I bundled each into an archive file (zip).  From there, a little cURL action against the Watson API for training, was a single call.

``` bash
## Create Classifier
curl -X "POST" "https://gateway-a.watsonplatform.net/visual-recognition/api/v3/classifiers?api_key=YOUR_API_KEY&version=2016-05-20" \
  -H 'Content-Type: multipart/form-data; charset=utf-8;' \
  -F "closed_day_positive_examples=@closed.day.zip" \
  -F "open_day_positive_examples=@open.day.zip" \
  -F "closed_night_positive_examples=@closed.night.zip" \
  -F "open_night_positive_examples=@open.night.zip" \
  -F "name=garage"
```    

It can take some time for Watson to build the fully trained model. This makes sense if you are looking at 200-ish images per state, with four (4) states. That is about 800 images for Watson to process. For my dataset it took about five minutes. You can run the following script to check the progress along the way. You should not train or test against the classifier while it is being built.

``` bash
## Classifier Details
curl "https://gateway-a.watsonplatform.net/visual-recognition/api/v3/classifiers/CLASSIFIER_ID?api_key=YOUR_API_KEY&version=2016-05-20"
```   

While I have put the cURL here for review, I personally recommend the awesome [Paw](https://paw.cloud/) tool. I have folders in Paw for nearly a dozen difference IBM Cloud APIs - each folder with as many "requests" as needed to fully utilize that API. Whenever I need to use that API, I just open Paw, and all the hard work is done. What is better is that Paw will generate cURL, or Python, or ... take your pick ... sample code for you to use.

### Send To Watson

Now back to the Raspberry Pi setup. Here I put one more Python script. The script serves two purposes.

The first thing it does is take a picture, and store it locally, every five minutes (keeping with the aforementioned maths). The Pi camera can take a moment start up, and I did not want to incur that in my calls to Watson. I also did not want to process images when I did not need to - using the API call limits of my Lite (**free**) tier.

The second thing the Python script on the Pi does is connect to [Watson IoT](https://www.ibm.com/internet-of-things) (MQTT). This lets the Pi sit there and wait for a command to process the most recently captured image.

When the command comes in, the script sends the image to Watson Visual Recognition for processing. When a result has arrived from Watson, the Pi sends an MQTT event with the pertinent data. I leave it up to the client implementation to decide what that means, and what to do with the results.

``` bash
## Classify Image
curl -X "POST" "https://gateway-a.watsonplatform.net/visual-recognition/api/v3/classify?api_key=YOUR_API_KEY&version=2016-05-20" \
  -H 'Content-Type: multipart/form-data; charset=utf-8;' \
  -F "images_file=@garage.jpg" \
  -F "classifier_ids=CLASSIFIER_ID"
```    

Decoupling the device (Pi) from the client implementation, allows me to integrate with a Progressive Web Application (PWA), native application, and/or voice systems such as Amazon Alexa.

### Next Steps

Now when I am lying in bed, and want to know if the garage is open, I can simply say "Alexa, ask Tennyson about the garage door." The result, on a good day, is "The garage door is closed." Off to sleep I go.

The next problem to solve with this project is to close the garage door for me if I am lying in bed, and find that I forgot to close it.  This would surface as another command for the Pi to monitor. "Alexa, ask Tennyson to close the garage door." Then it would activate a relay hooked to the garage door opener itself.

Where things start getting really interesting is in running the classifier when every image is taken, and storing the results in a database. Then I could teach Watson to know that the garage door should not be open in the first place, and close it for me automatically.

While the Lite (**free**) account for Watson Visual Recognition has a limit of a single custom classifier, I want to eventually add two more classifiers - one for where my car is in the image, and one for where my wife's car is in the image. Then I can even ask Watson if my wife is home from anywhere in the world.

### What About ... ?

You might be asking "Why not just use **IoT** sensors to detect the state of the garage?" I thought about this for a long time. Maybe some magnets and Hall sensors on the rails of the door? Maybe an ultrasonic range sensor that would yield one distance when the door was open, and another if it was closed?

Sure! These are possibilities, but powering the sensors, and integrating them with a master involves a lot more engineering.

In the end, I wanted to best model how I actually work as a human. How I work as a human is look out to the garage, and see, with my eyes, the state of the door. A single Pi with a camera, mounted on the wall is the closest approximation to that - and it costs about $70 USD to get going.
