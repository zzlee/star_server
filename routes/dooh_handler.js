var doohHandler = {};

var storyCamControllerMgr = require('../story_cam_controller_mgr.js');
var storyContentMgr = require('../story_content_mgr.js');

doohHandler.getTimeData = function(req, res) {
	//get message.
	user = req.headers.rawdata;
	res.writeHead(200, { "Content-Type": "text/plain" });
	/*
	if(user) {
		console.log('DOOH member: ' + req.headers.dooh);
		console.log('Client message: ' + JSON.parse(user));
		//send to client.
		res.write('Hello.');
	} else {
		console.log(user);
		console.log('No data.');
	}
	*/
	var result = "";
	console.log('DOOH member: ' + req.headers.dooh);
	req.on('data', function(chunk) { result += chunk; }).on('end', function() { console.log(JSON.parse(result)); });
	res.end();
};

doohHandler.doohMoviePlayingState_post_cb = function(req, res) {
	if ( req.headers.miix_movie_project_id ) {
		if ( req.headers.state == 'playing' ){
			console.log('dooh starts playing movie');
			storyCamControllerMgr.startRecording( req.headers.miix_movie_project_id, function(resParametes){
				console.log('story cam started recording. Response:');
				console.dir(resParametes);
				res.send(null);
			});
			
		}
		else if ( req.headers.state == 'stopped' ){
			console.log('dooh stopped playing movie');
			storyCamControllerMgr.stopRecording( function(resParametes){
				console.log('story cam stopped recording. Response:');
				console.dir(resParametes);
				res.send(null);
				if ( resParametes.err == 'null' || (!resParametes.err) ) {
					storyContentMgr.generateStoryMV( req.headers.miix_movie_project_id );
				}
			});
		}	
	}
	else {
		res.send("No movie project id avaialable");
	}
}

module.exports = doohHandler;