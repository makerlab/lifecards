
import factory from "./_factory.js"

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

		// associate htmlelement id even though it is not legal
		this.id = blob.uuid || 0

		// update immediate children if any - after text
		if(blob.uuid && blob.children && Array.isArray(blob.children)) {
			if(!this._children_elements) this._children_elements = {}
			let id = 1
			for(let blob2 of blob.children) {
				// stuff the database into the child
				blob2.db = blob.db
				// force uuid - todo could perhaps allow a local id?
				blob2.uuid = blob.uuid + "/v"+id++
				let elem = this._children_elements[blob2.uuid]
				if(elem) {
					if(elem.resolve) elem.resolve(blob2)
				} else {
					blob2.db = blob.db
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

		// update database children if any
		if(blob.db && blob.uuid && blob.query) {

			// build a persistent query to track pagination and so on
			let query = this._children_query
			if(!query) {
				query = this._children_query = {
					offset:0,
					limit:999,
					handle:blob.uuid,
					observer:0
				}
			}

			// special case convenience notation - find children
			if(blob.query=="*" || blob.query=="") {
				query.parent = blob.uuid
			}

			// reject other queries that look wrong
			else if (typeof blob.query !== 'object' || Array.isArray(blob.query)) {
				return
			}

			// merge query args for custom queries
			else {
				Object.assign(query,blob.query)
			}

			// query result helper
			query.observer = async (results) => {
				if(!this._database_elements) this._database_elements = {}
				if(!Array.isArray(results)) results = [results]
				for(let blob2 of results) {

					// stuff the database into the child
					blob2.db = blob.db

					// override child style if desired
					if(blob.queryrender) {
						blob2.kind = blob.queryrender
					}

					// find child
					let elem = this._database_elements[blob2.uuid]
					if(elem) {
						if(elem.resolve) elem.resolve(blob2)
					} else {
						elem = await factory(blob2)
						if(elem) {
							this.appendChild(elem)
							this._database_elements[blob2.uuid]=elem
						} else {
							console.error("Base: could not build datbase child")
							console.error(blob2)
						}
					}
				}
			}

			// do query
			blob.db.resolve({command:"query",data:query})
		}
	}

}

customElements.define('lifecards-base', Base )

