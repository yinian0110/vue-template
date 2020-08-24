const ADD_ROUTE = `ADD_ROUTE`;
const DEL_ROUTE = `DEL_ROUTE`;
const state = {
    visitedViews: [],
    cachedViews: []
};
const getters = {
    visitedViewsGetters(state) {
        return state.visitedViews;
    }
};
const mutations = {
    ADD_ROUTE: (state, { payload }) => {
        let { visitedViews } = state;
        if (!visitedViews.some(item => item.path === payload.path)) {
            state.visitedViews = [...visitedViews, payload];
        }
    },
    DEL_ROUTE: (state, payload) => {
        let { visitedViews } = state;
        state.visitedViews = visitedViews.filter(item => item.path !== payload.path);
    },
    DEL_OTHER_ROUTE: (state, payload) => {
        let { visitedViews } = state;
        state.visitedViews = visitedViews.filter(item => item.path === payload.path);
    }
};
const actions = {};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
};
