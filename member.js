var FMDB = require('./db.js'),
    videoDB = require('./video.js');
    
var FM = {};
var DEBUG = true,
    FM_LOG = (DEBUG) ? function(str){ console.log(str); } : function(str){} ;

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
                    console.log("deleteMember " + memberID + result[field]);
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
            
            isFBValid: function(userID, cb){
                
                var field = { "_id":1, "fb": 1, "deviceToken":1 };
                FMDB.getValueOf(members, {"fb.userID":userID}, field, cb);
            },
            
			getDeviceTokenById: function(oid, cb){
				var field = {"deviceToken": 1};
                FMDB.getValueOf(members, {"_id":oid}, field, cb);
			},
			
            getFBAccessTokenByFBId: function(userID, cb){
            
                var field = {"fb.auth": 1};
                FMDB.getValueOf(members, {"fb.userID":userID}, field, cb);
            },
            
            getFBAccessTokenById: function(oid, cb){
            
                var field = {"fb.userID":1, "fb.auth": 1};
                FMDB.getValueOf(members, {"_id":oid}, field, cb);
            },
            
            listOfMembers: function(cb){
                members.find(cb);
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
            }
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

module.exports = FM.MEMBER.getInstance();