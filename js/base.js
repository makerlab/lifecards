
import factory from "./factory.js"

///
/// Base
///
///		db 			-> optional handle on a database for queries
///		classes		-> optional css classes to stylize this htmlelement with
///		children	-> optional children to immediately add as children htmlelements
///		query		-> optional children via database to add as children htmlelements
///		queryrender	-> optional stylize children to be of a certain htmlelement type
///
///

export default class Base extends HTMLElement {
	async resolve(blob) {

		// cache and hold a back pointer to db if seen
		if(!this._db && blob.db) {
			this._db = blob.db
		}

		// if no data then flush all and return
		if(!blob) {
			this.replaceChildren()
			//this.className = ''
			//this.classList.value = ''
			this.removeAttribute('class')
			return
		}

		// apply (or reapply) css if any
		if(blob.classes) {
			let arr = Array.isArray(blob.classes) ? blob.classes : [blob.classes]
			for(let c of arr) {
				this.classList.add(c)
			}
		}

		// stylize
		if(blob.stylize) {
			for(let [k,v] of Object.entries(blob.stylize)) {
				this.style[k] = v
				//this.setAttribute(k,v)
			}
		}

		// text?
		if(!window.markdownit && !window.marked) {
			console.error("base: markdown not loaded yet")
		}
		if(blob.markdown && window.marked) {
			this.innerHTML = window.marked.parse(blob.markdown);
		}
		else if(blob.markdown && window.markdownit) {
			this.innerHTML = window.markdownit().render(blob.markdown)
		}
		else if(blob.text) {
			this.innerHTML = blob.text
		}
		else if(blob.content) {
			this.innerHTML = blob.content
		}

		// associate htmlelement id even though symbols i use are not legal according to html spec
		this.id = blob.uuid || 0

		// update immediate children if any - after text
		if(blob.uuid && blob.children && Array.isArray(blob.children)) {
			if(!this._children_elements) this._children_elements = {}
			let id = 1
			for(let blob2 of blob.children) {
				// stuff the database into the child if we have it
				blob2.db = this._db

				// force uuid - todo could perhaps allow a local id?
				blob2.uuid = blob.uuid + "/v"+id++
				let elem = this._children_elements[blob2.uuid]

				// for existing elements just update them (if they have that ability)
				if(elem) {
					if(elem.resolve) elem.resolve(blob2)
				}

				// otherwise manufacture them whole cloth and append always
				else {
					blob2.db = this._db
					let elem = await factory(blob2)
					if(elem) {
						this.appendChild(elem)
						this._children_elements[blob2.uuid]=elem
					} else {
						console.error("Base: could not build child")
						console.error(blob2)
					}
				}
			}
		}
	}

}

customElements.define('lifecards-base', Base )

