/** 
 * Extract image dimensions from text
 * 
 * @param {Element} element 
 * @returns {number}
 */
const getDimensions = element => {
	const txt = element
		.querySelector('.gallerytext a')
		.nextSibling.textContent.trim();
	
	const parts = txt.match(/^([\d,]+) × ([\d,]+); /);
	if (!parts) return 0;

	const x = parts[1].replaceAll(',', '');
	const y = parts[2].replaceAll(',', '');

	return Number(x) * Number(y);
}

/**
 * Sort files in the category by dimensions (largest first)
 *
 * Only sorts one page at a time (200 file limit)
 *
 * @param {Element} ctr 
 */
export const register = ctr => {
	const root = ctr.parentElement;

	const btn = document.createElement("button");
	btn.textContent = "Sort these file(s) by dimensions";
	btn.onclick = () => {
		const list = ctr.querySelector("ul.gallery");
		const pics = list.querySelectorAll('.gallerybox');
		// hide parent before performing sort to avoid excessive repainting
		root.removeChild(ctr);

		const shadowGallery = Array.from(pics).map(el => el.parentNode.removeChild(el));

		shadowGallery.sort((a, b) => {
			const px_a = getDimensions(a);
			const px_b = getDimensions(b);

			return px_a < px_b;
		});

		// re-insert
		shadowGallery.forEach(el => list.appendChild(el));

		root.appendChild(ctr);
		// sorting is currently a one-way operation
		btn.parentNode.removeChild(btn);
	}

	ctr.prepend(btn);
}