
var censorMgr = {};

var async = require('async');
var fb_handler = require('./fb_handler.js');
var FMDB = require('./db.js');
var sheculeMgr = require('./schedule_mgr.js');
var miix_content_mgr = require('./miix_content_mgr.js');
var member_mgr = require('./member.js');

var UGCs = FMDB.getDocModel("ugc");

sheculeMgr.init(censorMgr);



/**
 * @param  request  {json}condition
 *                  (json}sort
 * 
 *         query    {number}createdOn
 *                  {string}rating
 *                  {number}doohPlayedTimes     
 *                  
 * @return response json{userContent(photo url or userContent link in s3),
 *                       FB_ID,
 *                       title,
 *                       description,
 *                       createdOn,
 *                       rating(Range A~E),
 *                       doohPlayedTimes}
 */
censorMgr.getUGCList = function(condition, sort, pageLimit, pageSkip, cb){


    if(condition){
        //
        if(condition.TimeStart && condition.TimeEnd){
            start = new Date(condition.TimeStart);
            h = start.getHours()-8;
            startutc = start.setHours(h);
            end = new Date(condition.TimeEnd);
            h = end.getHours()-8;
            endutc = end.setHours(h);
            condition ={
                    'no':{ $exists: true},
                    'ownerId':{ $exists: true},
                    'projectId':{ $exists: true},
                    'createdOn': {$gte: startutc, $lt: endutc}
            };
        }
        //
        if(condition == 'rating') condition ={
                'no':{ $exists: true},
                'ownerId':{ $exists: true},
                'projectId':{ $exists: true},
                'rating':{ $exists: true}
        };
        //
        if(condition == 'norating') condition ={
                'no':{ $exists: true},
                'ownerId':{ $exists: true},
                'projectId':{ $exists: true},
                'rating':{ $exists: false}
        };
    }

    if ( pageLimit && pageSkip ) {
        FMDB.listOfdocModels( UGCs,condition,'fb.userID _id title description createdOn rating doohPlayedTimes projectId ownerId no contentGenre mustPlay', {sort :sort ,limit: pageLimit ,skip: pageSkip}, function(err, result){
            if(err) {
                logger.error('[censorMgr_db.listOfUGCs]', err);
                cb(err, null);
            }
            if(result){

                if(pageSkip < result.length && pageLimit < result.length)
                    limit = pageLimit;
                else 
                    limit = result.length;

                if(limit > 0){ 
                    mappingUGCList(result, function(err,docs){
                            if (cb){
//                                console.dir('UGCList'+JSON.stringify(UGCList));
                                cb(err, UGCList);
                        }
                    });
                }
            }
        });
    }

};//getUGCList end

/**
 * mapping UGC list
 */


var limit = 0;
var next = 0;
var UGCList = [];
var timeslotStart;
var timeslotEnd;

var UGCListInfo = function(userPhotoUrl, ugcCensorNo, userContent, fb_userName, fbPictureUrl, title, description, doohPlayedTimes, rating, contentGenre, mustPlay, timeslotStart, timeslotEnd, timeStamp, arr) {
    arr.push({
        userPhotoUrl: userPhotoUrl,
        ugcCensorNo: ugcCensorNo,
        userContent: userContent,
        fb_userName: fb_userName,
        fbPictureUrl: fbPictureUrl,
        title: title,
        description: description,
        doohPlayedTimes:doohPlayedTimes, 
        rating: rating,
        contentGenre: contentGenre,
        mustPlay: mustPlay,
        timeslotStart: timeslotStart,
        timeslotEnd: timeslotEnd,
        timeStamp: timeStamp
    });
};
var mappingUGCList = function(data, set_cb){
    limit = data.length;

    var toDo = function(err, result){
        
        if(data[next].timeslot){
        timeslotStart = new Date(data[next].timeslot.start).toISOString();
        timeslotEnd = new Date(data[next].timeslot.end).toISOString();
        }

        if(next == limit - 1) {
            UGCListInfo(result[0], data[next].no, data[next].description, result[2], result[1], data[next].title, data[next].description, data[next].doohPlayedTimes, data[next].rating, data[next].contentGenre, data[next].mustPlay, timeslotStart, timeslotEnd, data[next].timeStamp, UGCList);
            set_cb(null, 'ok'); 
            next = 0;
            UGCList = [];
        }
        else{
            UGCListInfo(result[0], data[next].no, data[next].description, result[2], result[1], data[next].title, data[next].description, data[next].doohPlayedTimes, data[next].rating, data[next].contentGenre, data[next].mustPlay, timeslotStart, timeslotEnd, data[next].timeStamp, UGCList);
            next += 1;
            mappingUGCList(data, set_cb);
        }

    };//toDo End ******

    //async
    if(data[next] !== null){
        console.log('next'+next+'---'+limit);
        async.parallel([
                        function(callback){
                            miix_content_mgr.getUserUploadedImageUrls(data[next].projectId, function(result, err){
                                if(err) {
                                    callback(err,null);
                                }
                                else callback(null, result);
                            });
                        },
                        function(callback){
                            getUserContent(data[next].ownerId.userID,function(err, result){
                                if(err){
                                    logger.error('[mappingUserProfilePicture_getUserContent]', err);
                                    callback(err, null);
                                }
                                if(result){
                                    callback(null, result);
                                }
                            });

                        },
                        function(callback){
                            member_mgr.getUserNameAndID(data[next].ownerId._id, function(err, result){
                                if(err) callback(err, null);
                                else if(result === null) callback(null, 'No User');
                                else callback(null, result.fb.userName);
                            });

                        }
                        ], toDo);
    }

};
/**
 * @param  request  {string}dooh_ID
 * 
 *         query    
 *                  
 * @return response json{startDate,
 *                       endDate,
 *                       sequence,
 *                       uratio}
 * 
 */
