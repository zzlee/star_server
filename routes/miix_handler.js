﻿/**
 * @fileoverview Implementation of miixHandler
 */

var miixHandler = {};

var miixContentMgr = require('../miix_content_mgr.js');
var ugc = require('../UGC.js');
var path = require('path');
var fs = require('fs');
var workingPath = process.cwd();

//PUT /miix/base64_image_ugcs/:ugcProjectId
miixHandler.putBase64ImageUgcs_cb = function(req, res) {
    logger.info('[PUT '+req.path+'] is called');
//    console.dir(req.body);
    var timeOfBeingCalled = (new Date()).getTime();
    
    var customizableObjects = JSON.parse(req.body.customizableObjects);
    if (req.body.imgBase64 && req.body.ownerId && req.body.ownerFbUserId){

        var ugcInfo = {
                ownerId:{_id:req.body.ownerId, fbUserId: req.body.ownerFbUserId },
                contentGenre: req.body.contentGenre,
                title: req.body.title,
                customizableObjects: customizableObjects
        };
        
        miixContentMgr.addMiixImage(req.body.imgBase64, req.body.imgDoohPreviewBase64,  req.params.ugcProjectId, ugcInfo, function(err){
            if (!err){
                var elapseTime = (new Date()).getTime() - timeOfBeingCalled;
                logger.info('[PUT '+req.path+'] responded in '+elapseTime+' ms');
                res.send(200);
                miixContentMgr.pushRandomMessage( ugcInfo.ownerId._id, req.params.ugcProjectId, function(err, result){
                    if(!err) logger.info('[miixHandler_pushRandomMessage] ownerId= '+ugcInfo.ownerId._id+' ugcProjectId'+req.params.ugcProjectId+'result ='+result);
                    else logger.error('[miixHandler_pushRandomMessage] ownerId= '+ugcInfo.ownerId._id+' ugcProjectId'+req.params.ugcProjectId+'err ='+err);
                });
            }
            else {
                logger.error('[PUT /miix/base64_image_ugcs/:ugcProjectId]: '+ err);
                res.send(400, {error: err});
            }
        });
    }
    else {
        res.send(400, {error: "Not all needed data are sent."});
    }
    
};
//PUT /miix/base64_image_ugcs_from_web/:ugcProjectId
miixHandler.putBase64ImageUgcsFromWeb_cb = function(req, res){
	logger.info('[PUT '+req.path+'] is called');
//  console.dir(req.body);
	var timeOfBeingCalled = (new Date()).getTime();
  
	var customizableObjects = JSON.parse(req.body.customizableObjects);
	if (req.body.imgBase64 && req.body.ownerId && req.body.ownerFbUserId){

		var ugcInfo = {
              ownerId:{_id:req.body.ownerId, fbUserId: req.body.ownerFbUserId },
              contentGenre: req.body.contentGenre,
              title: req.body.title,
              customizableObjects: customizableObjects
		};
      
		miixContentMgr.addMiixTempImage(req.body.imgBase64, req.body.imgDoohPreviewBase64,  req.params.ugcProjectId, ugcInfo, function(err){
			if (!err){
				var elapseTime = (new Date()).getTime() - timeOfBeingCalled;
				logger.info('[PUT '+req.path+'] responded in '+elapseTime+' ms');
				res.send(200);
			}else {
				logger.error('[PUT /miix/base64_image_ugcs_from_web/:ugcProjectId]: '+ err);
				res.send(400, {error: err});
			}
		});
	}else {
		res.send(400, {error: "Not all needed data are sent."});
	}
};

//PUT /miix/web/ugcs_info/:ugcProjectId
/**
 * Upload ugc's information and let server upload files to S3.<br>
 * The method handle ugc from web app because some browser can't use FileReader to generate long photo and dooh preview.<br>
 * After upload S3 successfully, send the message which UGC's number to tell client side.  
 * @method  miixHandler.putImageUgcsInfo_cb 
 * @returns {Callback}
 */
