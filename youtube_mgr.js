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

/**
 * upload for test
 */
FM.youtubeMgr.uploadYoutubeVideo = function(video_ID, ytAccessToken, cb){
    var youtube_url = 'https://upload.gdata.youtube.com';
    console.log('youtubeMgr'+video_ID+'--'+ytAccessToken);
//    var DEVELOPER_KEY = 'AI39si4ESFoS_HSwufFF4CEVYW9sdz4xi2-hAjs2BXJAMuHy1NzwQXB_gulxiS-YSJzWBOAi-anICzfrjFdLxdQgG5SXMRrl8Q';
    var path = '/resumable/feeds/api/users/default/uploads/'
    
    if (ytAccessToken) {
    request({
        method: 'POST',
        uri:  youtube_url + path,
        headers: {
            'Authorization': 'Bearer '+ ytAccessToken,
            'GData-Version': 2,
            'X-GData-Key': 'key=AI39si4ESFoS_HSwufFF4CEVYW9sdz4xi2-hAjs2BXJAMuHy1NzwQXB_gulxiS-YSJzWBOAi-anICzfrjFdLxdQgG5SXMRrl8Q',
            'Content-Type': 'application/atom+xml',
            'Slug': 'HD720p.mp4',
            'Content-Length': 1941255,
            'Content-Type': 'video/mp4',
            'Host': 'uploads.gdata.youtube.com',
            'port': 80
        },
       
        
    }, function(error, response, body){
        if(error){
            cb(error, null);
        }
        else if(body.error){
            cb(body, null);
        }
        else{
            cb(null, body);
        }
    });
    
    }
}

/**
 * youtube version 2.0
 */
FM.youtubeMgr.deleteYoutubeVideo = function(video_ID, ytAccessToken, cb){
    var youtube_url = 'https://gdata.youtube.com';
    console.log('youtubeMgr'+video_ID+'--'+ytAccessToken);
//    var youtube_url = 'https://www.googleapis.com';
//    var DEVELOPER_KEY = 'AI39si4ESFoS_HSwufFF4CEVYW9sdz4xi2-hAjs2BXJAMuHy1NzwQXB_gulxiS-YSJzWBOAi-anICzfrjFdLxdQgG5SXMRrl8Q';
    var path = '/feeds/api/users/default/uploads/'+video_ID;
//    var path = '/youtube/v3/videos?id='+video_ID+'&key=AI39si4ESFoS_HSwufFF4CEVYW9sdz4xi2-hAjs2BXJAMuHy1NzwQXB_gulxiS-YSJzWBOAi-anICzfrjFdLxdQgG5SXMRrl8Q';
    
    if (ytAccessToken) {
    request({
        method: 'DELETE',
        uri:  youtube_url + path,
        headers: {
            'Authorization': 'Bearer '+ ytAccessToken,
            'GData-Version': 2,
            'X-GData-Key': 'key=AI39si4kwr_nSwmpgwbIvG_5ZOI-ZbwYse_H4Kujthtk4xnh2At3uHfI73PqFY8qieWbQ2uHOzCHTl6xFVh7dPjvGhBlFxbBEA',
            'Content-Type': 'application/atom+xml',
//            'Host': 'www.googleapis.com',
//            'port': 443
        },
        
    }, function(error, response, body){
        if(error){
            cb(error, null);
        }
        else if(body.error){
            cb(body, null);
        }
        else{
            cb(null, body);
        }
    });
    
    }
}


/**
 * youtube version 3.0
 */
FM.youtubeMgr.deleteYoutubeVideo_partb = function(video_ID, ytAccessToken, cb){
    console.log('youtubeMgr'+video_ID+'--'+ytAccessToken);
    var youtube_url = 'https://www.googleapis.com';
//    var DEVELOPER_KEY = 'AI39si4ESFoS_HSwufFF4CEVYW9sdz4xi2-hAjs2BXJAMuHy1NzwQXB_gulxiS-YSJzWBOAi-anICzfrjFdLxdQgG5SXMRrl8Q';
    var path = '/youtube/v3/videos?id='+video_ID+'&?key=AI39si4ESFoS_HSwufFF4CEVYW9sdz4xi2-hAjs2BXJAMuHy1NzwQXB_gulxiS-YSJzWBOAi-anICzfrjFdLxdQgG5SXMRrl8Q&?access_token='+ytAccessToken;
    
    if (ytAccessToken) {
    request({
        method: 'DELETE',
        uri:  youtube_url + path,
//        headers: {
//            'Authorization': 'Bearer '+ ytAccessToken,
//            'GData-Version': 2,
//            'X-GData-Key': 'key=AI39si4ESFoS_HSwufFF4CEVYW9sdz4xi2-hAjs2BXJAMuHy1NzwQXB_gulxiS-YSJzWBOAi-anICzfrjFdLxdQgG5SXMRrl8Q',
//            'Content-Type': 'application/atom+xml',
////            'Host': 'www.googleapis.com',
////            'port': 443
//        },
        
    }, function(error, response, body){
        if(error){
            cb(error, null);
        }
        else if(body.error){
            cb(body, null);
        }
        else{
            cb(null, body);
        }
    });
    
    }
}

/**
 * youtube version 2.0 http
 */
FM.youtubeMgr.deleteYoutubeVideo_http = function(video_ID, ytAccessToken, cb){
    console.log('youtubeMgr'+video_ID+'--'+ytAccessToken);
    if (ytAccessToken) {
        var header = {  'Authorization': 'Bearer '+ytAccessToken,
                        'GData-Version': 2,
                        'X-GData-Key': 'key=AI39si4kwr_nSwmpgwbIvG_5ZOI-ZbwYse_H4Kujthtk4xnh2At3uHfI73PqFY8qieWbQ2uHOzCHTl6xFVh7dPjvGhBlFxbBEA',
//                        'Slug':'super.mp4',
                        'Content-Type': 'application/atom+xml'
//                        'Content-Length': body.length
                        };
                        
        
        var options = {
            host: 'gdata.youtube.com',
            port: 80,
            path: '/feeds/api/users/default/uploads/'+video_ID,
            headers: header,
            method: 'DELETE'
        };
        
        var client_req = http.request(options,  function(error, response, body){
            if(error){
                cb(error, null);
            }
            else if(body.error){
                cb(body, null);
            }
            else{
                cb(null, response);
            }
        });
//        var body = 'code='+req.query.code+'&';
//        var body = 'client_id=701982981612-434p006n3vi10ghlk6u9op178msavtu2.apps.googleusercontent.com&';
//        body += 'client_secret=NhmRDngvVVHtkLLPnhAN349b&';
//        body += 'redirect_uri=http://localhost/oauth2callback&';
//        body += 'grant_type=authorization_code';
//        client_req.write();
        client_req.end();
    }
}




var ytAccessToken = 'ya29.AHES6ZRlQIFxtkF3FZaLynsVIT0zgYvc-BKIrN0FjWLE';
var video_ID = 'Xnt_KvmclUc';

//FM.youtubeMgr.deleteYoutubeVideo(video_ID, ytAccessToken, function(err, result){
//    if(!err)
//        console.log('delete Youtube Video successful'+result);
//    else
//        console.log('deleteYoutubeVideo'+err);
//});

module.exports = FM.youtubeMgr;

/*
//test
FM.youtubeMgr.getVideoViewCount('zvI1iNW7LD0', function(viewCount){
	console.log(viewCount);
});
*/