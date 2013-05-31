var fs = require('fs');
var path = require('path');
var workingPath = process.cwd();

var admin_mgr = require("../admin.js"),
    member_mgr = require("../member.js"),
    schedule_mgr = require("../schedule.js"),
    video_mgr = require("../video.js"),
    admincache_mgr = require("../admin_cache.js");


var FMDB = require('../db.js'),
	videos = FMDB.getDocModel("video"),
	members = FMDB.getDocModel("member"),
    memberListInfos = FMDB.getDocModel("memberListInfo"),
	miix_content_mgr = require('../miix_content_mgr.js');

var DEBUG = true,
    FM_LOG = (DEBUG) ? function(str){ logger.info( typeof(str)==='string' ? str : JSON.stringify(str) ); } : function(str){} ;
    
var FM = { admin: {} };
var	timeoutcnl = 0;

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
	//kaiser test
	console.log("admin_handler_kaiser_start");
////    setInterval(admincachemgr,6000);
////    setInterval(console.log("timer Exec"),6000);
//    
////	var admincachemgr = admincache_mgr.getMemberListInfo(req, res);
//	admincache_mgr.getMemberListInfo(req, res);
	
//	admincache_mgr.getMemberListInfo(page, itemNumInPage, function(err, result){
//	    result
//	    
//	    
//	    
//	});
//	 admincache_mgr.getMemberListInfo(null);
	//
	
	
	var memberList = [];
	
	var memberListInfo = function(fb_id, fb_name, email, mp_number, miixMovieVideo_count, doohPlay_count, movieViewed_count, fbLike_count, fbComment_count, fbShare_count, arr) {
		arr.push({ 
			fb: { userID: fb_id, userName: fb_name },
			//_id: _id,
			email: email, //Email
			mobilePhoneNumber: mp_number, //手機
			miixMovieVideoCount: miixMovieVideo_count, //已製作影片數
			doohPlayCount: doohPlay_count, //DOOH刊登次數
			movieViewedCount: movieViewed_count, //影片觀看總次數
			fbLikeCount: fbLike_count, //FB讚總數
			fbCommentCount: fbComment_count, //FB留言總數
			fbShareCount: fbShare_count
		});
	}

	var async = require('async');
	var next = 0,
		limit;

	var setMemberList = function(data, set_cb){
//		var toDo = function(err, result){
            console.log("admin_handler_setMemberList"); 
			//console.dir(result);
			if(next == limit-1 || limit-1 < 0) {
//				memberListInfo(data[next].fb.userID, data[next].fb.userName, data[next].email, data[next].mPhone.number, result[0], result[1], result[2], result[3][0].totalLikes, result[3][0].totalComments, result[3][1].totalShares, memberList);
//				memberListInfo(data[next].fb.userID, data[next].fb.userName, data[next].email, data[next].mPhone.number, data[next].miixMovieVideo_count, data[next].doohPlay_count, data[next].movieViewed_count, data[next].fbLike_count, data[next].fbComment_count,data[next].fbShare_count, memberList);
                if(next > 0)
			    memberListInfo(data[next].fb.userID, data[next].fb.userName, data[next].email, data[next].mPhone.number, data[next].miixMovieVideo_count, data[next].doohPlay_count, data[next].movieViewed_count, data[next].fbLike_count, data[next].fbComment_count,data[next].fbShare_count, memberList);				
				next = 0;
				set_cb(null, 'OK');
			}
			else {
//				memberListInfo(data[next].fb.userID, data[next].fb.userName, data[next].email, data[next].mPhone.number, result[0], result[1], result[2], result[3][0].totalLikes, result[3][0].totalComments, result[3][1].totalShares, memberList);
//                memberListInfo(data[next].fb.userID, data[next].fb.userName, data[next].email, data[next].mPhone.number, data[next].miixMovieVideo_count, data[next].doohPlay_count, data[next].movieViewed_count, data[next].fbLike_count, data[next].fbComment_count,data[next].fbShare_count, memberList);				
                memberListInfo(data[next].fb.userID, data[next].fb.userName, data[next].email, data[next].mPhone.number, data[next].miixMovieVideo_count, data[next].doohPlay_count, data[next].movieViewed_count, data[next].fbLike_count, data[next].fbComment_count,data[next].fbShare_count, memberList);				
				next += 1;
                console.log("admin_handler_result_next:"+next); 
				setMemberList(data, set_cb);
//				console.log(data);
			}


//		}
					
		
//		async.parallel([
//			function(callback){
//				video_mgr.getVideoCount(data[next]._id, 'miix', function(err, result){
//					if(err) callback(err, null);
//					else callback(null, result);
//				});
//			},
//			function(callback){
//				video_mgr.getVideoCount(data[next]._id, 'miix_story', function(err, result){
//					if(err) callback(err, null);
//					else callback(null, result);
//				});
//			},
//			function(callback){
//				member_mgr.getTotalView(data[next]._id, function(err, result){
//					if(err) callback(err, null);
//					else callback(null, result);
//				});
//			},
//			function(callback){
//				member_mgr.getTotalCommentsLikesSharesOnFB(data[next].fb.userID, function(err, result){
//					if(err) callback(err, null);
//					else callback(null, result);
//				});
//			},
//		], toDo);
	}
	
    if ( req.query.limit && req.query.skip ) {
        FM_LOG("[admin.memberList_get_cb]");
        var cursor = FMDB.listOfdocModels( memberListInfos,null,'fb.userName fb.userID _id email mPhone miixMovieVideo_count doohPlay_count movieViewed_count fbLike_count fbComment_count fbShare_count', {sort:'fb.userName',limit: req.query.limit, skip: req.query.skip}, function(err, result){
            if(err) logger.error('[member_mgr.listOfMemebers]', err);
            if(result){
                //FM_LOG(JSON.stringify(result));
				
                //res.render( 'form_member', {memberList: result} );
                
                var testArray =
                [ { fb: { userID: '100001295751468', userName: 'CC Zhu' },
                    email: 'ccd@feltmeng.com', //Email
                    mobilePhoneNumber: '09282340003', //手機
                    miixMovieCount: 5, //已製作影片數
                    doohPlayCount: 20, //DOOH刊登次數
                    movieViewedCount: 200, //影片觀看總次數
                    fbLikeCount: 235, //FB讚總數
                    fbCommentCount: 203, //FB留言總數
                    fbShareCount: 35  } //FB分享總數  
                    ];
                    
//                res.render( 'table_member', {'memberList': testArray} );
//                console.log("admin_handler_result_skip="+req.query.skip); 
//                console.log("admin_handler_result_length="+result.length);
//                console.log("admin_handler_result_limit="+req.query.limit);
//                console.log("admin_handler_limit="+limit);
                //console.log(req.query.limit + "," + req.query.skip + "," + result.length + "," + limit);				
				if(req.query.skip < result.length)
					limit = req.query.limit;
				else 
					limit = result.length;
//				if(req.query.limit > result.length )
//                    limit = result.length;
				
				setMemberList(result, function(err, docs){
					if(err) console.log(err);
					else {

						res.render( 'table_member', {'memberList': memberList} );
					}
				});

            }
        });
    }
    else{
        res.send(400, {error: "Parameters are not correct"});
    }
};//end memberList_get_cb **********


