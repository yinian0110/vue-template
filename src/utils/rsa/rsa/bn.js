/* eslint-disable no-bitwise,no-underscore-dangle,no-plusplus */
/* eslint-disable no-param-reassign,no-continue,no-use-before-define */

// Javascript BN(BigNumber) Library
import { intAt, int2char } from '../utils/radix';
import { isNull, isNotNull, nBits } from '../utils/utils';
import { BITS_PER_DIGIT, DIGIT_MAX, DIGIT_VALUE, FASTEST_AM_FUNC, FLOW_VALUE, FLOW_1, FLOW_2 } from '../utils/engine';

/**
 * Modular reduction using "classic" algorithm
 */
class Classic {
    constructor(m) {
        this.m = m;
    }

    /**
     * @param {BigInteger} x
     * @return {BigInteger}
     */
    convert(x) {
        if (x.s < 0 || x.compareTo(this.m) >= 0) {
            return x.mod(this.m);
        }
        return x;
    }

    /**
     * @param {BigInteger} x
     * @param {BigInteger} r
     */
    sqrTo(x, r) {
        x.squareTo(r);
        this.reduce(r);
    }

    /**
     * @param {BigInteger} x
     */
    reduce(x) {
        x.divRemTo(this.m, null, x);
    }

    /**
     * @param {BigInteger} x
     * @param {BigInteger} y
     * @param {BigInteger} r
     */
    mulTo(x, y, r) {
        x.multiplyTo(y, r);
        this.reduce(r);
    }
}

class Montgomery {
    constructor(m) {
        this.m = m;
        this.mp = m.invDigit();
        this.mpl = this.mp & 0x7fff;
        this.mph = this.mp >> 15;
        this.um = (1 << (BITS_PER_DIGIT - 15)) - 1;
        this.mt2 = 2 * m.t;
    }

    /**
     * @param {BigInteger} x
     * @return {BigInteger}
     */
    convert(x) {
        const r = BigInteger.newBigIntegerFromNull();
        x.abs().dlShiftTo(this.m.t, r);
        r.divRemTo(this.m, null, r);

        if (x.s < 0 && r.compareTo(BigInteger.ZERO) > 0) {
            this.m.subTo(r, r);
        }
        return r;
    }

    /**
     * @param {BigInteger} x
     * @param {BigInteger} r
     */
    sqrTo(x, r) {
        x.squareTo(r);
        this.reduce(r);
    }

    /**
     * @param {BigInteger} x
     */
    reduce(x) {
        while (x.t <= this.mt2) {
            x.b[x.t++] = 0;
        }

        for (let i = 0; i < this.m.t; ++i) {
            let j = x.b[i] & 0x7fff;
            // eslint-disable-next-line max-len
            const u0 = (j * this.mpl + (((j * this.mph + (x.b[i] >> 15) * this.mpl) & this.um) << 15)) & DIGIT_MAX;

            j = i + this.m.t;
            x.b[j] += this.m.am(0, u0, x, i, 0, this.m.t);
            while (x.b[j] >= DIGIT_VALUE) {
                x.b[j] -= DIGIT_VALUE;
                x.b[++j]++;
            }
        }

        x.clamp();
        x.drShiftTo(this.m.t, x);
        if (x.compareTo(this.m) >= 0) {
            x.subTo(this.m, x);
        }
    }

    /**
     * @param {BigInteger} x
     * @param {BigInteger} y
     * @param {BigInteger} r
     */
    mulTo(x, y, r) {
        x.multiplyTo(y, r);
        this.reduce(r);
    }

    /**
     * @param {BigInteger} x
     */
    revert(x) {
        const r = BigInteger.newBigIntegerFromNull();
        x.copyTo(r);

        this.reduce(r);
        return r;
    }
}

export default class BigInteger {
    /**
     * @param {Array|string|*} a
     * @param {number|null|*} b
     */
    constructor(a, b) {
        this.t = 0;
        this.s = 0;
        this.b = [];

        if (isNotNull(a)) {
            if (typeof a !== 'string' && isNull(b)) {
                this.fromString(a, 256);
            } else {
                this.fromString(a, b);
            }
        }
    }

