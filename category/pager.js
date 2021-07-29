
/**
 * 
 * @param {Element} ctr 
 * 
 * @returns {[string, string]} Link to Previous and Next page
 */
const iterate = (ctr) => {
	const summary = ctr.querySelector('p');

	const A = summary.nextElementSibling;
	const B = A.nextElementSibling;

	const AisLink = A.tagName == 'A';
	const BisLink = B.tagName == 'A';

	if (AisLink && BisLink) { 
		return [A.href, B.href];
	} else if (AisLink && !BisLink) {
		// FIXME: depends on English translation
		if (A.innerText === 'previous page') {
			return [A.href, null];
		} else {
			return [null, A.href];
		}
	}

	return [null, null];
}


/**
 * Add dynamic pagination capabilities
 * to gallery views in categories.
 *
 * @param {Element} ctr 
 */
export const register = (ctr) => {
	const data = iterate(ctr);

	console.log('d', data);
}