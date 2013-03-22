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
    
    if ( req.query.limit && req.query.skip ) {
        FM_LOG("[admin.memberList_get_cb]");
        var cursor = member_mgr.listOfMembers( null, 'fb.userName fb.userID email mPhone video_count doohTimes triedDoohTimes', {sort: 'fb.userName',limit: req.query.limit, skip: req.query.skip}, function(err, result){
            if(err) logger.error('[member_mgr.listOfMemebers]', err);
            if(result){
                //FM_LOG(JSON.stringify(result));
                //console.dir(result);
                res.render( 'form_member', {memberList: result} );
                
                var testArray =
                [ { fb: { userID: '100001295751468', userName: 'AA Yang' },
                    email: 'xyz@feltmeng.com', //Email
                    mobilePhoneNumber: '0928234303', //手機
                    miixMovieCount: 5, //已製作影片數
                    doohPlayCount: 20, //DOOH刊登次數
                    movieViewedCount: 200, //影片觀看總次數
                    fbLikeCount: 235, //FB讚總數
                    fbCommentCount: 203, //FB留言總數
                    fbShareCount: 34  }, //FB分享總數
                  { fb: { userID: '100001295751468', userName: 'BB Zhu' },
                    email: 'abc@feltmeng.com', //Email
                    mobilePhoneNumber: '0928234111', //手機
                    miixMovieCount: 5, //已製作影片數
                    doohPlayCount: 20, //DOOH刊登次數
                    movieViewedCount: 200, //影片觀看總次數
                    fbLikeCount: 235, //FB讚總數
                    fbCommentCount: 203, //FB留言總數
                    fbShareCount: 34  }, //FB分享總數
                  { fb: { userID: '100001295751468', userName: 'CC Zhu' },
                    email: 'ccd@feltmeng.com', //Email
                    mobilePhoneNumber: '09282340003', //手機
                    miixMovieCount: 5, //已製作影片數
                    doohPlayCount: 20, //DOOH刊登次數
                    movieViewedCount: 200, //影片觀看總次數
                    fbLikeCount: 235, //FB讚總數
                    fbCommentCount: 203, //FB留言總數
                    fbShareCount: 35  } //FB分享總數  
                    ];
                    
                //res.render( 'table_member', {memberList: testArray} );
            }
        });
    }
    else{
        res.send(400, {error: "Parameters are not correct"});
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
            
            var testArray =
                [ { userPhotoUrl: '/contents/user_project/greeting-50ee77e2fc4d981408000014-20130222T025333669Z/user_data/_cdv_photo_011.jpg', //素材照片
                    movieNo: '035', //影片編號
                    movieViewedCount: 200, //觀看次數
                    fbLikeCount: 235, //FB讚次數
                    fbCommentCount: 203, //FB留言數
                    fbShareCount: 34, //FB分享次數
                    movieMaker: 'abc AA', //會員名稱
                    applyDoohPlayCount: 5, //投稿次數
                    doohPlayCount: 20, //DOOH刊登次數
                    timesOfPlaying: ['2013/2/3 15:14', '2013/2/5 16:14', '2013/4/3 15:08'] }, //播放時間
                  { userPhotoUrl: '/contents/user_project/greeting-50ee77e2fc4d981408000014-20130222T023238273Z/user_data/_cdv_photo_010.jpg', //素材照片
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
    //res.send(200);
    var testArray =
        [ { movieNo: '035', //影片編號
            movieViewedCount: 200, //觀看次數
            fbLikeCount: 235, //FB讚次數
            fbCommentCount: 203, //FB留言數
            fbShareCount: 34, //FB分享次數
            movieMaker: 'abc AA'}, //會員名稱
          { movieNo: '055', //影片編號
            movieViewedCount: 200, //觀看次數
            fbLikeCount: 235, //FB讚次數
            fbCommentCount: 203, //FB留言數
            fbShareCount: 34, //FB分享次數
            movieMaker: 'abc BB'}, //會員名稱
          { movieNo: '075', //影片編號
            movieViewedCount: 200, //觀看次數
            fbLikeCount: 235, //FB讚次數
            fbCommentCount: 203, //FB留言數
            fbShareCount: 34, //FB分享次數
            movieMaker: 'abc CC'} //會員名稱
            ];
    res.render('table_story_movie', {storyMovieList: testArray});
    
};

//GZ
FM.admin.listSize_get_cb = function(req, res){

    if (req.query.listType == 'memberList'){
        member_mgr.getMemberCount(function(err, count) {
            res.send({err: err, size: count});
        });
    }
    else if (req.query.listType == 'miixMovieList'){
        video_mgr.getVideoCount('miix_story', function(err, count) {
            res.send({err: err, size: count});
        });
    }
    else if (req.query.listType == 'storyMovieList'){
        video_mgr.getVideoCount('miix_story', function(err, count) {
            res.send({err: err, size: count});
        });
    }
    else {
        res.send(400, {error: "Parameters are not correct"});
    }
}

/** Internal API */

module.exports = FM.admin;