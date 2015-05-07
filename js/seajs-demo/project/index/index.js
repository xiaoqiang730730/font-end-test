define('project/index/index', function(require, exports, module) {
	// require('component/jquery/dist/jquery');
	require('component/fullpage.js/vendors/jquery.slimscroll.min');
	require('component/fullpage.js/jquery.fullPage');
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
});