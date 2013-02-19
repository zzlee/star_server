storyCamControllerMgr = {};
var connectionHandler = require('./routes/connection_handler.js');

storyCamControllerMgr.startRecording = function( miixMovieProjectID, startedRecording_cb ){

	//TODO:: get corresponding storyCamController ID
	var storyCamControllerID = 'story_cam_gance_Feltmeng_pc';

	var commandParameters = {
		movieProjectID: miixMovieProjectID
	};
	
	connectionHandler.sendRequestToRemote( storyCamControllerID, { command: "START_RECORDING", parameters: commandParameters }, function(responseParameters) {
		//console.dir(responseParameters);
		if (startedRecording_cb )  {
			startedRecording_cb(responseParameters);
		}
	});



}

storyCamControllerMgr.stopRecording = function( stoppedRecording_cb ){

	//TODO:: get corresponding storyCamController ID
	var storyCamControllerID = 'story_cam_gance_Feltmeng_pc';

	var commandParameters = null;
	
	connectionHandler.sendRequestToRemote( storyCamControllerID, { command: "STOP_RECORDING", parameters: commandParameters }, function(responseParameters) {
		//console.dir(responseParameters);
		if (stoppedRecording_cb )  {
			stoppedRecording_cb(responseParameters);
		}
	});

}

storyCamControllerMgr.uploadStoryMovieToMainServer = function(movieProjectID, uploaded_cb) {


}



module.exports = storyCamControllerMgr;