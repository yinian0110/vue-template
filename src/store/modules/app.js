const state = {
    collapse: false
};
const getters = {
    slideBarCollapseStatus: () => {
        return state.collapse;
    }
};
const mutations = {
    slideBarCollapseChange: state => {
        state.collapse = !state.collapse;
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
