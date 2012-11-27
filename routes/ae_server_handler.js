var workingPath = process.env.STAR_SERVER_PROJECT;

exports.reportRenderingResult_cb = function(req, res) {

	if ( req.headers.youtube_video_id ) {
		var aeServerID = req.headers.ae_server_id;
		var youtubeVideoID = req.headers.youtube_video_id;
		var movieProjectID = req.headers.movie_project_id;
		var ownerStdID = req.headers.owner_std_id;
		var ownerFbID = req.headers.owner_fb_id;
		var movieTitle = req.headers.movie_title;
		
		console.log('[%s] Got response from AE Server:', movieProjectID )
		console.dir(req.headers);
		
		if ( req.headers.err == 'null' || (!req.headers.err) ) {
			//add to video DB
			var videoDB = require(workingPath+'/video.js');
			var fmapi= require(workingPath+'/routes/api.js');
			
			var url = {"youtube":"http://www.youtube.com/embed/"+youtubeVideoID};
				
			var vjson = {"title": movieTitle,
						 "ownerId": {"_id": ownerStdID, "userID": ownerFbID},
						 "url": url,
						 "projectId":movieProjectID};
			//console.log("video " + JSON.stringify(vjson));
			fmapi._fbPostVideoThenAdd(vjson);
			/*
			videoDB.addVideo(vjson, function(err, vdoc){
				console.log('Seccessfully add %s to videoDB!', movieProjectID);
			});
			*/
		}

	}
	

} 