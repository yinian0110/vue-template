const path = require('path');
function resolve(dir) {
    return path.join(__dirname, '.', dir);
}
module.exports = {
    baseUrl: '/',
    productionSourceMap: false,
    devServer: {
        disableHostCheck: true
    },
    css: {
        loaderOptions: {
            css: {
                localIdentName: '[name]-[hash]',
                camelCase: 'only'
            }
        }
    },
    configureWebpack: {
        name: '测试SCRM',
        resolve: {
            alias: {
                '@': resolve('src')
            }
        }
    },
    chainWebpack: config => {
        config.module
            .rule('svg')
            .exclude.add(resolve('src/icons'))
            .end();
        config.module
            .rule('icons')
            .test(/\.svg$/)
            .include.add(resolve('src/icons'))
            .end()
            .use('svg-sprite-loader')
            .loader('svg-sprite-loader')
            .options({
                symbolId: 'icon-[name]'
            })
            .end();
    }
};
