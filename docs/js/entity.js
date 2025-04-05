import { bytesToHexString, bytesToInt, chunk } from './utils.js';

class Entity {
	/**
	 * @param {string} label
	 * @param {string} [type] 
	 */
	constructor(label, type = label.toLowerCase()) {
		this.label = label;
		this.type = type;
	}
}

export class SuicaEntity extends Entity {
	value = 0;
	/** @type {SuicaLog[]} */
	logs = [];

	/**
	 * @param {Uint8Array} bytes 
	 */
	constructor(bytes) {
		super('交通系IC', 'suica');
		for (let i = 0; i < 20; i++) {
			const subarray = bytes.subarray(i * 16, (i + 1) * 16);
			const processTypeId = bytes[i * 16 + 1];
			switch (processTypeId) {
				case 0x00:
					break;
				case 0x46:
				case 0x49:
				case 0x4a:
				case 0x4b:
				case 0xc6:
				case 0xcb:
					this.logs.push(new SuicaShopLog(subarray));
					break;
				case 0x0d:
				case 0x0f:
				case 0x1f:
				case 0x23:
					this.logs.push(new SuicaBusLog(subarray));
					break;
				default:
					this.logs.push(new SuicaTrainLog(subarray));
			}
		}
		this.value = this.logs[0] ? this.logs[0].value : 0;
	}
}
class SuicaLog {
	deviceTypeId;
	processTypeId;
	processWithCache;
	wicket;
	date;
	value;
	processSeqId;

	/**
	 * @param {Uint8Array} a 
	 */
	constructor(a) {
		this.deviceTypeId = a[0];
		this.processTypeId = a[1] & 0b01111111;
		this.processWithCache = a[1] >>> 7 === 1;
		this.wicket = a[3];
		this.date = new Date(2000 + (a[4] >>> 1), ((a[4] & 1) << 3) + (a[5] >>> 5) - 1, a[5] & 0b11111);
		this.value = (a[11] << 8) + a[10];
		this.processSeqId = (a[13] << 8) + a[14];
	}
}
export class SuicaShopLog extends SuicaLog {
	shopDeviceId;
	/**
	 * @param {Uint8Array} a 
	 */
	constructor(a) {
		super(a);
		this.date.setHours(a[6] >>> 3);
		this.date.setMinutes(((a[6] & 0b111) << 3) + a[7] >>> 5);
		this.date.setSeconds((a[7] & 0b11111) * 2);
		this.shopDeviceId = (a[8] << 8) + a[9];
	}
}
export class SuicaBusLog extends SuicaLog {
	line;
	stop;
	/**
	 * @param {Uint8Array} a 
	 */
	constructor(a) {
		super(a);
		this.line = (a[6] << 8) + a[7];
		this.stop = (a[8] << 8) + a[9];
	}
}
export class SuicaTrainLog extends SuicaLog {
	departure = { area: 0, station: 0 };
	arrival = { area: 0, station: 0 };

	/**
	 * @param {Uint8Array} a 
	 */
	constructor(a) {
		super(a);
		this.departure.area = a[15] >>> 6;
		this.departure.station = (a[6] << 8) + a[7];
		this.arrival.area = (a[15] >>> 4) & 0b11;
		this.arrival.station = (a[8] << 8) + a[9];
	}
}

/**
 * Edy entity class
 */
export class EdyEntity extends Entity {
	id;
	value;
	publishedDate = new Date(2000, 0, 1);
	/** @type { EdyLog[] } */ logs = [];

	/**
	 * @param {Uint8Array} bytes 
	 */
	constructor(bytes) {
		super('Edy');
		this.id = chunk(bytesToHexString(bytes.subarray(2, 10)), 4).join('-');
		this.publishedDate.setDate(((bytes[10] << 8) + bytes[11]) >>> 1);
		this.value = bytesToInt(bytes.subarray(32, 36));
		for (let i = 3; i < 9; i++) {
			const log = new EdyLog(bytes.subarray(i * 16, (i + 1) * 16));
			this.logs.push(log);
		}
	}
}
class EdyLog {
	processTypeId;
	processSeqId;
	datetime = new Date(2000, 0, 1);
	delta;
	value;

