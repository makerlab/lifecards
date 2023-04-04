
import Router from '../utils/router.js'

import factory from './_factory.js'

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
			return
		}
		if(path == "/") {
			path = this.default
		}

		if(!this.db) {
			console.error("routable has no db")
			return
		}

		this.db.resolve({command:"query",data:{uuid:path,observer:async (results)=>{
			if(!results || !results.length) return
			let blob = results[0]

			// detach children
			this.innerHTML = ""

			// stuff database into blob to be helpful
			blob.db = this.db

			if(!this._routable_elements) this._routable_elements={}

			let elem = this._routable_elements[blob.uuid]
			if(elem) {
				this.appendChild(elem)
				if(elem.resolve) elem.resolve(blob)
			} else {
				let elem = await factory(blob)
				if(elem) {
					this.appendChild(elem)
					this._routable_elements[blob.uuid]=elem
				}
			}

		}}})
	}
}

customElements.define('lifecards-routable', Routable )
