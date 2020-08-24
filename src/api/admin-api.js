import request from '../utils/request';

//用户登录
const adminLogin = data =>
    request.post('/auth/login', {
        ...data
    });

// 用户信息
const adminInfo = data =>
    request.post('/auth/profile', {
        ...data
    });

// 用户登出
const adminLoginOut = data =>
    request.post('/auth/logout', {
        ...data
    });

export { adminLogin, adminInfo, adminLoginOut };