	/**
	 * @param {Uint8Array} a 
	 */
	constructor(a) {
		this.processTypeId = a[0];
		this.processSeqId = bytesToInt(a.subarray(1, 3), true);
		this.datetime.setDate(((a[4] << 8) + a[5]) >>> 1);
		this.datetime.setSeconds(((a[5] & 1) << 9) + (a[6] << 8) + a[7]);
		this.delta = bytesToInt(a.subarray(8, 12), true);
		this.value = bytesToInt(a.subarray(12, 16), true);
	}
}

export class WaonEntity extends Entity {
	id;
	value;
	points;
	/** @type {WaonLog[]} */ logs = [];

	/**
	 * @param {Uint8Array} bytes 
	 */
	constructor(bytes) {
		super('WAON');
		this.id = chunk(bytesToHexString(bytes.subarray(0, 8)), 4).join('-');
		this.value = bytesToInt(bytes.subarray(32, 38));
		this.points = bytesToInt(bytes.subarray(48, 50));
		for (let i = 7; i < 12; i += 2) {
			const log = new WaonLog(bytes.subarray(i * 16, (i + 1) * 16));
			this.logs.push(log);
		}
	}
}
class WaonLog {
	processTypeId;
	datetime;
	value;
	outgo;
	income;

	/**
	 * @param {Uint8Array} a 
	 */
	constructor(a) {
		this.processTypeId = a[1];
		this.datetime = new Date(
			2005 + (a[2] >>> 3),
			((a[2] & 0b111) << 1) + (a[3] >>> 7) - 1,
			(a[3] >>> 2) & 0b11111,
			((a[3] & 0b11) << 3) + (a[4] >>> 5),
			((a[4] & 0b11111) << 1) + (a[5] >>> 7)
		);
		this.value = ((a[5] & 0b1111111) << 11) + (a[6] << 3) + (a[7] >>> 5);
		this.outgo = ((a[7] & 0b11111) << 13) + (a[8] << 5) + (a[9] >>> 3);
		this.income = ((a[9] & 0b111) << 14) + (a[10] << 6) + (a[11] >>> 2);
	}
}

export class NanacoEntity extends Entity {
	id;
	publishedDate;
	value;
	/** @type {NanacoLog[]} */ logs = [];

	/**
	 * @param {Uint8Array} bytes 
	 */
	constructor(bytes) {
		super('nanaco');
		this.id = chunk(bytesToHexString(bytes.subarray(0, 8)), 4).join('-');
		this.publishedDate = new Date(2000 + (bytes[17] >>> 1), ((bytes[17] & 1) << 3) + (bytes[18] >>> 5), bytes[18] & 0b11111);
		this.value = bytesToInt(bytes.subarray(32, 36));
		for (let i = 3; i < 8; i++) {
			const log = new NanacoLog(bytes.subarray(i * 16, (i + 1) * 16));
			this.logs.push(log);
		}
	}
}
class NanacoLog {
	processTypeId;
	delta;
	value;
	datetime;

	/**
	 * @param {Uint8Array} a 
	 */
	constructor(a) {
		this.processTypeId = a[0];
		this.delta = bytesToInt(a.subarray(1, 5), true);
		this.value = bytesToInt(a.subarray(5, 9), true);
		this.datetime = new Date(
			2000 + (a[9] << 3) + (a[10] >>> 5),
			((a[10] >>> 1) & 0b1111) - 1,
			((a[10] & 1) << 4) + (a[11] >>> 4),
			((a[11] & 0b1111) << 2) + (a[12] >>> 7),
			(a[12] >>> 1) & 0b111111
		)
	}
}
