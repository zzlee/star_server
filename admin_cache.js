
var FMDB = require('./db.js'),
    ADCDB = require('./admin_cache_db.js'),
    video_mgr = require('./video.js'),
    ObjectID = require('mongodb').ObjectID,
    fb_handler = require('./fb_handler.js'),
	member_mgr = require('./member.js'),
    youtubeInfo = require('./youtube_mgr.js');
    
var FM = {};
var DEBUG = true,
    FM_LOG = (DEBUG) ? function(str){ logger.info(str); } : function(str){} ;

FM.ADMINCACHE = (function(){
    var uInstance = null;
    
    
    function constructor(){
	    var members = FMDB.getDocModel("member");
        var memberListInfos = FMDB.getDocModel("memberListInfo");
        
        return {
        
        /*
         *  Public Members
         */
		 
		 //kaiser start
			getMemberListInfo : function(req, res){

				//TODO: need to implement
	
				var memberList = [];
	
				var memberListInfo = function(fb_id, fb_name, email, mp_number, miix_movie, dooh_play, movie_view, fb_like, fb_comment, fb_share, arr) {
					arr.push({ 
						fb: { userID: fb_id, userName: fb_name },
						//_id: _id,
						email: email, //Email
						mobilePhoneNumber: mp_number, //も诀
						miixMovieCount: miix_movie, //籹紇计
						doohPlayCount: dooh_play, //DOOH祅Ω计
						movieViewedCount: movie_view, //紇芠羆Ω计
						fbLikeCount: fb_like, //FB苂羆计
						fbCommentCount: fb_comment, //FB痙ē羆计
						fbShareCount: fb_share
					});
				}
						console.log("setmemberlist before");


				var async = require('async');
				var next = 0,
					limit;
				var setMemberList = function(data, set_cb){
					var toDo = function(err, result){
						console.log("admincache_setmemberlist");		
						if(next == limit-1) {
							memberListInfo(data[next].fb.userID, data[next].fb.userName, data[next].email, data[next].mPhone.number, result[0], result[1], result[2], result[3][0].totalLikes, result[3][0].totalComments, result[3][1].totalShares, memberList);
							next = 0;
							set_cb(null, 'OK');
						}
						else {
							memberListInfo(data[next].fb.userID, data[next].fb.userName, data[next].email, data[next].mPhone.number, result[0], result[1], result[2], result[3][0].totalLikes, result[3][0].totalComments, result[3][1].totalShares, memberList);
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
			
				}//end set member
				
						console.log("setmemberlist before if");
					if ( req.query.limit && req.query.skip ) {
						FM_LOG("[admin.memberList_get_cb]");
						var cursor = member_mgr.listOfMembers( null, 'fb.userName fb.userID _id email mPhone video_count doohTimes triedDoohTimes', {sort: 'fb.userName',limit: req.query.limit, skip: req.query.skip}, function(err, result){
							if(err) logger.error('[member_mgr.listOfMemebers]', err);
							if(result){
								//FM_LOG(JSON.stringify(result));
								
								//res.render( 'form_member', {memberList: result} );
								
								var testArray =
								[ { fb: { userID: '100001295751468', userName: 'CC Zhu' },
									email: 'ccd@feltmeng.com', //Email
									mobilePhoneNumber: '09282340003', //も诀
									miixMovieCount: 5, //籹紇计
									doohPlayCount: 20, //DOOH祅Ω计
									movieViewedCount: 200, //紇芠羆Ω计
									fbLikeCount: 235, //FB苂羆计
									fbCommentCount: 203, //FB痙ē羆计
									fbShareCount: 35  } //FBだㄉ羆计  
									];
									
								//res.render( 'table_member', {'memberList': testArray} );
								
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
				
			},//end getmember
			

		 //kaiser end
		 
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
                
                FMDB.updateAdoc(memberListInfos, oid, newdata, cb);
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
                var likes_count = 0,
                    comments_count = 0,
                    shares_count = 0;
                    
                videoDB.getVideoListOnFB(userID, function(err, videos){
                    if(err){
                         cb(err, null);
                         logger.error("[videoDB.getVideoListOnFB] ", err);
                         
                    }else if(videos && videos.length > 0){
                        var async = require("async");
                        
                        FM.MEMBER.getInstance().getFBAccessTokenByFBId(userID, function(err, fb_auth){
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
                                                callback(null, {totalLikes: likes_count, totalComments: comments_count});
                                                
                                            }else{
												//console.log(JSON.stringify(result));
                                                for(var i in result){
                                                    //console.log(result[i]);
                                                    comments_count += result[i].comments.count;
                                                    
                                                    // when count=0, there is no likes object.
                                                    likes_count += (result[i].likes) ? result[i].likes.count : 0;
                                                }
												callback(null, {totalLikes: likes_count, totalComments: comments_count} );
                                            }
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
                                                //callback(err, null);
												callback(null, {totalShares: shares_count} );
                                            }else{
                                                for(var i in result){
                                                    shares_count += (result[i].shares) ? result[i].shares: 0;
                                                }
												callback(null, {totalShares: shares_count} );
                                            }
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
                        cb(null, [{totalLikes: likes_count, totalComments: comments_count}, {totalShares: shares_count}]);
                    }
                });
            },
            
            
            isFBTokenValid: function( req, res ){
                FM_LOG("[isFBTokenValid]");
                if(!req.query && !req.query.fb_id && !req.query._id){
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
			
			_JF_test: function(){
				this.getTotalView('50e00d33f04c60040b000006', function(err, res) {
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

module.exports = FM.ADMINCACHE.getInstance();