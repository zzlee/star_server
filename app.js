

//Module dependencies.
var http = require('http'),
    https = require('https'),
    express = require('express'),
    routes = require('./routes'),
	user = require('./routes/user'),
    crypto = require('crypto'),
    Db = require('mongodb').Db,
    dbserver = require('mongodb').Server,
    dbserver_config = new dbserver('192.168.5.189', 27017, {auto_reconnect: true, native_parser: true} ),
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
		new winston.transports.MongoDB({host:'192.168.5.189', db: 'feltmeng', level: 'info'}),
		new winston.transports.File({ filename: './log/winston.log'})	
	],
	exceptionHandlers: [new winston.transports.MongoDB({host:'192.168.5.189', db: 'feltmeng', level: 'info'}),
	                    new winston.transports.File({filename: './log/exceptions.log'})
	]
	
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



//generic 

app.get('/fb/comment', routes.api.fbGetCommentReq); 
app.get('/fb/thumbnail', routes.api.fbGetThumbnail);
app.get('/members/authentication_code', routes.api.codeGenerate);
app.post('/members/authentication_code_validity', routes.api.codeVerify);  //TODO: better use GET
app.get('/members/fb_token_validity', routes.member.isFBTokenValid);
app.post('/members/fb_info', routes.api.signupwithFB);
app.post('/members/device_tokens', routes.api.deviceToken);



/**
 * RESTful APIs for Miix clientss
 * @namespace miix
 */


// Miix client 


/**
 * Upload/add an user content file of a specific video or image UGC<br>
 * 
 * <h5>Path parameters</h5>
 * <ul>
 * <li>ugcProjectId: the project ID of the UGC
 * </ul>
 * 
 * <h5>Query parameters</h5>
 * None
 * 
 * <h5>Request body</h5>
 * (to be elaborated later)
 * 
 * <h5>Response body</h5>
 * 
 * @name POST /miix/ugcs/:ugcProjectId/user_content_files
 * @memberof miix
 */
app.post('/miix/videos/user_content_files', routes.uploadUserContentFile_cb ); //v1.2

/**
 * Create an user content description of a specific video UGC<br>
 * 
 * <h5>Path parameters</h5>
 * <ul>
 * <li>ugcProjectId: the project ID of the UGC
 * </ul>
 * 
 * <h5>Query parameters</h5>
 * None
 * 
 * <h5>Request body</h5>
 * (to be elaborated later)
 * 
 * <h5>Response body</h5>
 * 
 * @name POST /miix/video_ugcs/:ugcProjectId/user_content_descriptions
 * @memberof miix
 */
app.post('/miix/videos/user_content_description',routes.uploadUserDataInfo_cb);  //v1.2

/**
 * Create an user content description of a specific image UGC<br>
 * 
 * <h5>Path parameters</h5>
 * <ul>
 * <li>ugcProjectId: the project ID of the UGC
 * </ul>
 * 
 * <h5>Query parameters</h5>
 * None
 * 
 * <h5>Request body</h5>
 * (to be elaborated later)
 * 
 * <h5>Response body</h5>
 * 
 * @name POST /miix/image_ugcs/:ugcProjectId/user_content_descriptions
 * @memberof miix
 */


app.get('/miix/videos/new_videos', routes.api.newUGCList); //v1.2 only, to be DEPRECATED after new design of UGC list in v2.0

/**
 * Create a video UGC of a specific project ID<br>
 * 
 * <h5>Path parameters</h5>
 * <ul>
 * <li>ugcProjectId: the project ID of the UGC
 * </ul>
 * 
 * <h5>Query parameters</h5>
 * None
 * 
 * <h5>Request body</h5>
 * (to be elaborated later)
 * 
 * <h5>Response body</h5>
 * 
 * @name PUT /miix/video_ugcs/:ugcProjectId
 * @memberof miix
 */
app.post('/miix/videos/miix_videos', routes.api.submitAUGC); //v1.2

app.post('/miix/videos/videos_on_dooh', routes.api.submitDooh); //v1.2 only.  In v2.0, all UGCs are to be played on a DOOH

