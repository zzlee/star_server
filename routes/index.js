//GZ  
var movieTemplate = require('./movie_template.js'); 
exports.getTemplateList_cb = movieTemplate.getTemplateList_cb;
exports.getTemplateDescription_cb = movieTemplate.getTemplateDescription_cb;
exports.getTemplateCustomizableObjectList_cb = movieTemplate.getTemplateCustomizableObjectList_cb;

var youtube = require('./yt_oauth2_handler.js');
exports.YoutubeOAuth2_cb = youtube.YoutubeOAuth2_cb;

var userContentHandler = require('./user_content_handler.js');
exports.uploadUserContentFile_cb = userContentHandler.uploadUserContentFile_cb;
exports.uploadUserDataInfo_cb = userContentHandler.uploadUserDataInfo_cb;

var connectionHandler = require('./connection_handler.js');
exports.commandResponse_post_cb = connectionHandler.commandResponse_post_cb;
exports.command_get_cb = connectionHandler.command_get_cb;

var storyCamControllerHandler = require('./story_cam_controller_handler.js');
exports.storyCamControllerHandler = storyCamControllerHandler;

var authorizationHandler = require('./authorization_handler.js');
exports.authorizationHandler = authorizationHandler;

//JF
var dooh_handler = require('./dooh_handler.js');
exports.dooh_handler = dooh_handler;

//Kaiser
var censor_handler = require('./censor_handler.js');
exports.censor_handler = censor_handler;

var service_handler = require('./service_handler.js');
exports.service = service_handler;

//GL
var member_handler = require("../member.js"),
    scheduleDB = require("../schedule.js"),
    UGCDB = require("../ugc.js"),
    api = require("./api.js"),
    admin_handler = require("./admin_handler.js");
    
    //$ = require('jQuery'),
    //jsdom = require('jsdom').jsdom;
    
exports.api = api;
exports.admin = admin_handler;
exports.member = member_handler;

exports.signinFB = function(req, res){
	logger.log("\n[FM] [signin_fb] ");
    res.render('signinFB', { title: "導向Facebook認證頁！" });
};

exports.signin = function(req, res, next) {
    /*
     *  Once member sign-in, we should save profile in session to be used in same session.
     */
    if(req.body && req.body.member){
        var member = req.body.member,
            oid = null;

        member_handler.isValid(member.memberID, function(err, result){
            if(err) logger.log(memberID+" is invalid " + err);
            if(result && member.password === result["password"]){
                oid = result["_id"];
                req.session.user = {
                    name: member.memberID,
                    pwd: member.password,
                    userId: oid 
                };
                logger.log(member.memberID + " Log-In! with userId " + oid.toHexString());
            }
            next();
        });
    }else{
        next();
    }
};



exports.signout = function (req, res, next) {
    logger.log(req.session.user.name + " Log-Out!");
    delete req.session.user;
    next();
};

exports.signup = function(req, res, next){
    logger.log("Get POST SignUp Req: " + JSON.stringify(req.body));
    
    if(req.body && req.body.member){
        var member = req.body.member,
            oid = null;
        logger.log(JSON.stringify(member));
        member_handler.addMember(member, function(err, result){
            logger.log("with userId " + result["_id"]);
            if(result){
                oid = result["_id"];
                req.session.user = {
                    name: member.memberID,
                    pwd: member.password,
                    userId: oid};
                 
                var vjson1 = {  "title":"Darth vader funny commercial",
                                "ownerId": oid,
                                "url": {"youtube":"http://www.youtube.com/embed/YRQyS_8sShw"},
                                "projectId": "8608"};
                
                var vjson2 = {  "title":"36 Story",
                                "ownerId": oid,
                                "url": {"youtube":"http://www.youtube.com/embed/YsvYa77EySg"},
                                "projectId": "5376"};
                
                UGCDB.addUGC(vjson1, function(err, vdoc){
                    UGCDB.addUGC(vjson2, function(err, vdoc){
                        next();
                    });
                });
            }
        });
        
        
        
        /*
        crypto.randomBytes(128, function(err, salt){
            if(err){ throw err; }
            salt = new Buffer(salt).toString("hex");
            crypto.pbkdf2(req.body.pass, salt, 7000, 256, function(err, hash){
                if(err){ throw err; }
                
                var jsonObj = {};
                DB.createDoc("Member", jsonObj);
                userStore[req.body.user] = { salt : salt,
                    hash : (new Buffer(hash).toString("hex")) };
                
                
                res.send("Thanks for registering " + req.body.user);
                logger.log(userStore);
            });
        });
        */
        
    }else{
        res.redirect("/");
    }
};
/*
 *  vjson = { "ownerId": ownerId,
 *            "url": {"youtube": "http://www.youtube.com/embed/l1zFS47cyzw"},
 *            "projectId": projectId };
 */
