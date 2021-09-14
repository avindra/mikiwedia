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


/**
 * 
 * @param {number} num 
 */
function formatMS(num) {
	const MINUTE = 1200000;
	if (num > MINUTE) {
		return Math.round(num / MINUTE) + ' mins';
	}

	return num + 'ms';
}

/**
 * 
 * @param {number} i24 
 */
function i12(i24) {
	let t = i24;
	if (t > 12) {
		t -= 12;
	}
	return t;
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
		} catch(e) {
			console.log("failed to register", fn, e);
		}
	});

	const MENU_MOBILE = document.getElementsByTagName('nav')[1];

	const btn = document.createElement('a');
	const setTime = () => {
		btn.textContent = `🕑 ${getTime()}`;
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

	const lst1 = MENU_MOBILE || document.querySelector("nav#p-tb ul");

	const ptr = document.createElement('li');
	ptr.append(btn);

	lst1.append(ptr);



	const btn2 = document.createElement('a');
	btn2.href = '/wiki/Special:Upload';
	btn2.textContent = '⬆ 🆙️';

	const lst2 = MENU_MOBILE || document.querySelector("nav#p-participate ul");

	const ptr2 = document.createElement('li');
	ptr2.append(btn2);

	lst2.append(ptr2);

	/**
	 * adjust as necessary
	 *
	 * The _apparent_ baseline, based on the
	 * state of examples in Commons as per
	 * Sept 2021
	 */
	const baseline = [
		"00:00", "01:05","02:11", "03:16", "04:22","05:27",
		"06:33", "07:38", "08:43","09:50", "10:55","12:00"
	];

	/** 
	 * baseline of:
	 * Category:White_clock_with_yellow_numbers_(5_min_interval_set)
	 */
	const baseline0 = [
		"00:00", "01:05", "02:10", "03:15", "04:20", "05:25",
		"06:30", "07:35", "08:40", "09:45", "10:50", "11:55"
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
				+TZ_OFFSET
			)
		)).flat().sort((a,b)=>b-a);
	
	const deltas = allTimes.map(moment => {
		const diff = moment - now;
		return diff;
	});

	let i24 = deltas.reduce((prevIndex, curr, i) => {
		// excl. past events
		if (allTimes[i] < now) {
			return prevIndex;
		}

		const prev = prevIndex === -1 ? Number.MAX_VALUE : deltas[prevIndex];
		if (curr > 0 && curr < prev) {
			return i;
		} 
		return prevIndex;
	}, -1);


	if (i24 === -1) {
		i24 = 0;
	}

	i24 -= 1;

	/***
	 * sometimes you need a +1 or -1 🤷🤷
	 *
	 * @param {boolean} Up or down
	 */
	function makeShifter(way) {
		const f = document.createElement('button');
		f.textContent = way ? `>` : '<';
		f.onclick = () => {
			way ? i24++ : i24--;
			spectate();
		};
		return f;
	}

	const goBack = makeShifter();
	const goNext = makeShifter(true);


	console.log("🌌 ⌛", i24, baseline);
	console.log("⌛ 🌌", projections, allTimes, deltas);


	const spectato = document.createElement('a');

	function spectate() {
		const txtNextEvent = baseline[i12(i24)];
		const msToNextEvent = deltas[i24];

		spectato.href = `/wiki/Category:Time ${txtNextEvent}`;
		spectato.textContent = `⌚ ${txtNextEvent} (in ${formatMS(msToNextEvent)})`;
	}
	spectate();

	lst1.append(goBack)
	lst1.append(spectato);
	lst1.append(goNext)
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