miixHandler.putImageUgcsInfo_cb = function(req, res){
	logger.info('[PUT '+req.path+'] is called');
	var timeOfBeingCalled = (new Date()).getTime();
	  
	if (req.body.ownerId && req.body.ownerFbUserId){

		var ugcInfo = {
              ownerId:{_id:req.body.ownerId, fbUserId: req.body.ownerFbUserId },
              contentGenre: req.body.contentGenre,
              title: req.body.title,
		};
      
		miixContentMgr.uploadMiixTempImage(req.params.ugcProjectId, ugcInfo, function(err){
			if (!err){
				var elapseTime = (new Date()).getTime() - timeOfBeingCalled;
				logger.info('[PUT '+req.path+'] responded in '+elapseTime+' ms');
				res.send(200);
				 miixContentMgr.pushRandomMessage( ugcInfo.ownerId._id, req.params.ugcProjectId, function(err, result){
	                    if(!err) logger.info('[miixHandler_pushRandomMessage] ownerId= '+ugcInfo.ownerId._id+' ugcProjectId'+req.params.ugcProjectId+'result ='+result);
	                    else logger.error('[miixHandler_pushRandomMessage] ownerId= '+ugcInfo.ownerId._id+' ugcProjectId'+req.params.ugcProjectId+'err ='+err);
	                });
			}else {
				logger.error('[PUT /miix/web/ugcs_info/:ugcProjectId]: '+ err);
				res.send(400, {error: err});
			}
		});
	}else {
		res.send(400, {error: "Not all needed data are sent."});
	}
};




//PUT /miix/video_ugcs/:ugcProjectId
miixHandler.putVideoUgcs_cb = function(req, res) {
    logger.info('[PUT '+req.path+'] is called');
    var customizableObjects = JSON.parse(req.body.customizableObjects);
    if (req.body.customizableObjects && req.body.ownerId && req.body.ownerFbUserId){
        
        var ugcInfo = {
                ownerId:{_id:req.body.ownerId, fbUserId: req.body.ownerFbUserId },
                contentGenre: req.body.contentGenre,
                customizableObjects: customizableObjects,
                title: req.body.title
        };
        miixContentMgr.preAddMiixMovie( req.body.imgDoohPreviewBase64, req.params.ugcProjectId, ugcInfo, function(err){
            if (!err){
                res.send(200);
                miixContentMgr.pushRandomMessage( ugcInfo.ownerId._id, req.params.ugcProjectId, function(err, result){
                    if(!err) logger.info('[miixHandler_pushRandomMessage] ownerId= '+ugcInfo.ownerId._id+' ugcProjectId'+req.params.ugcProjectId+'result ='+result);
                    else logger.error('[miixHandler_pushRandomMessage] ownerId= '+ugcInfo.ownerId._id+' ugcProjectId'+req.params.ugcProjectId+'err ='+err);
                });
                
            }
            else {
                logger.error('[PUT /miix/video_ugcs/:ugcProjectId] failed: '+ err);
                res.send(400, {error: err});
            }
        });
    }
    else {
        res.send(400, {error: "Not all needed data are sent."});
    }
    
};

//GET /miix/ugc_hightlights
miixHandler.getUgcHighlights_cb = function(req, res) {
    logger.info('[GET '+req.path+'] is called');
    //console.log('[GET '+req.path+'] is called');
    
    var limit = 0;
    if (req.query.limit){
        limit = req.query.limit;
    }
    else {
        limit = 10;
    }
    
    miixContentMgr.getUgcHighlights(req.query.limit, function(err, ugcHightlights){
        if (!err) {
            res.send(ugcHightlights);
        }
        else {
            res.send(500, {error: err});
        }
    });
};


//GET /miix/members/:memberId/ugcs
miixHandler.getUgcs_cb = function(req, res) {
    logger.info('[GET '+req.path+'] is called');
    //console.log('[GET '+req.path+'] is called');
    
    var limit = 0;
    if (req.query.limit){
        limit = req.query.limit;
    }
    else {
        limit = 10;
    }
    
    ugc.getUGCListByOwnerId(req.params.memberId, limit, 0, function(err, ugcList){
        if (!err) {
            res.send(ugcList);
        }
        else {
            res.send(500, {error: err});
        }
    });
};

