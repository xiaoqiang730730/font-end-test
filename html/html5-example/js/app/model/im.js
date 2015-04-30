/* global RongIMClient */

define(['jquery', 'model/config', 'model/common'], function ($, config, common) {
    var im = {
        token: '',
        init: function (success, error) {

        },
        onChanged: function (fun) {
            // 设置连接监听状态 （ status 标识当前连接状态）
            // 连接状态
            RongIMClient.setConnectionStatusListener({
                onChanged: function (status) {
                    fun(status);
                }
            });
        },
        onMessage: function (fun) {
            // 消息监听器
            RongIMClient.getInstance().setOnReceiveMessageListener({
                onReceived: function (message) {
                    // message:RongIMClient.RongIMMessage 子类
                    // 接收到消息处理逻辑
                    fun(message);
                }
            });
        },
        connect: function (success, error) {
            this.getToken(function (result) {
                if (!result.code) {
                    // 连接融云服务器。
                    RongIMClient.init(config.api.rong.appkey);
                    RongIMClient.connect(result.data.token, {
                        onSuccess: function (userId) {
                            success(userId);
                        },
                        onError: function (errorCode) {
                            error("Login failed." + errorCode.getValue(), "error message: " + errorCode.getMessage());
                        }
                    });
                } else {
                    if (error) {
                        error(result.msg);
                    }
                }
            }, function () {
                if (error) {
                    error('获取token失败');
                }
            });
        },
        getToken: function (success, error) {
            var url = config.baseUrl + config.api.rong.token;
            common.jsonp(url, null, success, error);
        }
    };

    return im;
});