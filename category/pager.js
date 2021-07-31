
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
	const BisLink = B && B.tagName == 'A';

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
 * @param {boolean} isNext
 */
async function loadPage(url, isNext) {
	const r = await fetch(url);
	const txt = await r.text();
	const parser = new DOMParser();
	const doc = parser.parseFromString(txt, "text/html");

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

	// chain next
	register(doc.getElementById('mw-category-media'), isNext);
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
 * @param {boolean} isNext
 */
export const register = async (ctr, isNext) => {
	if(!rootCtr) rootCtr = ctr;
	const data = iterate(ctr);

	const [prev, next] = data;

	/**
	 * TODO: handle show* in a less obtuse way
	 */
	const showDefined = isNext !== undefined;

	const showPrev = !showDefined || (showDefined && !isNext);
	const showNext = !showDefined || (showDefined && isNext);

	if (prev && showPrev) {
		const btn = document.createElement('button');
		btn.onclick = () => {
			loadPage(prev, false);
			btn.disabled = true;
		};
		btn.textContent = 'Load previous page';
		rootCtr.prepend(btn);
	}

	if (next && showNext) {
		const btn = document.createElement('button');
		btn.onclick = () => {
			loadPage(next, true);
			btn.disabled = true;
		};
		btn.textContent = 'Load next page';
		rootCtr.prepend(btn);
	}
}