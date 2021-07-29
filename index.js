import {register} from './info.js';
import {register as registerCategory} from './category/index.js';

const modules  = [
	register,
	registerCategory,
];


modules.forEach(fn => {
	try {
		fn();
	} catch(e) {
		console.log("failed to register", fn, e);
	}
});
