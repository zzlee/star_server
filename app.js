
/**
 * Module dependencies.
 */
var http = require('http'),
    https = require('https'),
    express = require('express'),
    routes = require('./routes'),
	user = require('./routes/user'),
    crypto = require('crypto'),
    Db = require('mongodb').Db,
    dbserver = require('mongodb').Server,
    dbserver_config = new dbserver('localhost', 27017, {auto_reconnect: true, native_parser: true} ),
    fmdb = new Db('feltmeng', dbserver_config, {}),
    mongoStore = require('connect-mongodb'),
    app = express(),
	fs = require('fs'),
	path = require('path'),
    server = http.createServer(app),
    secureServer = https.createServer(app),
    sio = require('socket.io').listen(server),
    ssio = require('socket.io').listen(secureServer),
	winston = require('winston');
  

require('winston-mongodb').MongoDB;
var logger = new(winston.Logger)({
	transports: [ 
		new winston.transports.MongoDB({ db: 'feltmeng', level: 'info'}),
		new winston.transports.File({ filename: './log/winston.log'})	
	],
	exceptionHandlers: [new winston.transports.File({filename: './log/exceptions.log'})]
	
});  

global.logger = logger;  
  

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


app.get('/users', user.list);


//GZ 
app.get('/get_template_list', routes.getTemplateList_cb );
app.get('/get_template_raw_data', routes.getTemplateRawData_cb );
app.get('/get_template_description', routes.getTemplateDescription_cb );
app.get('/get_template_customizable_object_list', routes.getTemplateCustomizableObjectList_cb );
app.post('/upload_user_data', routes.uploadUserData_cb );
app.get('/oauth2callback', routes.YoutubeOAuth2_cb );
app.post('/upload', routes.upload_cb );
app.post('/upload_user_data_info',routes.uploadUserDataInfo_cb);
//app.get('/report_rendering_result', routes.reportRenderingResult_cb);
app.get('/long_polling_from_ae_server', routes.longPollingFromAeServer_cb);
app.post('/record_user_action', routes.recordUserAction_cb );

app.get('/internal/commands', routes.command_get_cb);
app.post('/internal/command_responses', routes.commandResponse_post_cb);
app.post('/internal/dooh/movie_playing_state', routes.dooh_handler.doohMoviePlayingState_post_cb);
app.post('/internal/story_cam_controller/available_story_movie', routes.storyCamControllerHandler.availableStoryMovie_post_cb);

//GL
/**
 *  WEB ADMINISTRATION
 */

app.get('/admin', routes.admin.handler); 
app.get('/admin/login', routes.admin.login);
app.get('/admin/memberList', routes.admin.memberList);
app.get('/admin/playList', routes.admin.playList);

/*
app.get('/', routes.profile, routes.index);
app.get('/censorship', routes.censorship);
app.get('/([a-zA-Z0-9]+)', routes.api.profile);
app.get('/signin_fb', routes.signinFB);

app.post('/', routes.profile, routes.index);
app.post('/signin', routes.signin, routes.profile, routes.index);
app.post('/signup', routes.signup, routes.profile, routes.index);
app.post('/addEvent', routes.addEvent, routes.event, routes.schedule);
app.post('/addVideo', routes.addVideo, routes.profile, routes.index );

app.del('/', routes.signout, routes.index);*/

/**
 *  Internal
 */
//JF, modified by Gabriel
app.post('/internal/dooh_periodic_data', routes.dooh_handler.importPeriodicData);

app.get('/internal/dooh_current_video', routes.dooh_handler.dooh_current_video);


/**
 * FM.API
 */
app.get('/api/eventsOfWaiting', routes.api.eventsOfWaiting);
app.get('/api/schedule', routes.api.eventsOfPeriod);
app.get('/api/userProfile', routes.api.userProfile);
app.get('/api/profile', routes.api.profile);
app.get('/api/fbStatus', routes.api.fbStatus);
app.get('/api/fbGetComment', routes.api.fbGetCommentReq);
app.get('/api/fbGetThumbnail', routes.api.fbGetThumbnail);
app.get('/api/newVideoList', routes.api.newVideoList);
app.get('/api/newStreetVideoList', routes.api.newStreetVideoList);
app.get('/api/codeGeneration', routes.api.codeGenerate);



/*
 *  member.js
 */
app.get('/api/member.isFBTokenValid', routes.member.isFBTokenValid);



app.post('/api/signin', routes.api.signin);

//app.post('/', routes.profile, routes.index);
app.post('/api/signup', routes.api.signup);
app.post('/api/addEvent', routes.api.addEvent);
app.post('/api/reject', routes.api.reject);
app.post('/api/prove', routes.api.prove);
app.post('/api/signupwithFB', routes.api.signupwithFB);
app.post('/api/deviceToken', routes.api.deviceToken);
app.post('/api/submitAVideo', routes.api.submitAVideo);
app.post('/api/submitDooh', routes.api.submitDooh);
app.post('/api/codeVerification', routes.api.codeVerify);

app.del('/', routes.api.signout);

//JF
app.post('/internal/dooh_timeslot_rawdata', routes.timeDataGet);


http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});



var aeServerMgr = require('./ae_server_mgr.js');
var doohMgr = require('./dooh_mgr.js');
var storyCamControllerMgr = require('./story_cam_controller_mgr.js');
var storyContentMgr = require('./story_content_mgr.js');


/* 
//test

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
