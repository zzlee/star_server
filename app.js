
var MONGO_DB_SERVER_ADDRESS = '192.168.5.189';

//Module dependencies.
var http = require('http'),
    https = require('https'),
    express = require('express'),
    crypto = require('crypto'),
    Db = require('mongodb').Db,
    dbserver = require('mongodb').Server,
    dbserver_config = new dbserver(MONGO_DB_SERVER_ADDRESS, 27017, {auto_reconnect: true, native_parser: true} ),
    fmdb = new Db('feltmeng', dbserver_config, {}),
    mongoStore = require('connect-mongodb'),
    app = express(),
	fs = require('fs'),
	path = require('path'),
    server = http.createServer(app),
    secureServer = https.createServer(app),
    sio = require('socket.io').listen(server),
    ssio = require('socket.io').listen(secureServer),
    youtubeMgr = require('./youtube_mgr.js'),
	winston = require('winston');

var workingPath = process.cwd();


require('./system_configuration.js').getInstance(function(_config){
    var routes = require('./routes');
    global.config = _config;
    global.routes = routes;
    global.app = app;

    require('./restful_api').init();
});


var logDir = path.join(workingPath,'log');
if (!fs.existsSync(logDir) ){
    fs.mkdirSync(logDir);
}

require('winston-mongodb').MongoDB;
var logger = new(winston.Logger)({
	transports: [ 
		new winston.transports.MongoDB({host:MONGO_DB_SERVER_ADDRESS, db: 'feltmeng', level: 'info'}),
		new winston.transports.File({ filename: './log/winston.log'})	
	],
	exceptionHandlers: [new winston.transports.MongoDB({host:MONGO_DB_SERVER_ADDRESS, db: 'feltmeng', level: 'info'}),
                    new winston.transports.File({filename: './log/exceptions.log'})
	]
	
});  

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
 
  //GL
  app.use(express.query());
  app.use(express.cookieParser('kooBkooCedoN'));
  app.use(express.session({
    secret: "thesecretoffeltmeng",
    maxAge: 24 * 60 * 60 * 1000 ,
    store: new mongoStore({ db: fmdb })
  }));  // sessionID save as "_id" of session doc in MongoDB.

  app.use(express.methodOverride());
  
  /* Must put this before app.router. */
  app.use( function (req, res, next) {
    res.locals.user = req.session.user;
    next(); // Please Don't forget next(), otherwise suspending;
  });  

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


http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});


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
