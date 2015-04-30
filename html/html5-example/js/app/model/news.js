define(['jquery', './config', './common'], function ($, config, common) {
    var news = {
        getAllCategory: function (success, error) {
            var url = config.baseUrl + config.api.news.category;
            common.jsonp(url, null, success, error);
        },
        getList: function (params, success, error) {
            var url = config.baseUrl + config.api.news.list;
            common.jsonp(url, params, success, error);
        },
        getDetail: function (id, success, error) {
            var url = config.baseUrl + config.api.news.detail;
            common.jsonp(url, {id: id}, success, error);
        },
        search: function (tag, p, success, error) {
            var url = config.baseUrl + config.api.news.list;
            common.jsonp(url, {tag: tag, p: p}, success, error);
        }
    };
    return news;
});