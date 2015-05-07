define('project/index/index', function(require, exports, module) {
	// require('component/jquery/dist/jquery');
	require('component/fullpage.js/vendors/jquery.slimscroll.min');
	require('component/fullpage.js/jquery.fullPage');

	function init() {
		$('#fullpage').fullpage({
			anchors: _pageAnchors,
			navigation: true,
			navigationPosition: 'right',
			onLeave: function(leavingSection, leavingSectionIndex, sectionIndex, yMovement) {
				$.each(_pageAnchors, function(i, v) {
					_page.removeClass('page-fullpage-' + v);
				});
				_page.addClass('page-fullpage-' + _pageAnchors[leavingSectionIndex - 1]);
			}
		});
	}

	// return {
	// 	init:function(){
	// 		var _page = $('.m-page');
	// 		var _pageAnchors = ['one', 'two', 'three', 'four', 'five', 'six', 'seven'];
	// 		$('#fullpage').fullpage({
	// 			anchors: _pageAnchors,
	// 			navigation: true,
	// 			navigationPosition: 'right',
	// 			onLeave: function(leavingSection, leavingSectionIndex, sectionIndex, yMovement) {
	// 				$.each(_pageAnchors, function(i, v) {
	// 					_page.removeClass('page-fullpage-' + v);
	// 				});
	// 				_page.addClass('page-fullpage-' + _pageAnchors[leavingSectionIndex - 1]);
	// 			}
	// 		});
	// 	}
	// }
	// 
	exports.init=function(){
		var _page = $('.m-page');
		var _pageAnchors = ['one', 'two', 'three', 'four', 'five', 'six', 'seven'];
		$('#fullpage').fullpage({
			anchors: _pageAnchors,
			navigation: true,
			navigationPosition: 'right',
			onLeave: function(leavingSection, leavingSectionIndex, sectionIndex, yMovement) {
				$.each(_pageAnchors, function(i, v) {
					_page.removeClass('page-fullpage-' + v);
				});
				_page.addClass('page-fullpage-' + _pageAnchors[leavingSectionIndex - 1]);
			}
		});
	}
	// function init(){
	// 	this.init=function(){
	// 		var _page = $('.m-page');
	// 		var _pageAnchors = ['one', 'two', 'three', 'four', 'five', 'six', 'seven'];
	// 		$('#fullpage').fullpage({
	// 			anchors: _pageAnchors,
	// 			navigation: true,
	// 			navigationPosition: 'right',
	// 			onLeave: function(leavingSection, leavingSectionIndex, sectionIndex, yMovement) {
	// 				$.each(_pageAnchors, function(i, v) {
	// 					_page.removeClass('page-fullpage-' + v);
	// 				});
	// 				_page.addClass('page-fullpage-' + _pageAnchors[leavingSectionIndex - 1]);
	// 			}
	// 		});
	// 	}
	// }
	// module.exports=new init();

	/**
	 * 错误
	 * @type {Object}
	 */
	// exports = {
	//     foo: 'bar',
	//     init: function() {
	//     	init();
	//     }
	//   };

	// module.exports = {
	// 	foo: 'bar',
	// 	init: function() {
	// 		$('#fullpage').fullpage({
	// 			anchors: _pageAnchors,
	// 			navigation: true,
	// 			navigationPosition: 'right',
	// 			onLeave: function(leavingSection, leavingSectionIndex, sectionIndex, yMovement) {
	// 				$.each(_pageAnchors, function(i, v) {
	// 					_page.removeClass('page-fullpage-' + v);
	// 				});
	// 				_page.addClass('page-fullpage-' + _pageAnchors[leavingSectionIndex - 1]);
	// 			}
	// 		});
	// 	}
	// }
});