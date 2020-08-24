<template>
    <div class="layout">
        <el-container>
            <el-aside class="sidebar-container">
                <div class="sidebar-logo-container">
                    <router-link v-if="collapseStatus" class="sidebar-logo-link" to="/">
                        <img src="https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif?imageView2/1/w/80/h/80" class="sidebar-logo" :style="collapseStatus ? 'margin-right:0' : 'margin-right:12px'" />
                    </router-link>
                    <router-link v-else class="sidebar-logo-link" to="/">
                        <img src="https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif?imageView2/1/w/80/h/80" class="sidebar-logo" :style="collapseStatus ? 'margin-right:0' : 'margin-right:12px'" />
                        <h1 class="sidebar-title">测试SCRM</h1>
                    </router-link>
                </div>
                <el-menu :show-timeout="200" :default-active="$route.path" :collapse="collapseStatus" mode="vertical" background-color="#304156" text-color="#bfcbd9" active-text-color="#409EFF" router class="menu_vertical" style="height:100%">
                    <SideBar :router-list="routerList"></SideBar>
                </el-menu>
            </el-aside>
            <el-container>
                <el-header>
                    <NavBar></NavBar>
                </el-header>
                <tags-select-view style="flex:none;"></tags-select-view>
                <el-main>
                    <transition name="fade-transverse" mode="out-in">
                        <router-view />
                    </transition>
                </el-main>
            </el-container>
        </el-container>
    </div>
</template>

<script>
import SideBar from './components/SideBar';
import NavBar from './components/NavBar';
import { routerFilter } from '@/utils/util';
import { mapGetters } from 'vuex';
export default {
    name: 'Layout',
    data() {
        return { routerList: [] };
    },
    computed: {
        ...mapGetters('app', {
            collapseStatus: 'slideBarCollapseStatus'
        })
    },
    components: {
        SideBar,
        NavBar
    },
    filters: {},
    created() {
        this.routerList = routerFilter(this.$router.options.routes);
    },
    methods: {}
};
</script>

<style lang="scss">
.el-submenu.is-active .el-submenu__title {
    color: #fff !important;
}
.el-submenu.is-active .el-submenu__title i {
    color: #fff !important;
}
</style>
<style lang="scss" scoped>
.el-menu {
    border-right: 0 !important;
}
.sidebar-container {
    display: flex;
    flex-direction: column;

    .menu_vertical.el-menu {
        flex-grow: 1;
    }
}
.sidebar-logo-container {
    min-height: 60px;
    position: relative;
    width: 100%;
    height: 60px;
    line-height: 60px;
    background: #2b2f3a;
    text-align: center;
    overflow-x: hidden;
    .sidebar-logo {
        width: 40px;
        height: 40px;
        vertical-align: middle;
        margin-right: 12px;
        border-radius: 10px;
    }
    .sidebar-title {
        display: inline-block;
        margin: 0;
        color: #fff;
        font-weight: 600;
        line-height: 50px;
        font-size: 14px;
        font-family: Avenir, Helvetica Neue, Arial, Helvetica, sans-serif;
        vertical-align: middle;
    }
}
.layout {
    width: 100%;
    height: 100vh;
    & /deep/ .el-aside {
        width: auto !important;
    }
    & /deep/ .menu_vertical:not(.el-menu--collapse) {
        width: 210px;
    }
    & /deep/ .el-menu--collapse {
        .el-submenu__icon-arrow {
            display: none;
        }
        .title_name_icon {
            display: none;
        }
    }
    & /deep/ .el-container {
        height: 100vh;
    }
    & /deep/ .el-submenu {
        overflow-x: hidden;
    }
    & /deep/ .el-header {
        padding: 0;
    }
    & /deep/ *[class^='el-icon-'] {
        font-size: 13px;
    }

    // 过渡动画 横向渐变
    .fade-transverse-leave-active,
    .fade-transverse-enter-active {
        transition: all 0.5s;
    }
    .fade-transverse-enter {
        opacity: 0;
        transform: translateX(-30px);
    }
    .fade-transverse-leave-to {
        opacity: 0;
        transform: translateX(30px);
    }

    // 过渡动画 缩放渐变
    .fade-scale-leave-active,
    .fade-scale-enter-active {
        transition: all 0.5s;
    }
    .fade-scale-enter {
        opacity: 0;
        transform: scale(1.2);
    }
    .fade-scale-leave-to {
        opacity: 0;
        transform: scale(0.8);
    }
}
</style>