//GET /miix/members/:memberId/live_contents
miixHandler.getLiveContents_cb = function(req, res) {
    logger.info('[GET '+req.path+'] is called');
    //console.log('[GET '+req.path+'] is called');
    
    var limit = 0;
    if (req.query.limit){
        limit = req.query.limit;
    }
    else {
        limit = 10;
    }
    
    miixContentMgr.getUserLiveContentList(req.params.memberId, limit, 0, function(err, userLiveContentList){
        if (!err) {
            res.send(userLiveContentList);
        }
        else {
            res.send(500, {error: err});
        }
    });
};

//PUT /miix/fb_ugcs/:ugcProjectId
miixHandler.putFbPostIdUgcs_cb = function(req, res) {
    logger.info('[PUT '+req.path+'] is called');
    if (req.body.fb_postId){
        var ugcInfo = req.body.fb_postId;
        
        miixContentMgr.putFbPostIdUgcs( req.params.ugcProjectId, ugcInfo, function(err){
            if (!err){
                res.send(200);
            }
            else {
                logger.error('[PUT /miix/fb_ugcs/:ugcProjectId] failed: '+ err);
                res.send(400, {error: err});
            }
        });
    }
    else {
        res.send(400, {error: "Not all needed data are sent."});
    }
    
};

//PUT /miix/fb_userLiveContents/:ugcProjectId
miixHandler.putFbPostIdUserLiveContents_cb = function(req, res) {
    logger.info('[PUT '+req.path+'] is called');
    if (req.body.fb_postId){
        var ugcInfo = req.body.fb_postId;
        
        miixContentMgr.putFbPostIduserLiveContents( req.params.ugcProjectId, ugcInfo, function(err){
            if (!err){
                res.send(200);
            }
            else {
                logger.error('[PUT /miix/fb_userLiveContents/:ugcProjectId] failed: '+ err);
                res.send(400, {error: err});
            }
        });
    }
    else {
        res.send(400, {error: "Not all needed data are sent."});
    }
    
};

//GET /miix/members/:memberId/message
miixHandler.getMessageList_cb = function(req, res) {
//	console.dir(req.body);
    logger.info('[GET '+req.path+'] is called');
    if (req.params.memberId){
        var ugcInfo = req.body.fb_postId;
        var limit = 0;
        if (req.query.limit){
            limit = req.query.limit;
        }
        else {
            limit = 3;
        }
        
        if(req.query.read == null){
        	read = false;
        }else if (req.query.read == 'getReadMessage'){
        	read = 'getReadMessage';
        }else if (req.query.read == 'getAllMessage'){
        	read = 'getAllMessage';
        }
        
        miixContentMgr.getMessageList( req.params.memberId, read,limit, 0, function(err, messageList){
            if (!err){
                res.send(messageList);
            }
            else {
                logger.error('[GET /miix/members/:memberId/message] failed: '+ err);
                res.send(400, {error: err});
            }
        });
    }
    else {
        res.send(400, {error: "Not all needed data are sent."});
    }
    
};

//PUT /miix/message/:messageId
miixHandler.updateMessage_cb = function(req, res) {
    logger.info('[PUT '+req.path+'] is called');
    if (req.params.messageId){
        var vjson = req.body.vjson;
        
        miixContentMgr.updateMessage( req.params.messageId, vjson, function(err){
            if (!err){
                res.send(200);
            }
            else {
                logger.error('[PUT /miix/message/:messageId] failed: '+ err);
                res.send(400, {error: err});
            }
        });
    }
    else {
        res.send(400, {error: "Not all needed data are sent."});
    }
    
};

miixHandler.getVIPStatus_cb = function(req, res) {
    logger.info('[GET '+req.path+'] is called');
    var condition = null;
    if(req.query.code){
    	condition = {
    			code: req.query.code
    	};
	}
    
    miixContentMgr.getVIPStatus( condition, null, 0, function(err, VIPStatus){
        if (!err){
            res.send(VIPStatus);
        }
        else {
            logger.error('[GET /miix/getVIPStatus] failed: '+ err);
            res.send(400, {error: err});
        }
    });    
};


