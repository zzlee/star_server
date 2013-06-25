
var censorMgr = {};

var globalConnectionMgr = require('./global_connection_mgr.js');
var fb_handler = require('./fb_handler.js');
var FMDB = require('./db.js');
var UGCs = FMDB.getDocModel("ugc");


/**
 * @param  request
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
var getUGCList = function(condition,get_cb){

    FMDB.listOfdocModels( UGCs,condition,'fb.userName fb.userID _id title description createdOn rating doohPlayedTimes', {sort:{createdOn: -1}}, function(err, result){
        if(err) {logger.error('[db.listOfUGCs]', err);
            get_cb(err,null);
        }
        if(result){
            limit = result.length;
//          console.log("listOfdocModels_result"+result);
            get_cb(null,limit);
        }
    });


    /**test
    var vjson = {
            rating : 'a',
            description: 'test'
    };
    FMDB.createAdoc(UGCs,vjson, function(err, result){
        if(err)  console.log("createAdoc_err"+err);
        if(result) console.log("createAdoc_res"+result);
    });
     */

};//getUGCList end


//kaiser test
var condition;
var start = new Date('Jun 25, 2013');
var end = new Date('Jun 26, 2013');
var doohPlayedTimes = 0;
var rating = 'd';
condition = {'createdOn': {$gte: start, $lt: end},
'doohPlayedTimes':doohPlayedTimes,
'rating':rating
};
getUGCList(condition,function(err,res){
    if(err) console.log("getUGCList_err="+err);
    else console.log("getUGCList="+res);

});


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
        if(err)
            get_cb(JSON.stringify(err),null);
//            console.log("err: " + JSON.stringify(err));
        else
            get_cb(null,JSON.stringify(result));
//            console.log("result: "+JSON.stringify(result));
    });

};
//kaiser test
var fb_id = '100005962359785';
getUserContent(fb_id,function(err,res){
    if(err) console.log("getUserContent_err="+err);
    else console.log("getUserContent="+res);

});

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
//          console.log("updateAdoc_result"+result);
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