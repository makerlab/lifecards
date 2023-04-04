
import DB from './db.js'
import DOM from './dom.js'

export default class App {

	constructor(blob) {

		// a database abstraction
		let db = new DB(blob.data || "/data.js")

		// a dom abstraction
		let dom = new DOM()

		dom.create({kind:"spa",db})

		// query db and manufacture desired content
		db.observe({...blob,handle:0,observer:(blob2)=>{
			blob2.db = db
			dom.observe(blob2)
		}})
	}
}
