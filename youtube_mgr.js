var fs = require('fs');
var path = require('path');
var workingPath = process.cwd();
var ytToken = null;
var yt_feed = require('youtube-feeds');
var request = require("request");
var http = require('http');

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

};

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
	
};

/**
 * youtube version 2.0 http
 */
FM.youtubeMgr.deleteYoutubeVideo = function(video_ID, ytAccessToken, cb){
    console.log('youtubeMgr'+video_ID+'--'+ytAccessToken+'--');
    if (ytAccessToken) {
        var header = {  'Authorization': 'Bearer '+ytAccessToken,
                        'GData-Version': 2,
                        'X-GData-Key': 'key=AI39si4kwr_nSwmpgwbIvG_5ZOI-ZbwYse_H4Kujthtk4xnh2At3uHfI73PqFY8qieWbQ2uHOzCHTl6xFVh7dPjvGhBlFxbBEA',
                        'Content-Type': 'application/atom+xml'
                        };
                        
        
        var options = {
            host: 'gdata.youtube.com',
            port: 80,
            path: '/feeds/api/users/default/uploads/'+video_ID,
            headers: header,
            method: 'DELETE'
        };
        
        var client_req = http.request(options,  function(response){
            if(response.statusCode == 200)
                cb(null, 'successful');
            else
                cb('fail statusCode='+response.statusCode, null);

        });
        client_req.end();
    }
};



module.exports = FM.youtubeMgr;

/*
//test
FM.youtubeMgr.getVideoViewCount('zvI1iNW7LD0', function(viewCount){
	console.log(viewCount);
});
*/