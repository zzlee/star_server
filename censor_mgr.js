
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
    console.log('req'+ req);
    console.log('req'+ req.query);

    //kaiser test
    var condition;
    var sort;
    var start = new Date('May 01, 2013');
    var end = new Date('Jun 27, 2013');
    var doohPlayedTimes = 0;
    var rating = '';

    condition = {
//            'createdOn': {$gte: 'Jan 01, 2012', $lt: 'Jun 27, 2013'},
            'genre':'miix',
            'ownerId':{ $exists: true},
            'projectId':{ $exists: true},
            //'doohPlayedTimes':doohPlayedTimes,
            //'rating':rating
    };
    sort = {
        'no':1,
//        rating:1,
//        doohPlayedTimes:-1,
//        description:-1
    
    };
    //test End

    //TODO: need to implement
    var miix_content_mgr = require('./miix_content_mgr.js');
    var member_mgr = require('./member.js');

    var limit = 0;
    var next = 0;
    var nextMap = 0;
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
            console.log('toDo'+err+result);

            nextMap += 1;
            if(next == limit - 1) {
                UGCListInfo(result[0], data[next].no, data[next].description, result[2], result[1], data[next].title, data[next].description, data[next].doohPlayedTimes, data[next].rating, UGCList);
                set_cb(null, 'ok'); 
                next = 0;
                console.log(UGCList);
            }
            else{
                UGCListInfo(result[0], data[next].no, data[next].description, result[2], result[1], data[next].title, data[next].description, data[next].doohPlayedTimes, data[next].rating, UGCList);
                next += 1;
                mappingUGCList(data, set_cb);
            }
            console.log('next',next);
          console.log('nextMap'+nextMap);

        };//toDo End ******

        //async
//        if(data[next] != null){
//            if(data[next].ownerId != null && data[next].projectId != null){
                nextAsync += 1;
                console.log('nextAsync'+nextAsync);
                async.parallel([
                                function(callback){
                                    miix_content_mgr.getUserUploadedImageUrls(data[next].projectId, function(result, err){
                                        console.log(err, result);
                                        if(err) {
//                                            next += 1;
//                                            mappingUGCList(data, set_cb);
                                            callback(err,null);
                                        }
                                        else callback(null, result);
                                    });
                                },
                                function(callback){
                                    getUserContent(data[next].ownerId.userID,function(err, result){
                                        console.log(err, result);
//                                      console.log('++++++++'+err+result);
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
                                        console.log(err, result);
                                        if(err) callback(err, null);
                                        else if(result == null) callback(null, 'No User');
                                        else callback(null, result.fb.userName);
                                    });

                                }
                                ], toDo);
//            }
//        }//

    };

    if ( req.query.limit && req.query.skip ) {
    FMDB.listOfdocModels( UGCs,condition,'fb.userID _id title description createdOn rating doohPlayedTimes projectId ownerId no', {sort :sort ,limit: req.query.limit ,skip: req.query.skip}, function(err, result){
        console.log("listOfdocModels="+err+result);
          if(err) {logger.error('[censorMgr_db.listOfUGCs]', err);
          get_cb(null,err);
          }
          if(result){
              
              if(req.query.skip < result.length)
                  limit = req.query.limit;
              else 
                  limit = result.length;
              
//              limit = 5;  
              
              console.log('----limit----'+limit);
//            get_cb(null,result);
              if(limit > 0){ 
                  mappingUGCList(result, function(err,docs){
                  if(err) console.log('mapping_err'+err);
                  else{
                      console.log('render');
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
//            console.log(JSON.stringify(result.picture.data.url));
            get_cb(null,result.picture.data.url);
        }
    });

};
//kaiser test
//var fb_id = '100005962359785';
//getUserContent(fb_id,function(err,res){
//    if(err) console.log("getUserContent_err="+err);
//    else console.log("getUserContent="+res);
//
//});

/**
 * @param  request  {string}_id
 * 
 *         body     {string}UGCLevel(Range A~E)    
 *                  
 * @return response {string}status 
 *                       
 */
var setUGCAttribute = function(_id,vjson,get_cb){

    FMDB.updateAdoc(UGCs,_id,vjson, function(err, result){
        if(err) {logger.error('[db.updateAdoc]', err);
          get_cb(err,null);
        }
        if(result){
          get_cb(null,result.rating);
        }
    });
};

//kaiser test
var vjson = {
        rating : 'd',
};
var _id = '51c939f65fcfaf8823000002';
setUGCAttribute(_id,vjson,function(err,res){
    if(err) console.log("setUGCAttribute_err"+err);
    else console.log("setUGCAttribute_change="+res);

});


module.exports = censorMgr;