//GZ  
var routsMovieGen = require('./movie_generation.js'); 
exports.getTemplateList_cb = routsMovieGen.getTemplateList_cb;
exports.getTemplateRawData_cb = routsMovieGen.getTemplateRawData_cb;
exports.getTemplateDescription_cb = routsMovieGen.getTemplateDescription_cb;
exports.getTemplateCustomizableObjectList_cb = routsMovieGen.getTemplateCustomizableObjectList_cb;
exports.uploadUserData_cb = routsMovieGen.uploadUserData_cb;

var youtube = require('./youtube.js');
exports.YoutubeOAuth2_cb = youtube.YoutubeOAuth2_cb;

var upload = require('./_upload.js');
exports.upload_cb = upload.upload_cb;

//GL
var memberDB = require("../member.js"),
    scheduleDB = require("../schedule.js"),
    videoDB = require("../video.js"),
    userStore = {};
    
    //$ = require('jQuery'),
    //jsdom = require('jsdom').jsdom;
    


exports.signin = function (req, res, next) {
    /*
     *  Once member sign-in, we should save profile in session to be used in same session.
     */
    if(req.body && req.body.member){
        var member = req.body.member,
            oid = null;

        memberDB.isValid(member.memberID, function(err, result){
            if(err) console.log(memberID+" is invalid " + err);
            if(result && member.password === result["password"]){
                oid = result["_id"];
                req.session.user = {
                    name: member.memberID,
                    pwd: member.password,
                    userId: oid 
                };             
                console.log(member.memberID + " Log-In! with userId " + oid.toHexString());
            }
            next();
        });
    }else{
        next();
    }
};

exports.signout = function (req, res, next) {
    console.log(req.session.user.name + " Log-Out!");
    delete req.session.user;
    next();
};

exports.signup = function(req, res, next){
    console.log("Get POST SignUp Req: " + JSON.stringify(req.body));
    
    if(req.body && req.body.member){
        var member = req.body.member,
            oid = null;
        console.log(JSON.stringify(member));
        memberDB.addMember(member, function(err, result){
            console.log("with userId " + result["_id"]);
            if(result){
                oid = result["_id"];
                req.session.user = {
                    name: member.memberID,
                    pwd: member.password,
                    userId: oid};
                 
				next();
                /*
				var vjson1 = {  "title":"Darth vader funny commercial",
                                "ownerId": oid,
                                "url": {"youtube":"http://www.youtube.com/embed/YRQyS_8sShw"},
                                "projectId": "8608"};
                
                var vjson2 = {  "title":"36 Story",
                                "ownerId": oid,
                                "url": {"youtube":"http://www.youtube.com/embed/YsvYa77EySg"},
                                "projectId": "5376"};
                
                videoDB.addVideo(vjson1, function(err, vdoc){
                    videoDB.addVideo(vjson2, function(err, vdoc){
                        next();
                    });
                });
				*/
				
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
                console.log(userStore);
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
exports.addVideo = function(req, res, next){
    var ownerId = req.session.user.userId,
        url = {"youtube":"http://www.youtube.com/embed/SvkQ3iSXyMA"},
        projectId = "2711";
        
    var vjson = {"ownerId": ownerId,
                 "url": url,
                 "projectId":projectId};
    //console.log("video " + JSON.stringify(vjson));
    videoDB.addVideo(vjson, function(err, vdoc){
        next();
    });
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
    week = [];
    if(req.body && req.body.event.time){
        var event = req.body.event;
        var yearday = event.date,   
            time = event.time, 
            year = parseInt(yearday.substring(0, 4), 10),
            mon = parseInt(yearday.substring(5, 7), 10),
            date = parseInt(yearday.substring(8), 10),
            hr = parseInt(time.substring(0, 2), 10),
            min = parseInt(time.substring(2), 10);
        //console.log("Select " + event.idx);
        var idx = parseInt(event.idx, 10);
            
        console.log("Year "+year+" Mon "+mon+" Date "+date+" Hr "+hr+ " Min "+min);
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
                    "location": "小巨蛋"
                  };
                  
        console.log("addEvent: " + start.toLocaleString()+ " to " + end.toLocaleString());
		
		//GZ
		//send to DOOH for play
		var doohControl = require("../dooh_control.js");
		var doohURL = '192.168.5.109';  //TODO: query from doohDB
		var movieProjectID = videoWorks[idx].projectId;
		doohControl.sendPlayRequest(doohURL, movieProjectID, start );
		console.log('Movie %s is requested to send to DOOH %s!', movieProjectID, doohURL );

 
        scheduleDB.reserve(evt, function(err, result){
            
            next();
        });
        
    }else{
        console.log("\n List Events....\n");
        next();
    }
};

var videoWorks = null,
    week = [];

exports.event = function(req, res, next){
    var range = null;
    var now = new Date();
    var start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0);
    var end = new Date(now.getFullYear(), now.getMonth(), now.getDate()+7, 0, 0);
    range = { "start": start.getTime(), "end": end.getTime() };
    
    scheduleDB.listOfReservated(range, function(err, result){
        if(err) throw err;
        if(result){
            console.log("from " +start.getTime()+ " to " + end.getTime() + " \nevents: " + result);
            eventAdapter(result);
            next();
        }
    });
};



exports.profile = function(req, res, next){
    if(req.session.user){
        videoDB.getVideoListById(req.session.user.userId, function(err, result){
            videoWorks = result;
            console.log("videoWorks: " + videoWorks);
            next();
        });
        
    }else{
        next();
    }
};


var eventAdapter = function(events){
    for( var i in events ){
        var st = new Date(events[i].start);
        events[i].time = st.toLocaleString();
        week.push(events[i]);
    }
};



exports.schedule = function(req, res){
    res.render( 'schedule', { 
                                title: "節目表",
                                timeSelect: "時段",
                                previewLb: "預覽",
                                locationLb: "地點",
                                week: week
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


