
var DEBUG = true,
    FM_LOG = (DEBUG) ? function(str){ logger.info( typeof(str)==='string' ? str : JSON.stringify(str) ); } : function(str){} ;
 
var FM = { censor_handler: {} };

var censor_mgr = require("../censor_mgr.js");
var apis = require("../routes/api.js");

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
    
    censor_mgr.getUGCList(req,res);

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
     
     censor_mgr.setUGCAttribute(req,res);

  };
 
//FM.censor.timeslots_get_cb = function(req, res){
 //
 //};

module.exports = FM.censor_handler;