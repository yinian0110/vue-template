<template>
    <div class="nav_bar">
        <div :class="{ menu_icon: true, active: collapseStatus }" @click="menuChange">
            <svg-icon icon-class="menu" />
        </div>
        <div class="breadcrumb">
            <el-breadcrumb separator="/" separator-class="el-icon-arrow-right">
                <el-breadcrumb-item v-for="(item, index) in breadlist" :key="index" :to="{ path: item.path }">{{ item.meta.name }}</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="user_name">{{ userInfo.nickname }}</div>
        <el-dropdown @click="loginOut" @command="handleCommand">
            <span class="el-dropdown-link">
                <div class="user_info">
                    <div class="avator">
                        <img :src="userInfo.avatar || 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif?imageView2/1/w/80/h/80'" />
                    </div>
                    <div class="tool">
                        <svg-icon icon-class="xiajiantou" />
                    </div>
                </div>
            </span>
            <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="HOME">Home</el-dropdown-item>
                <el-dropdown-item command="LOGINOUT">Log Out</el-dropdown-item>
            </el-dropdown-menu>
        </el-dropdown>
    </div>
</template>

<script>
import defaultAvator from '@/assets/avator.jpg';
import { mapGetters, mapMutations, mapActions } from 'vuex';
import { adminLoginOut } from '@/api/admin-api';
export default {
    name: 'NavBar',
    data() {
        return { defaultAvator, breadlist: [] };
    },
    computed: {
        ...mapGetters('userInfo', {
            userInfo: 'getUserInfo'
        }),
        ...mapGetters('app', {
            collapseStatus: 'slideBarCollapseStatus'
        })
    },
    created() {
        this.getBread();
        this.checkUserInfo();
    },
    methods: {
        ...mapMutations('app', ['slideBarCollapseChange']),
        ...mapMutations('userInfo', ['clearUserInfo']),
        ...mapActions('userInfo', ['reqGetUserInfo']),
        menuChange() {
            this.slideBarCollapseChange();
        },
        getBread() {
            // console.log(this.$route.matched);
            this.breadlist = this.$route.matched;
        },
        checkUserInfo() {
            if (JSON.stringify(this.userInfo) === '{}') {
                this.reqGetUserInfo();
            }
        },
        handleCommand(e) {
            if (e === 'HOME') {
                this.$router.push('/');
            }
            if (e === 'LOGINOUT') {
                this.loginOut();
            }
        },
        loginOut() {
            adminLoginOut().finally(() => {});
            this.clearUserInfo();
            this.$router.push({ path: '/login' });
        }
    },
    watch: {
        $route() {
            this.getBread();
            this.checkUserInfo();
        }
    }
};
</script>

<style lang="scss" scoped>
.nav_bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 100%;
    box-sizing: border-box;
    box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
    padding: 0 20px;
    .menu_icon {
        cursor: pointer;
        transition: all ease 0.5s;
        &.active {
            transform: rotate(-90deg);
        }
    }
    .breadcrumb {
        flex: auto;
        margin-left: 20px;
    }
    .user_name {
        font-size: 13px;
        margin-right: 15px;
        font-weight: 600;
    }
    .user_info {
        display: flex;
        align-items: center;
        cursor: pointer;
        .avator {
            margin-right: 20px;
            width: 40px;
            height: 40px;
            border-radius: 10px;
            overflow: hidden;
            img {
                width: 100%;
                height: 100%;
            }
        }
        .tool {
            color: #333;
        }
    }
}
</style>