/**
 * Upload a base64 image UGC of a specific project ID. The uploaded image data will be save as a PNG file.<br>
 * <br>
 * The base64 image is often generated by calling toDataURL() of HTML5 Canvas. 
 * It normally needs to do the following process before sending to this API:<br>
 * yourCanvas.toDataURL('image/png').replace('image/octet-stream');
 * 
 * <h5>Path parameters</h5>
 * <ul>
 * <li>ugcProjectId: the project ID of the UGC
 * </ul>
 * 
 * <h5>Query parameters</h5>
 * None
 * 
 * <h5>Request body</h5>
 * (to be elaborated later)
 * 
 * <h5>Response body</h5>
 * 
 * @name PUT /miix/base64_image_ugcs/:ugcProjectId
 * @memberof miix
 */
app.post('/miix/videos/miix_videos', routes.api.submitAUGC); //v1.2


/**
 * Get a list of latest UGC highlights, sorted by creating time (the newest at beginning)<br>
 * 
 * <h5>Path parameters</h5>
 * None
 * 
 * <h5>Query parameters</h5>
 * <ul>
 * <li>limit: the number of UGC items to return
 * </ul>
 * 
 * <h5>Request body</h5>
 * None
 * 
 * <h5>Response body</h5>
 * 
 * @name GET /miix/ugc_hightlights
 * @memberof miix
 */
app.get('/miix/ugc_hightlights', function(req, res){
    var db = require('./db.js');
    
    var ugcModel = db.getDocModel("ugc");
    ugcModel.find({ "rating": "A", $or: [ { "contentGenre":"miix_it" }, { "contentGenre": "check_in"} ] }).sort({"createdOn":-1}).limit(10).exec(function (err, docs) {
        if (!err){
            res.send(docs);
        }
        else {
            res.send(400, {error: err} );
        }
        
    });
    
});

/**
 * Get a list of latest UGCs of a specific member , sorted by creating time (the newest at beginning)<br>
 * <h5>Path parameters</h5>
 * <ul>
 * <li>memberId: Member ID (_id of 24 character hex string)
 * </ul>
 * 
 * <h5>Query parameters</h5>
 * <ul>
 * <li>limit: the number of UGC items to return
 * </ul>
 * 
 * <h5>Request body</h5>
 * None
 * 
 * <h5>Response body</h5>
 * @name GET /miix/members/:memberId/ugcs
 * @memberof miix
 */

/**
 * Get a list of latest live content items (a.k.a. "Miix Story" or "Story MV") of a specific member , sorted by creating time (the newest at beginning)<br>
 * <h5>Path parameters</h5>
 * <ul>
 * <li>memberId: Member ID (_id of 24 character hex string)
 * </ul>
 * 
 * <h5>Query parameters</h5>
 * <ul>
 * <li>limit: the number of UGC items to return
 * </ul>
 * 
 * <h5>Request body</h5>
 * None
 * 
 * <h5>Response body</h5>
 * @name GET /miix/members/:memberId/live_contents
 * @memberof miix
 */


/**
 * RESTful APIs for back-end administration of Miix services
 * @namespace miix_admin
 */

app.get('/miix_admin', routes.admin.get_cb); 
app.get('/miix_admin/login', routes.admin.login_get_cb); //TODO: change to a better resource name of RESTful style
app.get('/miix_admin/logout', routes.admin.logout_get_cb); //TODO: change to a better resource name of RESTful style
app.get('/miix_admin/members', routes.authorizationHandler.checkAuth, routes.admin.memberList_get_cb);
app.get('/miix_admin/miix_movies', routes.authorizationHandler.checkAuth, routes.admin.miixPlayList_get_cb); 
app.get('/miix_admin/story_movies', routes.authorizationHandler.checkAuth, routes.admin.storyPlayList_get_cb);
app.get('/miix_admin/list_size', routes.authorizationHandler.checkAuth, routes.admin.listSize_get_cb);
app.get('/miix_admin/ugc_censor', routes.authorizationHandler.checkAuth, routes.censor_handler.getUGCList_get_cb);

app.get('/miix_admin/user_content_items', routes.censor_handler.getUGCList_get_cb);
app.put('/miix_admin/user_content_attribute', routes.censor_handler.setUGCAttribute_get_cb);
app.get('/miix_admin/timeslots', routes.censor_handler.timeslots_get_cb);

