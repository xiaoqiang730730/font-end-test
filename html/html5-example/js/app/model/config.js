define([], function () {
    var config = {
        debug: true,
        ajax: {
            // 超时时间 毫秒
            timeout: 10000
        },
        baseUrl: 'http://anywood.com/api.php',
        api: {
            news: {
                category: '/news/getallcategory',
                list: '/news/getlist',
                detail: '/news/detail'
            },
            demand: {
                category: '/demand/getallcategory',
                tags: '/demand/gettags',
                list: '/demand/getlist',
                detail: '/demand/detail'
            },
            circle: {
                list: '/news/getlist',
                detail: '/news/detail'
            },
            user: {
                
            },
            rong: {
                appkey: 'vnroth0kr5uuo',
                token: '/rong_cloud/gettoken'
            }
        }
    };

    return config;
});