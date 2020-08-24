import md5 from 'md5';

class Encryption {
    time() {
        return Math.floor(new Date().getTime() / 1000);
    }
    createSign({ method = 'GET', param = {}, data = {}, api = '/api/api', timeStamp = '' }) {
        const TIMESTAMP = timeStamp || this.time();
        param.ts = TIMESTAMP;
        method = method.toLocaleUpperCase();
        Object.assign(param, data);
        const encryStr = this.mergeParam(this.keySort(param));
        const md5Str = `${method}.${TIMESTAMP}.${encryStr}.${api}`;
        return md5(md5Str);
    }
    keySort(obj) {
        let newObj = {};
        for (let key of Object.keys(obj).sort()) {
            if (key.indexOf('_') === 0) {
                continue;
            }
            newObj[key] = obj[key];
        }
        return newObj;
    }
    mergeParam(obj) {
        let str = '';
        for (let [k, v] of Object.entries(obj)) {
            let valueStr = typeof v === 'object' ? JSON.stringify(v) : v;
            str += `${k}+${valueStr}=`;
        }
        return str;
    }
}
export default new Encryption();
