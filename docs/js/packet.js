import { bytesToHexString } from './utils.js';

export class RequestPacketBuilder {
	stream = new Uint8Array(0xff);
	index = 0;

	/**
	 * @param {number} commandCode 
	 * @param {Uint8Array} idm 
	 */
	constructor(commandCode, idm) {
		this.write(0, commandCode, ...idm);
	}

	/**
	 * @param {number[]} bytes 
	 */
	write(...bytes) {
		for (const b of bytes) {
			this.stream[this.index++] = b;
		}
	}

	/**
	 * @param {number} blockNumber 
	 * @param {number} serviceCodeListOrder 
	 * @param {number} accessMode 
	 */
	writeBlockListElement(blockNumber, serviceCodeListOrder, accessMode = 0) {
		const shortFlag = blockNumber <= 0xff ? 1 : 0;
		const meta = (shortFlag << 7) + ((accessMode & 0b111) << 4) + (serviceCodeListOrder & 0b1111);
		this.write(meta, blockNumber & 0x00ff);
		if (!shortFlag) this.write((blockNumber & 0xff00) >>> 8);
	}

	/**
	 * @returns Command packet (ByteArray)
	 */
	compile() {
		this.stream[0] = this.index;
		return this.stream.subarray(0, this.index);
	}
}

export class ResponsePacket {
	/** @type {Uint8Array} */
	stream;
	/** @type {number} */
	size;
	/** @type {number} */
	responseCode;
	/** @type {Uint8Array} */
	idm;
	/** @type {number} */
	status1;
	/** @type {number} */
	status2;

	/**
	 * @param {Uint8Array} response 
	 */
	constructor(response) {
		this.stream = response;
		this.size = response[0];
		this.responseCode = response[1];
		this.idm = response.subarray(2, 10);
		this.status1 = response[10];
		this.status2 = response[11];
	}

	/**
	 * @returns System codes
	 */
	getSystemCodes() {
		/** @type {number[]} */
		const codes = [];
		if (this.responseCode !== 0x0d) return codes;
		for (let i = 11; i < this.size; i += 2) {
			codes.push((this.stream[i] << 8) + this.stream[i + 1]);
		}
		return codes;
	}
	
	/**
	 * @returns Data blocks
	 */
	getDataBlocks() {
		/** @type {Uint8Array[]} */
		const blocks = [];
		if (this.responseCode !== 0x07) return blocks;
		for (let i = 13; i < this.size; i += 16) {
			blocks.push(this.stream.subarray(i, i + 16));
		}
		return blocks;
	}
}

class System {
	/** @type {number} */
	code;
	/** @type {number} */
	idm;
}

/**
 * @param {Uint8Array} idm 
 * @param { { code: number, block: number }[] } services 
 */
export function createServiceReadPackets(idm, services) {
	const lists = {
		/** @type {number[][]} */
		num: [ [] ],
		/** @type {number[][]} */
		code: [ [] ],
		/** @type {number[][]} */
		offset: [ [] ],
		/**
		 * @param {number} num 
		 * @param {number} code 
		 * @param {number} offset 
		 */
		pushToLast(num, code, offset) {
			this.num[this.num.length - 1].push(num);
			this.code[this.code.length - 1].push(code);
			this.offset[this.offset.length - 1].push(offset);
		},
		/**
		 * @param {number} num 
		 * @param {number} code 
		 * @param {number} offset 
		 */
		pushNew(num, code, offset) {
			this.num.push([ num ]);
			this.code.push([ code ]);
			this.offset.push([ offset ]);
		},
	};
	
	for (const { code, block: n } of services) {
		const sumOfLast = lists.num[lists.num.length - 1].reduce((a, c) => a + c, 0);
		const lastRem = 15 - sumOfLast;
		if (n <= lastRem && lists.num.length < 15) {
			lists.pushToLast(n, code, 0);
		} else {
			const div = Math.floor((n - lastRem) / 15);
			const rem = (n - lastRem) % 15;
			if (lastRem !== 0) lists.pushToLast(lastRem, code, 0);
			for (let j = 0; j < div; j++) lists.pushNew(15, code, lastRem + j * 15);
			if (rem !== 0) lists.pushNew(rem, code, lastRem + div * 15);
		}
	}

	const packets = [];
	for (let i = 0; i < lists.num.length; i++) {
		const size = lists.num[i].length;
		const sum = lists.num[i].reduce((a, c) => a + c, 0);
		const p = new RequestPacketBuilder(0x06, idm);
		p.write(size, ...lists.code[i].flatMap(c => [ c & 0x00ff, (c & 0xff00) >>> 8 ]), sum);
		for (let j = 0; j < size; j++) {
			let index = lists.offset[i][j];
			for (let k = 0; k < lists.num[i][j]; k++) {
				p.writeBlockListElement(index++, j);
			}
		}
		console.log(bytesToHexString(p.compile(), ':'));
		packets.push(p);
	}
	return packets;
}