    /**
     * set from integer value x, -DV <= x < DV
     * @param {number} x
     */
    fromInt(x) {
        this.t = 1;
        this.s = x < 0 ? -1 : 0;

        if (x > 0) {
            this.b[0] = x;
        } else if (x < -1) {
            this.b[0] = x + DIGIT_VALUE;
        } else {
            this.t = 0;
        }
    }

    /**
     * @param {string|Array} hex
     * @param {number} radix
     */
    fromString(hex, radix) {
        let k = 0;
        switch (radix) {
            case 2:
                k = 1;
                break;
            case 4:
                k = 2;
                break;
            case 8:
                k = 3;
                break;
            case 16:
                k = 4;
                break;
            case 32:
                k = 5;
                break;
            case 256:
                k = 8;
                break;
            default:
                return;
        }

        this.t = 0;
        this.s = 0;

        let mi = false;
        let sh = 0;
        for (let i = hex.length - 1; i >= 0; --i) {
            const x = k === 8 ? hex[i] & 0xff : intAt(hex, i);
            if (x < 0) {
                if (hex.charAt(i) === '-') {
                    mi = true;
                }
                continue;
            }

            mi = false;
            if (sh === 0) {
                this.b[this.t++] = x;
            } else if (sh + k > BITS_PER_DIGIT) {
                this.b[this.t - 1] |= (x & ((1 << (BITS_PER_DIGIT - sh)) - 1)) << sh;
                this.b[this.t++] = x >> (BITS_PER_DIGIT - sh);
            } else {
                this.b[this.t - 1] |= x << sh;
            }

            sh += k;
            if (sh >= BITS_PER_DIGIT) {
                sh -= BITS_PER_DIGIT;
            }
        }

        if (k === 8 && (hex[0] & 0x80) !== 0) {
            this.s = -1;
            if (sh > 0) {
                this.b[this.t - 1] |= ((1 << (BITS_PER_DIGIT - sh)) - 1) << sh;
            }
        }

        this.clamp();
        if (mi) {
            BigInteger.ZERO.subTo(this, this);
        }
    }

    /**
     * @return {number}
     */
    bitLength() {
        if (this.t <= 0) {
            return 0;
        }
        return BITS_PER_DIGIT * (this.t - 1) + nBits(this.b[this.t - 1] ^ (this.s & DIGIT_MAX));
    }

    /**
     * this ^ e % m, 0 <= e < 2^32
     *
     * @param {number} e
     * @param {BigInteger} m
     * @return {BigInteger}
     */
    modPowInt(e, m) {
        let z = 0;
        if (e < 256 || m.isEven()) {
            z = new Classic(m);
        } else {
            z = new Montgomery(m);
        }
        return this.exp(e, z);
    }

    /**
     * true iff this is even
     * @return {boolean}
     */
    isEven() {
        if (this.t > 0) {
            return (this.b[0] & 1) === 0;
        }
        return this.s === 0;
    }

    /**
     * this ^ e, e < 2^32,
     * doing sqr and mul with "r" (HAC 14.79)
     */
    exp(e, z) {
        if (e > 0xffffffff || e < 1) {
            return BigInteger.ONE;
        }

        let r1 = BigInteger.newBigIntegerFromNull();
        let r2 = BigInteger.newBigIntegerFromNull();

        const g = z.convert(this);
        g.copyTo(r1);

        for (let i = nBits(e) - 2; i >= 0; --i) {
            z.sqrTo(r1, r2);
            if ((e & (1 << i)) > 0) {
                z.mulTo(r2, g, r1);
            } else {
                [r1, r2] = [r2, r1];
            }
        }

        if (z instanceof Classic) {
            return r1;
        }
        return z.revert(r1);
    }

    /**
     * return + if this > a, - if this < a, 0 if equal
     * @param {BigInteger} a
     */
    compareTo(a) {
        const r = this.s - a.s;
        if (r !== 0) {
            return r;
        }

        const v = this.t - a.t;
        if (v !== 0) {
            return this.s < 0 ? -v : v;
        }

        for (let i = this.t - 1; i >= 0; --i) {
            const vv = this.b[i] - a.b[i];
            if (vv !== 0) {
                return vv;
            }
        }
        return 0;
    }

