import {register as registerA} from './views.js';
import {register as registerB} from './category/index.js';
import {register as registerC} from './contrib/index.js';

/**
 * Get time in xx:xx format as per Wikimedia categories
 *
 * @see https://commons.wikimedia.org/wiki/Category:Clocks_by_time
 */
const getTime = () => {
	const [t, /*am or pm*/] = new Date().toLocaleString('en-US', {
		hour: 'numeric',
		minute: 'numeric',
		hour12: true
	}).split(' ');
	const pad = t.padStart(5, '0');
	return pad;
}

/**
 * @see https://stackoverflow.com/a/48581881/270302
 */
function parseDaytime(time) {
	let [hours, minutes] = time.substr(0, time.length  -2).split(":").map(Number);
	if (time.includes("pm") && hours !== 12) hours += 12;
	return 1000/*ms*/ * 60/*s*/ * (hours * 60 + minutes);
}

const getLink = () => `/wiki/Category:Time ${getTime()}`;

export const app = () => {
	[
		registerA,
		registerB,
		registerC,
	].forEach(fn => {
		try {
			fn();

			const btn = document.createElement('a');
			const setTime = () => {
				btn.textContent = `Check time ${getTime()}`;
			};
			/**
			 * @todo cmp and dsp clock drift (si existe)
			 * @param {Event} e
			 */
			btn.onclick = function(e) {
				e.preventDefault();
				setTime();
				location.pathname = getLink();
			}
			btn.href = getLink();
			setTime();

			const lst1 = document.querySelector("nav#p-tb ul");

			const ptr = document.createElement('li');
			ptr.append(btn);

			lst1.append(ptr);



			const btn2 = document.createElement('a');
			btn2.href = '/wiki/Special:Upload';
			btn2.textContent = 'Limited upload';

			const lst2 = document.querySelector("nav#p-participate ul");

			const ptr2 = document.createElement('li');
			ptr2.append(btn2);

			lst2.append(ptr2);

			/**
			 * adjust as necessary
			 */
			const baseline = [
				"00:00", "01:05","02:11", "03:16", "04:22","05:27",
				"06:33", "07:38", "08:43","09:50", "10:55","12:00"
			];

			const now = new Date();
			const TZ_OFFSET = now.getTimezoneOffset() * 60000;
			const projections = baseline.map(() => {
				const [date, /*time*/] = now.toISOString().split('T');
				const proj =`${date}T00:00`;

				return new Date(proj);
			});

			const allTimes = projections.map((projectedDate, i) => 
				['am', 'pm'].map(ap =>
					new Date(
						+projectedDate
						+parseDaytime(baseline[i] + ap)
						-TZ_OFFSET
					)
				)).flat().sort((a,b)=>b-a);
			
			const deltas = allTimes.map(moment => {
				const diff = moment - now;
				return diff;
			});

			let indexResult = deltas.reduce((prevIndex, curr, i) => {
				// excl. past events
				if (allTimes[i] < now + TZ_OFFSET) {
					return prevIndex;
				}

				const prev = prevIndex === -1 ? Number.MAX_VALUE : deltas[prevIndex];
				if (curr > 0 && curr < prev) {
					return i;
				} 
				return prevIndex;
			}, -1);


			/***
			 * sometimes you need a +1 or -1 🤷🤷
			 *
			 * @param {boolean} Up or down
			 */
			function makeShifter(way) {
				const f = document.createElement('button');
				f.textContent = way ? `>` : '<';
				f.onclick = () => {
					way ? indexResult++ : indexResult--;
					spectate();
				};
				return f;
			}

			const goBack = makeShifter();
			const goNext = makeShifter(true);


			console.log("🌌 ⌛", indexResult, baseline);
			console.log("⌛ 🌌", projections, allTimes);


			const spectato = document.createElement('a');

			function spectate() {
				const iCandidate = indexResult - 1;
				const txtNextEvent = baseline[iCandidate];
				const msToNextEvent = deltas[iCandidate];

				spectato.href = `/wiki/Category:Time ${txtNextEvent}`;
				spectato.textContent = `⌚ ${txtNextEvent} (in ${msToNextEvent}ms)`;
			}
			spectate();

			lst1.append(goBack)
			lst1.append(spectato);
			lst1.append(goNext)

		} catch(e) {
			console.log("failed to register", fn, e);
		}
	});
}


const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
/**
 * padre forgive me
 * a goofy development mode hook
 */
(async() => {
	try {
		const LOCAL_DEV_URL = `http://localhost:8000/index.js`;
		const controller = new AbortController();
		const id = setTimeout(() => controller.abort(), 750);
		const r = await fetch(LOCAL_DEV_URL, {
			method:'HEAD',
			signal: controller.signal,
		});
		clearTimeout(id);
		if (r.ok) {
			// make sure to load dev env only once
			if(!window.devel) {
				window.devel = true;

				/**
				 * Prevent a race... we need to ensure
				 * deps are fully loaded
				 */
				while (!('$' in window) && !('mw' in window)) {
					console.warn("Race detected... deferring init until after jQuery is loaded");
					await sleep(500);
				}

				mw.notify("🚀 loaded local build: " + new Date());

				const {app: localApp} = await import(`${LOCAL_DEV_URL}`);
				localApp();
			}
		} else {
			throw new Exception(`Loading from production`)
		}
	} catch(e) {
		app();
	}
})();
