const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
/**
 * padre forgive me
 * a goofy development mode hook
 */
(async() => {
	let APP_URL = `./app.js`;
	const LOCAL_URL = `http://localhost:8000/app.js`;
	const controller = new AbortController();
	const id = setTimeout(() => controller.abort(), 750);
	const r = await fetch(LOCAL_URL, {
		method:'HEAD',
		signal: controller.signal,
	});
	clearTimeout(id);
	if (r.ok) {
		APP_URL = LOCAL_URL;
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

			const {app} = await import(`${APP_URL}`);
			app();
		}
	}
})();
