
var FMDB = require('./db.js'),
    ADCDB = require('./admin_cache_db.js'),
    video_mgr = require('./video.js'),
    ObjectID = require('mongodb').ObjectID,
    fb_handler = require('./fb_handler.js'),
	member_mgr = require('./member.js'),
    youtubeInfo = require('./youtube_mgr.js');
    
var FM = {};
var DEBUG = true,
//    FM_LOG = (DEBUG) ? function(str){ logger.info(str); } : function(str){} ;
    FM_LOG = (DEBUG) ? function(str){ } : function(str){} ;

    FM.ADMINCACHE = (function(){
        var uInstance = null;
 
        /**     Member     **/
        var cacheMember = function(){

            var member_mgr_t = require('./member.js');

            var memberListInfos = FMDB.getDocModel("memberListInfo");
            var members = FMDB.getDocModel("member");

            var async = require('async');
            var next = 0,
            limit;
            //test
            var nextadd = 0;
            var nextupd = 0;

            var cacheMemberList = function(data, set_cb){
                var toDo = function(err, result){

                    //update mongoDB
                    var vjson = {fb: { userID: data[next].fb.userID, userName: data[next].fb.userName},
                            email:data[next].email,
                            mPhone:data[next].mPhone.number,
                            miixMovieVideo_count:result[0],
                            doohPlay_count:result[1],
                            movieViewed_count:result[2],
                            fbLike_count:result[3][0].totalLikes,
                            fbComment_count:result[3][0].totalComments,
                            fbShare_count:result[3][1].totalShares,
                    };

                    var field = "fb.userID";
                    FMDB.getValueOf(memberListInfos, {"fb.userID": data[next].fb.userID}, field, function(err, result){
                        if(result == null){ 
                            FMDB.createAdoc(memberListInfos,vjson, null);
                            nextadd += 1;
                        }else{
                            var condition = {'fb.userID': data[next].fb.userID};
                            FMDB.updateAdoc(memberListInfos, condition, vjson, null);
                            nextupd += 1;
                        }
//                      console.log("nextdb add="+nextadd);
//                      console.log("nextdb upd="+nextupd);
//                      console.log(err,result);
                    });
                    console.log("memberNextDBCount="+next);                        
                    next += 1;

                    if(next == limit ) {

                        set_cb(null, 'OK'); 
                        next = 0;
                    }
                    else{

                        cacheMemberList(data, set_cb);
                    }
                    //update mongoDB End ******

                }
                //get count data   
                async.parallel([
                                function(callback){
                                    video_mgr.getVideoCount(data[next]._id, 'miix', function(err, result){
                                        if(err) callback(err, null);
                                        else callback(null, result);
                                    });
                                },
                                function(callback){
                                    video_mgr.getVideoCount(data[next]._id, 'miix_story', function(err, result){
                                        if(err) callback(err, null);
                                        else callback(null, result);
                                    });
                                },
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
                                },
                                ], toDo);

            }//cacheMemberList End ******

            member_mgr_t.listOfMembers( null, 'fb.userName fb.userID _id email mPhone video_count doohTimes triedDoohTimes', {sort: 'fb.userName'}, function(err, result){
                if(err) console.log('[member_mgr.listOfMemebers]', err);
                if(result){

                    limit = result.length;
//                  console.log("limit"+limit);
//                  console.log("result"+result); 

                    cacheMemberList(result, function(err, docs){
                        if(err) console.log(err);
                    });

                }
            });
        };
        /**     Member End     **/


        /**     MiixVideo     **/
        var cacheMiixVideo = function(){

            //TODO: need to implement
            var member_mgr = require('./member.js');
            var video_mgr = require('./video.js');
            var miix_content_mgr = require('./miix_content_mgr.js');

            var videos = FMDB.getDocModel("video");
            var miixPlayListInfos = FMDB.getDocModel("miixPlayListInfo");

            var miixPlayList = [];

            var miixPlayListInfo = function(photo_url, miix_no, miix_view, fb_like, fb_comment, fb_share, user_name, dooh_apply, dooh_play, played_time, arr) {
                arr.push({ 
                    //userPhotoUrl: '/contents/user_project/greeting-50ee77e2fc4d981408000014-20130222T025333669Z/user_data/_cdv_photo_011.jpg', //酚
                    userPhotoUrl: photo_url, //酚
                    movieNo: miix_no, //紇絪腹
                    movieViewedCount: miix_view, //芠Ω计
                    fbLikeCount: fb_like, //FB苂Ω计
                    fbCommentCount: fb_comment, //FB痙ē计
                    fbShareCount: fb_share, //FBだㄉΩ计
                    movieMaker: user_name, //穦嘿
                    applyDoohPlayCount: dooh_apply, //щ絑Ω计
                    doohPlayCount: dooh_play, //DOOH祅Ω计
                    timesOfPlaying: played_time 
                });
            }

            var async = require('async');
            var next = 0,
            limit;
            var nextadd = 0;
            var nextupd = 0;

            var cacheMiixPlayList = function(data, set_cb){
                var toDo = function(err, result){
                    console.log('setMiixplaylist'+err+result);
//                  if(next == limit-1) {
//                  miixPlayListInfo(result[0], data[next].no, result[1], result[3][0].likes, result[3][0].comments, result[3][1].shares, result[2], data[next].triedDoohTimes, data[next].doohPlayedTimes, 0, miixPlayList);
//                  next = 0;
//                  set_cb(null, 'OK');
//                  }
//                  else {
//                  miixPlayListInfo(result[0], data[next].no, result[1], result[3][0].likes, result[3][0].comments, result[3][1].shares, result[2], data[next].triedDoohTimes, data[next].doohPlayedTimes, 0, miixPlayList);
//                  next += 1;
//                  setMiixPlayList(data, set_cb);
//                  }
                    //update mongoDB
                    var vjson = {//fb: { userID: data[next].fb.userID, userName: data[next].fb.userName},
                            projectId:data[next].projectId,
                            userPhotoUrl:result[0],
                            movieNo: data[next].no,
                            movieViewed_count:result[1],
                            fbLike_count:result[3][0].likes,
                            fbComment_count:result[3][0].comments,
                            fbShare_count:result[3][1].shares,
                            movieMaker:result[2],
                            applyDoohPlay_count:data[next].triedDoohTimes,
                            doohPlay_count:data[next].doohPlayedTimes,
                            //  timesOfPlaying:0,
                    };

                    var field = "projectId";
                    FMDB.getValueOf(miixPlayListInfos, {"projectId": data[next].projectId}, field, function(err, result){
                        if(result == null){ 
//                          console.log("dbget=null"+err+result);  
                            FMDB.createAdoc(miixPlayListInfos,vjson, null);
                            nextadd += 1;
                        }else{
                            var condition = {'projectId': data[next].projectId};
                            FMDB.updateAdoc(miixPlayListInfos, condition, vjson, null);
                            nextupd += 1;
                        }
//                      console.log(err,result);
                    });
                    console.log("nextdb add="+nextadd);
                    console.log("nextdb upd="+nextupd);
                    console.log("miixVideoNextDBCount="+next);                        
                    next += 1;

                    if(next == limit-1) {

                        set_cb(null, 'OK'); 
                        next = 0;
                    }
                    else{

                        cacheMiixPlayList(data, set_cb);
                    }
                    //update mongoDB End ******
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
            query.sort({'no':1}).exec(function(err, result){
                //console.dir(result);
//              console.log(err+result);
//              console.log(result.length,req.query.skip);

//              if(req.query.skip < result.length)
//              limit = req.query.limit;
//              else 
                limit = result.length;

                //console.log(req.query.limit + "," + req.query.skip + "," + result.length + "," + limit);

                cacheMiixPlayList(result, function(err, result){
                    console.log('setmiixplay='+err+result);
                    if(err) console.log(err);
                    else {//console.log(result);
//                      res.render('table_miix_movie', {miixMovieList: miixPlayList});
                    }
                });
            });

            FM_LOG("[admin.miixPlayList_get_cb]");

            video_mgr.getPlayList(function(err, result){
                if(err){
                    //logger.error("[video_mgr.getPlayList]error ", err);
                    //res.render('form_play', {playList: null});

                }else{
                    //FM_LOG("playlist:" + JSON.stringify(result));
                }
            });

        };
        /**     MiixVideo End     **/        


        var retrieveDataAndUpdateCacheDB = function(){    

            //TODO: need to implement

            cacheMember();

            cacheMiixVideo();

        };//retrieveDataAndUpdateCacheDB End ******

        retrieveDataAndUpdateCacheDB();




//      setTimeout(fucntion(){
//      retrieveDataAndUpdateCacheDB();
//      },600000);


        function constructor(){

            var memberListInfos = FMDB.getDocModel("memberListInfo");
            var miixPlayListInfos = FMDB.getDocModel("miixPlayListInfo");

            return {

                /*
                 *  Public Members
                 */
                /**     Member     **/
                getMemberListInfo : function(req, res){

                    //TODO: need to implement

                    var memberList = [];

                    var memberListInfo = function(fb_id, fb_name, email, mp_number, miixMovieVideo_count, doohPlay_count, movieViewed_count, fbLike_count, fbComment_count, fbShare_count, arr) {
                        arr.push({ 
                            fb: { userID: fb_id, userName: fb_name },
                            //_id: _id,
                            email: email, //Email
                            mobilePhoneNumber: mp_number, //も诀
                            miixMovieVideoCount: miixMovieVideo_count, //籹紇计
                            doohPlayCount: doohPlay_count, //DOOH祅Ω计
                            movieViewedCount: movieViewed_count, //紇芠羆Ω计
                            fbLikeCount: fbLike_count, //FB苂羆计
                            fbCommentCount: fbComment_count, //FB痙ē羆计
                            fbShareCount: fbShare_count
                        });
                    }

                    var async = require('async');
                    var next = 0,
                    limit;

                    var setMemberList = function(data, set_cb){
                        if(next == limit-1 || limit-1 < 0) {
                            if(next > 0)
                                memberListInfo(data[next].fb.userID, data[next].fb.userName, data[next].email, data[next].mPhone.number, data[next].miixMovieVideo_count, data[next].doohPlay_count, data[next].movieViewed_count, data[next].fbLike_count, data[next].fbComment_count,data[next].fbShare_count, memberList);               
                            next = 0;
                            set_cb(null, 'OK');
                        }
                        else {
                            memberListInfo(data[next].fb.userID, data[next].fb.userName, data[next].email, data[next].mPhone.number, data[next].miixMovieVideo_count, data[next].doohPlay_count, data[next].movieViewed_count, data[next].fbLike_count, data[next].fbComment_count,data[next].fbShare_count, memberList);               
                            next += 1;
                            setMemberList(data, set_cb);
                        }

                    }

                    if ( req.query.limit && req.query.skip ) {
                        FM_LOG("[admin.memberList_get_cb]");
                        var cursor = FMDB.listOfdocModels( memberListInfos,null,'fb.userName fb.userID _id email mPhone miixMovieVideo_count doohPlay_count movieViewed_count fbLike_count fbComment_count fbShare_count', {sort:'fb.userName',limit: req.query.limit, skip: req.query.skip}, function(err, result){
                            if(err) logger.error('[member_mgr.listOfMemebers]', err);
                            if(result){

                                if(req.query.skip < result.length)
                                    limit = req.query.limit;
                                else 
                                    limit = result.length;

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

                },
                /**     Member End     **/

                /**     MiixVideo     **/
                getMiixPlayListInfo : function(req, res){

                    //TODO: need to implement

                    var miixPlayList = [];

                    var miixPlayListInfo = function(userPhotoUrl, movieNo, movieViewed_count, fbLike_count, fbComment_count, fbShare_count, movieMaker, applyDoohPlay_count, doohPlay_count, timesOfPlaying, arr) {
                        arr.push({ 
                            userPhotoUrl: userPhotoUrl, //酚
                            movieNo: movieNo, //紇絪腹
                            movieViewedCount: movieViewed_count, //芠Ω计
                            fbLikeCount: fbLike_count, //FB苂Ω计
                            fbCommentCount: fbComment_count, //FB痙ē计
                            fbShareCount: fbShare_count, //FBだㄉΩ计
                            movieMaker: movieMaker, //穦嘿
                            applyDoohPlayCount: applyDoohPlay_count, //щ絑Ω计
                            doohPlayCount: doohPlay_count, //DOOH祅Ω计
                            timesOfPlaying: timesOfPlaying 
                        });
                    }


                    var async = require('async');
                    var next = 0,
                    limit;

                    var setMiixPlayList = function(data, set_cb){
                        if(next == limit-1 || limit-1 < 0) {
                            if(next > 0)
                                miixPlayListInfo(data[next].userPhotoUrl, data[next].movieNo, data[next].movieViewed_count, data[next].fbLike_count, data[next].fbComment_count, data[next].fbShare_count,data[next].movieMaker,data[next].applyDoohPlay_count,data[next].doohPlay_count,0, miixPlayList);               
                            next = 0;
                            set_cb(null, 'OK');
                        }
                        else {
                            miixPlayListInfo(data[next].userPhotoUrl, data[next].movieNo, data[next].movieViewed_count, data[next].fbLike_count, data[next].fbComment_count, data[next].fbShare_count,data[next].movieMaker,data[next].applyDoohPlay_count,data[next].doohPlay_count,0, miixPlayList);               
                            next += 1;
                            setMiixPlayList(data, set_cb);
                        }

                    }

                    if ( req.query.limit && req.query.skip ) {
                        FM_LOG("[admin.memberList_get_cb]");
                        var cursor = FMDB.listOfdocModels( miixPlayListInfos,null,'projectId userPhotoUrl movieNo movieViewed_count fbLike_count fbComment_count fbShare_count movieMaker applyDoohPlay_count doohPlay_count timesOfPlaying', {sort:'movieNo',limit: req.query.limit, skip: req.query.skip}, function(err, result){
                            if(err) logger.error('[member_mgr.listOfMemebers]', err);
                            if(result){

                                if(req.query.skip < result.length)
                                    limit = req.query.limit;
                                else 
                                    limit = result.length;

                                setMiixPlayList(result, function(err, docs){
                                    if(err) console.log(err);
                                    else {

                                        res.render( 'table_miix_movie', {miixMovieList: miixPlayList} );
                                    }
                                });

                            }
                        });
                    }
                    else{
                        res.send(400, {error: "Parameters are not correct"});
                    }

                },
                /**     MiixVideo End     **/

                /*    TEST    */
                _test: function(){
                    var oid = ObjectID.createFromHexString("512d8df5989cfc2403000002");
                    this.getTotalCommentsLikesSharesOnFB( '100000886748741', function(err, result){
                        if(err)
                            console.log("Err: " + JSON.stringify(err));
                        else
                            console.log("Result: " + JSON.stringify(result));
                    });
                },

                //GZ
                getMemberCount: function( cb){
                    members.count(cb);
                },

                _GZ_test: function(){

                    this.getMemberCount(function(err, count) {
                        console.log('count= '+count);
                    });
                },

                //JF
                updateVideoCount: function(_id, cb){
                    videoDB.getVideoCount(_id, "miix", function(err, result){
                        var condition = {'_id': _id};
                        FMDB.updateOne(members, condition, {'video_count': result}, null, cb);
                    });
                },

                updateDoohTimes: function(_id, cb){
                    videoDB.getVideoCount(_id, "miix_story", function(err, result){
                        var condition = {'_id': _id};
                        FMDB.updateOne(members, condition, {'doohTimes': result}, null, cb);
                    });
                },

                getTotalView: function(_id, totalView_cb){
                    var videos = FMDB.getDocModel("video"),
                    async = require('async');
                    var condition = {'ownerId._id': _id};
                    videos.find(condition, {}, function(err, result){
                        if(result.length == 0) totalView_cb(null, 0);
                        else {
                            var count = [];
                            var asyncStart = function() {
                                async.parallel(count , function(err, result) {
                                    if(err) totalView_cb(err, null);
                                    else {
                                        var total = 0;
                                        for(var i=0; i<result.length; i++) total += result[i];
                                        totalView_cb(null, total);
                                    }
                                });
                            }
                            for(var i=0;i<result.length;i++){
                                count.push(
                                        function(callback){
                                            //console.log(typeof(result[i].url.youtube) + ", " + result[i].url.youtube);
                                            if((typeof(result[i].url.youtube) != null)&&(typeof(result[i].url.youtube) != 'undefined')) videoDB.getViewCount(result[i].url.youtube, callback);
                                            else callback(null, 0);
                                        }
                                );
                                if(i == result.length-1) asyncStart();
                            }
                        }
                    });
                },

            };
            
        } //    End of Constructor.

        
        return {
            getInstance: function(){
                if(!uInstance){
                    uInstance = constructor();
                }
                return uInstance;
            }
        }; //   End of Return uInstance.
    })(); // End of FM.MEMBER

    /*  For TEST. */
//  FM.MEMBER.getInstance()._test();
//  FM.MEMBER.getInstance()._JF_test();
//  FM.MEMBER.getInstance()._GZ_test();

    module.exports = FM.ADMINCACHE.getInstance();