
import Router from '../utils/router.js'

import factory from './factory.js'

let router = new Router()

///
/// Routable
///
/// Looks at the current browser url
/// Resolves url to a matching database object if any
/// Given a database object builds a dom element and sets it as the current child
///
/// todo this thing could accept args rather than translating url to db
///

export default class Routable extends HTMLElement {

	resolve(blob) {
		if(this.db) return
		this.db = blob.db
		this.default = blob.default || null
		router.observe( this.route.bind(this) )
	}

	route(e) {

		let path = e.uuid
		if(!path) {
			console.error("routable: has no path")
			return
		}

		if(!this.db) {
			console.error("routable: has no db")
			return
		}

		// richer routing mechanics tbd
		// for(let entries in Object.entries(this.routes)) {			
		// }

		// hacks
		//if(path == "/lifecards/") path = "/" // HACK
		//if(path == "/makerlab/") path = "/" // HACK
		if(path == "/") {
			path = this.default
		}

		// helper function to set new page contents
		let switcher = (blob) => {

			// detach any children
			this.innerHTML = ""

			// stuff database into blob to be helpful
			blob.db = this.db

			// already built?
			if(!this._routable_elements) this._routable_elements={}
			let elem = this._routable_elements[blob.uuid]
			if(elem) {
				this.appendChild(elem)
				if(elem.resolve) elem.resolve(blob)
			}
			// attempt to make component
			else {
				factory(blob).then(elem=>{
					if(!elem) {
						console.error("routable: cannot make page")
						console.error(blob)
					} else {
						this.appendChild(elem)
						this._routable_elements[blob.uuid]=elem
					}
				})
			}
		}

		// helper to watch for database changes
		let observer = async (results) => {
			if(!results || !results.length) {
				return;
			} else {
				switcher(results[0])
			}
		}

		this.db.resolve({command:"query",data:{uuid:path,observer}});
	}
}

customElements.define('lifecards-routable', Routable )
