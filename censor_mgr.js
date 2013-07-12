
var censorMgr = {};

var fb_handler = require('./fb_handler.js');
var FMDB = require('./db.js');
var UGCs = FMDB.getDocModel("ugc");
var async = require('async');
var sheculeMgr = require('./schedule_mgr.js');

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

//    condition = {
//            'no':{ $exists: true},
//            'genre':'miix',
//            'ownerId':{ $exists: true},
//            'projectId':{ $exists: true}
//    };
//
//    sort = {
//            'no':1
//    };

    if(condition){
//        condition = req.query.condition;
        //���ɶ�
        if(condition.TimeStart && condition.TimeEnd){
            start = new Date(condition.TimeStart);
            h = start.getHours()-8;
            startutc = start.setHours(h);
            end = new Date(condition.TimeEnd);
            h = end.getHours()-8;
            endutc = end.setHours(h);
            condition ={
                    'genre':'miix',
                    'no':{ $exists: true},
                    'ownerId':{ $exists: true},
                    'projectId':{ $exists: true},
                    'createdOn': {$gte: startutc, $lt: endutc}
            };
        }
        //�w�g�f��
        if(condition == 'rating') condition ={
                'genre':'miix',
                'no':{ $exists: true},
                'ownerId':{ $exists: true},
                'projectId':{ $exists: true},
                'rating':{ $exists: true}
        };
        //�|���f��
        if(condition == 'norating') condition ={
                'genre':'miix',
                'no':{ $exists: true},
                'ownerId':{ $exists: true},
                'projectId':{ $exists: true},
                'rating':{ $exists: false}
        };
    }

    //TODO: need to implement
    var miix_content_mgr = require('./miix_content_mgr.js');
    var member_mgr = require('./member.js');

    var limit = 0;
    var next = 0;
    var UGCList = [];

    var UGCListInfo = function(userPhotoUrl, ugcCensorNo, userContent, fb_userName, fbPictureUrl, title, description, doohPlayedTimes, rating, genre, arr) {
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
            genre: genre
        });
    };


    var mappingUGCList = function(data, set_cb){

        var toDo = function(err, result){

            if(next == limit - 1) {
                UGCListInfo(result[0], data[next].no, data[next].description, result[2], result[1], data[next].title, data[next].description, data[next].doohPlayedTimes, data[next].rating, data[next].genre, UGCList);
                set_cb(null, 'ok'); 
                next = 0;
            }
            else{
                UGCListInfo(result[0], data[next].no, data[next].description, result[2], result[1], data[next].title, data[next].description, data[next].doohPlayedTimes, data[next].rating, data[next].genre, UGCList);
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

    if ( pageLimit && pageSkip ) {
        FMDB.listOfdocModels( UGCs,condition,'fb.userID _id title description createdOn rating doohPlayedTimes projectId ownerId no genre', {sort :sort ,limit: pageLimit ,skip: pageSkip}, function(err, result){
            if(err) {logger.error('[censorMgr_db.listOfUGCs]', err);
            res.send(400, {error: "Parameters are not correct"});
            }
            if(result){

                if(pageSkip < result.length && pageLimit < result.length)
                    limit = pageLimit;
                else 
                    limit = result.length;

                if(limit > 0){ 
                    mappingUGCList(result, function(err,docs){
//                        if(err) console.log('mapping_err'+err);
//                        else{
                            if (cb){
                                cb(err, UGCList);
//                            }
//                            res.render( 'table_censorUGC', {ugcCensorMovieList: UGCList} );
                        }
                    });
                }
            }
        });
    }
    else{
        res.send(400, {error: "Parameters are not correct"});
    }

};//getUGCList end


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
    var UGC_mgr = require('./ugc.js');
//    console.dir(req);
//    var no = req.query.no;
//    var vjson = {rating : req.query.rating};
    console.log('setUGCAttribute'+no+vjson);

    UGC_mgr.getOwnerIdByNo(no, function(err, result){
        if(err) logger.error('[setUGCAttribute_getOwnerIdByNo]', err);

        if(result){
            console.log('getOwnerIdByNo_result'+result);
            FMDB.updateAdoc(UGCs,result,vjson, function(err, result){
                if(err) {
                    logger.error('[setUGCAttribute_updateAdoc]', err);
                    cb(err,null);
//                    res.send(400, {error: "Parameters are not correct"});
                }
                if(result){
                    cb(null,'success');
                    console.log('updateAdoc_result'+result);
                }
            });
        }

    });

};


module.exports = censorMgr;