/**
 * Get the questions of a specific member<br>
 * 
 * <h5>Path parameters</h5>
 * <ul>
 * <li>memberId: Member ID (_id with hex string)
 * </ul>
 * 
 * <h5>Query parameters</h5>
 * None
 * 
 * <h5>Request body</h5>
 * None
 * 
 * <h5>Response body</h5>
 * An array of objects containing the following members:
 * <ul>
 * <li>_id: member ID (_id of 24 character hex string)
 * <li>ugcReferenceNo: reference number for this UGC
 * <li>genre: string indicating the question genre. It is of one of the following values: "acount", "login", or "verification"
 * <li>question: an object containing the following members:
 *     <ul>
 *     <li>description: the description of the question
 *     <li>date: its issue date (the number of milliseconds since midnight Jan 1, 1970)
 *     </ul>
 * <li>answer: an object containing the following members:
 *     <ul>
 *     <li>description: the description of the answer
 *     <li>date: its issue date (the number of milliseconds since midnight Jan 1, 1970)
 *     </ul>
 * </ul>
 * For example, <br>
 * [{_id: '51d837f6830459c42d000023', ugcReferenceNo: 234, genre: 'acount', question:{description:'我忘記了我FB帳號的密碼', date: 1371862000000}, answer:{description:'請至Facebook官網(www.facebook.com)新設定', date: 1371962000000} } <br>
 *  {_id: '51d837f6830459c42d000023', ugcReferenceNo: 256, genre: 'login', question:{description:'我的帳號登不進去', date: 1371862000000}, answer:{description:'請確認您有出現faceboo授權頁面嗎', date: 1371892000000} }, <br>                 
 *  {_id: '51d837f6830459c42d000023', ugcReferenceNo: 314, genre: 'verification', question:{description:'我無法通迥認證', date: 1471862000000}, answer:{description:'請確認您有收到認證簡訊', date: 1471962000000} }];                   
 *
 * @name GET /members/:memberId/questions
 * @memberof miix_admin
 */
app.get('/members/:member_id/questions', routes.authorizationHandler.checkAuth, function(req, res){
    console.log('[GET %s]', req.path);
    console.log('req.params.member_id=%s',req.params.member_id);
    console.log('req.route.path=%s',req.route.path);
    
    var result = [{_id: '51d837f6830459c42d000023', ugcReferenceNo: 234, genre: 'acount', question:{description:'我忘記了我FB帳號的密碼', date: 1371862000000}, answer:{description:'請至Facebook官網(www.facebook.com)新設定', date: 1371962000000} },
                  {_id: '51d837f6830459c42d000023', ugcReferenceNo: 256, genre: 'login', question:{description:'我的帳號登不進去', date: 1371862000000}, answer:{description:'請確認您有出現faceboo授權頁面嗎', date: 1371892000000} },
                  {_id: '51d837f6830459c42d000023', ugcReferenceNo: 314, genre: 'verification', question:{description:'我無法通迥認證', date: 1471862000000}, answer:{description:'請確認您有收到認證簡訊', date: 1471962000000} }];
    
    res.send(200, result);
});


app.post('/members/:member_id/questions', function(req, res){
    
});

/**
 * Get the UGC list<br>
 * <h5>Path Parameters</h5>
 * None
 * <h5>Query Parameters</h5>
 * <ul>
 * <li>skip: The number decide that first query.
 * <li>limit: The number decide that limit of query.
 * <li>token: authorization.
 * <li>condition: The json decide that query codition.
 * </ul>
 * <h5>Request body</h5>
 * None
 * <h5>Response body</h5>
 * An array of objects containing the following members:
 * <ul>
 * <li>_id: UGC ID with 24 byte hex string
 * <li>userPhotoUrl: 
 * <li>ugcCensorNo: 
 * <li>userContent: 
 * <li>fb_userName: 
 * <li>fbPictureUrl: 
 * <li>title: 
 * <li>doohPlayedTimes: 
 * <li>rating: 
 * <li>genre: 
 * <li>contentGenre:
 * <li>mustPlay: 
 * </ul>
 * For example, <br>
 * [{_id: '51d837f6830459c42d000023',
 * "userPhotoUrl":["/contents/user_project/greeting-50c99d81064d2b841200000a-20130227T033827565Z/user_data/_cdv_photo_012.jpg"],
 * "ugcCensorNo":1,
 * "fb_userName":"No User",
 * "fbPictureUrl":"http://profile.ak.fbcdn.net/hprofile-ak-frc1/371959_100004619173955_82185728_q.jpg",
 * "doohPlayedTimes":0,
 * "rating":"d",
 * "genre":"miix",
 * "contentGenre":"miit_it"
 * "mustPlay":true}] <br>
 *
 * @name GET /miix_admin/user_content_items
 */
