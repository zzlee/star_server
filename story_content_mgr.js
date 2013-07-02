var storyContentMgr = {};

var async = require('async');
var workingPath = process.cwd();
var aeServerMgr = require(workingPath+'/ae_server_mgr.js');
var doohMgr = require(workingPath+'/dooh_mgr.js');
var storyCamControllerMgr = require(workingPath+'/story_cam_controller_mgr.js');
var memberDB = require(workingPath+'/member.js');
var UGCDB = require(workingPath+'/UGC.js');
var fmapi = require(workingPath+'/routes/api.js'); 

var downloadStoryMovieFromStoryCamControllerToAeServer = function(movieProjectID, downloaded_cb){

    //storyCamControllerMgr.uploadStoryMovieToMainServer(movieProjectID, function(resParametes){
        //logger.info('uploading story movie from Story Cam Controller to Main Server finished. ');
    storyCamControllerMgr.uploadStoryMovieToS3(movieProjectID, function(resParametes){
        logger.info('uploading story movie from Story Cam Controller to S3 finished. ');
        logger.info('res: _command_id='+resParametes._command_id+' err='+resParametes.err);
        
        //TODO:: check the file size. If not correct, re-upload.
        
        if ( (resParametes.err == 'null') || (!resParametes.err) ) {
            //aeServerMgr.downloadStoryMovieFromMainServer(movieProjectID, function(resParameter2){
                //logger.info('downloading story movie from Main Server to AE Server.');
            aeServerMgr.downloadStoryMovieFromS3(movieProjectID, function(resParameter2){
                logger.info('downloading story movie from S3 to AE Server.');
                logger.info('res: _command_id='+resParameter2._command_id+' err='+resParameter2.err);
                
                //TODO:: check the file size. If not correct, re-download.
                
                if ( (resParameter2.err == 'null') || (!resParameter2.err) ) {
                    if (downloaded_cb){
                        downloaded_cb(null);
                    }
                }
                else{
                    if (downloaded_cb){
                        downloaded_cb('Fail to download story movie from S3 to AE Server');
                    }				
                }
            }); 
        }
        else{
            if (downloaded_cb){
                downloaded_cb('Fail to download story movie from Story Cam Controllerr to S3');
            }				
        }
    }); 
    

};

var downloadMiixMovieFromS3 = function(_miixMovieProjectID, _miixMovieFileExtension, downloaded_cb){
    aeServerMgr.downloadMiixMovieFromS3(_miixMovieProjectID, _miixMovieFileExtension, function(resParameter3){
        if ( (resParameter3.err == 'null') || (!resParameter3.err) ) {
            if (downloaded_cb){
                downloaded_cb(null);
            }
        }
        else{
            if (downloaded_cb){
                downloaded_cb('Fail to download Miix movie from S3');
            }               
        } 
    });
};

