
export default class Site extends HTMLElement {
	resolve() {
		this.style.cssText=`
			display: flex;
			flex-wrap: wrap;
			justify-content: center;
			align-items: center;`
	}
}

customElements.define('lifecards-site', Site )


var s = document.createElement('style');
s.innerHTML =
`
:root {
	--lifecards-day-back: rgb(248,250,252);
	--lifecards-day-brand: rgb(15,23,42);
	--lifecards-day-h: rgb(25,23,92);
	--lifecards-day-text: rgb(10,20,30);

	--lifecards-night-back: rgb(15,23,72);
	--lifecards-night-brand: rgb(248,250,252);
	--lifecards-night-h: rgb(208,220,252);
	--lifecards-night-text: rgb(248,250,252);
}

body {
	background-color: var(--lifecards-day-back);
	color: var(--lifecards-day-text);
	font-family: Arial, Helvetica, sans-serif;
}

h1,h2,h3 {
	color: var(--lifecards-day-h);
	font-family: Helvetica, sans-serif;
}

a {
	color: var(--lifecards-day-text);
	text-decoration: none;
}

@media (prefers-color-scheme: dark) {
	body {
		background-color: var(--lifecards-night-back);
		color: var(--lifecards-night-text);
	}
	h1,h2,h3 {
		color: var(--lifecards-night-h);
	}
	a {
		color: var(--lifecards-night-text);
	}
}
`
document.head.appendChild(s);


/*

tailwind styles

button, .button {
	@apply bg-blue-500 hover:bg-blue-700 font-bold py-2 px-4 rounded m-1;
}

h1 {
	@apply font-medium text-6xl leading-5 py-2;
}

h2 {
	@apply font-medium text-4xl leading-7 py-2;
}

h3 {
	@apply font-medium text-3xl leading-7 py-2;
}

p {
	@apply leading-6 py-2;
}
*/

/*

notes: day night schemes - this is an unused approach using js

https://web.dev/prefers-color-scheme/

function setDayNight() {
	let dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
	if(dark) {
		// this is an idea to manually set the current main color mode on the fly; it arguably could help decouple components
		//document.body.style.setProperty("--bg-color", "purple")
		// this is a fairly routine way to do a darkmode
		// document.body.classList.add("dark-mode")
	}
}
setDayNight()
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", setDayNight )
*/







