---
title: Event Notifications from Blockchain
slug: event-notifications-from-blockchain
date_published: 2017-09-29T20:05:59.000Z
date_updated: 2019-01-17T00:34:34.000Z
tags: blockchain
---

As a ledger, among the core functionality of blockchain is to store data. Having that data encrypted, with an audit trail, distributed across all peers in the network, with consensus among nodes, is what really makes a blockchain solution compelling. A blockchain network is not always the only part in a system. Sometimes other systems need to know when something happens to the ledger. Getting those notifications is the topic of this post.

### Hyperledger Fabric

[Blockchain](https://en.wikipedia.org/wiki/Blockchain) is a computing concept, and there are many implementations. Each implementation does things slightly different from the other. [Hyperledger Fabric](https://www.hyperledger.org/projects/fabric) is an open source blockchain implementation run by [The Linux Foundation](https://www.linuxfoundation.org/), of which [IBM](https://www.ibm.com/blockchain/) is a member. Hyperledger Fabric differs from other implementations in that it is a permissioned blockchain (as opposed to permissionless). In short, nodes on the network have been verified through a certificate to be allowed to join and participate. This brings with it several benefits that make it ideal for myriad business applications - namely, removal of the "proof of work" overhead, yielding substantial performance improvements.

[![Hyperledger Fabric](http://images.kevinhoyt.com/hyperledger.fabric.png)](https://www.hyperledger.org/projects/fabric)

I will be using an instance of Hyperledger Fabric for this post. Per the documentation, I have Fabric running in a Docker container on my local machine (MacBook Pro). [Setting up and configuring Fabric](https://hyperledger.github.io/composer/installing/development-tools.html) is beyond the scope of this post.

### Hyperledger Composer

Unless you are a [Go](https://golang.org/) developer, you are going to find developing an application on most blockchain implementations to be particularly cumbersome at first (foreign toolchain). The Hyperledger team figured this might be the case, and created [Hyperledger Composer](https://hyperledger.github.io/composer/), which makes developing applications far more approachable. In fact, if you know a splash of JavaScript, you know enough to build an application, using Composer, on Hyperledger Fabric.

Composer consists of various parts and pieces - the primary of which is called a Business Network Application, or BNA for short, or "banana" for fun. A business network application is made up of four main parts.

- 
Model: This defines the different parts of your application. For example, if you are auctioning vehicles, you might have an asset named "Car" with properties like "make" and "year". Models can include four different type of descriptions:

- 
Assets: Effectively, the "things" in your system. Car, house, account.

- 
Participants: The types of roles that will be involved in your application. In the case of a vehicle auction, this might be a buyer, seller, auction house, financial institution, and more.

- 
Transactions: Most of the time transactions take place when participants exchange an asset. This does not always have to be the case however, as we will see later.

- 
Events: Events that transactions can emit when conditions within the system match your defined criteria. We will revisit these later as well.

- 
Logic: For Composer, this is a JavaScript function that surfaces the logic of how those model pieces fit together. For example, when somebody bids on the car, you may want to validate that they have enough cash on hand for the transaction.

- 
Query: This is a fairly recent addition to Composer, and allows you to write SQL (something that looks like SQL anyways), to find assets in the ledger. This bring better performance to finding out what cars were sold at auction for more than $10,000 but less than $15,000.

- 
Access: Last but not least is an access control list (ACL). This is not particularly different from any other ACL you may have encountered with other systems, and defines who has access to what data and operations.

[![Composer Playground](http://images.kevinhoyt.com/composer.playground.png)](https://composer-playground.mybluemix.net/editor)

Want to take Hyperledger Composer for a spin without installing it locally? The Composer team hosts a "[playground](https://composer-playground.mybluemix.net/editor)" which allows you to develop and test business networks in the browser (against local storage). Once you have finished testing, you can download the "banana file" from the playground, and deploy it onto Hyperledger Fabric.

### Going Bananas

Hyperledger Composer provides a command-line interface (CLI), and SDK, to continue to make the process of deploying blockchain applications as easy as possible. With Fabric running, and your BNA file downloaded, the following Composer CLI command will deploy the file.

    composer network deploy -a real-time-stocks.bna -p hlfv1 -i PeerAdmin -s randomString
    

From there, you still need to interact with your application on Hyperledger Fabric. You have two ways to go about this:

- 
Node.js SDK: Ideal for integrating Fabric directly with your existing Node.js infrastructure.

- 
REST server: Get up and going, quickly! This exposes all your assets and transactions (defined in the model and logic files) to any application that can speak REST.

You can invoke the REST server using the Composer CLI. It looks at your deployment, and generates the API, and even provides a [Swagger](https://swagger.io/) interface for you to further test out your application.

    composer-rest-server -p hlfv1 -n real-time-stocks -i admin -s adminpw -N never -w
    

The thing about a REST interface is that it is a request/response operation. Given the earlier vehicle auction, if I use the REST interface to add a car, or change the property on a car, that is in the ledger, that is all that happens. Notice that last little "-w" in the CLI? That actually adds a WebSocket implementation to the REST server. Anything that can speak WebSocket can then listen for events that happen on the blockchain.

### Just One Catch

If you will recall from when I broke down the pieces earlier in this post, events can only be triggered from transactions. If you use the REST API to change the price of a car that is up for auction, that call has no associated logic, and will not emit any events - changing the value of a property does not require a transaction to be implemented.

While transactions are generally for when assets change hands, there is nothing stopping you from writing transactions that emulate CRUD operations on your assets when you need to emit events. Instead of calling the REST interface for assets, you call the REST interface to invoke a transaction. The transaction invokes your logic file, and it is there that you can emit events.

### Why Do This

Coming full circle, this functionality to emit events is particularly useful to send events, via WebSocket, to other systems when ledger values have changed (or meet some criteria). For example, you may have to print a bill of sale when a car is sold. A printer could listen for a "PrintBillOfSale" event, and automate that task.

Another common use of notifications when things change on the ledger is a dashboard.

### Stock Trader Dashboard

Taking our newly auctioned car for a spin, take a sharp left at Completely Unrelated Avenue. When I was exploring event notifications from blockchain transactions (specifically Composer transactions on Fabric), the concept of a stock trading dashboard came to mind. The car auction is just easier to communicate the parts and pieces of a Composer/Fabric system 😁.

    namespace org.acme.market
    
    asset Stock identified by symbol {
      o String symbol
      o String name
      o Double low
      o Double high
      o Double open
      o Double last
      o Double change
    }
    
    participant Trader identified by id {
      o String id
      --> Stock[] portfolio
    }
    
    transaction Trade {
      --> Stock stock
      o Double price
    }
    
    event TradeComplete {
      o String symbol
      o Double low
      o Double high
      o Double open
      o Double last
      o Double change
    }
    

In this Composer model file, we see a "Stock" asset with various properties. There is a "Trader" participant that goes unused in this application outside of the ACL. Then there is the transaction "Trade". This is what we will call to change the price of a stock asset. That transaction can emit a "TradeComplete" event, which has various properties describing the latest valuation.

    /**
     * Change stock values as transaction to get event notification.
     * @param {org.acme.market.Trade} tx Transaction instance.
     * @transaction
     */
    function trade( tx ) {
      tx.stock.low = Math.min( tx.price, tx.stock.low );
      tx.stock.high = Math.max( tx.price, tx.stock.high );
      tx.stock.change = Math.round( ( tx.price - tx.stock.last ) * 100 ) / 100;
      tx.stock.last = tx.price;
      
      // Get the asset registry
      return getAssetRegistry( 'org.acme.market.Stock' )
        .then( function( registry ) {
          // Update the asset
          return registry.update( tx.stock );
        } )
    	.then( function() {
          // Generate event
          var event = getFactory().newEvent( 
            'org.acme.market', 
            'TradeComplete' 
          );
        
          // Set properties
          event.symbol = tx.stock.symbol;
          event.low = tx.stock.low;
          event.high = tx.stock.high;
          event.open = tx.stock.open;
          event.last = tx.stock.last;
          event.change = tx.stock.change;
        
          // Emit
          emit( event );
        } );
    }  
    

In the logic file (JavaScript), the "Trade" transaction is further defined. It makes changes to the stock asset, and then saves it to the ledger. After that it emits the "TradeComplete" event with the latest valuation.

> Yes, this is really a blockchain application, and yes, this is really JavaScript. Composer is pretty cool!

Using the CLI commands from earlier, I can deploy this business network, and stand up a REST server (including WebSocket support for the events), with just two commands.

To submit changes to the stock assets, I have a Python script that picks a random stock, randomly changes the price to be within the high/low values (just keeping things easy here), and then submits that stock, along with the new price, to the "Trade" transaction. This happens once per second to demonstrate emitting and handle events from blockchain.

    import csv
    import requests
    import time
    
    from random import randint
    from random import random
    
    with open( 'short.list.csv', 'rb' ) as financials:
      reader = csv.reader( financials )
      portfolio = list( reader )
    
    while True:
      stock = portfolio[randint( 0, len( portfolio ) - 1 )]
    
      if len( stock[8] ) == 0:
        continue
    
      last = randint( 
        int( float( stock[8] ) * 100 ), 
        int( float( stock[9] ) * 100 ) 
      )
    
      trade = {
        '$class': 'org.acme.market.Trade',
        'stock': stock[0],
        'price': float( last ) / 100,
      }
      requests.post( 'http://localhost:3000/api/Trade', json = trade )
      time.sleep( 1 )  
    

Over on the web-based dashboard, a WebSocket listens for events. When it gets the "TradeComplete" event, it updates the respective parts of the user interface (data table, and chart). And with that we have built an application on blockchain, and handles event notifications in secondary systems.

### What's Next

If you find any of this compelling, I would strongly encourage you to spend some time kicking around Composer in the browser-based "playground". There is ==nothing to install=, and only knowledge of building blockchain applications (with JavaScript nonetheless) to gain.

When you are testing your application, you will see an option in the left sidebar to see all the changes to the ledger. If you have submitted a transaction that emits an event, you can even see the event and its associated details in the list (so you know you are getting what you want before deployment).

The source code for this project is in the IBM repository of my [GitHub](https://github.com/krhoyt/IBM/tree/master/blockchain/events) account.
