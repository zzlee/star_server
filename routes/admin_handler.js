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
	
	var memberList = [];
	
	var memberListInfo = function(fb_id, fb_name, email, mp_number, miix_movie, dooh_play, movie_view, fb_like, fb_comment, fb_share, arr) {
		arr.push({ 
			fb: { userID: fb_id, userName: fb_name },
			//_id: _id,
			email: email, //Email
			mobilePhoneNumber: mp_number, //手機
			miixMovieCount: miix_movie, //已製作影片數
			doohPlayCount: dooh_play, //DOOH刊登次數
			movieViewedCount: movie_view, //影片觀看總次數
			fbLikeCount: fb_like, //FB讚總數
			fbCommentCount: fb_comment, //FB留言總數
			fbShareCount: fb_share
		});
	}

	var async = require('async');
	var next = 0;
	
	var setMemberList = function(data, set_cb){
		var toDo = function(err, result){
			console.log(result);
			if(next == req.query.limit-1) {
				memberListInfo(data[next].fb.userID, data[next].fb.userName, data[next].email, " ", result[0], result[1], " ", " ", " ", " ", memberList);
				set_cb(null, 'OK');
			}
			else {
				//memberListInfo(data[next].fb.userID, data[next].fb.userName, data[next].email, " ", result[0], result[1], result[2], " ", " ", " ", memberList);
				memberListInfo(data[next].fb.userID, data[next].fb.userName, data[next].email, " ", result[0], result[1], " ", " ", " ", " ", memberList);
				next += 1;
				setMemberList(data, set_cb);
			}
		}
		
		async.parallel([
			function(callback){
				video_mgr.getVideoCount(data[next]._id, 'miix', function(err, result){
					if(err) callback(err, null);
					else callback(null, result);
				});
			},
			function(callback){
				video_mgr.getVideoCount(data[next]._id, 'story', function(err, result){
					if(err) callback(err, null);
					else callback(null, result);
				});
			},/*
			function(callback){
				member_mgr.getTotalView(data[next]._id, function(err, result){
					if(err) callback(err, null);
					else callback(null, result);
				});
			},
			function(callback){
				member_mgr.getTotalCommentsLikesSharesOnFB(data[next].fb.userID, function(err, result){
					if(err) callback(err, null);
					else callback(null, result);
				});
			},*/
		], toDo);
	}	
	
    if ( req.query.limit && req.query.skip ) {
        FM_LOG("[admin.memberList_get_cb]");
        var cursor = member_mgr.listOfMembers( null, 'fb.userName fb.userID _id email mPhone video_count doohTimes triedDoohTimes', {sort: 'fb.userName',limit: req.query.limit, skip: req.query.skip}, function(err, result){
            if(err) logger.error('[member_mgr.listOfMemebers]', err);
            if(result){
                //FM_LOG(JSON.stringify(result));
				
                //res.render( 'form_member', {memberList: result} );

                //console.dir(result);
                //res.render( 'form_member', {memberList: result} );
                var testArray =
                [ { fb: { userID: '100001295751468', userName: 'CC Zhu' },
                    //_id: '50d595115241302349000005',
                    email: 'ccd@feltmeng.com', //Email
                    mobilePhoneNumber: '09282340003', //手機
                    miixMovieCount: 5, //已製作影片數
                    doohPlayCount: 20, //DOOH刊登次數
                    movieViewedCount: 200, //影片觀看總次數
                    fbLikeCount: 235, //FB讚總數
                    fbCommentCount: 203, //FB留言總數
                    fbShareCount: 35  } //FB分享總數  
                    ];
                    
                //res.render( 'table_member', {'memberList': testArray} );
				
				setMemberList(result, function(err, docs){
					if(err) console.log(err);
					else res.render( 'table_member', {'memberList': memberList} );
				});

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