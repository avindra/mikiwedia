import {register as registerA} from './views.js';
import {register as registerB} from './category/index.js';
import {register as registerC} from './contrib/index.js';
import {register as registerD} from './time.js';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const app = () => {
	[
		registerA,
		registerB,
		registerC,
		registerD,
	].forEach(async fn => {
		/**
		 * Prevent a race... we need to ensure
		 * deps are fully loaded
		 */
		while (!('$' in window) && !('mw' in window)) {
			console.warn("Race detected... deferring until deps loaded");
			await sleep(500);
		}

		try {
			fn();
		} catch(e) {
			console.log("failed to register", fn, e);
		}
	});
}