import {register as registerA} from './views.js';
import {register as registerB} from './category/index.js';
import {register as registerC} from './contrib/index.js';

/**
 * padre forgive me: dep on
 * personal localization
 */
const getTime = () => {
	const t = new Date().toLocaleTimeString();
	const now = t.substring(0,t.lastIndexOf(':'));
	const pad = now.padStart(5, '0');
	return pad;
}

const getLink = () => `/wiki/Category:Time ${getTime()}`;

export const app = () => {
	[
		registerA,
		registerB,
		registerC,
	].forEach(fn => {
		try {
			fn();

			const btn = document.createElement('a');
			/**
			 * @todo cmp and dsp clock drift (si existe)
			 * @param {Event} e 
			 */
			btn.onclick = function(e) {
				e.preventDefault();
				location.pathname = getLink();
			}
			btn.href = getLink();
			btn.textContent = `Check time ${getTime()}`;

			const lst1 = document.querySelector("nav#p-tb ul");

			const ptr = document.createElement('li');
			ptr.append(btn);

			lst1.append(ptr);



			const btn2 = document.createElement('a');
			btn2.href = '/wiki/Special:Upload';
			btn2.textContent = 'Limited upload';

			const lst2 = document.querySelector("nav#p-participate ul");

			const ptr2 = document.createElement('li');
			ptr2.append(btn2);

			lst2.append(ptr2);

			/**
			 * adjust as necessary
			 */
			const baseline = [
				"00:00", "01:05","02:11", "03:16", "04:22","05:27",
				"06:33", "07:38", "08:43","09:50", "10:55","12:00"
			];
			const deltas = baseline.map(timeLabel => {
				const now = new Date();
				const [date, /*time*/] = now.toISOString().split('T');
				const proj =`${date}T${timeLabel}:00.000Z`;
				const moment = new Date(proj);

				const diff = moment - now + now.getTimezoneOffset() * 60000;
				return diff;
			});
			const iCandidate = deltas.findIndex(delta => delta > 0);


			const txtNextEvent = baseline[iCandidate];
			const msToNextEvent = deltas[iCandidate];

			const spectato = document.createElement('a');
			spectato.href = `/wiki/Category:Time ${txtNextEvent}`;
			spectato.textContent = `Preview ${txtNextEvent} (in ${msToNextEvent}ms)`;

			lst1.append(spectato);

		} catch(e) {
			console.log("failed to register", fn, e);
		}
	});
}


const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
/**
 * padre forgive me
 * a goofy development mode hook
 */
(async() => {
	try {
		const LOCAL_DEV_URL = `http://localhost:8000/index.js`;
		const controller = new AbortController();
		const id = setTimeout(() => controller.abort(), 750);
		const r = await fetch(LOCAL_DEV_URL, {
			method:'HEAD',
			signal: controller.signal,
		});
		clearTimeout(id);
		if (r.ok) {
			// make sure to load dev env only once
			if(!window.devel) {
				window.devel = true;

				/**
				 * Prevent a race... we need to ensure
				 * deps are fully loaded
				 */
				while (!('$' in window) && !('mw' in window)) {
					console.warn("Race detected... deferring init until after jQuery is loaded");
					await sleep(500);
				}

				mw.notify("🚀 loaded local build: " + new Date());

				const {app: localApp} = await import(`${LOCAL_DEV_URL}`);
				localApp();
			}
		} else {
			throw new Exception(`Loading from production`)
		}
	} catch(e) {
		app();
	}
})();
