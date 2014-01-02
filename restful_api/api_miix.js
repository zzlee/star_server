
exports.init = function() {
    /**
     * RESTful APIs for Miix clientss
     * @namespace miix
     */


    /**
     * Upload/add an user content file of a specific video or image UGC<br>
     * 
     * <h5>Path parameters</h5>
     * <ul>
     * <li>ugcProjectId: the project ID of the UGC
     * </ul>
     * 
     * <h5>Query parameters</h5>
     * None
     * 
     * <h5>Request body</h5>
     * (to be elaborated later)
     * 
     * <h5>Response body</h5>
     * 
     * @name POST /miix/ugcs/:ugcProjectId/user_content_files
     * @memberof miix
     */
//    app.post('/miix/videos/user_content_files', routes.authorizationHandler.checkAuth, routes.uploadUserContentFile_cb ); //v1.2
    app.post('/miix/videos/user_content_files', routes.uploadUserContentFile_cb ); //v1.2

    /**
     * Upload/add an user content file of a specific video or image UGC from web app<br>
     * 
     * <h5>Path parameters</h5>
     * <ul>
     * <li>ugcProjectId: the project ID of the UGC
     * </ul>
     * 
     * <h5>Query parameters</h5>
     * None
     * 
     * <h5>Request body</h5>
     * (to be elaborated later)
     * 
     * <h5>Response body</h5>
     * 
     * @name POST /miix/ugcs/:ugcProjectId/user_content_files
     * @memberof miix
     */
    app.post('/miix/videos/webapp/user_content_files', routes.uploadUserContentFileFromWebApp_cb ); //v1.2
    
    /**
     * Create an user content description of a specific video UGC<br>
     * 
     * <h5>Path parameters</h5>
     * <ul>
     * <li>ugcProjectId: the project ID of the UGC
     * </ul>
     * 
     * <h5>Query parameters</h5>
     * None
     * 
     * <h5>Request body</h5>
     * (to be elaborated later)
     * 
     * <h5>Response body</h5>
     * 
     * @name POST /miix/video_ugcs/:ugcProjectId/user_content_descriptions
     * @memberof miix
     */
    app.post('/miix/videos/user_content_description', routes.authorizationHandler.checkAuth, routes.uploadUserDataInfo_cb);  //v1.2

    /**
     * Create an user content description of a specific image UGC<br>
     * 
     * <h5>Path parameters</h5>
     * <ul>
     * <li>ugcProjectId: the project ID of the UGC
     * </ul>
     * 
     * <h5>Query parameters</h5>
     * None
     * 
     * <h5>Request body</h5>
     * (to be elaborated later)
     * 
     * <h5>Response body</h5>
     * 
     * @name POST /miix/image_ugcs/:ugcProjectId/user_content_descriptions
     * @memberof miix
     */


    app.get('/miix/videos/new_videos', routes.api.newUGCList); //v1.2 only, to be DEPRECATED after new design of UGC list in v2.0

    /**
     * Create a video UGC of a specific project ID<br>
     * 
     * <h5>Path parameters</h5>
     * <ul>
     * <li>ugcProjectId: the project ID of the UGC
     * </ul>
     * 
     * <h5>Query parameters</h5>
     * None
     * 
     * <h5>Request body</h5>
     * (to be elaborated later)
     * 
     * <h5>Response body</h5>
     * 
     * @name PUT /miix/video_ugcs/:ugcProjectId
     * @memberof miix
     */
    app.put('/miix/video_ugcs/:ugcProjectId', routes.authorizationHandler.checkAuth, routes.miixHandler.putVideoUgcs_cb);
    app.post('/miix/video_ugcs/:ugcProjectId', routes.authorizationHandler.checkAuth, routes.miixHandler.putVideoUgcs_cb);//TODO use PUT to do JMeter test

    app.post('/miix/videos/miix_videos', routes.authorizationHandler.checkAuth, routes.api.submitAUGC); //v1.2

    app.post('/miix/videos/videos_on_dooh', routes.api.submitDooh); //v1.2 only.  In v2.0, all UGCs are to be played on a DOOH

    /**
     * Upload a base64 image UGC of a specific project ID. The uploaded image data will be save as a PNG file.<br>
     * <br>
     * The base64 image is often generated by calling toDataURL() of HTML5 Canvas. 
     * It normally needs to do the following process before sending to this API:<br>
     * yourCanvas.toDataURL('image/png').replace('image/octet-stream');
     * 
     * <h5>Path parameters</h5>
     * <ul>
     * <li>ugcProjectId: the project ID of the UGC
     * </ul>
     * 
     * <h5>Query parameters</h5>
     * None
     * 
     * <h5>Request body</h5>
     * (to be elaborated later)
     * 
     * <h5>Response body</h5>
     * 
     * @name PUT /miix/base64_image_ugcs/:ugcProjectId
     * @memberof miix
     */
    app.put('/miix/base64_image_ugcs/:ugcProjectId', routes.authorizationHandler.checkAuth, routes.miixHandler.putBase64ImageUgcs_cb); 
    app.post('/miix/base64_image_ugcs/:ugcProjectId', routes.authorizationHandler.checkAuth, routes.miixHandler.putBase64ImageUgcs_cb);//TODO use PUT to do JMeter test 


    /**
     * Get a list of latest UGC highlights, sorted by creating time (the newest at beginning)<br>
     * 
     * <h5>Path parameters</h5>
     * None
     * 
     * <h5>Query parameters</h5>
     * <ul>
     * <li>limit: the number of UGC items to return
     * </ul>
     * 
     * <h5>Request body</h5>
     * None
     * 
     * <h5>Response body</h5>
     * 
     * @name GET /miix/ugc_hightlights
     * @memberof miix
     */
    app.get('/miix/ugc_hightlights', routes.authorizationHandler.checkAuth, routes.miixHandler.getUgcHighlights_cb);//TODO deprecated
    app.get('/miix/ugc_highlights', routes.authorizationHandler.checkAuth, routes.miixHandler.getUgcHighlights_cb);
    /*
    app.get('/miix/ugc_hightlights', function(req, res){
        var db = require('./db.js');
        
        var ugcModel = db.getDocModel("ugc");
        ugcModel.find({ "rating": "A", $or: [ { "contentGenre":"miix_it" }, { "contentGenre": "check_in"} ] }).sort({"createdOn":-1}).limit(10).exec(function (err, docs) {
            if (!err){
                res.send(docs);
            }
            else {
                res.send(400, {error: err} );
            }
            
        });
        
    });*/

    /**
     * Get a list of latest UGCs of a specific member , sorted by creating time (the newest at beginning)<br>
     * <h5>Path parameters</h5>
     * <ul>
     * <li>memberId: Member ID (_id of 24 character hex string)
     * </ul>
     * 
     * <h5>Query parameters</h5>
     * <ul>
     * <li>limit: the number of UGC items to return
     * </ul>
     * 
     * <h5>Request body</h5>
     * None
     * 
     * <h5>Response body</h5>
     * @name GET /miix/members/:memberId/ugcs
     * @memberof miix
     */
    app.get('/miix/members/:memberId/ugcs', routes.authorizationHandler.checkAuth, routes.miixHandler.getUgcs_cb);

    /**
     * Get a list of latest live content items (a.k.a. "Miix Story" or "Story MV") of a specific member , sorted by creating time (the newest at beginning)<br>
     * <h5>Path parameters</h5>
     * <ul>
     * <li>memberId: Member ID (_id of 24 character hex string)
     * </ul>
     * 
     * <h5>Query parameters</h5>
     * <ul>
     * <li>limit: the number of UGC items to return
     * </ul>
     * 
     * <h5>Request body</h5>
     * None
     * 
     * <h5>Response body</h5>
     * @name GET /miix/members/:memberId/live_contents
     * @memberof miix
     */
    app.get('/miix/members/:memberId/live_contents', routes.authorizationHandler.checkAuth, routes.miixHandler.getLiveContents_cb);

    /**
     * Create a FB post id UGC of a specific project ID<br>
     * 
     * <h5>Path parameters</h5>
     * <ul>
     * <li>ugcProjectId: the project ID of the UGC
     * </ul>
     * 
     * <h5>Query parameters</h5>
     * None
     * 
     * <h5>Request body</h5>
     * <ul>
     * <li>fb_postId: the ID of the fb post id
     * </ul>
     * 
     * <h5>Response body</h5>
     * 
     * @name PUT /miix/fb_ugcs/:ugcProjectId
     * @memberof miix
     */
    app.put('/miix/fb_ugcs/:ugcProjectId', routes.authorizationHandler.checkAuth, routes.miixHandler.putFbPostIdUgcs_cb);
    
    /**
     * Create a FB post id userLiveContent of a specific project ID<br>
     * 
     * <h5>Path parameters</h5>
     * <ul>
     * <li>ugcProjectId: the project ID of the userLiveContent
     * </ul>
     * 
     * <h5>Query parameters</h5>
     * None
     * 
     * <h5>Request body</h5>
     * <ul>
     * <li>fb_postId: the ID of the fb post id
     * </ul>
     * 
     * <h5>Response body</h5>
     * 
     * @name PUT /miix/fb_userLiveContents/:ugcProjectId
     * @memberof miix
     */
    app.put('/miix/fb_userLiveContents/:ugcProjectId', routes.authorizationHandler.checkAuth, routes.miixHandler.putFbPostIdUserLiveContents_cb);

    /**
     * Get a list of message <br>
     * <h5>Path parameters</h5>
     * <ul>
     * <li>memberId: Member ID (_id of 24 character hex string)
     * </ul>
     * 
     * <h5>Query parameters</h5>
     * <ul>
     * <li>limit: the number of message items to return
     * </ul>
     * 
     * <h5>Request body</h5>
     * None
     * 
     * <h5>Response body</h5>
     * @name GET /miix/members/:memberId/message
     * @memberof miix
     */
    app.get('/miix/members/:memberId/message', routes.authorizationHandler.checkAuth, routes.miixHandler.getMessageList_cb);
    
    /**
     * Update a message of a specific message ID<br>
     * 
     * <h5>Path parameters</h5>
     * <ul>
     * <li>messageId: Message ID (_id of 24 character hex string)
     * </ul>
     * 
     * <h5>Query parameters</h5>
     * None
     * 
     * <h5>Request body</h5>
     * <ul>
     * <li>result:"done" 
     * </ul>
     * 
     * <h5>Response body</h5>
     * 
     * @name PUT /miix/members/:memberId/message/:messageId
     * @memberof miix
     */
    app.put('/miix/message/:messageId', routes.authorizationHandler.checkAuth, routes.miixHandler.updateMessage_cb);
    
    app.get('/miix/getVIPStatus', routes.miixHandler.getVIPStatus_cb);
    
    app.put('/miix/updateVIPStatus', routes.miixHandler.updateVIPStatus_cb);
    
    app.put('/miix/updateVIPinUGC', routes.miixHandler.updateVIPinUGC_cb);


};