
/**
 * https://gist.github.com/creationix/7435851
 * A simple analog of Node.js's `path.join(...)`.
 * https://gist.github.com/creationix/7435851#gistcomment-3698888
 * @param  {...string} segments
 * @return {string}
 */
function build_path(...segments) {
  const parts = segments.reduce((parts, segment) => {
    // Remove leading slashes from non-first part.
    if (parts.length > 0) {
      segment = segment.replace(/^\//, '')
    }
    // Remove trailing slashes.
    segment = segment.replace(/\/$/, '')
    return parts.concat(segment.split('/'))
  }, [])
  const resultParts = []
  for (const part of parts) {
    if (part === '.') {
      continue
    }
    if (part === '..') {
      resultParts.pop()
      continue
    }
    resultParts.push(part)
  }
  return resultParts.join('/')
}

///
/// Test code for a database abstraction
///
///	+ Provides a streaming interface to data with constant updates / observer pattern
///
///	+ data has some kind of implicit order; if data is stored in a certain order it should return in that order
///
///	+ for now much of this is faked internally
///


export default class Database {

	constructor(message = null) {
		this._promises = []
		this._data = []
		this._indexed = {}
		this._tags = {}
		this._counters = {}
		this._observers = {}
		this.resolve(message)
		window.DB = this
	}

	resolve(message = null) {

		if (!message || typeof message !== 'object' || Array.isArray(message)) {
			console.warn("DB: poorly formed message = " + message)
			return
		}

		switch(message.command) {
			case "load":
				this._promises.push( this._load(message.url) )
				break
			case "create":
				this._promises.push( this._create(message.data) )
				break
			case "query":
				this._query(message.data)
				break
			default:
				this._query(message)
				break
		}
	}

	async _load(url) {
		let module = await import(url)
		for(let child of module.default) {
			await this._create(child)
		}
	}

	async _create(blob) {
		if(!Array.isArray(blob)) blob = [blob]
		for(let item of blob) {
			await this._create_one(item)
		}
	}

	async _create_one(blob) {

		// sanity checks
		if(!this.fixup_uuid(blob)) {
			throw "DB: bad node"
			return
		}

		// store and index
		if(this._indexed[blob.uuid]) {
			console.warn("DB: duplicate uuid = " + blob.uuid)
		} else {
			this._data.push(blob)
		}
		this._indexed[blob.uuid] = blob
		console.log("DB: stored " + blob.uuid)

		// build up a tag index for queries later
		// rewrite blob tags to be an array
		if(blob.tags) {
			let tokens = blob.tags = Array.isArray(blob.tags) ? blob.tags : blob.tags.split(",")
			for(let token of tokens) {
				let arr = this._tags[token]
				if(!arr) {
					arr = this._tags[tokens] = []
				}
				arr.push(blob)
			}
		}

/*
		// deal with insitu children - turned off for now
		if(blob.children) {
 			if(Array.isArray(blob.children)) {
	 			for(let child of blob.children) {
					child.parent = blob.uuid
					console.log(child)
					await this._create(child)
				}
			} else {
				console.error("DB: invalid children type for = " + blob.uuid)
			}
			delete blob.children
		}
*/
	}

	fixup_uuid(blob) {
		// sanity check
		if(blob.uuid && blob.uuid != "/" && (blob.uuid.endsWith("/") || !blob.uuid.startsWith("/"))) {
			console.error("DB: corrupt - uuid must start with slash and must not end with slash")
			console.error(blob)
			return null
		}

		// sanity check
		if(blob.parent && blob.parent != "/" && (blob.parent.endsWith("/") || !blob.parent.startsWith("/"))) {
			console.error("DB: corrupt - parent must start with slash and must not end with slash")
			console.error(blob)
			return null
		}

		// sanity check
		if(blob.id && blob.id.includes("/")) {
			console.error("DB: corrupt - id may not have slash")
			console.error(blob)
			return null
		}

		// sanity check
		if(!blob.uuid && !blob.parent) {
			console.error("DB: corrupt - no uuid or parent - bad node?")
			console.error(blob)
			return null
		}

		// given uuid recover parent and id
		if(blob.uuid) {
			let tokens = blob.uuid.split("/")
			if(tokens.length > 2) {
				blob.id = tokens.pop()
				blob.parent = tokens.join("/")
			} else if(tokens.length > 1 && tokens[1].length > 0) {
				blob.id = tokens.pop()
				blob.parent = "/"
			} else {
				blob.id = ""
				delete blob.parent
			}
		}

		// may generate an id and uuid from a parent
		else if(!blob.id) {
			let count = this._counters[blob.parent] = (this._counters[blob.parent] || 0 ) + 1
			blob.id = `n${count}`
			blob.uuid = build_path(blob.parent,blob.id)
		}

		// may generate a uuid from a given id
		else {
			blob.uuid = build_path(blob.parent,blob.id)				
		}

		return blob
	}

	///
	/// Ask the database to do some work for you
	///
	/// Insertions from a file look like this:
	///
	///		{
	///			load: "filename"
	///		}
	///
	/// Queries look something like this:
	///
	///		{
	///			query: { parent:"/parent", uuid:"/something", color:"blue", tag:"blue" },
	///			offset:0,
	///			limit: 999,
	///			observer: function callback
	///			handle: "uniqueid",
	///		}
	///
	/// If you supply a handle then the database will deliver results in perpetuity until cancelled
	///
	/// Persistent callbacks are not implemented yet
	///

	async _query(args=0) {

		// sanity check
		if (!args || typeof args !== 'object' || Array.isArray(args)) {
			console.warn("DB: poorly formed query = " + args)
			return
		}

		// i really want to wait for data be poured into system before doing queries on it
		while(this._promises.length) {
			let promise = this._promises.shift()
			await promise
		}

		// must have observer
		if(!args.observer) {
			console.error("DB: no observer callback handler")
			return
		}

		let observer = args.observer
		let offset = args.offset || 0
		let limit = args.limit || 999
		let results = []

		// query for a single uuid skips searches and ignores offset and limit
		if(args.uuid) {
			let blob = this._indexed[args.uuid]
			if(blob) {
				results.push({...blob})
			}
		}
		// brute force search - todo improve
		else {
			this._data.forEach(blob => {
				if(args.tags) {
					if(!blob.tags) return
					for(let tag of args.tags) {
						let success = false
						for(let tag2 of blob.tags) {
							if(tag2 == tag) { success=true; break }
						}
						if(!success) return
					}
				}
				if(args.parent && blob.parent != args.parent ) return
				if(args.includes && (!blob.parent || !blob.parent.includes(args.includes))) return
				if(offset > 0) { offset--; return }
				if(limit <= 0) return
				limit--;
				results.push({...blob})
			})
		}
		observer(results)
		//results.forEach( observer )
	}
}
