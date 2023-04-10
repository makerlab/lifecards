
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
		this.default = blob.default || null
		router.observe( this.route.bind(this) )
	}

	route(e) {

		let path = e.uuid
		if(!path) {
			console.error("routable: has no path")
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

		if( window._dom_db_handle ) {
			window._dom_db_handle.resolve({command:"query",data:{uuid:path,observer}});
		}
	}
}

customElements.define('lifecards-routable', Routable )



/* it is not really necessary to precondition this element
var s = document.createElement('style');
s.innerHTML =
`
lifecards-routable {
	display: flex;
	width: 100%;
	justify-content: center;
}
`
document.head.appendChild(s);
*/




