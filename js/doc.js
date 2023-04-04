///
/// gitbook style doc layout widget
/// https://every-layout.dev/layouts/sidebar/
/// 
///

import Card from './card.js'

//import {micromark} from '../utils/micromark.js' //https://esm.sh/micromark@3?bundle'

export default class Docs extends HTMLElement {

	constructor() {
		super()
		this.query = {uuid:0,offset:0,limit:10,handle:0,observer:0}
	}

	update(blob) {

		this.db = blob.db
		this.dom = {}

		this.innerHTML=`
			<style>
			.lifecards-docs {
				border:3px solid red;
				display: flex;
				flex-wrap: wrap;
				gap: var(--s1);
			}
			.lifecards-docs > :first-child {
				border:3px solid green;
				flex-basis: 30%; 
				flex-grow: 1;
			}
			.lifecards-docs > :last-child {
				border:3px solid blue;
				flex-basis: 0;
				flex-grow: 999;
				min-inline-size: 50%;
			}
			</style>
			<div class="dark lifecards-docs">
			<div class="lifecards-docs-sidebar"></div>
			<div class="lifecards-docs-body"></div>
			</div>
			`
		this.sidebar = this.querySelector(".lifecards-docs-sidebar")
		this.body = this.querySelector(".lifecards-docs-body")

		// observe state changes from the root (uuid) and all children as a single graph query
		this.query.includes = this.query.handle = blob.uuid
		this.query.observer = this.observer.bind(this)
		this.db.observe(this.query)
	}

	observer(blob) {

		blob.label = blob.uuid.split("/").slice(-1)

		// update sidebar - the url will not include the root (in uuid) since that is ugly
		{
			let elem = this.dom["sidebar"+blob.uuid]
			if(!elem) {
				elem = document.createElement("div")
				elem.blob = blob
				elem.href = blob.uuid //.substring(this.uuid.length)
				elem.style.display = "block"
				elem.onclick = (e) => {
					console.log(e)
					e.preventDefault()
					this.observer(blob)
					return false
				}
				this.dom["sidebar"+blob.uuid]=elem
				this.sidebar.appendChild(elem)
			} else {
				// may move
			}
			elem.innerHTML = blob.label
		}

		// update body area
		if(blob.text) {
			console.log("got " + blob.uuid)
			let elem = this.dom["body"+blob.uuid]
			if(!elem) {
				elem = document.createElement("div")
				elem.path = blob.uuid.substring(this.uuid.length)
				this.dom["body"+blob.uuid]=elem
				this.body.appendChild(elem)			
			} else {
				// may move
			}
//			elem.innerHTML = micromark(blob.text)
			elem.style.display = this.path == elem.path ? "block" : "none"
		}
	}

	route(path) {
		this.path = path
		this.body.childNodes.forEach(elem=>{
			elem.style.display = this.path == elem.path ? "block" : "none"
		})
	}

}

customElements.define('lifecards-docs', Docs )

