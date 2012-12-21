/*
 *  Ajax APIs
 */
// device_toekn = f822bb371e2d328d5a0f7ba1094269154f69027ac5ce4d4d04bd470cbd8001f1

var memberDB = require("../member.js"),
    scheduleDB = require("../schedule.js"),
    videoDB = require("../video.js");


var ObjectID = require('mongodb').ObjectID;

var DEBUG = true,
    FM_LOG = (DEBUG) ? function(str){ console.log( typeof(str)==='string' ? str : JSON.stringify(str) ); } : function(str){} ;
    
var FM = { api: {} };

FM.api.reply = [];  // Queue Res callback according to sessionID.


FM.api._pushErrorCallback = function(err, notification){
	FM_LOG("[_pushErrorCallback] ");
	if(err)
		FM_LOG("[error] " + JSON.stringify(err) );
	if(notification)
		FM_LOG("[notification] "+ JSON.stringify(notification) );
};

FM.api._pushNotification = function( device_token ){
	// Apple Push Notification Service.	
	var apns = require('apn');
	var options = {
			cert: './apns-prod/apns-prod-cert.pem',  			/* Certificate file path */
			certData: null,                   			/* String or Buffer containing certificate data, if supplied uses this instead of cert file path */
			key:  './apns-prod/apns-prod-key-noenc.pem',		/* Key file path */
			keyData: null,                    			/* String or Buffer containing key data, as certData */
			passphrase: null,                 			/* A passphrase for the Key file */
			ca: null,                         			/* String or Buffer of CA data to use for the TLS connection */
			gateway: 'gateway.push.apple.com',			/* gateway address 'Sand-box' - gateway.sandbox.push.apple.com */
			port: 2195,                   				/* gateway port */
			enhanced: true,               				/* enable enhanced format */
			errorCallback: FM.api._pushErrorCallback,	/* Callback when error occurs function(err,notification) */
			cacheLength: 100              				/* Number of notifications to cache for error purposes */
	};

	
	var apnsConnection = new apns.Connection(options);
	var device = new apns.Device(device_token);
	var note = new apns.Notification();
	note.expiry = Math.floor(Date.now() / 1000) + 3600*24; // Expires 1 day from now.
	note.badge = 1;
	note.sound = "ping.aiff";
	note.alert = "You have a new video!";
	note.payload = {'messageFrom': 'Miix.tv'};
	note.device = device;
	
	FM_LOG("PUSH to Device[" + device_token +"]");
	apnsConnection.sendNotification(note);

};


// GET
FM.api.fbStatus = function(req, res){
    
    var sid = req.sessionID;
    FM_LOG("\n[Get LongPolling] sessionID: " + sid);
    FM_LOG("Session: " + JSON.stringify(req.session) );
    var date = new Date();
    
    if(date - req.socket._idleStart.getTime() > 59999){
        res.send("Keep Polling");
    }
    
    FM.api.reply[sid] = res;
};

// Inter
FM.api._fbStatusAck = function(response){
    FM_LOG("\n[fbStatusAck]:");
    
    var sid = response.data.sessionID;
    if(response.data._id){
        response.data._id = response.data._id.toHexString();
    }
    FM.api.reply[sid].send(response);
        
    delete FM.api.reply[sid];
};

// Inter - TODO
FM.api._fbExtendToken = function(accessToken, callback){

    FM_LOG("\n[_fbExtendToken]: ");
    
    var https = require('https');
    var path = "/oauth/access_token?grant_type=fb_exchange_token"
        + "&client_id=116813818475773"
        + "&client_secret=b8f94311a712b98531b292165884124a"
        + "&fb_exchange_token=" + accessToken
        + "&scope=read_stream,publish_stream";
        
    var host = "graph.facebook.com",
        urlOpts = {
            host: host,
            port: 443,
            path: path,
            method: 'POST'
        },
        req = https.request(urlOpts, function(res){
            res.setEncoding('utf8');
            res.on('data', function(result){
            
                if(typeof(result) != 'string'){
                    FM_LOG("Error: " + result.error.message);
                    
                }else{
                    FM_LOG("\nGot longer lived token: ");
                    FM_LOG(result);
                    
                    var longerToken = result.substring( result.indexOf("=")+1, result.indexOf("&expires") );
                    var longerExpiresIn = parseInt(result.substring( result.lastIndexOf("=")+1 ), 10);
                    var now = new Date();
                    var data = { "data":{
                        "accessToken": longerToken,
                        "expiresIn": now.getTime() + longerExpiresIn * 1000
                    }};
                
                    callback(data);
                }
            });                  
        });
                
    req.on('error', function(e){
        FM_LOG("[Failed to Extend Token]: " + e.message );
    });
    
    req.end();
    
};


