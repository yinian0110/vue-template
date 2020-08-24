export function formatDate(value, fmt) {
    // let v = value.replace(/-/g, "/").substring(0, 19);
    let date = new Date(value);
    if (date == 'Invalid Date') {
        date = new Date(parseFloat(value));
    }
    if (!fmt) {
        fmt = 'yyyy-MM-dd';
    }
    let o = {
        //	'y+': date.getFullYear(), // 年
        'M+': date.getMonth() + 1, // 月
        'd+': date.getDate(), // 日
        'h+': date.getHours(), // 小时
        'm+': date.getMinutes(), // 分
        's+': date.getSeconds() // 秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
    for (let k in o) {
        if (new RegExp('(' + k + ')').test(fmt)) fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length));
    }
    return fmt;
}
