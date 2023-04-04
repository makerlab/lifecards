#!/usr/local/bin/node



const path = require('path')
const fs = require('fs')
const { execSync } = require('child_process');

////////////////////////////////////////////////////////////////////////////////////////////

function fs_stats(path) {
	return new Promise((good,bad) => {
		fs.stat(path,(err,stats) => {
			if(err) bad(err)
			else good(stats)
		})
	})
}

function fs_readdir(path) {
	return new Promise((good,bad) => {
		fs.readdir(path,(err,files) => {
			if(err) bad(err)
			else good(files)
		})
	})
}

function pathJoin(...parts){
	var separator = '/';
	var replace   = new RegExp(separator+'{1,}', 'g');
	return ["/",...parts].join(separator).replace(replace, separator)
}

function pathSplit(path) {
	let fragments = path && path.length ? path.match(/[^\/]+/g) : []
	return fragments ? fragments : []
}

////////////////////////////////////////////////////////////////////////////////////////////

class Scanner {

	constructor() {
		this.nodes = {}
		this["/"] = {kind:"group:root"} // just a hint
	}

	async pathScan(path=".") {
		let stats = await fs_stats(path)

		// split path into fragments
		let parts = path.split("/")
		let leaf = parts[parts.length-1]

		// totally ignore files that have a . prefix except for the root itself
		if(leaf.startsWith(".") && leaf.length > 1) {
			return
		}

		// strip stuff since files off disk may have a current folder path prefix
		if(leaf.startsWith(".")) leaf = leaf.substr(1)
		if(path.startsWith(".")) path = path.substr(1)

		let node = {
			leaf:leaf,
			path:path,
		}

		if(stats.isFile()) {
			node.kind = "file"
			this.nodeMime(node)
			return this.nodeMerge(node)
		}
		else if(stats.isDirectory()) {
			node.kind = "group:folder"

			if(node.leaf.length<1) {
				console.log("Hack to fix up root folder - should occur once only")
				node.leaf = node.path = "/"
			}

			let files = await fs_readdir("."+path)
			for(let i = 0; i < files.length ; i++) {
				let leaf = files[i]
				if(leaf.startsWith(".") && leaf.length>1) continue 
				await this.pathScan("."+path+"/"+leaf)
			}

			node = this.nodeMerge(node)

			return node
		}
	}

