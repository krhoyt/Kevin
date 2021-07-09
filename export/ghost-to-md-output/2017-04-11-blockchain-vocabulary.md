---
title: Blockchain Vocabulary
slug: blockchain-vocabulary
date_published: 2017-04-11T18:46:46.000Z
date_updated: 2019-01-17T00:43:23.000Z
tags: blockchain
---

Blockchain has gained a lot of attention this year. That is great! It is a fine solution for many problems. If you are a developer however, being asked to make since of what problems blockchain can solve for your business, then you may quickly find yourself in over your head. With that in mind, I thought I would put together a developer-centric vocabulary list.

##### Disclaimer

The way in which I am about to approach defining blockchain terms may disagree with you if you are a developer already using the technology. Indeed, there seems to be an almost philosophical battle within the blockchain community as to how to represent the technology, and communicate it to others.

I am not trying to start fires here, I am merely explaining blockchain in the way I put it together in my developer mind. It is the way that works for me, and gave me a foundation on which I was able to then deepen my understanding.

##### Blockchain

I will actually visit this definition three times in this post. Firstly, what the heck is "blockchain"?

You do not have to live in Silicon Valley to have heard of Bitcoin. The so-called cryptocurrency has had broad media coverage of both the positive and negative variety. Bitcoin was actually the first blockchain application.

