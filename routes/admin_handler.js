var admin_mgr = require("../admin.js"),
    member_mgr = require("../member.js"),
    schedule_mgr = require("../schedule.js"),
    video_mgr = require("../video.js");

var ObjectID = require('mongodb').ObjectID;

var DEBUG = true,
    FM_LOG = (DEBUG) ? function(str){ logger.info( typeof(str)==='string' ? str : JSON.stringify(str) ); } : function(str){} ;
    
var FM = { admin: {} };


FM.admin.handler = function(req, res){
    /* TODO - Using RegularExpress/Command to parse every request, then pass req to corresponding function.
       switch(req.path){
        case 'api':
            FM.admin.api();
            break;
       }
    */
    FM_LOG("[admin.handler]");
    res.render('login');
};


FM.admin.login = function(req, res){
    
    //FM_LOG("[admin.login] " + JSON.stringify(req.query));
    if(req.query.id && req.query.password){
    
        admin_mgr.isValid(req.query, function(err, result){
            if(err) logger.error("[admin.login] ", err);
            if(result){
                FM_LOG("[Login Success!]");
                req.session.user = {
                    oid: result._id,
                    id: req.query.id
                };
                
                member_mgr.listOfMembers( null, 'fb.userName fb.userID email mPhone video_count doohTimes triedDoohTimes', {sort: 'fb.userName'}, function(err, result){
                    if(err) logger.error('[member_mgr.listOfMemebers]', err);
                    if(result){
                        //FM_LOG(JSON.stringify(result));
                        res.render( 'frame', {memberList: result} );
                    }else{
                        // TODO
                        res.render( 'frame', {memberList: result} );
                    }
                });
                
            }else{
                res.send({message: "Wrong ID/PASSWORD Match!"});
            }
        });
        
    }else{
        res.send(403, {error: "fail"});
    }
};


FM.admin.memberList = function(req, res){
    
    FM_LOG("[admin.memberList]");
    member_mgr.listOfMembers( null, 'fb.userName fb.userID email mPhone video_count doohTimes triedDoohTimes', {sort: 'fb.userName'}, function(err, result){
        if(err) logger.error('[member_mgr.listOfMemebers]', err);
        if(result){
            //FM_LOG(JSON.stringify(result));
            res.render( 'form_member', {memberList: result} );
        }
    });
};


FM.admin.playList = function(req, res){
    
    FM_LOG("[admin.playList]");
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


/** Internal API */




module.exports = FM.admin;