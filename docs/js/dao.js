const stationListPath = './station_code.tsv';
const busListPath = './bus_code_tsv';
const dbVersion = 2;

/**
 * @typedef StationRecord
 * @prop {number} area
 * @prop {number} code
 * @prop {string} name
 * @prop {string} note
 */
/**
 * @typedef BusRecord
 * @prop {number} code
 * @prop {string} name
 */

class Database {
	/** @type {IDBDatabase} */
	db;
	/**
	 * @param {number} version Database version
	 * @returns {Promise<Database>}
	 */
	open(version) {
		const req = indexedDB.open('felicasfviewer', version);
		return new Promise((resolve, reject) => {
			req.onerror = () => {
				reject('Error occured when opening Station DB.');
			};
			req.onupgradeneeded = () => {
				this.initialize(req.result);
			};
			req.onsuccess = () => {
				this.db = req.result;
				resolve(this);
			};
		});
	}

	/**
	 * @param {IDBDatabase} [db] 
	 * @returns {Promise<>}
	 */
	async initialize(db = this.db) {
		db.createObjectStore('station', { keyPath: ['area', 'code'] });
		db.createObjectStore('bus', { keyPath: ['code'] });
		const tx = db.transaction(['station', 'bus'], 'readwrite');
		fetch(stationListPath).then(res => res.text()).then(text => {
			const store = tx.objectStore('station');
			const lines = text.split('\n');
			for (const ln of lines) {
				const [areaStr, codeStr, name, note] = ln.split('\t');
				const [area, code] = [areaStr, codeStr].map(s => Number.parseInt(s, 16));
				if (code) {
					/** @type {StationRecord} */
					const record = { area, code, name, note };
					store.put(record);
				}
			}
		});
		fetch(busListPath).then(res => res.text()).then(text => {
			const store = tx.objectStore('bus');
			const lines = text.split('\n');
			for (const ln of lines) {
				const [codeStr, name] = ln.split('\t');
				const code = Number.parseInt(codeStr, 16);
				if (code) {
					/** @type {BusRecord} */
					const record = { code, name };
					store.put(record);
				}
			}
		});
	}

	/**
	 * @overload
	 * @param {number[]} key 
	 * @param {'station'} storeName 
	 * @returns {Promise<StationRecord>}
	 */
	/**
	 * @overload
	 * @param {number} key 
	 * @param {'bus'} storeName 
	 * @returns {Promise<BusRecord>}
	 */
	/**
	 * @param {*} key
	 * @param {string} storeName
	 * @returns {Promise}
	 */
	fetch(key, storeName) {
		const store = this.transaction(storeName).objectStore(storeName);
		return new Promise((resolve, reject) => {
			const req = store.get(key);
			req.onerror = () => { reject(key); };
			req.onsuccess = () => { resolve(req.result); };
		});
	}

	/**
	 * @param {string | string[]} storeNames 
	 * @param {'readonly' | 'readwrite'} [mode] 
	 */
	transaction(storeNames, mode = 'readonly') {
		return this.db.transaction(storeNames, mode);
	}
}

/**
 * @param {Database} db 
 */
const onDatabaseOpen = db => {
	/** @type {NodeListOf<HTMLSpanElement>} */
	const staSpans = document.querySelectorAll('[data-area-id][data-station-id]');
	for (const span of staSpans) {
		const { areaId, stationId } = span.dataset;
		if (areaId && stationId) {
			const key = [areaId, stationId].map(v => Number.parseInt(v));
			db.fetch(key, 'station').then(r => {
				if (!r) return;
				else if (r.note && r.note[0] === '2') {
					const timeElm = span.closest('tr')?.querySelector('time');
					const time = timeElm ? timeElm.dateTime || timeElm.textContent : null;
					if (time) {
						const [prevDate, prevName] = r.note.split('/');
						if (Date.parse(time) <= Date.parse(prevDate)) {
							span.textContent = prevName;
							return;
						}
					}
				}
				span.textContent = r.name;
			});
		}
	}
	/** @type {NodeListOf<HTMLSpanElement>} */
	const busSpans = document.querySelectorAll('[data-bus-line]');
	for (const span of busSpans) {
		const line = span.dataset.busLine;
		if (line) {
			db.fetch(Number.parseInt(line), 'bus').then(r => {
				if (!r) return;
				span.textContent = r.name;
			});
		}
	}
}

const db = new Database();
const observer = new MutationObserver(records => {
	const req = db.open(dbVersion);
	for (const r of records) {
		const isSuica = r.attributeName === 'data-type'
			&& /** @type {HTMLElement} */ (r.target).dataset.type === 'suica';
		if (isSuica) req.then(onDatabaseOpen);
	}
});

observer.observe(document.body, { attributes: true, attributeFilter: ['data-type'] });