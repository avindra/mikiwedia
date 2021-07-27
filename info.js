
export const register = () => {
	let requested = false;
	Array.from(document.querySelectorAll("#t-info > a:nth-child(1)")).forEach(link => {
		link.addEventListener("mouseover", async () => {
			if(requested) return;
			requested = true;
			const mwFile = document.getElementById("firstHeading").textContent;
			const response = await fetch(`/w/index.php?title=${mwFile}&action=info`);
			const txt = await response.text();

			const parser = new DOMParser();
			const doc = parser.parseFromString(txt, "text/html");
			const content = doc.querySelector("#content");

			document.querySelector("#firstHeading").prepend(content);
		});
	});
}
