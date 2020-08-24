/* eslint-disable no-plusplus */

const charset = '0123456789abcdefghijklmnopqrstuvwxyz';
const numberBase = [];
// 0-9 convert
for (let c = '0'.charCodeAt(0), v = 0; v <= 9; ++v) {
    numberBase[c++] = v;
}
// a-z convert
for (let c = 'a'.charCodeAt(0), v = 0; v < 26; ++v) {
    numberBase[c++] = v + 10;
}
// A-Z convert
for (let c = 'A'.charCodeAt(0), v = 0; v < 26; ++v) {
    numberBase[c++] = v + 10;
}

/**
 * @param {string} hex
 * @param {number} index
 */
export function intAt(hex, index) {
    const number = numberBase[hex.charCodeAt(index)];
    return number === undefined ? -1 : number;
}

export function int2char(number) {
    return charset.charAt(number);
}
