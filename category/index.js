import {register as registerSort} from './sort.js';
import {register as registerPager} from './pager.js';

const register = () => {

	const ctr = document.getElementById('mw-category-media');
	// not a cat page. nothing to do
	if(!ctr) return;

	const isCat = location.pathname.startsWith('/wiki/Category:');

	registerSort(ctr);
	registerPager(ctr);
}

export {register};