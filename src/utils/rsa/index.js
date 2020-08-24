/* eslint-disable no-plusplus,no-continue,no-bitwise,no-const-assign */
import ASN1 from './asn1/asn1';
import Base64 from './utils/base64';
import RSAKey from './rsa/rsa';
import { bytesLength, subBytes } from './utils/utils';

export default class Encryption {
    /**
     * @public
     * @param {string} pem
     */
    constructor(pem) {
        /**
         * @private
         * @type {RSAKey}
         */
        this.publicKey = new RSAKey();

        this.parsePublicKey(pem);
    }

    /**
     * @public
     * @param {string} text
     * @return {string}
     */
    encrypt(text) {
        return Base64.hex2b64(this.publicKey.encrypt(text));
    }

    /**
     * @param {string} text
     * @param {string} glue
     * @return {string}
     */
    encryptWithAutoSplit(text, glue = '.') {
        const maxMessageUnitLength = this.publicKey.maxMessageLength;
        if (bytesLength(text) <= maxMessageUnitLength) {
            return this.encrypt(text);
        }

        let string = text;
        const segments = [];
        while (bytesLength(string) > maxMessageUnitLength) {
            const sub = subBytes(string, maxMessageUnitLength);
            segments.push(string.substr(0, sub.length));
            string = string.substr(sub.length);
        }
        segments.push(string);
        return segments.map(s => this.encrypt(s)).join(glue);
    }

    /**
     * @private
     * @param {string} pem
     */
    parsePublicKey(pem) {
        const der = Base64.decode(pem);
        const asn1 = ASN1.decode(der);

        const bitString = asn1.sub[1];
        const sequence = bitString.sub[0];

        const modulus = sequence.sub[0].getHexStringValue();
        const publicExponent = sequence.sub[1].getHexStringValue();
        this.publicKey.setPublicKey(modulus, publicExponent);
    }
}
