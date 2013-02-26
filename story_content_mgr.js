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
		logger.info('uploading story movie from Story Cam Controller to Main Server finished. ');
		logger.info('res: _command_id='+resParametes._command_id+' err='+resParametes.err);
		
		//TODO:: check the file size. If not correct, re-upload.
		
		if ( (resParametes.err == 'null') || (!resParametes.err) ) {
			aeServerMgr.downloadStoryMovieFromMainServer(movieProjectID, function(resParameter2){
				logger.info('downloading story movie from Main Server to AE Server.');
				logger.info('res: _command_id='+resParameter2._command_id+' err='+resParameter2.err);
				
				//TODO:: check the file size. If not correct, re-download.
				
				if ( (resParameter2.err == 'null') || (!resParameter2.err) ) {
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
	var ownerStdID;
	var ownerFbID;
    var ownerFbName;
	var movieTitle;
	
	var getUserIdAndName = function( finish_cb ){
		videoDB.getOwnerIdByPid( movieProjectID, function( err, _ownerStdID) {
			if (!err) {
				ownerStdID = _ownerStdID;
				memberDB.getUserNameAndID( ownerStdID, function(err2, result){
					if (!err2) {
						ownerFbID = result.fb.userID;
                        ownerFbName = result.fb.userName;
                        movieTitle = ownerFbName+"'s Miix story movie";
						if (finish_cb){
							finish_cb(null);
						}					
					}
				});
			}
			else{
				if (finish_cb){
					finish_cb(err);
				}
			}
		});
	
	}
	
	
	downloadStoryMovieFromStoryCamControllerToAeServer( movieProjectID, function(err){
		
		if (!err){
			getUserIdAndName(function(err2){
				if (!err2){
					aeServerMgr.createStoryMV( movieProjectID, ownerStdID, ownerFbID, movieTitle, function(responseParameters){
					
						logger.info('generating Story MV finished. ');
						logger.info('res: _command_id='+responseParameters._command_id+' err='+responseParameters.err+' youtube_video_id='+responseParameters.youtube_video_id);
						
						if ( responseParameters.youtube_video_id ) {
							var aeServerID = responseParameters.ae_server_id;
							var youtubeVideoID = responseParameters.youtube_video_id;
							//var youtubeVideoID = "VNrn-jhmLBE"; //GZ temporarily hard code for test
							
							
							
							if ( responseParameters.err == 'null' || (!responseParameters.err) ) {
							
								
								var url = {"youtube":"http://www.youtube.com/embed/"+youtubeVideoID};			
								var vjson = {"title": movieTitle,
											 "ownerId": {"_id": ownerStdID, "userID": ownerFbID},
											 "url": url,
											 "genre":"miix_story",
											 "projectId":movieProjectID};
								fmapi._fbPostVideoThenAdd(vjson); 
                                logger.info('fmapi._fbPostVideoThenAdd(vjson) called. vjson=');
                                logger.info(JSON.stringify(vjson));
							};
							
						};
						
					});
				}
				else{
					logger.info('fail to get user ID and name');
				}
			});
		}
		else {
			logger.info('fail to download Story Movie from Cam Controller to AE Server');
		}
		
		
	});
};

module.exports = storyContentMgr;