app.get('/miix_admin/user_content_items', routes.censor_handler.getUGCList_get_cb);

/**
 * Update the UGC field to Feltmeng DB<br>
 * <h5>Path Parameters</h5>
 * <ul>
 * <li>ugcId: UGC ID (_id with hexstring)
 * </ul>
 * <h5>Query Parameters</h5>
 * None
 * <h5>Request body</h5>
 * <ul>
 * <li>vjson: The json that you want to update  UGC field.
 * </ul>
 * </ul>
 * For example, <br>
 * [{ rating: 'a' }] <br>
 * <h5>Response body</h5>
 * A message of status :
 * <ul>
 * <li>err: error message if any error happens
 * <li>success: success
 * </ul>
 *
 * @name PUT /miix_admin/user_content_attribute/:ugcId
 */
app.put('/miix_admin/user_content_attribute', routes.censor_handler.setUGCAttribute_get_cb);//TODO::ugcId
//app.put('/miix_admin/user_content_attribute/:ugcId', routes.censor_handler.setUGCAttribute_get_cb);

/**
 * New a timeslots for dooh<br>
 * <h5>Path Parameters</h5>
 * <ul>
 * <li>doohId: Dooh ID (ex:'taipeiarena')
 * </ul>
 * <h5>Query Parameters</h5>
 * <ul>
 * <li>intervalOfSelectingUGC: An object specifying the starting and ending of of the time interval for scheduleMgr to select the applied UGC items.
 * <li>intervalOfPlanningDoohProgrames: An object specifying the starting and ending of of the time interval which the generated schedule covers.
 * <li>programSequence: An array of strings showing the sequence of program content genres.
 * </ul>
 * <h5>Request body</h5>
 * None
 * <h5>Response body</h5>
 * The callback function called when the result program list is created :
 *     <ul>
 *     <li>err: error message if any error happens
 *     <li>result: object containing the following information:
 *         <ul>
 *         <li>numberOfProgramTimeSlots: number of program time slots created. 
 *         <li>sessionId: id indicating this session of creating program time slots (This will be used when   
 *         calling scheduleMgr.removeUgcfromProgramAndAutoSetNewOne()
 *         </ul>
 *         For example, <br>
 *         { numberOfProgramTimeSlots: 33, sessionId: '1367596800000-1367683140000-1373332978201' }     
 *     </ul>
 *
 * @name POST /miix_admin/doohs/:doohId/timeslots
 */
app.post('/miix_admin/doohs/:doohId/timeslots', routes.censor_handler.createTimeslots_get_cb);
/**
 * Get the dooh timeslot<br>
 * <h5>Path Parameters</h5>
 * <ul>
 * <li>doohId: Dooh ID (ex:'taipeiarena')
 * </ul>
 * <h5>Query Parameters</h5>
 * <ul>
 * <li>skip: The number decide that first query.
 * <li>limit: The number decide that limit of query.
 * <li>token: authorization.
 * <li>condition: The json decide that query codition.
 * </ul>
 * <h5>Request body</h5>
 * None
 * <h5>Response body</h5>
 * An array of objects containing the following members:
 * <ul>
 * <li>_id: Program timeslot ID with 24 byte hex string.
 * <li>timeSlot: An object specifying the starting and ending time of program's time slot.
 * <li>ugc_id: UGC ID with 24 byte hex string.
 * <li>userPhotoUrl: 
 * <li>ugcCensorNo:
 * <li>userContent: 
 * <li>fb_userName: 
 * <li>fbPictureUrl:  
 * <li>rating: 
 * <li>genre: 
 * <li>contentGenre:
 * </ul>
 * For example, <br>
 * [{_id: '51d837f6830459c42d000023',
 * "timeSlot":[start:1371861000000, end :1371862000000],
 * "ugc_id":'51d837f6830459c42d000023',
 * "userPhotoUrl":["/contents/user_project/greeting-50c99d81064d2b841200000a-20130227T033827565Z/user_data/_cdv_photo_012.jpg"],
 * "ugcCensorNo":1,
 * "fb_userName":"No User",
 * "fbPictureUrl":"http://profile.ak.fbcdn.net/hprofile-ak-frc1/371959_100004619173955_82185728_q.jpg",
 * "rating":"d",
 * "genre":"miix"}
 * "contentGenre":"miix_it"] <br>
 *
 * @name GET /miix_admin/doohs/:doohId/timeslots
 */
