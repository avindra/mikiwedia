import {register} from './info.js';
import {register as registerCategory} from './category/index.js';

const app = () => {
	[
		register,
		registerCategory,
	].forEach(fn => {
		try {
			fn();
		} catch(e) {
			console.log("failed to register", fn, e);
		}
	});
}

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
			const l = document.createElement('script');
			l.type = 'module';
			l.src = LOCAL_DEV_URL;
		} else {
			throw new Exception(`Loading from production`)
		}
	} catch(e) {
		app();
	}
})();