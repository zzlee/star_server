

exports.init = function() {

 // == DEPRECATED ==, but used by MiixCard v1.2 or earlier versions
    app.post('/members/device_tokens', routes.api.deviceToken); //DEPRECATED


    //movie gen
    app.get('/get_template_list', routes.getTemplateList_cb ); //not used in MiixCard v1.2
    app.get('/get_template_raw_data', routes.getTemplateRawData_cb ); //not used in MiixCard v1.2
    app.get('/get_template_description', routes.getTemplateDescription_cb ); //not used in MiixCard v1.2
    app.get('/get_template_customizable_object_list', routes.getTemplateCustomizableObjectList_cb ); //not used in MiixCard v1.2
    //app.post('/upload_user_data', routes.uploadUserData_cb ); //not used in MiixCard v1.2

    app.get('/oauth2callback', routes.YoutubeOAuth2_cb );

    //admin
    app.get('/admin', routes.admin.get_cb); 
    app.get('/admin/login', routes.admin.login_get_cb);
    app.get('/admin/logout', routes.admin.logout_get_cb);
    app.get('/admin/member_list', routes.admin.memberList_get_cb);
    app.get('/admin/miix_play_list', routes.admin.miixPlayList_get_cb);
    app.get('/admin/story_play_list', routes.admin.storyPlayList_get_cb);
    app.get('/admin/list_size', routes.admin.listSize_get_cb);


    //internal
    app.post('/internal/dooh_periodic_data', routes.doohHandler.importPeriodicData);
    app.get('/internal/dooh_current_video', routes.doohHandler.dooh_current_UGC);
    app.post('/internal/dooh_timeslot_rawdata', routes.timeDataGet);

    //GET push html to dooh player and trigger story camera.
    app.get('/internal/dooh/stream_video_trigger', routes.doohHandler.streamVideoTrigger);


    //FM.API
    app.get('/api/eventsOfWaiting', routes.api.eventsOfWaiting); //not used in MiixCard v1.0 or later
    app.get('/api/schedule', routes.api.eventsOfPeriod); //not used in MiixCard v1.0 or later
    app.get('/api/fbGetComment', routes.api.fbGetCommentReq); 
    app.get('/api/fbGetThumbnail', routes.api.fbGetThumbnail);
    app.get('/api/newVideoList', routes.api.newUGCList);
    app.get('/api/newStreetVideoList', routes.api.newStreetUGCList); //not used in MiixCard v1.2
    app.get('/api/codeGeneration', routes.api.codeGenerate);

    //member.js
    app.get('/api/member.isFBTokenValid', routes.member.isFBTokenValid);

    app.post('/api/signin', routes.api.signin);  //not used in MiixCard v1.0 or later, but worse to be kept for Miix web client
    app.post('/api/signup', routes.api.signup);  //not used in MiixCard v1.0 or later, but worse to be kept for Miix web client
    app.post('/api/addEvent', routes.api.addEvent); //not used in MiixCard v1.0 or later
    app.post('/api/reject', routes.api.reject); //not used in MiixCard v1.0 or later
    app.post('/api/prove', routes.api.prove); //not used in MiixCard v1.0 or later
    app.post('/api/signupwithFB', routes.api.signupwithFB);
    app.post('/api/deviceToken', routes.api.deviceToken);
    app.post('/api/submitAVideo', routes.api.submitAUGC);
    app.post('/api/submitDooh', routes.api.submitDooh);
    app.post('/api/codeVerification', routes.api.codeVerify);

    app.del('/', routes.api.signout); //not used in MiixCard v1.0 or later, but worse to be kept for Miix web client

};