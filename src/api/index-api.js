import request from '../utils/request';

// 统计信息
const statisticsInfo = data =>
    request.get('/backend/dashboard/statistics', {
        params: data
    });

const scanInfo = data =>
    request.get('/backend/dashboard/scan', {
        params: data
    });

export { statisticsInfo, scanInfo };
