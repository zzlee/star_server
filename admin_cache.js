
var FMDB = require('./db.js'),
    ADCDB = require('./admin_cache_db.js'),
    UGC_mgr = require('./UGC.js'),
    ObjectID = require('mongodb').ObjectID,
    fb_handler = require('./fb_handler.js'),
	member_mgr = require('./member.js'),
    youtubeInfo = require('./youtube_mgr.js');
    
var FM = {};

FM.ADMINCACHE = (function(){
    var uInstance = null;

    /**     Member     **/
    var cacheMember = function(){

        //TODO: need to implement

        var member_mgr_t = require('./member.js');
        var memberListInfos = FMDB.getDocModel("memberListInfo");

        var async = require('async');
        var next = 0,
        limit = 0;

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
                    }else{
                        FMDB.updateAdoc(memberListInfos, result, vjson, null);
                    }
                });
                next += 1;

                if(next == limit ) {
                    set_cb(null, 'OK'); 
                    next = 0;
                }
                else{
                    cacheMemberList(data, set_cb);
                }
                //update mongoDB End ******

            };//toDo End ******

            //get count  
            if(data[next] !== null && data[next].fb.userID !== null){
                async.parallel([
                                function(callback){
                                    UGC_mgr.getUGCCount(data[next]._id, 'miix', function(err, result){
                                        if(err) callback(err, null);
                                        else callback(null, result);
                                    });
                                },
                                function(callback){
                                    UGC_mgr.getUGCCount(data[next]._id, 'miix_story', function(err, result){
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
            }
        };//cacheMemberList End ******

        member_mgr_t.listOfMembers( null, 'fb.userName fb.userID _id email mPhone ugc_count doohTimes triedDoohTimes', {sort: 'fb.userName'}, function(err, result){
            if(err) console.log('[member_mgr.listOfMemebers]', err);
            if(result){

                limit = result.length;
                if(limit > 0){
                    cacheMemberList(result, function(err, docs){
                        if(err) console.log(err);
                    });
                }
            }
        });
    };
    /**     Member End     **/


    /**     MiixUGC     **/
    var cacheMiixUGC = function(){

        //TODO: need to implement

        var member_mgr = require('./member.js');
        var UGC_mgr = require('./UGC.js');
        var miix_content_mgr = require('./miix_content_mgr.js');

        var UGCs = FMDB.getDocModel("ugc");
        var miixPlayListInfos = FMDB.getDocModel("miixPlayListInfo");

        var async = require('async');
        var next = 0,
        limit = 0;

        var cacheMiixPlayList = function(data, set_cb){
            var toDo = function(err, result){
                //update mongoDB
                var vjson = {
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
//                      timesOfPlaying:0,
                };

                var field = "projectId";
                FMDB.getValueOf(miixPlayListInfos, {"projectId": data[next].projectId}, field, function(err, result){
                    if(result == null){ 
                        FMDB.createAdoc(miixPlayListInfos,vjson, null);
                    }else{
                        FMDB.updateAdoc(miixPlayListInfos, result, vjson, null);
                    }
                });
                next += 1;

                if(next == limit) {
                    set_cb(null, 'OK'); 
                    next = 0;
                }
                else{
                    cacheMiixPlayList(data, set_cb);
                }
                //update mongoDB End ******

            };//toDo End ******

            //get count 
            if(data[next] !== null && data[next].ownerId._id !== null && data[next].projectId !== null && data[next].fb_id !== null){
                async.parallel([
                                function(callback){
                                    miix_content_mgr.getUserUploadedImageUrls(data[next].projectId, function(result, err){
                                        if(err) {
    //                                        callback(err,null);
                                            next += 1;
                                            cacheMiixPlayList(data, set_cb);
                                        }
                                        else callback(null, result);
                                    });
                                },
                                function(callback){
                                    UGC_mgr.getUGCCount(data[next]._id, 'miix', function(err, result){
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
                                        UGC_mgr.getCommentsLikesSharesOnFB(data[next]._id, data[next].ownerId._id, data[next].fb_id, data[next].url.youtube, function(err, result){
                                            if(err) callback(err, null);
                                            else callback(null, result);
                                        });
                                    }
                                },
                                ], toDo);
            }
        };

        var query = UGCs.find({'genre': 'miix'});
        query.sort({'no':1}).exec(function(err, result){
 
            limit = result.length;
            if(limit > 0){
                cacheMiixPlayList(result, function(err, result){
                    if(err) console.log(err);
                });
            }
        });

    };
    /**     MiixUGC End     **/        

    /**     StoryUGC     **/
    var cacheStoryUGC = function(){

        //TODO: need to implement

        var member_mgr = require('./member.js');
        var UGC_mgr = require('./UGC.js');

        var UGCs = FMDB.getDocModel("ugc");
        var storyPlayListInfos = FMDB.getDocModel("storyPlayListInfo");

        var async = require('async');
        var next = 0,
        limit = 0;

        var cacheStoryPlayList = function(data, set_cb){
            var toDo = function(err, result){
                //update mongoDB
                var vjson = {
                        projectId:data[next].projectId,
                        movieNo: data[next].no,
                        movieViewed_count:result[1],
                        fbLike_count:result[2][0].likes,
                        fbComment_count:result[2][0].comments,
                        fbShare_count:result[2][1].shares,
                        movieMaker:result[0],
                };

                var field = "projectId";
                FMDB.getValueOf(storyPlayListInfos, {"projectId": data[next].projectId}, field, function(err, result){
                    if(result == null){ 
                        FMDB.createAdoc(storyPlayListInfos,vjson, null);
                    }else{
                        FMDB.updateAdoc(storyPlayListInfos, result, vjson, null);
                    }
                });
                next += 1;

                if(next == limit) {
                    set_cb(null, 'OK'); 
                    next = 0;
                }
                else{
                    cacheStoryPlayList(data, set_cb);
                }
                //update mongoDB End ******

            };//toDo End ******

            //get count
            if(data[next] !== null && data[next].ownerId._id !== null && data[next].projectId !== null && data[next].fb_id !== null){
            async.parallel([
                            function(callback){
                                member_mgr.getUserNameAndID(data[next].ownerId._id, function(err, result){
                                    if(err) callback(err, null);
                                    else callback(null, result.fb.userName);
                                });
                            },
                            function(callback){
                                UGC_mgr.getUGCCount(data[next]._id, 'miix_story', function(err, result){
                                    if(err) callback(err, null);
                                    else callback(null, result);
                                });
                            },
                            function(callback){
                                if((typeof(data[next].fb_id) == null) || (typeof(data[next].fb_id) === 'undefined') ||
                                        (typeof(data[next].url.youtube) == null) || (typeof(data[next].url.youtube) === 'undefined')) callback(null, [{ comments: 0, likes: 0 }, { shares: 0 }]);
                                else {
                                    UGC_mgr.getCommentsLikesSharesOnFB(data[next]._id, data[next].ownerId._id, data[next].fb_id, data[next].url.youtube, function(err, result){
                                        if(err) callback(err, null);
                                        else callback(null, result);
                                    });
                                }
                            },
                            ], toDo);
            }
        };

        var query = UGCs.find({'genre': 'miix_story'});
        query.sort({'no': 1}).exec(function(err, result){

            limit = result.length;
            if(limit > 0){
                cacheStoryPlayList(result, function(err, result){
                    if(err) console.log(err);
                });
            }
        });

    };
    /**     StoryUGC End     **/  

    var retrieveDataAndUpdateCacheDB = function(){    

        //TODO: need to implement

        cacheMember();

        cacheMiixUGC();

        cacheStoryUGC();

        /*
         * Timer
         */            
        setTimeout(retrieveDataAndUpdateCacheDB,300000);

    };

    retrieveDataAndUpdateCacheDB();


    function constructor(){

        var DEBUG = true,
        FM_LOG = (DEBUG) ? function(str){ logger.info(str); } : function(str){} ;

        var memberListInfos = FMDB.getDocModel("memberListInfo");
        var miixPlayListInfos = FMDB.getDocModel("miixPlayListInfo");
        var storyPlayListInfos = FMDB.getDocModel("storyPlayListInfo");

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
                        email: email,                        //Email
                        mobilePhoneNumber: mp_number,        //も诀
                        miixMovieVideoCount: miixMovieVideo_count, //籹紇计
                        doohPlayCount: doohPlay_count,       //DOOH祅Ω计
                        movieViewedCount: movieViewed_count, //紇芠羆Ω计
                        fbLikeCount: fbLike_count,           //FB苂羆计
                        fbCommentCount: fbComment_count,     //FB痙ē羆计
                        fbShareCount: fbShare_count
                    });
                };

                var next = 0,
                limit = 0;

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

                };

                if ( req.query.limit && req.query.skip ) {
                    FM_LOG("[admin.memberList_get_cb]");
                    FMDB.listOfdocModels( memberListInfos,null,'fb.userName fb.userID _id email mPhone miixMovieVideo_count doohPlay_count movieViewed_count fbLike_count fbComment_count fbShare_count', {sort:'fb.userName',limit: req.query.limit, skip: req.query.skip}, function(err, result){
                        if(err) logger.error('[db.listOfMemebers]', err);
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

            /**     MiixUGC     **/
            getMiixPlayListInfo : function(req, res){

                //TODO: need to implement

                var miixPlayList = [];

                var miixPlayListInfo = function(userPhotoUrl, movieNo, movieViewed_count, fbLike_count, fbComment_count, fbShare_count, movieMaker, applyDoohPlay_count, doohPlay_count, timesOfPlaying, arr) {
                    arr.push({ 
                        userPhotoUrl: userPhotoUrl,          //酚
                        movieNo: movieNo,                    //紇絪腹
                        movieViewedCount: movieViewed_count, //芠Ω计
                        fbLikeCount: fbLike_count,           //FB苂Ω计
                        fbCommentCount: fbComment_count,     //FB痙ē计
                        fbShareCount: fbShare_count,         //FBだㄉΩ计
                        movieMaker: movieMaker,              //穦嘿
                        applyDoohPlayCount: applyDoohPlay_count, //щ絑Ω计
                        doohPlayCount: doohPlay_count,       //DOOH祅Ω计
                        timesOfPlaying: timesOfPlaying 
                    });
                };

                var next = 0,
                limit = 0;

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

                };

                if ( req.query.limit && req.query.skip ) {
                    FM_LOG("[admin.memberList_get_cb]");
                    FMDB.listOfdocModels( miixPlayListInfos,null,'projectId userPhotoUrl movieNo movieViewed_count fbLike_count fbComment_count fbShare_count movieMaker applyDoohPlay_count doohPlay_count timesOfPlaying', {sort:'movieNo',limit: req.query.limit, skip: req.query.skip}, function(err, result){
                        if(err) logger.error('[db.listOfMemebers]', err);
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
            /**     MiixUGC End     **/

            /**     StoryUGC     **/
            getStoryPlayListInfo : function(req, res){

                //TODO: need to implement

                var storyPlayList = [];

                var storyPlayListInfo = function(movieNo, movieViewed_count, fbLike_count, fbComment_count, fbShare_count, movieMaker, arr) {
                    arr.push({ 
                        movieNo: movieNo,                    //紇絪腹
                        movieViewedCount: movieViewed_count, //芠Ω计
                        fbLikeCount: fbLike_count,           //FB苂Ω计
                        fbCommentCount: fbComment_count,     //FB痙ē计
                        fbShareCount: fbShare_count,         //FBだㄉΩ计
                        movieMaker: movieMaker               //穦嘿
                    });
                };


                var next = 0,
                limit = 0;

                var setStoryPlayList = function(data, set_cb){
                    if(next == limit-1 || limit-1 < 0) {
                        if(next > 0)
                            storyPlayListInfo(data[next].movieNo, data[next].movieViewed_count, data[next].fbLike_count, data[next].fbComment_count, data[next].fbShare_count, data[next].movieMaker, storyPlayList);
                        next = 0;
                        set_cb(null, 'OK');
                    }
                    else {
                        storyPlayListInfo(data[next].movieNo, data[next].movieViewed_count, data[next].fbLike_count, data[next].fbComment_count, data[next].fbShare_count, data[next].movieMaker, storyPlayList);
                        next += 1;
                        setStoryPlayList(data, set_cb);
                    }

                };

                if ( req.query.limit && req.query.skip ) {
                    FM_LOG("[admin.memberList_get_cb]");
                    FMDB.listOfdocModels( storyPlayListInfos,null,'projectId movieNo movieViewed_count fbLike_count fbComment_count fbShare_count movieMaker', {sort:'movieNo',limit: req.query.limit, skip: req.query.skip}, function(err, result){
                        if(err) logger.error('[db.listOfMemebers]', err);
                        if(result){

                            if(req.query.skip < result.length)
                                limit = req.query.limit;
                            else 
                                limit = result.length;
                            
                                setStoryPlayList(result, function(err, docs){
                                    if(err) console.log(err);
                                    else {
                                        res.render( 'table_story_movie', {storyMovieList: storyPlayList} );
                                    }
                                });
                        }
                    });
                }
                else{
                    res.send(400, {error: "Parameters are not correct"});
                }

            },
            /**     StoryUGC End     **/                

            /*    TEST    */


        };//     End of return

    } //    End of Constructor.


    return {
        getInstance: function(){
            if(!uInstance){
                uInstance = constructor();
            }
            return uInstance;
        }
    }; //   End of Return uInstance.
})(); // End of FM.ADMINCACHE

    /*  For TEST. */


    module.exports = FM.ADMINCACHE.getInstance();