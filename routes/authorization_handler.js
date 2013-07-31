
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
//	logger.info('[PUT ' + req.path + '] is called');
	console.dir(req.body);
//	console.log('member Id :' + req.params.memberId);
//	if(req.body){
//		
//	}
	
	
	
	
	
};

module.exports = FM.authorizationHandler;