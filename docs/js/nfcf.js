import { Base64 } from './utils.js';
import { RequestPacketBuilder, ResponsePacket } from './packet.js';

/**
 * @typedef NfcF
 * @prop {(bytes: string) => string} transceive
 */

export class NfcFTransceiver {
	/** @type {NfcF?} */
	native;
	/** @type {Uint8Array} */
	IDm;

	/**
	 * @param {NfcF} native Native NFC-F inteface
	 * @param {string} idm Base64-encoded byte array
	 */
	constructor(native, idm) {
		this.native = native;
		this.IDm = Base64.decode(idm);
	}

	/**
	 * 
	 * @param {number} [offset] 
	 * @returns Next IDm
	 */
	nextIDm(offset = 1) {
		const subarray = this.IDm.subarray();
		subarray[0] += offset * 16;
		return subarray;
	}

	/**
	 * @param {RequestPacketBuilder} request Request
	 * @returns {ResponsePacket?} Response
	 */
	transceive(request) {
		const encoded = Base64.encode(request.compile());
		const response = this.native?.transceive(encoded);
		return response ? new ResponsePacket(Base64.decode(response)) : null;
	}

	/**
	 * 
	 * @param {RequestPacketBuilder[]} requests 
	 */
	joinTransceiving(requests) {
		/** @type {Uint8Array[]} */
		const container = [];
		const offsets = [ 0 ];

		for (const req of requests) {
			const res = this.transceive(req);
			if (res && res.status2 === 0) {
				const subarray = res.stream.subarray(13, res.size);
				container.push(subarray);
				offsets.push(subarray.length);
			}
		}
		const output = new Uint8Array(offsets.reduce((a, c) => a + c, 0));
		for (let i = 0; i < container.length; i++) {
			output.set(container[i], offsets[i]);
		}
		return output;
	}
}