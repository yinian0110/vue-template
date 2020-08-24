<template>
    <div>
        <div v-for="(item, index) in routerList" :key="index">
            <el-submenu :index="resolvePath(item.path)" v-if="item.children && item.children.length > 0">
                <template slot="title">
                    <i class="el-icon-" v-if="item.meta.icon">
                        <svg-icon :icon-class="item.meta.icon" />
                    </i>
                    <span slot="title" :class="!item.meta.icon ? 'title_name' : 'title_name_icon'">{{ item.meta.name }}</span>
                </template>
                <SlideBar :router-list="item.children" :base-path="item.path"></SlideBar>
            </el-submenu>
            <template v-else>
                <el-menu-item :index="resolvePath(item.path)">
                    <i class="el-icon-" v-if="item.meta.icon">
                        <svg-icon :icon-class="item.meta.icon" />
                    </i>
                    <span slot="title" :class="!item.meta.icon ? 'title_name' : 'title_name_icon'">{{ item.meta.name }}</span>
                </el-menu-item>
            </template>
        </div>
    </div>
</template>
<style>
</style>

<script>
import path from 'path';
export default {
    name: 'SlideBar',
    data() {
        return {
            isCollapse: false
        };
    },
    filters: {},
    props: {
        routerList: {
            type: Array,
            default: () => []
        },
        basePath: {
            type: String,
            default: ''
        }
    },
    created() {},
    methods: {
        resolvePath(routePath) {
            return path.resolve(this.basePath, routePath);
        }
    }
};
</script>
<style lang="scss" scoped>
.title_name {
    padding-left: 19px;
}
.title_name_icon {
    padding-left: 10px;
}
</style>
