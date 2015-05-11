;(function($){
    /**
     * 验证数据构造函数
     * @param options {Object} 配置项，参照validator._config
     * @return validator
     */
    function validator(options){
        //合并配置项
        this._options = $.extend(true,{},validator._config,options);
        //记录验证规则
        this._validatorRule = $.extend({}, validator._rules);
        //扩展验证规则
        validator._bridge(this, 'extendRule', this._options.rules);
        //记录验证数据
        this._validatorData = {};
        //记录验证地图
        this._validatorMap = {};
        //记录关联依赖列表
        this._referQueue = {};
        //设置验证地图
        validator._bridge(this, 'createItem', this._options.map);
        //设置初始验证禁用项
        validator._bridge(this, 'disabled', this._options.disabled);
        //扩展对象原型链
        if(!validator._instantiation){
            for(var i in validator){
                if(i.indexOf('_') < 0){
                    validator.prototype[i] = validator[i];
                }
            }
            validator._instantiation = true;
        }
        //触发初始化完毕回调函数
        $.isFunction(this._options.onCreate) && this._options.onCreate.call(this);
        //触发全局钩子事件函数
        $.isFunction(validator._hook.onCreate) && validator._hook.onCreate.call(this);
    }
    /**
     * 设置对象成员方法属性
     * @return void
     */
    validator._bridge = function(obj, name, param){
        if(typeof 'name' == 'string'){
            if((name in validator) && $.isFunction(validator[name])){
                return validator[name].apply(obj, Array.prototype.slice.call(arguments, 2));
            }
        }
    }
    /**
     * 设置关联依赖
     * @return void
     */
    validator.setRefer = function(item, name){
        $.isArray(item) || (item = [item]);
        $.isArray(name) || (name = [name]);
        name = $.grep(name,function(v,i){
            return v && typeof v == 'string';
        });
        for(var i = 0; i < item.length; i++){
            if(validator._bridge(this, 'isItem', item[i])){
                var _join = item[i].use('get','join');
                $.isArray(_join) ? $.unique(_join, name) : (_join = name);
                item[i].use('set', 'join', name);
            }
        }
    }
    /**
     * 删除关联依赖
     * @return void
     */
    validator.delRefer = function(item, name){
        $.isArray(item) || (item = [item]);
        $.isArray(name) || (name = [name]);
        for(var i = 0; i < item.length; i++){
            if(validator._bridge(this, 'isItem', item[i])){
                var _join = item[i].use('get','join');
                if($.isArray(_join)){
                    var _arr = $.grep(_join, function(n,i){
                        return $.inArray(n, name)
                    });
                    item[i].use('set','join', _arr);
                }
            }
        }
    }
    /**
     * 获取关联依赖
     * @return void
     */
    validator.getRefer = function(item){
        $.isArray(item) && (item = item[0]);
        if(validator._bridge(this, 'isItem', item)){
            return item.use('get','join');
        }
        return [];
    }
    /**
     * 获取关联依赖验证项
     * @return void
     */
    validator.getReferItem = function(item){
        $.isArray(item) && (item = item[0]);
        var _items = [];
        if(validator._bridge(this,'isItem', item)){
            var _joins = validator._bridge(this,'getRefer', item), _jl = _joins.length;
            for(var j = 0; j < _jl; j++){
                _items = _items.concat(validator._bridge(this, 'getItem', '.'+_joins[j]));
            }
        }
        return _items;
    }
    /**
     * 扩展验证规则
     * @return void
     */
    validator.extendRule = function(name, rule){
        var _obj = name;
        if(typeof _obj == 'string'){
            _obj = {};
            _obj[name] = rule;
        }
        if($.isPlainObject(_obj)){
            $.extend(this._validatorRule, _obj);
        }
    }
    /**
     * 添加验证信息项
     * @param item {Object} 验证信息的数据结构，如{id:'test', name: 'test', rule: 'require', type: 'regex', must: true}
     * @return item
     */
    validator.createItem = function(item){
        if(arguments.length){
            var _list = validator._bridge(this,'_revise', item);
            var _items = [];
            if($.isArray(_list)){
                var _length = _list.length;
                if(_length){
                    this._validatorMap.alone || (this._validatorMap.alone = {});
                    this._validatorMap.many || (this._validatorMap.many = {});
                    for(var i = 0; i < _length; i++){
                        _list[i] = validator._bridge(this, '_fixture', _list[i]);
                        _list[i].__parent = this;
                        _list[i]['__alone'] = {
                            _source : this._validatorMap.alone,
                            _id: _list[i]['id']
                        }
                        this._validatorMap.alone[_list[i]['id']] = _list[i];
                        if(typeof _list[i]['name'] == 'string'){
                            if(!$.isArray(this._validatorMap.many[_list[i]['name']])){
                                this._validatorMap.many[_list[i]['name']] = [];
                            }
                            this._validatorMap.many[_list[i]['name']].push(_list[i]);
                            _list[i]['__many'] = {
                                _source : this._validatorMap.many[_list[i]['name']],
                                _index : this._validatorMap.many[_list[i]['name']].length - 1
                            }
                        }
                        validator._bridge(this, 'setRefer', _list[i], _list[i]['join']);
                        _items.push(_list[i]);
                    }
                }
            }
            if(_items.length <= 1){
                return _items[0];
            }
            return _items;
        }
    }
    /**
     * 移除验证信息项
     * @param mask {String} id或name的标识字符串，如'#id'或'.name'
     * @return number
     */
    validator.removeItem = function(mask){
        if(typeof mask == 'string'){
            var _source = validator._bridge(this, 'getItem', mask);
            if($.isArray(_source)){
                var _length = _source.length;
                for(var i = _source.length - 1; i >= 0; i--){
                    var _alone = _source[i]['__alone']['_source'];
                    var _id = _source[i]['__alone']['_id'];
                    var _many = _source[i]['__many']['_source'];
                    var _index = _source[i]['__many']['_index'];
                    delete _alone[_id];
                    _many.splice(_index, 1);
                }
                return _length;
            }
        }
    }
    /**
     * 获取验证信息
     * @param mask {String} id或name的标识字符串，如'#id'或'.name'
     * @return items
     */
    validator.getItem = function(mask){
        if(typeof mask == 'string'){
            var _source = [];
            validator._bridge(this, '_getMaskCallback', mask, function(id){
                for(var i in this._validatorMap.alone){
                    if(this._validatorMap.alone[i]['id'] == id || this._validatorMap.alone[i]['__id'] == id){
                        _source.push(this._validatorMap.alone[i]);
                        break;
                    }
                }
            },function(name){
                for(var i in this._validatorMap.many){
                    if(i == name){
                        _source = _source.concat(this._validatorMap.many[name]);
                        break;
                    }
                }
            });
            return _source;
        }
    }
    /**
     * 判断是否为有效验证单项
     * @return boolean
     */
    validator.isItem = function(item){
        var _result = true;
        if($.isArray(item)){
            for(var i = 0; i < item.length; i++){
                if(!(item[i] instanceof validator._fixture)){
                    _result = false;
                    break;
                }
            }
        }else{
            _result = item instanceof validator._fixture;
        }
        return _result;
    }
    /**
     * 验证数据
     * @param data {String|Object|Number} 待验证的数据，可以为字符串数字类型也可以是一组配置项如：[{name:'test',value:'test'}]
     * @param rule {Item} 验证信息项，未指定取初始化配置验证项
     * @return boolean
     */
    validator.check = function(data,rule){
        var _data = validator._bridge(this,'_formatData', data, rule),
            _rule = rule,
            _status = true,
            _result = true,
            _isItem = validator._bridge(this,'isItem',_rule),
            _refers = [],
            _items = [],
            _length = 0,
            _total = 0;
        this._validatorData = $.extend(this._validatorData, _data);
        if(_isItem){
            _rule = validator._bridge(this,'_formatRule',rule);
        }else{
            _rule = this._validatorMap.many;
        }
        for(var i in _rule){
            _length = _rule[i].length;
            _result = true;
            for(var j = 0; j < _length; j++){
                _refers = validator._bridge(this,'getReferItem',_rule[i][j]);
                _items = _refers.concat(_rule[i][j]);
                _total = _items.length;
                for(var k = 0; k < _total; k++){
                    if(!_items[k].use('check',_data[_items[k]['name']] || '')){
                        _result = false;
                        _status = false;
                        break;
                    }
                }
                if(!_result){
                    break;
                }
            }
        }
        return _status;
    }
    /**
     *  格式化验证数据
     * @return Object
     */
    validator._formatData = function(data,rule){
        var _data = data, _proxy = {}, _value = '';
        if(!$.isArray(_data)){
            _value = _data;
            _data = [];
        }
        for(var i = 0; i < _data.length; i++){
            if($.isPlainObject(_data[i]) && ('name' in _data[i])){
                if(!_proxy[_data[i]['name']]){
                    _proxy[_data[i]['name']] = _data[i]['value'];
                }else{
                    if(!$.isArray(_proxy[_data[i]['name']])){
                        _proxy[_data[i]['name']] = [_proxy[_data[i]['name']]];
                    }
                    _proxy[_data[i]['name']].push(_data[i]['value']);
                }
            }
        }
        if(!$.isArray(rule)){
            for(var i in this._validatorMap.many){
                (i in _proxy) || (_proxy[i] = _value);
            }
        }else{
            for(var i = 0; i < rule.length; i++){
                if(validator._bridge(this, 'isItem', rule[i])){
                    if(!(rule[i]['name'] in _proxy)){
                        _proxy[rule[i]['name']] = '';
                    }
                }
            }
        }
        return _proxy;
    }
    /**
     *  格式化验证规则
     * @return Object
     */
    validator._formatRule = function(rule){
        var _proxy = {}, _rule = $.isArray(rule) ? rule : [rule];
        for(var i = 0; i < _rule.length; i++){
            if(validator._bridge(this,'isItem',rule[i])){
                if(!(rule[i]['name'] in _proxy)){
                    _proxy[rule[i]['name']] = [];
                }
                _proxy[rule[i]['name']].push(rule[i]);
            }
        }
        return _proxy;
    }
    /**
     * 禁用验证
     * @return number
     */
    validator._disabled = function(mask, status){
        status = typeof status == 'undefined' ? true : status ? true : false;
        if(!$.isArray(mask)){
            mask = [mask];
        }
        var _number = 0;
        for(var i = 0; i < mask.length; i++){
            if(typeof mask[i] == 'string'){
                var _source = validator._bridge(this, 'getItem', mask[i]);
                if($.isArray(_source)){
                    var _length = _source.length;
                    for(var i = 0; i < _source.length; i++){
                        _source[i].use('disabled', status);
                        ++_number;
                    }
                }
            }
        }
        return _number;
    }
    /**
     * 禁用验证
     * @return number
     */
    validator.disabled = function(mask){
        return validator._bridge(this, '_disabled', mask, true);
    }
    /**
     * 启用验证
     * @return number
     */
    validator.enable = function(mask){
        return validator._bridge(this, '_disabled', mask, false);
    }
    /**
     * 根据标识处理回调
     * @return void
     */
    validator._getMaskCallback = function(mask,callback1,callback2){
        if(typeof mask == 'string'){
            var _isId = false, _mask = mask;
            if(mask.indexOf('#') == 0){
                _isId = true;
                _mask = _mask.substr(1);
            }else if(mask.indexOf('.') == 0){
                _mask = _mask.substr(1);
            }
            if(_isId){
                $.isFunction(callback1) && callback1.call(this,_mask);
            }else{
                $.isFunction(callback2) && callback2.call(this,_mask);
            }
        }
    }
    //记录名称累加值
    validator._cumulation = (new Date()).getTime();
    //校正验证信息
    validator._revise = function(rule,must,type){
        var i = 0, l = 0, info = rule;
        if($.isPlainObject(info)){
            info = [info];
        }else if(!$.isArray(info)){
            info = [{
                rule : info,
                must : typeof must == 'undefined' ? true : must ? true : false
            }]
        }
        l = info.length;
        for(;i < l; i++){
            var _id = '__'+(validator._cumulation++)+'__';
            if(typeof info[i].rule == 'undefined'){
                info[i].rule = null;
            }
            if(typeof info[i].must == 'undefined'){
                info[i].must = true;
            }
            if(typeof info[i].id == 'undefined'){
                info[i].id =  _id;
            }
            if(typeof info[i]._disabled == 'undefined'){
                info[i]._disabled =  false;
            }else{
                info[i]._disabled = info[i]._disabled ? true : false;
            }
            info[i].__id = _id;
        }
        return info;
    }
    //扩展验证信息对象
    validator._fixture = function(item){
        if(!(this instanceof validator._fixture)){
            return new validator._fixture(item);
        }
        $.extend(this,item,{
            _switch : true
        });
        if('use' in this){
            this._use = this.use;
            delete this.use;
        }
        this.use = function(name, param){
            var method = name;
            Array.prototype.splice.call(arguments, 0,  1);
            Array.prototype.unshift.call(arguments, this, '_fixture_'+method);
            return validator._bridge.apply(null, arguments);
        }
    }
    //验证数据
    validator._fixture_check = function(data){
        //检测是否禁用
        if(this.use('get','disabled')){
            return;
        }
        if(!this.must && (!data || !data.length)){
            return true;
        }
        //验证前触发回调事件
        var _result = validator._bridge(this, '__fixture_callback', this.onBefore, data) &&
        validator._bridge(this, '__fixture_callback', this.__parent._options.onBefore, data) &&
        validator._bridge(this, '__fixture_callback', validator._hook.onBefore, data);
        if(_result !== false){
            var _rule = this.rule, _params = [], _neg = false;
            _result = false
            if(typeof _rule == 'string'){
                var _pattern = _rule.match(/^(\!)?(\w+)?(?:\((.*)?\)$)?/);
                if($.isArray(_pattern)){
                    _neg = _pattern[1] ? true : false;
                    _rule = _pattern[2];
                    _params = _pattern[3] ? _pattern[3].split(',') : [];
                    if(_rule in this.__parent._validatorRule){
                        _rule = this.__parent._validatorRule[_rule];
                    }else{
                        $.error('获取验证方法失败！');
                    }
                }else{
                    $.error('解析验证规则失败！');
                }
            }
            _params.unshift(data);
            if($.isFunction(_rule)){
                _result = _rule.apply(this, _params);
                _neg && (_result = !_result);
            }
        }else{
            _result = false;
        }
        //验证后触发回调事件
        validator._bridge(this, '__fixture_callback', this.onAfter, _result, data) &&
        validator._bridge(this, '__fixture_callback', this.__parent._options.onAfter, _result, data) &&
        validator._bridge(this, '__fixture_callback', validator._hook.onAfter, _result, data);
        return _result;
    }
    //禁用
    validator._fixture_disabled = function(){
        this._disabled = true;
        return this;
    }
    //启用
    validator._fixture_enable = function(){
        this._disabled = false;
        return this;
    }
    //获取值
    validator._fixture_get = function(name){
        if(typeof name == 'string' && name.indexOf('_') < 0){
            name = '_'+name;
            if(name in this){
                return this[name];
            }
        }
    }
    //设置值
    validator._fixture_set = function(name, value){
        if(typeof name == 'string' && name.indexOf('_') < 0){
            this['_'+name] = value;
        }
        return this;
    }
    //执行回调函数
    validator.__fixture_callback = function(callback, params){
        if($.isFunction(callback)){
            if(callback.apply(this, Array.prototype.slice.call(arguments, 1)) === false){
                return false;
            }
        }
        return true;
    }
    //记录是否实例化过
    validator._instantiation = false;
    //默认配置
    validator._config = {
        //验证地图
        map: null,
        //禁用的验证信息
        disabled: null,
        //验证前
        onBefore : null,
        //验证后
        onAfter : null,
        //验证规则
        rules: null
    }
    //钩子事件
    validator._hook = {
        //验证前
        onBefore : null,
        //验证后
        onAfter : null,
        //实例化后
        onCreate: null
    }
    //常用验证方法
    validator._rules = {
        //是否数字
        numeric : function(data){
            return $.isNumeric(data);
        },
        //验证不为空
        require : function(data){
            return /[^\s]+/.test(data);
        },
        //验证为空
        empty : function(data){
            return /^[\s]+$/.test(data);
        },
        //验证手机号
        mobile: function(data){
            return /^(((13[0-9]{1})|(15[0-9]{1}))+d{8})$/.test(data);
        },
        //验证电话号码
        tel: function(data){
            return /^\d{3,4}-?\d{7,9}$/.test(data);
        },
        //邮政编码
        zipCode : function(data){
            return /^[0-9]{6}$/.test(data);
        },
        //验证中文
        cn: function(data){
            return /^[\u4e00-\u9fa5]+$/.test(data);
        },
        //验证邮箱
        email: function(data){
            return /[\w!#$%&'*+\/=?^_`{|}~-]+(?:\.[\w!#$%&'*+\/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/.test(data);
        },
        //网址url
        url: function(data){
            return /[a-zA-z]+:\/\/[^\s]*/.test(data);
        },
        //QQ号
        qq: function(data){
            return /[1-9][0-9]{4,}/.test(data);
        },
        //身份证
        identity : function(data){
            return /^(\d{6})(\d{4})(\d{2})(\d{2})(\d{3})([0-9]|X)$/.test(data);
        },
        //ip地址
        ip : function(data){
            return /\d+\.\d+\.\d+\.\d+/.test(data);
        },
        //年-月-日
        date: function(data){
            return /([0-9]{3}[1-9]|[0-9]{2}[1-9][0-9]{1}|[0-9]{1}[1-9][0-9]{2}|[1-9][0-9]{3})-(((0[13578]|1[02])-(0[1-9]|[12][0-9]|3[01]))|((0[469]|11)-(0[1-9]|[12][0-9]|30))|(02-(0[1-9]|[1][0-9]|2[0-8])))/.test(data);
        },
        //正整数
        positive: function(data){
            return /^[1-9]\d*$/.test(data);
        },
        //负整数
        negative: function(data){
            return /^-[1-9]\d*$/.test(data);
        },
        //正浮点数
        pfloat: function(data){
            return /^[1-9]\d*\.\d*|0\.\d*[1-9]\d*$/.test(data);
        },
        //负浮点数
        nfloat: function(data){
            return /^-[1-9]\d*\.\d*|-0\.\d*[1-9]\d*$/.test(data);
        },
        //验证字符串或数组长度
        length : function(data, start, end){
            var _length = data.length;
            if(start == 'null'){
                start = 0;
            }
            if(end == 'null'){
                end = _length;
            }
            if(end){
                return start <= _length && _length <= end;
            }else{
                return _length == start;
            }
        },
        //判断数值是否相等
        equal : function(data, value){
            return data == value;
        },
        //验证是否在某个范围内
        'in' : function(data,range){
            data = $.isArray(data) ? data : [data];
            range = Array.prototype.slice.call(arguments, 1);
            for(var i = 0; i < range.length; i++){
                for(var j = 0; j < data.length; j++){
                    if(range[i] == data[j]){
                        return true;
                    }
                }
            }
            return false;
        },
        //验证最大值
        max: function(data,max){
            return Number(data) <= Number(max);
        },
        //验证最小值
        min: function(data,min){
            return Number(data) >= Number(min);
        },
        //匹配两个字段值是否相等
        field: function(data, field){
            return data == (this.__parent._validatorData[field] || '');
        }
    }
    //在jquery对象上绑定一个快速验证实例
    $.validator = function(options){
        return new validator(options);
    }
    //暴露构造函数
    $.validator.constructor = validator;
    //设置配置项
    $.validator.setConfig = function(options){
        $.extend(validator._config, options);
    }
    //获取配置项
    $.validator.getConfig = function(name){
        if(typeof name == 'string'){
            return validator._config[name];
        }
    }
    //设置钩子
    $.validator.setHook = function(options){
        $.extend(validator._config, options);
    }
    //获取钩子
    $.validator.getHook = function(name){
        if(typeof name == 'string'){
            return validator._config[name];
        }
    }
})(jQuery);