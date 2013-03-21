var fs = require('fs');
var path = require('path');
var workingPath = process.env.STAR_SERVER_PROJECT;

var admin_mgr = require("../admin.js"),
    member_mgr = require("../member.js"),
    schedule_mgr = require("../schedule.js"),
    video_mgr = require("../video.js");

    
var ObjectID = require('mongodb').ObjectID;

var DEBUG = true,
    FM_LOG = (DEBUG) ? function(str){ logger.info( typeof(str)==='string' ? str : JSON.stringify(str) ); } : function(str){} ;
    
var FM = { admin: {} };


FM.admin.get_cb = function(req, res){
    /* TODO - Using RegularExpress/Command to parse every request, then pass req to corresponding function.
       switch(req.path){
        case 'api':
            FM.admin.api();
            break;
       }
    */
    FM_LOG("[admin.get_cb]");
    //res.render('login');
    var loginHtml = path.join(workingPath, 'public/admin_login.html');
    var mainAdminPageHtml = path.join(workingPath, 'public/admin_frame.html');
    
    if (!req.session.admin_user) {
        res.sendfile(loginHtml);
    }
    else{
        res.sendfile(mainAdminPageHtml);
    }
};


FM.admin.login_get_cb = function(req, res){
    
    //FM_LOG("[admin.login] " + JSON.stringify(req.query));
    if(req.query.id && req.query.password){
    
        admin_mgr.isValid(req.query, function(err, result){
            if(err) logger.error("[admin.login_get_cb] ", err);
            if(result){
                FM_LOG("[Login Success!]");
                req.session.admin_user = {
                    oid: result._id,
                    id: req.query.id
                };
                
                res.send(200);
                
                /*
                member_mgr.listOfMembers( null, 'fb.userName fb.userID email mPhone video_count doohTimes triedDoohTimes', {sort: 'fb.userName'}, function(err, result2){
                    if(err) logger.error('[member_mgr.listOfMemebers]', err);
                    if(result2){
                        //FM_LOG(JSON.stringify(result));
                        //res.render( 'frame', {memberList: result} );
                        next();
                    }else{
                        // TODO
                        //res.render( 'frame', {memberList: result} );
                    }
                });
                */
                
            }else{
                res.send({message: "Wrong ID/PASSWORD Match!"});
            }
        });
        
    }else{
        res.send(403, {error: "fail"});
    }
};

FM.admin.logout_get_cb = function(req, res){
    delete req.session.admin_user;
    res.send(200);
};

FM.admin.memberList_get_cb = function(req, res){

    //TODO: need to implement
	
	var videoInfo = function(data, cb){
		var async = require('async');
		var i = 0, next = 0;
		
		var async_cb = function(err, result){
			if(err) feedback(err, null);
			else if(req.query.limit > next) {
				i++;
				next++;
				async_toDo(data[i]);
			}
			else feedback(null, 'OK');
		}
		
		var async_toDo = function(data[i]){
			async.parallel([
				function(callback){
					for(var i=0; i<data.length; i++){
						member_mgr.getVideoCount(data._id, 'miix', function(err, result){
							data.video_count = result;
						});
					}
				},
				
				function(callback){
					for(var i=0; i<data.length; i++){
						member_mgr.getVideoCount(data._id, 'story', function(err, result){
							data.doohTimes = result;
						});
					}
				}
			], async_cb);
		}
	}
    
    if ( req.query.limit && req.query.skip ) {
        FM_LOG("[admin.memberList_get_cb]");
        var cursor = member_mgr.listOfMembers( null, 'fb.userName fb.userID email mPhone video_count doohTimes triedDoohTimes', {sort: 'fb.userName',limit: req.query.limit, skip: req.query.skip}, function(err, result){
            if(err) logger.error('[member_mgr.listOfMemebers]', err);
            if(result){
                //FM_LOG(JSON.stringify(result));
				
                res.render( 'form_member', {memberList: result} );
            }
        });
    }
    else{
        res.send(400, {error: "Parameters are correct"});
    }
};


FM.admin.miixPlayList_get_cb = function(req, res){
    
    //TODO: need to implement
    
    FM_LOG("[admin.miixPlayList_get_cb]");
    /*
    var result = [{
            asset: "../images/shopping/pic.jpg",
            videoId: "2711",
            timeslot: "2013-02-10-0800-1200",
            like: 3,
            comment: 4,
            user: {
                userName: "Felt",
                triedDoohTimes: 5,
                doohTimes: 2,
                video_count: 8
            }
        }, {
            asset: "../images/shopping/pic.jpg",
            videoId: "1650",
            timeslot: "2013-02-10-1000-1200",
            like: 5,
            comment: 9,
            user: {
                userName: "Meng",
                triedDoohTimes: 7,
                doohTimes: 1,
                video_count: 10
            }
        }];
    */
    video_mgr.getPlayList(function(err, result){
        if(err){
            logger.error("[video_mgr.getPlayList]error ", err);
            res.render('form_play', {playList: null});
            
        }else{
            FM_LOG("playlist:" + JSON.stringify(result));
            res.render('form_play', {playList: result});
        }
    });
};

FM.admin.storyPlayList_get_cb = function(req, res){
    //TODO: need to implement
    res.send(200);
};

/** Internal API */




module.exports = FM.admin;