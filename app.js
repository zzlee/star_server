var systemConfig = require('./system_configuration.js').getInstance();
if ( (systemConfig.HOST_STAR_COORDINATOR_URL===undefined) || (systemConfig.IS_STAND_ALONE===undefined) ) {
	console.log("ERROR: system_configuration.json is not properly filled!");
	process.exit(1);
}
global.systemConfig = systemConfig;

/**
 * Module dependencies.
 */
var express = require('express');
var routes = require('./routes');
var http = require('http');
var https = require('https');
var path = require('path');
var crypto = require('crypto');
var Db = require('mongodb').Db;
var dbserver = require('mongodb').Server;
var mongoStore = require('connect-mongodb');
var fs = require('fs');
var path = require('path');
var url = require('url');
var winston = require('winston');
var async = require('async');

/**
 * File dependencies.
 */
var globalConnectionMgr = require('./global_connection_mgr.js');
var youtubeMgr = require('./youtube_mgr.js');
var ugcSerialNoMgr = require('./ugc_serial_no_mgr.js');

var app = express();

var workingPath = process.cwd();

var mongoDbServerUrlObj = url.parse(systemConfig.HOST_MONGO_DB_SERVER_URL);
var mongoDbServerPort;
if ( mongoDbServerUrlObj.port  ){
    mongoDbServerPort = Number(mongoDbServerUrlObj.port);
}
else {
    mongoDbServerPort = 27017;
}
var dbserver_config = new dbserver(mongoDbServerUrlObj.hostname, mongoDbServerPort, {auto_reconnect: true, native_parser: true} );
var fmdb = new Db('feltmeng', dbserver_config, {});

var logDir = path.join(workingPath,'log');
if (!fs.existsSync(logDir) ){
    fs.mkdirSync(logDir);
}

require('winston-mongodb').MongoDB;
var logger = new(winston.Logger)({
	transports: [ 
		new winston.transports.MongoDB({host:systemConfig.MONGO_DB_SERVER_ADDRESS, db: 'feltmeng', level: 'info', username: systemConfig.HOST_MONGO_DB_USER_NAME, password: systemConfig.HOST_MONGO_DB_PASSWORD}),
		new winston.transports.File({ filename: './log/winston.log'})	
	],
	exceptionHandlers: [new winston.transports.MongoDB({host:systemConfig.MONGO_DB_SERVER_ADDRESS, db: 'feltmeng', level: 'info', username: systemConfig.HOST_MONGO_DB_USER_NAME, password: systemConfig.HOST_MONGO_DB_PASSWORD}),
                    new winston.transports.File({filename: './log/exceptions.log'})
	]
	
});  

//var logger = {
//info: function(){},
//error: function(){}
//};

global.logger = logger;  
  
var userProjectDir = path.join(workingPath,'public/contents/user_project');
if (!fs.existsSync(userProjectDir) ){
    fs.mkdirSync(userProjectDir);
}

var tempDir = path.join(workingPath,'public/contents/temp');
if (!fs.existsSync(tempDir) ){
    fs.mkdirSync(tempDir);
}



app.configure(function(){
  app.set('port', process.env.PORT || 80);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  //app.use(express.logger('dev'));
  app.use(express.bodyParser());

  app.use(express.methodOverride());
  
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));

});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.configure('production', function(){
  app.use(express.errorHandler({ dumpExceptions: true })); 
});


youtubeMgr.refreshToken();

async.waterfall([
    function(callback){
        //Initialize ugcSerialNoMgr
        ugcSerialNoMgr.init(function(err) {
            if (!err){
                callback(null);
            }
            else {
                callback("Failed to initialize ugcSerialNoMgr: "+err);
            }
        });
    },
    function(callback){
        //Defiene the RESTful APIs
        var routes = require('./routes');
        global.routes = routes;
        global.app = app;

        require('./restful_api').init();
        
        http.createServer(app).listen(app.get('port'), function(){
            console.log("Express server listening on port " + app.get('port'));
            callback(null);
        });
    }
], function (err) {
    if (err){
        console.log('app.js initializes with errors: '+err);
    }
});

/**
 * Upload temp file from web app.
 * @author Jean
 * @todo need to move miix_handler.js
 */
var path = require('path'),
	fs = require('fs');
