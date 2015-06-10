;(function(HO){
	if(!HO){
		window.holy = HO = {};
	}
	if(!HO.controls){
		HO.controls = {};
	}
	function ctrls(params){
		var fn,i;
		fn = function(opts) {
			if (this.init) {
				return this.init(opts);
			}
			return this;
		};
		for(i in params) {
			fn.prototype[i] = params[i];
		};
		return fn;
	}
	HO.controls = {
		_data_controls_list: {},
		define: function(name, params) {
			var list = this._data_controls_list;
			if(!name || list[name]){
				return;
			}
			list[name] = ctrls(params);
		},
		get: function(name, params) {
			debugger;
			if(this._data_controls_list[name]) {
				console.log( new this._data_controls_list[name]);
				return new this._data_controls_list[name](params);
			}
			return false;
		}
	}
})(window.holy);