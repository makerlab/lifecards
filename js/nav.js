

///
/// Navigation widget showing current focus based on url...
///
/// - todo show current focus
/// - todo later perhaps support vertical and other styles
/// - todo later perhaps use shadow dom for style or just stuff it into the main css file?
///

export default class Nav extends HTMLElement {
}

customElements.define('lifecards-navigation', Nav )

var s = document.createElement('style');
s.innerHTML =
`
lifecards-navigation {
	display:flex;
	overflow: hidden;
	width: 100%;
	overflow: none;
	padding-bottom: 5%;
	justify-content: center;
	gap: 10%;
}

lifecards-navigation a, lifecards-navigation link {
	letter-spacing: 0.1rem;	
}
`
document.head.appendChild(s);


/*
// unused

class Nav {
	menuinit() {
		this.items = { popular:{active:false}, newest:{active:false}, examples:{active:false}, subscribed:{active:false} }
	}
	menu(item) {
		let menu = this.querySelector("#menu")
		for (const [name,props] of Object.entries(this.items)) {
			let node = document.createElement("h3")
			node.id=name
			node.className = "btn btn-light menuitem"
			node.innerHTML=name.charAt(0).toUpperCase()+name.slice(1)
			node.onclick = this[name].bind(this)
			props.node = node
			menu.appendChild(node)
		}
		Object.values(this.items).forEach(item=>item.active=false)
		this.items["popular"].node.style.color="white"
		this.querySelector("#spinner").remove()
		this.querySelector("#body").appendChild(new CardSmallCollection(this.query))
 		this.appendChild(new CardSmallCollection({parent:item.uuid,offset:0,limit:800}))	
	}
	newest() {}
	examples() {}
	subscribed() {}
}
*/