/* where = /PROFILE_ID/ or /OBJECT_ID/
             * what = 
             * {    "message": "",
             *      "picture": "",
             *         "link": "",
             *         "name": "",
             *      "caption": "",
             *  "description": "",
             *       "source": "",
             *        "place": "",
             *         "tags": "" };
             */

			 
			 
// Inter
FM.api._fbPostVideoThenAdd = function(vjson){
	
	/* Keep for testing in case.
	var vjson2 = {  "title":"A Awesome World",
                    "ownerId": {"_id": "509ba9395a5ce36006000001", "userID": "100004053532907"},
                    "url": {"youtube":"http://www.youtube.com/embed/oZmtwUAD1ds"},
                    "projectId": "rotate-anonymous-20121115T004014395Z"}; */
					
	var vjsonData = vjson;				
    var can_msg = "參加MiixCard活動初體驗！";
	var link = vjsonData.url.youtube;
	var oid = vjsonData.ownerId._id;
	var pid = vjsonData.projectId;
	
	memberDB.getFBAccessTokenById(oid, function(err, result){
    
        if(err) throw err;
        if(result){
            var userID = result.fb.userID;
			var userName = result.fb.userName;
            var accessToken = result.fb.auth.accessToken;
                path = "/" + userID + "/feed",
                query = "?" + "access_token=" + accessToken
                + "&message=" + userName + can_msg
                + "&link=" + link;
            path += query.replace(/\s/g, "+");
            
            FM_LOG("[POST req to FB with:]\n" + JSON.stringify(path) );
            //  Post on FB.
            FM.api._fbPost(path, function(response){     
                
                //  Get Object_id of Post Item on FB, then update db.
                if(response.error){
                    FM_LOG("[POST on FB:ERROR] " + response.error.message );
                    
                }else{
                    var fb_id = response.id;    // Using full_id to get detail info.  full_id = userID + item_id
                    FM_LOG("\n[Response after POST on FB:]\n" + JSON.stringify(response) ); 
                    //var fb_id = full_id.substring(full_id.lastIndexOf("_")+1);
                    var newdata = {"fb_id": fb_id};
					vjsonData.fb_id = fb_id;
					videoDB.updateOne({"projectId":pid}, vjsonData, {"upsert": true}, function(err, vdoc){
						if(err)
							FM_LOG(err);
						
						memberDB.getDeviceTokenById(oid, function(err, result){
							if(err) throw err;
							if(result.deviceToken){
								FM_LOG("deviceToken Array: " + JSON.stringify(result.deviceToken) );
								for( var devicePlatform in result.deviceToken){
									if(result.deviceToken[devicePlatform])
										FM.api._pushNotification(result.deviceToken[devicePlatform]);
								}
							}
						});
					});
                }
            });
        }
    });
}
// Inter
FM.api._fbPostVideo = function(projectID, content){
        
    videoDB.getValueByProject(projectID, "ownerId _id url.youtube", function(err, result){    
        if(result){
            var ownerId = result["ownerId"];
            var v_oid = result["_id"];
            var link = result["url"].youtube;
            
            memberDB.getFBAccessTokenById(ownerId, function(err, result){
    
                if(err) throw err;
                if(result){
                    var userID = result.fb.userID;
                    var accessToken = result.fb.auth.accessToken;
                        path = "/" + userID + "/feed",
                        query = "?" + "access_token=" + accessToken
                        + "&message=" + content.message
                        + "&link=" + link;
                    path += query.replace(/\s/g, "+");
                    
                    FM_LOG("[POST req to FB with:]\n" + JSON.stringify(path) );
                    //  Post on FB.
                    FM.api._fbPost(path, function(response){     
                        
                        //  Get Object_id of Post Item on FB, then update db.
                        if(response.error){
                            FM_LOG("[POST on FB:ERROR] " + response.error.message );
                            
                        }else{
                            var fb_id = response.id;    // Using full_id to get detail info.  full_id = userID + item_id
                            FM_LOG("\n[Response after POST on FB:]\n" + JSON.stringify(response) ); 
                            //var fb_id = full_id.substring(full_id.lastIndexOf("_")+1);
                            var newdata = {"fb_id": fb_id};
                            videoDB.update(v_oid, newdata);
                        }
                    });
                }
            });
        }
    });
};


