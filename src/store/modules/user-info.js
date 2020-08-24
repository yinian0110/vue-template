import { adminInfo } from '@/api/admin-api';
import { Loading } from 'element-ui';
const state = {
    userInfo: {}
};
const getters = {
    getUserInfo(state) {
        return state.userInfo;
    }
};
const mutations = {
    addUserInfo(state, payload) {
        state.userInfo = payload;
    },
    clearUserInfo(state) {
        state.userInfo = {};
    }
};
const actions = {
    reqGetUserInfo({ state, commit }) {
        // const loading = Loading.service({
        //     lock: true,
        //     text: '努力加载中...',
        //     spinner: 'el-icon-loading',
        //     background: 'rgba(0, 0, 0, 0.9)'
        // });
        adminInfo()
            .then(res => {
                commit('addUserInfo', res.d.profile);
            })
            .catch(() => {
                window.location.href = window.location.origin + '/#/login';
            });
        // .finally(() => {
        //     loading.close();
        // });
    }
};
export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
};
