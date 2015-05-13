define("project/index/login", function(require, exports, module) {
	require("project/index/validator");
	var init = {
		loginFormEle : $('#loginForm'),
		keepLoginEle : $(':checkbox[name="is_auto"]'),
		cooperateEle : $('.auth-cooperate .cooperate-list .item'),
		initial:function(){
            var self = this;
            //记录验证码图片元素
            this.verifyImageEle = this.loginFormEle.find('.verity-code .code-image');
            //记录验证码输入框元素
            this.verifyTextEle = this.loginFormEle.find('.verity-code .code-input :text');
            //绑定提交登录表单操作
            this.loginFormEle.submitForm({
                autoValidate: false,
                onAfter: function(data){
                    if(data.status){
                        $.dialog.success(data.info);
                        self.synchroLogin(data.code, function(){
                            location.replace(data.url);
                        });
                    }else{
                        if(typeof data.info == 'string'){
                            $.dialog.error(data.info);
                        }
                        self.verifyImageEle.click();
                        self.verifyTextEle.val('');
                    }
                }
            });
            //首个表单元素获取焦点
            this.loginFormEle.find('input:first').focus();
            //绑定发送激活邮件操作
            this.loginFormEle.delegate('.field-msg a','click', function(){
                var _ele = $(this), _text = _ele.text(), _input = _ele.closest('.form-item').find(':text');
                if(!_ele.hasClass('loading')){
                    _ele.addClass('loading');
                    _ele.text('邮件发送中...');
                    _input.click();
                    $.dialog.loading('正在发送帐号激活邮件');
                    $.get(_ele.data('href'), function(data){
                        if(data.status){
                            $.dialog.success(data.info,{
                                time: 3000
                            });
                        }else{
                            $.dialog.error(data.info);
                        }
                        $.dialog.get('loading').close();
                        _ele.removeClass('loading');
                        _ele.text(_text);
                    });
                }
            });
            //记录第三方登陆元素原始链接地址
            $.each(this.cooperateEle, function(){
                if(!$(this).data('href')){
                    $(this).data('href', $(this).attr('href'));
                }
            });
        }
	};
	module.exports = init;
});