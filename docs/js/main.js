import { NfcFTransceiver } from './nfcf.js';
import { RequestPacketBuilder, createServiceReadPackets } from './packet.js';
import { SuicaEntity, SuicaShopLog, SuicaBusLog, SuicaTrainLog, EdyEntity, WaonEntity, NanacoEntity } from './entity.js';
import l10nMap from './l10n_map.js';

/**
 * @typedef NfcF
 * @prop {(bytes: string) => string} transceive
 */

const l10n = navigator.language.startsWith('ja') ? l10nMap.ja : l10nMap.default;

const $card = /** @type {HTMLDivElement} */ (document.querySelector('#card'));
const $table = /** @type {HTMLTableElement} */ (document.querySelector('#log'));
$card.innerHTML = `<p>${l10n.get('msg_tap_card')}</p>`;

document.documentElement.lang = navigator.language;

window.addEventListener('message', onTagDiscovered, { passive: true });

/**
 * On tag discovered, transceive data.
 * @param {MessageEvent<string>} e message event which has data of base64-encoded tag id
 * @returns None
 */
function onTagDiscovered(e) {
	// @ts-ignore
	if (!NfcF) return;
	// @ts-ignore
	const nfc = new NfcFTransceiver(NfcF, e.data);
	
	const req = new RequestPacketBuilder(0x0c, nfc.IDm);
	const res = nfc.transceive(req);
	if (res) {
		const systemCodes = res.getSystemCodes();
		switch (systemCodes[0]) {
			case 0x0003: {
				// Suica/PASMO/交通系IC
				const reqs = createServiceReadPackets(nfc.IDm, [
					{ code: 0x090f, block: 20 },
				]);
				const res = nfc.joinTransceiving(reqs);
				renderSuicaView(res);
				return;
			}
			case 0x80e6: {
				// Edy
				const reqs = createServiceReadPackets(nfc.nextIDm(), [
					{ code: 0x110b, block: 2 },
					{ code: 0x1317, block: 1 },
					{ code: 0x170f, block: 6 },
				]);
				const res = nfc.joinTransceiving(reqs);
				renderEdyView(res);
				return;
			}
			case 0x852b: {
				// WAON
				const reqs = createServiceReadPackets(nfc.nextIDm(), [
					{ code: 0x684f, block: 2 },
					{ code: 0x6817, block: 1 },
					{ code: 0x684b, block: 3 },
					{ code: 0x680b, block: 6 },
				]);
				const res = nfc.joinTransceiving(reqs);
				renderWaonView(res);
				return;
			}
			case 0x8b61: {
				// nanaco
				const reqs = createServiceReadPackets(nfc.nextIDm(), [
					{ code: 0x558b, block: 2 },
					{ code: 0x5597, block: 1 },
					{ code: 0x564f, block: 5 },
				]);
				const res = nfc.joinTransceiving(reqs);
				renderNanacoView(res);
				return;
			}
		}
	}

	// Default
	delete document.body.dataset.type;
	$card.innerHTML = `<p>${l10n.get('msg_failed')}</p>`;
	$table.innerHTML = '';
}

/**
 * Render view of Suica/PASOM/交通系IC.
 * @param {Uint8Array} data 
 */
function renderSuicaView(data) {
	const { type, label, value, logs } = new SuicaEntity(data);

	document.body.dataset.type = type;
	$table.innerHTML = '';
	$card.innerHTML = `<h1>${label}</h1>`
		+ `<hr><span class="value yen">${value}</span>`;

	const $thead = $table.createTHead();
	$thead.innerHTML = `<tr><th>${l10n.get('datetime')}<!-- <th>${l10n.get('device_type')} --><th>${l10n.get('value')}<th>${l10n.get('details')}</tr>`;
	const $tbody = $table.createTBody();
	for (const r of logs) {
		const $tr = $tbody.insertRow();
		const isShop = r instanceof SuicaShopLog;
		const processType = r.processTypeId.toString(16).padStart(2, '0');
		let html = `<td><time>${dfmt.call(r.date, isShop, isShop)}</time>`
			+ `<!-- <td>${l10n.get(type + '-device_type-' + r.deviceTypeId) || r.deviceTypeId} -->`
			+ `<td><span class=yen><span>${r.value.toLocaleString()}</span></span>`
			+ `<td class=l>${l10n.get(type + '-process_type-' + processType) || processType}`;
		if (r instanceof SuicaTrainLog) {
			const departureId = (r.departure.area << 17) + r.departure.station;
			const departure = departureId
				? `<span data-area-id=${r.departure.area} data-station-id=${r.departure.station}>${departureId.toString(16).padStart(5, '0')}</span>`
				: '';
			const arrivalId = (r.arrival.area << 17) + r.arrival.station;
			const arrival = arrivalId
				? `<span data-area-id=${r.arrival.area} data-station-id=${r.arrival.station}>${arrivalId.toString(16).padStart(5, '0')}</span>`
				: '';
			html += '<span class=station-note>' + departure + arrival + '</span>';
		} else if (r instanceof SuicaBusLog) {
			html += `（）`;
		}
		$tr.innerHTML = html;
	}
}

/**
 * Render view of Edy.
 * @param {Uint8Array} data 
 */
