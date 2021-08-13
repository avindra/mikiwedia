import {loadDocument, loadPage} from './../util.js';

const CSS_GALLERY = `.mw-contributions-list`;
const CSS_NEXT = ".mw-nextlink";

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
			loadPage(nextDocument, CSS_GALLERY);
		}
	}
}