// POST
FM.api.fbPostCommentReq = function(req, res){
    FM_LOG("[api.fbPostCommentReq]");
    if(req.body && req.body.post){
    
        var path = post.path,
            token = post.token;
            
        var path = "/" + fb_oid + "/comments",
            data = "?" + "access_token=" + token;
        
        for(var key in post.data){
            data += "&" + key + "=" + post.data[key];
        }
        path += data;
        FM.api._fbPost( path, function(response){
        
            if(response.error){
                FM_LOG(error);
            }else{
                FM_LOG(response.id);
                res.send({"res":"Succeed"});
            }
        });
    }
};

// GET
FM.api.fbGetCommentReq = function(req, res){
    FM_LOG("[api.fbGetCommentReq]");
    if(req.query && req.query.fb_id && req.query.accessToken){
        FM_LOG(req.query);
        var fb_id = req.query.fb_id;
            accessToken = req.query.accessToken,
			projectId = req.query.projectId;
            
        var fields = "comments,likes";
        var path = "/" + fb_id 
            + "?access_token=" + accessToken 
            + "&fields=" + fields;
            
        FM.api._fbGet(path, function(response){
            if(response.error){
                FM_LOG(response.error.message);
                res.send(response.error);
            }else{
                res.send(response); // "comments" and "likes"
            }
        });
    }else{
        res.send({error: "fb_id, token are MUST-Have."});
    }
};

FM.api.fbGetThumbnail = function(req, res){
	FM_LOG("[api.fbGetThumbnail]");
	if(req.query && req.query.fb_id && req.query.accessToken && req.query.commenter){
		FM_LOG(req.query);
        var fb_id = req.query.fb_id,
			commenter = req.query.commenter,
            accessToken = req.query.accessToken;
			
        var fields = "picture";    
        var path = "/" + commenter 
            + "?access_token=" + accessToken
			+ "&fields=" + fields; 
            
        FM.api._fbGet(path, function(response){
			FM_LOG("[Thumbnail] ");
			FM_LOG(response);
            if(response.error){
                FM_LOG(response.error.message);
                res.send(response.error);
            }else{
				response.id = fb_id;
                res.send(response); // "thumbnail of commenter"
            }
        });
	}else{
        res.send({error: "fb_id, token and commenter are MUST-Have."});
    }
}

// Inter
FM.api._fbPost = function( path, cb){

    var https = require('https'),
        host = "graph.facebook.com",
        urlOpts = {
            host: host,
            port: 443,
            path: path,
            method: 'POST'
        };
    var req = https.request(urlOpts, function(res){
            res.setEncoding('utf8');
            res.on('data', function(chunk){
                cb(JSON.parse(chunk));
            });                  
        });
                
    req.on('error', function(e){
        FM_LOG("[Error from FB after POST]: " + e.message );
    });
    
    req.end();
};

// Inter
FM.api._fbGet = function( path, cb){

    var host = "graph.facebook.com",
        https = require('https'),
        urlOpts = {
            host: host,
            port: 443,
            path: path,
            method: 'GET'
        };
        
    var req = https.request(urlOpts, function(res){
            res.setEncoding('utf8');
            res.on('data', function(chunk){
				FM_LOG("[fbGet] \n" + chunk);
                cb(JSON.parse(chunk));
            });                  
        });
                
    req.on('error', function(e){
        FM_LOG("[Error from FB after GET]: " + e.message );
    });
    
    req.end();

};

FM.api._fbGetHttp = function( path, cb){

    var host = "graph.facebook.com",
        http = require('http'),
        urlOpts = {
            host: host,
            port: 80,
            path: path,
            method: 'GET'
        };
        
    var req = http.request(urlOpts, function(res){
            res.setEncoding('utf8');
            res.on('data', function(chunk){
				FM_LOG("[fbGet] \n" + chunk);
                cb(JSON.parse(chunk));
            });                  
        });
                
    req.on('error', function(e){
        FM_LOG("[Error from FB after GET]: " + e.message );
    });
    
    req.end();

};

// POST
FM.api.deviceToken =  function(req, res){
	FM_LOG("[Receive deviceToken POST] ");
	
	if(req.body && req.body.user){
		var user = req.body.user;
		FM_LOG(user);
		FM_LOG("\n[Got Device_Token] devicePlatform: " + user.devicePlatform + "; dvc_token: " + user.deviceToken);
		
		var oid = ObjectID.createFromHexString(user._id);
		var deviceToken = {};
		deviceToken[user.devicePlatform] = user.deviceToken;
		
		var jsonStr = '{"deviceToken.' + user.devicePlatform +'":"'+ user.deviceToken + '"}';
		var json = JSON.parse(jsonStr);
		
		memberDB.updateMember( oid, json, function(err, result){
            if(err) FM_LOG(err);
            if(result) FM_LOG(result);
			res.send({"message": "Update Device Token!"});
        });
	}else{
		res.send({"message": "Failed!"});
	}
};


