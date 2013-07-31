
var FM = { authorizationHandler: {} };

var tokenMgr = require('../token_mgr.js');

FM.authorizationHandler.checkAuth = function(req, res, next) {
    tokenMgr.checkToken(req.param('token'), req.route.path, function(authorized){
        if (authorized){
            next();
        }
        else{
            res.send(401);
        }
    });
    
};

//PUT /members/:memgerId/device_tokens
FM.authorizationHandler.updateDeviceToken = function(req, res) {
	//update device token from android devices
	logger.info('[PUT ' + req.path + '] is called');
	
	if(req.body){
	    FM_LOG("\n[Got Device_Token] " + res.body.deviceToken);
	    var oid = ObjectID.createFromHexString(req.params.memberId);
	    var jsonStr = '{"deviceToken.' + res.body.platform +'":"'+ res.body.deviceToken + '"}';
	    
        var json = JSON.parse(jsonStr);
        memberDB.updateMember( oid, json, function(err, result){
            if(err) logger.info(err);
            if(result) logger.info(result);
//            res.send({"message": "Update Device Token!"});
            res.send(200);
        });
	}else{
	    res.send(400);
//	    res.send({"message": "Failed!"});
	}
	
	
};

module.exports = FM.authorizationHandler;