var storyContentMgr = {};

var workingPath = process.env.STAR_SERVER_PROJECT;
var aeServerMgr = require(workingPath+'/ae_server_mgr.js');
var doohMgr = require(workingPath+'/dooh_mgr.js');
var storyCamControllerMgr = require(workingPath+'/story_cam_controller_mgr.js');
var memberDB = require(workingPath+'/member.js');
var videoDB = require(workingPath+'/video.js');
var fmapi = require(workingPath+'/routes/api.js'); 

var downloadStoryMovieFromStoryCamControllerToAeServer = function(movieProjectID, downloaded_cb){

	storyCamControllerMgr.uploadStoryMovieToMainServer(movieProjectID, function(resParametes){
		console.log('uploading story movie from Story Cam Controller to Main Server finished. err='+resParametes.err);
		
		//TODO:: check the file size. If not correct, re-upload.
		
		if ( (resParametes.err == 'null') || (!resParametes.err) ) {
			aeServerMgr.downloadStoryMovieFromMainServer(movieProjectID, function(resParameter2){
				console.log('downloading story movie from Main Server to AE Server. err='+resParameter2.err);
				
				//TODO:: check the file size. If not correct, re-download.
				
				if ( (resParametes.err == 'null') || (!resParametes.err) ) {
					if (downloaded_cb){
						downloaded_cb(null)
					}
				}
				else{
					if (downloaded_cb){
						downloaded_cb('Fail to download story movie from Main Server to AE Server')
					}				
				}
			}); 
		}
		else{
			if (downloaded_cb){
				downloaded_cb('Fail to download story movie from Story Cam Controllerr to Main Server')
			}				
		}
	}); 
	

}

storyContentMgr.generateStoryMV = function(movieProjectID) {
	
	downloadStoryMovieFromStoryCamControllerToAeServer( movieProjectID, function(err){
		var ownerStdID = "my_stdID"; //TODO: call Gabriel's api
		var ownerFbID = "my_fbID"; //TODO: call Gabriel's api
		var movieTitle = ownerFbID+"'s Miix story movie";
		
		aeServerMgr.createStoryMV( movieProjectID, ownerStdID, ownerFbID, movieTitle, function(responseParameters){
		
			if ( responseParameters.youtube_video_id ) {
				var aeServerID = responseParameters.ae_server_id;
				var youtubeVideoID = responseParameters.youtube_video_id;
				
				
				if ( responseParameters.err == 'null' || (!responseParameters.err) ) {
				
					//TODO: call the same api of Gabriel?
					//post to FB; update video DB; push notification to mobile client 
					
					var url = {"youtube":"http://www.youtube.com/embed/"+youtubeVideoID};			
					var vjson = {"title": movieTitle,
								 "ownerId": {"_id": ownerStdID, "userID": ownerFbID},
								 "url": url,
								 "genre":"miix_story",
								 "projectId":movieProjectID};
					fmapi._fbPostVideoThenAdd(vjson); //TODO: split these tasks to different rolls
					
					console.log('generated Story MV. Response:');
					console.dir(responseParameters);
					
				};
				
			};
			
		});
	});
};

module.exports = storyContentMgr;