storyContentMgr.generateStoryMV = function(miixMovieProjectID) {
    var ownerStdID = null;
    var ownerFbID = null;
    //var ownerFbName = null;
    var movieTitle = null;
    var miixMovieFileExtension = ".flv";
    
    var getUserIdAndName = function( finish_cb ){
        UGCDB.getOwnerIdByPid( miixMovieProjectID, function( err, _ownerStdID) {
            if (!err) {
                ownerStdID = _ownerStdID;
                memberDB.getUserNameAndID( ownerStdID, function(err2, result){
                    if (!err2) {
                        ownerFbID = result.fb.userID;
                        //ownerFbName = result.fb.userName;
                        movieTitle = "Miix movie playing on a DOOH";
                        if (finish_cb){
                            finish_cb(null);
                        }					
                    } 
                    else {
                        if (finish_cb){
                            finish_cb("memberDB.getUserNameAndID() failed: "+err2);
                        }
                    }
                });
            }
            else{
                if (finish_cb){
                    finish_cb("UGCDB.getOwnerIdByPid() failed: "+err);
                }
            }
        });
    
    };
    
    /*
    downloadStoryMovieFromStoryCamControllerToAeServer( miixMovieProjectID, function(err){
        
        if (!err){
            getUserIdAndName(function(err2){
                if (!err2){
                    //TODO: get the file extension of this Miix movie
                    aeServerMgr.createStoryMV( miixMovieProjectID, ownerStdID, ownerFbID, movieTitle, function(responseParameters){
                    
                        logger.info('generating Story MV finished. ');
                        logger.info('res: _command_id='+responseParameters._command_id+' err='+responseParameters.err+' youtube_video_id='+responseParameters.youtube_video_id);
                        
                        if ( responseParameters.youtube_video_id ) {
                            var aeServerID = responseParameters.ae_server_id;
                            var youtubeVideoID = responseParameters.youtube_video_id;
                            var storyMovieProjectID = responseParameters.movie_project_id;
                            logger.info('storyMovieProjectID= '+storyMovieProjectID);
                            //var youtubeVideoID = "VNrn-jhmLBE"; //GZ temporarily hard code for test
                            
                            
                            
                            if ( responseParameters.err == 'null' || (!responseParameters.err) ) {
                            
                                
                                var url = {"youtube":"http://www.youtube.com/embed/"+youtubeVideoID};			
                                var vjson = {"title": movieTitle,
                                             "ownerId": {"_id": ownerStdID, "userID": ownerFbID},
                                             "url": url,
                                             "genre":"miix_story",
                                             "aeId": aeServerID,
                                             "projectId":storyMovieProjectID};
                                UGCDB.addUGC(vjson, function(err, result){
                                    if(err) {
                                        throw err;
                                    }
                                    else {
                                        fmapi._fbPostUGCThenAdd(vjson); 
                                        logger.info('fmapi._fbPostUGCThenAdd(vjson) called. vjson='+JSON.stringify(vjson));
                                    }
                                });
                            }
                            
                        }
                        
                    });
                }
                else{
                    logger.info('fail to get user ID and name');
                }
            });
        }
        else {
            logger.info('fail to download Story Movie from Cam Controller to AE Server');
        }
        
        
    });*/
    
    
    
    //------ using async -----
    async.series([
                  function(cb1){
                      downloadStoryMovieFromStoryCamControllerToAeServer( miixMovieProjectID, function(err1){
                          cb1(err1);
                      });
                  },
                  function(cb2){
                      getUserIdAndName(function(err2){
                          cb2(err2);
                      });
                  },
                  function(cb3){
                      //get the file extension of this Miix movie
                      UGCDB.getValueByProject(miixMovieProjectID, "ownerId _id url.youtube", function(err3, result){ 
                          if (!err3){
                              if (result){
                                  miixMovieFileExtension = result.fileExtension;
                              }                              
                              cb3(null);
                          }
                          else {
                              cb3("UGCDB.getValueByProject() failed: "+err3);
                          }
                          
                      });
                      
                  },
                  function(cb5){
                      downloadMiixMovieFromS3(miixMovieProjectID, miixMovieFileExtension, function(err5){
                          cb5(err5);
                      });
                  },
                  function(cb4){
                      aeServerMgr.createStoryMV( miixMovieProjectID, miixMovieFileExtension, ownerStdID, ownerFbID, movieTitle, function(responseParameters){
                          
                          logger.info('generating Story MV finished. ');
                          logger.info('res: _command_id='+responseParameters._command_id+' err='+responseParameters.err+' youtube_video_id='+responseParameters.youtube_video_id);
                          
                          if ( responseParameters.youtube_video_id ) {
                              var aeServerID = responseParameters.ae_server_id;
                              var youtubeVideoID = responseParameters.youtube_video_id;
                              var storyMovieProjectID = responseParameters.movie_project_id;
                              logger.info('storyMovieProjectID= '+storyMovieProjectID);
                              //var youtubeVideoID = "VNrn-jhmLBE"; //GZ temporarily hard code for test
                              
                              
                              
                              if ( responseParameters.err == 'null' || (!responseParameters.err) ) {
                              
                                  
                                  var url = {"youtube":"http://www.youtube.com/embed/"+youtubeVideoID};           
                                  var vjson = {"title": movieTitle,
                                               "ownerId": {"_id": ownerStdID, "userID": ownerFbID},
                                               "url": url,
                                               "genre":"miix_story",
                                               "aeId": aeServerID,
                                               "projectId":storyMovieProjectID};
                                  UGCDB.addUGC(vjson, function(err, result){
                                      if(err) {
                                          cb4("UGCDB.addUGC() failed : "+ err);
                                      }
                                      else {
                                          fmapi._fbPostUGCThenAdd(vjson); 
                                          logger.info('fmapi._fbPostUGCThenAdd(vjson) called. vjson='+JSON.stringify(vjson));
                                          cb4(null);
                                      }
                                  });
                              }
                              
                          }
                          else {
                              cb4("Failed to created Story MV.");
                          }
                         
                      });
                  }
              ],
              
              
              function(err, results){
                  if (err) {
                      logger.error(err);
                  }
              });
    
};

module.exports = storyContentMgr;
