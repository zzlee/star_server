//  var FM = window.FM || {}; Using in Browser

var DEBUG = true,
    FM_LOG = (DEBUG) ? function(str){ logger.log(str); } : function(str){} ;
    
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
            DB = 'admincache',
            connection = connectDB(),
            eduLv = 'elem jrHigh srHigh college university master doctor'.split(' '),
            occupationList = 'gov student edu industry business service'.split(' ');
            evtStatus = 'waiting proved'.split(' ');
			videoStatus = 'good soso bad waiting none'.split(' ');
            videoGenre = 'miix miix_street miix_story'.split(' ');
        
		/****************** DB Schema ******************/
		
        /*  fb: { userID: {type: String},
				  userName: {type: String},
         *          auth: { accessToken: {type: String},
         *                  expiresIn: {type: Number},
         *                  signedRequest: {type: String}
         *          },
         *  }
         *
         */
		 
		 //kaiser start **************
        var MemberListInfoSchema = new Schema({
            fb: {type: Mixed},  //  Facebook, Carefull! don't use {type: [Mixed]}
            miixMovieVideo_count: {type: Number, min: 0, default: 0},                            //籹紇计
			doohPlay_count: {type: Number, min: 0, default: 0},                                  //DOOH祅Ω计
			movieViewed_count: {type: Number, min: 0, default: 0},                               //紇芠羆Ω计
			fbLike_count: {type: Number, min: 0, default: 0},                                    //FB苂羆计
			fbComment_count: {type: Number, min: 0, default: 0},                                 //FB痙ē羆计
			fbShare_count: {type: Number, min: 0, default: 0}                                    //FBだㄉΩ计
			
        }); //  memberListInfo collection
		
        var MiixPlayListInfoSchema = new Schema({
		    fb: {type: Mixed},  //  Facebook, Carefull! don't use {type: [Mixed]}
			movieViewed_count: {type: Number, min: 0, default: 0},   //芠Ω计
			fbLike_count: {type: Number, min: 0, default: 0},        //FB苂Ω计
			fbComment_count: {type: Number, min: 0, default: 0},     //FB痙ē计
			fbShare_count: {type: Number, min: 0, default: 0},       //FBだㄉΩ计
			applyDoohPlay_count: {type: Number, min: 0, default: 0}, //щ絑Ω计
			doohPlay_count: {type: Number, min: 0, default: 0}       //DOOH祅Ω计
 			
        }); //  miixPlayListInfo collection
		
		var StoryPlayListInfoSchema = new Schema({
		    fb: {type: Mixed},  //  Facebook, Carefull! don't use {type: [Mixed]}		
			movieViewed_count: {type: Number, min: 0, default: 0},   //芠Ω计
			fbLike_count: {type: Number, min: 0, default: 0},        //FB苂Ω计
			fbComment_count: {type: Number, min: 0, default: 0},     //FB痙ē计
			fbShare_count: {type: Number, min: 0, default: 0}        //FBだㄉΩ计
 			
        }); //  storyPlayListInfo collection
		
		 //kaiser end ***************
		 
		 
        var MemberSchema = new Schema({
            fb: {type: Mixed},  //  Facebook, Carefull! don't use {type: [Mixed]}
            fullname: {type: String},
            memberID: {type: String},
            password: {type: String},
			deviceToken: {type: Mixed},
            mPhone: { number: String, verified: {type: Boolean, default: false}, code: String },
            email: {type: String, default: 'xyz@feltmeng.com'},
            birthday: {type: Number, min:19110101},
            occupation: {type: String, enum: occupationList},
            gender: {type: Boolean},    //  0:Male 1:Female
            education: {type: String, enum: eduLv},
            notification: {type: Boolean, default: true},
            video_ids: {type: [ObjectID]},
            activity_ids: {type: [ObjectID]},
            video_count: {type: Number, min: 0, default: 0},
            thumbnail: {type: String},    //  path/to/filename
			doohTimes: {type: Number, min: 0, default: 0}
			
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
            vote: {type: Number, default: 0, min:0},
            likes: {type: Number, default: 0, min:0},
            status: {type: String, enum: videoStatus, default: 'none'},
			createdOn: {type: Date, default: Date.now},
			doohTimes: { times: {type: Number, default: 0, min: 0}, event: [ObjectID], submited_time: Date},
			playedTimes: {type: Number, min: 0},
			review: {type: Number},
			vip: {type: Boolean, default: false},
            genre: {type: String, enum: videoGenre, default: 'miix'},
            no: {type: Number},
            aeId: {type: String},
			triedDoohTimes: {type: Number, min: 0, default: 0},	//JF
			doohPlayedTimes: {type: Number, min: 0, default: 0},	//JF
			timesOfPlaying: {type: Number}		//JF
        }); //  videos collection
        var CommentSchema = new Schema({
            fb_id: {type: String},
            owner_id: {type: ObjectID},
            message: {type: String}
        }); //  comments collection
        
        
        var EventSchema = new Schema({
            video: { _id: ObjectID,
                     projectId: String,
                     url: String
                   },
            ownerId: { _id: ObjectID, userID: String },
            dooh: {client: String, location: String},
            timeslot: { start: Date, end: Date, sequence: Number, duration: String  },
            status: {type: String, enum: evtStatus}
        }); //  events collection for schedule
        
        var ProgramSchema = new Schema({
            dooh: {id: String, location: String},
            program: [{
                mode: String,
                day: Number,
                date: String,
                start_date: String,
                end_date: String,
                start: String,
                end: String,
                sequence: Number,
                duration: String,
            }]
        });
        
        var AdminSchema = new Schema({
            id: {type: String},
            password: {type: String}
        });
        
        
		var AnalysisSchema = new Schema({
			time: {type: Date},
			user_id: {type: ObjectID},
			userName: {type: String},
			fb_id: {type: String},
			action: {type: String},
			platform: {type: String},
			os_version: {type: String}
		}); 
				
        /****************** End of DB Schema ******************/
		
        var Member = connection.model('Member', MemberSchema, 'member'),
            Video = connection.model('Video', VideoSchema, 'video'),
            Comment = connection.model('Comment', CommentSchema, 'comment'),
            Event = connection.model('Event', EventSchema, 'event'),
            Program = connection.model('Program', ProgramSchema, 'program'),
            Admin = connection.model('Admin', AdminSchema, 'admin'),
			Analysis = connection.model('Analysis', AnalysisSchema, 'analysis'),		
			MemberListInfo = connection.model('MemberListInfo', MemberListInfoSchema, 'memberListInfo'),
			MiixPlayListInfo = connection.model('MiixPlayListInfo', MiixPlayListInfoSchema, 'miixPlayListInfo'),
			StoryPlayListInfo = connection.model('StoryPlayListInfo', StoryPlayListInfoSchema, 'storyPlayListInfo');
            
        var dbModels = [];
        dbModels["member"] = Member;
        dbModels["video"] = Video;
        dbModels["comment"] = Comment;
        dbModels["event"] = Event;
        dbModels["program"] = Program;
        dbModels["admin"] = Admin;
		dbModels["analysis"] = Analysis;
        dbModels["memberListInfo"] = MemberListInfo;//kaiser
        dbModels["miixPlayListInfo"] = MiixPlayListInfo;
		dbModels["storyPlayListInfo"] = StoryPlayListInfo;		
        
        var dbSchemas = [];
        dbSchemas["member"] = MemberSchema;
        dbSchemas["video"] = VideoSchema;
        dbSchemas["comment"] = CommentSchema;
        dbSchemas["event"] = EventSchema;
        dbSchemas['program'] = ProgramSchema;
        dbSchemas["admin"] = AdminSchema;
		dbSchemas["analysis"] = AnalysisSchema;
        dbSchemas['memberListInfo'] = MemberListInfoSchema;
        dbSchemas["miixPlayListInfo"] = MiixPlayListInfoSchema;
		dbSchemas["storyPlayListInfo"] = StoryPlayListInfoSchema;		
            
        function connectDB(){
                try{
                    mongoose.connect('mongodb://localhost:27017/'+DB);
                    return mongoose.connection;
                }catch(err){
                 //   logger.info('Connect DB failed: '+err);
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
                        logger.info('locationQuery failed: '+err);
                    }else{
                        logger.info('locationQuery '+locationUID+': '+doc);
                    }
                });
            },

            ownerQuery: function(ownerUID){
                var query = Video.find({});
                query.where('_id', ownerUID).sort('timestamp', -1).exec(function(err, doc){
                    if(err){
                        logger.info('ownerQuery failed: '+err);
                    }else{
                        logger.info('ownerQuery '+ownerUID.toHexString());
                    }
                });
            },

            latestQuery: function(latestNum){
                var query = Video.find({});
                query.sort('timestamp', -1),limit(latestNum).exec(function(err, doc){
                    if(err){
                        logger.info('latestQuery failed: '+err);
                    }else{
                        logger.info('latestQuery Latest'+latestNum+': '+doc);
                    }
                });
            },

            rankQuery: function(topNum){
                var query = Video.find({});
                query.sort('hitRate', -1).limit(topNum).exec(function(err, doc){
                    if(err){
                        logger.info('rankQuery failed: '+err);
                    }else{
                        logger.info('rankQuery TOP'+topNum+': '+doc);
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
                    case 'memberListInfo'://kaiser
                        return MemberListInfo;
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
                logger.info("Create a Doc: "+doc);
                
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

            updateAdoc: function(docModel, docid, jsonObj, cb){
                //logger.info("\n updateAdoc " + " fields: " + JSON.stringify(jsonObj));
                docModel.findByIdAndUpdate(docid, {$set: jsonObj}, cb);
            },
            
			updateOne: function(docModel, condition, jsonObj, options, cb){
				FM_LOG("\n[updateOne]");
				docModel.findOneAndUpdate(condition, {$set: jsonObj}, options, cb);
			},
			
            deleteAdoc: function(docModel, docid, cb){
                logger.info("Delete a Doc: " + docid);
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
                        logger.info('test failed: '+err);
                    }else{
                        ownerId1 = doc[0]._id;
                        ownerId2 = doc[1]._id;
                        logger.info('find(): '+ ownerId1.toHexString()+'\n'+ ownerId2.toHexString());
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
                logger.info(dbModels["member"]);
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
                    logger.info("deleteMember " + memberID + result[field]);
                });
            },
            
            isValid: function(memberID, pwd){
                var field = {"password":1};
                FMDB.getValueOf(members, {"memberID":memberID}, field, function(err, result){
                    if(err) logger.error("" + err);
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
                       logger.error('locationQuery failed: '+err);
                    }else{
                        logger.info('locationQuery '+locationUID+': '+doc);
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


//module.exports = FM.DB.getInstance();






/* User Token
 * AAADdkgZCw4VMBALbOyseWQ4GU2CCfJhONZCOvVdiYAlYMtZApSx0iTwXYhkExINmgjQ59YDHmiZCzlmSMeKSLZAHOyZBZC1mkWwNRYKq5vB7BAC52akxDIu
 */
