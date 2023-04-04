
# chores march 2023

	- dom
		- the dom constructor could be dis-intermediated a notch; no reason to have a DOM constructor just use Base
		- actually make tag clicking do something useful like show a page with things matching that tag
		- fetch dom components dynamically and allow userland components and remote url components

	- core issues
		- url paths; in the current design the url path maps to the database objects; short-hand would be nicer

	- db
		- the database could be renamed as database_fs optionally for clarity
		- the database should fetch folder content dynamically to avoid revealing the names of folders and content
