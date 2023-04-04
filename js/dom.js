
import factory from './_factory.js'

///
/// A public interface to help bootstrap the custom dom system
///

export default class DOM { // todo could just extend base or even just be base
	constructor(blob) {
		factory(blob).then(elem=>{ if(elem)document.body.appendChild(elem) })
	}
}
