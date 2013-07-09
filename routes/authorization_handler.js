
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

module.exports = FM.authorizationHandler;