
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///
/// a card with some layout flexibility
///
/// todo
///		- the bottom row is being centered if not full; it really should always be left justified
///
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

let counter = 100

export default class Card extends HTMLElement {

	async resolve(blob) {

		let label = blob.uuid.split("/").slice(-1) + "";
		label = label.charAt(0).toUpperCase()+label.slice(1)
		let href = blob.href || blob.link || blob.uuid || "#"
		let text = blob.text || blob.content || ""

		let art = {
			image : (blob.art && blob.art.length ? blob.art : null),
			alt : "",
			descr : "",
			creator : blob.sponsor || "",
			creator_url : blob.sponsor_url || ""
		}

		if(!art.image) {
			try {
				let response = await fetch("https://api.unsplash.com/photos/random?client_id=1M43c1xXx1JR0-XN0-jL5obaQ-CwWNUB0dkHHegUQKQ")
				let json = await response.json()
				art.image = json.urls.small
				art.descr = json.description
				art.alt = json.alt_description
				art.creator = json.user.username // username, twitter_username, portfolio_url
				art.creator_url = "https://unsplash.com/@"+json.user.username // username, twitter_username, portfolio_url
			} catch(err) {
				art.image = "/assets/bird.jpg"
				console.log("using default")
			}
		}

		let tags = ""
		if(blob.tags) {
			for(let tag of blob.tags) {
				tags = tags + `<tag><a href="/tag">${tag}</a></tag>`
			}
		}

		this.innerHTML =
			`
			<lifecards-banner>
				<a href="${href}"><img src='${art.image}'></img></a>
				<tags>${tags}</tags>
			</lifecards-banner>
			<a style="text-align:right;padding-right:8px" href="${art.creator_url}">${art.creator}</a>
			<label>${label}</label>
			<phrase>${text}</phrase>
			`

		// turns out it is a paint to extend a custom element - and i don't want to do custom hyperlinks
		//this.href = blob.uuid;
		//this.addEventListener('click', function() {
	  //  location.href = blob.uuid
		//}, false);

	}
}

customElements.define('lifecards-card', Card ) //, { extends: "a" } )


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// styling - march 2023
//
// There are lots of ways to style components:
//		- could use a template
//		- could use a shadow dom to isolate local style
//		- can style each element on the fly procedurally when instanced (a bit lazy and cannot deal with pseudo selectors)
//		- can stuff a global style into the document (this potentially bleeds through but should be ok)
//
// For now this code is using a global style ...
//		+ the element can take advantage of open css styling
//		+ makes it easier to do hover and other pseudo effects
//		+ could be overloaded by custom procedural styling
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var s = document.createElement('style');
s.innerHTML =
`
/*
 * wrap the entire card in a few effects
 * do limit the max size of cards to stop bad run on labels and text
 */

lifecards-card {
	display:block;
	max-width:300px;
	margin: 0.3%;
	border-radius: 5px;
	overflow: hidden;
	transition: all .20s linear;
	box-shadow: 2px 2px 2px 1px rgba(0, 0, 0, 0.2);
	background-color: rgb(244,246,250);
	color: rgb(15,23,42)
}

lifecards-card:hover {
	transform: scale(1.05);
}

/*
 * banner area contains the link and the image
 * main chore it has is that it floats some tags; so use relative
 * could use a backdrop instead of an image arguably but the sizing of the image is useful
 *	xbackground-size: cover;
 *	xbackground-repeat: no-repeat;
 *	xbackground-position: center center;
 */

lifecards-banner {
	display: block;
	position: relative;
}

/*
 * images can be variable size; i do force a height
 * aspect-ratio can be set to force all to be the same width/height
 */

lifecards-card img {
	width:100%;
	height:200px;
	xaspect-ratio: 2/3;
	object-position: center;
	object-fit: cover;
	object-cover: cover;
	background-color: #303030;
}

lifecards-card label {
	display:block;
	max-height: 32px;
	font-size: 1.05em;
	letter-spacing: 0.1rem;
	margin: 8px 0 0 8px;
	color: rgb(23,50,70)
}

lifecards-card phrase {
	display:block;
	overflow: none;
	margin: 0 0 8px 8px;
	padding: 8px 0 8px 0;
	color: rgb(120,120,150)
}

lifecards-card a {
	display: block;
	position: relative;
}

lifecards-card tags {
	display: flex;
	flex-direction: column;
	position: absolute;
	right: 10px;
	bottom: 10px;
	z-index: 100;
}

lifecards-card tag {
	display: block;
	padding: 5px;
	margin: 5px;
	max-height: 20px;
	background-color: rgba(150,200,230,0.5);
	color: rgb(240,250,255);
	border-radius: 3px;
}

@media (prefers-color-scheme: dark) {
	lifecards-card {
		box-shadow: none;
	}
}

/* fun piano effect for now - may remove 
@media (min-width: 1200px) {
	lifecards-card {
		width: 64px;
	}
}
*/

`

document.head.appendChild(s);


