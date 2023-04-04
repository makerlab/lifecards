export default class Link extends HTMLElement {
	resolve(blob) {
		if(blob.content) {
			this.innerHTML = `<a href="${blob.link}">${blob.content}</a>`
		} else
		if(blob.text) {
			this.innerHTML = `<a href="${blob.link}">${blob.text}</a>`
		} else {
			let label = `${blob.link.split("/").slice(-1)}`
			label = label.slice(0,1).toUpperCase() + label.slice(1)
			this.innerHTML = `<a href="${blob.link}">${label}</a>`
		}
	}
}

customElements.define('lifecards-link', Link )