var workingPath = process.cwd();
var canvasMgr = require('./canvas_mgr.js');
app.post('/miix/ugcInfo/', function(req,res){
	//console.dir(req.body);
	var tempPath = req.files.file.path;
	
	 var projectDir = path.join( workingPath, 'public/contents/user_project', req.body.projectId);
     var userDataDir = path.join( projectDir, 'user_data');
     if ( !fs.existsSync(projectDir) ) {
         fs.mkdirSync( projectDir );  //TODO: check if this is expensive... 
     }
     if ( !fs.existsSync(userDataDir) ) {
         fs.mkdirSync( userDataDir );  //TODO: check if this is expensive... 
     }
     target_path = path.join( userDataDir, req.files.file.name);
	 
    
	    var moveFile = function( _tmp_path, _target_path, _moveFile_cb )  {
	        var util = require('util');
	            
	        var is = fs.createReadStream(_tmp_path);
	        var os = fs.createWriteStream(_target_path);
	        
	        util.pump(is, os, function(err) {
	            if (!err) {
	                fs.unlink(_tmp_path, function() {
	                    if (!err) {
	                        logger.info( 'Finished uploading to ' + _target_path );
	                        
	                        if ( _moveFile_cb ) {
	                            _moveFile_cb();
	                        }
	                    }else {
	                        logger.info('Fail to delete temporary uploaded file: '+err);
	                        res.send( {err:'Fail to delete temporary uploaded file: '+err});
	                    }
	                });
	            }
	            else {
	                logger.info('Fail to do util.pump(): '+err);
	                res.send( {err:'Fail to do util.pump(): '+err } );
	            }
	        });			
	    };
	    async.series([
	                  function(callback){
	                	  moveFile(tempPath, target_path);
	                	  callback(null);
	                  },
	                  function(callback){
	                	  
	                	  var tmpLength = req.body.genre.split("_").length;
	                	  var subTemplate = req.body.genre.split("_")[tmpLength - 1];
	                	  var text = "";
	                	  if(req.body.text){
	                		 text = req.body.text;
	                	  }
	                	  
	                	  if(subTemplate == "pic"){
	                		  subTemplate = "picture_only";
	                	  }else if(subTemplate == "text"){
	                		  subTemplate = "picture_plus_text";
	                	  }
	                	  var content = {
	                			  "id" :  req.body._id,
	                			  "fbId": req.body.fbUserId,
	                			  "projectId": req.body.projectId,
	                			  "template": req.body.genre,
	                			  "file": req.files.file.name,
	                			  "subTemplate" : subTemplate,
	                			  "text": text
	                	  }
	                	  //console.dir(content);
	                	  canvasMgr.genLongPhoto(content, function(err, res){
	                		  if(err) logger.info( 'Finished genImageUGC Failed.');
	                		  if(!err) {
	                			  logger.info( 'Stat generate UGCs.');
	                			  callback(null);
	                		  }
	                	  });
	                  }
	                  ],function(err){
	    				if(err){
	    					logger.info('Failed to upload and gen UGCs');
	    				}else{
	    					logger.info( 'Send redirect html to client side. ');
	    				    res.writeHead(200, "OK", {'Content-Type': 'text/html'});
	    				    res.write('<html>');
	    				    res.write('<script>');
	    				    res.write('function init(){' +
	    				    			'setTimeout(' +
//	    				    			"window.location = 'http://joy.ondascreen.com/demo/preview.html',15000);" +
	    				    				"window.location = '/demo/preview.html',15000);" +
	    				    			'}');
	    				    res.write('</script>');
	    				    res.write("<body onload='init();'><h4>圖片合成中，請稍候......</h4></body></html>");
	    				    res.end();
	    				}
	    	
	    });

//	    res.send({message:'Upload successfully'});
	    
	
});
//post/miix/originalImage
/**
 * Upload user's photo and saved in server temporily for croppering the photo
 * @author Jean
 * @todo Need to move to miix_handler.js
 */
