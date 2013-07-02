var aeServerMgr = {};

var workingPath = process.cwd();
var path = require('path');
var http = require('http');
var url = require('url');
var fs = require('fs');
var async = require('async');
var globalConnectionMgr = require('./global_connection_mgr.js');
var youtubeTokenMgr = require( './youtube_mgr.js' );


//*****This function is deprecated.*****
//use direct HTTP to ask AE Server to create Miix movie
aeServerMgr.createMovie = function(starAeServerURL, movieProjectID, ownerStdID, ownerFbID, movieTitle) {

	var userDataFolder = path.join( workingPath, 'public/contents/user_project', movieProjectID, 'user_data');
	//var userFileList = fs.readdirSync(userDataFolder).toString();

	youtubeTokenMgr.getAccessToken( function(ytAccessToken){
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

};

var getAeServerWithLowestLoad = function(got_cb){
    
    var connectedAeServers = globalConnectionMgr.getConnectedRemotes('AE_SERVER');
    var connectedAeServerWithLowestLoad = null;
    var lowestLoadIndex =-1;
    
    
    var iteratorGetAeServerLoadIndex = function(aeServerToAsk, interationDone_cb){
        globalConnectionMgr.sendRequestToRemote( aeServerToAsk, { command: "GET_LOAD_INDEX", parameters: null }, function(responseParameters) {

            if ((responseParameters.load_index < lowestLoadIndex) || (lowestLoadIndex == -1) ){
                lowestLoadIndex = responseParameters.load_index;
                connectedAeServerWithLowestLoad = aeServerToAsk;
            }
            
            interationDone_cb();
        });
    };
    
    async.each(connectedAeServers, iteratorGetAeServerLoadIndex, function(err){
        if (!err) {
            if (got_cb){
                got_cb(connectedAeServerWithLowestLoad, null);
            }
        }
        else{
            if (got_cb){
                got_cb(null, err);
            }
        }
        
    });
    
};

//for test 
//aeServerMgr.getAeServerWithLowestLoad = getAeServerWithLowestLoad;

var defaultAeServer = 'AE_Server_feltmeng_art_PC';


//use long polling to ask AE Server to create Miix movie
aeServerMgr.createMiixMovie = function(movieProjectID, ownerStdID, ownerFbID, movieTitle, mediaType, createMovie_cb) {

	var starAeServerID = defaultAeServer;
	
	getAeServerWithLowestLoad(function(aeServerWithLowestLoad, err){
    if (!err){
        starAeServerID = aeServerWithLowestLoad;
    }
    
        logger.info('[aeServerMgr.createMiixMovie] aeServer to do rendering is : '+aeServerWithLowestLoad);

        youtubeTokenMgr.getAccessToken( function(ytAccessToken){
            if (ytAccessToken) {
                var userDataFolder = path.join( workingPath, 'public/contents/user_project', movieProjectID, 'user_data');
                
                var commandParameters = {
                    userFileList: fs.readdirSync(userDataFolder),
                    movieProjectID: movieProjectID,
                    ownerStdID: ownerStdID,
                    ownerFbID: ownerFbID,
                    movieTitle: movieTitle,
                    ytAccessToken: ytAccessToken,
                    mediaType: mediaType
                };
                            
                globalConnectionMgr.sendRequestToRemote( starAeServerID, { command: "RENDER_MIIX_MOVIE", parameters: commandParameters }, function(responseParameters) {
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
        
	});

	

};

//use long polling to ask AE Server to create Story movie
aeServerMgr.createStoryMV = function(movieProjectID, miixMovieFileExtension, ownerStdID, ownerFbID, movieTitle, createMovie_cb) {

	var starAeServerID = defaultAeServer;
	
    getAeServerWithLowestLoad(function(aeServerWithLowestLoad, err){
        if (!err){
            starAeServerID = aeServerWithLowestLoad;
        }
        youtubeTokenMgr.getAccessToken( function(ytAccessToken){
            if (ytAccessToken) {
                var userDataFolder = path.join( workingPath, 'public/contents/user_project', movieProjectID, 'user_data');
                
                var commandParameters = {
                    userFileList: fs.readdirSync(userDataFolder),
                    movieProjectID: movieProjectID,
                    miixMovieFileExtension: miixMovieFileExtension,
                    ownerStdID: ownerStdID,
                    ownerFbID: ownerFbID,
                    movieTitle: movieTitle,
                    ytAccessToken: ytAccessToken 
                };
                            
                globalConnectionMgr.sendRequestToRemote( starAeServerID, { command: "RENDER_STORY_MOVIE", parameters: commandParameters }, function(responseParameters) {
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
    });

	

};


aeServerMgr.uploadMovieToMainServer = function(movieProjectID, uploadMovie_cb) {

    var starAeServerID;
    var UGCDB = require('./UGC.js');
    UGCDB.getAeIdByPid(movieProjectID,function(err, _aeID){
        
        if (!err){
            starAeServerID = _aeID;
        }
        else{
            starAeServerID = defaultAeServer;
        }
    
        var commandParameters = {
            movieProjectID: movieProjectID
        };
        
        globalConnectionMgr.sendRequestToRemote( starAeServerID, { command: "UPLOAD_MOVIE_TO_MAIN_SERVER", parameters: commandParameters }, function(responseParameters) {
            //console.dir(responseParameters);
            if (uploadMovie_cb )  {
                uploadMovie_cb(responseParameters);
            }
        });
	
	});
	

};

aeServerMgr.downloadStoryMovieFromMainServer = function(movieProjectID, downloadMovie_cb) {


	var starAeServerID;
	var UGCDB = require('./UGC.js');
	UGCDB.getAeIdByPid(movieProjectID,function(err, _aeID){
        
        if (!err){
            starAeServerID = _aeID;
        }
        else{
            starAeServerID = defaultAeServer;
        }

        var commandParameters = {
            movieProjectID: movieProjectID
        };
        
        globalConnectionMgr.sendRequestToRemote( starAeServerID, { command: "DOWNLOAD_STORY_MOVIE_FROM_MAIN_SERVER", parameters: commandParameters }, function(responseParameters) {
            //console.dir(responseParameters);
            if (downloadMovie_cb )  {
                downloadMovie_cb(responseParameters);
            }
        });
	
	});


};

aeServerMgr.downloadStoryMovieFromS3 = function(movieProjectID, downloadMovie_cb) {


    var starAeServerID;
    var UGCDB = require('./UGC.js');
    UGCDB.getAeIdByPid(movieProjectID,function(err, _aeID){
        
        if (!err){
            starAeServerID = _aeID;
        }
        else{
            starAeServerID = defaultAeServer;
        }

        var commandParameters = {
            movieProjectID: movieProjectID
        };
        
        globalConnectionMgr.sendRequestToRemote( starAeServerID, { command: "DOWNLOAD_STORY_MOVIE_FROM_S3", parameters: commandParameters }, function(responseParameters) {
            //console.dir(responseParameters);
            if (downloadMovie_cb )  {
                downloadMovie_cb(responseParameters);
            }
        });
    
    });


};

aeServerMgr.downloadMiixMovieFromS3 = function(miixMovieProjectID, miixMovieFileExtension, downloadMovie_cb) {

    var starAeServerID;
    var UGCDB = require('./UGC.js');
    UGCDB.getAeIdByPid(miixMovieProjectID,function(err, _aeID){
        
        if (!err){
            starAeServerID = _aeID;
        }
        else{
            starAeServerID = defaultAeServer;
        }
    
        var commandParameters = {
            miixMovieProjectID: miixMovieProjectID,
            miixMovieFileExtension: miixMovieFileExtension
        };
        
        globalConnectionMgr.sendRequestToRemote( starAeServerID, { command: "DOWNLOAD_MIIX_MOVIE_FROM_S3", parameters: commandParameters }, function(responseParameters) {
            //console.dir(responseParameters);
            if (downloadMovie_cb )  {
                downloadMovie_cb(responseParameters);
            }
        });
    });
    

};


module.exports = aeServerMgr;