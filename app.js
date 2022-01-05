import {register as registerA} from './views.js';
import {register as registerB} from './category/index.js';
import {register as registerC} from './contrib/index.js';
import {register as registerD} from './time.js';

export const app = () => {
	[
		registerA,
		registerB,
		registerC,
		registerD,
	].forEach(fn => {
		try {
			fn();
		} catch(e) {
			console.log("failed to register", fn, e);
		}
	});
}