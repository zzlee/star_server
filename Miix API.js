/**
 * Here is the description.<br>
 * <h5>HEADDER</h5>
 * Line 2
 * @name highlightSearchTerm
 * @function
 * @global
 * @param {string} term - The search term to highlight.
 */

/**
 *       GET /miix_admin/user_content_items?offset=0&limit=20
 * @param  request
 * 
 *         query    
 *                  
 * @return response json{userContent(photo url or userContent link in s3), 
 *                       UGCLevel(Range A~E),
 *                       FBProfilePicture(link),
 *                       FB_ID,
 *                       doohPlayedTimes}
 */
app.get('/miix_admin/user_content_items', routes.censor_handler.getUGCList_get_cb);
/**
 *       PUT /miix_admin/user_content_items/{id}
 * @param  request  {string}projectId.
 * 
 *         body     {string}UGCLevel(Range A~E)    
 *                  
 * @return response {string}status 
 */
app.put('/miix_admin/user_content_attribute', routes.censor_handler.setUGCAttribute_get_cb);
/**
 * ��    GET /miix_admin/doohs/{dooh_id}/timeslots?&offset=0&limit=20
 * @param  request  {string}dooh.client(dooh_id)
 * 
 *         query    {number}searchTime start.
 *                  {number}searchTime end.
 *                  
 * @return response json{timeslotnumber(Range 1~20), 
 *                       startTime,
 *                       endTime,
 *                       UGC_Url,
 *                       UGC_ID}
 */
app.get('/miix_admin/timeslots', routes.censor_handler.timeslots_get_cb);
/**
 * ��    PUT /miix_admin/doohs/{dooh_id}/timeslots/{timeslot_id}
 * @param  request  {string}timeslot_id.
 *                  
 *         body     json{timeslotnumber(Range 1~20), 
 *                       UGC_Url,
 *                       UGC_ID}    
 *                  
 * @return response {string}status 
 */