    /**
     * copy this to r
     * @param {BigInteger} r
     */
    copyTo(r) {
        for (let i = this.t - 1; i >= 0; --i) {
            r.b[i] = this.b[i];
        }

        r.t = this.t;
        r.s = this.s;
    }

    /**
     * r = this^2, r != this (HAC 14.16)
     * @param {BigInteger} r
     */
    squareTo(r) {
        const x = this.abs();
        r.t = 2 * x.t;

        for (let i = r.t - 1; i >= 0; --i) {
            r.b[i] = 0;
        }

        for (let i = 0; i < x.t - 1; ++i) {
            const c = x.am(i, x.b[i], r, 2 * i, 0, 1);
            r.b[i + x.t] += x.am(i + 1, 2 * x.b[i], r, 2 * i + 1, c, x.t - i - 1);
            if (r.b[i + x.t] >= DIGIT_VALUE) {
                r.b[i + x.t] -= DIGIT_VALUE;
                r.b[i + x.t + 1] = 1;
            }
        }

        if (r.t > 0) {
            r.b[r.t - 1] += x.am(x.t - 1, x.b[x.t - 1], r, 2 * (x.t - 1), 0, 1);
        }
        r.s = 0;
        r.clamp();
    }

    /**
     * |this|
     */
    abs() {
        return this.s < 0 ? this.negate() : this;
    }

    /**
     * -this
     */
    negate() {
        const r = BigInteger.newBigIntegerFromNull();
        BigInteger.ZERO.subTo(this, r);
        return r;
    }

    /**
     * r = this - a
     * @param {BigInteger} a
     * @param {BigInteger} r
     */
    subTo(a, r) {
        const min = Math.min(a.t, this.t);

        let i = 0;
        let c = 0;
        while (i < min) {
            c += this.b[i] - a.b[i];
            r.b[i++] = c & DIGIT_MAX;
            c >>= BITS_PER_DIGIT;
        }

        if (a.t < this.t) {
            c -= a.s;
            while (i < this.t) {
                c += this.b[i];
                r.b[i++] = c & DIGIT_MAX;
                c >>= BITS_PER_DIGIT;
            }
            c += this.s;
        } else {
            c += this.s;
            while (i < a.t) {
                c -= a.b[i];
                r.b[i++] = c & DIGIT_MAX;
                c >>= BITS_PER_DIGIT;
            }
            c -= a.s;
        }

        r.s = c < 0 ? -1 : 0;
        if (c < -1) {
            r.b[i++] = DIGIT_VALUE + c;
        } else if (c > 0) {
            r.b[i++] = c;
        }

        r.t = i;
        r.clamp();
    }

    /**
     * r = this * a, r != this,a (HAC 14.12)
     * "this" should be the larger one if appropriate.
     * @param {BigInteger} a
     * @param {BigInteger} r
     */
    multiplyTo(a, r) {
        const x = this.abs();
        const y = a.abs();

        r.t = x.t + y.t;
        for (let i = x.t - 1; i >= 0; --i) {
            r.b[i] = 0;
        }

        for (let i = 0; i < y.t; ++i) {
            r.b[i + x.t] = x.am(0, y.b[i], r, i, 0, x.t);
        }

        r.s = 0;
        r.clamp();
        if (r.s !== a.s) {
            BigInteger.ZERO.subTo(r, r);
        }
    }