	nodeMerge(node) {

		if(!this.nodes[node.path]) this.nodes[node.path]={}

		// Is Folder?
		// Just specially look for a .lifecards file - don't recurse yet
		//

		if(node.kind != "file") {
			if(fs.existsSync("." + node.path + "/.lifecards", 'utf8')) {
				let file = fs.readFileSync("." + node.path + "/.lifecards", 'utf8')
				try {
					let node2 = JSON.parse( file )
					node2.leaf = node.leaf
					node2.path = node.path
					if(!node2.kind) node2.kind = node.kind
					node = node2
				} catch(e) {
					console.error("bad file " + node.path + "./lifecards")
					console.error(e)
				}
			}
		}

		// Is File?
		// Specially deal with filename.lifecards hint
		//

		else if(node.path.endsWith(".lifecards")) {
			if(fs.existsSync("." + node.path, 'utf8')) {
				let file = fs.readFileSync("." + node.path, 'utf8')
				try {
					let node2 = JSON.parse( file )
					node2.leaf = node.leaf.slice(0,-10)
					node2.path = node.path.slice(0,-10)
					if(!node2.kind) node2.kind = node.kind
					node = node2
				} catch(e) {
					console.error("bad file " + node.path + "./lifecards")
					console.error(e)
				}
			}			
		}

		// merge into previous if any - TODO may want to verify that this is the right order

		let previous = this.nodes[node.path]
		if(previous) {
			node = {...previous, ...node}
		}

		this.nodes[node.path] = node

		// groups is a concept to allow a parent node to cite other nodes as children or to have virtual children
		// it could be used to produce a view that does not show default children, or these can be added to that pool

		if(node.groups) {
			this.nodeGroups(node)
		}

		// fix tags

		if(node.tags) {
			let produced = {}
			let tags = Array.isArray(node.tags) ? node.tags : node.tags.split(",")
			for(let i = 0; i < tags.length; i++) {
				let tag = tags[i].toLowerCase().trim()
				if(tag.length<1) return
				produced[tag]=1
			}
			node.tags = Object.keys(produced)
		} else {
			node.tags = []
		}

		// always date nodes
		node.created_at = node.updated_at = Math.floor(new Date().getTime())

		// a node may be an image - actually make thumbnails if so and associate
		if(node.path && this.nodeThumbnails(node.path) ) {
			let terms = node.path.split("/")
			terms.pop()
			node.art = terms.join("/") + "/.thumbs/small_" + encodeURIComponent(node.leaf).replace(/\(/g, "%28").replace(/\)/g, "%29")
			// https://stackoverflow.com/questions/75980/when-are-you-supposed-to-use-escape-instead-of-encodeuri-encodeuricomponent/3608791#3608791
			//art = encodeURI(art).replace(/\(/g, "%28").replace(/\)/g, "%29")
		}

		// mark as text
		if(node.path.endsWith(".txt")) {
			node.kind = "text"
		}

		// art: if art is specified use it - the scanner looks for a suitable file first
		if(node.art && !node.art.startsWith("/")) {
			node.art = node.path + "/" + node.art
		}

		// art: a node may have a best thumbnail nearby on disk if no art already - look for it
		if(!node.art) {
			try {
				let find = node.path + "/."+node.leaf+".jpg"
				if(fs.existsSync("." + find, 'utf8')) {
					node.art = find
					//node.art = "."+node.leaf+".jpg"
				}
			} catch(e) {
			}
		}

		// art: try harder
		if(!node.art) {
			try {
				let parts = node.path.split("/").slice(0,-1).join("/")
				let find = parts + "/."+node.leaf+".jpg"
				if(fs.existsSync("." + find, 'utf8')) {
					node.art = find
					//node.art = "."+node.leaf+".jpg"
				}
			} catch(e) {
			}
		}

		// art: a node may not have an art but a child may have an art - try this
		if(!node.art) {
			let keys = Object.keys(this.nodes)
			for(let i = 0; i < keys.length; i++) {
				let key = keys[i]
				let child = this.nodes[key]
				if(child.path && child.path.startsWith(node.path)) {
					if(child.kind == "image" && node.path.split("/").length == child.path.split("/").length - 1) {
						node.art = child.art
						break
					}
				}
			}
		}

		// art: a node may have a best thumbnail nearby on disk if no art already - look for it harder
		if(!node.art) {
			try {
				let find = node.path + "/.thumb.jpg"
				if(fs.existsSync("." + find, 'utf8')) {
					node.art = find
					//node.art = "."+node.leaf+".jpg"
				}
			} catch(e) {
			}
		}

		// performed earlier
		// merge into previous if any - TODO may want to verify that this is the right order
		//let previous = this.nodes[node.path]
		//if(previous) {
		//	node = {...previous, ...node}
		//}
		//this.nodes[node.path] = node

		return node
	}

	nodeMime(node) {
		let kind = node.kind
		let low = node.leaf.toLowerCase()
		if(low.endsWith(".jpg")) kind = "image"
		if(low.endsWith(".png")) kind = "image"
		if(low.endsWith(".gif")) kind = "image"
		if(low.endsWith(".png")) kind = "image"
		if(low.endsWith(".jpeg")) kind = "image"
		node.kind = kind
	}

