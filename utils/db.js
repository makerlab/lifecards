
///
/// Abstract common core for all services conceptually
///
///		+	I have a specific phrasing of all components/services; they are not just classes with a big bucket of methods and a public interface
///		+ I'm structuring most of my projects today conceptually as servers that runs a computational soup
///		+ Every "service" in that soup provides a resolve() method
///		+ Services can be bound to each other and observe each other
///		+ Services are all the same on the outside
///

class AbstractService {
	resolve(message={}) {}
}

///
/// Database Common Core
///
///		+ I have a concept of a database abstraction for different targets, mongo, filesystems etc
///		+ uses an observer pattern - so if watching a real db it would push updates to you
///
///	Users define database objects that look kinda like this:
///
///		{
///				uuid:"//lifecards.org/contributors/joseph"
///				query:"*"
///		}
///
/// We "crumple" the concept space of the database objects - it overlaps with user state.
///	Users can stuff other properties into that object directly.
/// That means basically that "uuid" and "query" are reserved in the current implementation.
///
/// UUID
///
/// Devising uuids for objects has been a bit tricky for this project:
///			- we need globaly unique identifiers per object from different collections that have never being reified
///			- human manageable, editable notation
///			- i have leaned towards using DNS; users should specify dns qualified uuids
///
/// Building a bridge between conventional file systems and uuids is also a bit tricky:
///			- using paths such as /janet/knitting/pearlstitches is "good enough" i think
///			- a url, urn like scheme maps well to file systems and users can participate in it
///			- users are used to directed acyclic graph notation
///			- a file or concept has one canonical location
///			- because the database knows about path notation it is easy to find children
///			- users do not have to specify the parent of any given entity explicitly
///
/// QUERY
///
///			- user defined objects don't have to be limited to only referring to children
///			- the query field allows for rich database queries with arbitrary results
///			- queries in general are 'observers' they keep reporting changes back to you
///
///

class AbstractDatabase extends AbstractService {
	resolve(message={}) {}
}

///
/// Filesystem Database
///
///		+ database abstraction wrapper for filesystems
///		+ in the file system case make strong attempts to preserve implicit order of content
///		+ later needs good scanners to help scan and provide hints at filesystem level
///

export default class DatabaseFS { // extends AbstractDatabase

	constructor(message) {
		this._data = []
		this._uuids = {}
		this._tags = {}
		this._counters = {}
		this._observers = {}
		this._filesystem = {}
		this._promises = []

		// load a hints file if nothing supplied
		if(!message) {
			this._load("/.lifecards.js")
		} else {
			// resolve any supplied messages
			this.resolve(message)
		}
	}

	///
	/// Resolve db request
	///
	/// Create events look like this:
	///
	///		{
	///				command:"create",
	///				data: { uuid:"/myuuid", color:"blue" },
	///		}
	///
	/// Queries look something like this right now - subject to change later? todo:
	///
	///		{
	///				command:"query",
	///				data: {
	///					uuid:"/something",
	///					color:"blue",
	///				},
	///				offset:0,
	///				limit: 999,
	///				observer: function callback
	///				handle: "uniqueid",
	///		}
	///
	///	Queries results go to the callback handler forever unless stopped.
	///	If no handle is provided the query runs only once.
	///
	/// Stop a query from updating you forever this way:
	///
	///		{
	///				command:"stop",
	///				handle:"uniqueid"
	///		}
	///
	/// Some queries prompt the database to scan the filesystem for hints and guidance.
	///
	/// The system will try guess if you don't pass a command.
	///

