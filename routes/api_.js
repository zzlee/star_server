/*
 *  Ajax APIs
 */

var memberDB = require("../member.js"),
    scheduleDB = require("../schedule.js"),
    videoDB = require("../video.js");
    
var FM = {api:{}};

var mongodb = require('mongodb'),
            ObjectID = require('mongodb').ObjectID;

FM.api.signin = function (req, res) {
    /*
     *  Once member sign-in, we should save profile in session to be used in same session.
     */
    console.log("Get Sign In Req: " + JSON.stringify(req.body)); 
    if(req.body && req.body.member){
        var member = req.body.member,
            oid = null;

        memberDB.isValid(member.memberID, function(err, result){
            if(err) console.log(memberID + " is invalid " + err);
            if(result && member.password === result["password"]){
                oid = result["_id"];
                req.session.user = {
                    name: member.memberID,
                    pwd: member.password,
                    userId: oid 
                };             
                console.log(member.memberID + " Log-In! with userId " + oid.toHexString());
                
                FM.api.profile(req, res);
                
            }else{
                res.send({"isValid": "false"});
            }
        });
    }else{
        res.send(500, { error: "Wrong User/Password"});
    }
};



FM.api.signout = function (req, res) {
    var username = req.session.user.name;
    console.log(username + " Log-Out!");
    delete req.session.user;
    res.redirect("/");
};

FM.api.signup = function(req, res){
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
                        FM.api.profile(req, res);
                    });
                });
				*/
				FM.api.profile(req, res); //GZ
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

 
/*  No Necessary for API, Just for AE

FM.api.addVideo = function(req, res){
    
    var ownerId = req.session.user.userId,
        projectId = "2711";
        
    if(req.body && req.body.videoDoc){
        var vurl = req.body.link;
        var vjson = {
                        "ownerId": ownerId,
                        "url": vurl,
                        "projectId":projectId,
                        "title": "From Facebook"
                    };
                    
        videoDB.addVideo(vjson, function(err, vdoc){
            
        });
    }  
};*/

FM.api.addEvent = function(req, res){
    console.log("addEvent Req: " + JSON.stringify(req.body) );
    if(req.body.event){
    
        var event = req.body.event;
        /*var yearday = event.date,   
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
                    "location": "¤p¥¨³J",
                    "status": "waiting"
                  };
                  
        console.log("addEvent: " + start.toLocaleString()+ " to " + end.toLocaleString());*/
                 
        scheduleDB.reserve(event, function(err, result){
            if(err){ 
                res.send({"error": err});
            }else{
                res.send({"\nReserve Event": result});
            }
        });
        
    }else{
        console.log("\n List Events....\n");
        
    }
};



FM.api.reject = function(req, res){

    var evtid = req.body.event.oid;
    
    console.log("\nReject " + JSON.stringify(evtid) );
    
    scheduleDB.reject(evtid, function(err, result){
    
        if(err){
            res.send( {"error":err} );
        }else{
            res.send( {"Reject Event": result} );
        }
    });
};

FM.api.prove = function(req, res){

    var evtid = req.body.event.oid;
    console.log("\nProve " + JSON.stringify(evtid) );
	
	//GZ
	//send to DOOH for play
	var doohControl = require("../dooh_control.js");
	var doohURL = '192.168.5.101';  //TODO: query from doohDB
	var movieProjectID = req.body.event.projectID;
	var start = req.body.event.start;
	doohControl.sendPlayRequest(doohURL, movieProjectID, start );
	console.log('Movie %s is requested to send to DOOH %s!', movieProjectID, doohURL );
	
    scheduleDB.prove(evtid, function(err, result){
    
        if(err){
            res.send( {"error":err} );
        }else{
            res.send( {"Prove Event": result} );
        }
    });
	
	
};


FM.api.eventsOfWaiting = function(req, res){
    
    scheduleDB.listOfWaiting(function(err, result){
    
        if(err){
            res.send( {"error":err} );
        }else{
            res.send( {"waitingEvents": result} );
        }
    });
};


FM.api.eventsOfPeriod = function(req, res){
    
    if(req.body && req.body.period){
    
        var range = null,
            start = period.start,
            end = period.end;
        
        range = { "start": start.getTime(), "end": end.getTime() };
        
        scheduleDB.listOfReservated(range, function(err, result){
            if(err) throw err;
            if(result){
                console.log("from " +start.getTime()+ " to " + end.getTime() + " \nevents: " + result);
                res.send(result);
            }
        });
    }
};



FM.api.profile = function(req, res){
    //console.log("api.profile: " + JSON.stringify(req.session));
    if(req.session.user){
        videoDB.getVideoListById(req.session.user.userId, function(err, result){
		//videoDB.getVideoListById(req.session.user.name, function(err, result){  //GZ
        
            if(err) throw err;
            var data = {
                //"profile": {"_id": req.session.user.userId},
                "profile": {"_id": req.session.user.userId, "_userName": req.session.user.name},  //GZ
                "videoWorks": result
            };
            //console.log("profile: " + JSON.stringify(data));
            
            res.send(data);
        });
    }
};

FM.api.newVideoList = function(){
	FM_LOG("[api.newVideoList]: ");
    FM_LOG(req.query);
	
    if(req.query && req.query.userID){
    
        var userID = req.query.userID;
		var after = new Date(req.query.after);
		
        
        videoDB.getNewVideoListByFB(userID, after, function(err, result){
        
            if(err) throw err;
            FM_LOG("[getNewVideoListByFB] " + JSON.stringify(result));
            var data;
            if(result){
               data = {"videoWorks": result};
            }else{
                data = {"message": "No video"};
            }
            res.send(data);
        });
    }
};


FM.api.userProfile = function(req, res){
    
    if(req.body && req.body.member){
        var member = req.body.member.memberID,
            oid = null;

        memberDB.getObjectId(member, function(err, result){
            var oid = result["_id"];
       
            videoDB.getVideoListById(oid, function(err, result){
        
                if(err) throw err;
                //console.log("videoWorks: " + result);
                
                res.send(result);
            });
        });
    }
};




module.exports = FM.api;