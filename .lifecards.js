
/*

What is this file?

This is an example of a file that the lifecards database looks for and loads.
Typically these files contain a flat declaration of a bunch of database nodes in our schema.
The database always attempts to load particular file at startup to bootstrap itself.

What does it do?

The current objects below happen to define the look and feel of the main page of the lifecards website itself.
It does so happen that the actual content is purely layout information in this case - but you don't have to restrict yourself to describing layout.
You could declare hundreds of assets here, or import from other files, or even run full blown javascript and make assets up.

Note:

There are also other nearby hints files in sub-folders that describe various sub pages.
The database *will* also at least once try to load a hint file from each uuid sub-folder it encounters.

*/

// a custom fancy widget for navigation that highlights the current active url
let nav = {
	kind: "nav",
	children: [
		{ kind:"link", link:"/splash", text:"&nbsp;/&nbsp;" },
		{ kind:"link", link:"/usage" },
		{ kind:"link", link:"/design" },
	]
}

// a custom fancy widget that is a logo generator that can produce a variety of logos
let logo = {
	kind:"logo",
	link:"/",
	style:"small center",
	content:"lifecards",
}

// a custom footer widget that does a few slightly custom details
let footer = {
	kind:"footer",
	content:"Thanks for visiting!"
}

// overall layout of all elements
let site = {
	uuid:"/",
	children:[
		logo,
		nav,
		{ kind:"routable", default:"/splash" },
		footer
	],
}

let list_of_items_for_database_to_start_with = [
	site
]

export default list_of_items_for_database_to_start_with;
