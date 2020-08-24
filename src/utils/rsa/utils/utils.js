/* eslint-disable no-bitwise,no-param-reassign,no-plusplus */
/**
 * @param {*} object
 * @return {boolean}
 */
export function isNull(object) {
    return object === null || object === undefined;
}

/**
 * @param {*} object
 * @return {boolean}
 */
export function isNotNull(object) {
    return !isNull(object);
}

/**
 * returns bit length of the integer x
 * @param {number} x
 * @return {number}
 */
export function nBits(x) {
    let r = 1;
    let t;
    t = x >>> 16;
    if (t !== 0) {
        x = t;
        r += 16;
    }

    t = x >> 8;
    if (t !== 0) {
        x = t;
        r += 8;
    }

    t = x >> 2;
    if (t !== 0) {
        x = t;
        r += 4;
    }

    t = x >> 2;
    if (t !== 0) {
        x = t;
        r += 2;
    }

    t = x >> 1;
    if (t !== 0) {
        r += 1;
    }
    return r;
}

/**
 * @param {string} text
 * @return {number}
 */
export function bytesLength(text) {
    let length = 0;
    for (let i = 0; i < text.length; ++i) {
        const char = text.charCodeAt(i);
        if (char < 128) {
            length += 1;
        } else if (char > 127 && char < 2048) {
            length += 2;
        } else {
            length += 3;
        }
    }
    return length;
}

/**
 * @param {string} text
 * @param {number} length
 * @return {string}
 */
export function subBytes(text, length) {
    const str1 = text.substr(0, length);
    const str1Length = bytesLength(str1);

    // ascii only
    if (str1Length === length) {
        return str1;
    }

    // 2-bytes complex
    const str2 = text.substr(0, Math.floor(length / 2));
    const str2Length = bytesLength(str2);
    if (str2Length <= length) {
        return str2;
    }

    // 3-bytes complex
    const str3 = text.substr(0, Math.floor(length / 3));
    const str3Length = bytesLength(str3);
    if (str3Length <= length) {
        return str3;
    }
    return '';
}
