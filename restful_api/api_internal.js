

exports.init = function() {

   // Internal

    app.get('/internal/oauth2callback', routes.YoutubeOAuth2_cb );
    app.get('/internal/commands', routes.connectionHandler.command_get_cb);
    app.post('/internal/command_responses', routes.connectionHandler.commandResponse_post_cb); 

    app.post('/internal/dooh/movie_playing_state', routes.doohHandler.doohMoviePlayingState_post_cb);  //TODO: PUT /internal/dooh/movie_playing_state is better
    app.post('/internal/dooh/dooh_periodic_data', routes.doohHandler.importPeriodicData);  //TODO: POST /internal/adapter/schedule_periodic_data is better
    app.get('/internal/dooh/dooh_current_video', routes.doohHandler.dooh_current_UGC);  

    //GET push html to dooh player and trigger story camera.
    app.get('/internal/dooh/padding_start_html/:contentGenre', routes.doohHandler.streamVideoTrigger);
    //PUT get play dooh video play time.
    app.put('/available_street_movies/:playTime', routes.storyCamControllerHandler.availableStreetMovies);

    app.post('/internal/story_cam_controller/available_story_movie', routes.storyCamControllerHandler.availableStoryMovie_post_cb);

};