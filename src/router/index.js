import Vue from 'vue';
import Router from 'vue-router';
import hook from './hooks';

import Login from '@/views/login/login.vue';
import Home from '@/views/home/index.vue';
import Layout from '@/views/layout';
import Page404 from '@/views/error/404.vue';

Vue.use(Router);

const router = new Router({
    routes: [
        {
            path: '/',
            name: '',
            component: Layout,
            meta: {
                name: 'echarts',
                icon: 'home'
            },
            children: [
                {
                    path: '',
                    name: 'Home',
                    component: Home,
                    meta: {
                        name: 'echarts'
                    },
                    hide: true
                }
            ]
        },
        // {
        //     path: '/home',
        //     name: 'home',
        //     component: Layout,
        //     meta: {
        //         name: '主页',
        //         icon: 'home'
        //     },
        //     hide: false
        // },
        {
            path: '/error',
            name: 'error',
            component: Layout,
            meta: {
                name: 'error',
                icon: 'code'
            },
            children: [
                {
                    path: '404',
                    name: '404',
                    component: Page404,
                    meta: {
                        name: '404错误页'
                    },
                    hide: false
                }
            ]
        },
        
        {
            path: '/login',
            name: 'login',
            component: Login,
            meta: {
                name: '登录',
                icon: 'example'
            },
            hide: true
        }
    ]
});
hook(router);
export default router;
