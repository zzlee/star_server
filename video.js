var FMDB = require('./db.js'),
    memberDB = require('./member.js');
    
var FM = {};

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
                FMDB.readAdocById(oid, cb);
            },
            
            getVideoListById: function(oid, cb){
                videos.find({"ownerId":oid}, cb );
            },
            
            /*  ownerId must be included in vjson. [callback]  */
            addVideo: function(vjson, cb){
                if(vjson["ownerId"]){
                    FMDB.createAdoc(videos, vjson, cb);
                    /*FMDB.createAdoc(videos, vjson, function(err, vdoc){
                        
                          
                        if(vdoc){
                            var vid = vdoc["_id"];
                                
                            memberDB.getProfileOfId(vjson["ownerId"], function(err, profile){
                                profile.video_ids.push(vid);
                                profile.save(function(err, doc){
                                    console.log("update profile: " + doc);
                                });
                            });
                        }
                    });*/
                    console.log("addVideo " + JSON.stringify(vjson));
                    
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