// POST
FM.api.signupwithFB = function(req, res){
    
    var sid = req.sessionID;
    FM_LOG("\n[signupwithFB] sessionID: " + sid);
    
    if(req.body && req.body.authResponse){
    
        FM_LOG("\n[Got FB_Token]: ");
        FM_LOG(req.body.authResponse);
        
        var authRes = req.body.authResponse;
        var userID = authRes.userID,
			userName = authRes.userName,
            accessToken = authRes.accessToken,
            expiresIn = authRes.expiresIn,
			device = authRes.device,
			devicePlatform = authRes.devicePlatform,
			dvc_Token = authRes.deviceToken,
            auth = {"accessToken": accessToken,
                    "expiresIn": expiresIn,
            },
            meta = {"userID": userID,
					"userName": userName,
                      "auth": auth
            },
            member = {"fb": meta};
            
			
        
        /* New FB User or Exsited User */
        memberDB.isFBValid( userID, function(err, result){
        
            if(err) throw err;      
            
            if(result){ //  fb user existed.
                FM_LOG("[signupwithFB] FB user[" + userID + "] Existed!");
                
                var oid = result._id;
				var deviceToken;
				if(dvc_Token){
					if(result.deviceToken){
						deviceToken = result.deviceToken;
					}else{
						deviceToken = {};
					}
					deviceToken[devicePlatform] = dvc_Token;
					member.deviceToken = deviceToken;
					
				}
				
                // if expire within 20days.
                if( parseInt(expiresIn) - Date.now() < 20*24*60*60*1000 ){
                    
                    FM.api._fbExtendToken(authRes.accessToken, function(response){
                    
                        if(response.data){
                            
                            member.fb.auth = response.data;
                            var data = response.data;
                            var newdata = result.fb;
                            newdata.auth = data;
                            
                            memberDB.updateMember( oid, { fb: newdata, deviceToken: deviceToken }, function(err, result){
                                if(err) FM_LOG(err);
                                if(result) FM_LOG(result);
                            });
                            
                            res.send( {"data":{"_id": oid.toHexString(), "accessToken": data.accessToken, "expiresIn": data.expiresIn  }, "message":"success"} );
                        }
                    });
                    
                }else{
					if(dvc_Token){
						memberDB.updateMember( oid, { "deviceToken": deviceToken }, function(err, result){
                            if(err) FM_LOG(err);
                            if(result) FM_LOG(result);
                        });
					}
                    //res.send({"message":"success"});
					res.send( {"data":{ "_id": oid.toHexString(), "accessToken": member.fb.auth.accessToken, "expiresIn": member.fb.auth.expiresIn}, 
								"message":"success"} );
                }
                
                /* ACK LongPolling from Client
                var ack = { "data":{"sessionID": sid, "accessToken": accessToken, "userID": userID, "_id": oid} };
                FM.api._fbStatusAck(ack);
                */
                
                
            }else{  //  New fb user signup.
                FM_LOG("[signupwithFB:] NEW FB User[" + userID + "] Signup!");
                
				if(dvc_Token){
					var deviceToken = {};
					deviceToken[devicePlatform] = dvc_Token;
					member.deviceToken= deviceToken;
				}
				
                FM.api._fbExtendToken(authRes.accessToken, function(response){
                    
                    if(response.data){
                        member.fb.auth = response.data;
                    }
                    
                    memberDB.addMember(member, function(err, result){
        
                        FM_LOG("with userId " + result["_id"]);
                        if(result){
                            FM_LOG("\n[addMember]:");
                            FM_LOG(result);
                            
                            oid = result["_id"];
                            /* ACK LongPolling from Client
                            var ack = { "data":{"sessionID": sid, "accessToken": accessToken, "userID": userID, "_id": oid} };
                            FM.api._fbStatusAck(ack);
                            */
                            
                            req.session.user = {
                                userID: member.fb.userID,
                                _id: oid,
                                accessToken: member.fb.auth.accessToken
                            };
                            
                            res.send( {"data":{ "_id": oid.toHexString(), "accessToken": member.fb.auth.accessToken, "expiresIn": member.fb.auth.expiresIn}, 
								"message":"success"} );
                        } //else{}
                    });
                });
            }
        });
        
    }else{
    
        /* ACK LongPolling - Facebook Authentication Failed!
        var ack = {"data": {"sessionID": sid, "message":req.body.fail} };
        FM.api._fbStatusAck(ack);
        */
    }
};           
            
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


