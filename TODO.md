
- database

	* now loads md files in a hacky way - can generalize
	* now loads all the hint path prefix portions as a way to avoid tree gaps
	* now respects a "loaded" flag to stop running down leafs
	- it probably would be nice to have an area physically load other things it wants ahead of time
		(i'm looking for ways to prevent having to express something more than once)
		(i still currently have some duplicate expressions)
	- improve generation of child uuids on path loads so that i do not have to fully qualify them

- files on disk; reduce exposed footprint to namespace collisions?
	- lifecards is a site that uses a kind of resource; a module or service

- general
	- actually make tag clicking do something useful
	- better factory fetch dom components dynamically off disk and remote
