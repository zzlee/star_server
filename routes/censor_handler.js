
var DEBUG = true,
    FM_LOG = (DEBUG) ? function(str){ logger.info( typeof(str)==='string' ? str : JSON.stringify(str) ); } : function(str){} ;
 
var FM = { censor_handler: {} };

var censor_mgr = require("../censor_mgr.js");
var apis = require("../routes/api.js");
var schedule_mgr = require("../schedule_mgr.js");

/**
 * @param  request  {json}sort:{?}
 *                        ex:{
 *                            'rating':1,
 *                            'doohPlayedTimes':-1,
 *                            'description':-1
 *                           };
 *                  {json}condition:{?}
 *                        ex:{
 *                            'createdOn': {$gte: 'May 01, 2013', $lt: 'Jun 27, 2013'},
 *                            'doohPlayedTimes':0,
 *                            'rating':'a'
 *                           }
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
FM.censor_handler.getUGCList_get_cb = function(req,res){
//    console.dir(req);
    
    var condition;
    var sort;
    var limit;
    var skip;

    condition = {
            'no':{ $exists: true},
//            'genre':'miix',
            'ownerId':{ $exists: true},
            'projectId':{ $exists: true}
    };

    sort = {
            'no':1
    };
    if(req.query.condition)   
        condition = req.query.condition;
    if(req.query.sort) 
        sort = req.query.sort;
    
    limit = req.query.limit;
    skip = req.query.skip;
//    console.log(condition+sort+limit+skip);
    

    
    censor_mgr.getUGCList(condition, sort, limit, skip, function(err, UGCList){
        if (!err){
            res.render( 'table_censorUGC', {ugcCensorMovieList: UGCList} );
        }
        else{
            res.send(400, {error: err});
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
 FM.censor_handler.setUGCAttribute_get_cb = function(req,res){
    console.dir(req);
    
    var no = req.body.no;
    var vjson = req.body.vjson;
    
     censor_mgr.setUGCAttribute(no, vjson, function(err, result){
         if (!err){
             res.send(200, {message:result});
         }
         else{
             res.send(400, {error: err});
         }
     });


  };

FM.censor_handler.createTimeslots_get_cb = function(req, res){
//    console.dir(req);
    var doohId = req.params.doohId;
//    var intervalOfSelectingUGC = req.body.intervalOfSelectingUGC;
//    var intervalOfPlanningDoohProgrames = req.body.intervalOfPlanningDoohProgrames;
//    var programSequence = req.body.programSequence;
    var intervalOfSelectingUGC = {start: 1367710220000, end: 1371862000000};
    var intervalOfPlanningDoohProgrames = {start: 1367710220000, end: 1371862000000};
    var programSequence = ['miix', 'check_in', 'check_in',' mood', 'cultural_and_creative'];
    console.dir(req.params.doohId+JSON.stringify(intervalOfSelectingUGC)+JSON.stringify(intervalOfPlanningDoohProgrames)+programSequence);
    
    schedule_mgr.createProgramList(doohId, intervalOfSelectingUGC, intervalOfPlanningDoohProgrames, programSequence, function(err, result){
        if (!err){
            console.log(result);
            res.send(200, {message:result});
        }
        else{
            res.send(400, {error: err});
        }
    });
    
};
  
  
FM.censor_handler.gettimeslots_get_cb = function(req, res){
    
//    var doohId = req.params.doohId;
    var doohId = 'taipeiarena';
    var interval = {start: 1367710220000, end: 1371862000000};
    var limit = req.query.limit;
    var skip = req.query.skip;
    console.log('gettimeslots_get_cb'+doohId+interval+limit+skip);
    
    schedule_mgr.getProgramList(doohId, interval, limit, skip, function(err, result){
        if (!err){
            console.dir(result);
//          res.render( 'table_censorPlayList', {ugcCensorPlayList: result} );
//            res.send(200, {message:result});
        }
        else{
            res.send(400, {error: err});
        }
    });
    
    var testArray = [];
     testArray =
        [ { doohTimes: ['2013/5/3 15:14', '2013/6/5 16:14', '2013/8/3 15:08'], //酚
            ugcCensorNo: '035', //紇絪腹
            genre: 'mood', //芠Ω计
            userContent: 'yeah', //FB苂Ω计
            userPhotoUrl: '/contents/user_project/greeting-50ee77e2fc4d981408000014-20130222T023238273Z/user_data/_cdv_photo_010.jpg', //FB痙ē计
            fb_userName: 'NO User', //FBだㄉΩ计
            fbPictureUrl: '/contents/user_project/greeting-50ee77e2fc4d981408000014-20130222T023238273Z/user_data/_cdv_photo_010.jpg', //穦嘿
            rating: 'a' //щ絑Ω计
        }
            ];
    res.render( 'table_censorPlayList', {ugcCensorPlayList: testArray} );
 };

module.exports = FM.censor_handler;