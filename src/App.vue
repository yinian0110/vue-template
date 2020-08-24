<template>
    <div id="app">
        <router-view />
    </div>
</template>

<style lang="scss">
@import '.../../styles/global/style';
@import '.../../styles/theme/mixins/scrollbar';

::-webkit-scrollbar {
    height: 6px;
    width: 6px;
}

::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.025);
}

::-webkit-scrollbar-thumb {
    border-radius: 10px;
    background: rgba(0, 0, 0, 0.2);
    transition: all 0.5s;

    &:window-inactive {
        background: rgba(0, 0, 0, 0.05);
    }

    &:hover {
        background: rgba(0, 0, 0, 0.25);
    }

    &:active {
        background: rgba(0, 0, 0, 0.4);
    }
}

#app {
    font-family: Avenir, Helvetica Neue, Arial, Helvetica, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}
.el-main {
    background: #eef0f3;
}
.el-submenu.is-opened .el-menu-item {
    background: #1f2d3d !important;
}
</style>
