define('project/index/validator',function(require,exports,module){
    //载入验证插件
    require('component/jquery-plugs/jquery.validator');
    //载入jquery.form插件
    require('component/jquery.form');
    
    //将表单元素序列化为对象字面量
    //$(form).serializeArray() 获取到的是[Object,Object,Object] Object={name:"",value:""}
    //装换成对象字面量Object{}
    //
    function serializeObject(form){
        var _object = {};
        if(form.nodeName == 'FORM'){
            var _value = $(form).serializeArray();
            for(var i = 0;i < _value.length; i++){
                _object[_value[i]['name']] = _value[i]['value'];
            }
        }
        return _object;
    }

    $.fn.clearValidate = function(){
        $(this).find('[name]').each(function(){
            element = $(this);
            var _group = element.closest('.form-item');
            var _msg = _group.find('.field-msg');
            _group.removeClass('has-error has-success');
            _msg.html(_msg.data('defalut-msg'));
        });
    };
    $.fn.submitForm = function(options){
        var _form = $(this);
        var _options = $.extend({
            validate : null, //验证规则
            autoValidate: false, //自动验证
            type: 'post',
            handler: _form.find(':submit'),
            controlPoint: null, //添加检测值发生改变回调函数
            onBefore: null, //表单提交前触发函数
            onAfter: null, //表单提交后触发函数
            loadingTpl: '<span class="form-loading">提交中...</span>'
        }, options);

        var _origValue = _form.serializeArray();
        var _origLength = _origValue.length;
        var _onComplete = _options.complete;
        //实例化验证实例
        var _validator = $.validator({
            map : _options.validate,
            onAfter: function(status,data){
                var _element = $('[name='+this.name+']');
                if(status === true){
                    // fetchSuccess.call(this, _element);
                }else{
                    fetchError.call(this, _element);
                }
            },
            onCreate: function(){
                var _validator = this;
                var _activeElement = false;
                _form.find('[name]').click(function(event){
                    _activeElement = $(this);
                    fetchDefatul(_activeElement);
                    if(_options.autoValidate && this.nodeName == 'INPUT' && this.type == 'checkbox'){
                        check.call(_validator,_activeElement,_form);
                    }
                    event.stopPropagation();
                }).keyup(function(){
                    fetchDefatul($(this));
                }).closest('label').click(function(event){
                    event.stopPropagation();
                });
                $(document).bind('click',function(){
                    if(_activeElement && _options.autoValidate){
                        check.call(_validator,_activeElement,_form);
                    }
                    _activeElement = false;
                });
            }
        });
        _options.url = _options.url || $(this).attr('action');
        _options.type = _options.type || $(this).attr('method') || 'POST';
        // _options.handler.length || (_options.handler = _form.data('submitButton'));
        // //记录按钮默认值
        // _options.handler.each(function(){
        //     $(this).data('text', $(this).val() || $(this).text());
        // });
        _options.beforeSend = function(){
            var _status = true;
            var _data = _form.serializeArray();
            _status = _validator.check(_data);
            _options.handler.length || (_options.handler = _form.data('submitButton'));
            //记录按钮默认值
            _options.handler.each(function(){
                var _btn = $(this).find('input,button');
                if(_btn.length){
                    $(this).data('text', _btn.val() || _btn.text());
                }else{
                    $(this).data('text', $(this).html() || $(this).val());
                }
            });
            if(_status){
                _disabledForm();
            }
            return _status;
        }
        _options.complete = function(){
            _activeForm();
            $.isFunction(_onComplete) && _onComplete.call(this);
        };
        _options.success = function(data){
            if(!data.status){
                if($.isPlainObject(data)){
                    var _first = null, _number = 0;
                    for(var i in data.info){
                        _number || (_first = _form.find('[name='+i+']'));
                        fetchError(_form.find('[name='+i+']'), data.info[i]);
                        _number++;
                    }
                    // _first && _first.focus().select();
                }
            }
            $.isFunction(_options.onAfter) && _options.onAfter(data, _options);
        };
        _form.append(_options.loadingTpl);
        _form.submit(function(event){
            if(_options.uploadFile !== true){
                _options.data = $.extend({}, _options.data, serializeObject(_form[0]));
            }
            _options.url = _form.attr('action');
            _options.type = _form.attr('method') || 'post';
            if($.isFunction(_options.onBefore)){
                _status = _options.onBefore.call(_form, _options);
                if(_status === false){
                    return false;
                }
            }
            if(_options.uploadFile === true){
                _form.ajaxSubmit(_options);
            }else{
                $.ajax(_options);
            }
            return false;
        });
        $.isFunction(_options.controlPoint) && _options.controlPoint.call(_form, valueChange);
        
        //验证
        function check(element,form){
            var _group = element.closest('.form-item');
            var _name = element.attr('name');
            var _items = this.getItem(_name);
            var _join = ['[name='+_name+']'];
            $.each(_items,function(){
                if(!this.must){
                    fetchDefatul(element);
                }
                if($.isArray(this.join)){
                    for(var i = 0; i < this.join.length; i++){
                        _join.push('[name='+this.join[i]+']');
                    }
                }
            });
            _join = _join.join(',');
            this.check(form.serializeArray(), _items);
        }
        //验证成功
        function fetchSuccess(element,message){
            var _group = element.closest('.form-item');
            var _msg = _group.find('.field-msg');
            if(!_msg.length){
                _msg = $('<span class="field-msg"></span>');
                _group.find('[name]').after(_msg);
            }
            _group.addClass('has-success').removeClass('has-error');
            _msg.html(message || _msg.data('defalut-msg'));
        }
        //验证失败
        function fetchError(element,message){
            var _group = element.closest('.form-item');
            var _msg = _group.find('.field-msg');
            if(!_msg.length){
                _msg = $('<span class="field-msg"></span>');
                _group.find('[name]').after(_msg);
            }
            _group.addClass('has-error').removeClass('has-success');
            if(typeof _msg.data('defalut-msg') == 'undefined'){
                _msg.attr('data-defalut-msg', _msg.html());
            }
            _msg.html(message || this.msg);
        }
        //恢复默认
        function fetchDefatul(element){
            if(element){
                var _group = element.closest('.form-item');
                var _msg = _group.find('.field-msg');
                _group.removeClass('has-error has-success');
                _msg.html(_msg.data('defalut-msg'));
            }
        }
        //激活表单状态
        function _activeForm(){
            _form.removeClass('form-posting');
            _options.handler.each(function(){
                var _text = $(this).data('text');
                var _parent = $(this).closest('.w-btn');
                if(!_parent.length){
                    _parent = $(this);
                }
                var _btn = _parent.find('input,button');
                if(!_btn.length){
                    _btn = _parent;
                    _btn.html(_text);
                }else{
                    _btn.val(_text);
                }
                _btn.prop('disabled', false);
                _parent.removeClass('btn-loading');
            });
        }
        //禁用表单状态
        function _disabledForm(){
            _form.addClass('form-posting');
            _options.handler.each(function(){
                var _parent = $(this).closest('.w-btn');
                if(!_parent.length){
                    _parent = $(this);
                }
                var _btn = _parent.find('input,button');
                if(!_btn.length){
                    _btn = _parent;
                    _btn.text('提交中');
                }else{
                    _btn.val('提交中');
                }
                _btn.prop('disabled', true);
                _parent.addClass('btn-loading');
            });
        }
    };
})
