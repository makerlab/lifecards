
///
/// A router that intercepts low level browser navigation events
/// Caller should provide handlers to handle events
///

export default class Router {

	constructor(handlers=[]) {

		//  can supply event handlers
		this.handlers = handlers

		// 1. human user clicks on any url trigger this callback
		document.addEventListener('click', this.click.bind(this))

		// 2. browser level state change requests trigger a routing event
		var previousPushState = history.pushState.bind(history)
		history.pushState = (state,path,origin) => {
			previousPushState(state,path,origin)
			this.route()
		}

		// 3. separately browser navigation buttons can trigger a routing event also
		window.addEventListener("popstate",this.route.bind(this))

		// non spa approach - not supported
		//let query = new URLSearchParams(window.location.search).get("q") || ""
	}

	observe(handler) {
		this.handlers.push(handler)
		this.route()
	}

	click(event) {

		// ignore any user clicks on file type hrefs
		if(event.target.type == "file") return true

		// may have to dig around for the href a bit
		var target = event.target || event.srcElement;
		while (target) {
			if (target instanceof HTMLAnchorElement) break
			target = target.parentNode
		}

		// do not intercept hrefs that are to external websites
		let raw = target ? target.getAttribute("href") : 0
		if(!raw || !raw.length || raw.startsWith("http") || raw.startsWith("mail") || raw.includes(":")) {
			return true
		}

		// force a local page transition event rather than allowing new document
		let path = (new URL(target.href)).pathname
		history.pushState({},path,path)

		// stop normal browser behavior (which would be to flush the document)
		event.preventDefault()
		return false
	}

	route() {
		let uuid = decodeURI((new URL(window.location.href)).pathname)
		for(let handle of this.handlers) {
			if(handle({kind:"route",uuid})==false) break
		}
	}
}
