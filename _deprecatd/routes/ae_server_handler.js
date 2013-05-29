var aeServerHandler = {};

var events = require("events");
var workingPath = process.cwd();
var eventEmitter = new events.EventEmitter();

//*****This function is deprecated.*****
/*
aeServerHandler.reportRenderingResult_cb = function(req, res) {

	if ( req.headers.youtube_video_id ) {
		var aeServerID = req.headers.ae_server_id;
		var youtubeVideoID = req.headers.youtube_video_id;
		var movieProjectID = req.headers.movie_project_id;
		var ownerStdID = req.headers.owner_std_id;
		var ownerFbID = req.headers.owner_fb_id;
		var movieTitle = req.headers.movie_title;
		
		logger.info('[%s] Got response from AE Server:', movieProjectID )
		logger.info(JSON.stringify(req.headers));
		
		if ( req.headers.err == 'null' || (!req.headers.err) ) {
			//add to video DB
			//var videoDB = require(workingPath+'/video.js');
			var fmapi= require(workingPath+'/routes/api.js');
			
			var url = {"youtube":"http://www.youtube.com/embed/"+youtubeVideoID};
				
			var vjson = {"title": movieTitle,
						 "ownerId": {"_id": ownerStdID, "userID": ownerFbID},
						 "url": url,
						 "projectId":movieProjectID};
			//logger.info("video " + JSON.stringify(vjson));
			fmapi._fbPostVideoThenAdd(vjson);
		}

	}
	
} 
*/

aeServerHandler.commandResponse_cb = function(req, res) {

	var commandID = req.headers._command_id;
	var responseParameters = req.headers

	eventEmitter.emit('RESPONSE_'+commandID, responseParameters);
	logger.info('Got response ' + commandID + 'from AE Server:' );
	logger.info(JSON.stringify(responseParameters));
	
	res.send('');
}


aeServerHandler.sendRequestToAeServer = function( targetID, reqToAeServer, cb ) {
	//TODO: make sure reqToAeServer is not null
	reqToAeServer._commandID = reqToAeServer.command + '__' + targetID + '__' + (new Date()).getTime().toString();
	eventEmitter.emit('COMMAND_'+targetID, reqToAeServer);
	
	eventEmitter.once('RESPONSE_'+reqToAeServer._commandID, cb);
}

aeServerHandler.longPollingFromAeServer_cb = function(req, res) {
	logger.info('['+ new Date() +']Got long-polling HTTP request from AE Server: '+ req.headers.star_ae_server_id )
	//console.dir(req);
	
	var messageToAeServer = new Object();
	
	var callback = function(reqToAeServer){
		//logger.info(reqToAeServer);
		clearTimeout(timer);
		messageToAeServer.type = "COMMAND";
		messageToAeServer.body = reqToAeServer;
		res.send(messageToAeServer);
	}

	var timer = setTimeout(function(){ 
		eventEmitter.removeListener('COMMAND_'+req.headers.star_ae_server_id, callback);
		messageToAeServer.type = "LONG_POLLING_TIMEOUT";
		messageToAeServer.body = null;
		res.send(messageToAeServer);
	}, 60000);	
	//}, 5000);	
	
	eventEmitter.once('COMMAND_'+req.headers.star_ae_server_id, callback);	
}

module.exports = aeServerHandler;