exports.addUGC = function(req, res, next){
    
    var ownerId = req.session.user.userId,
        projectId = "2711";
        
    if(req.body && req.body.member){
        var vurl = req.body.link;
        var vjson = {
                        "ownerId": ownerId,
                        "url": vurl,
                        "projectId":projectId,
                        "title": "From Facebook"
                    };
                    
        UGCDB.addUGC(vjson, function(err, vdoc){
            next();
        });
    }  
};

exports.addEvent = function(req, res, next){
    /*
     *  
            videoId: {type: ObjectID},
            ownerId: {type: ObjectID},
            start: {type: Number, min:0},   // 1325376000001 2012/01/01 08:00:00
            end: {type: Number, min:0},
            location: {type: ObjectID}
     */
    //evtList = [];
    if(req.body && req.body.event.time){
        var event = req.body.event;
        var yearday = event.date,   
            time = event.time, 
            year = parseInt(yearday.substring(0, 4), 10),
            mon = parseInt(yearday.substring(5, 7), 10),
            date = parseInt(yearday.substring(8), 10),
            hr = parseInt(time.substring(0, 2), 10),
            min = parseInt(time.substring(2), 10);
        //logger.log("Select " + event.idx);
        var idx = parseInt(event.idx, 10);
            
        logger.log("Year "+year+" Mon "+mon+" Date "+date+" Hr "+hr+ " Min "+min);
        var slot = new Date(year, mon-1, date, hr, min);    // month: 0~11
        var start = slot.getTime();
        //slot.setMinutes(min+5);
        var end = slot.getTime() + 5*60*1000;   //  Duration 5 mins
        var ownerId = req.session.user.userId;
        
        var evt = {
                    "videoId": videoWorks[idx]._id,
                    "projectId": videoWorks[idx].projectId,
                    "ownerId": ownerId,
                    "start": start,
                    "end": end,
                    "videoUrl": videoWorks[idx].url.youtube,
                    "location": "小巨蛋",
                    "status": "waiting"
                  };
                  
        logger.log("addEvent: " + start.toLocaleString()+ " to " + end.toLocaleString());
		
		/*
		//GZ
		//send to DOOH for play
		var doohControl = require("../dooh_control.js");
		var doohURL = '192.168.5.109';  //TODO: query from doohDB
		var movieProjectID = videoWorks[idx].projectId;
		doohControl.sendPlayRequest(doohURL, movieProjectID, start );
		logger.log('Movie %s is requested to send to DOOH %s!', movieProjectID, doohURL );
		*/
                  
        scheduleDB.reserve(evt, function(err, result){
            
            next();
        });
        
    }else{
        logger.log("\n List Events....\n");
        next();
    }
};

exports.censorship = function(req, res){

    scheduleDB.listOfWaiting(function(err, result){
    
        if(err) throw err;
        eventAdapter(result);
        logger.log("Event Waitling List: " + evtList);
        
        res.render( "censorship", { 
                                title: "審查表",
                                timeSelect: "時段",
                                previewLb: "預覽",
                                locationLb: "地點",
                                waitingList: evtList
                              }  );
    });
    
    
};

exports.reject = function(req, res){
    scheduleDB.reject(evtid, cb);
};

exports.proved = function(req, res){
    scheduleDB.proved(evtid, cb);
};

var videoWorks = null,
    evtList = [];

exports.event = function(req, res, next){

    var range = null;
    var now = new Date();
    var start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0);
    var end = new Date(now.getFullYear(), now.getMonth(), now.getDate()+7, 0, 0);
    range = { "start": start.getTime(), "end": end.getTime() };
    
    scheduleDB.listOfReservated(range, function(err, result){
        if(err) throw err;
        if(result){
            logger.log("from " +start.getTime()+ " to " + end.getTime() + " \nevents: " + result);
            eventAdapter(result);
            next();
        }
    });
};



exports.profile = function(req, res, next){
    if(req.session.user){
        UGCDB.getUGCListById(req.session.user.userId, function(err, result){
            videoWorks = result;
            logger.log("videoWorks: " + videoWorks);
            next();
        });
        
    }else{
        next();
    }
};


var eventAdapter = function(events){
    evtList = [];
    for( var i in events ){
        var st = new Date(events[i].start);
        events[i].time = st.toLocaleString();
        evtList.push(events[i]);
    }
};



exports.schedule = function(req, res){
    res.render( 'schedule', { 
                                title: "節目表",
                                timeSelect: "時段",
                                previewLb: "預覽",
                                locationLb: "地點",
                                week: evtList
                            } );
};


exports.index = function (req, res) {
    res.render('index', { title: "我是大明星",
                          signin: "會員登入",
                          signup: "新會員註冊",
                          reserve: "預約播放",
                          videoSelect: "影片",
                          dateSelect: "日期",
                          timeSelect: "時段",
                          usernameLb: "帳號",
                          passwordLb: "密碼",
                          fullnameLb: "全名",
                          emailLb: "Email",
                          mobileLb: "手機",
                          previewLb: "預覽",
                          locationLb: "播放地點",
                          user: req.session.user, 
                          videoWorks: videoWorks
                        } );
};

exports.login = function(req, res){
	res.render('login');
}; 



