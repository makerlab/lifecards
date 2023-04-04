export default class Logo extends HTMLElement {
	resolve(blob) {

		let style = blob.style
		let logo = blob.content
		let scrunch="10px"
		let size = "1310%"

		// big?
		if(style.includes("small")) {
			scrunch="2px"
			size = "500%"
		}

		// mulicolor?
		let multicolor = ""
		if(style.includes("multicolor")) {
			multicolor = `
						background: linear-gradient(to right, rgb(255,96,0), rgb(15,216,55), rgb(0,164,255));
						-webkit-background-clip: text;
						-webkit-text-fill-color: transparent;
						`
		}

		// enhance
		if(!style.includes("minimal"))
		{
			logo = `<div style="
						font-family: Arial;
						font-weight: bold;
						font-size: ${size};
						width: fit-content;
						boxSizing: border-box;
						letter-spacing: -${scrunch};
						padding-right: ${scrunch};
						${multicolor}
						">
						${logo}
					</div>`
		}

		// mirror
		if(style.includes("reflect")) {
			let card = "background: white; padding: 60px;"
			let mirror = "transform: scaleY(-1); -webkit-mask-image: linear-gradient(to bottom, rgb(255,255,255,0), rgb(255,255,255,0.0), rgb(255,255,255,0.05), rgb(255,255,255,0.3), rgb(255,255,255,0.5));"
			logo = `<div style="${card}">${logo}</div>
					<br/>
					<div style="${card}${mirror}">${logo}</div>`
		}

		// mailto
		if(blob.link) {
			logo = `<a href="${blob.link}">${logo}</a>`
		}

		// pivot
		if(style.includes("pivot")) {
			let pivot = "transform: perspective(2000px) rotate3d(0,0.7,-0.1,45deg);"
			logo = `<div style="${pivot}">${logo}</div>`
		}

		// center
		if(style.includes("center")) {
			this.style.cssText = "display:flex;width:100%;justify-content:center";
		}

		// apply
		this.innerHTML = logo;
	}
}
customElements.define('lifecards-logo', Logo )