// GET
FM.api.signout = function (req, res) {
    var username = req.session.user.name;
    console.log(username + " Log-Out!");
    delete req.session.user;
    res.redirect("/");
};

// POST
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

// POST
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
                    "location": "小巨蛋",
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


// POST
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

// POST
FM.api.prove = function(req, res){

    var evtid = req.body.event.oid;
    console.log("\nProve " + JSON.stringify(evtid) );
    scheduleDB.prove(evtid, function(err, result){
    
        if(err){
            res.send( {"error":err} );
        }else{
            res.send( {"Prove Event": result} );
        }
    });
};

// GET
FM.api.eventsOfWaiting = function(req, res){
    
    scheduleDB.listOfWaiting(function(err, result){
    
        if(err){
            res.send( {"error":err} );
        }else{
            res.send( {"waitingEvents": result} );
        }
    });
};

// GET
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


// GET
FM.api.profile = function(req, res){
    FM_LOG("[api.profile]: ");
    FM_LOG(req.query);
	
    if(req.query && req.query.userID){
    
        var userID = req.query.userID;
        
        videoDB.getVideoListByFB(userID, function(err, result){
        
            if(err) throw err;
            FM_LOG("[getVideoListByFB] " + JSON.stringify(result));
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

//	GET
FM.api.newVideoList = function(req, res){
	FM_LOG("[api.newVideoList]: ");
    FM_LOG(req.query);
	
    if(req.query && req.query.userID){
    
        var userID = req.query.userID;
		var after = new Date(parseInt(req.query.after));
		FM_LOG(">>>>>>>>>>>>>>>[AFTER]: " + after.toISOString());
        
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

/*
var vjson2 = {  "title":"A Awesome World",
                    "ownerId": {"_id": "509ba9395a5ce36006000001", "userID": "100004053532907"},
                    "url": {"youtube":"http://www.youtube.com/embed/oZmtwUAD1ds"},
                    "projectId": "rotate-anonymous-20121115T004014395Z"};*/

// POST
FM.api.submitAVideo = function(req, res){
	FM_LOG("[api.submitAVideo]");
	
	if(req.body && req.body.userID && req.body.pid && req.body._id){
		var _id = ObjectID.createFromHexString(req.body._id);
		var userID = req.body.userID;
		var pid = req.body.pid;
		FM_LOG("User[" + userID + "] submit a VideoMaking[" + pid +"]");
		var vjson = {"ownerId": {"_id": _id, "userID": userID},
                    "projectId": pid};
					
		videoDB.addVideo(vjson, function(err, result){
			if(err) throw err;
			if(result)
				res.send(result);
		});
		
	}else{
		res.send({"message": "_id, userID, pid MUST HAVE!"});
	}
};

// GET
FM.api.userProfile = function(req, res){
    
    if(req.query && req.query.user){
        var user = req.query.user;
        user._id = ObjectID.createFromHexString(user._id);  // cast String to ObjectID before using.
       
        videoDB.getVideoListById(user._id, function(err, result){
            if(err) throw err;        
            res.send(result);
        });
    }
};

// Inter
FM.api._test = function(){
   
   /*
	var oid = ObjectID.createFromHexString("50b58c7cef173af40e000001"); // Gance
    memberDB.getDeviceTokenById(oid, function(err, result){
		if(err) throw err;
		if(result){
			FM_LOG("deviceToken Array: " + JSON.stringify(result.deviceToken) );
			for( var device in result.deviceToken){
				FM.api._pushNotification(result.deviceToken[device]);
			}
		}
	});*/
    //FM.api._pushNotification("f822bb371e2d328d5a0f7ba1094269154f69027ac5ce4d4d04bd470cbd8001f1");
	var vjson2 = {  "title":"A Awesome World",
                    "url": {"youtube":"http://www.youtube.com/embed/oZmtwUAD1ds"},
                    "projectId": "miixcard-50b82149157d80e80d000002-20121206T080743992Z"};
	videoDB.updateOne({"projectId":"miixcard-50b82149157d80e80d000002-20121206T080743992Z"}, vjson2, function(err, vdoc){
		FM_LOG(vdoc);
	});
};

//FM.api._test();

module.exports = FM.api;