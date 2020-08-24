import Vue from 'vue';

Vue.mixin({
    data() {
        return {
            GlobalTableHeight: 0
        };
    },
    mounted() {
        this.$nextTick(() => {
            this.$refs.table && (this.GlobalTableHeight = window.innerHeight - this.$refs.table.$el.offsetTop - 160);
        });
    }
});
