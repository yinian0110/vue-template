import Vue from 'vue';

Vue.filter('convertAmount', function(fee) {
    if (fee === undefined) {
        return '--';
    }
    if (fee === 0) {
        return fee;
    }
    return fee ? fee / 100 : '--';
});
