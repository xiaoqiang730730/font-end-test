define(['jquery', './config', './common'], function ($, config, common) {
    var demand = {
        getAllCategory: function (success, error) {
            var url = config.baseUrl + config.api.demand.category;
            common.jsonp(url, null, success, error);
        },
        getList: function (params, success, error) {
            var url = config.baseUrl + config.api.demand.list;
            common.jsonp(url, params, success, error);
        },
        getDetail: function (id, success, error) {
            var url = config.baseUrl + config.api.demand.detail;
            common.jsonp(url, {id: id}, success, error);
        },
        search: function (tag, p, success, error) {
            var url = config.baseUrl + config.api.demand.list;
            common.jsonp(url, {tag: tag, p: p}, success, error);
        },
        getTags: function (category, group, success, error) {
            var url = config.baseUrl + config.api.demand.tags;
            common.jsonp(url, {category: category, group: group}, success, error);
        }
    };
    return demand;
});