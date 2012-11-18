//  var FM = window.FM || {}; Using in Browser

var DEBUG = true,
    FM_LOG = (DEBUG) ? function(str){ console.log(str); } : function(str){} ;
    
var FM = {};

//  A Singleton of MongoDB
FM.DB = (function(){
    var uInstance = null;
    
    function constructor(){
        // Private members.
        var mongodb = require('mongodb'),
            mongoose = require('mongoose'),
            assert = require('assert'),
            Schema = mongoose.Schema,
            ObjectID = Schema.Types.ObjectId,
            Mixed = Schema.Types.Mixed,
            DB = 'feltmeng',
            connection = connectDB(),
            eduLv = 'elem jrHigh srHigh college university master doctor'.split(' '),
            occupationList = 'gov student edu industry business service'.split(' ');
            evtStatus = 'waiting proved'.split(' ');;
        
        /*  fb: { userID: {type: String},
				  userName: {type: String},
         *          auth: { accessToken: {type: String},
         *                  expiresIn: {type: Number},
         *                  signedRequest: {type: String}
         *          },
         *  }
         *
         */
        
        var MemberSchema = new Schema({
            fb: {type: Mixed},  //  Facebook, Carefull! don't use {type: [Mixed]}
            fullname: {type: String},
            memberID: {type: String},
            password: {type: String},
            mPhone: { num: String, proved: {type: Boolean, default: false} },
            email: {type: String},
            birthday: {type: Number, min:19110101},
            occupation: {type: String, enum: occupationList},
            gender: {type: Boolean},    //  0:Male 1:Female
            education: {type: String, enum: eduLv},
            notification: {type: Boolean, default: true},
            video_ids: {type: [ObjectID]},
            activity_ids: {type: [ObjectID]},
            thumbnail: {type: String}    //  path/filename
        }); //  members collection
        
        var VideoSchema = new Schema({
            fb_id: {type: String},
            title: {type: String},
            description: {type: String},
            url: { youtube: String, tudou: String },  //  Youtube, Tudou
            ownerId: { _id:ObjectID, userID: String },
            locationId: {type: ObjectID},
            projectId: {type: String},  //  AE project ID
            hitRate: {type: Number, min:0},
            comments: {type: Mixed},    //  "data": []
            vote: {type: Number, min:0},
            likes: {type: Number, min:0},
            status: {type: String}
        }); //  videos collection

        var CommentSchema = new Schema({
            fb_id: {type: String},
            owner_id: {type: ObjectID},
            message: {type: String}
        }); //  comments collection
        
        
        var EventSchema = new Schema({
            videoId: {type: ObjectID},
            projectId: {type: String},
            ownerId: { _id:ObjectID, userID: String },
            start: {type: Number, min:1325376000001},   // 1325376000001 2012/01/01 08:00:00
            end: {type: Number, min:1325376000001},
            videoUrl: {type: String},
            location: {type: String},    //location: {type: ObjectID},
            status: {type: String, enum: evtStatus}
        }); //  events collection for schedule
        
              
        var Member = connection.model('Member', MemberSchema, 'member'),
            Video = connection.model('Video', VideoSchema, 'video'),
            Comment = connection.model('Comment', CommentSchema, 'comment'),
            Event = connection.model('Event', EventSchema, 'event');
            
        var dbModels = [];
        dbModels["member"] = Member;
        dbModels["video"] = Video;
        dbModels["comment"] = Comment;
        dbModels["event"] = Event;
        
        var dbSchemas = [];
        dbSchemas["member"] = MemberSchema;
        dbSchemas["video"] = VideoSchema;
        dbSchemas["comment"] = CommentSchema;
        dbSchemas["event"] = EventSchema;
            
        function connectDB(){
                try{
                    mongoose.connect('mongodb://localhost:27017/'+DB);
                    return mongoose.connection;
                }catch(err){
                    console.log('Connect DB failed: '+err);
                }
            };

        return {
        /*  
         *  Public members. In Constructor().
         */
            locatioinQuery: function(locationUID){
                var query = Video.find({});
                query.sort('timestamp', -1).exec(function(err, doc){
                    if(err){
                        console.log('locationQuery failed: '+err);
                    }else{
                        console.log('locationQuery '+locationUID+': '+doc);
                    }
                });
            },

            ownerQuery: function(ownerUID){
                var query = Video.find({});
                query.where('_id', ownerUID).sort('timestamp', -1).exec(function(err, doc){
                    if(err){
                        console.log('ownerQuery failed: '+err);
                    }else{
                        console.log('ownerQuery '+ownerUID.toHexString());
                    }
                });
            },

            latestQuery: function(latestNum){
                var query = Video.find({});
                query.sort('timestamp', -1),limit(latestNum).exec(function(err, doc){
                    if(err){
                        console.log('latestQuery failed: '+err);
                    }else{
                        console.log('latestQuery Latest'+latestNum+': '+doc);
                    }
                });
            },

            rankQuery: function(topNum){
                var query = Video.find({});
                query.sort('hitRate', -1).limit(topNum).exec(function(err, doc){
                    if(err){
                        console.log('rankQuery failed: '+err);
                    }else{
                        console.log('rankQuery TOP'+topNum+': '+doc);
                    }
                });
            },
            
           
            getDocModel2: function(collection){
                switch(collection){
                    case 'member':
                        return Member;
                        break;
                    case 'video':
                        return Video;
                        break;
                    case 'comment':
                        return Comment;
                        break;
                    case 'event':
                        return Event;
                        break;
                    default:
                        throw new error('DB Cannot find this Collection: ' + collection);
                        break;
                }
            },
            
            getDocModel: function(collection){
                return dbModels[collection];
            },

            createAdoc2: function(collection, jsonObj, ownerId){
                if(arguments.length == 1)
                    throw new error('Must have at least 2 arguments.');
                
                var docModel = this.getDocModel(collection);
                var doc = new docModel(jsonObj);
                if('undefined' != typeof(ownerId))    
                    doc.ownerId = ownerId;
                doc.save();
                console.log("Create a Doc: "+doc);
                
            },
            
            /*
             * createAdoc(docModel, jsonObj);
             * 
             */
            createAdoc: function(docModel, jsonObj, callback){
                
                if(arguments.length == 1)
                    throw new error('Must have 2 arguments.');
                
                var doc = new docModel(jsonObj);
                
                if(jsonObj.fb) {
                    FM_LOG("\n[doc.fb markModified]");
                    doc.markModified('fb');
                }
                ('undefined' === typeof callback) ? doc.save() : doc.save(callback);
                
            },

            //  function createAmember(collection, jsonObj){ createAdoc(collection, jsonObj, null); }  //for Member doc without ID neccesary
            readAdocById: function(docModel, docid, cb){
                if(arguments.length != 3){
                    throw new Error('Must have 3 arguments.');
                    
                }else{
                    docModel.findById(docid, cb);
                }
            },
            
            readAdoc: function(docModel, condition, cb){
                if(arguments.length != 3)
                    throw new error('Must have 3 arguments.');
                docModel.findOne(condition, cb);
            },

            updateAdoc: function(docModel, docid, jsonObj){
                console.log("\n updateAdoc " + " fields: " + JSON.stringify(jsonObj));
                docModel.findByIdAndUpdate(docid, jsonObj, function(err, doc){
                    if(err) throw err;
                    if(doc)
                        console.log('updateAdoc succeed. ' + JSON.stringify(doc));
                });
            },
            
            deleteAdoc: function(docModel, docid, cb){
                console.log("Delete a Doc: " + docid);
                docModel.findByIdAndRemove(docid, cb);
            },

            getValueOfById: function(docModel, docid, path, cb){
                var doc = this.readAdocById(docModel, docid, function(err, result){
                    if(err)
                        throw err;
                    else
                        return doc.get(path);
                });
            },
            
            getValueOf: function(docModel, condition, field, cb){
                
                docModel.findOne(condition, field, cb);
            },
            
            
            videoDump: function(){
                var Member = connection.model('Member', MemberSchema, 'member');
                var query = Member.find();
                var ownerId1 = ObjectID,
                    ownerId2 = ObjectID;
               
                query.exec(function(err, doc){
                    if(err){
                        console.log('test failed: '+err);
                    }else{
                        ownerId1 = doc[0]._id;
                        ownerId2 = doc[1]._id;
                        console.log('find(): '+ ownerId1.toHexString()+'\n'+ ownerId2.toHexString());
                        //var date = new Date( parseInt( json._id.slice(0,8), 16 ) * 1000 );
                        var title;
                        for(i=0; i<100; i++){
                            title = "Star-"+i;
                            //var doc = new Video({"title":title});
                            if(i%2 == 0){
                                createAdoc( connection, 'Video', {"title":title}, ownerId1);
                            }else{
                                createAdoc( connection, 'Video', {"title":title}, ownerId2);
                            }
                        }
                    }
                });
            },
            
            test: function(){
                //var docModel = this.getDocModel2("member");
                console.log(dbModels["member"]);
            }
        };  // End of Return
    }   // End of Constructor
    
    return {
        getInstance: function(){
            if(!uInstance){
                uInstance = constructor();
            }
            return uInstance;
        }
    };  //  End of Return
})(); //  End of Singleton

