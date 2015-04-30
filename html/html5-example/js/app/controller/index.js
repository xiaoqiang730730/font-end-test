define('page', ['jquery', 'model/news', 'model/demand', 'model/circle'], function ($, news, demand, circle) {
    var page = {
        init: function () {

            // 新闻
            news.getAllCategory(function (data) {
                console.log('新闻分类: ', data);
            });
            news.getList({tag: '2015'}, function (data) {
                console.log('新闻列表: ', data);
            });
            news.getDetail(2614, function (data) {
                console.log('新闻介绍: ', data);
            });
            news.search('2015', 1, function (data) {
                console.log('新闻搜索: ', data);
            });

            // 供求
            demand.getAllCategory(function (data) {
                console.log('供求分类: ', data);
            });
            demand.getList({tag: '木材'}, function (data) {
                console.log('供求列表: ', data);
            });
            demand.getTags(103, 1, function (data) {
                console.log('供求标签: ', data);
            });
            demand.getDetail(2123, function (data) {
                console.log('供求介绍: ', data);
            });
            demand.search('木材', 1, function (data) {
                console.log('供求搜索: ', data);
            });

            // 圈子
            circle.getList({tag: '木材'}, function (data) {
                console.log('圈子列表: ', data);
            });
            circle.getDetail(2614, function (data) {
                console.log('圈子介绍: ', data);
            });
            circle.search('木材', 1, function (data) {
                console.log('圈子搜索: ', data);
            });


        }
    };
    return page;
});