app.post('/miix/originalImage/', function(req,res){
	//console.dir(req.body);
	var tempPath = req.files.file.path;
	
	 var projectDir = path.join( workingPath, 'public/contents/user_project', req.body.projectId);
     var userDataDir = path.join( projectDir, 'user_data');
     if ( !fs.existsSync(projectDir) ) {
         fs.mkdirSync( projectDir );  //TODO: check if this is expensive... 
     }
     if ( !fs.existsSync(userDataDir) ) {
         fs.mkdirSync( userDataDir );  //TODO: check if this is expensive... 
     }
     target_path = path.join( userDataDir, req.files.file.name);

     
     /**
      * Save the temp file and then send the photo's url to cliend side.
      */
     async.series([
                   function(callback){
                	   var moveFile = function( _tmp_path, _target_path, _moveFile_cb )  {
                		   var util = require('util');
                		   var is = fs.createReadStream(_tmp_path);
                		   var os = fs.createWriteStream(_target_path);
                		   util.pump(is, os, function(err) {
                			   if (!err) {
                				   fs.unlink(_tmp_path, function() {
                					   if (!err) {
                						   logger.info( 'Finished uploading to ' + _target_path );
                						   if ( _moveFile_cb ) {
                							   _moveFile_cb();
                							   
                						   }
                					   }else {
                						   logger.info('Fail to delete temporary uploaded file: '+err);
                						   res.send( {err:'Fail to delete temporary uploaded file: '+err});
                						   callback('Fail to delete temporary uploaded file: '+err);
                					   }
                				   });
                			   }else {
                				   logger.info('Fail to do util.pump(): '+err);
                				   res.send( {err:'Fail to do util.pump(): '+err } );
                				   callback('Fail to do util.pump(): '+err);
                			   }
                		   });//end of util.pump			
                	   };// end of function moveFile
                	   moveFile(tempPath, target_path);
                	   callback(null);
                	   
                   }],function(err){
	    				if(err){
	    					logger.info('Failed to upload and gen UGCs' + err);
	    				}else{
							logger.info( 'Send redirect html to client side. ');
							var tmpLength = req.body.template.split("_").length;
							var subTemplate = req.body.template.split("_")[tmpLength - 1];
							var text = "";
							if(req.body.text){
								text = req.body.text;
							}
	                	  
							if(subTemplate == "pic"){
								res.writeHead(200, "OK", {'Content-Type': 'text/html'});
								res.write('<html>');
								res.write('<script>');
								res.write('function init(){' +
	    				    			'setTimeout(' +
//	    				    			window.location = 'http://joy.ondascreen.com/demo/preview.html',15000);" +
	    				    				//"window.location = '/demo/upload_photo.html',1000);" +
											"window.location.replace('/demo/upload_photo.html'),1000);" +
	    				    			'}');
								res.write('</script>');
								res.write("<body onload='init();'><h4>畫面待轉中，請稍候......</h4></body></html>");
								res.end();
							}else if(subTemplate == "text"){
								res.writeHead(200, "OK", {'Content-Type': 'text/html'});
								res.write('<html>');
								res.write('<script>');
								res.write('function init(){' +
	    				    			'setTimeout(' +
//	    				    			window.location = 'http://joy.ondascreen.com/demo/preview.html',15000);" +
	    				    				//"window.location = '/demo/upload_text.html',1000);" +
											"window.location.replace('/demo/upload_photo.html'),1000);" +
	    				    			'}');
								res.write('</script>');
								res.write("<body onload='init();'><h4>畫面待轉中，請稍候......</h4></body></html>");
								res.end();
							}

	    				}
	    });//End of async.series

	    
	
});

//var globalConnectionMgr = require('./global_connection_mgr.js');
//setInterval(function(){
//    var commandParameters = {
//        para1: "hello_from_star_server",
//        paraTest2: "test"
//    };
//                
//    globalConnectionMgr.sendRequestToRemote( "AE_Server_Gance_PC", { command: "CONNECTION_TEST", parameters: commandParameters }, function(responseParameters) {
//        console.log('responseParameters=');
//        console.dir(responseParameters);
//    });
//}, 4000);


//var globalConnectionMgr = require('./global_connection_mgr.js');
//setTimeout(function(){
//    var commandParameters = {
//        para1: "hello",
//        paraTest2: "test"
//    };
//                
//    globalConnectionMgr.sendRequestToRemote( "story_cam_server_Gance_PC", { command: "CONNECTION_TEST", parameters: commandParameters }, function(responseParameters) {
//        console.log('responseParameters=');
//        console.dir(responseParameters);
//    });
//}, 10000);



//var test_s3 = require('./aws_s3.js');
//setTimeout(function(){
//	//change the auth to save files on s3
//	console.log("aws_s3 test!");
////	var key = '/user_project/.jpg';
//	var key = '/user_project/Summer.mp4';
////	var obj = "C:\\Users\\feltmeng-user\\Desktop\\star_server\\star_server\\public\\images\\logo.jpg";
//	var obj = "C:\\Users\\feltmeng-user\\Desktop\\PopDanthology2012.mp4"
////	test_s3.uploadToAwsS3(obj, key, 'image/jpeg', function(err, result){
//	test_s3.uploadToAwsS3(obj, key, 'video/mp4', function(err, result){
//		if(err)
//			console.log("test_s3 error");
//		else
//			console.log("test_s3 success");
//	});
//	
//	
//},3000);

