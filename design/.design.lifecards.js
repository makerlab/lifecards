let design = [{
uuid: "/design",
stylize:{maxWidth:"800px",margin:"auto"},
markdown:`
# General
---

## What is Lifecards?

Lifecards is a data-driven information presentation tool.

## Who is Lifecards for?

It feels like our basic needs to organize and share information are not being well met online.
By 'our' what is meant is a range of people from individuals hosting websites or sharing content to small business owners.
There are kinds of things that we want to organize and even occasionally share that seem unduly hard to achieve.

If you're like us at all, then:

1) You have *a lot* of 'stuff', text, images, videos or even more exotic media types that you want to organize and possibly present easily, for yourself, and even for others

2) Having your data be presentable, even beautifully laid out, is important to you. You may even want highly stylized layouts with fancy 3D views in some cases.

3) Maintainability and access to your data is critical for you. You want to use your own external tools and your own file-system as opposed to making yet another shadow copy of your data for yet another content management system.

4) Many contributors or collaborators may potentially be involved in your projects. You want them to be able to help curate the data and presentation in that case.

5) You want low cognitive overhead; you don't want to have to think hard about how to use a tool.

## What are use cases for Lifecards?

There is a popular class of "list and card" style layouts for data-heavy applications that Lifecards is intended for. More general-use cases include common types of websites such as:

- Personal homepages
- Blogs
- Travel photo collections
- Favorite hikes
- Recipes
- Favorite books or music that I've run across recently
- Mind maps

More specifically users will almost certainly have specific interests that they want to curate, organize and possibly share. There are thousands more possible use cases - here are just a few:

- Knitting patterns organized by difficulty
- Research materials, grouped into categories
- Home-repair guides attached to a 3D model of a house
- Exercise routines shown represented on a body
- Places to go dancing arranged on a map
- Interesting upcoming events arranged in a calendar
- Friends blogs arranged by topic
- Articles tagged into groups

For users beyond individuals, such as small businesses, there's also a class of live or group managed data where many people are contributing at once such as:

- How-to guides
- Documentation systems (such as gitbook)
- Product cards
- Resellers
- Recent activity and news

In the latter cases it can become more and more important to have rich query capabilities, to be able to organize collections by different criteria. Effectively there are two separate cross-cutting concerns - a "data management" concern and a "presentation" concern. These are distinct, but can overlap. Often the data needs to be marked up very clearly, and often the presentation layer needs to be able to search, sort and filter to present content as desired.

## What are goals for Lifecards?

Of course content management systems are expected to support organization and presentation of basic kinds of content
such as text, images, video. And there's a reasonable expectation to have a variety of viewers
such as lists, cards, maps, globes, timelines.
We can even expect to be able to manufacture pinterest style views, or powerpoints, or hypercard style "light programming" interfaces.

Beyond the basics there is an opportunity to go further however - and this reflects better the current implementation.
A data-driven view is particularly useful for viewing the same content in many different ways.
In the near future we as consumers will probably see the emergence of heads up displays and richer viewing metaphors - where it will be common to decorate the real world with virtual data, and where 3D will be common.
Over time we want to support a rich set of viewing modes where html will not exist - and where views are much richer:

- Showing hikes on a 3D globe and indicating suitability for current time of year
- 3D views of information such as a 3D spiral timeline on a year basis
- Mind palace view where your data is represented as a Redwood Forest
- Audio as well such as play a collection as a music stream
- Obsidian or mind map style viewers that are diagrammatic

There's also some sensitivity to a class of multiplayer concerns. The app is written to be multiplayer with every node dynamically updating and injecting changes on the fly, and a database observer pattern is carefully used everywhere. Some of the uses include:

- Aggregation of content from other sources in real time (to the database and then reflected to the view)
- Multiplayer editing in general

## What do we mean by "data-driven"?

A difference in our approach is that Lifecards drives all the rendering from the database state.
Data is decorated with presentation hints and that is used to guide rendering.
Note that of course your 'database' can be your file-system or however you've chosen to organize your content.

This can mean that in some senses the presentation is less flexible than a full blown CMS.
But the hope is that by reducing complexity it becomes easier to manage larger amounts of data.

## Why is it called "Lifecards"?

Throughout this project a card-like metaphor often emerges where a data object is represented as a single card.
We think that cards represent a pattern in how people collect, organize and share information.
As a metaphor it appears is useful and will be extended upon over time:

- Live cards that reflect say the local weather in a region or a stock market price
- Animated cards such as for deepwater fish, or plants or birds
- Cards that can act like a todo list - letting you mark off each todo item you did
- Cut, paste and remix cards to create new decks; similar to slideshare
- Print decks out as MooCards and take them with you (such "Pacific Northwest Birds")

## How about CMS "XYZ"?

Gardening our data is of course a perennial problem. Ever since clay tablets appeared in Mesopotamia in 2400 BC people have been struggling to organize and share information. Scribes in monastaries have shuffled paperwork for eons. Tim Berners-Lee wrote the web as an attempt to try tackle this. Ted Nelson wrote Project Xanadu for similar reasons. Hypercard was developed by Bill Atkinson as yet another response to this perennial challenge.

Today there are many active projects, content management systems and organizational schemes available to us. It is in fact common today for larger libraries and companies to have full-time digital librarians to manage their archives and content. None of these seem to be exactly right for the needs being tackled here.

Some of the technical criteria here were:

- Data Driven. Lifecards is purely data-driven with all layout based on hints from data objects from a database.
- Multiplayer. Database queries are treated as ongoing event observers. The intent is to facilitate multiplayer interaction by design.
- Crumpled data model. The schema for objects is somewhat informal and colloquial for ease of use.
- Fine grained concepts of ownership, perms, grouping and so on using ACLS.
- DOM abstraction. We wanted to avoid being tied to html to allow for later running on native platforms.
- No compilation or preprocessing. Today there is no overwhelming need to run preprocessing phases (such as react endorses).
- Client side. This engine currently can run entirely client side.
- Flat Namespace. Rather than having a /public folder I wanted to treat the entire folder space as a network visible resource.
- Submodules. The intent is to not have a npm_modules or some other crate/module scheme but to include this entire engine as a sub folder for other projects.

And some of the critiques of other systems were:

- Presentation tools are highly opinionated and frankly limited
- Systems are often highly centralized, entirely closed source and outside of our control
- Data has to be poured into their system and it can vanish at any time
- Hosting it yourself can require servers and specialized skills to run and manage
- Tools have complex layout capabilities that take real work to master
- A full-time digital librarian or curatorial role is sometimes needed

# Using Lifecards
---

## Getting Started

Fetch Lifecards from [https://github.com/makerlab/lifecards]("https://github.com/makerlab/lifecards")

Install [Deno]("https://deno.land").

Using a terminal window run this script in the root of the project to start things up:

<code>./run.sh</code>

Open a browser on the localhost port to view the app - usually [localhost:8080]("http://localhost:8080").

Lifecards is [a demonstration of itself](https://tvtropes.org/pmwiki/pmwiki.php/Main/SelfDemonstratingArticle).
You can edit the content in the <code>/data</code> folder and see the results by refreshing your browser window.

## How does one use Lifecards?

After you are up and running, you should be ready to actually customize your first site. The Lifecards site itself is an example of Lifecards. Modifying the files here is a good way to become familiar with the core concepts.

To start, modify the content in <code>/data/data.js</code>. Lifecards is data-driven and all layout and data are specified in files here. You'll quickly get a feel for how the view is composed. Various kinds of components are described further on.

## Bootstrapping for more serious developers

The <code>index.html</code> file demonstrates how to bootstrap Lifecards. You can also do this yourself and embed the project in other tools. Bootstrapping requires first making a database and then making a DOM() layout manager. The DOM() layout manager is driven by telling it what to make. Many of the DOM nodes are able to query the database to fetch and produce yet other nodes and, thus, to produce the display.

## Node structure

Lifecards consumes a directed acyclic graph of "nodes" that are specified in the database. A node is really just a json blob with some conventions about what is in it. Typically a database is actually just a file system or an unstructured datastore such as MongoDB or Firebase.

Nodes crumple or squish together both the concept of "being data" (holding important values) and "being presentation" (holding values related to presentation). By "crumple" or "squish" it is meant that the node namespace is "as flat as possible" (this is a design maxim) but this *also* means that collisions between concepts in the data space and concepts in the presentation space can occur.

Typical nodes look like this:

	{
		uuid:"/mydomain.com/comicbooks",
		label:"Comics!",
		art:"/assets/bird.jpg",
		query:"*",
		kind:"area",
		thumb:"/assets/.thumb.bird.jpg"
		content:"Best Comics Ever",
		children: [ { content:"Comics!"} ],
		stylize:{
			width:"320px",
			border:"3px solid blue"
		}
	}

Here we see two disjoint domains crumpled together: The first few tokens (uuid, age ...) are "data". They refer to concepts that might be important to you in a durable, presentation-independent sense. The latter tokens refer to presentational or layout concerns.

Because Lifecards is data-driven, one can reasonably expect to be able to view this node by itself. Nodes can be viewed by themselves (often) directly, but ALSO can show up in a parent (as a result of a parent query).

If the item is being viewed by itself, then the "kind" of presentation widget that will be used in this above example is called an "area" widget. That actual layout mechanic and actual code is located in <code>/js/area.js</code>. Note that many widgets are more or less empty because the HTML DOM contains a powerful base class that enhances ALL elements with features here. "Kind" translates directly to a widget if any, otherwise an ordinary HTML DOM type is manufactured - if kind was "div" for example, a "div" is manufactured as the container.

Specifying a "kind", or layout style, is less important for leaf or child nodes because our node's parent scope can coerce its rendering style (plucking out what hints it can from the child node and painting those however it wishes).

Every node in that graph that is handed to the DOM is treated as potentially renderable. Only nodes that are handed to the DOM end up being rendered.

Some design choices that we've made in the internal structure of data:

- Data objects' UUIDs should avoid collisions world wide.
- Each project should have its own DNS domain.
- A database is conceptually a directed acyclic graph.
- we are planning on implementing a variety of scanners and bridges from other data storage systems aside from the filesystem

## Vanilla DOM Components: <i>div, P, h1, h2, h3</i> and so on

A node that is a display widget is conceptually referred to as a 'component'.

One can use the names of built-in HTML DOM elements to create components with said elements' properties. It is therefore possible to compose fairly ordinary HTML with a wide range of approaches in a data-driven way with Lifecards if desired:

	{
		kind:"div",
		stylize:{ border:"3px solid blue"},
		content:"<h1>Welcome to the future</h1>",
		markdown:"# The FUTURE IS NOW",
		children:[
			{content:"This is a div"},
			{kind:"p",content:"This is a p"},
			{kind:"h1",content:"This is an h1"},
		],
		query:"tag=blue"
	}

## Area Component

Area will support pagination [TBD]

## Base Component

<code>kind: "base"</code> is a powerful node type that has its resolve() method injected into every other node, giving other nodes a core set of powers.  It gives nodes the ability to resolve fields including content, stylize, query and children.

## Card Component

<code>kind: "card"</code> is the first step towards generalized card layout capabilities. It is currently capable of presenting one card style. [TBD]

## Link Component

<code>kind: "link"</code> is a shim around the vanilla DOM <code>a href</code> element. The issue was that we didn't want to overload <code>a</code> and we wanted to standardize property field setting a bit. There's some argument that it could be removed but it's still present for now. [TBD]

## Logo Component

<code>kind: "logo"</code> is the first in a series of very rich, artful CSS text styling effects for Lifecards. Lifecards as a whole is intended to be fun, light and pretty, not just a dry, serious tool. Many 3D elements will be written as well [TBD].

## Footer Component

<code>kind: "footer"</code> wraps up footer-related concerns; mostly a <code>@media</code> day/night-sensitive footer region. While this could easily be a vanilla DOM element, it felt worth promoting to full-blown concept status.

## Nav Component

<code>kind: "nav"</code> provides a basic navigation bar that remains consistent across every page. Semantically, it is intended as a palette or an app toolbar. If the current page is a URL in the navbar, it will highlight the current page [TBD].

## Routable Component

<code>kind: "routable"</code> displays whatever the URL is set to. This is a way to create multiple pages in a SPA (single page application).

Lifecards ALWAYS intercepts ALL local URLs. This may need to be more flexible eventually [TBD].

# Theory
---

This is a very quick primer on some of the concerns around taking "data" and presenting it.

## Data Import / Organization

The current version uses simple .json files that hold all data. The intent, however, is to have hooks for richer import sources. There is definitely a plan to include scanners and database bindings (later) [TBD]. In general, you'll need some kind of adapter that bridges your data to the Lifecards system. Data is always going to exist in multiple places.

Your goal (in general) is to have a 'source of truth' or a canonical place for data. This includes heavy data (text, images, content) and its lighter associated metadata (creation date, author, tags). A database or a lookaside file near the content itself will store the metadata, on occasion. Often vanilla filesystems are used for heavy assets - or industrial strength data stores. In most cases, the storage system allows use of metadata for decoration of files.

For heavy assets, I typically recommend creating some kind of directed acyclic graph on disk -- basically files and folders -- and using that as an overarching filing system. I recommend fairly soft and loose folder names such as "text", "travel" and so on. Finding good general labels can be tricky, but over-specificity at this level is risky. It's also less important that these be extremely accurate, and more important that every asset has one resting place. I've personally had a tendency to categorize data into year bucket folders, but your mileage may vary.

You'll never have a perfect organization. It is in fact not physically possible to organize data perfectly. Data is necessarily going to be miscategorized as a fundamental side effect of disjoint classification. There are many papers and books on categorization theory, prototype theory, and theories of partitioning that discuss these issues.

## Presentation: Color, Style, Layout, Components

Below the components we provide are lower-level concerns around layout, readability, aesthetics, and usability (especially for people who are differently-abled). There are tons of sites devoted to user interface considerations, fonts, kerning, spacing, color and so on that you can consult as references. Also, most low-level style and component frameworks -- such as Tailwind, Bootstrap and so on -- have very, very good and somewhat standardized opinions on these factors. Their sites are worth browsing if you're not familiar with these resources.

You should be able to use the current tools as-is, but you can also customize if you wish. It's important to customize because reader fatigue sets in if the same patterns are visually seen over and over. Customization can be achieved by including your own css or by hand styling each of your elements, or by adding new kinds of elements even (if you're a programmer). You'll want to familiarize yourself with design theory resources if you start messing around with layout beyond what is provided. The current version DOES attempt to set a few basics:

- fonts and font kerning are set to be reasonable
- spacing
- default colors
- a night mode for color
- narrow mode for mobile support
- a general philosophy of centering content for simple quick satisfying layout wins

There is a very strong attempt in Lifecards to provide only the absolute minimal design at the core. But the components can implement their own fancy styles beyond that.

Look at the tailwind docs for good examples of higher level layouts and components for the web. Also there are a number of resources for doing design usability for real world human spaces, for real world artifacts, for 3D interfaces such as for video games. These may feel esoteric but do represent valuable thinking outside of the space of the web and can inform your work.

# Quirks
---

- **Deno.** <br />This project uses [Deno](https://deno.land/) at the moment (see Deno server in /utils/server.js). The server role is largely to serve http:// files from the current folder. There's no particular reason I'm using Deno; it can be replaced with any server you wish, such as nodejs/express or firebase, or whatever.

- **SPA.** <br />This is a single page app. On the server side I *do* re-direct some path requests back to the root index.html to allow for persistent urls. My strategy is that if a path does not end in a .jpg or some other mime type then I assume it is a request for SPA route - and I serve the index.html page. Firebase does something similar fwiw.

- **No /public folder.** <br />It's worth noting that I treat the entire current folder as a web visible space -- as opposed to the way that you'd typically expose only a <code>/public</code> folder. This is because the database wrapper maps to a user's local filesystem. I want to be able to create an instance of Lifecards as a data-presentation layer for arbitrary filesystems. This does, however, introduce a quirk where the server itself could be fetched and downloaded by the client -- and of course you want to avoid storing any secrets in the current folder.

- **Almost everything in this project uses a "keep it as simple as possible" approach.** <br />No precompilation (at the moment); I don't like it. Webpack and so on are not used here. I find the whole package.json and Node.js webpack philosophy to be an incredible mess and unnecessary complexity. Just editing live files -- served directly to the client -- is good enough for me, for now. You're welcome to build a more complex regeneration phase if you wish.
`
}
]

export default design
