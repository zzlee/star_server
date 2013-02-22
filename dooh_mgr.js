var doohMgr = {};

var connectionHandler = require('./routes/connection_handler.js');

doohMgr.downloadMovieFromMainServer = function(movieProjectID, downloadMovie_cb) {

	//TODO:: get corresponding DOOH ID
	//var doohID = 'DOOH_gance_winXP_vm';
	var doohID = 'DOOH_gance_Feltmeng_pc';

	var commandParameters = {
		movieProjectID: movieProjectID
	};
	
	connectionHandler.sendRequestToRemote( doohID, { command: "DOWNLOAD_MOVIE_FROM_MAIN_SERVER", parameters: commandParameters }, function(responseParameters) {
		//console.dir(responseParameters);
		if (downloadMovie_cb )  {
			downloadMovie_cb(responseParameters);
		}
	});


}

module.exports = doohMgr;