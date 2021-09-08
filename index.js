import {register as registerA} from './views.js';
import {register as registerB} from './category/index.js';
import {register as registerC} from './contrib/index.js';

export const app = () => {
	[
		registerA,
		registerB,
		registerC,
	].forEach(fn => {
		try {
			fn();

			const btn = document.createElement("button");
			btn.onclick = () => {
				/**
				 * padre forgive me: dep on
				 * personal localization
				 */
				const t = new Date().toLocaleTimeString();
				const now = t.substring(0,t.lastIndexOf(':'));
				const pad = now.padStart(5, '0');
				location.pathname = `/wiki/Category:Time ${pad}`;
			}
			btn.textContent = "Check the time";

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
