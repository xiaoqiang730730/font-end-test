define("project/index/login", function(require, exports, module) {
	require("project/index/validator");
	var init = {
		loginFormEle : $('#loginForm'),
		keepLoginEle : $(':checkbox[name="is_auto"]'),
		cooperateEle : $('.auth-cooperate .cooperate-list .item'),
		initial:function(){
			var self = this;
			console.log(this.loginFormEle);
		}
	};
	module.exports = init;
});