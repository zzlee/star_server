﻿//  var FM = window.FM || {}; Using in Browser

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
            DB = 'feltmeng',
            connection = connectDB(),
            eduLv = 'elem jrHigh srHigh college university master doctor'.split(' '),
            occupationList = 'gov student edu industry business service'.split(' '),
            evtStatus = 'waiting proved'.split(' '), //DEPRECATED, not used in v1.2 or later
            UGCStatus = 'good soso bad waiting none'.split(' '),
            UGCGenre = 'miix miix_story miix_story_raw miix_image miix_image_live_photo'.split(' '),
                //miix: "Miix Video", generated by combining user content and template video  
                //miix_story: "Story MV", generated by combining Miix Video and Street Video
                //miix_story_raw: "Live record video", captured by record DOOH playing video
                //miix_street: "Live video" or "street video" captured by shooting DOOH playing Miix video. The enum "miix_street" is DEPRECATED and is NOT used by Miix apps so far
                //miix_image: "Miix Image", generated by combining user content and template image 
                //miix_image_live_photo: photo of shooting DOOH playing Miix image
            ugcContentGenre = 'miix_it cultural_and_creative mood check_in'.split(' '),
                //miix_it: a.k.a.影像合成
                //cultural_and_creative: a.k.a. 文創
                //mood: a.k.a. 心情
                //check_in: a.k.a. 打卡
            questionGenre = 'account publish sign_in others'.split(' '),
            
            programTimeSlotType = 'UGC padding'.split(' '),
            programTimeSlotContnetType = 'file web_page media_item'.split(' '),
                //file
                //web_page
                //media_item: the media item that has already stored in Media of Scala's Content Manager
            programTimeSlotState = 'not_confirmed confirmed'.split(' '),
            liveContentState = 'not_checked correct source_not_played not_generated incorrect bad_exposure other_fail'.split(' '),
            appGenre = 'ondascreen wowtaipeiarena'.split(' '),
            
            adminRole = 'SUPER_ADMINISTRATOR FELTMENG_ADMINISTRATOR FELTMENG_DEMO OPERATOR'.split(' '),
            
            videoStatus = 'good soso bad waiting none'.split(' '), //DEPRECATE, keep for reference
            videoGenre = 'miix miix_street miix_story'.split(' '); //DEPRECATE, keep for reference 
            //programTimeSlotStatus = 'waiting proved'.split(' ');
        
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
            ugc_ids: {type: [ObjectID]},
            activity_ids: {type: [ObjectID]},
            ugc_count: {type: Number, min: 0, default: 0},
            thumbnail: {type: String},    //  path/to/filename
			doohTimes: {type: Number, min: 0, default: 0},
			app: {type: String, enum: appGenre, default: 'ondascreen'}
        }); //  members collection
        
      //DEPRECATED - keep for now for reference
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
        
        var userContentSchema = new Schema({
            id: {type: String}, 
            type: {type: String}, 
            content: {type: String}
        });
        
        var UGCSchema = new Schema({
            fb_id: {type: String}, //ID of the corresponding FB feed 
            title: {type: String},
            description: {type: String},
            url: { youtube: String, tudou: String, s3: String },  //  Youtube, Tudou
            doohPreviewUrl: {type: String}, 
            userRawContent: [userContentSchema], //content is either the URL of S3 storing user's image/video file or the text content 
            ownerId: { _id:ObjectID, userID: String, fbUserId: String }, //userID is used to be owner's fb id, and is now DEPRECATED in Miix 2.0
            locationId: {type: ObjectID},
            projectId: {type: String},  // project ID which is unique to each AE rendering
            hitRate: {type: Number, min:0},
            comments: {type: Mixed},    //  "data": []
            vote: {type: Number, default: 0, min:0},
            likes: {type: Number, default: 0, min:0},
            status: {type: String, enum: UGCStatus, default: 'none'},
            createdOn: {type: Date, default: Date.now},
            doohTimes: { times: {type: Number, default: 0, min: 0}, event: [ObjectID], submited_time: Date},
            playedTimes: {type: Number, min: 0},
            review: {type: Number},
            vip: {type: Boolean, default: false},
            genre: {type: String, enum: UGCGenre, default: 'miix'},
            contentGenre: {type: String, enum: ugcContentGenre}, //Is normally the id of main template that this UGC uses
            contentSubGenre: {type: String}, //Is normally the id of sub template that this UGC uses
            no: {type: Number}, //Unique serial number shown to user  
            aeId: {type: String}, //ID of AE Server who renders this UGC
            mediaType: {type: String},
            fileExtension: {type: String},
            triedDoohTimes: {type: Number, min: 0, default: 0}, //JF
            doohPlayedTimes: {type: Number, min: 0, default: 0},    //JF
            timesOfPlaying: {type: Number},     //JF
            mustPlay: {type: Boolean, default: false},
            allUserContentExist: {type: Boolean, default: false},
            rating: {type: String},//range A~E      kaiser
            fb_postId: [{
                postId: String,
            }],
            highlight: {type: Boolean, default: false},
            hot: {type: Boolean, default: false},
            fbProfilePicture: {type: String},
            vip: {type: Boolean, default: false}
        }); //  UGC collection
        
        var CommentSchema = new Schema({
            fb_id: {type: String},
            owner_id: {type: ObjectID},
            message: {type: String}
        }); //  comments collection
        
        //DEPRECATED - wasn't used in v1.2 or later
        var EventSchema = new Schema({
            video: { _id: ObjectID,
                     projectId: String,
                     url: String
                   },
            ownerId: { _id: ObjectID, userID: String },
            dooh: {client: String, location: String},
            timeslot: { start: Date, end: Date, sequence: Number, duration: String  },
            status: {type: String, enum: evtStatus} //TODO: may not need
        }); //  events collection for schedule
        
        //DEPRECATED - wasn't used in v1.2 or later
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
        
        var ProgramTimeSlotSchema = new Schema({
            content: {type: Mixed},
            contentType: {type: String, enum: programTimeSlotContnetType, default: 'file'}, //file or web_page
            dooh: {type: String},
            timeslot: { 
                start: Number,  //milliseconds since midnight Jan 1, 1970
                end: Number, //milliseconds since midnight Jan 1, 1970
                playDuration: Number,  //milliseconds.  This value is normally used by image or web content
                startHour: Number //0~23
                },
            timeStamp: {type: String},
            //status: {type: String, enum: programTimeSlotStatus}
            type: {type: String, enum: programTimeSlotType}, //UGC or padding contnet
            session: {type: String}, //The id indicating the session of creating program time slot
            planner: {type: String}, //The id of planner who plans this session of creating program timeslots
            state: {type: String, enum: programTimeSlotState, default: 'not_confirmed'}, //The state of the program timeslot
            contentGenre: {type: String, enum: ugcContentGenre},  //miix_it, cultural_and_creative, mood, or check_in
            canBeFoundInPlayerLog: {type: String},
            liveState: {type: String, enum: liveContentState, default: 'not_checked'},
            upload: {type: Boolean, default: false}
        }); 
        
        var CandidateUgcCacheSchema = new Schema({
            sessionId: {type: String},
            index: {type: Number},
            candidateUgc: {type: Mixed}
        });
        
        var AdminSchema = new Schema({
            id: {type: String},
            password: {type: String},
            role: {type: String, enume: adminRole}
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

        //kaiser start **************
        var MemberListInfoSchema = new Schema({
            fb: {type: Mixed},  //  Facebook, Carefull! don't use {type: [Mixed]}
            email: {type: String, default: 'xyz@feltmeng.com'},
            mPhone: {type: String},
            miixMovieVideo_count: {type: Number, min: 0, default: 0}, //已製作影片數
            doohPlay_count: {type: Number, min: 0, default: 0},       //DOOH刊登次數
            movieViewed_count: {type: Number, min: 0, default: 0},    //影片觀看總次數
            fbLike_count: {type: Number, min: 0, default: 0},         //FB讚總數
            fbComment_count: {type: Number, min: 0, default: 0},      //FB留言總數
            fbShare_count: {type: Number, min: 0, default: 0},         //FB分享次數
            app: {type: String, enum: appGenre, default: 'ondascreen'},
            hot: {type: Boolean, default: false},
            shine: {type: Boolean, default: true},
            ownerId: {_id: ObjectID}
        }); //  memberListInfo collection
        
        var MiixPlayListInfoSchema = new Schema({
            projectId: {type: String},                                //  AE project ID
            userPhotoUrl: {type: String},                             //素材照片
            movieNo: {type: Number},                                  //影片編號
            movieViewed_count: {type: Number, min: 0, default: 0},    //影片觀看總次數
            fbLike_count: {type: Number, min: 0, default: 0},         //FB讚次數
            fbComment_count: {type: Number, min: 0, default: 0},      //FB留言數
            fbShare_count: {type: Number, min: 0, default: 0},        //FB分享次數
            movieMaker: {type: String},                               //會員名稱
            applyDoohPlay_count: {type: Number, min: 0, default: 0},  //投稿次數
            doohPlay_count: {type: Number, min: 0, default: 0},       //DOOH刊登次數
            timesOfPlaying: {type: Number},
            createdOn: {type: Date},
            userContentType:{type: String} 
            
        }); //  miixPlayListInfo collection
        
        var StoryPlayListInfoSchema = new Schema({
            projectId: {type: String},                                //  AE project ID
            movieNo: {type: Number},                                  //影片編號
            movieViewed_count: {type: Number, min: 0, default: 0},    //觀看次數
            fbLike_count: {type: Number, min: 0, default: 0},         //FB讚次數
            fbComment_count: {type: Number, min: 0, default: 0},      //FB留言數
            fbShare_count: {type: Number, min: 0, default: 0},        //FB分享次數
            movieMaker: {type: String},                               //會員名稱
            createdOn: {type: Date}
            
        }); //  storyPlayListInfo collection
        
         //kaiser end ***************		
        var CustomerServiceItemSchema = new Schema({
            fb_id: {type: String},
            fb_userName: {type: String},
            ownerId: { _id:ObjectID, userID: String },
            no: {type: Number},
            genre: {type: String, enum: questionGenre},//account publish sign_in others
            reply: {type: Boolean, default:false },
            phoneVersion: { type: String },
            question: String,
            questionTime: {type: Date, default: Date.now},
            answer: String,
            answerTime: Date,                                
            remarks: {type: String}
        }); //   customerService collection
        
        var SessionItemSchema = new Schema({
            dooh: {type: String},
            sessionId: {type: String},
            intervalOfSelectingUGC: {
                start: Number,
                end: Number,
            },
            intervalOfPlanningDoohProgrames: {
                start: Number,
                end: Number,
            },
            programSequence: [],
            pushProgramsTime: {type: Date}
        }); //   sessionItem collection
        
        var UserLiveContentSchema = new Schema({
            title: {type: String},
            description: {type: String},
            // url: { youtube: String, tudou: String, s3: String , longPhoto: String, highlight: String},  //  Youtube, Tudou  //highlight: for highlight only.
            url: { youtube: String, tudou: String, s3: String , longPhoto: String, livePhotos: {type: Mixed} },  //  Youtube, Tudou
            ownerId: { _id:ObjectID, userID: String, fbUserId: String }, //userID is used to be owner's fb id, and is now DEPRECATED in Miix 2.0
            projectId: {type: String},  // project ID which is unique to each AE rendering
            createdOn: {type: Date, default: Date.now},
            genre: {type: String, enum: UGCGenre},
            contentGenre: {type: String, enum: ugcContentGenre}, //Is normally the id of main template that this UGC uses
            contentSubGenre: {type: String}, //Is normally the id of sub template that this UGC uses
            no: {type: Number}, //Unique serial number shown to user  
            aeId: {type: String}, //ID of AE Server who renders this UGC
            liveTime: {type: Number},
            fb_postId: [{
                postId: String,
            }],
            sourceId: {type: String},   //UGC projectId
            state: {type: String, enum: liveContentState, default: 'not_checked'}
        }); //  UserLiveContent collection
        
        var MyMemberSchema = new Schema({
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
            ugc_ids: {type: [ObjectID]},
            activity_ids: {type: [ObjectID]},
            ugc_count: {type: Number, min: 0, default: 0},
            thumbnail: {type: String},    //  path/to/filename
            doohTimes: {type: Number, min: 0, default: 0},
            app: {type: String, enum: appGenre, default: 'ondascreen'},
            apply: {type: Boolean, default: false}
        }); //  MyMember collection
		
		var MessageSchema = new Schema({
            content: {type: String},
			ownerId: {_id: ObjectID},
            read: {type: Boolean, default: false},
            showInCenter: {type: Boolean, default: false}
        }); //  MyMember collection
		
		var VIPSchema = new Schema({
			code: {type: String},
			used: {type: Boolean, default: false}
		});
		
        /****************** End of DB Schema ******************/
		
        var Member = connection.model('Member', MemberSchema, 'member'),
            Video = connection.model('Video', VideoSchema, 'video'),
            Comment = connection.model('Comment', CommentSchema, 'comment'),
            Event = connection.model('Event', EventSchema, 'event'), //DEPRECATED
            Program = connection.model('Program', ProgramSchema, 'program'), //DEPRECATED
            ProgramTimeSlot = connection.model('ProgramTimeSlot', ProgramTimeSlotSchema, 'programTimeSlot'),
            CandidateUgcCache = connection.model('CandidateUgcCache', CandidateUgcCacheSchema, 'candidateUgcCache'),
            Admin = connection.model('Admin', AdminSchema, 'admin'),
			Analysis = connection.model('Analysis', AnalysisSchema, 'analysis'),
            MemberListInfo = connection.model('MemberListInfo', MemberListInfoSchema, 'memberListInfo'),//kaiser
            MiixPlayListInfo = connection.model('MiixPlayListInfo', MiixPlayListInfoSchema, 'miixPlayListInfo'),
            StoryPlayListInfo = connection.model('StoryPlayListInfo', StoryPlayListInfoSchema, 'storyPlayListInfo'),
            UGC = connection.model('UGC', UGCSchema, 'ugc'),
            CustomerServiceItem = connection.model('CustomerServiceItem', CustomerServiceItemSchema, 'customerServiceItem'),
            SessionItem = connection.model('SessionItem', SessionItemSchema, 'sessionItem'),
            UserLiveContent = connection.model('UserLiveContent', UserLiveContentSchema, 'userLiveContent'),
            MyMember = connection.model('MyMember', MyMemberSchema, 'myMember'),
			Message = connection.model('Message', MessageSchema, 'message');
        	VIP = connection.model('VIP', VIPSchema, 'vip');
           
            
        var dbModels = [];
        dbModels["member"] = Member;
        dbModels["video"] = Video;
        dbModels["comment"] = Comment;
        dbModels["event"] = Event;
        dbModels["program"] = Program;
        dbModels["programTimeSlot"] = ProgramTimeSlot;
        dbModels["candidateUgcCache"] = CandidateUgcCache;
        dbModels["admin"] = Admin;
		dbModels["analysis"] = Analysis;
        dbModels["memberListInfo"] = MemberListInfo;//kaiser
        dbModels["miixPlayListInfo"] = MiixPlayListInfo;
        dbModels["storyPlayListInfo"] = StoryPlayListInfo;  
        dbModels["ugc"] = UGC;
        dbModels["customerServiceItem"] = CustomerServiceItem;
        dbModels["sessionItem"] = SessionItem;
        dbModels["userLiveContent"] = UserLiveContent;
        dbModels["myMember"] = MyMember;
		dbModels["message"] = Message;
		dbModels["vip"] = VIP;
        
        //???? nobody uses it, so this section can be removed? 
        var dbSchemas = [];
        dbSchemas["member"] = MemberSchema;
        dbSchemas["video"] = VideoSchema;
        dbSchemas["comment"] = CommentSchema;
        dbSchemas["event"] = EventSchema;
        dbSchemas['program'] = ProgramSchema;
        dbSchemas["admin"] = AdminSchema;
		dbSchemas["analysis"] = AnalysisSchema;
        dbSchemas['memberListInfo'] = MemberListInfoSchema;//kaiser
        dbSchemas["miixPlayListInfo"] = MiixPlayListInfoSchema;
        dbSchemas["storyPlayListInfo"] = StoryPlayListInfoSchema;
        dbSchemas["ugc"] = UGCSchema;
            
        function connectDB(){
                try{
                    var options = {
                        user: systemConfig.HOST_MONGO_DB_USER_NAME,
                        pass: systemConfig.HOST_MONGO_DB_PASSWORD
                    }
                    mongoose.connect(systemConfig.HOST_MONGO_DB_SERVER_URL+'/'+DB, options);
                    return mongoose.connection;
                }catch(err){
                    logger.info('Connect DB failed: '+err);
                }
            };

        return {
        /*  
         *  Public members. In Constructor().
         */
            locatioinQuery: function(locationUID){
                var query = UGC.find({});
                query.sort('timestamp', -1).exec(function(err, doc){
                    if(err){
                        logger.info('locationQuery failed: '+err);
                    }else{
                        logger.info('locationQuery '+locationUID+': '+doc);
                    }
                });
            },

            ownerQuery: function(ownerUID){
                var query = UGC.find({});
                query.where('_id', ownerUID).sort('timestamp', -1).exec(function(err, doc){
                    if(err){
                        logger.info('ownerQuery failed: '+err);
                    }else{
                        logger.info('ownerQuery '+ownerUID.toHexString());
                    }
                });
            },

            latestQuery: function(latestNum){
                var query = UGC.find({});
                query.sort('timestamp', -1),limit(latestNum).exec(function(err, doc){
                    if(err){
                        logger.info('latestQuery failed: '+err);
                    }else{
                        logger.info('latestQuery Latest'+latestNum+': '+doc);
                    }
                });
            },

            rankQuery: function(topNum){
                var query = UGC.find({});
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
                    case 'memberListInfo':
                        return MemberListInfo;
                        break;
                    case 'miixPlayListInfo':
                        return MiixPlayListInfo;
                        break;
                    case 'storyPlayListInfo':
                        return StoryPlayListInfo;
                        break;
                    case 'ugc':
                        return UGC;
                        break;
                    case 'customerServiceItem':
                        return CustomerServiceItem;
                        break;
                    case 'sessionItem':
                        return SessionItem;
                        break;
                    case 'userLiveContent':
                        return UserLiveContent;
                        break;
                    case 'myMember':
                        return MyMember;
                        break;
					case 'message':
                        return Message;
                        break;
					case 'vip':
                        return VIP;
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
            //kaiser
            deleteAdoc2: function(docModel, cb){
                logger.info("Delete all Doc: ");
                docModel.remove(docModel, cb);
            },
            
            listOfdocModels: function(docModel,condition, fields, options, cb){
                docModel.find(condition, fields, options, cb);
            },
            //kaiser end
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
            
            
            ugcDump: function(){
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
                                createAdoc( connection, 'UGC', {"title":title}, ownerId1);
                            }else{
                                createAdoc( connection, 'UGC', {"title":title}, ownerId2);
                            }
                        }
                    }
                });
            },
            addUserLiveContent: function(vjson, cb){
                if(vjson.ownerId){
                    UserLiveContent.count({}, function(err, count){
                    vjson.no = parseInt(count)+1;
                    FM.DB.getInstance().createAdoc(UserLiveContent, vjson, cb);
                    });

                }else{
                    var err = {error: "ownerId is MUST-HAVE!"};
                    cb(err, null);
                }
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



module.exports = FM.DB.getInstance();

//test
//var vjson= {
////    no: 1673, 
//    genre:'miix_image_live_photo',
//    contentGenre: 'miix_it',
//    ownerId:{_id: '51d38ca086fa21440a000002', fbUserId: '100006239742920', userID: '100006239742920'},
//    projectId: 'cultural_and_creative-51d38ca086fa21440a000002-1375784400000-003',
//    liveTime: 1371962000000,
//    url:{
//        s3:'/user_project/cultural_and_creative-51d38ca086fa21440a000002-1375784400000-003/cultural_and_creative-51d38ca086fa21440a000002-1375784400000-003.jpg',
//        longPhoto:'https://s3.amazonaws.com/miix_content/user_project/mood-512de6f7989cfc240300000e-20130815T091253591Z/mood-512de6f7989cfc240300000e-20130815T091253591Z.png'
//    }
//};
//
//var vjson2={
//    _id: '5200d08d76c1bc281000003b',
////    no: 3935,
//    genre:'miix_story',
//    ownerId:{_id: '51d38ca086fa21440a000002', fbUserId: '100006239742920', userID: '100006239742920'},
//    projectId: 'miix_it-5192f1cac6e16fa00d000006-20130822T104338342Z.mp4_storymv_20130822T105532835Z',
//    liveTime: 1371962000000,
//    url:{
//        youtube:'http://www.youtube.com/embed/ZZ8A7hTQHjA',
//        longPhoto:'https://s3.amazonaws.com/miix_content/user_project/mood-512de6f7989cfc240300000e-20130815T091253591Z/mood-512de6f7989cfc240300000e-20130815T091253591Z.png'
//    }
//};
//module.exports = FM.DB.getInstance().addUserLiveContent(vjson2, function(err,result){
//    console.log(err,result);
//});


/* User Token
 * AAADdkgZCw4VMBALbOyseWQ4GU2CCfJhONZCOvVdiYAlYMtZApSx0iTwXYhkExINmgjQ59YDHmiZCzlmSMeKSLZAHOyZBZC1mkWwNRYKq5vB7BAC52akxDIu
 */
