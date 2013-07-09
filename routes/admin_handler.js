﻿var fs = require('fs');
var path = require('path');
var workingPath = process.cwd();

var admin_mgr = require("../admin.js"),
    member_mgr = require("../member.js"),
    schedule_mgr = require("../schedule.js"),
    UGC_mgr = require("../UGC.js"),
    tokenMgr = require("../token_mgr.js"),
    admincache_mgr = require("../admin_cache.js");



var FMDB = require('../db.js'),
	UGCs = FMDB.getDocModel("ugc"),
	members = FMDB.getDocModel("member"),
    memberListInfos = FMDB.getDocModel("memberListInfo"),
	miix_content_mgr = require('../miix_content_mgr.js');

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
                
                tokenMgr.getToken(req.query.id, function(_err, _token){
                    if (!err){
                        res.send(200, {token: _token});
                    }
                    else {
                        res.send(401, {message: _err});
                    }
                });
                
                
                
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
                res.send(401,{message: "Wrong ID/PASSWORD Match!"});
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
    
    FM_LOG("[admin.memberList_get_cb]");
    var skip =  req.query.skip;
    var limit = req.query.limit;
    admincache_mgr.getMemberListInfo(limit, skip, function(err, memberList){
        if (!err){
            res.render( 'table_member', {'memberList': memberList} );
        }
        else{
            res.send(400, {error: err});
        }
    });
    
};


FM.admin.miixPlayList_get_cb = function(req, res){

    admincache_mgr.getMiixPlayListInfo(req, res);
    
};

FM.admin.storyPlayList_get_cb = function(req, res){

    admincache_mgr.getStoryPlayListInfo(req, res);
     
};

//GZ
FM.admin.listSize_get_cb = function(req, res){

    if (req.query.listType == 'memberList'){
        member_mgr.getMemberCount(function(err, count) {
            res.send({err: err, size: count});
        });
    }
    else if (req.query.listType == 'miixMovieList'){
        UGC_mgr.getUGCCountWithGenre('miix', function(err, count) {
            res.send({err: err, size: count});
        });
    }
    else if (req.query.listType == 'storyMovieList'){
        UGC_mgr.getUGCCountWithGenre('miix_story', function(err, count) {
            res.send({err: err, size: count});
        });
    }
    else if (req.query.listType == 'ugcCensorMovieList'){
        UGC_mgr.getUGCCountWithGenre('miix', function(err, count) {
            res.send({err: err, size: count});
        });
    }
    else if (req.query.listType == 'ugcCensorPlayList'){
        UGC_mgr.getUGCCountWithGenre('miix', function(err, count) {
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