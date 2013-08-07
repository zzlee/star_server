/**
 * @fileoverview Implementation of miixHandler
 */

var miixHandler = {};

var miixContentMgr = require('../miix_content_mgr.js');
var ugc = require('../UGC.js');

//PUT /miix/base64_image_ugcs/:ugcProjectId
miixHandler.putBase64ImageUgcs_cb = function(req, res) {
    logger.info('[PUT '+req.path+'] is called');
    
    var customizableObjects = JSON.parse(req.body.customizableObjects);
    if (req.body.imgBase64 && req.body.ownerId && req.body.ownerFbUserId){

        var ugcInfo = {
                ownerId:{_id:req.body.ownerId, fbUserId: req.body.ownerFbUserId },
                contentGenre: req.body.contentGenre,
                title: req.body.title,
                customizableObjects: customizableObjects
        };
        
        miixContentMgr.addMiixImage(req.body.imgBase64, req.params.ugcProjectId, ugcInfo, function(err){
            if (!err){
                res.send(200);
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
        miixContentMgr.preAddMiixMovie( req.params.ugcProjectId, ugcInfo, function(err){
            if (!err){
                res.send(200);
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
    
    ugc.getLiveUGCListByOwnerId(req.params.memberId, limit, 0, function(err, ugcList){
        if (!err) {
            res.send(ugcList);
        }
        else {
            res.send(500, {error: err});
        }
    });
};


module.exports = miixHandler;