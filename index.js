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
		mw.notify("🚀 loading local build @" + new Date());
	}

	const {app} = await import(`${APP_URL}`);
	app();
})();
