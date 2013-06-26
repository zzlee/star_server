
var DEBUG = true,
    FM_LOG = (DEBUG) ? function(str){ logger.info( typeof(str)==='string' ? str : JSON.stringify(str) ); } : function(str){} ;
 
var FM = { censor_handler: {} };

var censor_mgr = require("../censor_mgr.js");
//FM.censor.userContentItems_get_cb = function(req, res){
//    
//};
//
//
//FM.censor.timeslots_get_cb = function(req, res){
//};

console.log("censor_mgr");

/**
 * @param  request  {json}sort:{?}
 *                        ex:{
 *                            sort:{rating:1,
 *                                  doohPlayedTimes:-1,
 *                                  description:-1
 *                                 }
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
    
    console.log("censor_mgr");
    censor_mgr.getUGCList(req.condition, req.sort, function(err, result){
        if(err) logger.error("[censor_handler.getUGCList_get_cb] ", err);
        if(result){

        }else{
            res.send(401,{message: "Wrong Condition/Sort Match!"});
        }
    });

 };

module.exports = FM.censor_handler;