miixHandler.updateVIPStatus_cb = function(req, res) {
    logger.info('[PUT '+req.path+'] is called');
    if (req.body._id){
        var condition = {used: true};
        
        miixContentMgr.updateVIPStatus( req.body._id, condition, function(err){
            if (!err){
                res.send(200);
            }
            else {
                logger.error('[PUT /miix/updateVIPStatus] failed: '+ err);
                res.send(400, {error: err});
            }
        });
    }
    else {
        res.send(400, {error: "Not all needed data are sent."});
    }
    
};

miixHandler.updateVIPinUGC_cb = function(req, res) {
    logger.info('[PUT '+req.path+'] is called');
    if (req.body.projectId){
        var condition = {contentClass: 'VIP'};
        
        miixContentMgr.updateVIPinUGC( req.body.projectId, condition, function(err){
            if (!err){
                res.send(200);
            }
            else {
                logger.error('[PUT /miix/updateVIPinUGC] failed: '+ err);
                res.send(400, {error: err});
            }
        });
    }
    else {
        res.send(400, {error: "Not all needed data are sent."});
    }
    
};

//POST /miix/ugcInfo
miixHandler.saveTmpImage_cb = function(req, res){
	logger.info('[POST ' + req.path + '] is called');
	if(req.body_id){
		var tempPath = req.files.file.path;
		console.log(req.body.projectId);
		
		 var projectDir = path.join( workingPath, 'public/contents/user_project', req.body.projectId);
	     var userDataDir = path.join( projectDir, 'user_data');
	     if ( !fs.existsSync(projectDir) ) {
	         fs.mkdirSync( projectDir );  //TODO: check if this is expensive... 
	     }
	     if ( !fs.existsSync(userDataDir) ) {
	         fs.mkdirSync( userDataDir );  //TODO: check if this is expensive... 
	     }
	     target_path = path.join( userDataDir, req.files.file.name);
		 
	    
	     var moveFile = function( _tmp_path, _target_path, _moveFile_cb )  {
	    	 var util = require('util');
		            
	    	 var is = fs.createReadStream(_tmp_path);
	    	 var os = fs.createWriteStream(_target_path);
		        
	    	 util.pump(is, os, function(err) {
		            if (!err) {
		                fs.unlink(_tmp_path, function() {
		                    if (!err) {
		                        logger.info( 'Finished uploading to ' + _target_path );
		                        
		                        if ( _moveFile_cb ) {
		                            _moveFile_cb();
		                        }
		                    }
		                    else {
		                        logger.info('Fail to delete temporary uploaded file: '+err);
		                        res.send( {err:'Fail to delete temporary uploaded file: '+err});
		                    }
		                });
		            }else {
		                logger.info('Fail to do util.pump(): '+err);
		                res.send( {err:'Fail to do util.pump(): '+err } );
		            }
	    	 });			
	     };
		    
		 moveFile(tempPath, target_path);
	}else{
		res.send(400, {error: "Not all needed data are sent."});
	}
};


miixHandler.updateUnReadMessage_cb = function(req, res) {
//	console.log(req.body.userId);
    logger.info('[PUT '+req.path+'] is called');
    if (req.body.userId){
        
        miixContentMgr.updateUnReadMessage( req.body.userId, function(err){
            if (!err){
                res.send(200);
            }
            else {
                logger.error('[PUT /miix/updateUnReadMessage] failed: '+ err);
                res.send(400, {error: err});
            }
        });
    }
    else {
        res.send(400, {error: "Not all needed data are sent."});
    }
    
};

miixHandler.getUnReadCount_cb = function(req, res){
	miixContentMgr.getUnReadCount(req.query.userId, function(err, result){
		
		if(!err){
			res.send({unReadCount: result});
		}else{
			res.send(400, {error: err});
		}
		
	});
};
module.exports = miixHandler;