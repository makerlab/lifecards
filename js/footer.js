
export default class Footer extends HTMLElement {
}

customElements.define('lifecards-footer', Footer )

var s = document.createElement('style');
s.innerHTML =
`
:root {
	--lifecards-day-faded: rgb(210,210,210);
	--lifecards-night-faded: rgb(60,70,80);	
}

lifecards-footer {
	display: block;
	padding-top: 10px;
	width: 100%;
	text-align: center;
}

lifecards-footer, lifecards-footer a, lifecards-footer lifecards-link {
	color: var(--lifecards-day-faded);
}

@media (prefers-color-scheme: dark) {
	lifecards-footer, lifecards-footer a, lifecards-footer lifecards-link {
		color: var(--lifecards-night-faded);
	}
}
`
document.head.appendChild(s);
