const CSS_GALLERY = `.mw-contributions-list`;
const CSS_NEXT = ".mw-nextlink";

/**
 * Load document
 * 
 * @param {string} url 
 */
 async function loadDocument(url) {
	const r = await fetch(url);
	const txt = await r.text();
	const parser = new DOMParser();
	const doc = parser.parseFromString(txt, "text/html");
	return doc;
}

/**
 * Fetch images from a page and
 * merge them into the current view.
 * 
 * @param {Document} doc
 */
 async function loadPage(doc) {
	const pics = doc.querySelector(CSS_GALLERY);

	const G = document.querySelector(CSS_GALLERY);
	const P = G.parentNode;
	// hide and do work
	P.removeChild(G);
	const newImages = Array.from(pics.querySelectorAll('li'))
		.map(e => e.parentNode.removeChild(e));
	newImages.forEach(e => G.appendChild(e));
	// show
	P.appendChild(G);

	mw.notify(`Loaded ${newImages.length} files`);
}

export const register = () => {
	const nav = document.querySelector(".mw-pager-navigation-bar");
	if (!nav) return;

	let nextDocument = document;
	let nextPage = nextDocument.querySelector(CSS_NEXT);

	if (nextPage) {
		const ctr = document.createElement('button');
		ctr.textContent = 'Older';
		nav.parentNode.prepend(ctr);

		ctr.onclick = async () => {
			nextDocument = await loadDocument(nextPage.href);
			nextPage = nextDocument.querySelector(CSS_NEXT);
			loadPage(nextDocument);
		}
	}
}