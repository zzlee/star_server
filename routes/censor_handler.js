
var DEBUG = true,
FM_LOG = (DEBUG) ? function(str){ logger.info( typeof(str)==='string' ? str : JSON.stringify(str) ); } : function(str){} ;

var FM = { censorHandler: {} };

var censorMgr = require("../censor_mgr.js");
var apis = require("../routes/api.js");
var scheduleMgr = require("../schedule_mgr.js");

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
FM.censorHandler.getUGCList_get_cb = function(req,res){

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

    censorMgr.getUGCList(condition, sort, limit, skip, function(err, UGCList){
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
FM.censorHandler.setUGCAttribute_get_cb = function(req,res){

    var no = req.body.no;
    var vjson = req.body.vjson;

    censorMgr.setUGCAttribute(no, vjson, function(err, result){
        if (!err){
            res.send(200, {message:result});
        }
        else{
            res.send(400, {error: err});
        }
    });


};

FM.censorHandler.postProgramTimeSlotSession_cb = function(req, res){
    
    var doohId = req.params.doohId;
    var intervalOfSelectingUGCStart =  new Date(req.body.intervalOfSelectingUGC.start).getTime();
    var intervalOfSelectingUGCend =  new Date(req.body.intervalOfSelectingUGC.end).getTime();
    var intervalOfSelectingUGC = {start: intervalOfSelectingUGCStart, end: intervalOfSelectingUGCend};

    var intervalOfPlanningDoohProgramesStart = new Date(req.body.intervalOfPlanningDoohProgrames.start).getTime();
    var intervalOfPlanningDoohProgramesEnd = new Date(req.body.intervalOfPlanningDoohProgrames.end).getTime();
    var intervalOfPlanningDoohProgrames = {start: intervalOfPlanningDoohProgramesStart, end: intervalOfPlanningDoohProgramesEnd};
    
    var programSequence = req.body.programSequence;


    scheduleMgr.createProgramList(doohId, intervalOfSelectingUGC, intervalOfPlanningDoohProgrames, programSequence, function(err, result){
        if (!err){
            sessionId = result.sessionId;
            res.send(200, {message: result.sessionId});
        }
        else{
            res.send(400, {error: err});
        }
    });

};


FM.censorHandler.gettimeslots_get_cb = function(req, res){
    var sessionId = null;
    if (req.query.extraParameters){
        var extraParameters = JSON.parse(req.query.extraParameters);
        sessionId = extraParameters.sessionId;
    }
    var limit = req.query.limit;
    var skip = req.query.skip;
    var testArray = [];

    if(req.query.condition){
        var updateUGC = req.query.condition;
    }

    console.log('[FM.censorHandler.gettimeslots_get_cb()] sessionId=%s', sessionId);
    scheduleMgr.getProgramListBySession(sessionId, limit, skip, function(err, programList){
        debugger;
        if (!err){
            if (programList.length > 0){
                censorMgr.getPlayList(programList , updateUGC, function(errGetPlayList, result){
                    if (!errGetPlayList){
                        res.render( 'table_censorPlayList', {ugcCensorPlayList: result} );
                    }
                    else 
                        res.send(400, {error: err});
                });
                
            }
            else {
                res.render( 'table_censorPlayList', {ugcCensorPlayList: []} );
            }
            
        }
        else{
            //res.render( 'table_censorPlayList', {ugcCensorPlayList: testArray} );
          res.send(400, {error: err});
        }
    });

//  testArray =
//  [ { doohTimes: ['2013/5/3 15:14', '2013/6/5 16:14', '2013/8/3 15:08'], //素材照片
//  ugcCensorNo: '035', //影片編號
//  contentGenre: 'mood', //觀看次數
//  userContent: 'yeah', //FB讚次數
//  userPhotoUrl: '/contents/user_project/greeting-50ee77e2fc4d981408000014-20130222T023238273Z/user_data/_cdv_photo_010.jpg', //FB留言數
//  fb_userName: 'NO User', //FB分享次數
//  fbPictureUrl: '/contents/user_project/greeting-50ee77e2fc4d981408000014-20130222T023238273Z/user_data/_cdv_photo_010.jpg', //會員名稱
//  rating: 'a' //投稿次數
//  }
//  ];
//  res.render( 'table_censorPlayList', {ugcCensorPlayList: testArray} );
};

FM.censorHandler.pushProgramsTo3rdPartyContentMgr_get_cb = function(req, res){

    scheduleMgr.pushProgramsTo3rdPartyContentMgr(sessionId, function(err){
        if (!err){
            //TODO pushProgramsTo3rdPartyContentMgr
            res.send(200);
        }
        else{
            res.send(400, {error: err});
        }
    });

};

FM.censorHandler.updatetimeslots_get_cb = function(req, res){

    var programTimeSlot =  req.body.programTimeSlotId;
    var ugcReferenceNo = req.body.ugcReferenceNo;


    if(req.body.type == 'removeUgcfromProgramAndAutoSetNewOne'){
        scheduleMgr.removeUgcfromProgramAndAutoSetNewOne(sessionId, programTimeSlot, function(err, result){
            if (!err){
                res.send(200, {message: result});
            }
            else{
                res.send(400, {error: err});
            }
        });
    }

    if(req.body.type == 'setUgcToProgram'){
        
        scheduleMgr.setUgcToProgram(programTimeSlot, ugcReferenceNo, function(err, result){
            if (!err){
                res.send(200, {message: result});
            }
            else{
                res.send(400, {error: err});
            }
        });
    }

};

module.exports = FM.censorHandler;