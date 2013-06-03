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
    
    admincache_mgr.getMemberListInfo(req, res);
    
};


FM.admin.miixPlayList_get_cb = function(req, res){

    admincache_mgr.getMiixPlayListInfo(req, res);
    
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
	          console.log('setStoryplaylist'+err+result);
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