var fs = require('fs');
var path = require('path');
var workingPath = process.cwd();
var ytToken = null;
var yt_feed = require('youtube-feeds');

var FM = { youtubeMgr: {} };

FM.youtubeMgr.getAccessToken = function( getAccessToken_cb ) {
	var tokenFile = path.join( workingPath, 'yt_token.json');

	fs.readFile( tokenFile, function (err, data) {
		if (!err) {
			var myYtToken = JSON.parse(data);
			getAccessToken_cb( myYtToken.access_token );
		}
		else {
			getAccessToken_cb( null );
		}
	});

}

FM.youtubeMgr.getVideoViewCount = function( yt_video_id, gotViewCount_cb ) {
	yt_feed.video( yt_video_id, function(err, data){
	
		if (!err){
			//console.log(data.viewCount);
			gotViewCount_cb( data.viewCount, null);
		}
		else{
			gotViewCount_cb( null, err);
		}	
	});
	
}

module.exports = FM.youtubeMgr;

/*
//test
FM.youtubeMgr.getVideoViewCount('zvI1iNW7LD0', function(viewCount){
	console.log(viewCount);
});
*/