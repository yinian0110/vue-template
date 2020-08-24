var vue = new Vue({
    el: '#app',
    data: {
        liveCodeInfo: {
            id: '6',
            title: '幸福生活',
            alias: '幸福生活的别名',
            type: '1',
            status: '1',
            custom_avatar: '自定义头像',
            settings: {
                repeat_add_disable: false,
                repeat_add_whitelist: {
                    enable: true,
                    bind: true
                },
                safe_verify: true,
                customer_service: true
            },
            custom_nickname: '自定义昵称',
            is_service_account: '0',
            guide_text_above: '上方提示文字',
            guide_text_below: '下方提示文字',
            company_id: '0',
            operator_id: '1',
            qrcode_image: 'http://qb2ofbct4.bkt.clouddn.com/278fbb7d0e9f98b061f008d1bfd35c39png',
            qrcode_id: '21',
            origin_url: 'http://127.0.0.1:80/frontend/live-code/hook/6',
            create_time: '2020-06-05 12:22:14',
            qrcode: {
                id: '21',
                livecode_id: '6',
                style: '2',
                title: '测试数据',
                alias: '',
                qrcode_image: 'https://taobao.com',
                refined_qrcode_image: '',
                qrcode_link: null,
                expire_time: '2020-05-28 17:12:54',
                auto_switch: '10',
                scan_count: 6,
                display: '1',
                create_time: '0000-00-00 00:00:00',
                scan_total: 26,
                status: '0'
            },
            timeOutEvent: 0
        }
    },
    mounted() {
        $('#app').show();
        // 拿到 liveCodeInfo 数据
    },
    methods: {
        showLayer() {
            var html = `<img style='width:200px;height:200px;' src='http://qb2ofbct4.bkt.clouddn.com/278fbb7d0e9f98b061f008d1bfd35c39png'>
        <div style="margin-top:10px">若无法加群，可添加客服微信</div><div style="color:#999;margin-top:5px">(长按识别二维码)</div>`;
            layer.open({
                content: html
            });
        },
        gtouchstart(item) {
            var that = this;
            that.timeOutEvent = setTimeout(function() {
                that.longPress(item);
            }, 500); //这里设置定时器，定义长按500毫秒触发长按事件，时间可以自己改
            return false;
        },
        //手释放，如果在500毫秒内就释放，则取消长按事件，执行click应该执行的事件
        gtouchend(item) {
            var that = this;
            clearTimeout(that.timeOutEvent); //清除定时器
            if (that.timeOutEvent != 0) {
                //这里写要执行的内容 点击 可不写
            }
            return false;
        },
        //如果手指有移动，则取消所有事件，此时说明用户只是要移动而不是长按
        gtouchmove() {
            var that = this;
            clearTimeout(that.timeOutEvent); //清除定时器
            that.timeOutEvent = 0;
        },

        //真正长按后应该执行的内容
        longPress(item) {
            var that = this;
            that.timeOutEvent = 0;
            //执行长按要执行的内容 调接口
            $.ajax({
                url: `http://192.168.1.30:12345/backend/live-code/pressTrigger?id=${this.liveCodeInfo.id}`, //判断是否进行淘宝授权
                type: 'GET',
                dataType: 'json',
                contentType: 'application/x-www-form-urlencoded',
                success: function() {
                    console.log('sucess');
                }
            });
        }
    }
});
