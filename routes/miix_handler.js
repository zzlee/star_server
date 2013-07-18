/**
 * @fileoverview Implementation of miixHandler
 */

var miixHandler = {};

var miixContentMgr = require('../miix_content_mgr.js');

//PUT /miix/base64_image_ugcs/:ugcProjectId
miixHandler.putBase64ImageUgcs_cb = function(req, res) {
    console.log('[PUT /miix/base64_image_ugcs/:ugcProjectId] called');
    
    if (req.body.imgBase64 && req.body.ownerId && req.body.ownerFbUserId){

        var ugcInfo = {
                ownerId:{_id:req.body.ownerId, fbUserId: req.body.ownerFbUserId },
                contentGenre: req.body.contentGenre,
                title: req.body.title
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
    
    
};

module.exports = miixHandler;