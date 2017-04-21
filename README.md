README.md

####Hello Falmouth University!####

##Project for technical support officer##

#Initial assessment: #
**Some initial thoughts regarding the requirements for this project:**
	Like any project this one is really a series of small projects. Generally when approaching this (or any seemingly complex problem, really) I find it advisable to break the problem down into “bite sized chunks” in order to figure out the best tools for each step.
	So what does this app require of us? We need to write a program that does each of the following steps:
A modelling company has a large number of full-length high-resolution images of their models (for examples, you can search shutterstock.com for “full length man” or “full length woman”)
	1.	Store modelling shots
		  * How much storage? The requirement reads that the company _“…has a large number of full-length high-resolution images of their models“_. 
		  * This is a bit vague so let’s do some back-of-the-envelope work: let’s assume that there are, at the absolute upper end here, around two thousand models employed by this agency and that they want to maintain, let’s say, a thousand shots of each. That would give us around two million rows worth of data (assuming each image takes up a row	). 
		  *	This would negate the need for a super advanced NOSQL solution like Hadoop. MongoDB might work (the document based structure would dovetail nicely with the requirement that each model have a single document)…but this would add an unnecessary level of complexity. Sticking with the philosophy of K.I.S.S (Keep It Simple, Stupid) I would choose a **MYSQL** solution for this—MYSQL is broadly available and getting coding help with it is extremely easy. It works well with most front-end technologies and writing an Object Relational Mapper for MYSQL is simple as there is lots of publicly available code that does that in most languages (why re-invent the wheel)? 
		  *However, for a particular brief, they need to select the models for close-up face shots. They would like to be able to scroll through all the faces cropped out of the high-resolution images with a single click to access the original image, so that they can find the right ones to present to their client.

2.	Retrieve modelling shots:
	  *So the design here is: Show image A (the full body shot of the model) and retrieve image B (the “face shot” of the model) when image A is clicked on. This would mean mapping multiple values in a key->value store. We can probably speed this whole process up if we have a MYSQL back end pushing out key->value stores to a REDIS cache which would provide near instant return of values. Even better- let’s set up something that can work asynchronously. So the storage would be: **MYSQL -> REDIS -> Node.js** (excellent facial recognition library)
	  *My plan would be a key/value store in REDIS updated twice a day from the “full body shots” in MYSQL. So in pseudocode I would have something like:
	  ```javascript
		if exists(key-from-redis):
		    retrieve(key)
		   present(value)
		if not exists(key-from-redis):
		    access MYSQL
		    retrieve “full body shot” of model
		    run facial recognition library from Node.js on full body shot in order to crop      facial image
		   insert into REDIS as “full body shot” => “facial shot”
		  present “facial shot”
	 ```	  
3. Also- every night at, say, 3am:
     ```javascript
     retrieve all keys (full body shots) from redis into a list
     run MYSQL query of “SELECT body shots not in {keys from redis}”-> read to list
   	 run node.js facial mapping software on all keys in that list from step above
     Update mysql with new values (or insert as necessary)
    ```



#There are a couple of reasons I chose node.js for this exercise: #
	*  It’s a “front end” heavy exercise- most of the work is client side (meaning that the database is not doing a lot of “heavy lifting” to make everything work).
	*	The words “scroll through a list of…” got me thinking about node.js and some of the frameworks that allow asynchronous loading from a cache. So basically- I am looking for an asynchronous language that will not do things like “load images” to a page until they actually have to (i.e: until the user actually scrolls down beyond the images already on the page). This is a lot more efficient than what I would get with, say, PHP- which would say “Okay- present this complete list of all images to the user” (you could, of course, work around this with some javascript asynchronous code- but either way you are using javascript! Why not take PHP out of the equation here?)
	*  What I like here is that node.js is “lazy” in this scenario; because of the single-threaded event loop it is action driven…it will sleep until the user takes an action like “scroll down to load more images of models”. Also- with node.js I don’t have to write SQL, PHP and javascript- I can get away with pretty much end-to-end javascript (and some simple MYSQL in the back end of course). 
	*  I am a big fan of the K.I.S.S (Keep It Simple, Stupid) principle. Using node.js allows me to keep a single language (javascript) and do most of the interactions on the front end as needed. In addition to node, to keep things organized, I will need a decent framework. Sails.js offers an excellent, lightweight framework for me to work from.
	*  For testing I will be using the mocha.js library for node.js
	*  In addition- it’s got a great facial recognition library that will allow me to process and find faces extremely efficiently: face

