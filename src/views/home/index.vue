<template>
    <div class="home_page">
        <div class="home_data">
            <div class="total_box">
                <div class="total_item">
                    <div class="title">今日访问量（PV）</div>
                    <div class="info">{{dataInfo.pv}}</div>
                </div>
                <div class="total_item">
                    <div class="title">今日访客量（UV）</div>
                    <div class="info">{{dataInfo.uv}}</div>
                </div>
                <div class="total_item">
                    <div class="title">今日长按人数</div>
                    <div class="info">{{dataInfo.press_num}}</div>
                </div>
                <div class="total_item">
                    <div class="title">剩余长按人数</div>
                    <div class="info">{{dataInfo.remain_press_num}}</div>
                </div>
            </div>
        </div>
        <div class="home_content">
            <div class="content_title">
                <div class="left">扫码人数</div>
                <div class="right">
                    <el-radio-group v-model="search.date" @change="changeDateSelect" size="small" text-color="#409EFF">
                        <el-radio-button v-for="(template, index) in radioTemplates" :key="index" :label="template.value" >{{template.label}}</el-radio-button>
                    </el-radio-group>
                </div>
            </div>
            <div class="content_echarts">
                <div class="echarts" ref="echarts"></div>
            </div>
        </div>
    </div>
</template>

<script>
// 引入 ECharts 主模块
const Echarts = require('echarts/lib/echarts');
// 引入折线图
require('echarts/lib/chart/line');
require('echarts/lib/component/tooltip');
// 引入提示框和标题组件
require('echarts/lib/component/title');
// 引入legend组件
require('echarts/lib/component/legend');

import { statisticsInfo, scanInfo } from '@/api/index-api';

export default {
    name: 'home',
    data() {
        return {
            dataInfo: {
                pv: '',
                uv: '',
                press_num: '',
                remain_press_num: ''
            },
            // dateSelect: `${new Date().getTime()}#${new Date().getTime() - 3600 * 1000 * 24 * 7}`,
            search: {
                date: 'week' //month或week
            },
            radioTemplates: [
                // {
                //     label: '今日',
                //     value: `${new Date().getTime()}#${new Date().getTime() - 3600 * 1000 * 24}`
                // },
                // {
                //     label: '昨日',
                //     value: `${new Date().getTime()}#${new Date().getTime() - 3600 * 1000 * 24 * 2}`
                // },
                {
                    label: '近7天',
                    value: 'week'
                },
                {
                    label: '近30天',
                    value: 'month'
                }
            ],
            reportEchartsData: {}
        };
    },
    mounted() {
        this.getStatisticsInfo();
        this.getDataReport();
    },
    methods: {
        /**
         * 统计信息
         */
        getStatisticsInfo() {
            statisticsInfo().then(res => {
                this.dataInfo = res.d;
            });
        },
        /**
         * 图表
         */
        getDataReport() {
            const data = this.search;
            scanInfo(data).then(res => {
                this.reportEchartsData = res.d;
                this.initECharts();
            });
        },
        /**
         * 选择时间
         */
        changeDateSelect() {
            this.getDataReport();
        },
        /**
         * 格式化时间
         */
        getdate(time) {
            const timeDate = new Date(parseInt(time, 10));
            const y = timeDate.getFullYear();
            const m = timeDate.getMonth() + 1;
            const d = timeDate.getDate();
            return `${y}-${m < 10 ? `0${m}` : m}-${d < 10 ? `0${d}` : d} ${timeDate.toTimeString().substr(0, 8)}`;
        },
        initECharts() {
            const echarts = Echarts.init(this.$refs.echarts);
            // 绘制图表
            echarts.setOption({
                tooltip: {
                    trigger: 'axis'
                },
                legend: {
                    data: [this.reportEchartsData.data[0].name, this.reportEchartsData.data[1].name, this.reportEchartsData.data[2].name]
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                toolbox: {
                    feature: {
                        saveAsImage: {}
                    }
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: this.reportEchartsData.key
                },
                yAxis: {
                    type: 'value'
                },
                series: [
                    {
                        name: this.reportEchartsData.data[0].name,
                        type: 'line',
                        stack: this.reportEchartsData.data[0].name,
                        data: this.reportEchartsData.data[0].data
                    },
                    {
                        name: this.reportEchartsData.data[1].name,
                        type: 'line',
                        stack: this.reportEchartsData.data[1].name,
                        data: this.reportEchartsData.data[1].data
                    },
                    {
                        name: this.reportEchartsData.data[2].name,
                        type: 'line',
                        stack: this.reportEchartsData.data[2].name,
                        data: this.reportEchartsData.data[2].data
                    }
                ]
            });
        }
    }
};
</script>
<style lang="scss">
.el-radio-button__orig-radio:checked + .el-radio-button__inner {
    background-color: #fff;
    border-color: #1890ff;
    -webkit-box-shadow: -1px 0 0 0 #1890ff;
    box-shadow: -1px 0 0 0 #1890ff;
}
.el-radio-button__orig-radio:hover + .el-radio-button__inner {
    border-color: #1890ff;
    box-shadow: -1px 0 0 0 #1890ff;
}
</style>
<style lang="scss" scoped>
.home_page {
    .home_data {
        background: #fff;
        .total_box {
            display: flex;
            padding: 30px 0 24px 0;
            .total_item {
                width: 25%;
                text-align: center;
                border-right: 1px solid #efefef;
                padding: 10px 0;
                .title {
                    font-size: 16px;
                    color: #969696;
                    margin-bottom: 10px;
                }
                .info {
                    font-size: 24px;
                    color: #444;
                }
            }
            .total_item:nth-child(4) {
                border-right: 0;
            }
        }
    }
    .home_content {
        background: #fff;
        margin-top: 20px;
        padding: 20px;
        .content_title {
            display: flex;
            justify-content: space-between;
            justify-items: center;
            border-bottom: 1px solid #f5f5f5;
            padding-bottom: 16px;
            .left {
                margin-top: 8px;
            }
        }
        .content_echarts {
            margin-top: 30px;
            .echarts {
                width: 100%;
                height: 500px;
                margin: 0 auto;
            }
        }
    }
}
</style>
