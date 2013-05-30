
    
var FM = {};
var DEBUG = true,
    FM_LOG = (DEBUG) ? function(str){ logger.log(str); } : function(str){} ;

FM.VIDEO = (function(){
    var uInstance;
	
    
    function constructor(){
		var FMDB = require('./db.js'),
			memberDB = require('./member.js'),
			youtubeInfo = require('./youtube_mgr.js'),
			videos = FMDB.getDocModel("video");
        
        return {
        /*
         *  Public Members
         */
            getListByLoc: function(locationUID){
                var query = videos.find({});
                query.sort('timestamp', -1).exec(function(err, doc){
                    if(err){
                        logger.log('locationQuery failed: '+err);
                    }else{
                        logger.log('locationQuery '+locationUID+': '+doc);
                    }
                });
            },

            latest: function(latestNum, cb){
                var query = videos.find({});
                query.sort('timestamp', -1),limit(latestNum).exec(cb);
            },

            top: function(topNum, cb){
                var query = videos.find({});
                query.sort('likes', -1).limit(topNum).exec(cb);
            },
            
            getVideoById: function(oid, cb){
                FMDB.readAdocById(videos, oid, cb);
            },
            
            getValueById: function(oid, fields, cb){
                
                FMDB.getValueOf(videos, {"_id":oid}, fields, cb);
            },
            
            getOwnerIdByPid: function(pid, cb){
                videos.findOne({projectId: pid}, 'ownerId._id', function(err, result){
                    if(err){
                        logger.error("[getOwnerIdByPid]", err);
                        cb(err, null);
                    }else if(result){
                        cb(null, result.ownerId._id);
                    }else{
                        cb(null, result);
                    }
                });
            },
            
            getAeIdByPid: function(pid, cb){
                videos.findOne({projectId: pid}, 'aeId', function(err, result){
                    if(err){
                        logger.error("[getAeIdByPid]", err);
                        cb(err, null);
                    }else if(result){
                        cb(null, result.aeId);
                    }else{
                        cb(null, result);
                    }
                });
            },
            
            getValueByProject: function(projectId, fields, cb){
                FMDB.getValueOf(videos, {"projectId":projectId}, fields, cb);
            },
            
            getVideoListById: function(oid, cb){
                videos.find({"ownerId._id":oid}, cb );
            },
            
            getVideoListByFB: function(userID, cb){
                videos.find({"ownerId.userID":userID}, cb );
            },
            
            getVideoListOnFB: function(userID, genre, cb){
                var query = videos.find(null, 'fb_id url.youtube');
                if('function' === typeof (genre)){
                    cb = genre;
                    query.where("ownerId.userID", userID).ne("fb_id", null).sort({createdOn: -1}).exec(cb);
                }else{
                    query.where("ownerId.userID", userID).where("genre", genre).ne("fb_id", null).sort({createdOn: -1}).exec(cb);
                }
            },
            
			getNewVideoListByFB : function(userID, genre, after, cb){
                // Only catch videos which are posted on FB.
                var query = videos.find();
				query.where("ownerId.userID", userID).where("genre", genre).where("createdOn").gte(after).sort({createdOn: -1}).limit(10).exec(cb);
            },
            
            getNewStreetVideoListByFB : function(userID, after, cb){
                var query = videos.find();
				query.where("ownerId.userID", userID).where("genre", "miix_street").ne("fb_id", null).where("createdOn").gte(after).sort({createdOn: -1}).limit(10).exec(cb);
            },
			
            update: function(oid, newdata){
                FMDB.updateAdoc(videos, oid, newdata, function(res){
                    FM_LOG("[Video Update Succeed!] " + JSON.stringify(res) );
                });
            },
			
			updateOne: function(condition, newdata, options, cb){
				FMDB.updateOne(videos, condition, newdata, options, cb);
			},
            
            
            /*  ownerId must be included in vjson. [callback]  */
            addVideo: function(vjson, cb){
                if(vjson.ownerId){
                    videos.count({}, function(err, count){
                        vjson.no = parseInt(count)+1;
                        FMDB.createAdoc(videos, vjson, cb);
                    });
                    
                }else{
                    var err = {error: "ownerId is MUST-HAVE!"};
                    cb(err, null);
                }
            },
            
            getCommentsLikesSharesOnFB: function( v_id, owner_id, fb_id, youtube_url, cb){
                var access_token;
                var async = require("async");
                var likes_count = 0,
                    comments_count = 0,
                    shares_count = 0;	
				var memberDB_fb = require('./member.js');
				
                memberDB_fb.getFBAccessTokenById(owner_id, function(err, fb_auth){
					//console.log(fb_auth);
                    if(err){
                        logger.error("[memberDB.getFBAccessTokenById] ", err);
                        cb(err, null);
                        
                    }else{
                        access_token = fb_auth.fb.auth.accessToken;
                        
                        async.parallel([
                            function(callback){
                                var request = require("request");
                                var qs = {'access_token': access_token, 'fields':'comments,likes'};
                    
                                request({
                                    method: 'GET',
                                    uri: 'https://graph.facebook.com/' + fb_id,
                                    qs: qs,
                                    json: true,
                                    //body: {'batch': JSON.stringify(data),},
                                    
                                }, function(error, response, body){
                                    if(error){
                                        logger.error("[ReqCommentsLikesToFB] ", error);
                                        callback(error, null);
                                        
                                    }else{
                                        //console.log("comments " + body);
										if(body.error) 
											callback(null, {comments: comments_count, likes: likes_count} );
										else {
											comments_count = body.comments.count;
											likes_count = (body.likes) ? body.likes.count : 0;
											
											callback(null, {comments: comments_count, likes: likes_count} );
										}
                                    }
                                });
                            }
                            , function(callback){
                                var request = require("request");
                                //var qs = {'access_token':token, 'fields':'comments,likes'};
                    
                                request({
                                    method: 'GET',
                                    uri: 'https://graph.facebook.com/' + youtube_url,
                                    //qs: qs,
                                    json: true,
                                    //body: {'batch': JSON.stringify(data),},
                                    
                                }, function(error, response, body){
                                    if(error){
                                        logger.error("[ReqCommentsLikesToFB] ", error);
                                        callback(error, null);
                                    }else{
                                        //console.log("shares" + body);
                                        shares_count = (body.shares) ? body.shares : 0;
                                        
                                        callback(null, {shares: shares_count} );
                                    }
                                });
                            }
                        ]
                        
                        , function(err, result){
                            if(err){
                                logger.err("[getCommentsLikesSharesOnFB] ", err);
                                cb(err, null);
                                
                            }else{
                                cb(null, result);
								//cb(null, [{comments: comments_count, likes: likes_count}, {shares: shares_count}]);
                            }
                        });
                    }
                });
            },
            
            /*  For TEST. */
            
            // Only for v1.2 - GL
            getPlayList: function(cb){
                var query = videos.find();
                query.ne("doohTimes.submited_time", null).sort({"doohTimes.submited_time": 1}).exec(cb);
            },
            
            
            nextDoohVideo: function(cb){
                var query = videos.findOneAndUpdate(null, {$unset:{"doohTimes.submited_time": 1}}, {select:{projectId:1}} );
                query.ne("doohTimes.submited_time", null).sort({"doohTimes.submited_time": 1}).limit(1).exec(cb);
            },
            
            _updateCounter: function(cb){
                var query = videos.find({});
                query.sort({createdOn:1}).exec(function(err, result){
                    if(err) return;
                    for(var i in result){
                        videos.findByIdAndUpdate(result[i]._id, {no:parseInt(i)+1}, {select:{no:1}}, cb);
                    }
                });
            },
			
            
            //GZ
			getVideoCountWithGenre: function(videoGenre, cb){
				var condition = { 'genre': videoGenre };
				videos.count(condition, cb);
			},
            
            _GZ_test: function(){
                /*
                this.getVideoCountWithGenre('miix_story', function(err, count) {
                    console.log('count= '+count);
                });
                */
                /*
                var after = new Date(parseInt('1363950956281'));
                var query = videos.find();
				query.exec(function(err, result){
				//query.where("ownerId.userID", '100004619173955').sort({createdOn: -1}).limit(20).exec(function(err, result){
				//query.where("ownerId.userID", '100004619173955').where("genre", 'miix_story').where("createdOn").gte(after).sort({createdOn: -1}).limit(10).exec(function(err, result){
                //this.getNewVideoListByFB('100004619173955', 'miix_story', after, function(err, result){
                    console.dir(result);
                    fs=require('fs');
                    fs.writeFile('result2.txt', result);
                });
                */
                this.getAeIdByPid('greeting-5192f1cac6e16fa00d000006-20130530T082537316Z',function(err, _aeID){
                    console.log('_aeID=%s', _aeID);
                });
            },
            
            
			
			//JF
			getViewCount: function(youtube_url, viewCount_cb){
				var youtube_path = youtube_url.slice(youtube_url.lastIndexOf("/")+1);
				youtubeInfo.getVideoViewCount(youtube_path, function(viewCount, err){
					if(err) viewCount_cb(null, 0);
					else if(viewCount == null) viewCount_cb(null, 0);
					else viewCount_cb(null, viewCount);
				});
			},
			
			getVideoCount: function(_id, videoType, cb){
				var condition = { 'ownerId._id': _id, 'genre': videoType };
				videos.count(condition, cb);
			},
			
			_test: function(){
                var ObjectID = require('mongodb').ObjectID;
                var v_id = ObjectID.createFromHexString("51302b836b8e0e580f000004");
                var owner_id =  ObjectID.createFromHexString("512d849345483ac80d000003");
                var fb_id = "100004712734912_604889539525089";
                var youtube_url = "http://www.youtube.com/embed/CJuffmPIMJ0";
                
                this.getCommentsLikesSharesOnFB( v_id, owner_id, fb_id, youtube_url, function(err, result){
                    if(err){
                        console.log("err: " + JSON.stringify(err));
                    }else{
                        console.log("result: " + JSON.stringify(result));
                    }
                });
				/*
				this.getViewCount('http://www.youtube.com/embed/Y1DdQmx8os0', function(res, err){
					if(res == null) console.log('0');
				});
				*/
            },
        };
    }
    
    return {
        getInstance: function(){
            if(!uInstance){
                uInstance = constructor();
            }
            return uInstance;
        }
    };  // End of Return uInstance
})(); // End of FM.VIDEO;

/*  For TEST. */
//FM.VIDEO.getInstance()._test();
//FM.VIDEO.getInstance()._GZ_test();

module.exports = FM.VIDEO.getInstance();