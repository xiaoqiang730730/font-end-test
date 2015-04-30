define(['jquery', './config', './common'], function ($, config, common) {
    var circle = {
        getList: function (params, success, error) {
            var url = config.baseUrl + config.api.circle.list;
            common.jsonp(url, params, success, error);
        },
        getDetail: function (id, success, error) {
            var url = config.baseUrl + config.api.circle.detail;
            common.jsonp(url, {id: id}, success, error);
        },
        search: function (tag, p, success, error) {
            var url = config.baseUrl + config.api.circle.list;
            common.jsonp(url, {tag: tag, p: p}, success, error);
        }
    };
    return circle;
});