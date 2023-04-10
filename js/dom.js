
import factory from './factory.js'

///
/// a 'service' level abstraction for the browser dom
///
/// general principles:
///
/// 	+ at the highest level of this app i have a concept of a pool of equal services
///		+ i want to isolate services from each others details
///		+ i pass through a handle on a database service which is a way to talk to the db
///
/// more principles:
///
///		+ i want to abstract away the browser so that i can target other rasterization layers such as threejs
///		+ but as well i don't want to go too overboard; so this is all largely a shim on the dom
///
/// more specifically:
///
///		+ this service allows a database driven view layout
///		+ it is fed by a root dom node that the user wishes to create
///		+ that node typically will have passed a handle on the db
///		+ the nodes themselves can query the database via the supplied abstraction handle
///
/// notes:
///		+ for now i think it's reasonable to persistently hold onto the db in window.
///		+ previously i was always passing the db handle around; but it polluted the code
///

export default class DOM {
	constructor(db) {
		window._dom_db_handle = db
		let observer = (results) => {
			console.log("results")
			results.forEach(blob => {
				console.log(blob.uuid)
				factory(blob).then(elem=>{
					if(elem)document.body.appendChild(elem)
				})
			})
		}
		db.resolve({command:"query",data:{uuid:"/",observer}})
	}
}
