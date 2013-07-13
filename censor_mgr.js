
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
        FMDB.listOfdocModels( UGCs,condition,'fb.userID _id title description createdOn rating doohPlayedTimes projectId ownerId no genre mustPlay', {sort :sort ,limit: pageLimit ,skip: pageSkip}, function(err, result){
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

var UGCListInfo = function(userPhotoUrl, ugcCensorNo, userContent, fb_userName, fbPictureUrl, title, description, doohPlayedTimes, rating, genre, mustPlay, arr) {
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
        genre: genre,
        mustPlay: mustPlay
    });
};
var mappingUGCList = function(data, set_cb){

    var toDo = function(err, result){

        if(next == limit - 1) {
            UGCListInfo(result[0], data[next].no, data[next].description, result[2], result[1], data[next].title, data[next].description, data[next].doohPlayedTimes, data[next].rating, data[next].genre, data[next].mustPlay, UGCList);
            set_cb(null, 'ok'); 
            next = 0;
        }
        else{
            UGCListInfo(result[0], data[next].no, data[next].description, result[2], result[1], data[next].title, data[next].description, data[next].doohPlayedTimes, data[next].rating, data[next].genre, data[next].mustPlay, UGCList);
            next += 1;
            mappingUGCList(data, set_cb);
        }

    };//toDo End ******

    //async
    if(data[next] !== null){
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

    FMDB.listOfdocModels( UGCs,{'createdOn' : {$gte: condition.start, $lt: condition.end}},'_id genre', null, function(err, result){
        if(err) {
            logger.error('[censorMgr.getUGCListLite]', err);
            cb(err, null);
        }
        if(result){
            console.dir('result'+JSON.stringify(result));
            cb(err, result);
        }
    });

};



censorMgr.getPlayList = function(programList, cb){


    var limit = 5;
    var next = 0;
    var playList = [];
    console.log('programList.length'+programList.length);

    var playListInfo = function(ugcCensorNo, userContent, title, doohPlayedTimes, rating, genre, mustPlay, timeslot, timeStamp, dooh, _id, projectId, ownerId, arr) {
        arr.push({
            ugcCensorNo: ugcCensorNo,
            userContent: userContent,
            title: title,
            doohPlayedTimes:doohPlayedTimes, 
            rating: rating,
            genre: genre,
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
        console.log('data[next]._id'+data[next]._id);

            FMDB.listOfdocModels( UGCs, {_id: data[next]._id},'fb.userID _id title description createdOn rating doohPlayedTimes projectId ownerId no genre mustPlay', null, function(err, result){
                if(err) {
                    logger.error('[censorMgr_db.listOfUGCs]', err);
//                    cb(err, null);
                }
                if(result !== null){
                    if(next == limit - 1) {
                        playListInfo(result.no, result.description, result.title, result.doohPlayedTimes, result.rating, result.genre, result.mustPlay, data[next].timeslot, data[next].timeStamp, data[next].dooh, data[next]._id, result.projectId, result.ownerId, playList);
                        set_cb(null, 'ok'); 
                        next = 0;
                    }
                    else{
                        playListInfo(result.no, result.description, result.title, result.doohPlayedTimes, result.rating, result.genre, result.mustPlay, data[next].timeslot, data[next].timeStamp, data[next].dooh, data[next]._id, result.projectId, result.ownerId, playList);
                        next += 1;
                        mappingPlayList(data, set_cb);
                    }
                }
            });
    };
    mappingPlayList(programList, function(err,docs){
        if (cb){
          console.dir('playList'+JSON.stringify(playList));
          cb(err, playList);
  }
});

    
};


module.exports = censorMgr;