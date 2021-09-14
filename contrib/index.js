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
 * @see https://www.mediawiki.org/w/index.php?title=Topic:Uf4krdlgla2ofhg8&topic_showPostId=ufaoyapift6qlhrg#flow-post-ufaoyapift6qlhrg
 */
async function getHTML(wikitext) {
	await mw.loader.using( 'mediawiki.api' );
	const api = new mw.Api();

	const html = await api.parse( wikitext);
	return html;
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


		const viewFiles = document.createElement('button');
		viewFiles.onclick = async function () {
			this.disabled = true;
			const files = Array.from(document.querySelectorAll(".mw-contributions-title")).map(a => a.textContent);
			const f = files.sort().map(f => {
				if (f.startsWith("File:")) {
					return `[[${f}|200px]]`;
				}

				return `[[:${f}]]`;
			});
			const list = f.join('\n');
			const html = await getHTML(list);
			const sp = document.createElement('span');
			sp.innerHTML = html;
			document.body.appendChild(sp);
			this.disabled = false;
		};
		viewFiles.textContent = "🔍";
		P.prepend(viewFiles);

		/** make copy for bottom, with events wired   */
		const ctr2 = ctr.cloneNode(true);
		ctr2.querySelector('button').onclick = onClick;
		const sl = ctr2.querySelector('select');
		sl.value = DEFAULT_LIMIT;
		sl.onchange = onChange;

		P.append(ctr2);
	}

}