
var censorMgr = {};

var globalConnectionMgr = require('./global_connection_mgr.js');

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
    var UGC_mgr = require('./UGC.js');
    var FMDB = require('./db.js');
    
    var UGCs = FMDB.getDocModel("ugc");
 //test   
    var start = new Date('Jun 26, 2013');
    var end = new Date('Jun 26, 2013');
    var doohPlayedTimes = 0;
    var rating = 'a';
    
//    condition = {'createdOn': {$gte: start, $lt: end},
//                 'doohPlayedTimes':doohPlayedTimes,
//                 'rating':rating
//    };
//    
    FMDB.listOfdocModels( UGCs,condition,'fb.userName fb.userID _id title description createdOn rating doohPlayedTimes', {sort:{createdOn: -1}}, function(err, result){
        if(err) {logger.error('[db.listOfUGCs]', err);
                get_cb(err);
        }
        if(result){

                limit = result.length;
                
//                console.log("listOfdocModels_result"+result);
                get_cb(limit);
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
getUGCList(null,function(err,res){
    if(err) console.log("getUGCList"+err);
    else console.log("getUGCList"+res);
    
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
var getUserContent = function(get_cb){
    
};


/**
 * @param  request  {string}projectId
 * 
 *         body     {string}UGCLevel(Range A~E)    
 *                  
 * @return response {string}status 
 *                       
 */
var setUGCAttribute = function(get_cb){
    
};


module.exports = censorMgr;