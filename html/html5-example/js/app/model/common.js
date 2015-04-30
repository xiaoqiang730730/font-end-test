define(['jquery', './config'], function ($, config) {
    var common = {
        jsonp: function (url, params, success, error) {
            var st = true;
            $.ajax({
                url: url,
                dataType: 'jsonp',
                timeout: 5000,
                data: (params ? params : {}),
                success: function (data) {
                    st = false;
                    success(data);
                }
            });
            if (error) {
                setTimeout(function () {
                    if (st) {
                        error();
                    }
                }, config.ajax.timeout);
            }
        }
    };

    return common;
});