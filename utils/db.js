
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
///	See _load() for more comments
///

export default class DatabaseFS { // extends AbstractDatabase

	constructor() {
		this._data = []
		this._uuids = {}
		this._tags = {}
		this._counters = {}
		this._observers = {}
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

		//console.log("db::write writing " + blob.uuid)

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
		//
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

		// sanity check - if a uuid is present it must be legal - our scheme currently imposes some limits
		if(blob.uuid && blob.uuid != "/" && (blob.uuid.endsWith("/") || !blob.uuid.startsWith("/"))) {
			console.error("DB: corrupt - uuid must start with slash and must not end with slash")
			console.error(blob)
			return null
		}

		// sanity check - if a parent is present it must be legal - our scheme currently imposes some limits
		if(blob.parent && blob.parent != "/" && (blob.parent.endsWith("/") || !blob.parent.startsWith("/"))) {
			console.error("DB: corrupt - parent must start with slash and must not end with slash")
			console.error(blob)
			return null
		}

		// sanity check - if an id is present it must be legal - our scheme imposes some limits
		if(blob.id && blob.id.includes("/")) {
			console.error("DB: corrupt - id may not have slash")
			console.error(blob)
			return null
		}

		// a warning
		if(blob.uuid && blob.id) {
			console.warn("DB: your id will be blown away by uuid = " + blob.uuid)
		}

		// a blob MUST have a uuid OR a parent
		// todo - later this could be softened since loaded files have a path hint
		//			  if this was eased then it would make it much easier for users to move files around
		if(!blob.uuid && !blob.parent) {
			console.error("DB: corrupt - no uuid or parent - bad node?")
			console.error(blob)
			return null
		}

		// if there is an uuid recover parent and then always override local id
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

		// otherwise if there is a local id then regenerate UUID from parent + id
		else if(blob.id) {
			blob.uuid = build_path(blob.parent,blob.id)				
		}

		// else MUST invent uuid from parent
		else if(!blob.id && blob.parent) {
			let count = this._counters[blob.parent] = (this._counters[blob.parent] || 0 ) + 1
			blob.uuid = build_path(blob.parent,blob.id)
			blob.id = `n${count}`
		} else {
			console.error("DB: this shouldn't be reachable")
			return null
		}

		return blob
	}

	///
	/// database filesystem mapping principles:
	///
	///		- the high concept is that database maps to the filesystem
	///		- uuids are supposed to be file system like
	///		- i do at some point want to support fully qualified urls but for now i'm keeping things simple
	///
	///		- as a whole this is test code or a rough cut of a database service
	///		- in this test example i load resources just in time as paths are presented here
	///		- in a more final product the database would have all the state ahead of time
	///		- and a scanner or more sophisticated inhalation process would be used ahead of time
	///
	///		- in this rough cut a few strategies are used to resolve requests
	///		- those paths actually do map to real file systems visible to the server in this version
	///		- each path can have a hints json file which is in foldername/.foldername.lifecards.js
	///
	///		- for a given path such as /a/b/c/d i scan every intermediate path
	///		- i only scan a path once
	///		- a loaded asset can seal off further scanning with the flag 'loaded:true'
	///
	///		- there are limits to this current approach - and i may have to switch to load everything ahead
	///		- part of the reason for the current approach is i want to be able to have unpublished folders
	///
	/// todo later support https:// urls
	///
	///

	async _load(path) {

		console.log("db: considering a request to load something at = " + path)

		// sanity checks
		if(!path || path[0] != '/') {
			console.error("db::load path corrupt must start with slash - path = " +path)
			return
		}

		// for now dots are not allowed
		if(path.includes(".")) {
			console.error("db::load dots are not allowed in path = " + path)
			return
		}

		//
		// make a helper that will load things for us later
		//
		let helper = async (base,leaf) => {

			let path = `${base}${leaf.length?"/.":""}${leaf}.lifecards.js`
			console.log(path)

			try {

				// the hints file will have this name
				let module = await import(path)

				let data = module.default

				// anything?
				if(!data) {
					console.error("db: no data in file " + path)
					return
				}

				// array or single item?
				if(!Array.isArray(data)) {
					if(typeof data === 'object') {
						data = [data]
					} else {
						console.error("db: unknown data in file " + path)
						return
					}
				}

				// visit items
				for(let blob of data) {

					// mark as having been loaded at least once
					blob.loaded = Date.now()

					// if the blob specifies to load some markdown - fetch it now
					try {
						if(blob.load) {
							console.log("db: loading raw file " + blob.uuid+"/"+blob.load)
							let response = await fetch(blob.uuid+"/"+blob.load)
							let text = await response.text()
							blob.markdown = text
						}
					} catch(err) {
						console.warn("db: inner load on item failed")
					}

					//console.log("db: loaded item = " + blob.uuid + " " + path)
					this._write(blob)
				}
			} catch(err) {
				console.warn("DB: promise failure (probably not critical) - did not find metadata for requested uuid = " + base + " " + leaf)
				console.warn(err)
			}
		}

		//
		// fetch root separately from the rest simply because file system notation is idiosyncratic
		//
		if(!this._uuids["/"]) {
			await helper("/","")
			let root = this._uuids["/"]
			if(!root) {
				// todo is this really needed? i don't think so
				console.error("DB: for now the file /.lifecards.js should have a root note")
				this._uuids["/"] = {uuid:"/",loaded:Date.now()}
			}
		}

		//
		// break path into fragments and pass to above helper - skipping the root
		//
		let parts = path.split("/").slice(1)
		let uuid = ""

		// walk down the tree to the current target
		for(let part of parts) {

			// skip empty parts...
			if(!part.length) {
				continue;
			}

			// focus on this node
			uuid = uuid + "/" + part

			// don't busy reload
			let node = this._uuids[uuid]
			if(node && node.loaded) {
				console.log("db: ignoring duplicate request to load uuid = " + uuid)
				continue
			}

			// load if needed
			await helper(uuid,part)

			// for now mark failures - i need to do this to avoid returning them in results lists
			node = this._uuids[uuid]
			if(!node) {
					this._uuids[uuid] = {uuid,loaded:"incomplete"}
			}

		}
	}

	//
	// query always returns a copy of an item
	//

	async _query(args=0) {

		// must have observer to return results
		if(!args.observer) {
			console.error("DB: no observer callback handler")
			return
		}

		// sanity check - current policy is to disallow arrays of queries as well
		if (!args || typeof args !== 'object' || Array.isArray(args)) {
			console.warn("DB: poorly formed query = " + args)
			return
		}

		// the database may look for or even update hints from filesystem
		if(args.uuid) {
			try {
				await this._load(args.uuid)
			} catch (err) {
				// hmm, should have been caught before here...
				console.error(err)
			}
		}

		//
		// query by uuid?
		// skip any other search qualities for now
		// ignores offset and limit
		// returns one [item] as an array with one item in it
		// todo the way of avoiding incomplete nodes is kind of hacky
		//

		let results = []

		if(args.uuid) {
			let blob = this._uuids[args.uuid]
			if(blob && blob.loaded != "incomplete") {
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

				// ignore bad loads
				if(blob.loaded == "incomplete") continue

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