FM.admin.miixPlayList_get_cb = function(req, res){
    
    //TODO: need to implement
	
	var miixPlayList = [];
	
	var miixPlayListInfo = function(photo_url, miix_no, miix_view, fb_like, fb_comment, fb_share, user_name, dooh_apply, dooh_play, played_time, arr) {
		arr.push({ 
			//userPhotoUrl: '/contents/user_project/greeting-50ee77e2fc4d981408000014-20130222T025333669Z/user_data/_cdv_photo_011.jpg', //素材照片
			userPhotoUrl: photo_url, //素材照片
			movieNo: miix_no, //影片編號
			movieViewedCount: miix_view, //觀看次數
			fbLikeCount: fb_like, //FB讚次數
			fbCommentCount: fb_comment, //FB留言數
			fbShareCount: fb_share, //FB分享次數
			movieMaker: user_name, //會員名稱
			applyDoohPlayCount: dooh_apply, //投稿次數
			doohPlayCount: dooh_play, //DOOH刊登次數
			timesOfPlaying: played_time 
		});
	}
	
	var async = require('async');
	var next = 0,
		limit;
	
	var setMiixPlayList = function(data, set_cb){
		var toDo = function(err, result){
			//console.log(result);
			if(next == limit-1) {
				miixPlayListInfo(result[0], data[next].no, result[1], result[3][0].likes, result[3][0].comments, result[3][1].shares, result[2], data[next].triedDoohTimes, data[next].doohPlayedTimes, 0, miixPlayList);
				next = 0;
				set_cb(null, 'OK');
			}
			else {
				miixPlayListInfo(result[0], data[next].no, result[1], result[3][0].likes, result[3][0].comments, result[3][1].shares, result[2], data[next].triedDoohTimes, data[next].doohPlayedTimes, 0, miixPlayList);
				next += 1;
				setMiixPlayList(data, set_cb);
			}
		}

		async.parallel([
			function(callback){
				miix_content_mgr.getUserUploadedImageUrls(data[next].projectId, function(result, err){
					if(err) callback(err, null);
					else callback(null, result);
				});
			},
			function(callback){
				video_mgr.getVideoCount(data[next]._id, 'miix', function(err, result){
					if(err) callback(err, null);
					else callback(null, result);
				});
			},
			function(callback){
				member_mgr.getUserNameAndID(data[next].ownerId._id, function(err, result){
					if(err) callback(err, null);
					else if(result == null) callback(null, 'No User');
					else callback(null, result.fb.userName);
				});
			},
			function(callback){
				if((typeof(data[next].fb_id) == null) || (typeof(data[next].fb_id) === 'undefined') ||
				   (typeof(data[next].url.youtube) == null) || (typeof(data[next].url.youtube) === 'undefined')) callback(null, [{ comments: 0, likes: 0 }, { shares: 0 }]);
				else {
					video_mgr.getCommentsLikesSharesOnFB(data[next]._id, data[next].ownerId._id, data[next].fb_id, data[next].url.youtube, function(err, result){
						if(err) callback(err, null);
						else callback(null, result);
					});
				}
			},
		], toDo);
	}
	
	var query = videos.find({'genre': 'miix'});
    query.sort({'no': 1}).limit(req.query.limit).skip(req.query.skip).exec(function(err, result){
		//console.dir(result);
		
		if(req.query.skip < result.length)
			limit = req.query.limit;
		else 
			limit = result.length;
		
		//console.log(req.query.limit + "," + req.query.skip + "," + result.length + "," + limit);
		
		setMiixPlayList(result, function(err, result){
			if(err) console.log(err);
			else //console.log(result);
			res.render('table_miix_movie', {miixMovieList: miixPlayList});
		});
	});
    
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
            //logger.error("[video_mgr.getPlayList]error ", err);
            //res.render('form_play', {playList: null});
            
        }else{
            //FM_LOG("playlist:" + JSON.stringify(result));
            //res.render('form_play', {playList: result});
            
            var testArray =
                [ { userPhotoUrl: '/contents/user_project/greeting-50ee77e2fc4d981408000014-20130222T023238273Z/user_data/_cdv_photo_010.jpg', //素材照片
                    movieNo: '035', //影片編號
                    movieViewedCount: 200, //觀看次數
                    fbLikeCount: 235, //FB讚次數
                    fbCommentCount: 203, //FB留言數
                    fbShareCount: 34, //FB分享次數
                    movieMaker: 'cda BB', //會員名稱
                    applyDoohPlayCount: 5, //投稿次數
                    doohPlayCount: 20, //DOOH刊登次數
                    timesOfPlaying: ['2013/5/3 15:14', '2013/6/5 16:14', '2013/8/3 15:08'] } //播放時間
                    ];
            //res.render('table_miix_movie', {miixMovieList: testArray});
        }
    });
};

