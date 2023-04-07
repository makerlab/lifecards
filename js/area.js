
import factory from './factory.js'

///
/// Area HTMLElement provides shareable basic features:
///		- pagination
///		- order by
///

export default class Area extends HTMLElement {

	resolve(blob) {

		// remember children kind to manufacture
		this.kindchildren = blob.kindchildren

		// remember db
		if(!this._db && blob.db) {
			this._db = blob.db
		}

		// remember uuid
		if(this._uuid && blob.uuid != this._uuid) {
			console.error("area: uuid cannot change for now")
			return
		}
		this._uuid = blob.uuid

		// won't be able to get much further without these
		if(!this._db || !this._uuid) {
			console.error("Area: needs a db or a uuid")
			return
		}

		// if a query is a part of the blob then make sure it is not insane
		if (blob.queryable && (typeof blob.queryable !== 'object' || Array.isArray(blob.queryable))) {
			console.error("area: illegal query")
			return
		}

		// get caller arguments to fold into this query - or assume is a query for children
		let query_and_additional_args = blob.queryable || {parent:this._uuid}

		// have a durable query portion so that we can do pagination
		if(!this._durable_query) {
			this._durable_query = {
				offset:0,
				limit:999,
				handle:blob.uuid,
				observer:this._handle_query_results.bind(this)
			}
		}
		Object.assign(query_and_additional_args,this._durable_query)

		// do query
		this._db.resolve({command:"query",data:query_and_additional_args})

	}

	async _handle_query_results(results) {

		// make sure results are an array for now
		if(!Array.isArray(results)) results = [results]

		// track elements by hand due to naming issues with dom id elements
		if(!this._database_elements) this._database_elements = {}

		// visit results
		for(let blob of results) {

			// stuff our copy of the database into the child if any
			blob.db = this._db


			// override child style if area doesn't permit it explicitly
			if(!this.kindchildren || this.kindchildren.length < 1) {
				blob.kind = "card"
			}
			// or permit if explicitly permitted
			else if(this.kindchildren == "*") {
			}
			// or apply style
			else {
				blob.kind = this.kindchildren
			}

			// update child if it exists
			let elem = this._database_elements[blob.uuid]
			if(elem) {
				if(elem.resolve) {
					elem.resolve(blob)
				}
			}

			// otherwise manufacture child from scratch
			else {
				elem = await factory(blob)
				if(elem) {
					this.appendChild(elem)
					this._database_elements[blob.uuid]=elem
				} else {
					console.error("area: could not build database child")
					console.error(blob)
				}
			}
		}
	}

}

customElements.define('lifecards-area', Area )

var s = document.createElement('style');
s.innerHTML =
`
lifecards-area {
	display: flex;
	width: 100%;
	max-width:1200px;
	justify-content:center;
	flex-wrap:wrap
}
`
document.head.appendChild(s)



