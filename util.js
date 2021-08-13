/**
 * Load document
 * 
 * @param {string} url 
 */
export async function loadDocument(url) {
	const r = await fetch(url);
	const txt = await r.text();
	const parser = new DOMParser();
	const doc = parser.parseFromString(txt, "text/html");
	return doc;
}


/**
 * Fetch items from page and
 * merge into existing list
 * 
 * @param {Document} doc
 * @param {string} CSS_GALLERY Selector for node of interest
 */
async function loadPage(doc, CSS_GALLERY) {
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

	mw.notify(`Loaded ${newImages.length} items`);
}