app.get('/miix_admin/doohs/:doohId/timeslots', routes.censor_handler.gettimeslots_get_cb);

/**
 * Update the ProgramTimeSlot field to Feltmeng DB<br>
 * <h5>Path Parameters</h5>
 * <ul>
 * <li>timeslotId: ProgramTimeSlot ID (_id with hexstring)
 * <li>doohId: Dooh ID (ex:'taipeiarena')
 * </ul>
 * <h5>Query Parameters</h5>
 * None
 * <h5>Request body</h5>
 * <ul>
 * <li>sessionId: The id indicating the session of creating program time slot.
 * <li>programTimeSlot: The ID of the program time slot item.
 * </ul>
 * <h5>Response body</h5>
 * an object of newly Selected Ugc or err message:
 * <ul>
 * <li>err: error message if any error happens
 * <li>newlySelectedUgc:  the id of newly selected UGC 
 * </ul>
 *
 * @name PUT /miix_admin/doohs/:doohId/timeslots/:timeslotId
 */
app.put('/miix_admin/doohs/:doohId/timeslots/:timeslotId', routes.censor_handler.timeslots_get_cb);

//TODO: pushProgramsTo3rdPartyContentMgr RESTful
/**
 *  Push programs (of a specific session) to the 3rd-party content manager.<br>
 * <h5>Path Parameters</h5>
 * <ul>
 * <li>doohId: Dooh ID (ex:'taipeiarena')
 * </ul>
 * <h5>Query Parameters</h5>
 * None
 * <h5>Request body</h5>
 * <ul>
 * <li>sessionId: The id indicating the session of creating program time slot.
 * </ul>
 * <h5>Response body</h5>
 * if successful, err returns null; if failed, err returns the error message.
 * <ul>
 * <li>err: error message if any error happens
 * <li>result: null 
 * </ul>
 *
 * @name PUT /miix_admin/doohs/:doohId/ProgramsTo3rdPartyContent
 */
app.put('/miix_admin/doohs/:doohId/ProgramsTo3rdPartyContentMgr/:sessionId', routes.censor_handler.pushProgramsTo3rdPartyContentMgr_get_cb);

// Internal

app.get('/internal/oauth2callback', routes.YoutubeOAuth2_cb );
app.get('/internal/commands', routes.command_get_cb);
app.post('/internal/command_responses', routes.commandResponse_post_cb); 

app.post('/internal/dooh/movie_playing_state', routes.dooh_handler.doohMoviePlayingState_post_cb);  //TODO: PUT /internal/dooh/movie_playing_state is better
app.post('/internal/dooh/dooh_periodic_data', routes.dooh_handler.importPeriodicData);  //TODO: POST /internal/adapter/schedule_periodic_data is better
app.get('/internal/dooh/dooh_current_video', routes.dooh_handler.dooh_current_UGC);  

app.post('/internal/story_cam_controller/available_story_movie', routes.storyCamControllerHandler.availableStoryMovie_post_cb);


// == DEPRECATED ==, but used by MiixCard v1.2 or earlier versions
//movie gen
app.get('/get_template_list', routes.getTemplateList_cb ); //not used in MiixCard v1.2
app.get('/get_template_raw_data', routes.getTemplateRawData_cb ); //not used in MiixCard v1.2
app.get('/get_template_description', routes.getTemplateDescription_cb ); //not used in MiixCard v1.2
app.get('/get_template_customizable_object_list', routes.getTemplateCustomizableObjectList_cb ); //not used in MiixCard v1.2
//app.post('/upload_user_data', routes.uploadUserData_cb ); //not used in MiixCard v1.2

