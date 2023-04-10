
- hook site

	- in travel have pictures from tubbataha and anilao

	- in writing make essay work

	- a home page that has a backdrop image and maybe no large buttons?

- database

	* now loads md files in a hacky way - can generalize
	* now loads all the hint path prefix portions as a way to avoid tree gaps
	* now respects a "loaded" flag to stop running down leafs
	- it probably would be nice to have an area physically load other things it wants ahead of time
		(i'm looking for ways to prevent having to express something more than once)
		(i still currently have some duplicate expressions)
	- improve generation of child uuids on path loads so that i do not have to fully qualify them

- css issues

	- examine routable centering - currently it is off
	- examine area centering
	- also - does an area center cards? such as on makerlab and hook?
	- hook has two essays that may need content centering

	- remove piano effect or control it better

		- css piano effect breaks the user experience
		- 
		- css piano idea needs to be formalized as a separate concept
		- small vertical cards need to be generalized as on or off for each site

- files on disk; reduce exposed footprint to namespace collisions?
	- lifecards is a site that uses a kind of resource; a module or service

- general
	- actually make tag clicking do something useful
	- better factory fetch dom components dynamically off disk and remote
	- load md files on the fly
