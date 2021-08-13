import {loadDocument, loadPage} from './../util.js';

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
		if (A.previousSibling.textContent === "(") {
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
export const register = (ctr, isNext) => {
	if(!rootCtr) {
		rootCtr = ctr;
		const loadAll = document.createElement('button');
		loadAll.onclick = async () => {
			loadAll.disabled = true;
			let next, curNode = rootCtr;
			do  {
				const data = iterate(curNode);
				[, next] = data;

				const doc = await loadDocument(next);
				curNode = doc.getElementById('mw-category-media');
				loadPage(doc, CSS_GALLERY);
			} while (next);
		};
		loadAll.textContent = 'Load ALL images';
		rootCtr.prepend(loadAll);
	}
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
		btn.onclick = async () => {
			btn.disabled = true;
			const doc = await loadDocument(prev);
			loadPage(doc, CSS_GALLERY);
			// chain next
			register(doc.getElementById('mw-category-media'), false);
		};
		btn.textContent = 'Load PREVIOUS page';
		rootCtr.prepend(btn);
	}

	if (next && showNext) {
		const btn = document.createElement('button');
		btn.onclick = async () => {
			btn.disabled = true;
			const doc = await loadDocument(next);
			loadPage(doc, CSS_GALLERY);
			// chain next
			register(doc.getElementById('mw-category-media'), true);
		};
		btn.textContent = 'Load NEXT page';
		rootCtr.prepend(btn);
	}
}