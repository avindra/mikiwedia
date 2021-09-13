import {loadDocument, loadPage, bumpParam} from './../util.js';

const CSS_GALLERY = `.mw-contributions-list`;
const CSS_NEXT = ".mw-nextlink";

const DEFAULT_LIMIT = 50;

function createLimit() {
	const l = document.createElement('select');
	[20,50,100,250,500].forEach(lim => {
		const o = document.createElement('option');
		o.value = lim;
		o.text = lim;
		l.appendChild(o);
	});
	l.value = DEFAULT_LIMIT;
	return l;
}

/**
 * a) Paginate recent changes
 * b) Special:Upload usability
 *
 */
export const register = () => {
	const pgName = mw.config.get('wgPageName');
	// Special:Upload usability
	if(pgName === 'Special:Upload') {
		const txt = document.getElementById('uploadtext');
		const P = txt.parentNode;
		txt.remove();
		P.appendChild(txt);


		const summ = document.createElement('input');
		summ.name = "wpSummary";
		summ.id = "wpSummary";
		summ.placeholder = "Look up past summary messages (alt+shift+b)";
		summ.accessKey = "b";

		// server doesnt do anything with it right now
		document.querySelector('form#mw-upload-form').prepend(summ);
	} else if (pgName === 'Special:UploadWizard') {
		// link directly to old form
		document.querySelector("#contentSub a:nth-of-type(3)").href = '/w/index.php?title=Special:Upload&uselang=experienced';
	} else if(pgName === 'Special:Log') {
		bumpParam('user');
	} else {
		console.log('📄 page', pgName);
	}

	// recent changes pagination
	const nav = document.querySelector(".mw-pager-navigation-bar");
	if (!nav) return;

	let limit = DEFAULT_LIMIT;
	let nextDocument = document;
	let nextPage = nextDocument.querySelector(CSS_NEXT);

	if (nextPage) {
		const btn = document.createElement('button');
		btn.textContent = 'Older';
		const P = nav.parentNode;
		const limiter = createLimit();
		const onChange = (event) => {
			limit = Number(event.target.value);
		};
		limiter.onchange = onChange;
		const ctr = document.createElement('span');
		ctr.append(btn, limiter);

		const onClick = async function () {
			this.disabled = true;
			nextDocument = await loadDocument(nextPage.href + `&limit=${limit}`);
			nextPage = nextDocument.querySelector(CSS_NEXT);
			loadPage(nextDocument, CSS_GALLERY);
			this.disabled = false;
		};
		btn.onclick = onClick;
		P.prepend(ctr);

		/** make copy for bottom, with events wired   */
		const ctr2 = ctr.cloneNode(true);
		ctr2.querySelector('button').onclick = onClick;
		const sl = ctr2.querySelector('select');
		sl.value = DEFAULT_LIMIT;
		sl.onchange = onChange;

		P.append(ctr2);
	}

}