import {register} from './info.js';
import {register as regCat} from './category';

try {
	register();
	regCat();
} catch(e) {
	console.log("failed to register", e);
}