FM.admin.storyPlayList_get_cb = function(req, res){
    //TODO: need to implement
	
	var storyPlayList = [];
	
	var storyPlayListInfo = function(story_no, story_view, fb_like, fb_comment, fb_share, user_name, arr) {
		arr.push({ 
			movieNo: story_no, //影片編號
            movieViewedCount: story_view, //觀看次數
            fbLikeCount: fb_like, //FB讚次數
            fbCommentCount: fb_comment, //FB留言數
            fbShareCount: fb_share, //FB分享次數
            movieMaker: user_name //會員名稱
		});
	}
	
	var async = require('async');
	var next = 0,
		limit;
	
	var setStoryPlayList = function(data, set_cb){
		var toDo = function(err, result){
			//console.log(result);
			if(next == limit-1) {
				storyPlayListInfo(data[next].no, result[1], result[2][0].likes, result[2][0].comments, result[2][1].shares, result[0], storyPlayList);
				next = 0;
				set_cb(null, 'OK');
			}
			else {
				storyPlayListInfo(data[next].no, result[1], result[2][0].likes, result[2][0].comments, result[2][1].shares, result[0], storyPlayList);
				next += 1;
				setStoryPlayList(data, set_cb);
			}
		}
		
		async.parallel([
			function(callback){
				member_mgr.getUserNameAndID(data[next].ownerId._id, function(err, result){
					if(err) callback(err, null);
					else callback(null, result.fb.userName);
				});
			},
			function(callback){
				video_mgr.getVideoCount(data[next]._id, 'miix_story', function(err, result){
					if(err) callback(err, null);
					else callback(null, result);
				});
			},
			function(callback){
				if((typeof(data[next].fb_id) == null) || (typeof(data[next].fb_id) === 'undefined') ||
				   (typeof(data[next].url.youtube) == null) || (typeof(data[next].url.youtube) === 'undefined')) callback(null, [{ comments: 0, likes: 0 }, { shares: 0 }]);
				else {
					video_mgr.getCommentsLikesSharesOnFB(data[next]._id, data[next].ownerId._id, data[next].fb_id, data[next].url.youtube, function(err, result){
						if(err) callback(err, null);
						else callback(null, result);
					});
				}
			},
		], toDo);
	}

	var query = videos.find({'genre': 'miix_story'});
    query.sort({'no': 1}).limit(req.query.limit).skip(req.query.skip).exec(function(err, result){
		//console.dir(result);
		
		if(req.query.skip < result.length)
			limit = req.query.limit;
		else 
			limit = result.length;
			
		//console.log(req.query.limit + "," + req.query.skip + "," + result.length + "," + limit);
		
		setStoryPlayList(result, function(err, result){
			if(err) console.log(err);
			else //console.log(result);
			res.render('table_story_movie', {storyMovieList: storyPlayList});
		});
	});
	
    //res.send(200);
    var testArray =
        [ { movieNo: '075', //影片編號
            movieViewedCount: 200, //觀看次數
            fbLikeCount: 235, //FB讚次數
            fbCommentCount: 203, //FB留言數
            fbShareCount: 34, //FB分享次數
            movieMaker: 'abc CC'} //會員名稱
            ];
    //res.render('table_story_movie', {storyMovieList: testArray});
    
};

