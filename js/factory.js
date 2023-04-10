
import area from "./area.js"
import base from "./base.js"
import card from "./card.js"
import link from "./link.js"
import nav from "./nav.js"
import logo from "./logo.js"
import footer from "./footer.js"
import routable from "./routable.js"

let classes = {
	area,
	base,
	area,
	card,
	link,
	nav,
	logo,
	footer,
	routable
}

///
/// A factory to produce HTMLElements
///		- the intent was to use dynamic discovery but for now classes must be declared above
///

async function factory(blob) {

	let elem = 0
	let kind = blob.kind

	// attempt to build custom type
	if(kind) {
		let constr = classes[kind]
		/*
		// disabled dynamic discovery because the promise is somehow escaping our control and messing with sort order of results
		// another way to do this would be createElement('lifecards-'+kind)
		if(!constr) {
			try {
				let module = await import(`./js/${kind}.js`)
				constr = module.default
				this.classes[kind] = constr
			} catch(err) {
				console.error(err)
				console.error(blob)
			}
		}
		*/
		if(constr) {
			elem = new constr(blob)
		}
	}

	// default vanilla type is a div
	else {
		kind = "div"
	}

	// build vanilla type
	if(!elem) {
		elem = document.createElement(kind)
	}

	// update element from database representation; tack on a resolve capability
	if(elem) {
		if(!elem.resolve) {
			elem.resolve = base.prototype.resolve.bind(elem)
		} else {
			elem.base_resolve = base.prototype.resolve.bind(elem)
			await elem.base_resolve(blob)
		}
		await elem.resolve(blob)
	}

	return elem
}

export default factory;
