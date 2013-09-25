
exports.init = function() {

    //generic 

    app.get('/fb/comment', routes.api.fbGetCommentReq); 
    app.get('/fb/thumbnail', routes.api.fbGetThumbnail);
    app.get('/members/authentication_code', routes.authorizationHandler.checkAuth, routes.api.codeGenerate);
    app.post('/members/authentication_code_validity', routes.authorizationHandler.checkAuth, routes.api.codeVerify);  //TODO: better use GET
    app.get('/members/fb_token_validity', routes.authorizationHandler.checkAuth, routes.member.isFBTokenValid);
    app.post('/members/fb_info', routes.api.signupwithFB);
    app.get('/connectStarServer', routes.api.connection);  //Make sure client side connect connect star_server
    app.post('/api/codeVerification', routes.api.codeVerify);

    //PUT /members/{_id}/device_tokens 
    app.put('/members/:memberId/device_tokens', routes.authorizationHandler.checkAuth, routes.authorizationHandler.updateDeviceToken);

};