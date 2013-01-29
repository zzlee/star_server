var workingPath = process.env.STAR_SERVER_PROJECT;
var path = require('path');
var http = require('http');
var url = require('url');
var fs = require('fs');
var routes = require('./routes');
var youtubeManager = require( './youtube_manager.js' );

exports.createMovie = function(starAeServerURL, movieProjectID, ownerStdID, ownerFbID, movieTitle) {

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


var createMovie_longPolling = function(starAeServerID, movieProjectID, ownerStdID, ownerFbID, movieTitle) {

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
			
			routes.sendRequestToAeServer( starAeServerID, { command: "RENDER_MOVIE", parameters: commandParameters } );
		}
		else {
			logger.info('[%s] Cannot get Youtube access token!', movieProjectID);
		}
	
	});

}

exports.createMovie_longPolling = createMovie_longPolling;
exports.createMiixMovie = createMovie_longPolling;