	nodeGroups(node) {
		if(!node.groups || !node.groups.length) return
		let names = []
		// it is legal to have a string as a child; simply correct this to be an array of that child
		if ((typeof node.groups === 'string' || node.groups instanceof String) && node.groups.length>0) {
			let merged = this.nodeMerge(this.infer({path:node.groups},node,0))
			names.push(merged.path)
		}
		// it is legal to have a single object as a child; correct this to be a named reference
		else if(node.groups.constructor == Object) {
			let merged = this.nodeMerge(this.infer(child,node,0))
			names.push(merged.path)
		}
		// it is legal to have an an array of strings or objects as a child
		else if( Array.isArray(node.groups) ) {
			for(let i = 0; i < node.groups.length; i++) {
				let child = node.groups[i]
				if ((typeof child === 'string' || child instanceof String) && child.length>0) {
					let merged = this.nodeMerge(this.infer({leaf:child},node,i))
					names.push(merged.path)
				}
				else if(child.constructor == Object) {
					let merged = this.nodeMerge(this.infer(child,node,i))
					names.push(merged.path)
				} else {
					console.error("Illegal child at " + path)
				}
			}
		}
		node.groups = names
	}

	// a helper to infer and refine the human intent in defining named references
	infer(item,parent,counter) {
		if(!item.leaf || !item.leaf.length) {
			if(!item.path || !item.path.length) {
				// if a item has no leaf OR path then grant it a sequential id
				item.leaf = `id${counter}`
				item.path = pathJoin(parent.path,item.leaf)
			}
			else {
				if(!item.path.includes("/")) {
					// correct illegally expressed path
					item.leaf = item.path
					item.path = pathJoin(parent.path,item.leaf)
				} else {
					// fix up the leaf
					item.leaf = item.path.split("/").pop()
				}
			}
		} else {
			if(!item.path || !item.path.length) {
				if(item.leaf.includes("/")) {
					// correct illegally expressed leaf
					item.path = item.leaf
					item.leaf = item.leaf.split("/").pop()
				} else {
					// fix up the path
					item.path = pathJoin(parent.path,item.leaf)
				}
			} else {
				if(item.leaf.includes("/") || !item.path.includes("/")) {
					// It is possible that a user supplied both... I'm somewhat wary of this
					console.error("Illegal item defines both and not correct : " + item.path)
				} else if(item.path.split("/").pop() != item.leaf) {
					console.error("Illegal item defines both and do not match : " + item.path)							
				}
			}
		}
		return item
	}

	nodeThumbnails(path) {

		let low = path.toLowerCase()
		let kind = "unknown"
		if(low.endsWith(".jpg")) kind = "image"
		if(low.endsWith(".png")) kind = "image"
		if(low.endsWith(".gif")) kind = "image"
		if(low.endsWith(".png")) kind = "image"
		if(low.endsWith(".jpeg")) kind = "image"
		if(kind != "image") return false

		path = "." + path

		let terms = path.split("/")
		let name = terms.pop()
		let parent = terms.join("/")
		if(name.startsWith(".small_")) return true
		let output = parent + "/.thumbs/small_" + name
		//let command = `convert "${path}" -trim -resize 128x64 "${output}"`

		if (fs.existsSync(output)) {
			//console.log("thumb exists : " + output )
			return true
		}

		// for now i think it is best to make a sub folder for all images
		if(!fs.existsSync(parent+"/.thumbs")) {
			fs.mkdirSync(parent+"/.thumbs")
			//	console.log("made " + parent)
		}

		// make nice thumb
		let command = `convert "${path}" -thumbnail 200x100^ -gravity center -extent 200x100 "${output}"`
		execSync(command, (err, stdout, stderr) => {
			if (err) {
				console.error(err)
			}
		})
	}
}

async function bootstrap() {

	// move to the folder in question
	process.chdir(process.argv.length > 2 ? process.argv[2] : "public")

	// perform scan
	let scanner = new Scanner()
	await scanner.pathScan()

	// save summary into same place but in a way that it is not itself scanned subsequently
	fs.writeFile("./.database.js",JSON.stringify(scanner.nodes,null,2),(err) => {
		if(err) console.error(err)
	})
}

bootstrap()


