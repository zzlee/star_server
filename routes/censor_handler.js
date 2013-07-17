
var DEBUG = true,
FM_LOG = (DEBUG) ? function(str){ logger.info( typeof(str)==='string' ? str : JSON.stringify(str) ); } : function(str){} ;

var FM = { censor_handler: {} };

var censor_mgr = require("../censor_mgr.js");
var apis = require("../routes/api.js");
var schedule_mgr = require("../schedule_mgr.js");

var sessionId = null;

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

    var condition;
    var sort;
    var limit;
    var skip;

    condition = {
            'no':{ $exists: true},
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
    
    var doohId = req.params.doohId;
    var intervalOfSelectingUGCStart =  new Date(req.body.intervalOfSelectingUGC.start).getTime();
    var intervalOfSelectingUGCend =  new Date(req.body.intervalOfSelectingUGC.end).getTime();
    var intervalOfSelectingUGC = {start: intervalOfSelectingUGCStart, end: intervalOfSelectingUGCend};

    var intervalOfPlanningDoohProgramesStart = new Date(req.body.intervalOfPlanningDoohProgrames.start).getTime();
    var intervalOfPlanningDoohProgramesEnd = new Date(req.body.intervalOfPlanningDoohProgrames.end).getTime();
    var intervalOfPlanningDoohProgrames = {start: intervalOfPlanningDoohProgramesStart, end: intervalOfPlanningDoohProgramesEnd};
    
    var programSequence = req.body.programSequence;


    schedule_mgr.createProgramList(doohId, intervalOfSelectingUGC, intervalOfPlanningDoohProgrames, programSequence, function(err, result){
        if (!err){
            sessionId = result.sessionId;
            res.send(200, {message: JSON.stringify(result.sessionId)});
        }
        else{
            res.send(400, {error: err});
        }
    });

};


FM.censor_handler.gettimeslots_get_cb = function(req, res){

//  var doohId = req.params.doohId;
    var doohId = 'taipeiarena';
    var interval = {start: 1367710220000, end: 1371862000000};
    var limit = req.query.limit;
    var skip = req.query.skip;
    var testArray = [];

    if(req.query.condition){
        var updateUGC = req.query.condition;
    }


    schedule_mgr.getProgramList(doohId, interval, limit, skip, updateUGC, function(err, result){
        if (!err){
            if(result)
                res.render( 'table_censorPlayList', {ugcCensorPlayList: result} );
//          res.send(200, {message:result});
        }
        else{
            res.render( 'table_censorPlayList', {ugcCensorPlayList: testArray} );
//          res.send(400, {error: err});
        }
    });

//  testArray =
//  [ { doohTimes: ['2013/5/3 15:14', '2013/6/5 16:14', '2013/8/3 15:08'], //酚
//  ugcCensorNo: '035', //紇絪腹
//  genre: 'mood', //芠Ω计
//  userContent: 'yeah', //FB苂Ω计
//  userPhotoUrl: '/contents/user_project/greeting-50ee77e2fc4d981408000014-20130222T023238273Z/user_data/_cdv_photo_010.jpg', //FB痙ē计
//  fb_userName: 'NO User', //FBだㄉΩ计
//  fbPictureUrl: '/contents/user_project/greeting-50ee77e2fc4d981408000014-20130222T023238273Z/user_data/_cdv_photo_010.jpg', //穦嘿
//  rating: 'a' //щ絑Ω计
//  }
//  ];
//  res.render( 'table_censorPlayList', {ugcCensorPlayList: testArray} );
};

FM.censor_handler.pushProgramsTo3rdPartyContentMgr_get_cb = function(req, res){

    schedule_mgr.pushProgramsTo3rdPartyContentMgr(sessionId, function(err, result){
        if (!err){
            //TODO pushProgramsTo3rdPartyContentMgr
        }
        else{
            res.send(400, {error: err});
        }
    });

};

FM.censor_handler.updatetimeslots_get_cb = function(req, res){

    var programTimeSlot =  req.body.programTimeSlotId;
    var ugcReferenceNo = req.body.ugcReferenceNo;


    if(req.body.type == 'removeUgcfromProgramAndAutoSetNewOne'){
        schedule_mgr.removeUgcfromProgramAndAutoSetNewOne(sessionId, programTimeSlot, function(err, result){
            if (!err){
                res.send(200, {message: result});
            }
            else{
                res.send(400, {error: err});
            }
        });
    }

    if(req.body.type == 'setUgcToProgram'){
        
        schedule_mgr.setUgcToProgram(programTimeSlot, ugcReferenceNo, function(err, result){
            if (!err){
                res.send(200, {message: result});
            }
            else{
                res.send(400, {error: err});
            }
        });
    }

};

module.exports = FM.censor_handler;