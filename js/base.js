
import factory from "./factory.js"

let globalID = 1

///
/// Base
///
/// Base of buildable objects using json notation; methods here are injected into other htmlelements by the factory
///
/// Principles:
///
///		+ users describing layout with lifecards use a json notation that is a transliteration of html
///
///		+ we use json based packets to describe two totally separate concepts:
///
///				- layout
///				- data
///
///		+ these 'blobs' of data pipe through our DOM and data portion is ignored and layout is rendered
///
///		+ use conventional html element labels and css props (a,div,footer and 'width' etc)
///		+ layout and data (or model and view effectively) exist in singlel packets of data
///		+ abstract sufficiently that threejs or other non html rasterizers could be targeted
///		+ but don't freak out about abstraction - use well known dom and css terminology
///		+ provide a few custom components for extravagently beautiful custom views
///		+ but try to work as gracefully as possible with minimum additions to vanilla html
///
/// Typical 'blob' description:
///
///		{
///
///			// uuid is not critical for layout but it is leveraged for generating dom ids
///			uuid:"/canonical/path",
///
///			// a user specified kind or null ("div" assumed otherwise)
///			kind:"my-custom-element-container",
///
///
///			// these are written to htmlelement.style.cssText basically
///			stylize:{
///				width:"320px",
///				backgroundColor:"blue",
///			},
///			
///			// these are appended as css classes to a produced element
///			classes:[
///				"my-fancy-button"
///			],
///
///			// content to stuff into the .innerHTML region
///			content:"<h1>My Cards</h1>",
///
///			// html element children to create and add as children
///			children:[
///				{
///					kind:"my-custom-element-card",
///					content:"This is my card"
///				}
///			],
///
///			// an optional back pointer to the database that is used to avoid globals
///			// some child nodes like to do database queries and we need to pass this through
///			// todo could look for ways to remove this
///			db
///
///		}
///
///

export default class Base extends HTMLElement {
	async resolve(blob) {

		// sanity check
		if(!blob || typeof blob !== 'object') {
			console.warn("base: illegal object")
			delete this.id
			this.replaceChildren()
			//this.className = ''
			//this.classList.value = ''
			this.removeAttribute('class')
			return
		}

		//
		// associate and id with an html dom element
		//
		// we want to do this because its possible users may want to use dom .query()
		// also it's apparently a best practice that everything have a unique id in a dom graph
		//
		// there are different ways to attach a reasonable dom id; multiple strategies seem best:
		//
		//		our nodes *may* have a database associated uuid; could uuencode and use that
		//		note our own ids are technically illegal in that dom cannot easily query for ids with '/' and '-' in them
		//
		//		a sequential id could be granted; this is not deterministic ahead of time
		//		a user may want to find a given child and they'd ideally like an easy way to know the id ahead of time
		//
		//		a hash id could be generated;
		//		but again this is not deterministic ahead of time
		//
		//		a user could specify an id for the cases that they want one
		//		i'm not sure that this really helps things be unique however
		//		it is arguably a reasonable solution
		//
		//

		{
			// callers should pass in a uuid in the current design
			if(blob.uuid) {
				this.id = blob.uuid
			}

			// if there is no uuid then grant one for now
			if(!this.id) {
				this.id = `${globalID++}`
				console.error("base: node has no id!")
				console.error(blob)
			}
		}

		// apply (or reapply) css if any
		if(blob.classes) {
			let arr = Array.isArray(blob.classes) ? blob.classes : [blob.classes]
			for(let c of arr) {
				if(!this.classList.contains(c)) {
					this.classList.add(c)
				} else {
					console.log("base: not resetting class property = " + c)
				}
			}
		}

		// stylize or restylize
		if(blob.stylize) {
			for(let [k,v] of Object.entries(blob.stylize)) {
				if(this.style[k] != v) {
					this.style[k] = v
					//this.setAttribute(k,v)
				} else {
					console.log("base: not resetting style property = " + k + " " + v)
				}
			}
		}

		// text of various flavors
		{
			let content = null
			if(!window.markdownit && !window.marked) {
				console.error("base: markdown not loaded yet")
			}
			if(blob.markdown && window.marked) {
				content = window.marked.parse(blob.markdown);
			}
			else if(blob.markdown && window.markdownit) {
				content = window.markdownit().render(blob.markdown)
			}
			else if(blob.text) {
				content = blob.text
			}
			else if(blob.content) {
				content = blob.content
			}
			if(this.innerHTML != content) {
				this.innerHTML = content
			}
		}

		//
		// update immediate children - these don't necessarily have to have any kind of id but we try hard to set one
		//

		if(blob.children && Array.isArray(blob.children)) {

			// track children by hand for now
			if(!this._children_elements) this._children_elements = {}

			// grant ids to children if needed
			let id = this.id || "verybad"
			let child_id = 1

			// iterate children and make dom nodes
			for(let blob2 of blob.children) {

				// stuff a uuid into the child - this is purely for the htmlelement id
				// this will eventually percolate to the htmlelement id
				// this should be deterministic and stable
				// note that almost always any data arriving here from db has a full uuid
				{
					// prefer a uuid - technically the user could pollute dom query space here
					if(blob2.uuid) {
						blob2.id = blob2.uuid
					}
					// otherwise if the blob has an id - could use that
					else if(blob2.id) {
						blob2.uuid = `${id}/${blob2.id}`
					}
					// if nothing useful then be creative
					else {
						blob2.id = `${child_id++}`
						blob2.uuid = `${id}/${blob2.id}`
					}
				}

				// sanity check - does child exist? just update if so
				let elem = this._children_elements[blob2.uuid]
				if(elem) {
					if(elem.resolve) elem.resolve(blob2)
				}

				// otherwise manufacture them whole cloth and append always
				else {
					let elem = await factory(blob2)
					if(elem) {
						this.appendChild(elem)
						this._children_elements[blob2.uuid]=elem
					} else {
						console.error("Base: could not build child from blob")
						console.error(blob2)
					}
				}
			}
		}
	}
}

customElements.define('lifecards-base', Base )