app.get('/oauth2callback', routes.YoutubeOAuth2_cb );

app.post('/upload', routes.upload_cb );
app.post('/upload_user_data_info',routes.uploadUserDataInfo_cb);

//admin
app.get('/admin', routes.admin.get_cb); 
app.get('/admin/login', routes.admin.login_get_cb);
app.get('/admin/logout', routes.admin.logout_get_cb);
app.get('/admin/member_list', routes.admin.memberList_get_cb);
app.get('/admin/miix_play_list', routes.admin.miixPlayList_get_cb);
app.get('/admin/story_play_list', routes.admin.storyPlayList_get_cb);
app.get('/admin/list_size', routes.admin.listSize_get_cb);


//internal
app.post('/internal/dooh_periodic_data', routes.dooh_handler.importPeriodicData);
app.get('/internal/dooh_current_video', routes.dooh_handler.dooh_current_UGC);
app.post('/internal/dooh_timeslot_rawdata', routes.timeDataGet);


//FM.API
app.get('/api/eventsOfWaiting', routes.api.eventsOfWaiting); //not used in MiixCard v1.0 or later
app.get('/api/schedule', routes.api.eventsOfPeriod); //not used in MiixCard v1.0 or later
app.get('/api/userProfile', routes.api.userProfile); //not used in MiixCard v1.0 or later
app.get('/api/profile', routes.api.profile); //not used in MiixCard v1.0 or later
app.get('/api/fbGetComment', routes.api.fbGetCommentReq); 
app.get('/api/fbGetThumbnail', routes.api.fbGetThumbnail);
app.get('/api/newVideoList', routes.api.newUGCList);
app.get('/api/newStreetVideoList', routes.api.newStreetUGCList); //not used in MiixCard v1.2
app.get('/api/codeGeneration', routes.api.codeGenerate);

//member.js
app.get('/api/member.isFBTokenValid', routes.member.isFBTokenValid);

app.post('/api/signin', routes.api.signin);  //not used in MiixCard v1.0 or later, but worse to be kept for Miix web client
app.post('/api/signup', routes.api.signup);  //not used in MiixCard v1.0 or later, but worse to be kept for Miix web client
app.post('/api/addEvent', routes.api.addEvent); //not used in MiixCard v1.0 or later
app.post('/api/reject', routes.api.reject); //not used in MiixCard v1.0 or later
app.post('/api/prove', routes.api.prove); //not used in MiixCard v1.0 or later
app.post('/api/signupwithFB', routes.api.signupwithFB);
app.post('/api/deviceToken', routes.api.deviceToken);
app.post('/api/submitAVideo', routes.api.submitAUGC);
app.post('/api/submitDooh', routes.api.submitDooh);
app.post('/api/codeVerification', routes.api.codeVerify);

app.del('/', routes.api.signout); //not used in MiixCard v1.0 or later, but worse to be kept for Miix web client



http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});




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
/*
//test
var scheduleMgr = require('./schedule_mgr.js');
setTimeout(function(){
    
    scheduleMgr.createProgramList("TP_dom", 
        {start:(new Date("2013/5/4 0:00")).getTime(), end:(new Date("2013/5/4 23:59")).getTime()}, 
        {start:(new Date("2013/5/5 7:00")).getTime(), end:(new Date("2013/5/5 23:00")).getTime()}, 
        ["miix", "check_in", "check_in", "mood", "cultural_and_creative" ], function(err, result){
            console.log("err=%s result=", err);
            console.dir(result);
            scheduleMgr.getProgramList("TP_dom",{start:(new Date("2013/5/5 7:00")).getTime(), end:(new Date("2013/5/5 23:00")).getTime()}, null, 30, function(err2, result2){
                console.log('result=');
                console.dir(result2);
            });
    });
    
    scheduleMgr.setUgcToProgram( "51da8db6fdf3b7e009000003", 426, function(err, result){
        console.log('result=');
        console.dir(result);
        console.log("err=%s", err);
    });
    
    scheduleMgr.removeUgcfromProgramAndAutoSetNewOne('1367596800000-1367683140000-1373357471568', '51dbc59f27c747c80b000003', function(err){
        console.log('err=%s',err);
    });
   
},3000);

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
