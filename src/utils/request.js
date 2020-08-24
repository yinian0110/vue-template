import axios from 'axios';
import { Notification } from 'element-ui';
import qs from 'qs';
import Vue from 'vue';
let that = Vue.prototype;
import Encryption from './encryption';

const request = axios.create({
    baseURL: process.env.VUE_APP_REQ_BASEURL_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    },
    withCredentials: true
});

request.interceptors.request.use(
    config => {
        let Token = localStorage.getItem('UserToken');
        let { method, params, data } = config;
        //携带 自定义Token
        config.headers['Authorization'] = `Bearer ${Token}`;
        //增加 ts 时间戳
        config.params = params || {};
        config.params.ts = Encryption.time();
        console.log(config.headers['Content-Type']);
        if (config.headers['Content-Type'].indexOf('json') !== -1) {
            config.data = JSON.stringify(data);
        } else if (['POST', 'PUT', 'DELETE'].includes(method.toUpperCase())) {
            config.data = qs.stringify(data);
        }

        return config;
    },
    error => {
        Promise.reject(error);
    }
);

request.interceptors.response.use(
    response => {
        try {
            let { status, data } = response;
            if (status === 200 && data.f === 1) {
                return Promise.resolve(data);
            } else {
                throw data;
            }
        } catch (error) {
            Notification.error({
                title: '错误',
                message: error.m || error
            });
            return Promise.reject(error);
        }
    },
    error => {
        // console.log(error)
        Notification.error({
            title: '错误',
            message: error.m || error
        });
        return Promise.reject(error);
    }
);

export default request;