function renderEdyView(data) {
	const { type, label, id, publishedDate, value, logs } = new EdyEntity(data);

	document.body.dataset.type = type;
	$table.innerHTML = '';
	$card.innerHTML = `<h1>${label}</h1>`
		+ `<span class=id>${l10n.get(type + '-id')}: ${id}</span>`
		+ `<span class=date>${l10n.get('published_date')}: ${dfmt.call(publishedDate)}</span>`
		+ `<hr><span class="value yen">${value.toLocaleString()}</span>`;
	
	logs.sort(sorter);
	const $thead = $table.createTHead();
	$thead.innerHTML = `<tr><th>${l10n.get('datetime')}<th>${l10n.get('process_type')}<th>${l10n.get('value')}<th>${l10n.get('delta')}</tr>`;
	const $tbody = $table.createTBody();
	for (const r of logs) {
		const $tr = $tbody.insertRow();
		const processType = r.processTypeId.toString(16).padStart(2, '0');
		$tr.innerHTML = `<td><time>${dfmt.call(r.datetime, true, true)}</time>`
			+ `<td>${l10n.get(type + '-process_type-' + processType) || processType}`
			+ `<td><span class=yen><span>${r.value.toLocaleString()}</span></span>`
			+ (r.delta ? `<td><span class=yen><span>${r.delta.toLocaleString()}</span></span>` : '<td>');
	}
}

/**
 * Render view of WAON.
 * @param {Uint8Array} data 
 */
function renderWaonView(data) {
	const { type, label, id, points, value, logs } = new WaonEntity(data);

	document.body.dataset.type = type;
	$table.innerHTML = '';
	$card.innerHTML = `<h1>${label}</h1>`
		+ `<span class=id>${l10n.get(type + '-id')}: ${id}</span>`
		+ `<span class=points>${l10n.get('waon-points')}: ${points.toLocaleString()} pt</span>`
		+ `<hr><span class="value yen">${value.toLocaleString()}</span>`;

	logs.sort(sorter);
	const $thead = $table.createTHead();
	$thead.innerHTML = `<tr><th>${l10n.get('datetime')}<th>${l10n.get('process_type')}<th>${l10n.get('value')}<th>${l10n.get('outgo')}<th>${l10n.get('income')}</tr>`;
	const $tbody = $table.createTBody();
	for (const r of logs) {
		const $tr = $tbody.insertRow();
		const processType = r.processTypeId.toString(16).padStart(2, '0');
		$tr.innerHTML = `<td><time>${dfmt.call(r.datetime, true)}</time>`
			+ `<td>${l10n.get(type + '-process_type-' + processType) || processType}`
			+ `<td><span class=yen><span>${r.value.toLocaleString()}</span></span>`
			+ (r.outgo ? `<td><span class=yen><span>${r.outgo.toLocaleString()}</span></span>` : '<td>')
			+ (r.income ? `<td><span class=yen><span>${r.income.toLocaleString()}</span></span>`: '<td>');
	}
}

/**
 * 
 * @param {Uint8Array} data 
 */
function renderNanacoView(data) {
	const { type, label, id, publishedDate, value, logs } = new NanacoEntity(data);

	document.body.dataset.type = type;
	$table.innerHTML = '';
	$card.innerHTML = `<h1>${label}</h1>`
		+ `<span class=id>${l10n.get(type + '-id')}: ${id}</span>`
		+ `<span class=date>${l10n.get('published_date')}: ${dfmt.call(publishedDate)}</span>`
		+ `<hr><span class="value yen">${value.toLocaleString()}</span>`;

	logs.sort(sorter);
	const $thead = $table.createTHead();
	$thead.innerHTML = `<tr><th>${l10n.get('datetime')}<th>${l10n.get('process_type')}<th>${l10n.get('value')}<th>${l10n.get('delta')}</tr>`;
	const $tbody = $table.createTBody();
	for (const r of logs) {
		const $tr = $tbody.insertRow();
		const processType = r.processTypeId.toString(16).padStart(2, '0');
		$tr.innerHTML = `<td><time>${dfmt.call(r.datetime, true)}</time>`
			+ `<td>${l10n.get(type + '-process_type-' + processType) || processType}`
			+ `<td><span class=yen><span>${r.value.toLocaleString()}</span></span>`
			+ (r.delta ? `<td><span class=yen><span>${r.delta.toLocaleString()}</span></span>` : '<td>');
	}
}

/**
 * Sort by datetime and value.
 * @param { { datetime: Date, value: number } } a Object which has `datetime` and `value` properties.
 * @param { { datetime: Date, value: number } } b Object which has `datetime` and `value` properties.
 * @returns Order difference
 */
function sorter(a, b) {
	return b.datetime.valueOf() - a.datetime.valueOf() || a.value - b.value;
}

/**
 * Format date as ISO style.
 * @this {Date} Date object
 * @param {boolean} [time] Whether to display to minutes: `Thh:mm`.
 * @param {boolean} [second] Whether to display to seconds: `:ss`
 */
function dfmt(time = false, second = false) {
	/** @param {number} n */
	const $ = n => n.toString().padStart(2, '0');
	return `${this.getFullYear()}-${$(this.getMonth() + 1)}-${$(this.getDate())}`
		+ (time ? `T${$(this.getHours())}:${$(this.getMinutes())}` + (second ? `:${$(this.getSeconds())}` : ''): '');
}