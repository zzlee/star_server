var FMDB = require('./db.js'),
    memberDB = require('./member.js');
    
var FM = {};
var DEBUG = true,
    FM_LOG = (DEBUG) ? function(str){ console.log(str); } : function(str){} ;

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
                        console.log('locationQuery failed: '+err);
                    }else{
                        console.log('locationQuery '+locationUID+': '+doc);
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
            
            getValueByProject: function(projectId, fields, cb){
                
                FMDB.getValueOf(videos, {"projectId":projectId}, fields, cb);
            },
            
            getVideoListById: function(oid, cb){
                videos.find({"ownerId._id":oid}, cb );
            },
            
            getVideoListByFB: function(userID, cb){
                videos.find({"ownerId.userID":userID}, cb );
            },
            
            update: function(oid, newdata){
                FMDB.updateAdoc(videos, oid, newdata, function(res){
                    FM_LOG("[Video Update Succeed!] " + JSON.stringify(res) );
                });
            },
            
            
            /*  ownerId must be included in vjson. [callback]  */
            addVideo: function(vjson, cb){
                if(vjson.ownerId){
                    FMDB.createAdoc(videos, vjson, cb);
                }else{
                    throw new Error("Video_doc must include 'ownerId'!");
                }
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

module.exports = FM.VIDEO.getInstance();