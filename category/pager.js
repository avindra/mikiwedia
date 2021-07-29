
/**
 * Find links for next and previous pages in
 * the gallery.
 * 
 * @param {Element} ctr 
 * 
 * @returns {[string, string]} Link to Previous and Next page
 */
const iterate = (ctr) => {
	const summary = ctr.querySelector('p');

	const A = summary.nextElementSibling;
	const B = A.nextElementSibling;

	const AisLink = A.tagName == 'A';
	const BisLink = B.tagName == 'A';

	if (AisLink && BisLink) { 
		return [A.href, B.href];
	} else if (AisLink && !BisLink) {
		// FIXME: depends on English translation
		if (A.innerText === 'previous page') {
			return [A.href, null];
		} else {
			return [null, A.href];
		}
	}

	return [null, null];
}

/**
 * CSS selector for main <ul> that holds
 * images in the category view.
 */
const CSS_GALLERY = '.mw-gallery-traditional';

/**
 * Fetch images from a page and
 * merge them into the current view.
 * 
 * @param {string} url 
 */
async function loadPage(url) {
	const r = await fetch(url);
	const txt = await r.text();
	const parser = new DOMParser();
	const doc = parser.parseFromString(txt, "text/html");

	const pics = doc.querySelector(CSS_GALLERY);

	const G = document.querySelector(CSS_GALLERY);
	const P = G.parentNode;
	// hide and do work
	P.removeChild(G);
	Array.from(pics.querySelectorAll('li'))
		.map(e => e.parentNode.removeChild(e))
		.forEach(e => G.appendChild(e));
	// show
	P.appendChild(G);

	// chain next
	register(doc.getElementById('mw-category-media'));
}

/**
 * Remember the root node so we
 * know where to put the buttons.
 */
let rootCtr;

/**
 * Add dynamic pagination capabilities
 * to gallery views in categories.
 *
 * @param {Element} ctr 
 */
export const register = async ctr => {
	if(!rootCtr) rootCtr = ctr;
	const data = iterate(ctr);

	const [prev, next] = data;

	if (prev) {
		const btn = document.createElement('button');
		btn.onclick = () => {
			loadPage(prev);
			btn.disabled = true;
		};
		btn.textContent = 'Load previous page';
		rootCtr.prepend(btn);
	}

	if (next) {
		const btn = document.createElement('button');
		btn.onclick = () => {
			loadPage(next);
			btn.disabled = true;
		};
		btn.textContent = 'Load next page';
		rootCtr.prepend(btn);
	}
}