![Bitcoin was the first Blockchain application.](http://images.kevinhoyt.com/blockchain.vocab.2.png)

The way I see this, when we refer to Bitcoin, we are referring to the application layer in our architecture. This might be where your Node.js or Java EE lives in architectures you have today. In that architecture then, blockchain is effectively the data storage tier.

To be sure, calling blockchain just a "database" would be selling it short. There are several unique characteristics that make it stand out for certain types of applications. Another way to put this might be "If blockchain is just a database, what kind of database is it? Relational? NoSQL?"

##### Ledger

Technically, blockchain is a ledger. The term "ledger" comes from general accounting. In accounting, every transaction gets recorded by the parties involved. If somebody changes a value, then the books do not add up, and a problem will surface relatively quickly (as soon as somebody goes reconcile the books). Ledgers are generally made up of a handful of columns - the date of the transaction, the category of the transaction, a column for income (credit), a column for expenses (debit), and the running balance.

![An example ledger](http://images.kevinhoyt.com/blockchain.vocab.4.png)

In this example, if I remove the expense of "Office Supplies" for $125.36, then the rest of the lines will not add up. Something is wrong, and we know pretty much right away. Blockchain exhibits the same kind of behavior, but with chunks of data, not credits and debits.

![Hash Chain](http://images.kevinhoyt.com/blockchain.vocab.5.png)

Let us say that I have a record I want to put in my database (ledger). That value will be hashed. That hash is then attached to the record (usually the header) when the data is stored. When you go to change that record (create, update, delete), the original hash is included with the bytes that get hashed for this new record. The resulting hash is then attached to the record and stored. In this manner, a chain of hashes is formed. Altering a piece of data anywhere back in the chain would break the values after that point, invalidating the data, and failing any future transactions.

> My favorite demonstration of this process, why it matters, and how it works, is [this video](https://www.youtube.com/watch?v=_160oMzblY8) from CirclePay Evangelist, [Anders Brownworth](https://twitter.com/anders94). It starts slow, but I personally guarantee a light bulb moment.

##### Block. Chain.

Here we are again. A **block** represents a group of transactions. You might think of this as your bank statement. Data in the block cannot be altered retroactively. A **chain** then refers to the list of ordered records, each with a link to the previous record. Blockchain!

##### Distributed and Decentralized

Of course, you would not put a database on a single server and call it done. You would want redundancy, load distribution, and backup, to name a few. The three main architectures to consider when setting up a database cluster (network) are centralized, decentralized, and distributed. Blockchain is a distributed ledger (database), with decentralized consensus. Let us break that down in a bit more detail.

![Distributed and Decentralized](http://images.kevinhoyt.com/blockchain.vocab.9.png)

As a distributed ledger, blockchain networks are peer-to-peer, and can be difficult to maintain. Without a single point of failure however, one broken link in the network only makes more distributed networks, and does not bring down the entire system. The result is a highly scalable network. Since centralized systems follow a single framework, they do not have diversity, and evolve slowly. Decentralized and distributed systems have an up-front cost in establishing the architecture, but from there have tremendous evolution.

> If you want a bit more depth on all these terms, and the breakdown of where they do/not work, I suggest [this blog post](https://medium.com/@bbc4468/centralized-vs-decentralized-vs-distributed-41d92d463868) by TinyOwl Founter, [Saurabh Goyal](https://twitter.com/bbc4468).

##### Byzantine Fault Tolerance

One of the problems that emerges in a distributed system is how to coordinate communication over a potentially unreliable link. This is referred to as the "Two Generals' Problem" also called the "Byzantine Generals' Problem".

![Two Generals' Problem](http://images.kevinhoyt.com/blockchain.vocab.10.png)

Two [Byzantine Empire] generals, A1 and A2, are preparing to attack fortified city, B. The armies are encamped near the city, each in its own valley. A third valley separates the two hills, and the only way for the two generals to communicate is by sending messengers through the valley. While the two generals have agreed to attack, they have not agreed upon a time for the attack.

This raises a whole variety of problems.

If A1 sends a message to A2, to say "Attack at dawn" A2 may never receive the message. Or A2 may get the message, but A1 has no way to confirm that. It could also happen that B intercepts the message, alters the attack time, and then sends it on to A2. The same problem happens when A2 sends a message to A1. All this, and we have not even introduced the problem that A1 may be traitorous!

The Two Generals' Problem was the first computer communication problem to be proven to be unsolvable.

This is a problem endemic to a distributed system such as blockchain. In order to fix it, you have to make some compromises on the original problem. A blockchain implementation such as [Hyperledger Fabric](https://www.hyperledger.org/), solves this using Practical Byzantine Fault Tolerance (PBFT). I will not elaborate on the compromises of PBFT here, mostly because it is an implementation detail that a typical developers will never need to think about.

##### Consensus

With you typical database solution, there is an administrator. Or at the very least, various users, roles, and privileges, as to who can work on what data. At any point in time however, the administrator can yank to those privileges, and even modify the data stored in the database. As you might imagine, having that central authority can be problematic if we are talking about my bank statements.

![Consensus](http://images.kevinhoyt.com/blockchain.vocab.11.png)

On a blockchain network, there is no centralized authority that determines the transaction order. Instead, many validating peers (nodes) implement the network consensus protocol. Consensus ensures that a quorum of nodes agree on the order in which the transactions are appended to the shared ledger. By resolving any discrepancies in the proposed transaction order, consensus guarantees that all blockchain network nodes are operating on an identical ledger.

##### Proof-of-Work

The follow-on question then becomes who are the nodes on the network? What gives them the right to participate in the first place?

With Bitcoin, anybody can join the network. Consensus this is achieved through "proof-of-work". In order to commit a transaction, you must first solve a mathematical problem unique to that specific transaction. The first peer to solve the transaction wins consensus, and can in turn commit the transaction. This is a permissionless system.

What, the what?

Consider a form in a web page. The Internet is an open network. Anybody can join, visit your web form, and submit content that gets stored in your database. Even robots. Robots can send junk data into your system, and they can submit that web form really fast - fast enough to bring down the system entirely. A common technique to solving this problem is CAPTCHA.

With a CAPTCHA, you are asking the person submitting the data to **prove** that they are a person. They have to do some **work** to do that, such as reading skewed text, or adding two numbers presented in images. Proof-of-work is effectively CAPTCHA for computer.

##### Permissions

While Bitcoin leverages a permissionless system, there are also permissioned blockchain systems. These are often called private blockchains. In a private blockchain, peers must be authenticated, usually using certificates. This subtle change has several distinct impacts on blockchain - most notably the speed with which transactions can be processed.

A private blockchain that provides for some requirement of authentication is where blockchain becomes especially valuable to businesses.

![Blockchain for Business](http://images.kevinhoyt.com/blockchain.vocab.13.png)

Think of your health records. You have a primary physician, but then you see a specialist for a specific medical condition. Likely you will see more than one specialist. If you have other conditions down the road, say a vision problem, or cancer, you will be seeing countless physicians, all with bits of your data, but without any one having the complete picture.

Now think of all the health related data you probably store for yourself. Maybe you take your blood pressure. Track your run lately? Supplement with calcium? Track what you eat and the nutritional values? All this data about you, scattered everywhere.

What if we had a database that all these different companies could use to work on your single, secure, health record? How much easier would it be to see that specialist for the first time? What kind of additional treatments might be uncovered by having the whole picture of your health? How much earlier could we detect cancer? The possibilities in this one industry alone represent a huge opportunity for the practical application of blockchain.

##### Blockchain

Okay, so now we have some vocabulary under our belts, let us revisit the definition of blockchain one last time.

![The special characteristics of blockchain.](http://images.kevinhoyt.com/blockchain.vocab.14.png)

![Business use-cases for blockchain.](http://images.kevinhoyt.com/blockchain.vocab.15.png)

One of the tricks with envisioning where blockchain technology can be useful is in separating it from physical assets such as money, or shipping. If you look at the features offered by blockchain, you will find many good applications. A wiki fits these characteristics. A shared calendaring system. Even the good old to-do list, where multiple parties (even companies) are organizing a new product launch, or a summer blockbuster movie release.

##### Next Steps

Indeed, industry analysts that are bullish on blockchain see it ultimately replacing the very fabric of how the Internet works today. I do not know if I am ready to go that far, but it is certainly a technology worth investigating for your next application.

On those closing notes, if you want to see a to-do list type of application, understand how it is built, and see it in action, I have put together just such an example ([repository](https://github.com/IBM/todo-list-fabric)). Check it out, fork it and send a pull request if you want to contribute, or just leave a comment below with your thoughts. Happy blockchain!
