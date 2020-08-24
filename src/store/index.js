import Vue from 'vue';
import Vuex from 'vuex';
import app from './modules/app';
import userInfo from './modules/user-info';
import tagsView from './modules/tags-view';

Vue.use(Vuex);

export default new Vuex.Store({
    modules: { app, userInfo, tagsView },
    actions: {}
});
