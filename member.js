var FMDB = require('./db.js'),
    videoDB = require('./video.js'),
    ObjectID = require('mongodb').ObjectID,
    fb_handler = require('./fb_handler.js'),
    youtubeInfo = require('./youtube_mgr.js');
    
var FM = {};
var DEBUG = true,
    FM_LOG = (DEBUG) ? function(str){ logger.info(str); } : function(str){} ;

FM.MEMBER = (function(){
    var uInstance = null;
    
    
    function constructor(){
        var members = FMDB.getDocModel("member");
        
        return {
        
        /*
         *  Public Members
         */
            addMember: function(pfjson, callback){
                FMDB.createAdoc(members, pfjson, callback);
            },
            
            deleteMember: function(memberID){
                var field = "_id";
                FMDB.getValueOf(members, {"memberID":memberID}, field, function(err, result){
                    if(err) throw err;
                    FMDB.deleteAdoc(members, result[field]);
                    logger.info("deleteMember " + memberID + result[field]);
                });
            },
            
            updateMember: function(oid, newdata, cb){
                
                FMDB.updateAdoc(members, oid, newdata, cb);
            },
            
            isValid: function(memberID, cb){
               
                var field = { "password": 1,
                              "_id": 1
                            };
                FMDB.getValueOf(members, {"memberID":memberID}, field, cb);
            },
            
            authenticate: function(_id, code, cb){
                var condition = {'_id': _id, 'mPhone.code': code};
                FMDB.updateOne(members, condition, {'mPhone.verified': true, 'mPhone.code': null}, {select: 'mPhone.number'}, cb)
            },
            
            isFBValid: function(userID, cb){
                
                var field = { "_id":1, "fb": 1, "deviceToken":1, "mPhone":1 };
                FMDB.getValueOf(members, {"fb.userID":userID}, field, cb);
            },
            
			getDeviceTokenById: function(oid, cb){
				var field = {"deviceToken": 1};
                FMDB.getValueOf(members, {"_id":oid}, field, cb);
			},
			
            getFBAccessTokenByFBId: function(userID, cb){
            
                var field = {"fb.auth": 1, "fb.userName":1 };
                FMDB.getValueOf(members, {"fb.userID":userID}, field, cb);
            },
            
            getFBAccessTokenById: function(oid, cb){
            
                var field = {"fb.userID":1, "fb.auth": 1, "fb.userName": 1};
                FMDB.getValueOf(members, {"_id":oid}, field, cb);
            },
            
            listOfMembers: function(condition, fields, options, cb){
                members.find(condition, fields, options, cb);
            },
            
            getObjectId: function(memberID, cb){
                var field = {"_id":1};
                FMDB.getValueOf(members, {"memberID" : memberID}, field, cb);
            },
            
            getProfile: function(memberID, cb){
                FMDB.readAdoc(members, {"memberID":memberID}, cb);
            },
            
            getProfileById: function(oid, cb){
                FMDB.readAdocById(members, oid, cb);
            },
            
            getUserNameAndID: function(user_id, cb){
                //var oid = ObjectID.createFromHexString(user_id);
				var oid = null;
				if('string' === typeof(user_id))
					oid = ObjectID.createFromHexString(user_id);
				else
					oid = user_id;
					
                members.findById(oid, "fb.userName fb.userID", function(err, result){
					if(err){
						logger.error("[members.findById]", err);
						cb(err, null);
					}else{
						cb(err, result);
					}
				});
            },
            
            getVideosOf: function(memberID, cb){
                var field = {"video_ids":1};
                FMDB.getValueOf(members, {"memberID" : memberID}, field, cb);
            },
            
            getVideosByOID: function(oid, cb){
                videoDB.getVideoListById(oid, cb);
                /*
                FMDB.getValueOfById(members, oid, field, function(err, result){
                    var length = result["video_ids"].length;
                    videoDB.getVideoById(vid, function(err, vdoc){
                        vUrls.push(vdoc.url.youtube);
                    });
                });*/
            },
            
            getTotalCommentsLikesSharesOnFB: function(userID, cb){
                var that = this;
                var likes_count = 0,
                    comments_count = 0,
                    shares_count = 0;
                    
                videoDB.getVideoListOnFB(userID, function(err, videos){
                    if(err){
                         cb(err, null);
                         logger.error("[videoDB.getVideoListOnFB] ", err);
                         
                    }else if(videos && videos.length > 0){
                        var async = require("async");
                        
                        that.getFBAccessTokenByFBId(userID, function(err, fb_auth){
                            if(err){
                                logger.error("[getTotalLikesOnFB] ", err);
                                cb(err, null);
                                
                            }else if(fb_auth){
                                var access_token = fb_auth.fb.auth.accessToken;
                                var async = require("async");
                                
                                
                                async.parallel([
                                    function(callback){
                                        var batch = [];
                                        
                                        for(var idx in videos){
                                            var relative_url = videos[idx].fb_id + "?fields=comments,likes";
                                            batch.push( {"method": "GET", "relative_url": relative_url} );
                                        }
                                        
                                        fb_handler.batchRequestToFB(access_token, null, batch, function(err, result){
                                            if(err){
                                                callback(err, null);
                                                
                                            }else{
                                                for(var i in result){
                                                    //console.log(result[i]);
                                                    comments_count += result[i].comments.count;
                                                    
                                                    // when count=0, there is no likes object.
                                                    likes_count += (result[i].likes) ? result[i].likes.count : 0;
                                                }
                                            }
                                            
                                            callback(null, {totalLikes: likes_count, totalComments: comments_count} );
                                        });
                                    },
                                    function(callback){
                                        var batch = [];
                                        
                                        for(var idx in videos){
                                            var relative_url = videos[idx].url.youtube;
                                            batch.push( {"method": "GET", "relative_url": relative_url} );
                                        }
                                        
                                        fb_handler.batchRequestToFB(access_token, null, batch, function(err, result){
                                            if(err){
                                                callback(err, null);
                                            }else{
                                                for(var i in result){
                                                    shares_count += (result[i].shares) ? result[i].shares: 0;
                                                }
                                            }
                                            
                                            callback(null, {totalShares: shares_count} );
                                        });
                                    }
                                ]
                                , function(err, result){
                                    if(err){
                                        cb(err, null);
                                    }else{
                                        cb(null, result);
                                    }
                                });
                            }
                        });
                        
                        
                    }else{
                        cb(null, {count: 0});
                    }
                });
            },
            
            
            isFBTokenValid: function( req, res ){
                FM_LOG("[isFBTokenValid]");
                if(!req.query && !req.query.fb_id){
                    res.send({error: "Bad Request"});
                    return;
                }
                
                var oid = ObjectID.createFromHexString(req.query._id);
                var fb_id = req.query.fb_id;
                var user_token = null;
                var expiresIn = 0;
                
                // Do not use "this" here, it's in differenct closure since "async callback".
                FM.MEMBER.getInstance().getFBAccessTokenByFBId( fb_id, function(err, result){
                    if(err){
                        res.send({error: "Internal Server Error"});
                        
                    }else{
                        user_token = result.fb.auth.accessToken;
                        var is_valid = null;
                        //console.log("getFBAccessTokenByFBId" + JSON.stringify(result));
                        
                        fb_handler.isTokenValid(user_token, function(err, result){
                            if(err){
                                res.send({error: err});
                                
                            }else if(result){
                                expiresIn = result.expires_at;
                                is_valid = result.is_valid;
                                
                                if(expiresIn*1000 - Date.now() < 15*864000*1000){
                                
                                    fb_handler.extendToken(user_token, function(err, result){
                                        if(err){
                                            res.send({message: is_valid, });
                                        }else{
                                            FM.MEMBER.getInstance().updateMember(oid, {"fb.auth": result.data}, function(err, result){
                                                if(err)
                                                    logger.error("[updateMember] ", err);
                                                else
                                                    FM_LOG("[updateMember]", result);
                                            });
                                            
                                            res.send({message: is_valid, access_token: result.data.accessToken});
                                        }
                                    });
                                }else{
                                    res.send({message: is_valid});
                                }
                                
                            }else{
                                res.send({message: result.is_valid});
                            }
                        });
                    }
                });
            },
            
            
            
            
            /*    TEST    */
            _test: function(){
                var oid = ObjectID.createFromHexString("512d8df5989cfc2403000002");
                this.updateMember( oid, {"fb.userName": "Felt Meng", "fb.userID":"100004840958721"
                , "fb.auth.accessToken":"AAABqPdYntP0BADKwGxVqhtQCaWm3dIJtuzPtWZA2KMRVbuzWqP0TmMQlxZAOwYscjwyv4131iWE0CM9UjIO8E6ZAkvMNmblXj18rLi4EAZDZD"
                , "fb.auth.expiresIn":"0"
                }, function(err, result){
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
				videoDB.getVideoCount(_id, "story", function(err, result){
					var condition = {'_id': _id};
					FMDB.updateOne(members, condition, {'doohTimes': result}, null, cb);
				});
			},
			
			getTotalView: function(_id, totalView_cb){
				var videos = FMDB.getDocModel("video"),
					async = require('async');
				var condition = {'ownerId._id': _id};
				videos.find(condition, {}, function(err, result){
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
								videoDB.getViewCount(result[i].url.youtube, callback);
							}
						);
						if(i == result.length-1) asyncStart();
					}
				});
			},
			
			_JF_test: function(){
				var v_id = ObjectID.createFromHexString("50c99348064d2b8412000001");
				this.getTotalView(v_id, function(err, res) {
					console.log(res);
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
//FM.MEMBER.getInstance()._test();
//FM.MEMBER.getInstance()._JF_test();
//FM.MEMBER.getInstance()._GZ_test();

module.exports = FM.MEMBER.getInstance();