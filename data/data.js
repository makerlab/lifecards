
import splash from './splash.js'
import usage from './usage.js'
import design from './design.js'

let nav = {
	uuid: "/lifecards.org",
	kind: "nav",
	children: [
		{ kind:"link", link:"/lifecards.org/splash", text:"/" },
		{ kind:"link", link:"/lifecards.org/Getting Started" },
		{ kind:"link", link:"/lifecards.org/design" },
		]
}

let logo = {
	kind:"logo",
	link:"/",
	style:"small center",
	content:"lifecards",
}

let footer = {
	kind:"footer",
	content:"Thanks for visiting!"
}

let site = {
	uuid:"/lifecards.org",
	kind:"site",
	children:[
		logo,
		nav,
		{ kind:"routable", default:"/lifecards.org/splash" },
		footer
	],
}

let data = [
	site,
	...splash,
	...usage,
	...design,
]

export default data;

