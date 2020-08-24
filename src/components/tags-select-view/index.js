import TagsView from './tags-view.vue';

const TagsSelectView = {
    install: function(Vue) {
        Vue.component('TagsSelectView', TagsView);
    }
};

export default TagsSelectView;
