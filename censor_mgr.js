/**
 * @fileoverview Implementation of censorMgr
 */

/**
 * The manager who handles censoring UGCs applied for playing on a DOOH
 *
 * @mixin
 */
var censorMgr = {};

/**
 * @param {Object} query An object specifying the querying rule: <br>
 *     <ul>
 *     <li>createdOn: Date()-readable string specifying the start of the interval
 *     <li>rating: A string specifying the rating of the UGC
 *     <li>doohPlayedTimes: A number specifying how many times the UGC has played
 *     </ul>
 *                  
 * @param {Function} get_cb The callback function called when the result list is generated.<br>
 *     The function signature is get_cb(resultUgcList, err) :
 *     <ul>
 *     <li>resultUgcList: An object containing program info:
 *         <ul>
 *         <li>userContent: photo url or userContent link in s3  
 *         <li>FB_ID:
 *         <li>title:
 *         <li>description:
 *         <li>createdOn:
 *         <li>rating: Range A~E
 *         <li>doohPlayedTimes:
 *         </ul>
 *         For example, .....
 *         
 *     <li>err: error message if any error happens
 *     </ul>
 */
censorMgr.getUGCList = function(get_cb){
    
};


/*
 * param  request  {string}dooh_ID
 * 
 *         query    
 *                  
 * return response json{startDate,
 *                       endDate,
 *                       sequence,
 *                       uratio}
 * 
 */
censorMgr.getTimeslots = function(get_cb){
    
};


/*
 * param  request  {string}FB_ID
 * 
 *         query    
 *                  
 * return response json{FBProfilePicture(link)}
 *                       
 */
censorMgr.getUserContent = function(get_cb){
    
};


/*
 * param  request  {string}projectId
 * 
 *         body     {string}UGCLevel(Range A~E)    
 *                  
 * return response {string}status 
 *                       
 */
censorMgr.setUGCAttribute = function(get_cb){
    
};