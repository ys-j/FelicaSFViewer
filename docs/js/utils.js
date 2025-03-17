export const Base64 = {
	/**
	 * Convert base64 string to bytearray.
	 * @param {string} base64 data
	 * @returns {Uint8Array} blob
	 */
	decode(base64) {
		return Uint8Array.from(atob(base64), s => s.charCodeAt(0));
	},

	/**
	 * Convert bytearray to base64 string.
	 * @param {Uint8Array} bytes bytearray
	 * @returns base64 string
	 */
	encode(bytes) {
		return btoa(String.fromCharCode.apply(null, bytes));
	},
};

/**
 * Convert bytes to hex string.
 * @param {Uint8Array} bytes 
 * @param {string} [separator] 
 */
export function bytesToHexString(bytes, separator = '') {
	return Array.from(bytes, v => v.toString(16).padStart(2, '0')).join(separator);
}

/**
 * Convert bytes to integer.
 * @param {Uint8Array} bytes 
 * @param {boolean} isBigEndian 
 * @returns Integer
 */
export function bytesToInt(bytes, isBigEndian = false) {
	let result = 0;
	if (isBigEndian) bytes = bytes.reverse();
	for (let i = 0; i < bytes.length; i++) {
		result += bytes[i] << 8 * i;
	}
	return result;
}

/**
 * Cut string into several pieces.
 * @param {string} str Original string
 * @param {number} n Size of one chunk
 * @returns Array of chunked string
 */
export function chunk(str, n) {
	const arr = [];
	for (let i = 0; i < str.length; i += n) {
		arr.push(str.slice(i, i + n));
	}
	return arr;
}