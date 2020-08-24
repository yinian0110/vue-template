// 文件上传
const upLoad = () => {
    return process.env.VUE_APP_REQ_BASEURL_URL + '/service/upload/index';
};

export { upLoad };
