
/*

// no longer used
// tailwind based approach

var s = document.createElement('style');
s.innerHTML =
`
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
`
document.head.appendChild(s);


*/

/*

//
// notes: day night schemes - this is an unused approach using js
// https://web.dev/prefers-color-scheme/
//

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

