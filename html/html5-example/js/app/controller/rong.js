define('page', ['model/im'], function (im) {
    return {
        init: function () {
            return;
            im.connect(function () {
                im.connect(function (uid) {
                    console.log(uid);
                }, function (msg) {
                    alert(msg);
                });

                im.onChanged(function (status) {
                    console.log(status);
                });
                im.onMessage(function (message) {
                    console.log(message);
                });
            }, function (msg) {
                alert(msg);
            });
        }
    };
});