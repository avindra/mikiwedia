import {register} from './info.js';
import {register as regCat} from './category.js';

const modules  = [
	register,
	registerCat,
];


modules.forEach(fn => {
	try {
		fn();
	} catch(e) {
		console.log("failed to register", fn, e);
	}
});