FM.SCHEDULE = (function(){
    var uInstance = null;
    
    function constructor(){
        var FMDB = FM.DB.getInstance();
            events = FMDB.getDocModel("event");
        
        return {
        /*
         * Public
         */
            listOfReservated : function(range, cb){
                var evt,
                    list = [];
                var query = events.find();
                query.or( [ 
                            { start: {$gte: range.start, $lt: range.end} },
                            { end: {$gt: range.start, $lte: range.end} },
                            { $and: [ {start: {$lte: range.start}}, {end: {$gte: range.end}} ] } 
                          ] ).sort({start: 1}).exec(cb);
                
                /* peudo
                 *   if(range.start < evt.start && evt.start < range.end)
                 *       list.push(evt);
                 *   if(range.start < evt.end && evt.end < range.end)
                 *       list.push(evt);
                 *   if(evt.start < range.start && range.end < evt.end)
                 *       list.push(evt);
                 */    
            },
            
            reserve : function(evt){
                FMDB.createAdoc(events, evt);
            }
        };
    } //    End of Constructor
    
    return {
        getInstance: function(){
            if(!uInstance){
                uInstance = constructor();
            }
            return uInstance;
        }
    };
})();

FM.MEMBER = (function(){
    var uInstance = null;
    
    function consctructor(){
        var FMDB = FM.DB.getInstance();
            members = FMDB.getDocModel("member");
        
        return {
        /*
         *  Public Members
         */
            addMember: function(pfjson){
                FMDB.createAdoc(members, pfjson);
            },
            
            deleteMember: function(memberID){
                var field = {"_id":1};
                FMDB.getValueOf(members, {"memberID":memberID}, field, function(err, result){
                    if(err) throw err;
                    FMDB.deleteAdoc(members, result[field]);
                    console.log("deleteMember " + memberID + result[field]);
                });
            },
            
            isValid: function(memberID, pwd){
                var field = {"password":1};
                FMDB.getValueOf(members, {"memberID":memberID}, field, function(err, result){
                    if(err) console.log("" + err);
                    if(pwd === password)
                        return true;
                    return false; 
                });
            },
            
            listOfMembers: function(cb){
                members.find(cb);
            },
            
            getProfile: function(memberID, cb){
                FMDB.readAdoc(members, {"memberID":memberID}, cb)
            },
            
            getVideosOf: function(memberID, cb){
                var field = {"video_ids":1};
                FMDB.getValueOf(members, {"memberID" : memberID}, field, cb);
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



FM.VIDEO = (function(){
    var uInstance;
    
    function constructor(){
        var FMDB = FM.DB.getInstance();
            videos = FMDB.getDocModel("video");
        
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


module.exports = FM.DB.getInstance();
//module.exports = FM.SCHEDULE.getInstance();
//module.exports = FM.MEMBER.getInstance();
//module.exports = FM.VIDEO.getInstance();


function test(){
    /*
    var jsonObj = {"first_name":"Bang"};   
    var ObjectID = require('mongodb').ObjectID;
    var docid = new ObjectID('5024a2f9242a423018000001');
    FM.DB.getInstance().readAdoc('Member', docid, function cb(err, doc){
        console.log('Doc: '+doc);
    });
     */
     
    /* 
    var path = "last_name";
    var field = JSON.parse('{"'+path+'":'+1+'}');
    
    FM.DB.getInstance().getValueOf("member", {"first_name":"Gabriels"}, field, function(err, result){
        if(err)
            throw err;
        
        (result) ? console.log("TEST: " + result[path]) : console.log("TEST: Not Found!");
        
    });*/
    
    /*
    var case1 = {"name":"case1", "start":19, "end":20},
        case2 = {"name":"case2", "start":16, "end":18},
        case3 = {"name":"case3", "start":22, "end":24},
        case4 = {"name":"case4", "start":17, "end":23};
        
    FM.SCHEDULE.getInstance().reserve(case1);
    FM.SCHEDULE.getInstance().reserve(case2);
    FM.SCHEDULE.getInstance().reserve(case3);
    FM.SCHEDULE.getInstance().reserve(case4);
    console.log("TEST DONE!");
    */
    var range = {"start":17, "end":20};
    FM.SCHEDULE.getInstance().listOfReservated(range, function(err, result){
        (err) ? console.log(err) : console.log("LIST: "+result);
    });
}

/*
function main(){
    test();
}
main();
*/


/* User Token
 * AAADdkgZCw4VMBALbOyseWQ4GU2CCfJhONZCOvVdiYAlYMtZApSx0iTwXYhkExINmgjQ59YDHmiZCzlmSMeKSLZAHOyZBZC1mkWwNRYKq5vB7BAC52akxDIu
 */
