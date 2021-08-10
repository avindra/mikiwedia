/**
 * @param {string} file Filename
 * @param {any} info wgPageViewInfo from RLCONF JSON
 * 
 * @see https://github.com/wikimedia/mediawiki-extensions-PageViewInfo/blob/master/resources/ext.pageviewinfo.js
 */
const plotGraph = (file, info) => {
	let dialog, windowManager;
	function MyProcessDialog( config ) {
		MyProcessDialog.parent.call( this, config );
	}
	OO.inheritClass( MyProcessDialog, OO.ui.ProcessDialog );

	MyProcessDialog.static.title = file + ' || ' + mw.msg( 'pvi-range', info.start, info.end );
	MyProcessDialog.static.name = 'PageViewInfo';
	MyProcessDialog.static.actions = [
		{ label: mw.msg( 'pvi-close' ), flags: 'safe' }
	];

	MyProcessDialog.prototype.initialize = function () {
		MyProcessDialog.parent.prototype.initialize.apply( this, arguments );
		this.content = new OO.ui.PanelLayout( { padded: true, expanded: false } );
		this.$body.append( this.content.$element );
		mw.drawVegaGraph( this.content.$element[ 0 ], info.graph );
	};
	MyProcessDialog.prototype.getActionProcess = function ( action ) {
		const diag = this;
		if ( action ) {
			return new OO.ui.Process(function() {
				diag.close({ action: action });
			});
		}
		return MyProcessDialog.parent.prototype.getActionProcess.call( this, action );
	};

	windowManager = new OO.ui.WindowManager();
	$('body').append( windowManager.$element );

	dialog = new MyProcessDialog( { size: 'large' } );
	windowManager.addWindows( [ dialog ] );
	windowManager.openWindow( dialog );
}

/**
 * @see https://davidwalsh.name/javascript-debounce-function
 * 
 * @param {Function} func 
 * @param {number} wait 
 * @returns {Function} debounced version of the function
 */
function debounce(func, wait) {
	let timeout;
	return function() {
		const context = this, args = arguments;
		const later = function() {
			timeout = null;
			func.apply(context, args);
		};
		if (!timeout) {
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
		}
	};
};

/**
 * Quickly check file view analytics by mousing
 * over titles
 */
export const register = () => {
	const isWikidata = location.host === 'www.wikidata.org';

	/**
	 * 
	 * @param {Event} event 
	 * @returns 
	 */
	const onLookup = async (event) => {
		const node = event.currentTarget;
		/**
		 * wikidata href value -> https://example.com/wiki/Q1337
		 */
		const mwFile = isWikidata ? node.href.match(/\/wiki\/(.+)/)[1] : node.title;
		const response = await fetch(`/w/index.php?title=${mwFile}&action=info`);
		const txt = await response.text();


		/**
		 * Load graphics modules
		 */
		if (!('drawVegaGraph' in mw)) {
			await mw.loader.using("ext.pageviewinfo");
		}

		/**
		 * Scrape raw RLCONF, which contains the data
		 */
		const RLCONF = txt.match(/RLCONF=([\s\S]+);RLSTATE=/);
		if (RLCONF) {
			const conf = JSON.parse(RLCONF[1].replace(/\!0/g,'true').replace(/\!1/g,'false'));
			const data = conf.wgPageViewInfo;
			console.log('d', data);
			const hasNoData = data.graph.data[0].values.every(sample => !sample.views);
			if (hasNoData) {
				mw.notify(`No data for ${mwFile}`);
			} else {
				plotGraph(mwFile, data);
			}
		}
	};

	const pageInfo = document.getElementById('t-info');
	if (pageInfo) {
		const A = document.createElement('a');
		A.textContent = 'Page views';
		A.title = mw.config.get('wgPageName');
		A.onclick = onLookup.bind(A);

		pageInfo.parentNode.appendChild(A);
	}

	const slowLookup = debounce(onLookup, 1200);

	$(".mw-contributions-title").mouseover(slowLookup);
	$(".mw-category-generated").on("mouseover", ".gallerybox .gallerytext a", slowLookup);
}
