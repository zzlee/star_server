var FMDB = require('./db.js'),
    memberDB = require('./member.js');
    
var FM = {};
var DEBUG = true,
    FM_LOG = (DEBUG) ? function(str){ logger.log(str); } : function(str){} ;

FM.VIDEO = (function(){
    var uInstance;
    
    function constructor(){
        var videos = FMDB.getDocModel("video");
        
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
            
            getValueByProject: function(projectId, fields, cb){
                FMDB.getValueOf(videos, {"projectId":projectId}, fields, cb);
            },
            
            getVideoListById: function(oid, cb){
                videos.find({"ownerId._id":oid}, cb );
            },
            
            getVideoListByFB: function(userID, cb){
                videos.find({"ownerId.userID":userID}, cb );
            },
            
			getNewVideoListByFB : function(userID, genre, after, cb){
                // Only catch videos which are posted on FB.
                var query = videos.find();
				query.where("ownerId.userID", userID).where("genre", genre).ne("fb_id", null).where("createdOn").gte(after).sort({createdOn: -1}).limit(10).exec(cb);
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
            
            /*  For TEST. */
            
            // Only for v1.2 - GL
            getPlayList: function(cb){
                var query = videos.findOneAndUpdate();
                query.ne("doohTimes.submited_time", null).sort({"doohTimes.submited_time": 1}).exec(cb);
            },
            
            
            nextDoohVideo: function(cb){
                var query = videos.findOneAndUpdate(null, {$unset:{"doohTimes.submited_time": 1}}, {select:{projectId:1}} );
                query.ne("doohTimes.submited_time", null).sort({"doohTimes.submited_time": 1}).limit(1).exec(cb);
            },
            
            _test: function(){
                var ObjectID = require('mongodb').ObjectID;
                
                this.getOwnerIdByPid( "greeting-50c99656064d2b8412000005-20130107T091109720Z", function(err, doc){
                    if(err) console.log(JSON.stringify(err));
                    else console.log(JSON.stringify(doc));
                });
            }
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

module.exports = FM.VIDEO.getInstance();