
var censorMgr = {};

/**
 * @param  request
 * 
 *         query    {number}createdOn
 *                  {string}UGCLevel
 *                  {number}doohPlayedTimes     
 *                  
 * @return response json{userContent(photo url or userContent link in s3),
 *                       FB_ID,
 *                       title,
 *                       description,
 *                       createdOn,
 *                       UGCLevel(Range A~E),
 *                       doohPlayedTimes}
 */
var getUGCList = function(get_cb){
    
};


/**
 * @param  request  {string}dooh_ID
 * 
 *         query    {number}startDate
 *                  {number}endDate
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