/*

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// unused ideas for layout
//
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function layout_variations() {
		/* some tests - no longer used

		// a standalone style for testing only
		let width = "200px";
		let display = "inline-block"
		let num = Math.floor(Math.random()*10)
		this.style.display = "block"
		this.innerHTML =
			`<a href="${href}" class="lifecard_card" style="display: ${display}; width: ${width};">
				<div class="lifecard_image" style="background-image: url(${art});"></div>
				<div class="lifecard_text">
					<h3><b>${label}</b></h3>
				</div>
			</a>`
		return

		// a test of a simple tailwind style
		this.innerHTML =
			`<div class="max-w-sm rounded overflow-hidden shadow-lg">
			  <img class="w-full" src="${art}" alt="Sunset in the mountains">
			  <div class="px-6 py-4">
			    <div class="font-bold text-xl mb-2">The Coldest Sunset</div>
			    <p class="text-gray-700 text-base">
			      Lorem ipsum dolor sit amet, consectetur adipisicing elit. Voluptatibus quia, nulla! Maiores et perferendis eaque, exercitationem praesentium nihil.
			    </p>
			  </div>
			  <div class="px-6 pt-4 pb-2">
			    <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">#photography</span>
			    <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">#travel</span>
			    <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">#winter</span>
			  </div>
			</div>`
		return

		// masonry? there is some kind of issue going on here with masonry - some kind of subclassing defect - revisit later - todo
		// https://prototypr.io/post/masonry-layout-css-tailwind
		// this.className = "border-2 border-green-500 w-full relative mb-6"

		// test of just random images to try isolate masonry issues - still problematic
		// this.innerHTML = `<img class="w-full mb-6" src="https://source.unsplash.com/random/${num}" />`
		// return

		// test of a layout strategy - unsure why grid is needed in child - i think i will go with flex instead
		// this.innerHTML = `<img style="display:grid; grid-template-rows: 1fr auto" src="https://source.unsplash.com/random/${num}"></img>`
		// return

		// this does work as a layout technique - apparently this has to be set to a div style to make it a real thing - or display:block on htmlelement itself
		// this.className = "w-full border-2 border-red-500"
		// this.innerHTML = `<img src="https://picsum.photos/500/300?random=${num}" />`
		// return

		// some nice style ideas using tailwind
		// this.className = "w-full max-w-5xl p-5 pb-10 mx-auto mb-10 gap-5 columns-3"

		// some nice style ideas using tailwind
		//="relative mb-3 before:content-[''] before:rounded-md before:absolute before:inset-0 before:bg-black before:bg-opacity-20"
}

*/


/*

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///
/// Unused procedural approach for styling
///
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function procedural_styling() {
		//
		// manually stuff some style on each instance
		//

		let style = {
			width: '100%',
			boxSizing: 'border-box',
			overflow: 'none',
			padding: '1%',
			transition: 'all .20s linear',
			// other ways to fiddle with the flex elements
			//	flex: 1 0 21%;
			//	@apply w-1/4;
			// box-shadow: 0 4px 8px 0 #000010;
			// background-color:  #303030;
			// border: 1px solid grey;
		}

		for(let [k,v] of Object.entries(style)) {
		//	this.style[k] = v
			//this.setAttribute(k,v)
		}

		//
		// there really isn't any way to fiddle with psuedo selectors in js
		// https://css-tricks.com/web-component-pseudo-classes-and-pseudo-elements/
		// window.getComputedStyle(this,':hover').setProperty('transform','scale(1.05)')
		// this.style.setPropertyValue('transform','scale(1.05)')
		// .lifecard_card:hover { transform: scale(1.05); }
		//

		// watch for size changes procedurally - this approach lacks granularity
		// const mediaQuery = window.matchMedia('(min-width: 800px)')
		// mediaQuery.addListener(e => {
		//	if(e.matches) {
		//		console.log("match")
		//		this.style.width="33%"
		//	} else {
		//		console.log("match o")
		//		this.style.width="100%"		
		//	}
		// })

		// watch for size changes procedurally - this approach is apparently older but gives me more precision
		let resize = () => {
		  if (window.innerWidth > 768) {
				style.width = this.style.width="33%"
		  } else {
				style.width = this.style.width="100%"
		  }
		}
		window.addEventListener('resize', resize);
		resize();

}

///
/// a tail wind approach
///

function use_tailwind() {

		let tags = span class="card_tag bg-white bg-opacity-60 py-1 px-4 rounded-md text-black"

		this.innerHTML =
			`<div
				class="relative mb-4 before:content-[''] before:rounded-md before:absolute before:inset-0 before:bg-black before:bg-opacity-20"
				style="box-shadow: rgb(60, 60, 60) 4px 4px 10px"
				>
				<img class="w-full rounded-md" src="${art}"></img>
				<div class="card_body absolute inset-0 p-8 text-white flex flex-col">
				<div class="relative">
					<a class="card_link absolute inset-0" target="_blank" href="${href}"></a>
					<h1 class="card_title text-3xl font-bold mb-3">${label}</h1>
					<p class="card_author font-sm font-light">${sponsor}</p>
				</div>
				<div class="mt-auto">
					${tags}
				</div>
				</div>
			</div>`
}

*/


