/* global requirejs */

requirejs.config({
    baseUrl: '../js/app',
    paths: {
        jquery: '../lib/jquery.min',
        angular: '../lib/angular.min',
        RongIMClient: '../lib/RongIMClient.min'
    }
});

window.onload = function () {
    require(['page'], function (page) {
        page.init();
    });
};