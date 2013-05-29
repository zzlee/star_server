
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
						if(next < result.length) {
						//	memberListInfo(data[next].fb.userID, data[next].fb.userName, data[next].email, data[next].mPhone.number, result[0], result[1], result[2], result[3][0].totalLikes, result[3][0].totalComments, result[3][1].totalShares, memberList);
						//	next = 0;
						//	set_cb(null, 'OK');
						//}
						//else {
							//update mongoDB
							
							//
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