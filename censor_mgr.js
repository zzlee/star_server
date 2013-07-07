
var censorMgr = {};

var fb_handler = require('./fb_handler.js');
var FMDB = require('./db.js');
var UGCs = FMDB.getDocModel("ugc");
var async = require('async');



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
censorMgr.getUGCList = function(req,res){

    //kaiser test �Ucondition
    var condition;
    var sort;
    var start = new Date('03 01, 2013');
    var end = new Date('06 27, 2013');
//    var doohPlayedTimes = 0;
//    var rating = '';
//    console.dir(req.query);
    
    condition = {
            'no':{ $exists: true},
//          'createdOn': {$gte: 'Jul 01, 2013 22:00', $lt: 'Jul 04, 2013 00:00'},
//          'createdOn': {$gte: start, $lt: end},
            'genre':'miix',
            'ownerId':{ $exists: true},
            'projectId':{ $exists: true}
            //'doohPlayedTimes':doohPlayedTimes,
//            'rating':{ $exists: false}
    };

    sort = {
            'no':1
//          rating:1,
//          doohPlayedTimes:-1,
//          description:-1
    };
    //test End
    
    if(req.query.condition) {
        condition = req.query.condition;
        //���ɶ�
        if(req.query.condition.TimeStart && req.query.condition.TimeEnd){
            start = new Date(req.query.condition.TimeStart);
            h = start.getHours()-8;
            startutc = start.setHours(h);
            end = new Date(req.query.condition.TimeEnd);
            h = end.getHours()-8;
            endutc = end.setHours(h);
//            console.log('-----------------------');
//            console.dir('start~end[utc]'+startutc+','+endutc);
//            console.log('-----------------------');
//            console.dir('start~end'+start+','+end);
//            console.log('-----------------------');
            condition ={
                'genre':'miix',
                'no':{ $exists: true},
                'ownerId':{ $exists: true},
                'projectId':{ $exists: true},
                'createdOn': {$gte: startutc, $lt: endutc}
        };
        }
        //�w�g�f��
        if(req.query.condition == 'rating') condition ={
                'genre':'miix',
                'no':{ $exists: true},
                'ownerId':{ $exists: true},
                'projectId':{ $exists: true},
                'rating':{ $exists: true}
        };
        //�|���f��
        if(req.query.condition == 'norating') condition ={
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
    var nextAsync = 0;
    var UGCList = [];

    var UGCListInfo = function(userPhotoUrl, ugcCensorNo, userContent, fb_id, fbPictureUrl, title, description, doohPlayedTimes, rating, arr) {
        arr.push({
            userPhotoUrl: userPhotoUrl,
            ugcCensorNo: ugcCensorNo,
            userContent: userContent,
            fb_id: fb_id,
            fbPictureUrl: fbPictureUrl,
            title: title,
            description: description,
            doohPlayedTimes:doohPlayedTimes, 
            rating: rating
        });
    };


    var mappingUGCList = function(data, set_cb){

        var toDo = function(err, result){
//            console.log('toDo'+err+result);

            if(next == limit - 1) {
                UGCListInfo(result[0], data[next].no, data[next].description, result[2], result[1], data[next].title, data[next].description, data[next].doohPlayedTimes, data[next].rating, UGCList);
                set_cb(null, 'ok'); 
                next = 0;
//                console.log(UGCList);
            }
            else{
                UGCListInfo(result[0], data[next].no, data[next].description, result[2], result[1], data[next].title, data[next].description, data[next].doohPlayedTimes, data[next].rating, UGCList);
                next += 1;
                mappingUGCList(data, set_cb);
            }
//            console.log('next',next);

        };//toDo End ******

        //async
        nextAsync += 1;
//        console.log('nextAsync'+nextAsync);
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

    if ( req.query.limit && req.query.skip ) {
        FMDB.listOfdocModels( UGCs,condition,'fb.userID _id title description createdOn rating doohPlayedTimes projectId ownerId no', {sort :sort ,limit: req.query.limit ,skip: req.query.skip}, function(err, result){
//            console.log("listOfdocModels="+err+result);
            if(err) {logger.error('[censorMgr_db.listOfUGCs]', err);
            res.send(400, {error: "Parameters are not correct"});
            }
            if(result){

                if(req.query.skip < result.length && req.query.limit < result.length)
                    limit = req.query.limit;
                else 
                    limit = result.length;
                
//                console.log('limit'+limit+result);

                if(limit > 0){ 
                    mappingUGCList(result, function(err,docs){
                        if(err) console.log('mapping_err'+err);
                        else{
//                            console.log('render');
                            res.render( 'table_censorUGC', {ugcCensorMovieList: UGCList} );
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
//kaiser test
//var fb_id = '100005962359785';
//getUserContent(fb_id,function(err,res){
//if(err) console.log("getUserContent_err="+err);
//else console.log("getUserContent="+res);

//});

/**
 * @param  request  {number}no
 * 
 *         body     {string}UGCLevel(Range A~E)    
 *                  
 * @return response {string}status 
 *                       
 */
censorMgr.setUGCAttribute = function(req,res){
    var UGC_mgr = require('./UGC.js');
    console.dir(req.query);
    var no = req.query.no;
    var vjson = {rating : req.query.rating};
    console.log('setUGCAttribute'+no+vjson);

    UGC_mgr.getOwnerIdByNo(no, function(err, result){
        if(err) logger.error('[setUGCAttribute_getOwnerIdByNo]', err);

        if(result){
            console.log('getOwnerIdByNo_result'+result);
            FMDB.updateAdoc(UGCs,result,vjson, function(err, result){
                if(err) {
                    logger.error('[setUGCAttribute_updateAdoc]', err);
                res.send(400, {error: "Parameters are not correct"});
//                get_cb(err,null);
                }
                if(result){
                    console.log('updateAdoc_result'+result);
//                    get_cb(null,result.rating);
                }
            });
        }

    });

};

//kaiser test
//var vjson = {
//        rating : 'd'
//};
////var _id = '51c939f65fcfaf8823000002';
//var no = 1;
//setUGCAttribute(no,vjson,function(err,res){
//    if(err) console.log("setUGCAttribute_err"+err);
//    else console.log("setUGCAttribute_change="+res);
//
//});


module.exports = censorMgr;