//setTimeout(function(){
//    //routes.api._pushNotification('279dce6929111751da154cfa87a01afe286d4208178b162fabd1a7bcb89ad6a3');
//    var pushMgr = require("./push_mgr.js");
//    pushMgr.sendMessageToDevice('iPhone', '279dce6929111751da154cfa87a01afe286d4208178b162fabd1a7bcb89ad6a3', "您有一個新影片！"); //Gance's iPHone 4S
//    pushMgr.sendMessageToDevice('iPhone', 'ef8bcdfdb6445f172962dd4a1c6adc78e13c0e2373ef11a926366a3bfb59e3ce', "test push"); //team's iPHone 4S
//    pushMgr.sendMessageToDevice('iPhone', 'be63fd268cec11e01d69a435101a7d33efe4ebc984a03a66e540f28f9f5f107b', "您有一個新影片！"); //Joy's iPHone 4S
//    console.log('test push sent');
//
//}, 5000);


/*
//test



var scheduleMgr = require('./schedule_mgr.js');
    setTimeout(function(){
    
    scheduleMgr.createProgramList("TP_dom", 
        {start:(new Date("2013/7/21 6:00")).getTime(), end:(new Date("2013/7/21 7:00")).getTime()}, 
        {start:(new Date("2013/7/21 9:00")).getTime(), end:(new Date("2013/7/21 9:20")).getTime()}, 
        ["miix_it", "cultural_and_creative", "mood", "check_in" ], function(err, result){
            console.log("err=%s result=", err);
            console.dir(result);
            
            if (!err){
                scheduleMgr.pushProgramsTo3rdPartyContentMgr(result.sessionId, function(err){
                    console.log("err=%s ", err);
                });
            } 
            
    });
    
     
    scheduleMgr.getProgramList("TP_dom",{start:(new Date("2013/5/5 7:00")).getTime(), end:(new Date("2013/5/5 23:00")).getTime()}, null, 30, function(err2, result2){
        console.log('result=');
        console.dir(result2);
    });

    scheduleMgr.setUgcToProgram( "51da8db6fdf3b7e009000003", 426, function(err, result){
        console.log('result=');
        console.dir(result);
        console.log("err=%s", err);
    });
    
    scheduleMgr.removeUgcfromProgramAndAutoSetNewOne('1367596800000-1367683140000-1373357471568', '51dbc59f27c747c80b000003', function(err){
        console.log('err=%s',err);
    });
    
    
    scheduleMgr.pushProgramsTo3rdPartyContentMgr('1372732200000-1372734000000-1373972400000-1373973300000-1374026315925', function(err){
        console.log("err=%s ", err);
    });
    
    
},1000);
*/

    /*
var aeServerMgr = require('./ae_server_mgr.js');
var globalConnectionMgr = require('./global_connection_mgr.js');
setInterval(function(){
    var connectedServers = globalConnectionMgr.getConnectedRemotes('AE_SERVER');
    console.dir(connectedServers);
    aeServerMgr.getAeServerWithLowestLoad(function(aeServerWithLowestLoad, err){
        console.log('aeServerWithLowestLoad= %s', aeServerWithLowestLoad);
    });
}, 5000);

var aeServerMgr = require('./ae_server_mgr.js');
var doohMgr = require('./dooh_mgr.js');
var storyCamControllerMgr = require('./story_cam_controller_mgr.js');
var storyContentMgr = require('./story_content_mgr.js');
var globalConnectionMgr = require('./global_connection_mgr.js');


setTimeout(function(){
    var connectedServers = globalConnectionMgr.getConnectedRemotes('AE_SERVER');
    console.dir(connectedServers);
}, 6000);


setTimeout(function(){
//setInterval(function(){ 
	//aeServerMgr.createMovie('http://192.168.5.101', 'rotate-anonymous-20121115T004014395Z', 'aa', 'aa_fb', 'video to test');
	//routes.sendRequestToAeServer( "gance_Feltmeng_pc", { command: "RENDER", movieProjectID: "1234", time: (new Date()).toString()} );
	//aeServerMgr.createMovie_longPolling("gance_Feltmeng_pc", "greeting-50c85019e6b209a80f000004-20121213T015823474Z", "ownerStdID", "ownerFbID", "movieTitle")
	//aeServerMgr.uploadMovieToMainServer('greeting-50c99d81064d2b841200000a-20130108T054254436Z', function(resParametes){
	//	console.log('uploading ended. Response:');
	//	console.dir(resParametes);
	//});
	//doohMgr.downloadMovieFromMainServer('greeting-50ee77e2fc4d981408000014-20130207T014253670Z', function(resParametes){
	//	console.log('downloading ended. Response:');
	//	console.dir(resParametes);
	//});
}, 5000);

setTimeout(function(){
	console.log('storyCamControllerMgr.startRecording()');
	storyCamControllerMgr.startRecording('greeting-50ee77e2fc4d981408000014-20130207T014253670Z', function(resParametes){
		console.log('started recording. Response:');
		console.dir(resParametes);
	});
}, 5000);

setTimeout(function(){
	console.log('storyCamControllerMgr.stopRecording()');
	storyCamControllerMgr.stopRecording( function(resParametes){
		console.log('stopped recording. Response:');
		console.dir(resParametes);
	});
}, 12000);


setTimeout(function(){
	console.log('storyCamControllerMgr.uploadStoryMovieToMainServer()');
	storyCamControllerMgr.uploadStoryMovieToMainServer('greeting-50ee77e2fc4d981408000014-20130222T023238273Z', function(resParametes){
		console.log('uploading ended. Response:');
		console.dir(resParametes);
	}); 

}, 5000);


setTimeout(function(){
	aeServerMgr.downloadStoryMovieFromMainServer('greeting-50ee77e2fc4d981408000014-20130207T014253670Z', function(resParametes){
		console.log('downloading ended. Response:');
		console.dir(resParametes);
	}); 

}, 5000);



setTimeout(function(){
	console.log('aeServerMgr.createStoryMV()');
	aeServerMgr.createStoryMovie('greeting-50ee77e2fc4d981408000014-20130207T014253670Z', 'myStdID', 'myFbID', 'My Story Movie', function(resParametes){
		console.log('createStoryMovie ended. Response:');
		console.dir(resParametes);
	}); 

}, 5000);
	

setTimeout(function(){
	console.log('storyContentMgr.generateStoryMV()');
	storyContentMgr.generateStoryMV('greeting-50ee77e2fc4d981408000014-20130222T023238273Z'); 

}, 5000);



setTimeout(function(){
	console.log('storyContentMgr.generateStoryMV()');
	storyContentMgr.generateStoryMV('greeting-50c99d81064d2b841200000a-20130223T113921895Z'); 

}, 20000);
*/