    /**
     * divide this by m, quotient and remainder to q, r (HAC 14.20)
     * r != q, this != m.  q or r may be null.
     * @param {BigInteger|null} m
     * @param {BigInteger|null} q
     * @param {BigInteger|null} r
     * @return {BigInteger}
     */
    divRemTo(m, q, r) {
        const pm = m.abs();
        if (pm.t <= 0) {
            return r;
        }

        const pt = this.abs();
        if (pt.t < pm.t) {
            if (q !== null) {
                q.fromInt(0);
            }
            if (r !== null) {
                this.copyTo(r);
            }
            return r;
        }

        if (r === null) {
            r = BigInteger.newBigIntegerFromNull();
        }

        const y = BigInteger.newBigIntegerFromNull();
        const ts = this.s;
        const ms = m.s;

        const nsh = BITS_PER_DIGIT - nBits(pm.b[pm.t - 1]);
        if (nsh > 0) {
            pm.lShiftTo(nsh, y);
            pt.lShiftTo(nsh, r);
        } else {
            pm.copyTo(y);
            pt.copyTo(r);
        }

        const ys = y.t;
        const y0 = y.b[ys - 1];
        if (y0 === 0) {
            return r;
        }

        const yt = y0 * (1 << FLOW_1) + (ys > 1 ? y.b[ys - 2] >> FLOW_2 : 0);
        const d1 = FLOW_VALUE / yt;
        const d2 = (1 << FLOW_1) / yt;
        const e = 1 << FLOW_2;
        let i = r.t;
        let j = i - ys;
        const t = q === null ? BigInteger.newBigIntegerFromNull() : q;
        y.dlShiftTo(j, t);
        if (r.compareTo(t) >= 0) {
            r.b[r.t++] = 1;
            r.subTo(t, r);
        }

        BigInteger.ONE.dlShiftTo(ys, t);
        t.subTo(y, y);

        while (y.t < ys) {
            y.b[y.t++] = 0;
        }

        while (--j >= 0) {
            let qd = BITS_PER_DIGIT;
            if (r.b[--i] !== y0) {
                qd = Math.floor(r.b[i] * d1 + (r.b[i - 1] + e) * d2);
            }

            r.b[i] += y.am(0, qd, r, j, 0, ys);
            if (r.b[i] < qd) {
                y.dlShiftTo(j, t);
                r.subTo(t, r);

                while (r.b[i] < --qd) {
                    r.subTo(t, r);
                }
            }
        }

        if (q !== null) {
            r.drShiftTo(ys, q);
            if (ts !== ms) {
                BigInteger.ZERO.subTo(q, q);
            }
        }

        r.t = ys;
        r.clamp();

        if (nsh > 0) {
            r.rShiftTo(nsh, r);
        }
        if (ts < 0) {
            BigInteger.ZERO.subTo(r, r);
        }
        return r;
    }

    /**
     * @param {number} i
     * @param {number} x
     * @param {BigInteger} w
     * @param {number} j
     * @param {number} c
     * @param {number} n
     * @return {number}
     */
    am(i, x, w, j, c, n) {
        return FASTEST_AM_FUNC(this, i, x, w, j, c, n);
    }

    /**
     * clamp off excess high words
     */
    clamp() {
        const c = this.s & DIGIT_MAX;
        while (this.t > 0 && this.b[this.t - 1] === c) {
            --this.t;
        }
    }

    /**
     * r = this << n
     * @param {number} n
     * @param {BigInteger} r
     */
    lShiftTo(n, r) {
        const bs = n % BITS_PER_DIGIT;
        const cbs = BITS_PER_DIGIT - bs;
        const bm = (1 << cbs) - 1;
        const ds = Math.floor(n / BITS_PER_DIGIT);

        let c = (this.s << bs) & DIGIT_MAX;
        for (let i = this.t - 1; i >= 0; --i) {
            r.b[i + ds + 1] = (this.b[i] >> cbs) | c;
            c = (this.b[i] & bm) << bs;
        }

        for (let i = ds - 1; i >= 0; --i) {
            r.b[i] = 0;
        }

        r.b[ds] = c;
        r.t = this.t + ds + 1;
        r.s = this.s;
        r.clamp();
    }

    /**
     * r = this << n * DB
     * @param {number} n
     * @param {BigInteger} r
     */
    dlShiftTo(n, r) {
        for (let i = this.t - 1; i >= 0; --i) {
            r.b[i + n] = this.b[i];
        }

        for (let i = n - 1; i >= 0; --i) {
            r.b[i] = 0;
        }

        r.t = this.t + n;
        r.s = this.s;
    }

