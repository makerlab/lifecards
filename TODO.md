
- design todo

	- use a third party embed card stylizer to stylize links to youtube, vimeo, images
		- (effectively act like a bookmarking service aka mymind, arena, getpocket )

	- tags -> at the moment routes are only paths and produce a view on a database object
			  typically one clicks on an object - the object itself of course can have a query
			  but instead i want to be able to have path or route that is itself a raw query
			  and then tagging results is easy
			  so for example something like /q?tags=xyz or /?search=hello&tags=stuff&date
			  if i have a more flexible routing scheme i could redirect traffic at will
			  or alternatively i can just have a custom element that can handle search

	- i kinda feel like a lifecards pitch deck would be useful; and can show cards
		- problem; managing information close to the fs
		- solution; 
		- use cases

- database todo

	* now loads all the hint path prefix portions as a way to avoid tree gaps
	* now respects a "loaded" flag to stop running down leafs
	~ if a file is corrupt it still gets a database entry; i've hacked around this but it is sloppy
	~ now loads md files in a hacky way - sloppy improve

	- it probably would be nice to have an area physically load other things it wants ahead of time
		(i'm looking for ways to prevent having to express something more than once)
		(i still currently have some duplicate expressions)

	- improve generation of child uuids on path loads so that i do not have to fully qualify them

	- there is some kind of weird bug in deno where the next fetch fails after one is not found

- general todo

	- better factory fetch dom components dynamically off disk and remote
