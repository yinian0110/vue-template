/* eslint-disable no-bitwise,no-plusplus */
// Contains only some of the parts that are useful for RSA encryption
import { isNotNull } from '../utils/utils';

const hexDigits = '0123456789ABCDEF';
const byte2hex = byte => hexDigits.charAt((byte >> 4) & 0xf) + hexDigits.charAt(byte & 0xf);

class Stream {
    constructor(enc, pos) {
        if (enc instanceof Stream) {
            this.enc = enc.enc;
            this.pos = enc.pos;
        } else {
            this.enc = enc;
            this.pos = pos;
        }
    }

    /**
     * @param {number|*} pos
     * @return {number}
     */
    get(pos) {
        const validPos = isNotNull(pos) ? pos : this.pos++;
        if (validPos >= this.enc.length) {
            throw new Error(`Requesting byte offset ${pos} on a stream of length ${this.enc.length}`);
        }
        return typeof this.enc === 'string' ? this.enc.charCodeAt(validPos) : this.enc[validPos];
    }

    /**
     * @param {number} start
     * @param {number} end
     */
    toHexString(start, end) {
        let hex = '';
        for (let i = start; i < end; ++i) {
            hex += byte2hex(this.get(i));
        }
        return hex;
    }
}

class ASN1Tag {
    constructor(stream) {
        const buf = stream.get();
        this.tagClass = buf >> 6;
        this.tagConstructed = (buf & 0x20) !== 0;
        this.tagNumber = buf & 0x1f;
    }

    /**
     * @return {boolean}
     */
    isUniversal() {
        return this.tagClass === 0;
    }

    /**
     * @return {boolean}
     */
    isBitString() {
        return this.tagNumber === 0x03;
    }

    /**
     * @return {boolean}
     */
    isOctetString() {
        return this.tagNumber === 0x04;
    }
}

// DER structure of PublicKey
//
// RSAPublicKey ::= SEQUENCE {
//     modulus           INTEGER,  -- n
//     publicExponent    INTEGER   -- e
// }
export default class ASN1 {
    /**
     * @param {Stream} stream
     * @param {number} header
     * @param {number} length
     * @param {ASN1Tag} tag
     * @param {ASN1[]|null} sub
     */
    constructor(stream, header, length, tag, sub) {
        this.stream = stream;
        this.header = header;
        this.length = length;
        this.tag = tag;
        this.sub = sub;
    }

    /**
     * @return {string}
     */
    getHexStringValue() {
        const hexString = this.toHexString();
        const offset = this.header * 2; // byte2hex after
        const length = this.length * 2; // byte2hex after
        return hexString.substr(offset, length);
    }

    /**
     * @returns {number}
     */
    get streamStart() {
        return this.stream.pos;
    }

    /**
     * @returns {number}
     */
    get streamEnd() {
        return this.streamStart + this.header + Math.abs(this.length);
    }

    /**
     * @returns {string}
     */
    toHexString() {
        return this.stream.toHexString(this.streamStart, this.streamEnd);
    }

    /**
     * @param {Number[]|Stream} der
     * @returns {ASN1}
     */
    static decode(der) {
        const stream = der instanceof Stream ? der : new Stream(der, 0);
        const streamClone = new Stream(stream);
        const tag = new ASN1Tag(stream);

        const decodeLength = ASN1.decodeLength(stream);
        const asn1Start = stream.pos;

        const sub = [];
        if (tag.tagConstructed) {
            while (stream.pos < asn1Start + decodeLength) {
                sub.push(ASN1.decode(stream));
            }
        } else if (tag.isUniversal() && (tag.isBitString() || tag.isOctetString())) {
            if (tag.isBitString()) {
                stream.get();
            }

            while (stream.pos < asn1Start + decodeLength) {
                sub.push(ASN1.decode(stream));
            }
        }

        if (sub.length === 0) {
            stream.pos = asn1Start + Math.abs(decodeLength);
        }

        return new ASN1(streamClone, asn1Start - streamClone.pos, decodeLength, tag, sub.length ? sub : null);
    }

    /**
     * @param {Stream} stream
     * @returns {number}
     */
    static decodeLength(stream) {
        let buf = stream.get(null);
        const len = buf & 0x7f;
        if (len === buf) {
            return len;
        }

        buf = 0;
        for (let i = 0; i < len; ++i) {
            buf = (buf << 8) | stream.get(null);
        }
        return buf;
    }
}