	resolve(message = null) {

		// allow arrays
		if(Array.isArray(message)) {
			for(let m of message) {
				this.resolve(m)
			}
			return
		}

		// sanity check
		if (!message || typeof message !== 'object') {
			console.warn("DB: poorly formed message = ", message)
			return
		}

		// support guessing for now
		if(!message.command) {
			if(message.query) {
				//console.warn("DB: guessed your message was a query")
				//console.warn(message)
				this._query(message)
			} else {
				//console.warn("DB: guessed your message was a write operation")
				//console.warn(message)
				this._write(message)
			}
			return
		}

		// resolve command
		switch(message.command) {
			case "create":
			case "write":
				this._write(message.data)
				break
			case "query":
				this._query(message.data)
				break
			default:
				throw "db: unknown command"
		}
	}


	///
	/// write
	///
	/// conceptually i want a write operation to first write to a local cache
	/// so callers should be able to call it synchronously and depend on it
	///
	/// todo but note that write operations could wait for promises also to be nice but the would have to be async
	///

	_write(blob) {
		if(!Array.isArray(blob)) blob = [blob]
		for(let item of blob) {
			this._write_one(item)
		}
	}

	_write_one(blob) {

		// sanity checks
		if(!this._fixup_uuid(blob)) {
			throw "DB: bad node"
			return
		}

		console.log("db::write writing " + blob.uuid)

		//
		// look and see if is this a new object or a change to an existing object?
		//

		let prev = this._uuids[blob.uuid]

		//
		// store new object?
		//
		if(!prev) {
			this._data.push(blob)
		}

		//
		// revise existing object?
		// todo - later maybe have a way to expressly express intent
		// todo - later have a way to delete props
		//

		else if(prev) {
			console.warn("DB: warning appending to uuid = " + blob.uuid)
			Object.assign(blob,prev)
		}

		//
		// index by uuid
		//
		// todo - later add other useful or observed indexes possibly dynamically
		// todo - later track queries forever and broadcast changes to each
		//

		this._uuids[blob.uuid] = blob

		//
		// index tags also
		// rewrite blob tags to be an array
		//

		if(blob.tags) {
			let tokens = blob.tags = Array.isArray(blob.tags) ? blob.tags : blob.tags.split(",")
			for(let token of tokens) {
				let tagsof = this._tags[token]
				if(!tagsof) {
					tagsof = this._tags[tokens] = []
				}
				tagsof.push(blob)
			}
		}

		/*

		//
		// resolve immediate insitu children
		//
		// this feature is turned off for now - can revisit later
		// the schema i've devised to help people express their files does use an idea of children
		// but i think for now that the database itself doesn't need to offer that level of convenience
		// i think it's better if we force users to declare each object as a separate db entry with a named path
		// this is a bit more work, but the objects being stored are moderately larger conceptually
		// and i don't know that there's a real win from being able to say { uuid:"/thing", children:[{id:"/otherthing"}]}
		//

		if(blob.children) {
 			if(Array.isArray(blob.children)) {
	 			for(let child of blob.children) {
					child.parent = blob.uuid
					console.log(child)
					this._write(child)
				}
			} else {
				console.error("DB: invalid children type for = " + blob.uuid)
			}
			delete blob.children
		}

		*/

	}

