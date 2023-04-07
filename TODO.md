
# chores march 2023

	- css piano idea needs to be formalized as a separate concept

	- css
		- already concerned about style bleed through from various components
		  for example routable is set to be a flex box
		  and so is site
		  i really want more like a mixin approach that has defaults
		  needs an audit

	- database dynamic fetch examine closer

		- because areas are not fetched until visited summaries don't always work
		- authors are required to preload or prehint at things they want to exist
		- is that ok? are there cases where it breaks badly?

	- if i'm going to do a piano thing then do it on purpose; make it a mode

	- area is the only thing that has database children; should that be exposed to base?

	- the dom constructor could be dis-intermediated a notch; no reason to have a DOM constructor just use Base

	- actually make tag clicking do something useful like show a page with things matching that tag

	- better factory fetch dom components dynamically and allow userland components and remote url components

	- db dynamic load; don't require children paths to be fully specified

	- load md files on the fly
