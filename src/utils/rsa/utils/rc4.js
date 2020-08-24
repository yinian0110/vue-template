/* eslint-disable no-bitwise */

// An array of bytes the size of the pool will be passed to init()
export const POOL_SIZE = 256;

// RC4 cipher
export default class RC4 {
    /**
     * @param {number[]} key
     */
    constructor(key) {
        /**
         * @private
         * @type {number}
         */
        this.i = 0;
        /**
         * @private
         * @type {number}
         */
        this.j = 0;
        /**
         * @private
         * @type {number[]}
         */
        this.s = [...Array(POOL_SIZE).keys()];

        let j = 0;
        this.s.forEach((value, index) => {
            j = (j + value + key[index % key.length]) & 0xff;
            [this.s[index], this.s[j]] = [this.s[j], this.s[index]];
        });
    }

    /**
     * @public
     * @return {number}
     */
    next() {
        this.i = (this.i + 1) & 0xff;
        this.j = (this.j + this.s[this.i]) & 0xff;

        [this.s[this.i], this.s[this.j]] = [this.s[this.j], this.s[this.i]];
        return this.s[(this.s[this.i] + this.s[this.j]) & 0xff];
    }
}
