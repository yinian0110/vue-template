/* eslint-disable no-plusplus,no-param-reassign,no-bitwise */

// Bits per digit
let digitBits = 0;

// JavaScript engine analysis
const canary = 0xdeadbeefcafe;
const je = (canary & 0xffffff) === 0xefcafe;

// am: Compute w_j += (x * this_i), propagate carries,
// c is initial carry, returns final carry.
// c < 3 * dvalue, x < 2 * dvalue, this_i < dvalue
// We need to select the fastest one that works in this environment.

/**
 * am1: use a single mult and divide to get the high bits,
 * max digit bits should be 26 because
 * max internal value = 2*dvalue^2-2*dvalue (< 2^53)
 *
 * @param {BigInteger} self
 * @param {number} i
 * @param {number} x
 * @param {BigInteger} w
 * @param {number} j
 * @param {number} c
 * @param {number} n
 * @return {number}
 */
function am1(self, i, x, w, j, c, n) {
    while (--n >= 0) {
        const v = x * self.b[i++] + w.b[j] + c;
        c = Math.floor(v / 0x4000000);
        w.b[j++] = v & 0x3ffffff;
    }
    return c;
}

/**
 * am2 avoids a big mult-and-extract completely.
 * Max digit bits should be <= 30 because we do bitwise ops
 * on values up to 2*hdvalue^2-hdvalue-1 (< 2^31)
 *
 * @param {BigInteger} self
 * @param {number} i
 * @param {number} x
 * @param {BigInteger} w
 * @param {number} j
 * @param {number} c
 * @param {number} n
 * @return {number}
 */
function am2(self, i, x, w, j, c, n) {
    const xl = x & 0x7fff;
    const xh = x >> 15;

    while (--n >= 0) {
        let l = self.b[i] & 0x7fff;
        const h = self.b[i++] >> 15;
        const m = xh * l + h * xl;

        l = xl * l + ((m & 0x7fff) << 15) + w.b[j] + (c & 0x3fffffff);
        c = (l >>> 30) + (m >>> 15) + xh * h + (c >>> 30);
        w.b[j++] = l & 0x3fffffff;
    }
    return c;
}

/**
 * Alternately, set max digit bits to 28 since some
 * browsers slow down when dealing with 32-bit numbers.
 *
 * @param {BigInteger} self
 * @param {number} i
 * @param {number} x
 * @param {BigInteger} w
 * @param {number} j
 * @param {number} c
 * @param {number} n
 * @return {number}
 */
function am3(self, i, x, w, j, c, n) {
    const xl = x & 0x3fff;
    const xh = x >> 14;
    while (--n >= 0) {
        let l = self.b[i] & 0x3fff;
        const h = self.b[i++] >> 14;
        const m = xh * l + h * xl;

        l = xl * l + ((m & 0x3fff) << 14) + w.b[j] + c;
        c = (l >> 28) + (m >> 14) + xh * h;
        w.b[j++] = l & 0xfffffff;
    }
    return c;
}

// detecting bits per digit
let am = null;
if (je && navigator && navigator.appName === 'Microsoft Internet Explorer') {
    am = am2;
    digitBits = 30;
} else if (je && navigator && navigator.appName !== 'Netscape') {
    am = am1;
    digitBits = 26;
} else {
    // Mozilla/Netscape seems to prefer am3
    am = am3;
    digitBits = 28;
}

export const BITS_PER_DIGIT = digitBits;
export const DIGIT_VALUE = 1 << digitBits;
export const DIGIT_MAX = (1 << digitBits) - 1;
export const FASTEST_AM_FUNC = am;

const FLOW_POW = 52;
export const FLOW_VALUE = 2 ** FLOW_POW;
export const FLOW_1 = FLOW_POW - digitBits;
export const FLOW_2 = 2 * digitBits - FLOW_POW;