var getTimeslots = function(get_cb){

};


/**
 * @param  request  {string}FB_ID
 * 
 *         query    
 *                  
 * @return response json{FBProfilePicture(link)}
 *                       
 */

var getUserContent = function(fb_id,get_cb){

    fb_handler.getUserProfilePicture(fb_id,function(err, result){
        if(err){
            get_cb(err,null);
        }
        else{
            get_cb(null,result.picture.data.url);
        }
    });

};

/**
 * @param  request  {number}no
 * 
 *         body     {string}UGCLevel(Range A~E)    
 *                  
 * @return response {string}status 
 *                       
 */
censorMgr.setUGCAttribute = function(no, vjson, cb){
    
    if(vjson.mustPlay == 'true')
        vjson = {mustPlay : true};
    if(vjson.mustPlay == 'false')
        vjson = {mustPlay : false};
    
    console.dir('setUGCAttribute'+JSON.stringify(no)+JSON.stringify(vjson));

    UGC_mgr.getOwnerIdByNo(no, function(err, result){
        if(err) logger.error('[setUGCAttribute_getOwnerIdByNo]', err);

        if(result){
            console.log('getOwnerIdByNo_result'+result);
            FMDB.updateAdoc(UGCs,result,vjson, function(err, result){
                if(err) {
                    logger.error('[setUGCAttribute_updateAdoc]', err);
                    cb(err,null);
                }
                if(result){
                    cb(null,'success');
                    console.log('updateAdoc_result'+result);
                }
            });
        }

    });

};

/**
 * for scheduleMgr
 */
censorMgr.getUGCListLite = function(condition, cb){

    FMDB.listOfdocModels( UGCs,{'createdOn' : {$gte: condition.start, $lt: condition.end}},'_id contentGenre projectId fileExtension no', {sort :'no'}, function(err, result){
        if(err) {
            logger.error('[censorMgr.getUGCListLite]', err);
            cb(err, null);
        }
        if(result){
            //console.dir('result'+JSON.stringify(result));
            cb(err, result);
        }
    });

};



censorMgr.getPlayList = function(programList, cb){


    var limit = 0;
    var next = 0;
    var playList = [];
    console.log('programList.length'+programList.length);

    var playListInfo = function(no, description, title, doohPlayedTimes, rating, contentGenre, mustPlay, timeslot, timeStamp, dooh, _id, projectId, ownerId, arr) {
        arr.push({
            no: no,
            description: description,
            title: title,
            doohPlayedTimes:doohPlayedTimes, 
            rating: rating,
            contentGenre: contentGenre,
            mustPlay: mustPlay,
            timeslot: timeslot,
            timeStamp: timeStamp,
            dooh: dooh,
            _id: _id,
            projectId: projectId,
            ownerId:ownerId
        });
    };    

    var mappingPlayList = function(data, set_cb){
//      console.log('data[next]._id'+data[next].content._id);

        limit = data.length;

        FMDB.listOfdocModels( UGCs, {_id: data[next].content._id},'fb.userID _id title description createdOn rating doohPlayedTimes projectId ownerId no contentGenre mustPlay', null, function(err, result){
//          FMDB.listOfdocModels( UGCs, {_id:'51ac537031f2f25c0a00000d'},'fb.userID _id title description createdOn rating doohPlayedTimes projectId ownerId no contentGenre mustPlay', {sort:'no'}, function(err, result){
            console.log('mappingPlayList_listOfdocModels'+err+result);
            console.log('mappingPlayList_listOfdocModels---------'+result[0].no);
            if(err) {
                logger.error('[censorMgr_db.listOfUGCs]', err);
//              cb(err, null);
            }
            if(result !== null){
                if(next == limit - 1) {
                    playListInfo(result[0].no, result[0].description, result[0].title, result[0].doohPlayedTimes, result[0].rating, result[0].contentGenre, result[0].mustPlay, data[next].timeslot, data[next].timeStamp, data[next].dooh, data[next]._id, result[0].projectId, result[0].ownerId, playList);
                    set_cb(null, 'ok'); 
                    next = 0;
                    playList = [];
                }
                else{
                    playListInfo(result[0].no, result[0].description, result[0].title, result[0].doohPlayedTimes, result[0].rating, result[0].contentGenre, result[0].mustPlay, data[next].timeslot, data[next].timeStamp, data[next].dooh, data[next]._id, result[0].projectId, result[0].ownerId, playList);
                    next += 1;
                    mappingPlayList(data, set_cb);
                }
            }
        });
    };

    if(programList.length > 0){
        mappingPlayList(programList, function(err,docs){
            if (cb){
                console.dir('playList'+JSON.stringify(playList));
//              cb(err, playList);
                mappingUGCList(playList, function(err,docs){
                    if (cb){
                        console.dir('UGCList'+JSON.stringify(UGCList));
                        cb(err, UGCList);
                    }
                });

            }
        });
    }
    else cb(err, null);

};


module.exports = censorMgr;