    /**
     * r = this >> n
     * @param {number} n
     * @param {BigInteger} r
     */
    rShiftTo(n, r) {
        r.s = this.s;

        const ds = Math.floor(n / BITS_PER_DIGIT);
        if (ds >= this.t) {
            r.t = 0;
        } else {
            const bs = n % BITS_PER_DIGIT;
            const cbs = BITS_PER_DIGIT - bs;
            const bm = (1 << bs) - 1;

            r.b[0] = this.b[ds] >> bs;
            for (let i = ds + 1; i < this.t; ++i) {
                r.b[i - ds - 1] |= (this.b[i] & bm) << cbs;
                r.b[i - ds] = this.b[i] >> bs;
            }

            if (bs > 0) {
                r.b[this.t - ds - 1] |= (this.s & bm) << cbs;
            }

            r.t = this.t - ds;
            r.clamp();
        }
    }

    /**
     * r = this >> n * DB
     * @param {number} n
     * @param {BigInteger} r
     */
    drShiftTo(n, r) {
        for (let i = n; i < this.t; ++i) {
            r.b[i - n] = this.b[i];
        }

        r.t = Math.max(this.t - n, 0);
        r.s = this.s;
    }

    /**
     * this mod a
     * @param {BigInteger} a
     */
    mod(a) {
        const r = BigInteger.newBigIntegerFromNull();
        this.abs().divRemTo(a, null, r);

        if (this.s < 0 && r.compareTo(BigInteger.ZERO) > 0) {
            a.subTo(r, r);
        }
        return r;
    }

    /**
     * return "-1/this % 2^DB"; useful for Mont
     * @return {number}
     */
    invDigit() {
        if (this.t < 1) {
            return 0;
        }

        const x = this.b[0];
        if ((x & 1) === 0) {
            return 0;
        }

        let y = x & 3;
        y = (y * (2 - (x & 0xf) * y)) & 0xf;
        y = (y * (2 - (x & 0xff) * y)) & 0xff;
        y = (y * (2 - (((x & 0xffff) * y) & 0xffff))) & 0xffff;
        y = (y * (2 - ((x * y) % DIGIT_VALUE))) % DIGIT_VALUE;
        return y > 0 ? DIGIT_VALUE - y : -y;
    }

    /**
     * @param {number} radix
     * @return {string}
     */
    toString(radix) {
        if (this.s < 0) {
            return `-${this.negate().toString(radix)}`;
        }

        let k = 0;
        // eslint-disable-next-line default-case
        switch (radix) {
            case 2:
                k = 1;
                break;
            case 4:
                k = 2;
                break;
            case 8:
                k = 3;
                break;
            case 16:
                k = 4;
                break;
            case 32:
                k = 5;
                break;
        }
        let r = '';

        const km = (1 << k) - 1;
        let m = false;
        let i = this.t;
        let p = BITS_PER_DIGIT - ((i * BITS_PER_DIGIT) % k);
        while (i-- > 0) {
            let d = this.b[i] >> p;
            if (p < BITS_PER_DIGIT && d > 0) {
                m = true;
                r = int2char(d);
            }

            while (i >= 0) {
                if (p < k) {
                    d = (this.b[i] & ((1 << p) - 1)) << (k - p);

                    p += BITS_PER_DIGIT - k;
                    d |= this.b[--i] >> p;
                } else {
                    p -= k;
                    d = (this.b[i] >> p) & km;
                    if (p <= 0) {
                        p += BITS_PER_DIGIT;
                        --i;
                    }
                }

                if (d > 0) {
                    m = true;
                }

                if (m) {
                    r += int2char(d);
                }
            }
        }

        return m ? r : '0';
    }

    /**
     * @return {BigInteger}
     */
    static get ONE() {
        if (!BigInteger.__ONE) {
            BigInteger.__ONE = BigInteger.newBigIntegerFromInt(1);
        }
        return BigInteger.__ONE;
    }

    /**
     * @return {BigInteger}
     */
    static get ZERO() {
        if (!BigInteger.__ZERO) {
            BigInteger.__ZERO = BigInteger.newBigIntegerFromInt(0);
        }
        return BigInteger.__ZERO;
    }

    /**
     * return BigInteger initialized to value
     * @param {number} n
     * @return {BigInteger}
     */
    static newBigIntegerFromInt(n) {
        const bn = new BigInteger(null, null);
        bn.fromInt(n);
        return bn;
    }

    /**
     * @return {BigInteger}
     */
    static newBigIntegerFromNull() {
        return new BigInteger(null, null);
    }
}
