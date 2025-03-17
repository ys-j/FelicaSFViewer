const stationListPath = './station_code.tsv';
const dbVersion = 1;

/**
 * @typedef StationRecord
 * @property {number} area
 * @property {number} code
 * @property {string} name
 * @property {string} note
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
		const res = await fetch(stationListPath);
		const text = await res.text();
		const tx = db.transaction('station', 'readwrite');
		const store = tx.objectStore('station');
		const lines = text.split('\n');
		for (const ln of lines) {
			const [areaCode, codeStr, name, note] = ln.split('\t');
			const [area, code] = [areaCode, codeStr].map(s => Number.parseInt(s, 16));
			if (code) {
				/** @type {StationRecord} */
				const record = { area, code, name, note };
				store.put(record);
			}
		}
	}

	/**
	 * @param {number[]} key 
	 * @param {IDBObjectStore} [store] 
	 * @returns {Promise<StationRecord?>}
	 */
	fetchStation(key, store = this.db.transaction('station').objectStore('station')) {
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
	const store = db.transaction('station').objectStore('station');
	/** @type {NodeListOf<HTMLSpanElement>} */
	const spans = document.querySelectorAll('[data-area-id][data-station-id]');
	for (const span of spans) {
		const { areaId, stationId } = span.dataset;
		if (areaId && stationId) {
			const key = [areaId, stationId].map(v => Number.parseInt(v));
			db.fetchStation(key, store).then(r => {
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