
export default class centered extends HTMLElement {
	resolve() {
		this.style.cssText=`
			display: flex;
			flex-wrap: wrap;
			justify-content: center;
			align-items: center;`
	}
}

customElements.define('lifecards-centered', centered )
