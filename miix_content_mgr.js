var miixContentMgr = {};

var workingPath = process.env.STAR_SERVER_PROJECT;
//var movieMaker = require(workingPath+'/ae_render.js');
var aeServerMgr = require(workingPath+'/ae_server_mgr.js');
var doohMgr = require(workingPath+'/dooh_mgr.js');
var memberDB = require(workingPath+'/member.js');
var videoDB = require(workingPath+'/video.js');
var fmapi = require(workingPath+'/routes/api.js')   //TODO:: find a better name

miixContentMgr.deliverMiixMovieToDooh = function( movieProjectID, downLoadMovie_cb) {
	var askDoohToDownLoadMovie = function(cb) {
	
	}
	
}

miixContentMgr.submitMiixPlayListToDooh = function(cb) {

}


miixContentMgr.generateMiixMoive = function(movieProjectID, ownerStdID, ownerFbID, movieTitle) {
	
	//console.log('generateMiixMoive is called.');
	
	aeServerMgr.createMiixMovie( movieProjectID, ownerStdID, ownerFbID, movieTitle, function(responseParameters){
	
		if ( responseParameters.youtube_video_id ) {
			var aeServerID = responseParameters.ae_server_id;
			var youtubeVideoID = responseParameters.youtube_video_id;
			var movieProjectID = responseParameters.movie_project_id;
			var ownerStdID = responseParameters.owner_std_id;
			var ownerFbID = responseParameters.owner_fb_id;
			var movieTitle = responseParameters.movie_title;
			
			
			if ( responseParameters.err == 'null' || (!responseParameters.err) ) {
				//post to FB; update video DB; push notification to mobile client 
				var url = {"youtube":"http://www.youtube.com/embed/"+youtubeVideoID};			
				var vjson = {"title": movieTitle,
							 "ownerId": {"_id": ownerStdID, "userID": ownerFbID},
							 "url": url,
							 "aeId": "AE_server_gance_Feltmeng_pc",
							 "projectId":movieProjectID};
				fmapi._fbPostVideoThenAdd(vjson); //TODO: split these tasks to different rolls
				
			};
			
			//for test
			//miixContentMgr.submitMiixMovieToDooh('', movieProjectID);
		};
		
	});
	
};

miixContentMgr.submitMiixMovieToDooh = function( doohID, movieProjectID ) {

	//deliver Miix movie content to DOOH
	aeServerMgr.uploadMovieToMainServer(movieProjectID, function(resParametes){
		console.log('uploading Miix movie from AE Server to Main Server finished. Result:');
		console.dir(resParametes);
		
		//TODO:: check the file size. If not correct, re-upload.
		
		if ( (resParametes.err == 'null') || (!resParametes.err) ) {
			doohMgr.downloadMovieFromMainServer(movieProjectID, function(resParametes){
				console.log('downloading Miix movie from Main Server to DOOH. Response:');
				console.dir(resParametes);
				
				//TODO:: check the file size. If not correct, re-download.
			});						
		}
	});

					
	//add Miix movie to the nearest time slot in schedule
					
	//submit the playlist to DOOH
				
}

miixContentMgr.setMiixPlayList = function(cb) {

}



module.exports = miixContentMgr;