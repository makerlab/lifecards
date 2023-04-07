
# chores march 2023

	- styleize area by default

			stylize: {
			display: 'flex',
			width: '100%',
			maxWidth:"1200px",
			justifyContent:"center",
			flexWrap:"wrap",
		},

		also maybe expose the power to base again?

	- dom
		- the dom constructor could be dis-intermediated a notch; no reason to have a DOM constructor just use Base
		- actually make tag clicking do something useful like show a page with things matching that tag
		- better factory fetch dom components dynamically and allow userland components and remote url components


	- db
	 - too forceful to fully qualify children - can figure out from path on load
	 - load md files on the fly
