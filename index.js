import {register} from './info.js';

try {
	register();
	console.log("Hello from mikiwiki");
} catch(e) {
	console.log("failed to register", e);
}