	_fixup_uuid(blob) {

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

		// todo - could actually create uuids for even root nodes using the file path...

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
	/// this database is populated by hints that are scattered around the file system
	/// there is a philosophy of scanning areas once (or periodically i suppose)
	/// areas are "discovered" by watching the stream of queries that fly past
	/// the goal is to pre-populate the database with file system data prior to query resolution
	///
	/// various formats may be supported at some point:
	///
	///		.js -> currently this is the implict format for folder associated metadata
	///		.lifecards -> there is some argument for a custom format [not implemented]
	///		.json -> this is just too weak as a grammar [not supported yet]
	///		.csv -> i guess arguably other schemes could be supported [not supported yet]
	///
	///
	/// this routine adds a promise to _promises if it is doing work
	///

	_load(url) {

		console.log("db: considering a request to load something at = " + url)

		//
		// todo evaluate
		//
		//if(this._uuids[url]) {
		//	console.log("db: ignoring duplicate request to load uuid = " + url)
		//	return
		//}

		//
		// for now only scan a given file once later may do so on a timer based rotation
		//

		let scanned = this._filesystem[url]
		if(scanned) {
			console.log("db: ignoring duplicate request to load path = " + url)
			return
		}
		this._filesystem[url] = Date.now()

		//
		// fetch file
		// for now only support import
		//

		let parts = url.split("/")
		let leaf = parts[parts.length-1]
		let path
		if(leaf.includes(".")) {
			// dunno what to do so just accept as is
			path = url
			console.log("db: loading raw url = " + path)
		} else {
			// for folders look for a specific hint file
			path = `${url}/.${leaf}.lifecards.js`
			console.log("db: loading implicit hints from = " + path)
		}

		// not supported - load json and parse
		// const response = await fetch(path)
		// const json = await response.json()

		//
		// import real ".js" javascript files
		// disallow crashes
		// build a promise to attempt to fetch item
		// returns prior to completing promise
		//

		let promise_finalize = (module) => {
			for(let child of module.default) {
				console.log("db: loaded item " + child.uuid)
				this._write(child)
			}				
		}

		try {
			let promise = import(path).then(promise_finalize)
			this._promises.push(promise)
		} catch(e) {
			console.warn("DB: promise failure (probably not critical) - did not find metadata for requested path " + url)
			console.warn(e)
		}

	}

	async _finalize_promises() {
		while(this._promises.length) {
			try {
				let promise = this._promises.shift()
				await(promise)
			} catch(err) {
				console.warn("DB: promise failure (probably not critical)")
				console.warn(err)
			}
		}
	}

	//
	// query always returns a copy of an item
	//

	async _query(args=0) {

		// sanity check - current policy is to disallow arrays of queries as well
		if (!args || typeof args !== 'object' || Array.isArray(args)) {
			console.warn("DB: poorly formed query = " + args)
			return
		}

		// the database may look for or even update hints from filesystem
		if(args.uuid) {
			this._load(args.uuid)
		}

		// make sure any existing work is complete (especially filesystem loads)
		await this._finalize_promises()

		// must have observer to return results
		if(!args.observer) {
			console.error("DB: no observer callback handler")
			return
		}

		//
		// query by uuid?
		// skip any other search qualities for now
		// ignores offset and limit
		// returns one [item] as an array with one item in it
		//

		let results = []

		if(args.uuid) {
			let blob = this._uuids[args.uuid]
			if(blob) {
				results.push({...blob})
			}
		}

		//
		// query by other things?
		// brute force search for now
		// will always try to pass collections to the observer rather than one at a time
		// [later] can keep returning results forever
		// [later] [todo] improve by indexing common searches
		//

		else {
			let offset = args.offset || 0
			let limit = args.limit || 999

			let matches = (blob) => {

				// reject candidate if parent is a criteria and fails to match
				if(args.parent && blob.parent != args.parent ) {
					return false
				}

				// reject candidate if includes is a criteria and fails to match
				if(args.includes && (!blob.parent || !blob.parent.includes(args.includes))) {
					return false
				}

				// reject candidate if if tags are a criteria and fails to match
				if(args.tags) {
					if(!blob.tags) return false
					for(let tag of args.tags) {
						let success = false
						for(let tag2 of blob.tags) {
							if(tag2 == tag) { success=true; break }
						}
						if(!success) return false
					}
				}

				// todo match against other arbitrary criteria 

				// successfully matched all criteria
				return true
			}

			for(let blob of this._data) {

				// test matching criteria
				if(!matches(blob)) continue

				// ignore candidates prior to offset
				if(offset > 0) { offset--; continue }

				// ignore candidates after offset
				if(limit <= 0) break
				limit--;

				// add the successful candidate
				results.push({...blob})
			}

		}

		//
		// return current round of results
		// [later] keep returning changes to the query result candidates over time
		//
		// todo note that at the moment it returns empty sets also... do we want to do that?
		//

		args.observer(results)
	}
}


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

