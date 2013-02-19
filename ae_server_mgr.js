var aeServerMgr = {};

var workingPath = process.env.STAR_SERVER_PROJECT;
var path = require('path');
var http = require('http');
var url = require('url');
var fs = require('fs');
var connectionHandler = require('./routes/connection_handler.js');
var youtubeManager = require( './youtube_manager.js' );

//*****This function is deprecated.*****
//use direct HTTP to ask AE Server to create Miix movie
aeServerMgr.createMovie = function(starAeServerURL, movieProjectID, ownerStdID, ownerFbID, movieTitle) {

	var userDataFolder = path.join( workingPath, 'public/contents/user_project', movieProjectID, 'user_data');
	var userFileList = fs.readdirSync(userDataFolder).toString();

	youtubeManager.getAccessToken( function(ytAccessToken){
		if (ytAccessToken) {


	
			var dataToPost = {
				user_file_list: fs.readdirSync(userDataFolder).toString(),
				movie_project_id: movieProjectID,
				owner_std_id: ownerStdID, 
				owner_fb_id: ownerFbID,
				movie_title: movieTitle,
				yt_ccess_token: ytAccessToken
			};
			
			
			
			var options = {
				host: url.parse(starAeServerURL).hostname,
				path: '/create_movie',
				headers: dataToPost,
				method: 'GET'
			};
			var port = url.parse(starAeServerURL).port;
			if (port) {
				options.port = port;
			}
			else {
				options.port = 80;
			}

			var httpReq = http.request(options, function(res) {
				logger.info('STATUS: ' + res.statusCode);
				logger.info('HEADERS: ' + JSON.stringify(res.headers));
				res.setEncoding('utf8');
				res.on('data', function (chunk) {
					logger.info('[%s] BODY: '+chunk, movieProjectID);
				}).on('end', function() {
					logger.info('[%s] Successfully ask AE Server to render movie', movieProjectID);
				});
			});

			httpReq.on('error', function(e) {
				logger.info('[%s] error send http GET to AE Server:', movieProjectID);
				logger.info(JSON.stringify(e));
			});

			httpReq.end();
		
		}
		else {
			logger.info('[%s] Cannot get Youtube access token!', movieProjectID);
		}
	});

}

//use long polling to ask AE Server to create Miix movie
aeServerMgr.createMiixMovie = function(starAeServerID, movieProjectID, ownerStdID, ownerFbID, movieTitle, createMovie_cb) {

	youtubeManager.getAccessToken( function(ytAccessToken){
		if (ytAccessToken) {
			var userDataFolder = path.join( workingPath, 'public/contents/user_project', movieProjectID, 'user_data');
			
			var commandParameters = {
				userFileList: fs.readdirSync(userDataFolder),
				movieProjectID: movieProjectID,
				ownerStdID: ownerStdID,
				ownerFbID: ownerFbID,
				movieTitle: movieTitle,
				ytAccessToken: ytAccessToken 
			};
						
			//TODO:: get corresponding AE Server ID			
			connectionHandler.sendRequestToRemote( starAeServerID, { command: "RENDER_MOVIE", parameters: commandParameters }, function(responseParameters) {
				//console.dir(responseParameters);
				if (createMovie_cb )  {
					createMovie_cb(responseParameters);
				}
			});
		}
		else {
			logger.info('[%s] Cannot get Youtube access token!', movieProjectID);
		}
	
	});

}

aeServerMgr.uploadMovieToMainServer = function(movieProjectID, uploadMovie_cb) {

	//TODO:: get corresponding AE Server ID
	var starAeServerID = 'gance_Feltmeng_pc';

	var commandParameters = {
		movieProjectID: movieProjectID
	};
	
	connectionHandler.sendRequestToRemote( starAeServerID, { command: "UPLOAD_MOVIE_TO_MAIN_SERVER", parameters: commandParameters }, function(responseParameters) {
		//console.dir(responseParameters);
		if (uploadMovie_cb )  {
			uploadMovie_cb(responseParameters);
		}
	});
	

}

aeServerMgr.downloadStoryMovieFromMainServer = function(movieProjectID, downloadMovie_cb) {


}


module.exports = aeServerMgr;