/*
//test for fmapi._fbPostVideoThenAdd()
var fmapi = require('./routes/api.js'); 
var memberDB = require('./member.js');
var videoDB = require('./video.js');

setTimeout(function(){

    var movieProjectID = 'greeting-50c99d81064d2b841200000a-20130224T152058176Z';

	var ownerStdID;
	var ownerFbID;
	var movieTitle;
	
	var getUserIdAndName = function( finish_cb ){
		videoDB.getOwnerIdByPid( movieProjectID, function( err, _ownerStdID) {
			if (!err) {
				ownerStdID = _ownerStdID;
				memberDB.getUserName( ownerStdID, function(err2, result){
					if (!err2) {
						ownerFbID = result;
                        movieTitle = ownerFbID+"'s Miix story movie";
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


    var youtubeVideoID = 'WZ7Tp-ieReY';
    var url = {"youtube":"http://www.youtube.com/embed/"+youtubeVideoID};			
    var vjson = {"title": movieTitle,
                 "ownerId": {"_id": ownerStdID, "userID": ownerFbID},
                 "url": url,
                 "genre":"miix_story",
                 "projectId":movieProjectID};
    getUserIdAndName(function(err2){
        if (!err2){
            fmapi._fbPostVideoThenAdd(vjson); //TODO: split these tasks to different rolls
            console.log('fmapi._fbPostVideoThenAdd(vjson) called. vjson=');
            console.dir(vjson);
            console.log(JSON.stringify(vjson));
        }
    });
	 

}, 3000);
*/

/*
//test of Jeff
app.get('/test', function(req, res) {
	//get message.
	user = req.headers.message;
	res.writeHead(200, { "Content-Type": "text/plain" });
	if(user) {
		logger.info('Client message: ' + user);
		//send to client.
		res.write('Hello.');
	} else {
		logger.info(user);
		logger.info('No data.');
	}
	res.end();
});
*/