//GZ
FM.admin.listSize_get_cb = function(req, res){

    if (req.query.listType == 'memberList'){
        member_mgr.getMemberCount(function(err, count) {
            res.send({err: err, size: count});
        });
    }
    else if (req.query.listType == 'miixMovieList'){
        video_mgr.getVideoCountWithGenre('miix', function(err, count) {
            res.send({err: err, size: count});
        });
    }
    else if (req.query.listType == 'storyMovieList'){
        video_mgr.getVideoCountWithGenre('miix_story', function(err, count) {
            res.send({err: err, size: count});
        });
    }
    else {
        res.send(400, {error: "Parameters are not correct"});
    }
}

/** Internal API */
/*
var _test = (function(){
	var ObjectID = require('mongodb').ObjectID;
	var v_id = ObjectID.createFromHexString("51302b836b8e0e580f000004");
	var owner_id =  ObjectID.createFromHexString("512d849345483ac80d000003");
	var fb_id = "100004712734912_604889539525089";
	var youtube_url = "http://www.youtube.com/embed/CJuffmPIMJ0";
	if((typeof(fb_id) == null) || (typeof(fb_id) === 'undefined') ||
	   (typeof(youtube_url) == null) || (typeof(youtube_url) === 'undefined')) callback(null, ['No data', 'No data', 'No data']);
	else {
		video_mgr.getCommentsLikesSharesOnFB(v_id, owner_id, fb_id, youtube_url, function(err, result){
			if(err) console.log(err, null);
			else console.log(null, result);
		});
	}
})();
*/
module.exports = FM.admin;